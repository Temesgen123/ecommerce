export const FIXED_AMOUNTS = [1000, 2500, 5000, 10000]; // in cents: $10, $25, $50, $100

export function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = 4;
  const segmentLength = 4;
  return Array.from({ length: segments }, () =>
    Array.from(
      { length: segmentLength },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join(''),
  ).join('-');
}

export function formatGiftCardCode(code: string): string {
  return code
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/(.{4})/g, '$1-')
    .slice(0, -1);
}

export function getTwoYearsFromNow(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 2);
  return date;
}
