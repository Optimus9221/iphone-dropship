import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const DEFAULT_URL = "https://jabko.ua/product/apple-iphone-17-256gb-black";
const DEFAULT_OUT = path.join("public", "images", "iphone-17", "base", "black");

const CURL_HEADERS = [
  "-H",
  "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "-H",
  "Accept-Language: uk-UA,uk;q=0.9,en;q=0.8",
];

function fetchHtml(pageUrl: string, htmlFile?: string): string {
  if (htmlFile && fs.existsSync(htmlFile)) {
    return fs.readFileSync(htmlFile, "utf8");
  }
  return execFileSync("curl.exe", ["-sL", pageUrl, ...CURL_HEADERS], {
    encoding: "utf8",
    maxBuffer: 30 * 1024 * 1024,
  });
}

/** Extract full-size product gallery originals from a Jabko product page. */
export function extractJabkoProductImages(html: string): string[] {
  const folderCounts = new Map<string, number>();
  for (const match of html.matchAll(
    /img\.jabko\.ua\/image\/cache\/+catalog\/products\/(\d{4}\/\d{2}\/\d{6})\//g
  )) {
    const folder = match[1];
    folderCounts.set(folder, (folderCounts.get(folder) ?? 0) + 1);
  }

  // Prefer the product-gallery folder that hosts the largest cached variants.
  let bestFolder = "";
  let bestScore = 0;
  for (const [folder, count] of folderCounts) {
    const hasFullRes = html.includes(`/catalog/products/${folder}/`) && html.includes("1397x1397");
    const score = count + (hasFullRes ? 1000 : 0);
    if (score > bestScore) {
      bestScore = score;
      bestFolder = folder;
    }
  }

  if (!bestFolder) return [];

  const seen = new Set<string>();
  const bases: string[] = [];
  const pattern = new RegExp(
    `catalog/products/${bestFolder.replace(/\//g, "\\/")}/([a-zA-Z0-9_\\-]+)-1397x1397\\.png\\.webp`,
    "g"
  );
  for (const match of html.matchAll(pattern)) {
    const base = match[1];
    if (seen.has(base)) continue;
    seen.add(base);
    bases.push(base);
  }

  return bases.map(
    (base) => `https://img.jabko.ua/image/catalog/products/${bestFolder}/${base}.png`
  );
}

function download(url: string, dest: string) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execFileSync("curl.exe", ["-sL", url, "-o", dest], { stdio: "pipe" });
  const size = fs.statSync(dest).size;
  if (size < 10_000) throw new Error(`Download too small for ${url} (${size} bytes)`);
  console.log(`OK ${path.basename(dest)} (${size} bytes)`);
}

async function main() {
  const pageUrl = process.argv[2] ?? DEFAULT_URL;
  const outDir = process.argv[3] ?? DEFAULT_OUT;
  const htmlFile = process.argv[4];

  console.log("Fetching", pageUrl, htmlFile ? `(html: ${htmlFile})` : "");
  const html = fetchHtml(pageUrl, htmlFile);
  const images = extractJabkoProductImages(html);
  if (!images.length) throw new Error("No Jabko gallery images found on page");

  console.log(`Found ${images.length} gallery images`);
  fs.mkdirSync(outDir, { recursive: true });
  for (const file of fs.readdirSync(outDir)) {
    if (/^\d{2}\.(jpe?g|png|webp)$/i.test(file)) {
      fs.unlinkSync(path.join(outDir, file));
    }
  }

  const localPaths: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const file = `${String(i + 1).padStart(2, "0")}.png`;
    const dest = path.join(outDir, file);
    download(images[i], dest);
    localPaths.push(
      `/${path.posix.join(outDir.replace(/\\/g, "/").replace(/^public\//, ""), file)}`
    );
  }

  const manifest = path.join(outDir, "manifest.json");
  fs.writeFileSync(
    manifest,
    JSON.stringify(
      { source: pageUrl, provider: "jabko", images: localPaths },
      null,
      2
    )
  );
  console.log("Saved manifest:", manifest);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
