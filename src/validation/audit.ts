/**
 * Audit Validation Schemas
 * Zod schemas for audit tools
 */

import { z } from 'zod';
import { NonEmptyString } from './base.js';

// Generate Audit Schema
export const GenerateAuditSchema = z.object({
  scope: z.enum(['workflows', 'credentials', 'all']).default('all'),
  includeDetails: z.boolean().optional(),
  filters: z.object({
    workflowIds: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    dateRange: z.object({
      from: z.string().optional(),
      to: z.string().optional(),
    }).optional(),
  }).optional(),
});

export type GenerateAuditInput = z.infer<typeof GenerateAuditSchema>;
