import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteUserCompletely } from "@/lib/delete-user-completely";

const schema = z.object({
  password: z.string().min(1),
});

/**
 * Self-service account deletion (USER role only). Requires current password.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, passwordHash: true },
  });

  if (!user) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "ADMIN_CANNOT_SELF_DELETE" }, { status: 403 });
  }

  if (!user.passwordHash) {
    return NextResponse.json({ error: "NO_PASSWORD" }, { status: 400 });
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "WRONG_PASSWORD" }, { status: 400 });
  }

  try {
    await deleteUserCompletely(prisma, user.id);
  } catch (e) {
    console.error("account delete:", e);
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
