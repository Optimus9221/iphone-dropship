import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, readAt: null },
  });

  return NextResponse.json({
    unreadCount,
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      href: n.href,
      orderId: n.orderId,
      readAt: n.readAt,
      createdAt: n.createdAt,
    })),
  });
}

const patchSchema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const now = new Date();
  if (parsed.data.all) {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: now },
    });
  } else if (parsed.data.ids && parsed.data.ids.length > 0) {
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        id: { in: parsed.data.ids },
        readAt: null,
      },
      data: { readAt: now },
    });
  } else {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
