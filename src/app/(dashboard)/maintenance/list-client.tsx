'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Wrench, Plus, Search, RefreshCw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { notify } from '@/lib/toast';
import { StatusBadge } from './status-badge';

interface MaintenanceRequest { id: string; title: string; priority: string; status: string; createdAt: string; asset: { name: string } }

export function MaintenanceListClient() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const pageSize = 10;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await fetch(`/api/maintenance?${params}`);
      if (!res.ok) throw new Error('Failed to fetch maintenance requests');
      const json = await res.json();
      setRequests(json.data);
      setTotal(json.total);
    } catch {
      notify.error('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchRequests(), 300);
    return () => clearTimeout(timer);
  }, [fetchRequests]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or asset..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchRequests}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button asChild>
          <Link href="/maintenance/new">
            <Plus className="h-4 w-4 mr-2" /> New Request
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="h-64 border rounded-xl animate-pulse bg-muted/30" />
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center">
          <Wrench className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold">No maintenance requests</h3>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Asset</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{req.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{req.asset.name}</td>
                  <td className="px-4 py-3">{req.priority}</td>
                  <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{format(new Date(req.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/maintenance/${req.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="p-3 border-t flex justify-between items-center bg-muted/10">
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <div className="space-x-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
