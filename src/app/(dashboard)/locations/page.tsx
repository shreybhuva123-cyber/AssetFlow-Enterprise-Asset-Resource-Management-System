import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Building2, Users, Package } from 'lucide-react';

export default function LocationsPage() {
  const locations = [
    { name: 'HQ - Floor 1', building: 'Main Office', assets: 342, employees: 87 },
    { name: 'HQ - Floor 2', building: 'Main Office', assets: 298, employees: 74 },
    { name: 'HQ - Floor 3', building: 'Main Office', assets: 265, employees: 62 },
    { name: 'Data Center A', building: 'Server Room', assets: 180, employees: 12 },
    { name: 'Remote - Mumbai', building: 'Branch Office', assets: 95, employees: 24 },
    { name: 'Remote - Bangalore', building: 'Branch Office', assets: 112, employees: 31 },
    { name: 'Warehouse', building: 'Storage', assets: 208, employees: 8 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Locations</h1>
        <p className="text-muted-foreground">Track assets and employees by physical location</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{locations.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets Placed</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.reduce((s, l) => s + l.assets, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.reduce((s, l) => s + l.employees, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Locations</CardTitle>
          <CardDescription>Assets and personnel by site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {locations.map((loc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{loc.name}</p>
                    <p className="text-xs text-muted-foreground">{loc.building}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {loc.assets} assets</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {loc.employees} staff</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
