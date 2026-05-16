import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./db";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" as const, status: 401 as const };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return { error: "Forbidden" as const, status: 403 as const };
  }
  return { session };
}
