/**
 * Asset Service — Core business logic for Enterprise Asset Management.
 * Enforces state machine, business rules, and orchestrates repository calls.
 * Never query Prisma directly — always goes through repositories.
 */

import QRCode from 'qrcode';
import {
  getAssetById,
  createAsset,
  updateAsset,
  updateAssetStatus,
  softDeleteAsset,
  bulkUpdateStatus,
  bulkSoftDelete,
  checkSerialNumberExists,
  getAssets,
  getAssetStats,
  getAssetsForExport,
} from '@/lib/repositories/asset.repository';
import {
  createTimelineEvent,
  createActivityLog,
  getAssetTimeline,
  getAssetActivities,
} from '@/lib/repositories/asset-timeline.repository';
import { AssetStatus, ASSET_STATUS_TRANSITIONS } from '@/constants/status';
import { prisma } from '@/lib/prisma';
import { TimelineEventType } from '@prisma/client';
import type {
  CreateAssetInput,
  UpdateAssetInput,
  StatusTransitionInput,
  BulkStatusChangeInput,
  BulkDeleteInput,
} from '@/validators/asset';

// ─── Error Classes ─────────────────────────────────────────────────────────────

export class AssetServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'AssetServiceError';
  }
}

export class InvalidStatusTransitionError extends AssetServiceError {
  constructor(from: string, to: string) {
    super(`Cannot transition from ${from} to ${to}`, 'INVALID_STATUS_TRANSITION');
  }
}

export class DuplicateSerialNumberError extends AssetServiceError {
  constructor(serialNumber: string) {
    super(`Serial number "${serialNumber}" already exists`, 'DUPLICATE_SERIAL_NUMBER');
  }
}

export class AssetNotFoundError extends AssetServiceError {
  constructor(id: string) {
    super(`Asset ${id} not found`, 'ASSET_NOT_FOUND');
  }
}

export class AssetBusinessRuleError extends AssetServiceError {
  constructor(message: string) {
    super(message, 'BUSINESS_RULE_VIOLATION');
  }
}

// ─── State Machine ─────────────────────────────────────────────────────────────

