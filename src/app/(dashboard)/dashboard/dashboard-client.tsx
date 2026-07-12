'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Package, Wrench, AlertTriangle, ShieldCheck, Activity, Users } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { notify } from '@/lib/toast';
import { format } from 'date-fns';

export function DashboardClient() {
  const { profile } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const params = new URLSearchParams();
        if (profile?.role === 'DEPARTMENT_HEAD' && profile?.departmentId) {
          params.set('departmentId', profile.departmentId);
        }
        
        const res = await fetch(`/api/dashboard/kpis?${params}`);
        if (!res.ok) throw new Error('Failed to load dashboard data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        notify.error('Error loading dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [profile]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <Card key={i}><CardContent className="h-28 bg-muted/30" /></Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* KPI Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.totalAssets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocated</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.allocatedAssets}</div>
            <p className="text-xs text-muted-foreground">
              {data.kpis.utilization}% utilization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.maintenanceAssets}</div>
            <p className="text-xs text-muted-foreground">
              {data.kpis.pendingMaintenance} pending requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Returns</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{data.kpis.overdueReturns}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across the organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.actor?.displayName || 'System'} {activity.action.toLowerCase()} {activity.resourceType?.replace('_', ' ').toLowerCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              {data.recentActivity.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-4">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Returns */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Returns</CardTitle>
            <CardDescription>Assets scheduled to be returned soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data.upcomingReturns.map((allocation: any) => (
                <div key={allocation.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{allocation.asset.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {allocation.employee.displayName} • {format(new Date(allocation.expectedReturnDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
              {data.upcomingReturns.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-4">No upcoming returns</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
