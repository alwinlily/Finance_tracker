// Currency utilities for handling IDR minor units

/**
 * Convert IDR minor units (stored as bigint) to major units for display
 * e.g., 10000 (minor) -> 100.00 (major)
 */
export function minorToMajor(minor: number): number {
  return minor / 100
}

/**
 * Convert IDR major units to minor units for storage
 * e.g., 100.00 (major) -> 10000 (minor)
 */
export function majorToMinor(major: number): number {
  return Math.round(major * 100)
}

/**
 * Format currency for display with IDR symbol
 */
export function formatCurrency(
  minor: number,
  currency: string = "IDR",
  showSymbol: boolean = true
): string {
  const major = minorToMajor(minor)

  if (currency === "IDR") {
    const formatted = new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(major)

    return showSymbol ? `Rp ${formatted}` : formatted
  }

  // For other currencies, use standard formatting
  return new Intl.NumberFormat("en-US", {
    style: showSymbol ? "currency" : "decimal",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(major)
}

/**
 * Format currency in a compact form (e.g., 1.5K, 2M)
 */
export function formatCurrencyCompact(
  minor: number,
  currency: string = "IDR"
): string {
  const major = minorToMajor(minor)

  if (currency === "IDR") {
    if (major >= 1_000_000_000) {
      return `Rp ${(major / 1_000_000_000).toFixed(1)}B`
    }
    if (major >= 1_000_000) {
      return `Rp ${(major / 1_000_000).toFixed(1)}M`
    }
    if (major >= 1_000) {
      return `Rp ${(major / 1_000).toFixed(1)}K`
    }
    return `Rp ${major.toFixed(0)}`
  }

  return formatCurrency(minor, currency)
}

/**
 * Parse user input string to minor units
 * Handles various formats: "100", "100.50", "100,000", etc.
 */
export function parseCurrencyInput(input: string): number {
  // Remove currency symbols and whitespace
  const cleaned = input.replace(/[Rp$€£¥\s]/g, "")

  // Remove thousand separators (both comma and dot)
  const withoutSeparators = cleaned.replace(/[,.]/g, (match, offset, str) => {
    // If it's the last occurrence and followed by 2 digits, it's a decimal
    const lastDotOrComma = str.lastIndexOf(".")
    const lastComma = str.lastIndexOf(",")
    const lastSeparator = Math.max(lastDotOrComma, lastComma)

    if (offset === lastSeparator && str.length - offset === 3) {
      return "." // decimal separator
    }
    return "" // thousand separator
  })

  const parsed = parseFloat(withoutSeparators)
  return isNaN(parsed) ? 0 : majorToMinor(parsed)
}
