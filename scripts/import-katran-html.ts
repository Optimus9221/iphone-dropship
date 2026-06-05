import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const CURL_HEADERS = [
  "-H",
  "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
];

function loadCookieHeader(): string | undefined {
  const cookieFile = path.join(process.cwd(), "katran-cookies.txt");
  if (!fs.existsSync(cookieFile)) return undefined;
  return fs.readFileSync(cookieFile, "utf8").trim().replace(/^cookie:\s*/i, "");
}

export function extractKatranProductImages(html: string): string[] {
  const urls = new Set<string>();

  const jsonLdPattern = /"image"\s*:\s*\[([\s\S]*?)\]\s*,\s*"description"/i;
  const jsonLdMatch = html.match(jsonLdPattern);
  if (jsonLdMatch) {
    for (const match of jsonLdMatch[1].matchAll(/https:\/\/katran\.vn\.ua\/assets\/img\/shop\/products\/im\/[^"'\\s]+\.png/gi)) {
      urls.add(match[0]);
    }
  }

  for (const match of html.matchAll(
    /class="[^"]*s-slick-offer-img[^"]*"[^>]*src="([^"]+\.png)"/gi
  )) {
    const src = match[1];
    if (src.startsWith("http")) urls.add(src);
  }

  for (const match of html.matchAll(
    /https:\/\/katran\.vn\.ua\/assets\/img\/shop\/products\/im\/thumbs\/[a-z0-9]{2}\/[a-f0-9]+\.png/gi
  )) {
    urls.add(match[0]);
  }

  return [...urls];
}

function curlToFile(url: string, dest: string, cookie?: string) {
  const args = ["-sL", url, "-o", dest, ...CURL_HEADERS];
  if (cookie) args.push("-b", cookie);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execFileSync("curl.exe", args, { stdio: "pipe" });
  const size = fs.statSync(dest).size;
  if (size < 1000) throw new Error(`Download too small (${size}b): ${url}`);
}

async function main() {
  const htmlFile = process.argv[2] ?? "katran-page.html";
  const outDir =
    process.argv[3] ?? path.join("public", "images", "iphone-17", "pro-max", "cosmic-orange");
  const sourceUrl =
    process.argv[4] ??
    "https://katran.vn.ua/smartfoni-aksesuari-telefoniya/smartfoni/apple/3089349";

  const html = fs.readFileSync(htmlFile, "utf8");
  const images = extractKatranProductImages(html);
  if (!images.length) throw new Error(`No Katran product images found in ${htmlFile}`);

  const cookie = loadCookieHeader();
  const localPaths: string[] = [];

  console.log(`Found ${images.length} images`);
  for (let i = 0; i < images.length; i++) {
    const file = `${String(i + 1).padStart(2, "0")}.png`;
    const dest = path.join(outDir, file);
    curlToFile(images[i], dest, cookie);
    const webPath = `/images/iphone-17/${path
      .relative(path.join("public", "images", "iphone-17"), outDir)
      .replace(/\\/g, "/")}/${file}`;
    localPaths.push(webPath);
    console.log(`saved ${file}`);
  }

  const manifest = {
    source: sourceUrl,
    provider: "katran",
    images: localPaths,
  };
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`Manifest: ${path.join(outDir, "manifest.json")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
