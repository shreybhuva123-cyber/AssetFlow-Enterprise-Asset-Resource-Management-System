export const storageConfig = {
  buckets: {
    assetImages: process.env.NEXT_PUBLIC_STORAGE_BUCKET_ASSET_IMAGES ?? 'asset-images',
    assetDocuments: process.env.NEXT_PUBLIC_STORAGE_BUCKET_ASSET_DOCUMENTS ?? 'asset-documents',
    avatars: process.env.NEXT_PUBLIC_STORAGE_BUCKET_AVATARS ?? 'avatars',
    exports: process.env.NEXT_PUBLIC_STORAGE_BUCKET_EXPORTS ?? 'exports',
  },

  paths: {
    assetImages: (orgId: string, assetId: string) => `${orgId}/assets/${assetId}/images`,
    assetDocuments: (orgId: string, assetId: string) => `${orgId}/assets/${assetId}/documents`,
    avatars: (userId: string) => `users/${userId}/avatar`,
    exports: (orgId: string) => `${orgId}/exports`,
  },

  limits: {
    avatarMaxBytes: 2 * 1024 * 1024,           // 2 MB
    assetImageMaxBytes: 10 * 1024 * 1024,       // 10 MB
    assetDocumentMaxBytes: 25 * 1024 * 1024,    // 25 MB
    exportMaxBytes: 100 * 1024 * 1024,          // 100 MB
  },

  allowedMimeTypes: {
    images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ] as const,
    exports: [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf',
    ] as const,
  },

  signedUrls: {
    defaultExpirySeconds: 3600,       // 1 hour
    downloadExpirySeconds: 300,       // 5 minutes
    avatarExpirySeconds: 86400,       // 24 hours
  },

  imageTransform: {
    avatarSize: 256,
    thumbnailSize: 128,
    previewMaxWidth: 800,
    quality: 80,
  },
} as const;

export type StorageConfig = typeof storageConfig;
