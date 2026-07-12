import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getServerSession } from '@/lib/auth/get-session';
import { getAssetById } from '@/lib/services/asset.service';
import { getAllCategoriesForOrg } from '@/lib/repositories/asset-category.repository';
import { prisma } from '@/lib/prisma';
import { AssetForm } from '@/features/assets/components/asset-form';
import { UserRole } from '@/types/auth';
import type { AssetStatus, AssetCondition } from '@/constants/status';
import { DASHBOARD_ROUTES } from '@/constants/routes';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.profile?.orgId) return { title: 'Edit Asset | AssetFlow' };
  const asset = await getAssetById(id, session.profile.orgId);
  return { title: asset ? `Edit ${asset.assetTag} | AssetFlow` : 'Asset Not Found' };
}

export default async function EditAssetPage({ params }: Props) {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const { profile } = session;
  if (!profile.orgId) redirect('/dashboard');

  if (profile.role !== UserRole.ADMIN && profile.role !== UserRole.ASSET_MANAGER) {
    redirect('/assets');
  }

  const { id } = await params;
  const [asset, categories, departments] = await Promise.all([
    getAssetById(id, profile.orgId),
    getAllCategoriesForOrg(profile.orgId),
    prisma.department.findMany({
      where:   { orgId: profile.orgId, deletedAt: null, isActive: true },
      select:  { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!asset) notFound();

  const defaultValues = {
    name:             asset.name,
    description:      asset.description ?? undefined,
    notes:            asset.notes ?? undefined,
    serialNumber:     asset.serialNumber ?? undefined,
    manufacturer:     asset.manufacturer ?? undefined,
    model:            asset.model ?? undefined,
    status:           asset.status as AssetStatus,
    condition:        asset.condition as AssetCondition,
    categoryId:       asset.categoryId ?? undefined,
    departmentId:     asset.departmentId ?? undefined,
    currentLocation:  asset.currentLocation ?? undefined,
    acquisitionCost:  asset.acquisitionCost ? parseFloat(asset.acquisitionCost.toString()) : undefined,
    purchaseDate:     asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : undefined,
    warrantyExpiry:   asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : undefined,
    isBookable:       asset.isBookable,
    isShared:         asset.isShared,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href={DASHBOARD_ROUTES.ASSETS.DETAIL(id)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Asset
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Edit Asset</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          <span className="font-mono font-semibold text-primary">{asset.assetTag}</span> · {asset.name}
        </p>
      </div>

      <AssetForm
        mode="edit"
        assetId={id}
        defaultValues={defaultValues}
        categories={categories}
        departments={departments}
      />
    </div>
  );
}
