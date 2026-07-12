/**
 * Asset Storage Service — handles Supabase Storage uploads/deletes
 * for asset images and documents.
 */

import { prisma } from '@/lib/prisma';
import { getSupabaseServer } from '@/lib/supabase/server';
import { StorageBucket, STORAGE_PATHS, FILE_LIMITS, ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES } from '@/constants/storage';
import { createTimelineEvent, createActivityLog } from '@/lib/repositories/asset-timeline.repository';
import { TimelineEventType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class StorageError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'StorageError';
  }
}

// ─── Image Upload ──────────────────────────────────────────────────────────────

export async function uploadAssetImage(
  assetId:    string,
  orgId:      string,
  actorId:    string,
  file:       File,
  isPrimary?: boolean,
) {
  // Validate type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new StorageError(`Invalid image type: ${file.type}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`, 'INVALID_FILE_TYPE');
  }

  // Validate size
  if (file.size > FILE_LIMITS.MAX_IMAGE_SIZE) {
    throw new StorageError(`Image too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 5MB`, 'FILE_TOO_LARGE');
  }

  const supabase   = await getSupabaseServer();
  const ext        = file.name.split('.').pop() ?? 'jpg';
  const fileId     = uuidv4();
  const storagePath = `${STORAGE_PATHS.ASSET_IMAGE(orgId, assetId)}/${fileId}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(StorageBucket.ASSET_IMAGES)
    .upload(storagePath, arrayBuffer, {
      contentType:  file.type,
      cacheControl: '3600',
      upsert:       false,
    });

  if (error) throw new StorageError(`Upload failed: ${error.message}`, 'UPLOAD_FAILED');

  const { data: { publicUrl } } = supabase.storage
    .from(StorageBucket.ASSET_IMAGES)
    .getPublicUrl(storagePath);

  // If making primary, unset existing primary
  if (isPrimary) {
    await prisma.assetImage.updateMany({
      where: { assetId, isPrimary: true },
      data:  { isPrimary: false },
    });
  }

  // Count existing images to set sortOrder
  const count = await prisma.assetImage.count({ where: { assetId } });

  const image = await prisma.assetImage.create({
    data: {
      assetId,
      orgId,
      storagePath,
      publicUrl,
      fileName:     file.name,
      fileSize:     file.size,
      mimeType:     file.type,
      isPrimary:    isPrimary ?? count === 0, // First image is primary by default
      sortOrder:    count,
      uploadedById: actorId,
    },
    select: { id: true, publicUrl: true, fileName: true, isPrimary: true, fileSize: true, mimeType: true, createdAt: true },
  });

  await createTimelineEvent({
    assetId,
    orgId,
    eventType:   TimelineEventType.IMAGE_UPLOADED,
    title:       `Image uploaded: ${file.name}`,
    actorId,
    metadata:    { imageId: image.id, fileName: file.name },
  });

  return image;
}

export async function deleteAssetImage(imageId: string, assetId: string, orgId: string, actorId: string) {
  const image = await prisma.assetImage.findFirst({
    where: { id: imageId, assetId, orgId },
    select: { storagePath: true, fileName: true, isPrimary: true },
  });

  if (!image) throw new StorageError('Image not found', 'NOT_FOUND');

  const supabase = await getSupabaseServer();
  await supabase.storage.from(StorageBucket.ASSET_IMAGES).remove([image.storagePath]);

  await prisma.assetImage.delete({ where: { id: imageId } });

  // If deleted primary, set first remaining as primary
  if (image.isPrimary) {
    const first = await prisma.assetImage.findFirst({
      where:   { assetId },
      orderBy: { sortOrder: 'asc' },
      select:  { id: true },
    });
    if (first) {
      await prisma.assetImage.update({ where: { id: first.id }, data: { isPrimary: true } });
    }
  }

  await createTimelineEvent({
    assetId,
    orgId,
    eventType:   TimelineEventType.IMAGE_DELETED,
    title:       `Image deleted: ${image.fileName}`,
    actorId,
    metadata:    { imageId, fileName: image.fileName },
  });
}

export async function getAssetImages(assetId: string, orgId: string) {
  return prisma.assetImage.findMany({
    where:   { assetId, orgId },
    select:  { id: true, publicUrl: true, fileName: true, isPrimary: true, sortOrder: true, fileSize: true, mimeType: true, createdAt: true },
    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
  });
}

// ─── Document Upload ───────────────────────────────────────────────────────────

export async function uploadAssetDocument(
  assetId:      string,
  orgId:        string,
  actorId:      string,
  file:         File,
  documentType: string,
  description?: string,
) {
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type as (typeof ALLOWED_DOCUMENT_TYPES)[number])) {
    throw new StorageError(`Invalid document type: ${file.type}`, 'INVALID_FILE_TYPE');
  }

  if (file.size > FILE_LIMITS.MAX_DOCUMENT_SIZE) {
    throw new StorageError(`Document too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 25MB`, 'FILE_TOO_LARGE');
  }

  const supabase    = await getSupabaseServer();
  const ext         = file.name.split('.').pop() ?? 'pdf';
  const fileId      = uuidv4();
  const storagePath = `${STORAGE_PATHS.ASSET_DOCUMENT(orgId, assetId)}/${fileId}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(StorageBucket.ASSET_DOCUMENTS)
    .upload(storagePath, arrayBuffer, {
      contentType:  file.type,
      cacheControl: '3600',
      upsert:       false,
    });

  if (error) throw new StorageError(`Upload failed: ${error.message}`, 'UPLOAD_FAILED');

  const { data: { publicUrl } } = supabase.storage
    .from(StorageBucket.ASSET_DOCUMENTS)
    .getPublicUrl(storagePath);

  const doc = await prisma.assetDocument.create({
    data: {
      assetId,
      orgId,
      storagePath,
      publicUrl,
      fileName:     file.name,
      fileSize:     file.size,
      mimeType:     file.type,
      documentType,
      description:  description ?? null,
      uploadedById: actorId,
    },
    select: { id: true, publicUrl: true, fileName: true, fileSize: true, mimeType: true, documentType: true, description: true, createdAt: true },
  });

  await createTimelineEvent({
    assetId,
    orgId,
    eventType:   TimelineEventType.DOCUMENT_UPLOADED,
    title:       `Document uploaded: ${file.name}`,
    actorId,
    metadata:    { docId: doc.id, documentType, fileName: file.name },
  });

  await createActivityLog({
    assetId,
    orgId,
    actorId,
    action:   'DOCUMENT_UPLOADED',
    newValue: { fileName: file.name, documentType },
  });

  return doc;
}

export async function deleteAssetDocument(docId: string, assetId: string, orgId: string, actorId: string) {
  const doc = await prisma.assetDocument.findFirst({
    where:  { id: docId, assetId, orgId },
    select: { storagePath: true, fileName: true },
  });

  if (!doc) throw new StorageError('Document not found', 'NOT_FOUND');

  const supabase = await getSupabaseServer();
  await supabase.storage.from(StorageBucket.ASSET_DOCUMENTS).remove([doc.storagePath]);
  await prisma.assetDocument.delete({ where: { id: docId } });

  await createTimelineEvent({
    assetId,
    orgId,
    eventType: TimelineEventType.DOCUMENT_DELETED,
    title:     `Document deleted: ${doc.fileName}`,
    actorId,
    metadata:  { docId, fileName: doc.fileName },
  });
}

export async function getAssetDocuments(assetId: string, orgId: string) {
  return prisma.assetDocument.findMany({
    where:   { assetId, orgId },
    select:  { id: true, publicUrl: true, fileName: true, fileSize: true, mimeType: true, documentType: true, description: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
}
