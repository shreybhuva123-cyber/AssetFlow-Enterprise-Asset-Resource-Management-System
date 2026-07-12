export function buildSearchQuery(term: string, columns: string[]): string {
  const sanitized = term.replace(/[%_\\]/g, '\\$&').trim();
  if (!sanitized) return '';
  return columns.map((col) => `${col}.ilike.%${sanitized}%`).join(',');
}

export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  let queryIndex = 0;
  for (let i = 0; i < normalizedText.length && queryIndex < normalizedQuery.length; i++) {
    if (normalizedText[i] === normalizedQuery[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === normalizedQuery.length;
}

export function fuzzyScore(text: string, query: string): number {
  if (!query) return 1;
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (normalizedText === normalizedQuery) return 1;
  if (normalizedText.startsWith(normalizedQuery)) return 0.9;
  if (normalizedText.includes(normalizedQuery)) return 0.7;
  if (fuzzyMatch(normalizedText, normalizedQuery)) return 0.5;
  return 0;
}

export function filterBySearch<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string[],
): T[] {
  if (!query.trim()) return items;
  const normalized = query.toLowerCase().trim();
  return items.filter((item) =>
    getSearchableText(item).some((text) => text.toLowerCase().includes(normalized)),
  );
}

export function sortByRelevance<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string,
): T[] {
  if (!query.trim()) return items;
  return [...items].sort((a, b) => {
    const scoreA = fuzzyScore(getSearchableText(a), query);
    const scoreB = fuzzyScore(getSearchableText(b), query);
    return scoreB - scoreA;
  });
}

export function normalizeSearchTerm(term: string): string {
  return term.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function tokenizeSearch(term: string): string[] {
  return normalizeSearchTerm(term)
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}
