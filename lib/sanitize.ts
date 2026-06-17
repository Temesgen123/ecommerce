import { z } from 'zod';

/**
 * Strips HTML tags and dangerous characters from plain-text input.
 * Use for names, addresses, contact messages — anything that will
 * later be displayed back to a user (reviews, admin panel, emails).
 *
 * This does NOT replace Zod validation — use both. Zod checks shape
 * and length; this strips dangerous content.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[<>]/g, '') // strip stray angle brackets
    .trim()
    .slice(0, 5000); // hard cap to prevent abuse via huge payloads
}

/**
 * Normalizes email: trim + lowercase.
 * You already do this inline in most places (.toLowerCase().trim())
 * — this just centralizes it so it's consistent everywhere.
 */
export function sanitizeEmail(input: string): string {
  return input.trim().toLowerCase().slice(0, 254); // RFC 5321 max email length
}

/**
 * A reusable Zod transform you can chain onto any string field
 * to auto-sanitize during parsing instead of doing it manually after.
 *
 * Usage:
 *   name: sanitizedString({ min: 1, max: 64, message: "Name is required" })
 */
export function sanitizedString(opts: {
  min?: number;
  max?: number;
  message?: string;
}) {
  return z
    .string()
    .min(opts.min ?? 1, opts.message ?? 'This field is required')
    .max(opts.max ?? 5000)
    .transform((val) => sanitizeText(val));
}
