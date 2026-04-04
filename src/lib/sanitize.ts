import DOMPurify from 'isomorphic-dompurify';

// Strip ALL HTML — for text-only fields (names, addresses)
export function sanitizeText(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
}

// Allow basic formatting — for rich text fields
export function sanitizeRichText(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  }).trim();
}

// Validate and sanitize specific field types
export function sanitizePhone(input: string): string {
  if (!input) return "";
  return input.replace(/[^\d+\-() ]/g, '').trim();
}

export function sanitizeEmail(input: string): string {
  if (!input) return "";
  const trimmed = input.trim().toLowerCase();
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailRegex.test(trimmed)) throw new Error('Invalid email format');
  return trimmed;
}
