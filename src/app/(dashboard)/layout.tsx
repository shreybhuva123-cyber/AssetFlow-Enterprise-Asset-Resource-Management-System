import { requireServerAuth } from '@/supabase/auth';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireServerAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader />

        <main
          className="flex-1 overflow-y-auto scrollbar-thin p-6"
          id="main-content"
        >
          <div className="mx-auto max-w-screen-2xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
