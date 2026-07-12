import { prisma } from '@/lib/prisma';
import { AssetStatus, TransferStatus, AllocationStatus, TimelineEventType } from '@prisma/client';
import { transferRepository } from '@/lib/repositories/transfer.repository';
import { allocationRepository } from '@/lib/repositories/allocation.repository';
import type { CreateTransferInput, ApproveTransferInput } from '@/validators/transfer';

export const transferService = {
  async createTransfer(orgId: string, requestedById: string, input: CreateTransferInput) {
    const asset = await prisma.asset.findFirst({
      where: { id: input.assetId, orgId, deletedAt: null },
      select: { id: true, assetTag: true, name: true, status: true, assignedToId: true },
    });
    if (!asset) throw new Error('Asset not found');

    const activeAllocation = await allocationRepository.findActiveForAsset(input.assetId, orgId);

    return prisma.$transaction(async (tx) => {
      const transfer = await tx.assetTransfer.create({
        data: {
          org:         { connect: { id: orgId } },
          asset:       { connect: { id: input.assetId } },
          requestedBy: { connect: { id: requestedById } },
          toEmployee:  { connect: { id: input.toEmployeeId } },
          ...(activeAllocation?.employeeId && { fromEmployee: { connect: { id: activeAllocation.employeeId } } }),
          ...(activeAllocation?.departmentId && { fromDepartment: { connect: { id: activeAllocation.departmentId } } }),
          ...(input.toDepartmentId && { toDepartment: { connect: { id: input.toDepartmentId } } }),
          status:        TransferStatus.REQUESTED,
          reason:        input.reason,
          notes:         input.notes,
          scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : null,
          requestedAt:   new Date(),
        },
      });

      await tx.assetTimeline.create({
        data: {
          asset:     { connect: { id: input.assetId } },
          orgId,
          eventType: TimelineEventType.TRANSFER_REQUESTED,
          title:     'Transfer Requested',
          description: input.reason,
          actor:     { connect: { id: requestedById } },
          metadata:  { transferId: transfer.id, toEmployeeId: input.toEmployeeId },
        },
      });

      return transfer;
    });
  },

  async approveTransfer(orgId: string, transferId: string, approverId: string, input: ApproveTransferInput) {
    const transfer = await transferRepository.findById(transferId, orgId);
    if (!transfer) throw new Error('Transfer not found');
    if (!['REQUESTED', 'PENDING_APPROVAL'].includes(transfer.status)) {
      throw new Error('Transfer is not in a pending state');
    }

    return prisma.$transaction(async (tx) => {
      // Record approval decision
      await tx.transferApproval.create({
        data: {
          orgId,
          transfer:  { connect: { id: transferId } },
          approver:  { connect: { id: approverId } },
          decision:  input.decision,
          comments:  input.comments,
          decidedAt: new Date(),
        },
      });

      if (input.decision === 'APPROVED') {
        // Complete existing allocation if any
        const existing = await allocationRepository.findActiveForAsset(transfer.assetId, orgId);
        if (existing) {
          await tx.assetAllocation.update({
            where: { id: existing.id },
            data: { status: AllocationStatus.RETURNED, actualReturnDate: new Date() },
          });
        }

        // Create new allocation for toEmployee
        await tx.assetAllocation.create({
          data: {
            org:          { connect: { id: orgId } },
            asset:        { connect: { id: transfer.assetId } },
            employee:     { connect: { id: transfer.toEmployeeId } },
            ...(transfer.toDepartmentId && { department: { connect: { id: transfer.toDepartmentId } } }),
            allocatedBy:  { connect: { id: approverId } },
            allocationDate: new Date(),
            status:        AllocationStatus.ACTIVE,
            approvalStatus: 'APPROVED',
            approvedBy:    { connect: { id: approverId } },
            approvedAt:    new Date(),
            purpose:       `Transfer from ${transfer.fromEmployee?.displayName ?? 'previous holder'}`,
          },
        });

        // Update asset holder
        await tx.asset.update({
          where: { id: transfer.assetId },
          data: { status: AssetStatus.ALLOCATED, assignedToId: transfer.toEmployeeId },
        });

        // Update transfer status
        await tx.assetTransfer.update({
          where: { id: transferId },
          data: { status: TransferStatus.COMPLETED, completedAt: new Date() },
        });

        await tx.assetTimeline.create({
          data: {
            asset:     { connect: { id: transfer.assetId } },
            orgId,
            eventType: TimelineEventType.TRANSFER_APPROVED,
            title:     'Transfer Approved & Completed',
            description: `Asset transferred to ${transfer.toEmployee.displayName}`,
            actor:     { connect: { id: approverId } },
            metadata:  { transferId, toEmployeeId: transfer.toEmployeeId },
          },
        });
      } else {
        await tx.assetTransfer.update({
          where: { id: transferId },
          data: { status: TransferStatus.REJECTED },
        });

        await tx.assetTimeline.create({
          data: {
            asset:     { connect: { id: transfer.assetId } },
            orgId,
            eventType: TimelineEventType.TRANSFER_REJECTED,
            title:     'Transfer Rejected',
            description: input.comments,
            actor:     { connect: { id: approverId } },
            metadata:  { transferId, reason: input.comments },
          },
        });
      }

      return transferRepository.findById(transferId, orgId);
    });
  },

  async cancelTransfer(orgId: string, transferId: string, actorId: string) {
    const transfer = await transferRepository.findById(transferId, orgId);
    if (!transfer) throw new Error('Transfer not found');
    if (['COMPLETED', 'REJECTED', 'CANCELLED'].includes(transfer.status)) {
      throw new Error('Transfer cannot be cancelled in its current state');
    }
    return prisma.assetTransfer.update({
      where: { id: transferId },
      data: { status: TransferStatus.CANCELLED },
    });
  },

  async getStats(orgId: string) {
    return transferRepository.stats(orgId);
  },
};
