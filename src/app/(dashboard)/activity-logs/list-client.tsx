'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Activity, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { notify } from '@/lib/toast';

export function ActivityListClient() {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const pageSize = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (search) params.set('search', search);
      if (moduleFilter !== 'ALL') params.set('module', moduleFilter);

      const res = await fetch(`/api/activity-logs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const json = await res.json();
      setLogs(json.data);
      setTotal(json.total);
    } catch {
      notify.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, [page, search, moduleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchLogs(), 300);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activity logs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={moduleFilter} onValueChange={(v) => { setModuleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Modules</SelectItem>
            <SelectItem value="ASSET">Assets</SelectItem>
            <SelectItem value="ALLOCATION">Allocations</SelectItem>
            <SelectItem value="TRANSFER">Transfers</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="AUDIT">Audit</SelectItem>
            <SelectItem value="SYSTEM">System</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchLogs}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="h-64 border rounded-xl animate-pulse bg-muted/30" />
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center">
          <Activity className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold">No activity logs found</h3>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actor</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Module</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {log.actor?.displayName || 'System'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-foreground">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.module}</td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">{log.description}</td>
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
