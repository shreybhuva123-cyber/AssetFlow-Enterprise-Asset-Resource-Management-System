import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingDown, DollarSign, Package, Calendar } from 'lucide-react';

export default function DepreciationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Depreciation</h1>
        <p className="text-muted-foreground">Track asset value depreciation over time</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Asset Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.24M</div>
            <p className="text-xs text-muted-foreground">Original cost basis</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Book Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$876K</div>
            <p className="text-xs text-muted-foreground">After depreciation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets Tracked</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,500</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fully Depreciated</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Ready for disposal</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Depreciation Schedule</CardTitle>
          <CardDescription>Asset categories and their depreciation rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { category: 'Laptops', method: 'Straight-line', rate: '25%/yr', remaining: '$320K' },
              { category: 'Monitors', method: 'Straight-line', rate: '20%/yr', remaining: '$180K' },
              { category: 'Peripherals', method: 'Straight-line', rate: '33%/yr', remaining: '$45K' },
              { category: 'Servers', method: 'Declining Balance', rate: '30%/yr', remaining: '$280K' },
              { category: 'Furniture', method: 'Straight-line', rate: '10%/yr', remaining: '$51K' },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-sm">{r.category}</p>
                  <p className="text-xs text-muted-foreground">{r.method}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-muted-foreground">{r.rate}</span>
                  <span className="font-medium">{r.remaining}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
