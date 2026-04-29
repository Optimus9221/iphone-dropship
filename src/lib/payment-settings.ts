import { prisma } from "@/lib/db";

export type CryptoPaymentDefaults = {
  walletAddress: string;
  network: string;
};

/** Global crypto payment defaults from SystemSetting (admin). */
export async function getCryptoPaymentDefaults(): Promise<CryptoPaymentDefaults> {
  const rows = await prisma.systemSetting.findMany({
    where: { key: { in: ["crypto_wallet_address", "crypto_network"] } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    walletAddress: map.crypto_wallet_address ?? "",
    network: map.crypto_network ?? "",
  };
}
