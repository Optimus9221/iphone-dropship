import { prisma } from "./db";
import { canReceiveFreeiPhone, getFreeiPhoneQualifiedReferralsCount } from "./referral";

export type FreeIphoneClaimUiState = {
  canClaim: boolean;
  qualifiedReferrals: number;
  iphoneRequestedAt: string | null;
  cashWalletAddress: string | null;
  cashWalletNetwork: string | null;
  cashWalletSavedAt: string | null;
  hasPendingCashVerification: boolean;
};

export async function getFreeIphoneClaimUiState(userId: string): Promise<FreeIphoneClaimUiState> {
  const [eligible, qualified, election, verification] = await Promise.all([
    canReceiveFreeiPhone(userId),
    getFreeiPhoneQualifiedReferralsCount(userId),
    prisma.freeIphoneRewardElection.findUnique({ where: { userId } }),
    prisma.freeIphoneCashWalletVerification.findUnique({ where: { userId } }),
  ]);

  const pending =
    verification && verification.expiresAt.getTime() > Date.now() ? verification : null;

  return {
    canClaim: eligible,
    qualifiedReferrals: qualified,
    iphoneRequestedAt: election?.iphoneRequestedAt?.toISOString() ?? null,
    cashWalletAddress: election?.cashWalletAddress ?? null,
    cashWalletNetwork: election?.cashWalletNetwork ?? null,
    cashWalletSavedAt: election?.cashWalletSavedAt?.toISOString() ?? null,
    hasPendingCashVerification: !!pending,
  };
}

/** User may press «Get iPhone» if eligible and has not chosen cash or pending verify. */
export function canRequestFreeIphoneDevice(state: FreeIphoneClaimUiState): boolean {
  if (!state.canClaim) return false;
  if (state.hasPendingCashVerification) return false;
  if (state.cashWalletSavedAt) return false;
  if (state.iphoneRequestedAt) return false;
  return true;
}

/** User may start cash flow if eligible and has not requested iPhone or saved wallet. */
export function canStartCashAlternative(state: FreeIphoneClaimUiState): boolean {
  if (!state.canClaim) return false;
  if (state.iphoneRequestedAt) return false;
  if (state.cashWalletSavedAt) return false;
  return true;
}
