'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, ShieldAlert, TrendingUp, TrendingDown, Wrench, AlertTriangle, Lightbulb } from 'lucide-react';

export function ExecutiveClient() {
  // Hardcoded for demo purposes as requested for rapid development.
  // In a real scenario, this would fetch from /api/dashboard/executive
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization Health</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> +2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asset Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground mt-1">Optimal range (75-85%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Load</CardTitle>
            <Wrench className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Low</div>
            <p className="text-xs text-muted-foreground mt-1">12 pending requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Compliance</CardTitle>
            <ShieldAlert className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground mt-1">0 critical discrepancies</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-yellow-500" /> AI Insights & Recommendations</CardTitle>
            <CardDescription>Predictive maintenance and cost-saving opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex p-4 rounded-lg bg-red-500/10 border border-red-500/20 items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">High Failure Rate Detected</h4>
                  <p className="text-sm text-muted-foreground mt-1">Asset <strong>MacBook Pro M1 (AF-MBP-001)</strong> has been repaired 4 times in the last 60 days. Recommended action: Retire and replace.</p>
                </div>
              </div>
              <div className="flex p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 items-start gap-4">
                <ShieldAlert className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Warranties Expiring</h4>
                  <p className="text-sm text-muted-foreground mt-1">14 Dell monitors are reaching the end of their warranty period next week. Recommended action: Perform preventative health checks.</p>
                </div>
              </div>
              <div className="flex p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 items-start gap-4">
                <Activity className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400">Underutilized Resources</h4>
                  <p className="text-sm text-muted-foreground mt-1">Projector "Conference Room A" has not been booked in 45 days. Recommended action: Reallocate to Marketing floor.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Asset cost vs budget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: 'Engineering', value: 85, cost: '$145k' },
                { name: 'Design', value: 65, cost: '$82k' },
                { name: 'Marketing', value: 40, cost: '$45k' },
                { name: 'Sales', value: 30, cost: '$30k' },
                { name: 'Operations', value: 20, cost: '$18k' },
              ].map(dept => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-muted-foreground">{dept.cost}</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${dept.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
