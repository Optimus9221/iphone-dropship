import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)/),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { token, newPassword } = parsed.data;
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!record || record.expiresAt < new Date()) {
      await prisma.passwordResetToken.deleteMany({ where: { token } }).catch(() => {});
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.delete({ where: { id: record.id } }),
    ]);
    return NextResponse.json({ message: "ok" });
  } catch (e) {
    console.error("reset-password error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
