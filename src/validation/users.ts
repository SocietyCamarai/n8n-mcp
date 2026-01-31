/**
 * User Validation Schemas
 * Zod schemas for user management tools
 */

import { z } from 'zod';
import { NonEmptyString, IdParam, PaginationParams } from './base.js';

// List Users Schema
export const ListUsersSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

export type ListUsersInput = z.infer<typeof ListUsersSchema>;

// Get User Schema
export const GetUserSchema = z.object({
  id: IdParam,
});

export type GetUserInput = z.infer<typeof GetUserSchema>;
