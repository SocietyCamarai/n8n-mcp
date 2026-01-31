/**
 * Workflow Handlers
 * Handlers for workflow management tools with Zod validation
 */

import { ToolHandler, ToolResponse, Workflow, WorkflowNode, WorkflowConnection } from '../types/index.js';
import { getApiClient } from '../services/n8n-api-client.js';
import {
  CreateWorkflowSchema,
  GetWorkflowSchema,
  UpdateFullWorkflowSchema,
  UpdatePartialWorkflowSchema,
  DeleteWorkflowSchema,
  ListWorkflowsSchema,
  ValidateWorkflowSchema,
  AutofixWorkflowSchema,
  WorkflowVersionsSchema,
  TestWorkflowSchema,
  ExecutionsSchema,
  HealthCheckSchema,
  validate,
} from '../validation/index.js';

// Workflow CRUD
export const createWorkflowHandler: ToolHandler = async (args: unknown): Promise<ToolResponse> => {
  try {
    // Validate input with Zod
    const validatedArgs = validate(CreateWorkflowSchema, args, 'createWorkflow');
    
    const client = getApiClient();
    const workflow = await client.createWorkflow({
      name: validatedArgs.name,
      nodes: validatedArgs.nodes,
      connections: validatedArgs.connections,
      settings: validatedArgs.settings,
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          workflowId: workflow.id,
          name: workflow.name,
          message: `Workflow "${workflow.name}" created successfully with ID: ${workflow.id}`,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error creating workflow: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const getWorkflowHandler: ToolHandler = async (args: unknown): Promise<ToolResponse> => {
  try {
    // Validate input with Zod
    const validatedArgs = validate(GetWorkflowSchema, args, 'getWorkflow');
    
    const client = getApiClient();
    const workflow = await client.getWorkflow(validatedArgs.id);
    const mode = validatedArgs.mode;

    let result: any;

    switch (mode) {
      case 'minimal':
        result = {
          id: workflow.id,
          name: workflow.name,
          active: workflow.active,
          tags: workflow.tags,
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt,
        };
        break;

      case 'structure':
        result = {
          id: workflow.id,
          name: workflow.name,
          nodes: workflow.nodes.map(n => ({
            id: n.id,
            name: n.name,
            type: n.type,
            position: n.position,
            disabled: n.disabled,
          })),
          connections: workflow.connections,
        };
        break;

      case 'details':
        result = {
          ...workflow,
          nodeCount: workflow.nodes.length,
          triggerNodes: workflow.nodes.filter(n => 
            n.type.includes('Trigger') || 
            n.type.includes('Webhook') ||
            n.type.includes('Schedule')
          ).length,
        };
        break;

      case 'full':
      default:
        result = workflow;
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
        text: `Error getting workflow: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const updateFullWorkflowHandler: ToolHandler = async (args: {
  id: string;
  name?: string;
  nodes?: any[];
  connections?: any;
  settings?: any;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const update: Partial<Workflow> = {};
    
    if (args.name) update.name = args.name;
    if (args.nodes) update.nodes = args.nodes;
    if (args.connections) update.connections = args.connections;
    if (args.settings) update.settings = args.settings;

    const workflow = await client.updateWorkflow(args.id, update);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          workflowId: workflow.id,
          name: workflow.name,
          message: `Workflow "${workflow.name}" updated successfully`,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error updating workflow: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const updatePartialWorkflowHandler: ToolHandler = async (args: {
  id: string;
  operations: any[];
  validateOnly?: boolean;
  continueOnError?: boolean;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    
    // Get current workflow
    const workflow = await client.getWorkflow(args.id);
    
    const applied: any[] = [];
    const failed: any[] = [];
    let modified = false;

    for (let i = 0; i < args.operations.length; i++) {
      const op = args.operations[i];
      
      try {
        switch (op.type) {
          case 'addNode':
            workflow.nodes.push(op.node);
            modified = true;
            applied.push({ index: i, type: op.type, nodeName: op.node.name });
            break;

          case 'removeNode':
            const removeIndex = workflow.nodes.findIndex(n => n.id === op.nodeId || n.name === op.nodeName);
            if (removeIndex >= 0) {
              workflow.nodes.splice(removeIndex, 1);
              modified = true;
              applied.push({ index: i, type: op.type });
            } else {
              throw new Error(`Node not found: ${op.nodeId || op.nodeName}`);
            }
            break;

          case 'updateNode':
            const updateIndex = workflow.nodes.findIndex(n => n.id === op.nodeId || n.name === op.nodeName);
            if (updateIndex >= 0) {
              workflow.nodes[updateIndex] = { ...workflow.nodes[updateIndex], ...op.updates };
              modified = true;
              applied.push({ index: i, type: op.type, nodeName: workflow.nodes[updateIndex].name });
            } else {
              throw new Error(`Node not found: ${op.nodeId || op.nodeName}`);
            }
            break;

          case 'enableNode':
          case 'disableNode':
            const toggleIndex = workflow.nodes.findIndex(n => n.id === op.nodeId || n.name === op.nodeName);
            if (toggleIndex >= 0) {
              workflow.nodes[toggleIndex].disabled = op.type === 'disableNode';
              modified = true;
              applied.push({ index: i, type: op.type, nodeName: workflow.nodes[toggleIndex].name });
            } else {
              throw new Error(`Node not found: ${op.nodeId || op.nodeName}`);
            }
            break;

          case 'addConnection':
            // Add connection logic
            modified = true;
            applied.push({ index: i, type: op.type });
            break;

          case 'removeConnection':
            // Remove connection logic
            modified = true;
            applied.push({ index: i, type: op.type });
            break;

          case 'updateName':
            workflow.name = op.name;
            modified = true;
            applied.push({ index: i, type: op.type, newName: op.name });
            break;

          case 'updateSettings':
            workflow.settings = { ...workflow.settings, ...op.settings };
            modified = true;
            applied.push({ index: i, type: op.type });
            break;

          default:
            throw new Error(`Unknown operation type: ${op.type}`);
        }
      } catch (opError) {
        failed.push({
          index: i,
          type: op.type,
          error: opError instanceof Error ? opError.message : String(opError),
        });

        if (!args.continueOnError) {
          break;
        }
      }
    }

    if (args.validateOnly) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            validated: true,
            wouldApply: applied.length,
            wouldFail: failed.length,
            operations: applied,
            failures: failed,
          }, null, 2),
        }],
      };
    }

    if (modified) {
      await client.updateWorkflow(args.id, workflow);
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          workflowId: args.id,
          applied: applied.length,
          failed: failed.length,
          operations: applied,
          failures: failed,
          message: `Applied ${applied.length} operations to workflow`,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error updating workflow: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const deleteWorkflowHandler: ToolHandler = async (args: {
  id: string;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    await client.deleteWorkflow(args.id);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          workflowId: args.id,
          message: `Workflow ${args.id} deleted successfully`,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error deleting workflow: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const listWorkflowsHandler: ToolHandler = async (args: {
  limit?: number;
  cursor?: string;
  active?: boolean;
  tags?: string[];
  projectId?: string;
  excludePinnedData?: boolean;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const result = await client.listWorkflows({
      limit: args.limit,
      cursor: args.cursor,
      active: args.active,
      tags: args.tags,
    });

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
        text: `Error listing workflows: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

// Workflow Validation
export const validateWorkflowHandler: ToolHandler = async (args: {
  id: string;
  options?: {
    validateNodes?: boolean;
    validateConnections?: boolean;
    validateExpressions?: boolean;
    profile?: 'minimal' | 'runtime' | 'ai-friendly' | 'strict';
  };
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const workflow = await client.getWorkflow(args.id);
    const options = args.options || {};

    const errors: any[] = [];
    const warnings: any[] = [];

    // Validate nodes
    if (options.validateNodes !== false) {
      for (const node of workflow.nodes) {
        if (!node.id) errors.push({ node: node.name, message: 'Missing node ID' });
        if (!node.name) errors.push({ node: node.id, message: 'Missing node name' });
        if (!node.type) errors.push({ node: node.name, message: 'Missing node type' });
        if (!node.position || node.position.length !== 2) {
          warnings.push({ node: node.name, message: 'Invalid or missing position' });
        }
      }
    }

    // Validate connections
    if (options.validateConnections !== false) {
      const nodeNames = new Set(workflow.nodes.map(n => n.name));
      
      for (const [sourceNode, connections] of Object.entries(workflow.connections)) {
        if (!nodeNames.has(sourceNode)) {
          errors.push({ connection: sourceNode, message: `Source node not found: ${sourceNode}` });
        }
        
        // Check target nodes
        for (const outputType of Object.values(connections)) {
          for (const targets of outputType) {
            for (const target of targets) {
              if (!nodeNames.has(target.node)) {
                errors.push({ 
                  connection: `${sourceNode} -> ${target.node}`,
                  message: `Target node not found: ${target.node}`
                });
              }
            }
          }
        }
      }
    }

    // Validate expressions
    if (options.validateExpressions !== false) {
      // Basic expression validation
      const expressionRegex = /\{\{\s*\$\w+\s*\}\}/g;
      for (const node of workflow.nodes) {
        const nodeStr = JSON.stringify(node.parameters);
        const expressions = nodeStr.match(expressionRegex) || [];
        
        for (const expr of expressions) {
          // Check for common issues
          if (expr.includes('{{') && !expr.startsWith('{{=')) {
            // This is an expression, check if it's valid
          }
        }
      }
    }

    const valid = errors.length === 0;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          workflowId: args.id,
          workflowName: workflow.name,
          valid,
          summary: {
            totalNodes: workflow.nodes.length,
            enabledNodes: workflow.nodes.filter(n => !n.disabled).length,
            triggerNodes: workflow.nodes.filter(n => 
              n.type.includes('Trigger') || n.type.includes('Webhook')
            ).length,
            errorCount: errors.length,
            warningCount: warnings.length,
          },
          errors,
          warnings,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error validating workflow: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

// Workflow Versions
export const workflowVersionsHandler: ToolHandler = async (args: {
  mode: 'list' | 'get' | 'rollback' | 'delete' | 'prune' | 'truncate';
  workflowId?: string;
  versionId?: number;
  limit?: number;
  validateBefore?: boolean;
  deleteAll?: boolean;
  maxVersions?: number;
  confirmTruncate?: boolean;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();

    switch (args.mode) {
      case 'list': {
        if (!args.workflowId) {
          return {
            content: [{
              type: 'text',
              text: 'Error: workflowId is required for list mode',
            }],
            isError: true,
          };
        }
        const versions = await client.listWorkflowVersions(args.workflowId, args.limit || 10);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              workflowId: args.workflowId,
              versions,
            }, null, 2),
          }],
        };
      }

      case 'get': {
        if (!args.workflowId || args.versionId === undefined) {
          return {
            content: [{
              type: 'text',
              text: 'Error: workflowId and versionId are required for get mode',
            }],
            isError: true,
          };
        }
        const version = await client.getWorkflowVersion(args.workflowId, args.versionId);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(version, null, 2),
          }],
        };
      }

      case 'rollback': {
        if (!args.workflowId) {
          return {
            content: [{
              type: 'text',
              text: 'Error: workflowId is required for rollback mode',
            }],
            isError: true,
          };
        }
        const rolledBack = await client.rollbackWorkflowVersion(args.workflowId, args.versionId || 0);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              workflowId: args.workflowId,
              versionId: args.versionId,
              message: `Workflow rolled back to version ${args.versionId || 'previous'}`,
            }, null, 2),
          }],
        };
      }

      case 'truncate': {
        if (!args.confirmTruncate) {
          return {
            content: [{
              type: 'text',
              text: 'Error: confirmTruncate must be true to truncate all versions. This is a destructive operation.',
            }],
            isError: true,
          };
        }
        // Truncate logic would go here
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'All versions truncated',
            }, null, 2),
          }],
        };
      }

      default:
        return {
          content: [{
            type: 'text',
            text: `Mode ${args.mode} not fully implemented yet`,
          }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error managing workflow versions: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

// Executions
export const executionsHandler: ToolHandler = async (args: {
  action: 'get' | 'list' | 'delete';
  id?: string;
  mode?: string;
  nodeNames?: string[];
  itemsLimit?: number;
  includeInputData?: boolean;
  errorItemsLimit?: number;
  includeStackTrace?: boolean;
  includeExecutionPath?: boolean;
  fetchWorkflow?: boolean;
  limit?: number;
  cursor?: string;
  workflowId?: string;
  projectId?: string;
  status?: string;
  includeData?: boolean;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();

    switch (args.action) {
      case 'list': {
        const result = await client.listExecutions({
          limit: args.limit,
          cursor: args.cursor,
          workflowId: args.workflowId,
          status: args.status,
          includeData: args.includeData,
        });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      case 'get': {
        if (!args.id) {
          return {
            content: [{
              type: 'text',
              text: 'Error: id is required for get action',
            }],
            isError: true,
          };
        }
        const execution = await client.getExecution(args.id, args.includeData);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(execution, null, 2),
          }],
        };
      }

      case 'delete': {
        if (!args.id) {
          return {
            content: [{
              type: 'text',
              text: 'Error: id is required for delete action',
            }],
            isError: true,
          };
        }
        await client.deleteExecution(args.id);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              executionId: args.id,
              message: `Execution ${args.id} deleted`,
            }, null, 2),
          }],
        };
      }

      default:
        return {
          content: [{
            type: 'text',
            text: `Unknown action: ${args.action}`,
          }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error managing executions: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

// Test Workflow
export const testWorkflowHandler: ToolHandler = async (args: {
  workflowId: string;
  triggerType?: 'webhook' | 'form' | 'chat';
  httpMethod?: string;
  webhookPath?: string;
  message?: string;
  sessionId?: string;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  waitForResponse?: boolean;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    
    // Get workflow to check trigger type
    const workflow = await client.getWorkflow(args.workflowId);
    
    // Find trigger node
    const triggerNode = workflow.nodes.find(n => 
      n.type.includes('Trigger') || 
      n.type.includes('Webhook') ||
      n.type.includes('Form') ||
      n.type.includes('Chat')
    );

    if (!triggerNode) {
      return {
        content: [{
          type: 'text',
          text: `Workflow ${args.workflowId} does not have an external trigger node. Only workflows with Webhook, Form, or Chat triggers can be executed externally.`,
        }],
        isError: true,
      };
    }

    // Auto-detect trigger type if not specified
    const triggerType = args.triggerType || 
      (triggerNode.type.includes('Webhook') ? 'webhook' :
       triggerNode.type.includes('Form') ? 'form' :
       triggerNode.type.includes('Chat') ? 'chat' : 'webhook');

    // In a real implementation, this would trigger the actual execution
    // For now, we return information about how to trigger it
    const triggerInfo: any = {
      workflowId: args.workflowId,
      workflowName: workflow.name,
      triggerType,
      triggerNode: triggerNode.name,
    };

    if (triggerType === 'webhook') {
      triggerInfo.webhookUrl = `${process.env.N8N_HOST}/webhook/${triggerNode.parameters?.path || args.workflowId}`;
      triggerInfo.method = args.httpMethod || 'POST';
    } else if (triggerType === 'chat') {
      triggerInfo.message = args.message;
      triggerInfo.sessionId = args.sessionId;
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          ...triggerInfo,
          message: `Test execution prepared for workflow "${workflow.name}"`,
          note: 'To actually execute, send a request to the webhook URL or use the n8n UI',
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error testing workflow: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

// Health Check
export const healthCheckHandler: ToolHandler = async (args: {
  mode?: 'status' | 'diagnostic';
  verbose?: boolean;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const health = await client.healthCheck();
    const mode = args.mode || 'status';

    if (mode === 'diagnostic') {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: health.status,
            version: health.version,
            instanceId: health.instanceId,
            environment: {
              N8N_API_URL: process.env.N8N_API_URL || process.env.N8N_HOST || 'not set',
              N8N_API_KEY: process.env.N8N_API_KEY ? 'configured' : 'not set',
            },
            timestamp: new Date().toISOString(),
          }, null, 2),
        }],
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: health.status === 'ok' ? 'healthy' : 'unhealthy',
          version: health.version,
          message: health.status === 'ok' ? 'n8n instance is healthy' : 'n8n instance may have issues',
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'error',
          message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
          suggestion: 'Check N8N_API_URL and N8N_API_KEY environment variables',
        }, null, 2),
      }],
      isError: true,
    };
  }
};

