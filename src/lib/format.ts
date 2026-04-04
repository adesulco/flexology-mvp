// lib/format.ts

/**
 * Formats a number as Indonesian Rupiah.
 * Output: "Rp 875.000" (Indonesian standard: period = thousands, comma = decimal)
 * Use this function for ALL currency displays in the application.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a decimal rate for display (e.g., 0.02 → "0,02")
 * Uses Indonesian locale for consistent decimal separator.
 */
export function formatRate(rate: number): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(rate);
}
