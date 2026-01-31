/**
 * Template Tools
 * Tools for searching and deploying workflow templates
 */

import { ToolWithAnnotations } from '../types/index.js';

export const templateTools: ToolWithAnnotations[] = [
  {
    name: 'get_template',
    description: `Get template by ID. Use mode to control response size: nodes_only (minimal), structure (nodes+connections), full (complete workflow).`,
    inputSchema: {
      type: 'object',
      properties: {
        templateId: {
          type: 'number',
          description: 'The template ID to retrieve',
        },
        mode: {
          type: 'string',
          enum: ['nodes_only', 'structure', 'full'],
          description: 'Response detail level. nodes_only: just node list, structure: nodes+connections, full: complete workflow JSON.',
          default: 'full',
        },
      },
      required: ['templateId'],
    },
    annotations: {
      title: 'Get Template',
      readOnlyHint: true,
      idempotentHint: true,
    },
  },
  {
    name: 'search_templates',
    description: `Search templates with multiple modes. Use searchMode='keyword' for text search, 'by_nodes' to find templates using specific nodes, 'by_task' for curated task-based templates, 'by_metadata' for filtering by complexity/setup time/services.`,
    inputSchema: {
      type: 'object',
      properties: {
        searchMode: {
          type: 'string',
          enum: ['keyword', 'by_nodes', 'by_task', 'by_metadata'],
          description: 'Search mode. keyword=text search (default), by_nodes=find by node types, by_task=curated task templates, by_metadata=filter by complexity/services',
          default: 'keyword',
        },
        // For searchMode='keyword'
        query: {
          type: 'string',
          description: 'For searchMode=keyword: search keyword (e.g., "chatbot")',
        },
        fields: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['id', 'name', 'description', 'author', 'nodes', 'views', 'created', 'url', 'metadata'],
          },
          description: 'For searchMode=keyword: fields to include in response. Default: all fields.',
        },
        // For searchMode='by_nodes'
        nodeTypes: {
          type: 'array',
          items: { type: 'string' },
          description: 'For searchMode=by_nodes: array of node types (e.g., ["n8n-nodes-base.httpRequest", "n8n-nodes-base.slack"])',
        },
        // For searchMode='by_task'
        task: {
          type: 'string',
          enum: [
            'ai_automation',
            'data_sync',
            'webhook_processing',
            'email_automation',
            'slack_integration',
            'data_transformation',
            'file_processing',
            'scheduling',
            'api_integration',
            'database_operations'
          ],
          description: 'For searchMode=by_task: the type of task',
        },
        // For searchMode='by_metadata'
        category: {
          type: 'string',
          description: 'For searchMode=by_metadata: filter by category (e.g., "automation", "integration")',
        },
        complexity: {
          type: 'string',
          enum: ['simple', 'medium', 'complex'],
          description: 'For searchMode=by_metadata: filter by complexity level',
        },
        maxSetupMinutes: {
          type: 'number',
          description: 'For searchMode=by_metadata: maximum setup time in minutes',
          minimum: 5,
          maximum: 480,
        },
        minSetupMinutes: {
          type: 'number',
          description: 'For searchMode=by_metadata: minimum setup time in minutes',
          minimum: 5,
          maximum: 480,
        },
        requiredService: {
          type: 'string',
          description: 'For searchMode=by_metadata: filter by required service (e.g., "openai", "slack")',
        },
        targetAudience: {
          type: 'string',
          description: 'For searchMode=by_metadata: filter by target audience (e.g., "developers", "marketers")',
        },
        // Common pagination
        limit: {
          type: 'number',
          description: 'Maximum number of results. Default 20.',
          default: 20,
          minimum: 1,
          maximum: 100,
        },
        offset: {
          type: 'number',
          description: 'Pagination offset. Default 0.',
          default: 0,
          minimum: 0,
        },
      },
    },
    annotations: {
      title: 'Search Templates',
      readOnlyHint: true,
      idempotentHint: true,
    },
  },
  {
    name: 'n8n_deploy_template',
    description: `Deploy a workflow template from n8n.io directly to your n8n instance. Deploys first, then auto-fixes common issues (expression format, typeVersions). Returns workflow ID, required credentials, and fixes applied.`,
    inputSchema: {
      type: 'object',
      properties: {
        templateId: {
          type: 'number',
          description: 'Template ID from n8n.io (required)'
        },
        name: {
          type: 'string',
          description: 'Custom workflow name (default: template name)'
        },
        autoUpgradeVersions: {
          type: 'boolean',
          default: true,
          description: 'Automatically upgrade node typeVersions to latest supported (default: true)'
        },
        autoFix: {
          type: 'boolean',
          default: true,
          description: 'Auto-apply fixes after deployment for expression format issues, missing = prefix, etc. (default: true)'
        },
        stripCredentials: {
          type: 'boolean',
          default: true,
          description: 'Remove credential references from nodes - user configures in n8n UI (default: true)'
        }
      },
      required: ['templateId']
    },
    annotations: {
      title: 'Deploy Template',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
];
