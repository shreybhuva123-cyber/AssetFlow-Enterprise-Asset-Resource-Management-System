import type { ReactNode } from 'react';

export default function PresentationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {children}
    </div>
  );
}
