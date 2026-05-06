import type { PrismaClient } from "@prisma/client";

/**
 * Removes a user and dependent rows. Caller must enforce auth (admin delete or self-delete, role checks, password).
 * Expects caller to have ensured orders can be removed or absent — this deletes the user's orders first if any.
 */
export async function deleteUserCompletely(prisma: PrismaClient, userId: string): Promise<void> {
  const orderIds = (
    await prisma.order.findMany({
      where: { userId },
      select: { id: true },
    })
  ).map((o) => o.id);

  await prisma.$transaction(async (tx) => {
    await tx.user.updateMany({
      where: { referredById: userId },
      data: { referredById: null },
    });

    await tx.referralClick.updateMany({
      where: { userId },
      data: { userId: null },
    });

    await tx.cashbackEntry.updateMany({
      where: { userId },
      data: { payoutRequestId: null },
    });

    await tx.cashbackEntry.updateMany({
      where: { payoutRequest: { userId } },
      data: { payoutRequestId: null },
    });

    if (orderIds.length > 0) {
      await tx.cashbackEntry.deleteMany({
        where: { orderId: { in: orderIds } },
      });
    }

    await tx.cashbackEntry.deleteMany({ where: { userId } });

    await tx.payoutRequest.deleteMany({ where: { userId } });

    await tx.order.deleteMany({ where: { userId } });

    await tx.user.delete({ where: { id: userId } });
  });
}