export function canTransitionStatus(from: AssetStatus, to: AssetStatus): boolean {
  return ASSET_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

// ─── Asset CRUD ─────────────────────────────────────────────────────────────────

export async function registerAsset(
  orgId:   string,
  input:   CreateAssetInput,
  actorId: string,
) {
  // Business rule: Serial number must be unique
  if (input.serialNumber) {
    const exists = await checkSerialNumberExists(input.serialNumber, orgId);
    if (exists) throw new DuplicateSerialNumberError(input.serialNumber);
  }

  const asset = await createAsset(orgId, input, actorId);

  // Record timeline event
  await createTimelineEvent({
    assetId:   asset.id,
    orgId,
    eventType: TimelineEventType.CREATED,
    title:     'Asset registered',
    description: `Asset "${asset.name}" was registered with tag ${asset.assetTag}`,
    actorId,
  });

  // Record activity
  await createActivityLog({
    assetId: asset.id,
    orgId,
    actorId,
    action:  'CREATED',
    newValue: {
      name:      asset.name,
      assetTag:  asset.assetTag,
      status:    asset.status,
      condition: asset.condition,
    },
  });

  // Generate QR code automatically
  await generateQRCode(asset.id, orgId, asset.assetTag);

  return asset;
}

export async function editAsset(
  id:      string,
  orgId:   string,
  input:   UpdateAssetInput,
  actorId: string,
) {
  const existing = await getAssetById(id, orgId);
  if (!existing) throw new AssetNotFoundError(id);

  // Business rule: Cannot edit a disposed asset
  if (existing.status === AssetStatus.DISPOSED) {
    throw new AssetBusinessRuleError('Cannot edit a disposed asset');
  }

  // Business rule: Serial number uniqueness (exclude self)
  if (input.serialNumber && input.serialNumber !== existing.serialNumber) {
    const exists = await checkSerialNumberExists(input.serialNumber, orgId, id);
    if (exists) throw new DuplicateSerialNumberError(input.serialNumber);
  }

  const updated = await updateAsset(id, orgId, input, actorId);

  // Track field-level changes in activity log
  const changedFields: string[] = [];
  const watchedFields = ['name', 'serialNumber', 'status', 'condition', 'categoryId', 'departmentId', 'currentLocation', 'manufacturer', 'model'];
  for (const field of watchedFields) {
    const oldVal = (existing as Record<string, unknown>)[field];
    const newVal = (input as Record<string, unknown>)[field];
    if (newVal !== undefined && oldVal !== newVal) {
      changedFields.push(field);
      await createActivityLog({
        assetId: id,
        orgId,
        actorId,
        action:   'UPDATED',
        field,
        oldValue: oldVal,
        newValue: newVal,
      });
    }
  }

  if (changedFields.length > 0) {
    await createTimelineEvent({
      assetId:     id,
      orgId,
      eventType:   TimelineEventType.UPDATED,
      title:       'Asset updated',
      description: `Fields updated: ${changedFields.join(', ')}`,
      actorId,
    });
  }

  return updated;
}

export async function transitionStatus(
  id:      string,
  orgId:   string,
  input:   StatusTransitionInput,
  actorId: string,
) {
  const asset = await getAssetById(id, orgId);
  if (!asset) throw new AssetNotFoundError(id);

  const currentStatus = asset.status as AssetStatus;
  const newStatus      = input.status;

  // State machine validation
  if (!canTransitionStatus(currentStatus, newStatus)) {
    throw new InvalidStatusTransitionError(currentStatus, newStatus);
  }

  // Additional business rules
  if (newStatus === AssetStatus.DISPOSED && currentStatus === AssetStatus.ALLOCATED) {
    throw new AssetBusinessRuleError('Cannot dispose an allocated asset. Return it first.');
  }
  if (newStatus === AssetStatus.RETIRED && currentStatus === AssetStatus.ALLOCATED) {
    throw new AssetBusinessRuleError('Cannot retire an allocated asset. Return it first.');
  }

  await updateAssetStatus(id, orgId, newStatus, actorId);

  const eventTypeMap: Partial<Record<AssetStatus, TimelineEventType>> = {
    [AssetStatus.ALLOCATED]:         TimelineEventType.ALLOCATED,
    [AssetStatus.AVAILABLE]:         TimelineEventType.RETURNED,
    [AssetStatus.UNDER_MAINTENANCE]: TimelineEventType.MAINTENANCE_STARTED,
    [AssetStatus.LOST]:              TimelineEventType.LOST,
    [AssetStatus.RETIRED]:           TimelineEventType.RETIRED,
    [AssetStatus.DISPOSED]:          TimelineEventType.DISPOSED,
  };

  const eventType = eventTypeMap[newStatus] ?? TimelineEventType.STATUS_CHANGED;

  await createTimelineEvent({
    assetId:     id,
    orgId,
    eventType,
    title:       `Status changed to ${newStatus}`,
    description: input.reason ? `Reason: ${input.reason}` : undefined,
    actorId,
    metadata:    { from: currentStatus, to: newStatus, reason: input.reason, comment: input.comment },
  });

  await createActivityLog({
    assetId:  id,
    orgId,
    actorId,
    action:   'STATUS_CHANGED',
    field:    'status',
    oldValue: currentStatus,
    newValue: newStatus,
  });

  return getAssetById(id, orgId);
}

export async function removeAsset(id: string, orgId: string, actorId: string) {
  const asset = await getAssetById(id, orgId);
  if (!asset) throw new AssetNotFoundError(id);

  // Business rules
  if (asset.status === AssetStatus.ALLOCATED) {
    throw new AssetBusinessRuleError('Cannot delete an allocated asset. Return it first.');
  }
  if (asset.status === AssetStatus.UNDER_MAINTENANCE) {
    throw new AssetBusinessRuleError('Cannot delete an asset under maintenance.');
  }

  await softDeleteAsset(id, orgId, actorId);

  await createActivityLog({
    assetId:  id,
    orgId,
    actorId,
    action:   'DELETED',
    oldValue: { status: asset.status, name: asset.name },
  });
}

// ─── QR & Barcode ─────────────────────────────────────────────────────────────

export async function generateQRCode(assetId: string, orgId: string, assetTag: string) {
  const qrData = JSON.stringify({
    assetTag,
    assetId,
    orgId,
    type: 'ASSET_QR',
    version: 1,
  });

  const qrDataUrl = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'M',
    width: 300,
    margin: 2,
    color: { dark: '#0f172a', light: '#ffffff' },
  });

  // Upsert: replace existing QR for this asset
  await prisma.assetQR.deleteMany({ where: { assetId } });
  const qr = await prisma.assetQR.create({
    data: { assetId, orgId, qrData, qrDataUrl },
    select: { id: true, qrData: true, qrDataUrl: true, createdAt: true },
  });

  await createTimelineEvent({
    assetId,
    orgId,
    eventType: TimelineEventType.QR_GENERATED,
    title:     'QR code generated',
    metadata:  { qrId: qr.id },
  });

  return qr;
}

