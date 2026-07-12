'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2, Save, X } from 'lucide-react';
import { createAssetSchema, updateAssetSchema, type CreateAssetInput, type UpdateAssetInput } from '@/validators/asset';
import { AssetStatus, AssetCondition, ASSET_STATUS_LABELS, ASSET_CONDITION_LABELS } from '@/constants/status';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { notify } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';

type AssetCategory = { id: string; name: string; icon?: string | null; color?: string | null };
type Department    = { id: string; name: string; code?: string | null };

interface AssetFormProps {
  mode:        'create' | 'edit';
  assetId?:    string;
  defaultValues?: Partial<CreateAssetInput>;
  categories:  AssetCategory[];
  departments: Department[];
}

export function AssetForm({ mode, assetId, defaultValues, categories, departments }: AssetFormProps) {
  const router  = useRouter();
  const [saving, setSaving] = useState(false);

  const schema = mode === 'create' ? createAssetSchema : updateAssetSchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreateAssetInput>({
    resolver:      zodResolver(schema),
    defaultValues: {
      status:    AssetStatus.AVAILABLE,
      condition: AssetCondition.GOOD,
      isBookable:false,
      isShared:  false,
      customFields: {},
      ...defaultValues,
    },
  });

  const onSubmit = useCallback(async (data: CreateAssetInput | UpdateAssetInput) => {
    setSaving(true);
    try {
      const url    = mode === 'create' ? '/api/assets' : `/api/assets/${assetId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });

      const json = await res.json() as { data?: { id: string }; error?: string; details?: unknown };

      if (!res.ok) {
        notify.error(json.error ?? 'Failed to save asset');
        return;
      }

      notify.success(mode === 'create' ? 'Asset registered successfully' : 'Asset updated');
      router.push(DASHBOARD_ROUTES.ASSETS.DETAIL(json.data!.id));
      router.refresh();
    } catch {
      notify.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [mode, assetId, router]);

  const inputClass = 'h-10 bg-background/50 border-border/60 focus:border-primary/50';

  return (
    <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="space-y-8">

      {/* ─── Basic Information ─── */}
      <section className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold">Basic Information</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Core details about the asset</p>
        </div>
        <Separator />

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Name */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="name">Asset Name <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              placeholder="e.g. Dell Latitude 5540"
              className={cn(inputClass, errors.name && 'border-destructive')}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Serial Number */}
          <div className="space-y-1.5">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              placeholder="e.g. SN-123456789"
              className={cn(inputClass, errors.serialNumber && 'border-destructive')}
              {...register('serialNumber')}
            />
            {errors.serialNumber && <p className="text-xs text-destructive">{errors.serialNumber.message}</p>}
          </div>

          {/* Manufacturer */}
          <div className="space-y-1.5">
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              placeholder="e.g. Dell, Apple, HP"
              className={inputClass}
              {...register('manufacturer')}
            />
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              placeholder="e.g. Latitude 5540"
              className={inputClass}
              {...register('model')}
            />
          </div>

          {/* Current Location */}
          <div className="space-y-1.5">
            <Label htmlFor="currentLocation">Current Location</Label>
            <Input
              id="currentLocation"
              placeholder="e.g. Floor 3 - Room 302"
              className={inputClass}
              {...register('currentLocation')}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Detailed description of the asset..."
            rows={3}
            className="bg-background/50 border-border/60 focus:border-primary/50 resize-none"
            {...register('description')}
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Internal Notes</Label>
          <Textarea
            id="notes"
            placeholder="Internal notes visible to managers only..."
            rows={2}
            className="bg-background/50 border-border/60 focus:border-primary/50 resize-none"
            {...register('notes')}
          />
        </div>
      </section>

      {/* ─── Classification ─── */}
      <section className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold">Classification</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Category, department, status and condition</p>
        </div>
        <Separator />

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={watch('categoryId') ?? ''}
              onValueChange={(v) => setValue('categoryId', v || null)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select
              value={watch('departmentId') ?? ''}
              onValueChange={(v) => setValue('departmentId', v || null)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dep) => (
                  <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status <span className="text-destructive">*</span></Label>
            <Select
              value={watch('status')}
              onValueChange={(v) => setValue('status', v as AssetStatus)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AssetStatus).map((s) => (
                  <SelectItem key={s} value={s}>{ASSET_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div className="space-y-1.5">
            <Label>Condition</Label>
            <Select
              value={watch('condition')}
              onValueChange={(v) => setValue('condition', v as AssetCondition)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AssetCondition).map((c) => (
                  <SelectItem key={c} value={c}>{ASSET_CONDITION_LABELS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* ─── Financial ─── */}
      <section className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold">Financial & Dates</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Purchase information and warranty</p>
        </div>
        <Separator />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Acquisition Cost */}
          <div className="space-y-1.5">
            <Label htmlFor="acquisitionCost">Acquisition Cost ($)</Label>
            <Input
              id="acquisitionCost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className={inputClass}
              {...register('acquisitionCost', { valueAsNumber: true })}
            />
          </div>

          {/* Purchase Date */}
          <div className="space-y-1.5">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              className={inputClass}
              {...register('purchaseDate')}
            />
          </div>

          {/* Warranty Expiry */}
          <div className="space-y-1.5">
            <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
            <Input
              id="warrantyExpiry"
              type="date"
              className={cn(inputClass, errors.warrantyExpiry && 'border-destructive')}
              {...register('warrantyExpiry')}
            />
            {errors.warrantyExpiry && <p className="text-xs text-destructive">{errors.warrantyExpiry.message}</p>}
          </div>
        </div>
      </section>

      {/* ─── Sharing Options ─── */}
      <section className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold">Sharing & Booking</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Configure asset sharing behavior</p>
        </div>
        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
            <div>
              <p className="text-sm font-medium">Bookable Asset</p>
              <p className="text-xs text-muted-foreground mt-0.5">Allow employees to book this asset</p>
            </div>
            <Switch
              id="isBookable"
              checked={watch('isBookable')}
              onCheckedChange={(v) => setValue('isBookable', v)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
            <div>
              <p className="text-sm font-medium">Shared Asset</p>
              <p className="text-xs text-muted-foreground mt-0.5">Multiple people can use this asset simultaneously</p>
            </div>
            <Switch
              id="isShared"
              checked={watch('isShared')}
              onCheckedChange={(v) => setValue('isShared', v)}
            />
          </div>
        </div>
      </section>

      {/* ─── Actions ─── */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={saving || (mode === 'edit' && !isDirty)}
          className="gap-2 bg-primary hover:bg-primary/90"
          id="save-asset-btn"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === 'create' ? 'Register Asset' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
          id="cancel-asset-btn"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
