export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  jwtSecret: process.env.SUPABASE_JWT_SECRET ?? '',
  storage: {
    assetImages: process.env.NEXT_PUBLIC_STORAGE_BUCKET_ASSET_IMAGES ?? 'asset-images',
    assetDocuments:
      process.env.NEXT_PUBLIC_STORAGE_BUCKET_ASSET_DOCUMENTS ?? 'asset-documents',
    avatars: process.env.NEXT_PUBLIC_STORAGE_BUCKET_AVATARS ?? 'avatars',
    exports: process.env.NEXT_PUBLIC_STORAGE_BUCKET_EXPORTS ?? 'exports',
  },
} as const;

export type SupabaseConfig = typeof supabaseConfig;

export function validateSupabaseConfig(): void {
  const required: Array<[string, string]> = [
    ['NEXT_PUBLIC_SUPABASE_URL', supabaseConfig.url],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseConfig.anonKey],
  ];

  const missing = required
    .filter(([, value]) => !value || value.length === 0)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Supabase environment variables: ${missing.join(', ')}. ` +
        'Copy .env.example to .env.local and fill in your Supabase project details.'
    );
  }
}
