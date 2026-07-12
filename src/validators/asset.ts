import { z } from 'zod';
import { AssetStatus, AssetCondition } from '@/constants/status';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const assetStatusSchema = z.nativeEnum(AssetStatus);
export const assetConditionSchema = z.nativeEnum(AssetCondition);

// ─── Create Asset ─────────────────────────────────────────────────────────────

export const createAssetSchema = z.object({
  name:            z.string().min(1, 'Name is required').max(255),
  serialNumber:    z.string().max(100).optional().nullable(),
  categoryId:      z.string().uuid('Invalid category').optional().nullable(),
  departmentId:    z.string().uuid('Invalid department').optional().nullable(),
  currentLocation: z.string().max(255).optional().nullable(),
  manufacturer:    z.string().max(150).optional().nullable(),
  model:           z.string().max(150).optional().nullable(),
  purchaseDate:    z.string().datetime({ offset: true }).optional().nullable()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').optional().nullable()),
  warrantyExpiry:  z.string().datetime({ offset: true }).optional().nullable()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').optional().nullable()),
  acquisitionCost: z.number().min(0, 'Cost must be positive').optional().nullable(),
  condition:       assetConditionSchema.default(AssetCondition.GOOD),
  status:          assetStatusSchema.default(AssetStatus.AVAILABLE),
  description:     z.string().max(5000).optional().nullable(),
  notes:           z.string().max(5000).optional().nullable(),
  isBookable:      z.boolean().default(false),
  isShared:        z.boolean().default(false),
  assignedToId:    z.string().uuid('Invalid user').optional().nullable(),
  customFields:    z.record(z.unknown()).default({}),
}).superRefine((data, ctx) => {
  if (data.purchaseDate && data.warrantyExpiry) {
    const purchase = new Date(data.purchaseDate);
    const warranty = new Date(data.warrantyExpiry);
    if (warranty < purchase) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Warranty expiry must be after purchase date',
        path: ['warrantyExpiry'],
      });
    }
  }
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;

// ─── Update Asset ─────────────────────────────────────────────────────────────

// Base object without superRefine — allows .partial() to work
const _assetBaseObject = z.object({
  name:            z.string().min(1, 'Name is required').max(255),
  serialNumber:    z.string().max(100).optional().nullable(),
  categoryId:      z.string().uuid('Invalid category').optional().nullable(),
  departmentId:    z.string().uuid('Invalid department').optional().nullable(),
  currentLocation: z.string().max(255).optional().nullable(),
  manufacturer:    z.string().max(150).optional().nullable(),
  model:           z.string().max(150).optional().nullable(),
  purchaseDate:    z.string().datetime({ offset: true }).optional().nullable()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').optional().nullable()),
  warrantyExpiry:  z.string().datetime({ offset: true }).optional().nullable()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').optional().nullable()),
  acquisitionCost: z.number().min(0, 'Cost must be positive').optional().nullable(),
  condition:       assetConditionSchema.default(AssetCondition.GOOD),
  status:          assetStatusSchema.default(AssetStatus.AVAILABLE),
  description:     z.string().max(5000).optional().nullable(),
  notes:           z.string().max(5000).optional().nullable(),
  isBookable:      z.boolean().default(false),
  isShared:        z.boolean().default(false),
  assignedToId:    z.string().uuid('Invalid user').optional().nullable(),
  customFields:    z.record(z.unknown()).default({}),
});

export const updateAssetSchema = _assetBaseObject.partial();

export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;


// ─── Status Transition ────────────────────────────────────────────────────────

export const statusTransitionSchema = z.object({
  status:  assetStatusSchema,
  reason:  z.string().max(500).optional(),
  comment: z.string().max(1000).optional(),
});

export type StatusTransitionInput = z.infer<typeof statusTransitionSchema>;

// ─── Filters ──────────────────────────────────────────────────────────────────

export const assetFiltersSchema = z.object({
  search:      z.string().max(200).optional(),
  status:      z.union([assetStatusSchema, z.array(assetStatusSchema)]).optional(),
  condition:   z.union([assetConditionSchema, z.array(assetConditionSchema)]).optional(),
  categoryId:  z.string().uuid().optional(),
  departmentId:z.string().uuid().optional(),
  assignedToId:z.string().uuid().optional(),
  from:        z.string().datetime({ offset: true }).optional(),
  to:          z.string().datetime({ offset: true }).optional(),
  isBookable:  z.boolean().optional(),
  isShared:    z.boolean().optional(),
  page:        z.number().int().min(1).default(1),
  limit:       z.number().int().min(1).max(100).default(20),
  sortBy:      z.enum(['name', 'assetTag', 'status', 'condition', 'createdAt', 'updatedAt', 'acquisitionCost']).default('createdAt'),
  sortOrder:   z.enum(['asc', 'desc']).default('desc'),
});

export type AssetFiltersInput = z.infer<typeof assetFiltersSchema>;

// ─── Bulk Operations ──────────────────────────────────────────────────────────

export const bulkStatusChangeSchema = z.object({
  ids:    z.array(z.string().uuid()).min(1, 'Select at least one asset').max(100),
  status: assetStatusSchema,
  reason: z.string().max(500).optional(),
});

export type BulkStatusChangeInput = z.infer<typeof bulkStatusChangeSchema>;

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'Select at least one asset').max(100),
});

export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;

export const bulkExportSchema = z.object({
  ids:    z.array(z.string().uuid()).optional(), // empty = export all matching filters
  format: z.enum(['csv', 'xlsx']).default('csv'),
  filters: assetFiltersSchema.optional(),
});

export type BulkExportInput = z.infer<typeof bulkExportSchema>;

// ─── Document type ────────────────────────────────────────────────────────────

export const documentTypeSchema = z.enum([
  'INVOICE',
  'WARRANTY',
  'MANUAL',
  'CERTIFICATE',
  'INSURANCE',
  'MAINTENANCE_REPORT',
  'OTHER',
]);

export type DocumentType = z.infer<typeof documentTypeSchema>;

export const uploadDocumentMetaSchema = z.object({
  documentType: documentTypeSchema.default('OTHER'),
  description:  z.string().max(500).optional(),
});

export type UploadDocumentMetaInput = z.infer<typeof uploadDocumentMetaSchema>;
