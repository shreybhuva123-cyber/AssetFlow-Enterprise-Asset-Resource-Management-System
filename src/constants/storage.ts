export enum StorageBucket {
  ASSET_IMAGES = 'asset-images',
  ASSET_DOCUMENTS = 'asset-documents',
  AVATARS = 'avatars',
  EXPORTS = 'exports',
  ORG_ASSETS = 'org-assets',
}

export const STORAGE_PATHS = {
  ASSET_IMAGE: (orgId: string, assetId: string) =>
    `${orgId}/assets/${assetId}/images`,
  ASSET_DOCUMENT: (orgId: string, assetId: string) =>
    `${orgId}/assets/${assetId}/documents`,
  AVATAR: (userId: string) => `avatars/${userId}`,
  EXPORT: (orgId: string, exportId: string) => `${orgId}/exports/${exportId}`,
  ORG_LOGO: (orgId: string) => `${orgId}/logo`,
} as const;

export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,     // 5 MB
  MAX_DOCUMENT_SIZE: 25 * 1024 * 1024, // 25 MB
  MAX_EXPORT_SIZE: 100 * 1024 * 1024,  // 100 MB
  MAX_AVATAR_SIZE: 2 * 1024 * 1024,    // 2 MB
} as const;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];
export type AllowedDocumentType = (typeof ALLOWED_DOCUMENT_TYPES)[number];
