import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { AssetForm } from '@/features/assets/components/asset-form';
import { getAllCategoriesForOrg } from '@/lib/repositories/asset-category.repository';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth/get-session';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types/auth';

export const metadata: Metadata = {
  title:       'Register Asset | AssetFlow',
  description: 'Register a new asset in the system',
};

export default async function NewAssetPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const { profile } = session;
  if (!profile.orgId) redirect('/dashboard');

  // Only ADMIN and ASSET_MANAGER can register assets
  if (profile.role !== UserRole.ADMIN && profile.role !== UserRole.ASSET_MANAGER) {
    redirect('/assets');
  }

  const [categories, departments] = await Promise.all([
    getAllCategoriesForOrg(profile.orgId),
    prisma.department.findMany({
      where:   { orgId: profile.orgId, deletedAt: null, isActive: true },
      select:  { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={DASHBOARD_ROUTES.ASSETS.LIST}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Assets
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Register Asset</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Asset tag will be auto-generated. Fill in the details below.
        </p>
      </div>

      <AssetForm
        mode="create"
        categories={categories}
        departments={departments}
      />
    </div>
  );
}
