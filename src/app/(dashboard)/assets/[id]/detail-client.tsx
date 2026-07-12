'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
  ChevronLeft, Edit, Trash2, QrCode, Clock, Image as ImageIcon, FileText,
  MoreVertical, ArrowRight, Package, Building, User, MapPin,
  Calendar, DollarSign, Tag, AlertTriangle, Loader2, Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AssetStatusBadge } from '@/features/assets/components/asset-status-badge';
import { AssetConditionBadge } from '@/features/assets/components/asset-condition-badge';
import { AssetTimeline } from '@/features/assets/components/asset-timeline';
import { AssetGallery, type AssetImageItem } from '@/features/assets/components/asset-gallery';
import { AssetDocuments, type AssetDocumentItem } from '@/features/assets/components/asset-documents';
import { AssetQRCard } from '@/features/assets/components/asset-qr-card';
import type { AssetStatus} from '@/constants/status';
import { ASSET_STATUS_LABELS } from '@/constants/status';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { notify } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import NextImage from 'next/image';

type TimelineEvent = {
  id:          string;
  eventType:   string;
  title:       string;
  description?: string | null;
  createdAt:   string;
  actor?:      { id: string; displayName: string; avatarUrl?: string | null } | null;
  metadata:    Record<string, unknown>;
};

type AssetDetail = {
  id:              string;
  assetTag:        string;
  name:            string;
  description?:    string | null;
  notes?:          string | null;
  serialNumber?:   string | null;
  manufacturer?:   string | null;
  model?:          string | null;
  status:          AssetStatus;
  condition:       string;
  currentLocation?:string | null;
  acquisitionCost?:string | null;
  purchaseDate?:   string | null;
  warrantyExpiry?: string | null;
  isBookable:      boolean;
  isShared:        boolean;
  createdAt:       string;
  updatedAt:       string;
  assignedToId?:   string | null;
  category?:       { id: string; name: string; icon?: string | null; color?: string | null } | null;
  department?:     { id: string; name: string } | null;
  assignedTo?:     { id: string; displayName: string; avatarUrl?: string | null; email?: string | null } | null;
  images:          AssetImageItem[];
  documents:       AssetDocumentItem[];
  qrCodes:         { id: string; qrDataUrl: string; qrData: string; createdAt: string }[];
};

interface AssetDetailClientProps {
  initialAsset:       AssetDetail;
  canEdit:            boolean;
  allowedNextStatuses: string[];
}

