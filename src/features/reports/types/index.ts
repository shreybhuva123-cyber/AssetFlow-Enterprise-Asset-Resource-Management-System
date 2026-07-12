export type ReportType =
  | 'asset_summary'
  | 'asset_by_status'
  | 'asset_by_category'
  | 'asset_by_location'
  | 'maintenance_summary'
  | 'maintenance_by_technician'
  | 'maintenance_cost'
  | 'procurement_summary'
  | 'depreciation_summary'
  | 'depreciation_schedule';

export type ReportFormat = 'table' | 'bar_chart' | 'line_chart' | 'pie_chart' | 'kpi_cards';

export interface Report {
  id: string;
  orgId: string;
  name: string;
  description?: string | null;
  type: ReportType;
  format: ReportFormat;
  filters: Record<string, unknown>;
  columns: ReportColumn[];
  isScheduled: boolean;
  scheduleExpression?: string | null;
  lastRunAt?: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'currency' | 'percent' | 'badge';
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  sortable?: boolean;
}

export interface ReportResult {
  reportId?: string;
  generatedAt: Date;
  data: Record<string, unknown>[];
  summary?: Record<string, number>;
  totalRows: number;
}

export interface ReportFilters {
  orgId?: string;
  type?: ReportType;
  createdById?: string;
  search?: string;
}
