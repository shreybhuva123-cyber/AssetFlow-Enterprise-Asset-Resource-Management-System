import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, TrendingUp, Package, Users, Wrench, ArrowUpRight } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Asset management insights and analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asset Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-green-600 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> +4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,500</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Allocations</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">943</div>
            <p className="text-xs text-muted-foreground">Assigned to employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Cost</CardTitle>
            <Wrench className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18.4K</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assets by Department</CardTitle>
            <CardDescription>Distribution across business units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { dept: 'Engineering', count: 420, pct: 28 },
                { dept: 'IT', count: 310, pct: 21 },
                { dept: 'Operations', count: 245, pct: 16 },
                { dept: 'Sales', count: 198, pct: 13 },
                { dept: 'Finance', count: 142, pct: 9 },
                { dept: 'Others', count: 185, pct: 13 },
              ].map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{r.dept}</span>
                    <span className="text-muted-foreground">{r.count} ({r.pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Acquisition Trend</CardTitle>
            <CardDescription>New assets added per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { month: 'February', count: 42 },
                { month: 'March', count: 67 },
                { month: 'April', count: 38 },
                { month: 'May', count: 91 },
                { month: 'June', count: 55 },
                { month: 'July', count: 23 },
              ].map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{r.month}</span>
                    <span className="text-muted-foreground">{r.count} assets</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(r.count / 91) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Available Reports</CardTitle>
          <CardDescription>Download or schedule automated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              'Asset Inventory Report', 'Depreciation Summary', 'Allocation History',
              'Maintenance Cost Analysis', 'Audit Trail Report', 'Procurement Summary',
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <span className="text-sm font-medium">{r}</span>
                <span className="text-xs text-primary">Export CSV</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