export function AssetDetailClient({ initialAsset, canEdit, allowedNextStatuses }: AssetDetailClientProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [asset,       setAsset]        = useState<AssetDetail>(initialAsset);
  const [timeline,    setTimeline]     = useState<TimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [activeTab,   setActiveTab]    = useState(searchParams.get('tab') ?? 'overview');
  const [deleting,    setDeleting]     = useState(false);

  // Status change dialog
  const [statusDialog,   setStatusDialog]   = useState(false);
  const [newStatus,      setNewStatus]      = useState('');
  const [statusReason,   setStatusReason]   = useState('');
  const [statusLoading,  setStatusLoading]  = useState(false);

  const refreshAsset = useCallback(async () => {
    const res  = await fetch(`/api/assets/${asset.id}`);
    if (!res.ok) return;
    const json = await res.json() as { data: AssetDetail };
    setAsset(json.data);
  }, [asset.id]);

  const fetchTimeline = useCallback(async () => {
    setTimelineLoading(true);
    try {
      const res  = await fetch(`/api/assets/${asset.id}/timeline?limit=50`);
      if (!res.ok) return;
      const json = await res.json() as { data: TimelineEvent[] };
      setTimeline(json.data);
    } finally {
      setTimelineLoading(false);
    }
  }, [asset.id]);

  useEffect(() => {
    if (activeTab === 'timeline') void fetchTimeline();
  }, [activeTab, fetchTimeline]);

  const handleStatusChange = useCallback(async () => {
    if (!newStatus) return;
    setStatusLoading(true);
    try {
      const res  = await fetch(`/api/assets/${asset.id}/status`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: newStatus, reason: statusReason }),
      });
      const json = await res.json() as { data?: AssetDetail; error?: string };
      if (!res.ok) { notify.error(json.error ?? 'Status change failed'); return; }
      setAsset(json.data!);
      setStatusDialog(false);
      setStatusReason('');
      notify.success(`Status updated to ${ASSET_STATUS_LABELS[newStatus as AssetStatus]}`);
    } finally {
      setStatusLoading(false);
    }
  }, [asset.id, newStatus, statusReason]);

  const handleDelete = useCallback(async () => {
    if (!confirm(`Delete asset "${asset.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res  = await fetch(`/api/assets/${asset.id}`, { method: 'DELETE' });
      const json = await res.json() as { error?: string };
      if (!res.ok) { notify.error(json.error ?? 'Delete failed'); setDeleting(false); return; }
      notify.success('Asset deleted');
      router.push(DASHBOARD_ROUTES.ASSETS.LIST);
    } finally {
      setDeleting(false);
    }
  }, [asset.id, asset.name, router]);

  const primaryImage = asset.images.find((i) => i.isPrimary) ?? asset.images[0];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link href={DASHBOARD_ROUTES.ASSETS.LIST} className="hover:text-foreground transition-colors">Assets</Link>
        <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
        <span className="font-mono font-semibold text-foreground">{asset.assetTag}</span>
      </div>

      {/* Asset Hero */}
      <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-0">
          {/* Image panel */}
          <div className="sm:w-56 h-48 sm:h-auto bg-muted/30 flex items-center justify-center relative overflow-hidden flex-shrink-0">
            {primaryImage ? (
              <NextImage
                src={primaryImage.publicUrl}
                alt={asset.name}
                fill
                className="object-cover"
                sizes="224px"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                <Package className="h-12 w-12" />
                <span className="text-xs font-mono">{asset.assetTag}</span>
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className="flex-1 p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold">{asset.name}</h1>
                  {asset.category && (
                    <Badge variant="secondary" className="text-xs">
                      {asset.category.icon} {asset.category.name}
                    </Badge>
                  )}
                </div>
                <p className="font-mono text-sm text-primary font-semibold mt-0.5">{asset.assetTag}</p>
              </div>

              <div className="flex items-center gap-2">
                {canEdit && allowedNextStatuses.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 h-8"
                    onClick={() => setStatusDialog(true)}
                    id="change-status-btn"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    Change Status
                  </Button>
                )}

                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" id="asset-more-actions-btn">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={DASHBOARD_ROUTES.ASSETS.EDIT(asset.id)}>
                          <Edit className="h-3.5 w-3.5 mr-2" /> Edit Asset
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => void handleDelete()}
                        disabled={deleting}
                      >
                        {deleting ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-2" />}
                        Delete Asset
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Status & Condition row */}
            <div className="flex items-center gap-2 flex-wrap">
              <AssetStatusBadge status={asset.status} />
              <AssetConditionBadge condition={asset.condition as Parameters<typeof AssetConditionBadge>[0]['condition']} />
            </div>

            {/* Quick metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2.5">
              {asset.department && (
                <MetaItem icon={Building} label="Department" value={asset.department.name} />
              )}
              {asset.assignedTo && (
                <MetaItem icon={User} label="Assigned To" value={asset.assignedTo.displayName} />
              )}
              {asset.currentLocation && (
                <MetaItem icon={MapPin} label="Location" value={asset.currentLocation} />
              )}
              {asset.serialNumber && (
                <MetaItem icon={Tag} label="Serial No." value={asset.serialNumber} />
              )}
              {asset.manufacturer && (
                <MetaItem icon={Package} label="Manufacturer" value={`${asset.manufacturer}${asset.model ? ` ${asset.model}` : ''}`} />
              )}
              {asset.acquisitionCost && (
                <MetaItem icon={DollarSign} label="Purchase Cost" value={`$${parseFloat(asset.acquisitionCost).toLocaleString()}`} />
              )}
              {asset.warrantyExpiry && (
                <MetaItem
                  icon={Calendar}
                  label="Warranty Expiry"
                  value={format(new Date(asset.warrantyExpiry), 'MMM d, yyyy')}
                  warn={new Date(asset.warrantyExpiry) < new Date()}
                />
              )}
              <MetaItem icon={Clock} label="Registered" value={format(new Date(asset.createdAt), 'MMM d, yyyy')} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9">
          <TabsTrigger value="overview"  className="text-xs gap-1.5" id="tab-overview">
            <Activity className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="images"    className="text-xs gap-1.5" id="tab-images">
            <ImageIcon className="h-3.5 w-3.5" /> Images ({asset.images.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs gap-1.5" id="tab-documents">
            <FileText className="h-3.5 w-3.5" /> Documents ({asset.documents.length})
          </TabsTrigger>
          <TabsTrigger value="timeline"  className="text-xs gap-1.5" id="tab-timeline">
            <Clock className="h-3.5 w-3.5" /> Timeline
          </TabsTrigger>
          <TabsTrigger value="qr"        className="text-xs gap-1.5" id="tab-qr">
            <QrCode className="h-3.5 w-3.5" /> QR Code
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4 space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Description */}
            <div className="rounded-xl border border-border/60 bg-card/50 p-5 space-y-3">
              <h3 className="text-sm font-semibold">Description</h3>
              <Separator />
              {asset.description ? (
                <p className="text-sm text-muted-foreground leading-relaxed">{asset.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground/50 italic">No description provided</p>
              )}
            </div>

            {/* Sharing & Booking */}
            <div className="rounded-xl border border-border/60 bg-card/50 p-5 space-y-3">
              <h3 className="text-sm font-semibold">Settings</h3>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Bookable</p>
                    <p className="text-xs text-muted-foreground">Employees can book this asset</p>
                  </div>
                  <Badge variant={asset.isBookable ? 'default' : 'secondary'}>
                    {asset.isBookable ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Shared</p>
                    <p className="text-xs text-muted-foreground">Multiple users can use simultaneously</p>
                  </div>
                  <Badge variant={asset.isShared ? 'default' : 'secondary'}>
                    {asset.isShared ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          {asset.notes && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-50/30 dark:bg-amber-900/10 p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Internal Notes</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{asset.notes}</p>
            </div>
          )}
        </TabsContent>

        {/* Images */}
        <TabsContent value="images" className="mt-4">
          <div className="rounded-xl border border-border/60 bg-card/50 p-5">
            <AssetGallery
              assetId={asset.id}
              images={asset.images}
              canEdit={canEdit}
              onUpdate={() => void refreshAsset()}
            />
          </div>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="mt-4">
          <div className="rounded-xl border border-border/60 bg-card/50 p-5">
            <AssetDocuments
              assetId={asset.id}
              documents={asset.documents}
              canEdit={canEdit}
              onUpdate={() => void refreshAsset()}
            />
          </div>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline" className="mt-4">
          <div className="rounded-xl border border-border/60 bg-card/50 p-5">
            <AssetTimeline events={timeline as Parameters<typeof AssetTimeline>[0]['events']} isLoading={timelineLoading} />
          </div>
        </TabsContent>

        {/* QR Code */}
        <TabsContent value="qr" className="mt-4">
          <div className="max-w-sm">
            <AssetQRCard
              assetId={asset.id}
              assetTag={asset.assetTag}
              assetName={asset.name}
              qrDataUrl={asset.qrCodes[0]?.qrDataUrl}
              onUpdate={() => void refreshAsset()}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Status Change Dialog */}
      <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Asset Status</DialogTitle>
            <DialogDescription>
              Current status: <strong>{ASSET_STATUS_LABELS[asset.status]}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="new-status-select">
                  <SelectValue placeholder="Select status…" />
                </SelectTrigger>
                <SelectContent>
                  {allowedNextStatuses.map((s) => (
                    <SelectItem key={s} value={s}>{ASSET_STATUS_LABELS[s as AssetStatus] ?? s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Reason (optional)</label>
              <Textarea
                placeholder="Why is this status being changed?"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                rows={3}
                className="resize-none bg-background/50"
                id="status-reason-input"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(false)}>Cancel</Button>
            <Button onClick={() => void handleStatusChange()} disabled={!newStatus || statusLoading} id="confirm-status-btn">
              {statusLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetaItem({
  icon: Icon, label, value, warn,
}: {
  icon:    React.ComponentType<{ className?: string }>;
  label:   string;
  value:   string;
  warn?:   boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className={cn('h-3.5 w-3.5 mt-0.5 flex-shrink-0', warn ? 'text-amber-500' : 'text-muted-foreground')} />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-xs font-medium truncate', warn && 'text-amber-600')}>{value}</p>
      </div>
    </div>
  );
}
