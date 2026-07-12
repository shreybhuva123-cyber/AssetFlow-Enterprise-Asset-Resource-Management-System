import { prisma } from '@/lib/prisma';
import { TimelineEventType, Prisma } from '@prisma/client';

export interface CreateTimelineEventInput {
  assetId:     string;
  orgId:       string;
  eventType:   TimelineEventType;
  title:       string;
  description?: string;
  actorId?:    string;
  metadata?:   Record<string, unknown>;
}

export async function createTimelineEvent(input: CreateTimelineEventInput) {
  return prisma.assetTimeline.create({
    data: {
      assetId:     input.assetId,
      orgId:       input.orgId,
      eventType:   input.eventType,
      title:       input.title,
      description: input.description ?? null,
      actorId:     input.actorId ?? null,
      metadata:    (input.metadata ?? {}) as Parameters<typeof prisma.assetTimeline.create>[0]['data']['metadata'],
    },
    select: {
      id:          true,
      eventType:   true,
      title:       true,
      description: true,
      createdAt:   true,
      actor:       { select: { id: true, displayName: true, avatarUrl: true } },
      metadata:    true,
    },
  });
}

export async function getAssetTimeline(assetId: string, orgId: string, page = 1, limit = 50) {
  const skip = (page - 1) * limit;

  const [total, events] = await Promise.all([
    prisma.assetTimeline.count({ where: { assetId, orgId } }),
    prisma.assetTimeline.findMany({
      where:   { assetId, orgId },
      select:  {
        id:          true,
        eventType:   true,
        title:       true,
        description: true,
        createdAt:   true,
        metadata:    true,
        actor: { select: { id: true, displayName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take:    limit,
    }),
  ]);

  return {
    data: events,
    pagination: {
      page,
      pageSize:        limit,
      total,
      totalPages:      Math.ceil(total / limit),
      hasNextPage:     page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  };
}

export async function createActivityLog(input: {
  assetId:   string;
  orgId:     string;
  actorId?:  string;
  action:    string;
  field?:    string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.assetActivity.create({
    data: {
      assetId:   input.assetId,
      orgId:     input.orgId,
      actorId:   input.actorId ?? null,
      action:    input.action,
      field:     input.field ?? null,
      oldValue:  input.oldValue !== undefined ? (input.oldValue as Prisma.InputJsonValue) : Prisma.JsonNull,
      newValue:  input.newValue !== undefined ? (input.newValue as Prisma.InputJsonValue) : Prisma.JsonNull,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      metadata:  (input.metadata ?? {}) as Parameters<typeof prisma.assetActivity.create>[0]['data']['metadata'],
    },
  });
}

export async function getAssetActivities(assetId: string, orgId: string, page = 1, limit = 50) {
  const skip = (page - 1) * limit;

  const [total, activities] = await Promise.all([
    prisma.assetActivity.count({ where: { assetId, orgId } }),
    prisma.assetActivity.findMany({
      where:   { assetId, orgId },
      select:  {
        id:        true,
        action:    true,
        field:     true,
        oldValue:  true,
        newValue:  true,
        createdAt: true,
        actor:     { select: { id: true, displayName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take:    limit,
    }),
  ]);

  return {
    data: activities,
    pagination: {
      page,
      pageSize:        limit,
      total,
      totalPages:      Math.ceil(total / limit),
      hasNextPage:     page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  };
}
