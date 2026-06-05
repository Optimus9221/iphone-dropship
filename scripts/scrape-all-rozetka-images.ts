import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import {
  IPHONE17_IMAGE_ASSETS,
  type Iphone17Model,
} from "../prisma/iphone17-catalog";
import { extractRozetkaProductImages } from "./scrape-rozetka-images";

const SEARCH_API = "https://search.rozetka.com.ua/search/api/v6/";
const BASE = "https://rozetka.com.ua/ua";
const CURL_HEADERS = [
  "-H",
  "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "-H",
  "Accept-Language: uk-UA,uk;q=0.9,en;q=0.8",
];

type RozetkaOverride = {
  query?: string;
  slugColor?: string;
  productId?: number;
};

/** Rozetka naming differs from Apple catalog for some models/colors. */
const ROZETKA_OVERRIDES: Record<string, RozetkaOverride> = {
  "Air::Light Gold": { query: "Apple iPhone Air 256GB Gold", slugColor: "gold" },
  "17 Pro::Silver": { query: "iPhone 17 Pro 256GB Silver MFYN3", productId: 543544870 },
  "17 Pro::Deep Blue": { query: "iPhone 17 Pro 256GB Deep Blue MG8", productId: 543545605 },
  "17 Pro::Cosmic Orange": { query: "iPhone 17 Pro 256 Cosmic Orange MG8", productId: 543545585 },
  "17 Pro Max::Silver": { query: "iPhone 17 Pro Max 256GB Silver MFYM", productId: 543550380 },
  "17 Pro Max::Deep Blue": { query: "iPhone 17 Pro Max 256GB Deep Blue MFYP", productId: 543553270 },
  "17 Pro Max::Cosmic Orange": {
    query: "Apple iPhone 17 Pro Max 256GB Cosmic Orange",
    productId: 543550585,
  },
};

type RozetkaTarget = {
  model: Iphone17Model;
  color: string;
  folder: string;
  file: string;
  query: string;
  slugColor: string;
  productId?: number;
};

function overrideKey(model: Iphone17Model, color: string): string {
  return `${model}::${color}`;
}

function buildTargets(): RozetkaTarget[] {
  return IPHONE17_IMAGE_ASSETS.map((asset) => {
    const modelLabel = asset.model === "Air" ? "iPhone Air" : `iPhone ${asset.model}`;
    const key = overrideKey(asset.model, asset.color);
    const override = ROZETKA_OVERRIDES[key];
    return {
      model: asset.model,
      color: asset.color,
      folder: asset.folder,
      file: asset.file,
      query: override?.query ?? `Apple ${modelLabel} 256GB ${asset.color}`,
      slugColor: override?.slugColor ?? colorSlug(asset.color),
      productId: override?.productId,
    };
  });
}

function colorSlug(color: string): string {
  return color.toLowerCase().replace(/\s/g, "-");
}

function modelSlug(model: Iphone17Model): string {
  if (model === "Air") return "iphone-air";
  return `iphone-${model.toLowerCase().replace(/\s/g, "-")}`;
}

function buildProductSlug(model: Iphone17Model, slugColor: string): string {
  return `apple-${modelSlug(model)}-256gb-${slugColor}`;
}

function extractCanonicalProductUrl(html: string): string | undefined {
  const match = html.match(/rel="canonical"\s+href="([^"]+)"/);
  return match?.[1];
}

function curlRaw(url: string): string {
  return execFileSync("curl.exe", ["-sL", url, ...CURL_HEADERS], {
    encoding: "utf8",
    maxBuffer: 30 * 1024 * 1024,
  });
}

function curlText(url: string): string {
  const text = curlRaw(url);
  if (text.includes("Just a moment...") || text.length < 20000) {
    throw new Error(`Blocked or empty HTML from ${url}`);
  }
  return text;
}

async function curlJson<T>(url: string, retries = 6): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const text = curlRaw(url);
    if (!text.includes("Just a moment...") && text.trim().startsWith("{")) {
      return JSON.parse(text) as T;
    }
    const wait = attempt * 3000;
    console.log(`  search API blocked, retry ${attempt}/${retries} in ${wait}ms`);
    await sleep(wait);
  }
  throw new Error(`Search API blocked: ${url}`);
}

function curlToFile(url: string, dest: string) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execFileSync("curl.exe", ["-sL", url, "-o", dest, ...CURL_HEADERS], { stdio: "pipe" });
  const size = fs.statSync(dest).size;
  if (size < 1000) throw new Error(`Download too small: ${url}`);
}

async function findProductId(query: string): Promise<number> {
  const url = `${SEARCH_API}?front_type=xl&country=UA&lang=ua&text=${encodeURIComponent(query)}`;
  const json = await curlJson<{ data?: { goods?: Array<{ id: number }> } }>(url);
  const id = json.data?.goods?.[0]?.id;
  if (!id) throw new Error(`No product found for query: ${query}`);
  return id;
}

function buildProductUrl(model: Iphone17Model, slugColor: string, productId: number): string {
  const slug = buildProductSlug(model, slugColor);
  return `${BASE}/${slug}/p${productId}/`;
}

function fixWebPath(folder: string, fileName: string, imageFile: string): string {
  return `/images/iphone-17/${folder}/${fileName}/${imageFile}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const targets = buildTargets();
  const manifestPath = path.join("public", "images", "iphone-17", "rozetka-manifest.json");
  const manifest: Record<string, { source: string; query: string; images: string[] }> =
    fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

  for (const target of targets) {
    await sleep(1500);
    const outDir = path.join("public", "images", "iphone-17", target.folder, target.file);
    const key = `${target.model}::${target.color}`;
    const localManifestPath = path.join(outDir, "manifest.json");

    if (fs.existsSync(localManifestPath)) {
      const existing = JSON.parse(fs.readFileSync(localManifestPath, "utf8")) as {
        source: string;
        query: string;
        images: string[];
      };
      if (existing.images?.length) {
        manifest[key] = existing;
        console.log(`\n[${target.model} / ${target.color}] skip (already downloaded)`);
        continue;
      }
    }

    console.log(`\n[${target.model} / ${target.color}]`);
    console.log(`Search: ${target.query}`);

    const productId = target.productId ?? (await findProductId(target.query));
    let pageUrl = buildProductUrl(target.model, target.slugColor, productId);
    console.log(`Product: ${pageUrl}`);

    let html = curlText(pageUrl);
    const canonical = extractCanonicalProductUrl(html);
    if (canonical && canonical !== pageUrl) {
      console.log(`Canonical: ${canonical}`);
      pageUrl = canonical;
      html = curlText(pageUrl);
    }
    const imageUrls = extractRozetkaProductImages(html);
    if (imageUrls.length === 0) {
      throw new Error(`No gallery images for ${target.model} ${target.color}`);
    }

    console.log(`Gallery: ${imageUrls.length} images`);
    const localPaths: string[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const file = `${String(i + 1).padStart(2, "0")}.jpg`;
      const dest = path.join(outDir, file);
      curlToFile(imageUrls[i], dest);
      localPaths.push(fixWebPath(target.folder, target.file, file));
      console.log(`  saved ${file}`);
    }

    manifest[key] = { source: pageUrl, query: target.query, images: localPaths };
    fs.writeFileSync(localManifestPath, JSON.stringify(manifest[key], null, 2));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nDone. Manifest: ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
