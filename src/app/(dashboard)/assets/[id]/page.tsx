import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/get-session';
import { getAssetById } from '@/lib/services/asset.service';
import { AssetDetailClient } from './detail-client';
import { UserRole } from '@/types/auth';
import type { AssetStatus } from '@/constants/status';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const session = await getServerSession();
  if (!session?.profile?.orgId) return { title: 'Asset | AssetFlow' };

  const asset = await getAssetById(id, session.profile.orgId);
  return {
    title:       asset ? `${asset.assetTag} · ${asset.name} | AssetFlow` : 'Asset Not Found',
    description: asset ? `View details for ${asset.name} (${asset.assetTag})` : undefined,
  };
}

export default async function AssetDetailPage({ params }: Props) {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const { profile } = session;
  if (!profile.orgId) redirect('/dashboard');

  const { id } = await params;
  const asset  = await getAssetById(id, profile.orgId);
  if (!asset) notFound();

  // RBAC: employees can only view their own assigned asset
  if (profile.role === UserRole.EMPLOYEE && asset.assignedToId !== profile.id) {
    redirect('/assets');
  }

  const canEdit = profile.role === UserRole.ADMIN || profile.role === UserRole.ASSET_MANAGER;

  // Determine allowed transitions for current user
  const allowedNextStatuses: string[] = [];
  if (canEdit) {
    const { ASSET_STATUS_TRANSITIONS } = await import('@/constants/status');
    const transitions = ASSET_STATUS_TRANSITIONS[asset.status as AssetStatus] ?? [];
    allowedNextStatuses.push(...transitions);
  }

  return (
    <AssetDetailClient
      initialAsset={asset as unknown as Parameters<typeof AssetDetailClient>[0]['initialAsset']}
      canEdit={canEdit}
      allowedNextStatuses={allowedNextStatuses}
    />
  );
}
