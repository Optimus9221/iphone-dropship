import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";
import {
  buildIphone17Name,
  buildIphone17Slug,
  getIphone17Images,
  getIphone17Specs,
  IPHONE17_CATALOG,
} from "./iphone17-catalog";

const prisma = new PrismaClient();

async function main() {
  // Admin user - use ADMIN_PASSWORD from .env for security
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12) {
    throw new Error(
      "Set ADMIN_PASSWORD in .env (min 12 chars, letters+numbers). Example: ADMIN_PASSWORD=YourStr0ng!Pass123"
    );
  }
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const adminEmail = "aleksandrsqvr@gmail.com";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminHash,
      role: "ADMIN",
      emailVerified: true,
      phoneVerified: true,
    },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      name: "Admin",
      role: "ADMIN",
      emailVerified: true,
      phoneVerified: true,
    },
  });
  console.log("Admin:", admin.email, "(password from ADMIN_PASSWORD)");

  // Demo user
  const userHash = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: { emailVerified: true, phoneVerified: true, phone: "380000000099" },
    create: {
      email: "user@example.com",
      passwordHash: userHash,
      name: "Demo User",
      phone: "380000000099",
      emailVerified: true,
      phoneVerified: true,
    },
  });
  console.log("User:", user.email);

  // Only seed iPhone 17 lineup with prices from the price list (no eSIM / no unpriced SKUs).
  for (const p of IPHONE17_CATALOG) {
    const name = buildIphone17Name(p.model, p.storage, p.color);
    const slug = buildIphone17Slug(p.model, p.storage, p.color);
    const specs = getIphone17Specs(p.model, p.storage);
    const images = getIphone17Images(p.model, p.color);
    await prisma.product.upsert({
      where: { slug },
      update: {
        name,
        model: p.model,
        storage: p.storage,
        color: p.color,
        price: p.price,
        images,
        specs,
        isPublished: true,
      },
      create: {
        name,
        slug,
        model: p.model,
        storage: p.storage,
        color: p.color,
        price: p.price,
        stock: 10,
        images,
        specs,
        isPublished: true,
      },
    });
  }
  console.log(`Products created (${IPHONE17_CATALOG.length} iPhone 17 variants)`);

  // System settings
  await prisma.systemSetting.upsert({
    where: { key: "min_withdrawal" },
    update: { value: "10" },
    create: { key: "min_withdrawal", value: "10" },
  });
  await prisma.systemSetting.upsert({
    where: { key: "cashback_hold_days" },
    update: { value: "1" },
    create: { key: "cashback_hold_days", value: "1" },
  });
  await prisma.systemSetting.upsert({
    where: { key: "whatsapp_phone" },
    update: { value: "+380501234567" },
    create: { key: "whatsapp_phone", value: "+380501234567" },
  });
  await prisma.systemSetting.upsert({
    where: { key: "telegram_link" },
    update: { value: "https://t.me/iphone_store_ua" },
    create: { key: "telegram_link", value: "https://t.me/iphone_store_ua" },
  });
  await prisma.systemSetting.upsert({
    where: { key: "crypto_wallet_address" },
    update: { value: "" },
    create: { key: "crypto_wallet_address", value: "" },
  });
  await prisma.systemSetting.upsert({
    where: { key: "crypto_network" },
    update: { value: "" },
    create: { key: "crypto_network", value: "" },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
