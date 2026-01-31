/**
 * Node Handlers
 * Handlers for node-related tools: search_nodes, get_node, validate_node
 * These work with nodes inside workflows since /node-types is not available
 */

import { ToolHandler, ToolResponse } from '../types/index.js';
import { getApiClient } from '../services/n8n-api-client.js';

export const searchNodesHandler: ToolHandler = async (args: {
  query: string;
  workflowId?: string;
  includeConfig?: boolean;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const query = args.query.toLowerCase();
    
    let workflows: any[] = [];
    
    if (args.workflowId) {
      // Search in specific workflow
      const workflow = await client.getWorkflow(args.workflowId);
      workflows = [workflow];
    } else {
      // Search in all workflows (limit to first 100)
      const result = await client.listWorkflows({ limit: 100 });
      workflows = result.data;
    }
    
    const matchingNodes: any[] = [];
    
    for (const workflow of workflows) {
      if (!workflow.nodes) continue;
      
      for (const node of workflow.nodes) {
        const nodeName = (node.name || '').toLowerCase();
        const nodeType = (node.type || '').toLowerCase();
        
        if (nodeName.includes(query) || nodeType.includes(query)) {
          const nodeInfo: any = {
            workflowId: workflow.id,
            workflowName: workflow.name,
            nodeId: node.id,
            nodeName: node.name,
            nodeType: node.type,
          };
          
          if (args.includeConfig) {
            nodeInfo.config = node;
          }
          
          matchingNodes.push(nodeInfo);
        }
      }
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          query: args.query,
          count: matchingNodes.length,
          nodes: matchingNodes,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error searching nodes: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const getNodeHandler: ToolHandler = async (args: {
  workflowId: string;
  nodeId: string;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const workflow = await client.getWorkflow(args.workflowId);
    
    if (!workflow.nodes) {
      return {
        content: [{
          type: 'text',
          text: `Workflow ${args.workflowId} has no nodes`,
        }],
        isError: true,
      };
    }
    
    // Find node by ID or name
    const node = workflow.nodes.find((n: any) => 
      n.id === args.nodeId || n.name === args.nodeId
    );
    
    if (!node) {
      return {
        content: [{
          type: 'text',
          text: `Node "${args.nodeId}" not found in workflow ${args.workflowId}`,
        }],
        isError: true,
      };
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          workflowId: workflow.id,
          workflowName: workflow.name,
          node,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error getting node: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const validateNodeHandler: ToolHandler = async (args: {
  nodeType: string;
  config: Record<string, any>;
  checkRequiredFields?: boolean;
}): Promise<ToolResponse> => {
  try {
    const errors: string[] = [];
    const warnings: string[] = [];
    const requiredFields: string[] = [];
    
    // Basic structure validation
    if (!args.nodeType) {
      errors.push('nodeType is required');
    }
    
    if (!args.config || typeof args.config !== 'object') {
      errors.push('config must be an object');
    }
    
    // Check for common required fields based on node type patterns
    if (args.checkRequiredFields !== false) {
      // Most nodes need at least some configuration
      if (args.config && Object.keys(args.config).length === 0) {
        warnings.push('Node configuration is empty');
      }
      
      // Check for trigger nodes
      if (args.nodeType?.toLowerCase().includes('trigger')) {
        if (!args.config?.events && !args.config?.topics && !args.config?.path) {
          warnings.push('Trigger node may need events, topics, or path configuration');
        }
      }
      
      // Check for webhook nodes
      if (args.nodeType?.toLowerCase().includes('webhook')) {
        if (!args.config?.path) {
          requiredFields.push('path');
          errors.push('Webhook node requires a path');
        }
      }
    }
    
    const valid = errors.length === 0;
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          nodeType: args.nodeType,
          valid,
          errors,
          warnings,
          requiredFields,
          config: args.config,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error validating node: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};
