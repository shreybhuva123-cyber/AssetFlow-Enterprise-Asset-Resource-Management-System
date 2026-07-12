import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { AssetStatus, AllocationStatus, TimelineEventType } from '@prisma/client';
import { allocationRepository } from '@/lib/repositories/allocation.repository';
import type { CreateAllocationInput, ReturnAllocationInput, ApproveAllocationInput } from '@/validators/allocation';

export const allocationService = {
  async allocateAsset(orgId: string, actorId: string, input: CreateAllocationInput) {
    // 1. Fetch asset
    const asset = await prisma.asset.findFirst({
      where: { id: input.assetId, orgId, deletedAt: null },
      select: { id: true, assetTag: true, name: true, status: true, assignedToId: true },
    });
    if (!asset) throw new Error('Asset not found');

    // 2. Block non-available statuses
    const blockedStatuses: AssetStatus[] = ['LOST', 'RETIRED', 'DISPOSED', 'UNDER_MAINTENANCE'];
    if (blockedStatuses.includes(asset.status)) {
      throw new Error(`Cannot allocate asset with status: ${asset.status.replace('_', ' ')}`);
    }

    // 3. Check for existing active allocation
    const existing = await allocationRepository.findActiveForAsset(input.assetId, orgId);
    if (existing) {
      const currentHolder = existing.employee;
      throw Object.assign(
        new Error(`Asset is currently allocated to ${currentHolder.displayName} (${asset.assetTag}). Create a transfer request to reassign.`),
        { code: 'ALLOCATION_CONFLICT', conflict: { holderName: currentHolder.displayName, allocationId: existing.id, assetTag: asset.assetTag, assetName: asset.name } }
      );
    }

    // 4. Run in transaction
    return prisma.$transaction(async (tx) => {
      // Create allocation
      const allocation = await tx.assetAllocation.create({
        data: {
          org:           { connect: { id: orgId } },
          asset:         { connect: { id: input.assetId } },
          employee:      { connect: { id: input.employeeId } },
          ...(input.departmentId && { department: { connect: { id: input.departmentId } } }),
          ...(actorId && { allocatedBy: { connect: { id: actorId } } }),
          allocationDate:     new Date(input.allocationDate),
          expectedReturnDate: input.expectedReturnDate ? new Date(input.expectedReturnDate) : null,
          purpose:            input.purpose,
          notes:              input.notes,
          priority:           input.priority,
          status:             AllocationStatus.ACTIVE,
          approvalStatus:     input.requiresApproval ? 'PENDING' : 'APPROVED',
          ...(input.requiresApproval ? {} : { approvedBy: { connect: { id: actorId } }, approvedAt: new Date() }),
        },
      });

      // Update asset status
      await tx.asset.update({
        where: { id: input.assetId },
        data: { status: AssetStatus.ALLOCATED, assignedToId: input.employeeId },
      });

      // Write timeline
      await tx.assetTimeline.create({
        data: {
          asset:     { connect: { id: input.assetId } },
          orgId,
          eventType: TimelineEventType.ALLOCATION_CREATED,
          title:     'Asset Allocated',
          description: `Allocated to employee. Purpose: ${input.purpose ?? 'Not specified'}`,
          ...(actorId && { actor: { connect: { id: actorId } } }),
          metadata: { allocationId: allocation.id, employeeId: input.employeeId },
        },
      });

      return allocation;
    });
  },

  async returnAsset(orgId: string, allocationId: string, actorId: string, input: ReturnAllocationInput) {
    const allocation = await allocationRepository.findById(allocationId, orgId);
    if (!allocation) throw new Error('Allocation not found');
    if (allocation.status !== AllocationStatus.ACTIVE) throw new Error('Allocation is not active');

    return prisma.$transaction(async (tx) => {
      // Create return record
      const returnRecord = await tx.allocationReturn.create({
        data: {
          org:        { connect: { id: orgId } },
          allocation: { connect: { id: allocationId } },
          asset:      { connect: { id: allocation.assetId } },
          ...(actorId && { returnedBy: { connect: { id: actorId } } }),
          returnDate:  new Date(),
          condition:   input.condition,
          damageNotes: input.damageNotes,
          comments:    input.comments,
          photos:      input.photos as Prisma.InputJsonValue,
          status:      'ACCEPTED',
          reviewedAt:  new Date(),
        },
      });

      // Update allocation
      await tx.assetAllocation.update({
        where: { id: allocationId },
        data: { status: AllocationStatus.RETURNED, actualReturnDate: new Date() },
      });

      // Update asset status back to available
      await tx.asset.update({
        where: { id: allocation.assetId },
        data: { status: AssetStatus.AVAILABLE, assignedToId: null, condition: input.condition as never },
      });

      // Write timeline
      await tx.assetTimeline.create({
        data: {
          asset:     { connect: { id: allocation.assetId } },
          orgId,
          eventType: TimelineEventType.ALLOCATION_RETURNED,
          title:     'Asset Returned',
          description: `Returned in ${input.condition.toLowerCase()} condition`,
          ...(actorId && { actor: { connect: { id: actorId } } }),
          metadata: { allocationId, returnId: returnRecord.id, condition: input.condition },
        },
      });

      return returnRecord;
    });
  },

  async approveAllocation(orgId: string, allocationId: string, actorId: string, input: ApproveAllocationInput) {
    const allocation = await allocationRepository.findById(allocationId, orgId);
    if (!allocation) throw new Error('Allocation not found');
    if (allocation.approvalStatus !== 'PENDING') throw new Error('Allocation is not pending approval');

    return prisma.$transaction(async (tx) => {
      const updated = await tx.assetAllocation.update({
        where: { id: allocationId },
        data: {
          approvalStatus: input.decision,
          approvedById:   actorId,
          approvedAt:     new Date(),
          approvalNotes:  input.approvalNotes,
          ...(input.decision === 'REJECTED' && { status: AllocationStatus.CANCELLED }),
        },
      });

      if (input.decision === 'REJECTED') {
        await tx.asset.update({ where: { id: allocation.assetId }, data: { status: AssetStatus.AVAILABLE, assignedToId: null } });
      }

      await tx.assetTimeline.create({
        data: {
          asset:     { connect: { id: allocation.assetId } },
          orgId,
          eventType: TimelineEventType.ALLOCATION_APPROVED,
          title:     `Allocation ${input.decision === 'APPROVED' ? 'Approved' : 'Rejected'}`,
          description: input.approvalNotes ?? undefined,
          actor:     { connect: { id: actorId } },
          metadata:  { allocationId, decision: input.decision },
        },
      });

      return updated;
    });
  },

  async getActiveAllocation(assetId: string, orgId: string) {
    return allocationRepository.findActiveForAsset(assetId, orgId);
  },

  async getStats(orgId: string) {
    return allocationRepository.stats(orgId);
  },
};
