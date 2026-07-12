'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Activity, Package, Shield, Settings, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export default function PresentationPage() {
  const [step, setStep] = useState(0);

  const steps = [
    { title: 'Welcome to AssetFlow', desc: 'The Enterprise Asset Management System built for modern scale.' },
    { title: 'AI Assistant', desc: 'Ask natural language questions to gain instant insights over your secured data.' },
    { title: 'Full Lifecycle Tracking', desc: 'From procurement to maintenance to audit and retirement.' },
    { title: 'Odoo Readiness', desc: 'Production-ready code built with Next.js, Prisma, and Supabase RLS.' }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-3xl mix-blend-screen pointer-events-none" />

      <div className="max-w-4xl w-full z-10 text-center space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {steps[step].title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {steps[step].desc}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button size="lg" variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            Previous
          </Button>
          <Button size="lg" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1} className="gap-2">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {step === steps.length - 1 && (
          <div className="pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Button size="lg" asChild className="h-16 px-12 text-lg rounded-full shadow-2xl shadow-primary/25">
              <Link href="/dashboard" className="gap-3">
                <Play className="h-6 w-6 fill-current" /> Enter Live Application
              </Link>
            </Button>
          </div>
        )}

        <div className="flex gap-2 justify-center mt-12">
          {steps.map((_, i) => (
            <div key={i} className={cn("h-2 rounded-full transition-all duration-300", step === i ? "w-8 bg-primary" : "w-2 bg-muted")} />
          ))}
        </div>
      </div>
    </div>
  );
}
