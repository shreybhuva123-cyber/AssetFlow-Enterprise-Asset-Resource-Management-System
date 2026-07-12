import { type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api/with-auth';
import { validateBody } from '@/lib/api/validate-body';
import { updateProfileSchema } from '@/validators/auth';
import { successResponse } from '@/lib/utils/api-response';

export const GET = withAuth(async (_req, ctx) => {
  const profile = await prisma.profile.findUnique({
    where: { id: ctx.profile.id },
    include: {
      department: { select: { id: true, name: true } },
    },
  });

  return successResponse(profile);
});

export const PATCH = withAuth(async (req: NextRequest, ctx) => {
  const { data, error } = await validateBody(req, updateProfileSchema);
  if (error) return error;

  const updated = await prisma.profile.update({
    where: { id: ctx.profile.id },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.firstName !== undefined || data.lastName !== undefined) && {
        displayName: `${data.firstName ?? ctx.profile.firstName} ${data.lastName ?? ctx.profile.lastName}`,
      },
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }),
      ...(data.timezone !== undefined && { timezone: data.timezone }),
      ...(data.locale !== undefined && { locale: data.locale }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
    },
  });

  return successResponse(updated);
});
