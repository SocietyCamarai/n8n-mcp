/**
 * Handlers Index
 * Registers all tool handlers
 */

import { ToolRegistry } from '../types/index.js';

// Import handlers
import { documentationHandler } from './documentation.js';
import { searchNodesHandler, getNodeHandler, validateNodeHandler } from './nodes.js';
import { getTemplateHandler, searchTemplatesHandler, deployTemplateHandler } from './templates.js';
import {
  createWorkflowHandler,
  getWorkflowHandler,
  updateFullWorkflowHandler,
  updatePartialWorkflowHandler,
  deleteWorkflowHandler,
  listWorkflowsHandler,
  validateWorkflowHandler,
  workflowVersionsHandler,
  executionsHandler,
  testWorkflowHandler,
  healthCheckHandler,
  autofixWorkflowHandler,
} from './workflows.js';
import {
  createCredentialHandler,
  updateCredentialHandler,
  deleteCredentialHandler,
  getCredentialSchemaHandler,
  transferCredentialHandler,
} from './credentials.js';
import {
  listTagsHandler,
  createTagHandler,
  deleteTagHandler,
  updateTagHandler,
} from './tags.js';
import {
  listUsersHandler,
  getUserHandler,
} from './users.js';
import {
  generateAuditHandler,
} from './audit.js';

// Create handler registry
export const handlers: ToolRegistry = {
  // Documentation
  'tools_documentation': documentationHandler,

  // Nodes
  'search_nodes': searchNodesHandler,
  'get_node': getNodeHandler,
  'validate_node': validateNodeHandler,

  // Templates
  'get_template': getTemplateHandler,
  'search_templates': searchTemplatesHandler,
  'n8n_deploy_template': deployTemplateHandler,

  // Workflows
  'n8n_create_workflow': createWorkflowHandler,
  'n8n_get_workflow': getWorkflowHandler,
  'n8n_update_full_workflow': updateFullWorkflowHandler,
  'n8n_update_partial_workflow': updatePartialWorkflowHandler,
  'n8n_delete_workflow': deleteWorkflowHandler,
  'n8n_list_workflows': listWorkflowsHandler,
  'n8n_validate_workflow': validateWorkflowHandler,
  'n8n_autofix_workflow': autofixWorkflowHandler,
  'n8n_test_workflow': testWorkflowHandler,
  'n8n_executions': executionsHandler,
  'n8n_health_check': healthCheckHandler,
  'n8n_workflow_versions': workflowVersionsHandler,

  // Credentials
  'n8n_create_credential': createCredentialHandler,
  'n8n_update_credential': updateCredentialHandler,
  'n8n_delete_credential': deleteCredentialHandler,
  'n8n_get_credential_schema': getCredentialSchemaHandler,
  'n8n_transfer_credential': transferCredentialHandler,

  // Tags
  'n8n_list_tags': listTagsHandler,
  'n8n_create_tag': createTagHandler,
  'n8n_delete_tag': deleteTagHandler,
  'n8n_update_tag': updateTagHandler,

  // Users
  'n8n_list_users': listUsersHandler,
  'n8n_get_user': getUserHandler,

  // Audit
  'n8n_generate_audit': generateAuditHandler,
};

// Alias for server.ts compatibility
export const toolHandlers = handlers;

// Helper to check if handler exists
export function hasHandler(toolName: string): boolean {
  return toolName in handlers;
}

// Get handler by name
export function getHandler(toolName: string) {
  return handlers[toolName];
}

// Get all registered handler names
export function getRegisteredHandlers(): string[] {
  return Object.keys(handlers);
}
