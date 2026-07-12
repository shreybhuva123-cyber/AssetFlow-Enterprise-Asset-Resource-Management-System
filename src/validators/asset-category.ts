import { z } from 'zod';

const dynamicFieldSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  type: z.enum(['text', 'number', 'date', 'boolean', 'select', 'url']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  placeholder: z.string().max(200).optional(),
  helpText: z.string().max(500).optional(),
});

export const createAssetCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  description: z.string().max(1000).optional(),
  icon: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{3,8}$/, 'Must be a valid hex color')
    .optional(),
  dynamicFields: z.array(dynamicFieldSchema).default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateAssetCategorySchema = createAssetCategorySchema.partial();

export const assetCategoryFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateAssetCategoryInput = z.infer<typeof createAssetCategorySchema>;
export type UpdateAssetCategoryInput = z.infer<typeof updateAssetCategorySchema>;
export type AssetCategoryFiltersInput = z.infer<typeof assetCategoryFiltersSchema>;
