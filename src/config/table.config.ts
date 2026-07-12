export type TableDensity = 'compact' | 'default' | 'comfortable';

export const tableConfig = {
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100] as const,
  maxPageSize: 100,

  defaultDensity: 'default' as TableDensity,

  density: {
    compact:     { rowHeight: 36, cellPaddingY: '0.375rem', fontSize: 'text-xs' },
    default:     { rowHeight: 48, cellPaddingY: '0.75rem',  fontSize: 'text-sm' },
    comfortable: { rowHeight: 60, cellPaddingY: '1rem',     fontSize: 'text-sm' },
  },

  sortIndicators: {
    asc:  '↑',
    desc: '↓',
    none: '↕',
  },

  emptyState: {
    icon: 'Inbox',
    title: 'No results',
    description: 'Try adjusting your search or filters.',
  },

  selection: {
    enabled: true,
    maxSelectable: 100,
  },

  export: {
    maxRows: 10_000,
    formats: ['csv', 'excel'] as const,
  },

  stickyHeader: true,
  showFooter: true,
  showColumnToggle: true,
  showDensityToggle: true,
  showExportButton: true,
  showSearchBar: true,

  columnDefaults: {
    minWidth: 80,
    defaultWidth: 150,
    maxWidth: 400,
    resizable: true,
    sortable: true,
    hideable: true,
  },
} as const;

export type TableConfig = typeof tableConfig;
export type TableExportFormat = typeof tableConfig.export.formats[number];
