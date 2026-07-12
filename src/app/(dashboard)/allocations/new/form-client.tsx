'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Search,
  Loader2,
  CheckCircle2,
  User,
  Calendar,
} from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConflictDialog, type ConflictInfo } from '@/features/allocations/components/conflict-dialog';
import { notify } from '@/lib/toast';
import Link from 'next/link';

interface AssetOption {
  id: string;
  assetTag: string;
  name: string;
  category?: { name: string } | null;
  location?: { name: string } | null;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  department?: { id: string; name: string } | null;
}

interface DepartmentOption {
  id: string;
  name: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function NewAllocationForm() {
  const router = useRouter();

  // Asset search
  const [assetSearch, setAssetSearch] = useState('');
  const debouncedAssetSearch = useDebounce(assetSearch, 300);
  const [assetOptions, setAssetOptions] = useState<AssetOption[]>([]);
  const [assetLoading, setAssetLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetOption | null>(null);
  const [assetDropdown, setAssetDropdown] = useState(false);

  // User search
  const [userSearch, setUserSearch] = useState('');
  const debouncedUserSearch = useDebounce(userSearch, 300);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [userDropdown, setUserDropdown] = useState(false);

  // Departments
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [departmentId, setDepartmentId] = useState('');

  // Form fields
  const [allocationDate, setAllocationDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('NORMAL');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);

  // Load departments on mount
  useEffect(() => {
    fetch('/api/departments?pageSize=100')
      .then((r) => r.json())
      .then((d) => setDepartments(d.data ?? d))
      .catch(() => {});
  }, []);

  // Auto-fill department when user selected
  useEffect(() => {
    if (selectedUser?.department) {
      setDepartmentId(selectedUser.department.id);
    }
  }, [selectedUser]);

  // Asset search
  useEffect(() => {
    if (!debouncedAssetSearch.trim()) {
      setAssetOptions([]);
      return;
    }
    setAssetLoading(true);
    fetch(`/api/assets?status=AVAILABLE&search=${encodeURIComponent(debouncedAssetSearch)}&pageSize=10`)
      .then((r) => r.json())
      .then((d) => setAssetOptions(d.data ?? []))
      .catch(() => setAssetOptions([]))
      .finally(() => setAssetLoading(false));
  }, [debouncedAssetSearch]);

  // User search
  useEffect(() => {
    if (!debouncedUserSearch.trim()) {
      setUserOptions([]);
      return;
    }
    setUserLoading(true);
    fetch(`/api/users?search=${encodeURIComponent(debouncedUserSearch)}&pageSize=10`)
      .then((r) => r.json())
      .then((d) => setUserOptions(d.data ?? d))
      .catch(() => setUserOptions([]))
      .finally(() => setUserLoading(false));
  }, [debouncedUserSearch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAsset) {
      notify.error('Please select an asset');
      return;
    }
    if (!selectedUser) {
      notify.error('Please select an employee');
      return;
    }
    if (!allocationDate) {
      notify.error('Allocation date is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: selectedAsset.id,
          assignedToId: selectedUser.id,
          departmentId: departmentId || undefined,
          allocationDate,
          expectedReturnDate: expectedReturnDate || undefined,
          purpose: purpose.trim() || undefined,
          notes: notes.trim() || undefined,
          priority,
        }),
      });

      if (res.status === 409) {
        const body = await res.json();
        setConflictInfo({
          holderName: body.conflict?.holderName ?? 'Unknown',
          departmentName: body.conflict?.departmentName,
          assetTag: selectedAsset.assetTag,
          assetName: selectedAsset.name,
          allocationId: body.conflict?.allocationId,
        });
        setConflictOpen(true);
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to create allocation' }));
        throw new Error(body.error ?? 'Failed to create allocation');
      }

      const created = await res.json();
      notify.success('Asset allocated successfully');
      router.push(`/allocations/${created.id}`);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to create allocation');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Asset Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Select Asset
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Label htmlFor="asset-search">Asset *</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="asset-search"
                  value={selectedAsset ? `${selectedAsset.assetTag} — ${selectedAsset.name}` : assetSearch}
                  onChange={(e) => {
                    setAssetSearch(e.target.value);
                    setSelectedAsset(null);
                    setAssetDropdown(true);
                  }}
                  onFocus={() => setAssetDropdown(true)}
                  onBlur={() => setTimeout(() => setAssetDropdown(false), 150)}
                  placeholder="Search available assets by tag or name..."
                  className="pl-9"
                />
                {assetLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {assetDropdown && assetOptions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
                  {assetOptions.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      className="w-full px-4 py-2.5 text-left hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onMouseDown={() => {
                        setSelectedAsset(asset);
                        setAssetSearch('');
                        setAssetDropdown(false);
                      }}
                    >
                      <div className="font-medium font-mono text-sm">{asset.assetTag}</div>
                      <div className="text-sm text-muted-foreground">{asset.name}</div>
                      {(asset.category || asset.location) && (
                        <div className="text-xs text-muted-foreground/70 mt-0.5">
                          {[asset.category?.name, asset.location?.name].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedAsset && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{selectedAsset.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{selectedAsset.assetTag}</div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setSelectedAsset(null)}
                >
                  Change
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Assign To
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Label htmlFor="user-search">Employee *</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="user-search"
                  value={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setSelectedUser(null);
                    setUserDropdown(true);
                  }}
                  onFocus={() => setUserDropdown(true)}
                  onBlur={() => setTimeout(() => setUserDropdown(false), 150)}
                  placeholder="Search employee by name or email..."
                  className="pl-9"
                />
                {userLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {userDropdown && userOptions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
                  {userOptions.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="w-full px-4 py-2.5 text-left hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onMouseDown={() => {
                        setSelectedUser(user);
                        setUserSearch('');
                        setUserDropdown(false);
                      }}
                    >
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                      {user.department && (
                        <div className="text-xs text-muted-foreground/70">{user.department.name}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department-select">Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger id="department-select">
                  <SelectValue placeholder="Select department (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Allocation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allocation-date">Allocation Date *</Label>
                <Input
                  id="allocation-date"
                  type="date"
                  value={allocationDate}
                  onChange={(e) => setAllocationDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected-return-date">Expected Return Date</Label>
                <Input
                  id="expected-return-date"
                  type="date"
                  value={expectedReturnDate}
                  min={allocationDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority-select">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe the reason for this allocation..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" asChild type="button" id="cancel-allocation-btn">
            <Link href="/allocations">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={submitting || !selectedAsset || !selectedUser}
            id="submit-allocation-btn"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Allocation'
            )}
          </Button>
        </div>
      </form>

      <ConflictDialog
        open={conflictOpen}
        onOpenChange={setConflictOpen}
        conflict={conflictInfo}
      />
    </>
  );
}
