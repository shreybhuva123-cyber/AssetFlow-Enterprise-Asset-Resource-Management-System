export interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
}

export function formatCurrency(
  cents: number,
  options: FormatCurrencyOptions = {},
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    compact = false,
  } = options;

  const amount = cents / 100;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? 'compact' : 'standard',
  }).format(amount);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions & { locale?: string } = {},
): string {
  const { locale = 'en-US', ...rest } = options;
  return new Intl.NumberFormat(locale, rest).format(value);
}

export function formatCompact(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(value: number, decimals = 1, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

export function addCents(a: number, b: number): number {
  return a + b;
}

export function subtractCents(a: number, b: number): number {
  return a - b;
}

export function multiplyCents(cents: number, factor: number): number {
  return Math.round(cents * factor);
}
