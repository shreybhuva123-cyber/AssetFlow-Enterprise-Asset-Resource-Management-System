import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function ProcurementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Procurement</h1>
        <p className="text-muted-foreground">Manage purchase requests and vendor orders</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">12</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">5</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">38</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">3</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Purchase Requests</CardTitle>
          <CardDescription>Latest procurement activity across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { item: '15x Dell Laptops', dept: 'Engineering', amount: '$22,500', status: 'Pending' },
              { item: '5x Standing Desks', dept: 'Design', amount: '$3,750', status: 'Approved' },
              { item: '2x Server Racks', dept: 'IT', amount: '$8,400', status: 'Approved' },
              { item: '10x Monitors', dept: 'Product', amount: '$4,200', status: 'Pending' },
              { item: '1x Projector', dept: 'Marketing', amount: '$1,200', status: 'Rejected' },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-sm">{r.item}</p>
                  <p className="text-xs text-muted-foreground">{r.dept}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{r.amount}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    r.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    r.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
