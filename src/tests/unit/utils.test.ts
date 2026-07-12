import { describe, it, expect } from 'vitest';
import { formatCurrency, fromCents, toCents } from '@/lib/utils/currency';
import { generateSlug, isValidUuid, generateShortId } from '@/lib/utils/id';
import { buildPaginatedResult } from '@/lib/utils/pagination';

describe('Currency utils', () => {
  it('converts cents to dollars', () => {
    expect(fromCents(1000)).toBe(10);
    expect(fromCents(0)).toBe(0);
    expect(fromCents(150)).toBe(1.5);
  });

  it('converts dollars to cents', () => {
    expect(toCents(10)).toBe(1000);
    expect(toCents(1.5)).toBe(150);
  });

  it('formats currency correctly', () => {
    expect(formatCurrency(1000)).toContain('10');
  });
});

describe('ID utils', () => {
  it('validates UUIDs', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUuid('not-a-uuid')).toBe(false);
    expect(isValidUuid('')).toBe(false);
  });

  it('generates slug from text', () => {
    expect(generateSlug('Engineering Department')).toBe('engineering-department');
    expect(generateSlug('  Spaces  ')).not.toContain(' ');
  });

  it('generates unique short IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateShortId()));
    expect(ids.size).toBe(100);
  });
});

describe('Pagination utils', () => {
  it('builds correct paginated result', () => {
    const items = [1, 2, 3];
    const result = buildPaginatedResult(items, 30, 1, 10);
    expect(result.items).toEqual(items);
    expect(result.total).toBe(30);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(3);
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPrevPage).toBe(false);
  });

  it('calculates last page correctly', () => {
    const result = buildPaginatedResult([1], 10, 2, 10);
    expect(result.hasPrevPage).toBe(true);
    expect(result.hasNextPage).toBe(false);
  });
});
