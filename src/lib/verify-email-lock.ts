/**
 * After every 2nd wrong code: lock duration 5 min, then 10, 20, 40, …
 * (pairs: 2→5m, 4→10m, 6→20m, …)
 */
export function lockMinutesForWrongAttemptCount(wrongAttempts: number): number {
  if (wrongAttempts < 2 || wrongAttempts % 2 !== 0) return 0;
  const pairIndex = wrongAttempts / 2 - 1;
  return 5 * Math.pow(2, pairIndex);
}
