/**
 * Tag Validation Schemas
 * Zod schemas for tag management tools
 */

import { z } from 'zod';
import { NonEmptyString, IdParam, PaginationParams } from './base.js';

// Tag Schema
export const TagSchema = z.object({
  id: z.string().optional(),
  name: NonEmptyString,
  workflowIds: z.array(z.string()).optional(),
});

// List Tags Schema
export const ListTagsSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
  withUsageCount: z.boolean().optional(),
});

export type ListTagsInput = z.infer<typeof ListTagsSchema>;

// Create Tag Schema
export const CreateTagSchema = z.object({
  name: NonEmptyString,
});

export type CreateTagInput = z.infer<typeof CreateTagSchema>;

// Update Tag Schema
export const UpdateTagSchema = z.object({
  id: IdParam,
  name: NonEmptyString,
});

export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;

// Delete Tag Schema
export const DeleteTagSchema = z.object({
  id: IdParam,
});

export type DeleteTagInput = z.infer<typeof DeleteTagSchema>;