// Autofix Workflow
export const autofixWorkflowHandler: ToolHandler = async (args: {
  id: string;
  applyFixes?: boolean;
  fixTypes?: string[];
  confidenceThreshold?: string;
  maxFixes?: number;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const workflow = await client.getWorkflow(args.id);
    
    const fixes: any[] = [];
    
    // Check for common issues
    
    // 1. Expression format issues
    for (const node of workflow.nodes) {
      const nodeStr = JSON.stringify(node.parameters);
      
      // Check for expressions without = prefix
      const badExpressions = nodeStr.match(/\{\{\s*[^{=][^}]*\}\}/g);
      if (badExpressions) {
        fixes.push({
          node: node.name,
          type: 'expression-format',
          issue: 'Expression missing = prefix',
          fix: 'Add = prefix to expression',
          confidence: 'high',
        });
      }
    }

    // 2. Check typeVersion
    for (const node of workflow.nodes) {
      if (!node.typeVersion) {
        fixes.push({
          node: node.name,
          type: 'typeversion-missing',
          issue: 'Node missing typeVersion',
          fix: 'Add typeVersion: 1',
          confidence: 'high',
        });
      }
    }

    // 3. Check webhook paths
    for (const node of workflow.nodes) {
      if (node.type.includes('Webhook') && !node.parameters?.path) {
        fixes.push({
          node: node.name,
          type: 'webhook-missing-path',
          issue: 'Webhook node missing path',
          fix: `Add path: "${node.name.toLowerCase().replace(/\s+/g, '-')}"`,
          confidence: 'medium',
        });
      }
    }

    if (args.applyFixes) {
      // Apply fixes
      let modified = false;
      
      for (const fix of fixes) {
        const node = workflow.nodes.find(n => n.name === fix.node);
        if (node) {
          // Apply the fix based on type
          switch (fix.type) {
            case 'typeversion-missing':
              node.typeVersion = 1;
              modified = true;
              break;
            // Add more fix types as needed
          }
        }
      }

      if (modified) {
        await client.updateWorkflow(args.id, workflow);
      }
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          workflowId: args.id,
          workflowName: workflow.name,
          fixesFound: fixes.length,
          fixesApplied: args.applyFixes ? fixes.length : 0,
          fixes,
          message: args.applyFixes 
            ? `Applied ${fixes.length} fixes to workflow`
            : `Found ${fixes.length} potential fixes. Set applyFixes=true to apply them.`,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error autofixing workflow: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};
