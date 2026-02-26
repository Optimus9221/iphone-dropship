import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

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
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: adminHash },
    create: {
      email: "admin@example.com",
      passwordHash: adminHash,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log("Admin:", admin.email, "(password from ADMIN_PASSWORD)");

  // Demo user
  const userHash = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      passwordHash: userHash,
      name: "Demo User",
    },
  });
  console.log("User:", user.email);

  // Sample products with images (placehold.co by color, or picsum for variety)
  const products = [
    { model: "14 Pro Max", storage: "128GB", color: "Space Black", price: 749, bg: "0f172a", fg: "94a3b8", description: null, specs: null },
    { model: "15", storage: "128GB", color: "Black", price: 799, bg: "0f172a", fg: "94a3b8", description: null, specs: null },
    { model: "15", storage: "256GB", color: "Blue", price: 899, bg: "1e3a8a", fg: "93c5fd", description: null, specs: null },
    { model: "16", storage: "128GB", color: "White", price: 899, bg: "f8fafc", fg: "64748b", description: null, specs: null },
    { model: "16", storage: "256GB", color: "Black", price: 999, bg: "0f172a", fg: "94a3b8", description: null, specs: null },
    { model: "17", storage: "256GB", color: "Titanium", price: 1099, bg: "52525b", fg: "e4e4e7", description: null, specs: null },
  ];

  const iphone14ProMaxDescription = `Смартфон Apple iPhone 14 Pro Max 128GB A2894 Space Black (Відновлений / Майже новий)

СТАН: Майже новий. Можливі поодинокі мікроподряпини. Можлива заміна компонентів для відновлення. Комплектується заводською або фірмовою еко-коробкою by Breezy, кабелем та скріпкою. 100% протестовано, усі функції працюють!

Преміальна надійність
Керамічна панель, що покриває екран, міцніша за будь-яке скло смартфонів. Елегантна рамка з хірургічної нержавіючої сталі. Водонепроникність IP68.

Dynamic Island
Інтерактивний острівець працює з усіма додатками та відображає важливу інформацію.

Super Retina XDR
Дисплей з надточною кольоропередачею, яскравість до 2000 нит. ProMotion 10–120 Гц.

Crash Detection
Технологія розпізнає автомобільну аварію та автоматично повідомляє екстрені служби.

Камера 48 Мп
Оновлена основна камера з 4-піксельним сенсором. Photonic Engine для кращих фото в темряві. Відео 4K 24fps.

A16 Bionic
Потужний процесор з 5-ядерною графікою для ігор та складних завдань.

Автономність до 23 годин, MagSafe для швидкого бездротового підзаряджання.`;

  const iphone15Images = [
    "/images/iphone-15/3ef4493bfb03012592eef32e0d19ddd9.png",
    "/images/iphone-15/446b61df0423d9a9377373d44b922d10.png",
    "/images/iphone-15/4fae8bf68e1ce3e991d9a6889ba5f8b3.png",
    "/images/iphone-15/5426b893535bbad42f4509cb9acaf0bc.png",
    "/images/iphone-15/6ba87ad63477641830fd1303c416cd37.png",
    "/images/iphone-15/6cb636ec62bb85280e8dfc11fe973315.png",
    "/images/iphone-15/85837cf48b0352b8e1694781d2cf73a9.png",
    "/images/iphone-15/a8b051d4824db23709a908dc5d7e9195.png",
    "/images/iphone-15/bc22fb8fbde0e353b448792f89e9600a.png",
    "/images/iphone-15/f46bc9bb18658266f8d8b81ea8f9f316.png",
  ];

  const iphone16Images = [
    "/images/iphone-16/3b10e25a7505f1fceb4fa77024e77ee4.png",
    "/images/iphone-16/54ae07733584c642840d1a0dbc6f7f41.png",
    "/images/iphone-16/9ead6b0c89f1d14072d226d8057c7e2b.png",
    "/images/iphone-16/ae2db6b09bda12dda814347b5c85da6c.png",
  ];

  const iphone17Images = [
    "/images/iphone-17/iphone-17-pro-17-pro-max-hero.png",
    "/images/iphone-17/14f06b19202d8d324a436edd074a0078.png",
    "/images/iphone-17/4107344ea00535bf1254a45f08e14c52.png",
    "/images/iphone-17/44a1cfb645b34868983311ae341596c5.png",
  ];

  const iphone14ProMaxImages = [
    "/images/iphone-14-pro-max/2aac8373587591f9830fe6f6cb6a40a0.png",
    "/images/iphone-14-pro-max/d1dc984068b32d84441962c11285726c.png",
    "/images/iphone-14-pro-max/effd1b0d74e31a15def25bab29102a30.png",
    "/images/iphone-14-pro-max/f0aa3cc1250646279e5bf9447601d2c4.png",
    "/images/iphone-14-pro-max/fb2b96b65c37ffe1d99055023b15ebd0.png",
  ];

  for (const p of products) {
    const name = `iPhone ${p.model} ${p.storage} ${p.color}`;
    const slug = `iphone-${p.model.toLowerCase().replace(/\s/g, "-")}-${p.storage.toLowerCase()}-${p.color.toLowerCase().replace(/\s/g, "-")}`;
    const isIphone15 = p.model === "15";
    const isIphone16 = p.model === "16";
    const isIphone17 = p.model === "17";
    const isIphone14ProMax = p.model === "14 Pro Max";
    const imageUrl = `https://placehold.co/600x600/${p.bg}/${p.fg}?text=iPhone+${p.model}+${p.color}`;
    const images = isIphone14ProMax
      ? iphone14ProMaxImages
      : isIphone15
        ? iphone15Images
        : isIphone16
          ? iphone16Images
          : isIphone17
            ? iphone17Images
            : [imageUrl];
    const description = isIphone14ProMax ? iphone14ProMaxDescription : p.description;
    const specs = isIphone14ProMax
      ? { display: "6.7\" Super Retina XDR", processor: "A16 Bionic", camera: "48MP Main", battery: "Up to 23h" }
      : { display: "6.1\" Super Retina XDR", processor: "A17 Pro", camera: "48MP Main", battery: "All-day battery" };
    await prisma.product.upsert({
      where: { slug },
      update: { images, description: description ?? undefined, specs },
      create: {
        name,
        slug,
        model: p.model,
        storage: p.storage,
        color: p.color,
        price: p.price,
        stock: 10,
        images,
        description: description ?? undefined,
        specs,
      },
    });
  }
  console.log("Products created");

  // System settings
  await prisma.systemSetting.upsert({
    where: { key: "min_withdrawal" },
    update: { value: "10" },
    create: { key: "min_withdrawal", value: "10" },
  });
  await prisma.systemSetting.upsert({
    where: { key: "cashback_hold_days" },
    update: { value: "14" },
    create: { key: "cashback_hold_days", value: "14" },
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

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
