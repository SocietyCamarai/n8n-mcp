/**
 * Credential Validation Schemas
 * Zod schemas for credential management tools
 */

import { z } from 'zod';
import { NonEmptyString, IdParam, PaginationParams } from './base.js';

// Credential Schema
export const CredentialSchema = z.object({
  id: z.string().optional(),
  name: NonEmptyString,
  type: NonEmptyString,
  data: z.record(z.unknown()).optional(),
  nodesAccess: z.array(
    z.object({
      nodeType: NonEmptyString,
      date: z.string().optional(),
    })
  ).optional(),
});

// Create Credential Schema
export const CreateCredentialSchema = z.object({
  name: NonEmptyString,
  type: NonEmptyString,
  data: z.record(z.unknown()).optional(),
});

export type CreateCredentialInput = z.infer<typeof CreateCredentialSchema>;

// Update Credential Schema
export const UpdateCredentialSchema = z.object({
  id: IdParam,
  name: z.string().optional(),
  type: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

export type UpdateCredentialInput = z.infer<typeof UpdateCredentialSchema>;

// Delete Credential Schema
export const DeleteCredentialSchema = z.object({
  id: IdParam,
});

export type DeleteCredentialInput = z.infer<typeof DeleteCredentialSchema>;

// Get Credential Schema Schema
export const GetCredentialSchemaSchema = z.object({
  credentialTypeName: NonEmptyString,
});

export type GetCredentialSchemaInput = z.infer<typeof GetCredentialSchemaSchema>;

// Transfer Credential Schema
export const TransferCredentialSchema = z.object({
  id: IdParam,
  destinationProjectId: NonEmptyString,
});

export type TransferCredentialInput = z.infer<typeof TransferCredentialSchema>;
