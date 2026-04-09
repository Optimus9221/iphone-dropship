import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const n = await prisma.user.deleteMany({
    where: { email: { startsWith: "reg-smoke-" } },
  });
  console.log("deleted", n.count);
  await prisma.$disconnect();
}

main();
