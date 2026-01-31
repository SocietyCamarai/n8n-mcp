/**
 * Template Validation Schemas
 * Zod schemas for template management tools
 */

import { z } from 'zod';
import { NonEmptyString, IdParam, PaginationParams } from './base.js';

// Get Template Schema
export const GetTemplateSchema = z.object({
  id: NonEmptyString,
});

export type GetTemplateInput = z.infer<typeof GetTemplateSchema>;

// Search Templates Schema
export const SearchTemplatesSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

export type SearchTemplatesInput = z.infer<typeof SearchTemplatesSchema>;

// Deploy Template Schema
export const DeployTemplateSchema = z.object({
  templateId: NonEmptyString,
  name: z.string().optional(),
  customizations: z.record(z.unknown()).optional(),
});

export type DeployTemplateInput = z.infer<typeof DeployTemplateSchema>;
