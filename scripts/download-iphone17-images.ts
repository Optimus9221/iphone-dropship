import fs from "fs";
import path from "path";
import { IPHONE17_IMAGE_ASSETS } from "../prisma/iphone17-catalog";

const APPLE_CDN = "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is";
const ROOT = path.join(process.cwd(), "public", "images", "iphone-17");

async function downloadImage(assetName: string, destPath: string) {
  const url = `${APPLE_CDN}/${assetName}?wid=1400&hei=1400&fmt=png&qlt=90`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed ${assetName}: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buffer);
  console.log(`OK ${path.relative(process.cwd(), destPath)} (${buffer.length} bytes)`);
}

async function main() {
  for (const asset of IPHONE17_IMAGE_ASSETS) {
    const dest = path.join(ROOT, asset.folder, `${asset.file}.png`);
    await downloadImage(asset.appleAsset, dest);
  }
  console.log(`Downloaded ${IPHONE17_IMAGE_ASSETS.length} color images`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
