import { createClient } from './client';
import { supabaseConfig } from './config';
import { createLogger } from '@/lib/logger/index';
import { StorageError } from '@/lib/errors/index';
import { ErrorCode } from '@/types/errors';

const logger = createLogger('SupabaseStorage');

export interface UploadResult {
  path: string;
  fullPath: string;
  publicUrl: string;
}

export interface UploadOptions {
  bucket: string;
  path: string;
  file: File | Blob;
  contentType?: string;
  upsert?: boolean;
  cacheControl?: string;
}

export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const {
    bucket,
    path,
    file,
    contentType,
    upsert = false,
    cacheControl = '3600',
  } = options;

  const supabase = createClient();

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType,
    upsert,
    cacheControl,
  });

  if (error) {
    logger.error('File upload failed', error, { bucket, path });
    throw new StorageError(`Failed to upload file: ${error.message}`, ErrorCode.STORAGE_ERROR, {
      bucket,
      path,
    });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return { path: data.path, fullPath: data.fullPath, publicUrl };
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    logger.error('File deletion failed', error, { bucket, path });
    throw new StorageError(`Failed to delete file: ${error.message}`);
  }
}

export async function deleteFiles(bucket: string, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    logger.error('Bulk file deletion failed', error, { bucket, count: paths.length });
    throw new StorageError(`Failed to delete files: ${error.message}`);
  }
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 3600
): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    logger.error('Failed to create signed URL', error, { bucket, path });
    throw new StorageError(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

export function getAvatarUrl(userId: string, filename: string): string {
  return getPublicUrl(supabaseConfig.storage.avatars, `${userId}/${filename}`);
}
