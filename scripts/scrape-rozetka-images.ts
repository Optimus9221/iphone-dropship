import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const DEFAULT_URL =
  "https://rozetka.com.ua/ua/apple-iphone-17-pro-max-256gb-cosmic-orange-mfyn4af-a/p543550585/";

function decodeRozetkaUrl(value: string): string {
  return value
    .replace(/\$hs\$/g, "https://")
    .replace(/\$dt\$/g, ".")
    .replace(/\$sh\$/g, "/")
    .replace(/&amp;/g, "&");
}

function fetchHtml(pageUrl: string, htmlFile?: string): string {
  if (htmlFile && fs.existsSync(htmlFile)) {
    return fs.readFileSync(htmlFile, "utf8");
  }

  try {
    const buf = execFileSync(
      "curl.exe",
      [
        "-sL",
        pageUrl,
        "-H",
        "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "-H",
        "Accept-Language: uk-UA,uk;q=0.9,en;q=0.8",
      ],
      { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }
    );
    return buf;
  } catch {
    throw new Error(`Failed to fetch page HTML for ${pageUrl}`);
  }
}

export function extractRozetkaProductImages(html: string): string[] {

  const urls = new Set<string>();
  const patterns = [
    /https:\/\/content\d*\.rozetka\.com\.ua\/goods\/images\/big\/\d+\.jpg/g,
    /\$hs\$content\d*\$dt\$rozetka\$dt\$com\$dt\$ua\/goods\/images\/big\/\d+\.jpg/g,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      urls.add(decodeRozetkaUrl(match[0]));
    }
  }

  const decodedHtml = html.replace(/&q;/g, '"');
  for (const pattern of patterns) {
    for (const match of decodedHtml.matchAll(pattern)) {
      urls.add(decodeRozetkaUrl(match[0]));
    }
  }

  return [...urls];
}

export async function fetchRozetkaProductImages(pageUrl: string, htmlFile?: string): Promise<string[]> {
  const html = fetchHtml(pageUrl, htmlFile);
  return extractRozetkaProductImages(html);
}

function download(url: string, dest: string) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execFileSync("curl.exe", ["-sL", url, "-o", dest], { stdio: "pipe" });
  const size = fs.statSync(dest).size;
  if (size < 1000) throw new Error(`Download too small for ${url}`);
  console.log(`OK ${path.basename(dest)} (${size} bytes)`);
}

async function main() {
  const pageUrl = process.argv[2] ?? DEFAULT_URL;
  const outDir =
    process.argv[3] ??
    path.join("public", "images", "iphone-17", "pro-max", "cosmic-orange");
  const htmlFile = process.argv[4];

  console.log("Fetching", pageUrl, htmlFile ? `(html: ${htmlFile})` : "");
  const images = await fetchRozetkaProductImages(pageUrl, htmlFile);
  if (images.length === 0) {
    throw new Error("No product gallery images found on page");
  }

  console.log(`Found ${images.length} gallery images`);
  const localPaths: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const file = `${String(i + 1).padStart(2, "0")}.jpg`;
    const dest = path.join(outDir, file);
    download(images[i], dest);
    localPaths.push(`/${path.posix.join(outDir.replace(/\\/g, "/").replace(/^public\//, ""), file)}`);
  }

  const manifest = path.join(outDir, "manifest.json");
  fs.writeFileSync(manifest, JSON.stringify({ source: pageUrl, images: localPaths }, null, 2));
  console.log("Saved manifest:", manifest);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
