/**
 * Node Tools
 * Tools for searching, getting, and validating n8n nodes
 * Note: These tools work with nodes inside workflows since /node-types endpoint
 * is not available in the public n8n API
 */

import { ToolWithAnnotations } from '../types/index.js';

export const nodeTools: ToolWithAnnotations[] = [
  {
    name: 'search_nodes',
    description: `search_nodes: Search for nodes within existing workflows by type or name.
Why: External data; finds nodes in your workflows without external API dependency.
Use when: "find webhook nodes"; "search for slack nodes"; "which workflows use X"; "find all trigger nodes"; node inventory.
Avoid: creating nodes; getting node documentation; when you need node schema details.
Inputs: query(string, req)=search term (node type or name); workflowId(string, opt)=specific workflow to search; includeConfig(boolean, opt, default=false)=include node configuration.
Returns: nodes[](array)=matching nodes with workflowId, workflowName, nodeId, nodeName, nodeType; count(number)=total matches.
Prompts->call: "Find webhook nodes" -> { query: "webhook" }; "Search for OpenAI in workflow abc" -> { query: "openAi", workflowId: "abc" }; "Show me all trigger nodes" -> { query: "trigger" }
On error: 404 -> workflow not found; 401 -> check N8N_API_KEY`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term for node type or name (e.g., "webhook", "slack", "openAi")',
        },
        workflowId: {
          type: 'string',
          description: 'Optional: specific workflow ID to search within',
        },
        includeConfig: {
          type: 'boolean',
          description: 'Include full node configuration in results',
          default: false,
        },
      },
      required: ['query'],
    },
    annotations: {
      title: 'Search Nodes',
      readOnlyHint: true,
      idempotentHint: true,
    },
  },
  {
    name: 'get_node',
    description: `get_node: Get detailed information about a specific node from a workflow.
Why: External data; retrieves node configuration from existing workflows.
Use when: "get node details"; "show node config"; "what parameters does node X have"; "inspect node".
Avoid: creating nodes; validating new configurations; when workflow/node doesn't exist.
Inputs: workflowId(string, req)=workflow containing the node; nodeId(string, req)=node ID or name to retrieve.
Returns: node(object)=complete node configuration including id, name, type, typeVersion, position, parameters, credentials; workflowId(string); workflowName(string).
Prompts->call: "Get node webhook-1 from workflow abc" -> { workflowId: "abc", nodeId: "webhook-1" }; "Show config of Slack node in workflow xyz" -> { workflowId: "xyz", nodeId: "Slack" }
On error: 404 -> workflow or node not found; 401 -> check N8N_API_KEY`,
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'Workflow ID containing the node',
        },
        nodeId: {
          type: 'string',
          description: 'Node ID or name to retrieve',
        },
      },
      required: ['workflowId', 'nodeId'],
    },
    annotations: {
      title: 'Get Node Info',
      readOnlyHint: true,
      idempotentHint: true,
    },
  },
  {
    name: 'validate_node',
    description: `validate_node: Basic validation of node configuration structure.
Why: Deterministic check; validates node has required fields before creation.
Use when: "validate node config"; "check node structure"; "is this node valid"; pre-creation validation.
Avoid: detailed parameter validation; runtime validation; when node schema is unknown.
Inputs: nodeType(string, req)=node type (e.g., "n8n-nodes-base.webhook"); config(object, req)=node configuration to validate; checkRequiredFields(boolean, opt, default=true)=verify required fields exist.
Returns: valid(boolean)=true if structure is valid; errors[](array)=validation errors; warnings[](array)=warnings; requiredFields[](array)=missing required fields.
Prompts->call: "Validate webhook node config" -> { nodeType: "n8n-nodes-base.webhook", config: { path: "test" } }; "Check if this Slack config is valid" -> { nodeType: "n8n-nodes-base.slack", config: { resource: "message" } }
On error: 400 -> invalid configuration structure`,
    inputSchema: {
      type: 'object',
      properties: {
        nodeType: {
          type: 'string',
          description: 'Node type (e.g., "n8n-nodes-base.webhook", "n8n-nodes-base.slack")',
        },
        config: {
          type: 'object',
          description: 'Node configuration to validate',
        },
        checkRequiredFields: {
          type: 'boolean',
          description: 'Verify required fields exist',
          default: true,
        },
      },
      required: ['nodeType', 'config'],
    },
    annotations: {
      title: 'Validate Node Config',
      readOnlyHint: true,
      idempotentHint: true,
    },
  },
];
