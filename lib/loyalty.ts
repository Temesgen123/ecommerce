// Points configuration
export const POINTS_PER_DOLLAR = 1; // earn 1 points per $1
export const POINTS_PER_REDEMPTION = 100; // 100 points = $1 off
export const MIN_POINTS_TO_REDEEM = 100; // minimum points to redeem

export function calculatePointsEarned(totalCents: number): number {
  const dollars = totalCents / 100;
  return Math.floor(dollars * POINTS_PER_DOLLAR);
}

export function calculateDiscountFromPoints(points: number): number {
  // Returns discount in cents
  return Math.floor(points / POINTS_PER_REDEMPTION) * 100;
}

export function pointsToDiscount(points: number): number {
  return calculateDiscountFromPoints(points);
}

export function formatPoints(points: number): string {
  return points.toLocaleString();
}
