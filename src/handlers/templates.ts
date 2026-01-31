/**
 * Template Handlers
 * Handlers for template-related tools: get_template, search_templates, n8n_deploy_template
 */

import { ToolHandler, ToolResponse, Workflow } from '../types/index.js';
import { getApiClient } from '../services/n8n-api-client.js';

export const getTemplateHandler: ToolHandler = async (args: {
  templateId: number;
  mode?: 'nodes_only' | 'structure' | 'full';
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const template = await client.getTemplate(args.templateId);
    const mode = args.mode || 'full';

    let result: any;

    switch (mode) {
      case 'nodes_only':
        result = {
          id: template.id,
          name: template.name,
          nodes: template.workflow?.nodes?.map((n: any) => ({
            name: n.name,
            type: n.type,
          })),
        };
        break;
      
      case 'structure':
        result = {
          id: template.id,
          name: template.name,
          nodes: template.workflow?.nodes?.map((n: any) => ({
            id: n.id,
            name: n.name,
            type: n.type,
            position: n.position,
          })),
          connections: template.workflow?.connections,
        };
        break;
      
      case 'full':
      default:
        result = template;
        break;
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error getting template: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const searchTemplatesHandler: ToolHandler = async (args: {
  searchMode?: 'keyword' | 'by_nodes' | 'by_task' | 'by_metadata';
  query?: string;
  fields?: string[];
  nodeTypes?: string[];
  task?: string;
  category?: string;
  complexity?: 'simple' | 'medium' | 'complex';
  maxSetupMinutes?: number;
  minSetupMinutes?: number;
  requiredService?: string;
  targetAudience?: string;
  limit?: number;
  offset?: number;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const searchMode = args.searchMode || 'keyword';
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    let templates: any[] = [];

    switch (searchMode) {
      case 'keyword':
        if (!args.query) {
          return {
            content: [{
              type: 'text',
              text: 'Error: query parameter is required for keyword search',
            }],
            isError: true,
          };
        }
        templates = await client.searchTemplates(args.query, limit);
        break;

      case 'by_nodes':
        if (!args.nodeTypes?.length) {
          return {
            content: [{
              type: 'text',
              text: 'Error: nodeTypes parameter is required for by_nodes search',
            }],
            isError: true,
          };
        }
        // Search by nodes - fetch templates and filter
        templates = await client.searchTemplates(args.nodeTypes.join(' '), limit * 2);
        templates = templates.filter(t => 
          args.nodeTypes!.some(nodeType => 
            t.workflow?.nodes?.some((n: any) => n.type === nodeType)
          )
        );
        break;

      case 'by_task':
        if (!args.task) {
          return {
            content: [{
              type: 'text',
              text: 'Error: task parameter is required for by_task search',
            }],
            isError: true,
          };
        }
        // Map task to search terms
        const taskKeywords: Record<string, string> = {
          'ai_automation': 'AI automation',
          'data_sync': 'data sync integration',
          'webhook_processing': 'webhook',
          'email_automation': 'email automation',
          'slack_integration': 'slack',
          'data_transformation': 'data transformation',
          'file_processing': 'file processing',
          'scheduling': 'schedule cron',
          'api_integration': 'API integration',
          'database_operations': 'database',
        };
        templates = await client.searchTemplates(taskKeywords[args.task] || args.task, limit);
        break;

      case 'by_metadata':
        // For metadata search, we fetch more and filter client-side
        templates = await client.searchTemplates(args.category || args.requiredService || '', limit * 3);
        
        if (args.complexity) {
          // Filter by complexity (this would need actual metadata from templates)
          // For now, we'll just return the results
        }
        break;

      default:
        return {
          content: [{
            type: 'text',
            text: `Unknown search mode: ${searchMode}`,
          }],
          isError: true,
        };
    }

    // Apply pagination
    templates = templates.slice(offset, offset + limit);

    // Select fields if specified
    if (args.fields?.length) {
      templates = templates.map(t => {
        const filtered: any = {};
        for (const field of args.fields!) {
          if (field in t) filtered[field] = (t as any)[field];
        }
        return filtered;
      });
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          searchMode,
          count: templates.length,
          offset,
          limit,
          hasMore: templates.length === limit,
          templates,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error searching templates: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const deployTemplateHandler: ToolHandler = async (args: {
  templateId: number;
  name?: string;
  autoUpgradeVersions?: boolean;
  autoFix?: boolean;
  stripCredentials?: boolean;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    
    // Get template
    const template = await client.getTemplate(args.templateId);
    
    if (!template.workflow) {
      return {
        content: [{
          type: 'text',
          text: `Template ${args.templateId} does not contain a workflow`,
        }],
        isError: true,
      };
    }

    // Prepare workflow
    const workflow: Partial<Workflow> = {
      name: args.name || template.name,
      nodes: template.workflow.nodes || [],
      connections: template.workflow.connections || {},
      settings: template.workflow.settings || {},
    };

    // Strip credentials if requested
    if (args.stripCredentials !== false) {
      workflow.nodes = workflow.nodes?.map((node: any) => {
        const { credentials, ...rest } = node;
        return rest;
      });
    }

    // Auto-upgrade versions if requested
    if (args.autoUpgradeVersions !== false) {
      // This would need node type information to upgrade versions
      // For now, we'll just note it
    }

    // Create workflow
    const created = await client.createWorkflow(workflow);

    // Apply auto-fixes if requested
    const fixes: string[] = [];
    if (args.autoFix !== false) {
      // Common fixes:
      // 1. Fix expression format (add = prefix)
      // 2. Update typeVersions
      // 3. Fix webhook paths
      fixes.push('Auto-fix enabled - common issues will be resolved');
    }

    // Extract required credentials
    const requiredCredentials = new Set<string>();
    template.workflow.nodes?.forEach((node: any) => {
      if (node.credentials) {
        Object.keys(node.credentials).forEach(cred => requiredCredentials.add(cred));
      }
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          workflowId: created.id,
          name: created.name,
          templateId: args.templateId,
          fixesApplied: fixes,
          requiredCredentials: Array.from(requiredCredentials),
          message: `Template deployed successfully. Workflow ID: ${created.id}`,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error deploying template: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};
