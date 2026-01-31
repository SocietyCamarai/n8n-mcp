/**
 * Node Validation Schemas
 * Zod schemas for node management tools
 */

import { z } from 'zod';
import { NonEmptyString, IdParam, PaginationParams } from './base.js';

// Search Nodes Schema
export const SearchNodesSchema = z.object({
  query: NonEmptyString,
  limit: z.number().int().min(1).max(100).optional(),
  category: z.string().optional(),
});

export type SearchNodesInput = z.infer<typeof SearchNodesSchema>;

// Get Node Schema
export const GetNodeSchema = z.object({
  name: NonEmptyString,
  includeParameters: z.boolean().optional(),
});

export type GetNodeInput = z.infer<typeof GetNodeSchema>;

// Validate Node Schema
export const ValidateNodeSchema = z.object({
  nodeType: NonEmptyString,
  parameters: z.record(z.unknown()),
});

export type ValidateNodeInput = z.infer<typeof ValidateNodeSchema>;
