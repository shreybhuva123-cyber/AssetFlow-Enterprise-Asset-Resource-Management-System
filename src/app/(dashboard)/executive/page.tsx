import { ExecutiveClient } from './executive-client';

export const metadata = {
  title: 'Executive Dashboard | AssetFlow',
  description: 'High-level insights and predictive analytics',
};

export default function ExecutiveDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Executive Dashboard</h2>
      </div>
      <ExecutiveClient />
    </div>
  );
}
