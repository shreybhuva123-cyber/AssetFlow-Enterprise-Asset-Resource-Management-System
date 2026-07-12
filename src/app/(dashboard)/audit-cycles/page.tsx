import { AuditListClient } from './list-client';

export const metadata = {
  title: 'Audit Cycles | AssetFlow',
  description: 'Manage asset audit cycles',
};

export default function AuditCyclesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Audit Cycles</h2>
      </div>
      <AuditListClient />
    </div>
  );
}
