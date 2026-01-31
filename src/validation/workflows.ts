/**
 * Workflow Validation Schemas
 * Zod schemas for workflow management tools
 */

import { z } from 'zod';
import { NonEmptyString, IdParam, PaginationParams } from './base.js';

// Workflow Node Schema
export const WorkflowNodeSchema = z.object({
  id: NonEmptyString,
  name: NonEmptyString,
  type: NonEmptyString,
  typeVersion: z.number().int().positive(),
  position: z.tuple([z.number(), z.number()]),
  parameters: z.record(z.unknown()),
  credentials: z.record(z.unknown()).optional(),
  disabled: z.boolean().optional(),
  notes: z.string().optional(),
  continueOnFail: z.boolean().optional(),
  retryOnFail: z.boolean().optional(),
  maxTries: z.number().int().positive().optional(),
  waitBetweenTries: z.number().positive().optional(),
});

// Workflow Connection Schema
export const WorkflowConnectionSchema = z.record(
  z.record(
    z.array(
      z.array(
        z.object({
          node: NonEmptyString,
          type: NonEmptyString,
          index: z.number().int().nonnegative(),
        })
      )
    )
  )
);

// Workflow Settings Schema
export const WorkflowSettingsSchema = z.object({
  executionOrder: z.enum(['v0', 'v1']).optional(),
  timezone: z.string().optional(),
  saveDataErrorExecution: z.enum(['all', 'none']).optional(),
  saveDataSuccessExecution: z.enum(['all', 'none']).optional(),
  saveManualExecutions: z.boolean().optional(),
  saveExecutionProgress: z.boolean().optional(),
  executionTimeout: z.number().int().positive().optional(),
  errorWorkflow: z.string().optional(),
});

// Create Workflow Schema
export const CreateWorkflowSchema = z.object({
  name: NonEmptyString,
  nodes: z.array(WorkflowNodeSchema).min(1, 'At least one node is required'),
  connections: WorkflowConnectionSchema,
  settings: WorkflowSettingsSchema.optional(),
});

export type CreateWorkflowInput = z.infer<typeof CreateWorkflowSchema>;

// Get Workflow Schema
export const GetWorkflowSchema = z.object({
  id: IdParam,
  mode: z.enum(['full', 'details', 'structure', 'minimal']).default('full'),
});

export type GetWorkflowInput = z.infer<typeof GetWorkflowSchema>;

// Update Full Workflow Schema
export const UpdateFullWorkflowSchema = z.object({
  id: IdParam,
  name: z.string().optional(),
  nodes: z.array(WorkflowNodeSchema).optional(),
  connections: WorkflowConnectionSchema.optional(),
  settings: WorkflowSettingsSchema.optional(),
});

export type UpdateFullWorkflowInput = z.infer<typeof UpdateFullWorkflowSchema>;

// Partial Update Operation Schema
export const PartialUpdateOperationSchema = z.object({
  type: z.enum([
    'addNode',
    'removeNode',
    'updateNode',
    'moveNode',
    'enableNode',
    'disableNode',
    'addConnection',
    'removeConnection',
    'updateName',
    'updateSettings',
    'addTag',
    'removeTag',
  ]),
}).passthrough();

export const UpdatePartialWorkflowSchema = z.object({
  id: IdParam,
  operations: z.array(PartialUpdateOperationSchema).min(1, 'At least one operation is required'),
  validateOnly: z.boolean().optional(),
  continueOnError: z.boolean().optional(),
});

export type UpdatePartialWorkflowInput = z.infer<typeof UpdatePartialWorkflowSchema>;

// Delete Workflow Schema
export const DeleteWorkflowSchema = z.object({
  id: IdParam,
});

export type DeleteWorkflowInput = z.infer<typeof DeleteWorkflowSchema>;

// List Workflows Schema
export const ListWorkflowsSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
  active: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  excludePinnedData: z.boolean().optional(),
});

export type ListWorkflowsInput = z.infer<typeof ListWorkflowsSchema>;

// Validate Workflow Schema
export const ValidateWorkflowSchema = z.object({
  id: IdParam,
  options: z.object({
    validateNodes: z.boolean().optional(),
    validateConnections: z.boolean().optional(),
    validateExpressions: z.boolean().optional(),
    profile: z.enum(['minimal', 'runtime', 'ai-friendly', 'strict']).optional(),
  }).optional(),
});

export type ValidateWorkflowInput = z.infer<typeof ValidateWorkflowSchema>;

// Autofix Workflow Schema
export const AutofixWorkflowSchema = z.object({
  id: IdParam,
  applyFixes: z.boolean().optional(),
  fixTypes: z.array(
    z.enum([
      'expression-format',
      'typeversion-correction',
      'error-output-config',
      'node-type-correction',
      'webhook-missing-path',
      'typeversion-upgrade',
      'version-migration',
    ])
  ).optional(),
  confidenceThreshold: z.enum(['high', 'medium', 'low']).optional(),
  maxFixes: z.number().int().positive().optional(),
});

export type AutofixWorkflowInput = z.infer<typeof AutofixWorkflowSchema>;

// Workflow Versions Schema
export const WorkflowVersionsSchema = z.object({
  mode: z.enum(['list', 'get', 'rollback', 'delete', 'prune', 'truncate']),
  workflowId: z.string().optional(),
  versionId: z.number().int().nonnegative().optional(),
  limit: z.number().int().positive().optional(),
  validateBefore: z.boolean().optional(),
  deleteAll: z.boolean().optional(),
  maxVersions: z.number().int().positive().optional(),
  confirmTruncate: z.boolean().optional(),
});

export type WorkflowVersionsInput = z.infer<typeof WorkflowVersionsSchema>;

// Test Workflow Schema
export const TestWorkflowSchema = z.object({
  workflowId: NonEmptyString,
  triggerType: z.enum(['webhook', 'form', 'chat']).optional(),
  httpMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional(),
  webhookPath: z.string().optional(),
  message: z.string().optional(),
  sessionId: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  headers: z.record(z.string()).optional(),
  timeout: z.number().int().positive().optional(),
  waitForResponse: z.boolean().optional(),
});

export type TestWorkflowInput = z.infer<typeof TestWorkflowSchema>;

// Executions Schema
export const ExecutionsSchema = z.object({
  action: z.enum(['get', 'list', 'delete']),
  id: z.string().optional(),
  mode: z.enum(['preview', 'summary', 'filtered', 'full', 'error']).optional(),
  nodeNames: z.array(z.string()).optional(),
  itemsLimit: z.number().int().optional(),
  includeInputData: z.boolean().optional(),
  errorItemsLimit: z.number().int().optional(),
  includeStackTrace: z.boolean().optional(),
  includeExecutionPath: z.boolean().optional(),
  fetchWorkflow: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
  workflowId: z.string().optional(),
  projectId: z.string().optional(),
  status: z.enum(['success', 'error', 'waiting']).optional(),
  includeData: z.boolean().optional(),
});

export type ExecutionsInput = z.infer<typeof ExecutionsSchema>;

// Health Check Schema
export const HealthCheckSchema = z.object({
  mode: z.enum(['status', 'diagnostic']).default('status'),
  verbose: z.boolean().optional(),
});

export type HealthCheckInput = z.infer<typeof HealthCheckSchema>;
