import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const DEFAULT_URL =
  "https://katran.vn.ua/smartfoni-aksesuari-telefoniya/smartfoni/apple/3089349";
const CURL_HEADERS = [
  "-H",
  "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "-H",
  "Accept-Language: uk-UA,uk;q=0.9,en;q=0.8",
  "-H",
  "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
];

function loadCookieHeader(): string | undefined {
  const fromEnv = process.env.KATRAN_COOKIE?.trim();
  if (fromEnv) return fromEnv;

  const cookieFile = path.join(process.cwd(), "katran-cookies.txt");
  if (!fs.existsSync(cookieFile)) return undefined;

  const raw = fs.readFileSync(cookieFile, "utf8").trim();
  return raw.replace(/^cookie:\s*/i, "");
}

function curlPage(url: string, cookie?: string, htmlFile?: string): string {
  if (htmlFile && fs.existsSync(htmlFile)) {
    return fs.readFileSync(htmlFile, "utf8");
  }

  const args = ["-sL", url, ...CURL_HEADERS];
  if (cookie) args.push("-H", `Cookie: ${cookie}`);

  return execFileSync("curl.exe", args, {
    encoding: "utf8",
    maxBuffer: 30 * 1024 * 1024,
  });
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

export function extractKatranProductCards(html: string) {
  const cards: Array<{ title: string; url: string; image: string }> = [];

  const itemPattern =
    /<a[^>]+href="([^"]+)"[^>]*class="[^"]*b-catalog-card[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/gi;

  for (const match of html.matchAll(itemPattern)) {
    cards.push({
      url: decodeHtml(match[1]),
      image: decodeHtml(match[2]),
      title: decodeHtml(match[3]).trim(),
    });
  }

  if (cards.length) return cards;

  const fallbackPattern =
    /<a[^>]+href="(\/[^"]*apple[^"]*)"[^>]*>[\s\S]{0,2500}?<img[^>]+(?:src|data-src)="([^"]+)"[^>]*(?:alt="([^"]*)")?/gi;

  for (const match of html.matchAll(fallbackPattern)) {
    const title = decodeHtml(match[3] ?? "").trim();
    if (!/iphone/i.test(`${title} ${match[1]}`)) continue;
    cards.push({
      url: decodeHtml(match[1]),
      image: decodeHtml(match[2]),
      title,
    });
  }

  return cards;
}

export function extractKatranImages(html: string): string[] {
  const urls = new Set<string>();
  const patterns = [
    /https?:\/\/[^\s"'<>]+\.(?:png|webp|jpg|jpeg)(?:\?[^\s"'<>]*)?/gi,
    /(?:src|data-src|data-original|href)="([^"]+\.(?:png|webp|jpg|jpeg)[^"]*)"/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const value = decodeHtml(match[1] ?? match[0]);
      if (!/logo|sprite|icon|favicon|svg/i.test(value)) urls.add(value);
    }
  }

  return [...urls];
}

function toAbsolute(url: string, base = "https://katran.vn.ua"): string {
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function curlToFile(url: string, dest: string, cookie?: string) {
  const args = ["-sL", url, "-o", dest, ...CURL_HEADERS];
  if (cookie) args.push("-H", `Cookie: ${cookie}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execFileSync("curl.exe", args, { stdio: "pipe" });
  const size = fs.statSync(dest).size;
  if (size < 500) throw new Error(`Download too small: ${url}`);
}

async function main() {
  const pageUrl = process.argv[2] ?? DEFAULT_URL;
  const htmlFile =
    process.argv[3] ??
    (fs.existsSync("katran-page.html") ? "katran-page.html" : undefined);
  const cookie = loadCookieHeader();
  const html = curlPage(pageUrl, cookie, htmlFile);

  if (/Перевірка безпеки|puzzle-captcha/i.test(html)) {
    console.error(
      "Katran returned security page. Paste browser cookies into katran-cookies.txt or set KATRAN_COOKIE."
    );
    process.exit(1);
  }

  const cards = extractKatranProductCards(html);
  const images = extractKatranImages(html).filter((u) => /iphone|apple|17/i.test(u));

  console.log(`Page: ${pageUrl}`);
  console.log(`Product cards: ${cards.length}`);
  console.log(`iPhone images: ${images.length}`);

  for (const card of cards.slice(0, 20)) {
    console.log(`- ${card.title || "(no title)"}`);
    console.log(`  ${toAbsolute(card.url)}`);
    console.log(`  ${toAbsolute(card.image)}`);
  }

  if (cards.length === 0) {
    for (const image of images.slice(0, 20)) console.log(image);
  }

  const outDir = path.join("public", "images", "iphone-17", "katran");
  const manifest: Array<{ title: string; source: string; image: string; local?: string }> = [];

  const downloadTargets = cards.length
    ? cards.map((card) => ({
        title: card.title,
        source: toAbsolute(card.url),
        image: toAbsolute(card.image),
      }))
    : images.map((image, index) => ({
        title: `image-${index + 1}`,
        source: pageUrl,
        image: toAbsolute(image),
      }));

  for (let i = 0; i < downloadTargets.length; i++) {
    const item = downloadTargets[i];
    const ext = path.extname(new URL(item.image).pathname) || ".png";
    const file = `${String(i + 1).padStart(2, "0")}${ext}`;
    const dest = path.join(outDir, file);
    curlToFile(item.image, dest, cookie);
    const local = `/images/iphone-17/katran/${file}`;
    manifest.push({ ...item, local });
    console.log(`saved ${file}`);
  }

  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`Manifest: ${path.join(outDir, "manifest.json")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
