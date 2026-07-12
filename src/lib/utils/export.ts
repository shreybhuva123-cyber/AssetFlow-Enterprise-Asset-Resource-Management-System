import { sanitizeFilename } from './file';

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportToCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: Array<{ key: keyof T; header: string }>,
  filename = 'export',
): void {
  if (rows.length === 0) return;

  const header = columns.map((c) => escapeCsvCell(String(c.header))).join(',');
  const body = rows.map((row) =>
    columns.map((c) => escapeCsvCell(formatCsvValue(row[c.key]))).join(','),
  );

  const csv = [header, ...body].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${sanitizeFilename(filename)}.csv`);
}

function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function exportToJson<T>(data: T, filename = 'export'): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadFile(blob, `${sanitizeFilename(filename)}.json`);
}

export function downloadFromUrl(url: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