export async function getOrGenerateQR(assetId: string, orgId: string) {
  const asset = await getAssetById(assetId, orgId);
  if (!asset) throw new AssetNotFoundError(assetId);

  if (asset.qrCodes.length > 0) {
    return asset.qrCodes[0];
  }

  return generateQRCode(assetId, orgId, asset.assetTag);
}

export async function generateBarcodeData(assetId: string, orgId: string) {
  const asset = await getAssetById(assetId, orgId);
  if (!asset) throw new AssetNotFoundError(assetId);

  // Use asset tag as barcode data (Code128 compatible)
  const barcodeData = asset.assetTag;

  await prisma.assetBarcode.deleteMany({ where: { assetId } });
  const barcode = await prisma.assetBarcode.create({
    data: { assetId, orgId, barcodeData, barcodeType: 'CODE128' },
    select: { id: true, barcodeData: true, barcodeType: true, createdAt: true },
  });

  await createTimelineEvent({
    assetId,
    orgId,
    eventType: TimelineEventType.BARCODE_GENERATED,
    title:     'Barcode generated',
    metadata:  { barcodeId: barcode.id },
  });

  return barcode;
}

// ─── Bulk Operations ────────────────────────────────────────────────────────────

export async function bulkChangeStatus(
  orgId:   string,
  input:   BulkStatusChangeInput,
  actorId: string,
) {
  const { ids, status, reason } = input;

  // Validate each asset's transition
  const assets = await prisma.asset.findMany({
    where: { id: { in: ids }, orgId, deletedAt: null },
    select: { id: true, status: true, name: true },
  });

  const invalid: string[] = [];
  for (const asset of assets) {
    if (!canTransitionStatus(asset.status as AssetStatus, status)) {
      invalid.push(`${asset.name} (${asset.status} → ${status})`);
    }
  }

  if (invalid.length > 0) {
    throw new AssetBusinessRuleError(
      `Cannot transition: ${invalid.slice(0, 3).join('; ')}${invalid.length > 3 ? ` and ${invalid.length - 3} more` : ''}`,
    );
  }

  const result = await bulkUpdateStatus(ids, orgId, status, actorId);

  // Timeline events for each
  await Promise.all(
    assets.map((a) =>
      createTimelineEvent({
        assetId:   a.id,
        orgId,
        eventType: TimelineEventType.STATUS_CHANGED,
        title:     `Bulk status change to ${status}`,
        description: reason,
        actorId,
        metadata:  { from: a.status, to: status, bulk: true },
      }),
    ),
  );

  return result;
}

export async function bulkRemoveAssets(
  orgId:   string,
  input:   BulkDeleteInput,
  actorId: string,
) {
  const { ids } = input;

  const assets = await prisma.asset.findMany({
    where: { id: { in: ids }, orgId, deletedAt: null },
    select: { id: true, status: true, name: true },
  });

  const blocked = assets.filter(
    (a) => a.status === AssetStatus.ALLOCATED || a.status === AssetStatus.UNDER_MAINTENANCE,
  );

  if (blocked.length > 0) {
    throw new AssetBusinessRuleError(
      `Cannot delete: ${blocked.map((a) => a.name).slice(0, 3).join(', ')} (allocated or under maintenance)`,
    );
  }

  return bulkSoftDelete(ids, orgId, actorId);
}

// ─── Re-exported Queries ────────────────────────────────────────────────────────

export {
  getAssets,
  getAssetById,
  getAssetStats,
  getAssetsForExport,
  getAssetTimeline,
  getAssetActivities,
};
