import { redirect } from 'next/navigation';
import { getServerSession } from '@/supabase/auth';
import { authConfig } from '@/config/auth.config';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (session) redirect(authConfig.redirects.afterLogin);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>

      <div
        className="hidden lg:flex flex-col items-center justify-center bg-sidebar p-12 relative overflow-hidden"
        aria-hidden="true"
      >
        <div className="relative z-10 text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 8h20M6 16h12M6 24h16"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-sidebar-foreground tracking-tight">
              AssetFlow
            </h1>
            <p className="mt-3 text-sidebar-foreground/60 leading-relaxed">
              Enterprise asset management built for teams who demand clarity, control, and compliance.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: 'Assets Tracked', value: '50K+' },
              { label: 'Work Orders', value: '200K+' },
              { label: 'Uptime', value: '99.9%' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-sidebar-primary">{value}</div>
                <div className="text-xs text-sidebar-foreground/50 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
