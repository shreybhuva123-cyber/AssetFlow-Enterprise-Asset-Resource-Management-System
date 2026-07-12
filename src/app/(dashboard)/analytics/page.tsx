export const metadata = {
  title: 'Analytics | AssetFlow',
  description: 'Enterprise asset analytics and reporting',
};

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>
      <div className="rounded-xl border border-border/60 bg-card p-12 text-center">
        <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Advanced analytics and reporting capabilities will be available in the upcoming release.
        </p>
      </div>
    </div>
  );
}
