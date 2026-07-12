'use client';

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { AssetStatus, ASSET_STATUS_LABELS, AssetCondition, ASSET_CONDITION_LABELS } from '@/constants/status';

const STATUS_COLORS: Record<string, string> = {
  [AssetStatus.AVAILABLE]:         '#10b981',
  [AssetStatus.ALLOCATED]:         '#3b82f6',
  [AssetStatus.RESERVED]:          '#8b5cf6',
  [AssetStatus.UNDER_MAINTENANCE]: '#f59e0b',
  [AssetStatus.LOST]:              '#ef4444',
  [AssetStatus.RETIRED]:           '#f97316',
  [AssetStatus.DISPOSED]:          '#6b7280',
};

const CONDITION_COLORS: Record<string, string> = {
  [AssetCondition.EXCELLENT]: '#10b981',
  [AssetCondition.GOOD]:      '#22c55e',
  [AssetCondition.FAIR]:      '#eab308',
  [AssetCondition.POOR]:      '#f97316',
  [AssetCondition.DAMAGED]:   '#ef4444',
  [AssetCondition.LOST]:      '#dc2626',
  [AssetCondition.DISPOSED]:  '#6b7280',
};

interface StatusPieChartProps {
  data: Record<string, number>;
}

export function AssetStatusPieChart({ data }: StatusPieChartProps) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name:  ASSET_STATUS_LABELS[key as AssetStatus] ?? key,
      value,
      color: STATUS_COLORS[key] ?? '#6b7280',
    }));

  if (!chartData.length) {
    return (
      <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [value, name]}
          contentStyle={{
            background: 'hsl(var(--card))',
            border:     '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize:   '12px',
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface ConditionBarChartProps {
  data: Record<string, number>;
}

export function AssetConditionBarChart({ data }: ConditionBarChartProps) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name:  ASSET_CONDITION_LABELS[key as AssetCondition] ?? key,
      value,
      fill:  CONDITION_COLORS[key] ?? '#6b7280',
    }));

  if (!chartData.length) {
    return (
      <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border:     '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize:   '12px',
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
