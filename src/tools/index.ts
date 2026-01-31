/**
 * Tools Index
 * Exports all tool definitions organized by category
 */

import { ToolWithAnnotations } from '../types/index.js';
import { documentationTools } from './documentation.js';
import { nodeTools } from './nodes.js';
import { templateTools } from './templates.js';
import { workflowManagementTools } from './workflows.js';
import { credentialTools } from './credentials.js';
import { tagTools } from './tags.js';
import { userTools } from './users.js';
import { auditTools } from './audit.js';

// Export all tool arrays
export { documentationTools } from './documentation.js';
export { nodeTools } from './nodes.js';
export { templateTools } from './templates.js';
export { workflowManagementTools } from './workflows.js';
export { credentialTools } from './credentials.js';
export { tagTools } from './tags.js';
export { userTools } from './users.js';
export { auditTools } from './audit.js';

// Combined array of all tools
export const allTools: ToolWithAnnotations[] = [
  ...documentationTools,
  ...nodeTools,
  ...templateTools,
  ...workflowManagementTools,
  ...credentialTools,
  ...tagTools,
  ...userTools,
  ...auditTools,
];

// Alias for server.ts compatibility
export const toolDefinitions = allTools;

// Helper function to find a tool by name
export function findTool(name: string): ToolWithAnnotations | undefined {
  return allTools.find(tool => tool.name === name);
}

// Helper function to get all tool names
export function getAllToolNames(): string[] {
  return allTools.map(tool => tool.name);
}

// Tool categories for documentation
export const toolCategories = {
  documentation: documentationTools.map(t => t.name),
  nodes: nodeTools.map(t => t.name),
  templates: templateTools.map(t => t.name),
  workflows: workflowManagementTools.map(t => t.name),
  credentials: credentialTools.map(t => t.name),
  tags: tagTools.map(t => t.name),
  users: userTools.map(t => t.name),
  audit: auditTools.map(t => t.name),
};
