/**
 * Workflow Management Tools
 * Tools for creating, updating, deleting, and managing workflows
 */

import { ToolWithAnnotations } from '../types/index.js';

export const workflowManagementTools: ToolWithAnnotations[] = [
  // Workflow CRUD
  {
    name: 'n8n_create_workflow',
    description: `n8n_create_workflow: Create a new workflow in n8n instance.
Why: External API call required; cannot create workflows via text alone.
Use when: "create workflow"; "new automation"; "build n8n flow"; "add workflow"; "deploy workflow".
Avoid: updating existing workflows (use n8n_update_* instead); partial/incomplete workflow definitions.
Inputs: name(string, req, non-empty); nodes(array, req, min=1) with id/name/type/typeVersion/position/parameters; connections(object, req); settings(object, opt).
Returns: workflowId(string)=new workflow ID; name(string)=created name; message(string)=confirmation.
Prompts->call: "Create a workflow named Test" -> { name: "Test", nodes: [...], connections: {...} }; "Build webhook flow" -> { name: "Webhook Flow", nodes: [...], connections: {...} }
On error: 401 -> check N8N_API_KEY; 400 -> verify nodes/connections format`,
    inputSchema: {
      type: 'object',
      properties: {
        name: { 
          type: 'string', 
          description: 'Workflow name (required)' 
        },
        nodes: { 
          type: 'array', 
          description: 'Array of workflow nodes. Each node must have: id, name, type, typeVersion, position, and parameters',
          items: {
            type: 'object',
            required: ['id', 'name', 'type', 'typeVersion', 'position', 'parameters'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              typeVersion: { type: 'number' },
              position: { 
                type: 'array',
                items: { type: 'number' },
                minItems: 2,
                maxItems: 2
              },
              parameters: { type: 'object' },
              credentials: { type: 'object' },
              disabled: { type: 'boolean' },
              notes: { type: 'string' },
              continueOnFail: { type: 'boolean' },
              retryOnFail: { type: 'boolean' },
              maxTries: { type: 'number' },
              waitBetweenTries: { type: 'number' }
            }
          }
        },
        connections: {
          type: 'object',
          description: 'Workflow connections object. Keys are source node names (the name field, not id), values define output connections'
        },
        settings: {
          type: 'object',
          description: 'Optional workflow settings (execution order, timezone, error handling)',
          properties: {
            executionOrder: { type: 'string', enum: ['v0', 'v1'] },
            timezone: { type: 'string' },
            saveDataErrorExecution: { type: 'string', enum: ['all', 'none'] },
            saveDataSuccessExecution: { type: 'string', enum: ['all', 'none'] },
            saveManualExecutions: { type: 'boolean' },
            saveExecutionProgress: { type: 'boolean' },
            executionTimeout: { type: 'number' },
            errorWorkflow: { type: 'string' }
          }
        }
      },
      required: ['name', 'nodes', 'connections']
    },
    annotations: {
      title: 'Create Workflow',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'n8n_get_workflow',
    description: `n8n_get_workflow: Retrieve workflow by ID with configurable detail level.
Why: External API required to fetch workflow data; cannot guess workflow content.
Use when: "get workflow"; "show workflow"; "fetch workflow"; "view workflow details"; "check workflow structure".
Avoid: listing all workflows (use n8n_list_workflows); modifying workflows (use update tools).
Inputs: id(string, req, workflow ID); mode(enum:full|details|structure|minimal, opt, default=full).
Returns: workflow data varying by mode - full=complete object, structure=nodes+connections only, minimal=id/name/active/tags.
Prompts->call: "Get workflow abc123" -> { id: "abc123" }; "Show structure of workflow xyz" -> { id: "xyz", mode: "structure" }
On error: 404 -> verify workflow ID exists; 401 -> check N8N_API_KEY`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Workflow ID'
        },
        mode: {
          type: 'string',
          enum: ['full', 'details', 'structure', 'minimal'],
          default: 'full',
          description: 'Detail level: full=complete workflow, details=full+execution stats, structure=nodes/connections topology, minimal=metadata only'
        }
      },
      required: ['id']
    },
    annotations: {
      title: 'Get Workflow',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'n8n_update_full_workflow',
    description: `n8n_update_full_workflow: Replace entire workflow with new complete definition.
Why: External API call required; full replacement ensures consistency.
Use when: "update workflow completely"; "replace workflow"; "overwrite workflow"; "full workflow update".
Avoid: partial updates (use n8n_update_partial_workflow); updating single fields only.
Inputs: id(string, req, workflow ID); name(string, opt); nodes(array, opt, complete replacement); connections(object, opt, complete replacement); settings(object, opt).
Returns: workflowId(string)=updated ID; name(string)=new name; message(string)=confirmation.
Prompts->call: "Update workflow abc123 completely" -> { id: "abc123", nodes: [...], connections: {...} }; "Rename workflow xyz" -> { id: "xyz", name: "New Name" }
On error: 404 -> verify workflow ID; 400 -> check nodes/connections format`,
    inputSchema: {
      type: 'object',
      properties: {
        id: { 
          type: 'string', 
          description: 'Workflow ID to update' 
        },
        name: { 
          type: 'string', 
          description: 'New workflow name' 
        },
        nodes: { 
          type: 'array', 
          description: 'Complete array of workflow nodes (required if modifying workflow structure)',
          items: {
            type: 'object',
            additionalProperties: true
          }
        },
        connections: { 
          type: 'object', 
          description: 'Complete connections object (required if modifying workflow structure)' 
        },
        settings: { 
          type: 'object', 
          description: 'Workflow settings to update' 
        }
      },
      required: ['id']
    },
    annotations: {
      title: 'Update Full Workflow',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'n8n_update_partial_workflow',
    description: `n8n_update_partial_workflow: Apply incremental changes to existing workflow using diff operations.
Why: External API required; enables surgical updates without full workflow replacement.
Use when: "add node to workflow"; "remove node"; "update workflow partially"; "modify workflow"; "enable/disable node".
Avoid: complete workflow replacement (use n8n_update_full_workflow); creating new workflows.
Inputs: id(string, req, workflow ID); operations(array, req) with type:addNode|removeNode|updateNode|moveNode|enableNode|disableNode|addConnection|removeConnection|updateName|updateSettings|addTag|removeTag; validateOnly(boolean, opt); continueOnError(boolean, opt).
Returns: applied(number)=operations applied; failed(number)=operations failed; operations(array)=details; message(string)=summary.
Prompts->call: "Add a node to workflow abc" -> { id: "abc", operations: [{type: "addNode", node: {...}}] }; "Disable node X in workflow xyz" -> { id: "xyz", operations: [{type: "disableNode", nodeName: "X"}] }
On error: 404 -> verify workflow ID; 400 -> check operation format`,
    inputSchema: {
      type: 'object',
      additionalProperties: true,
      properties: {
        id: { 
          type: 'string', 
          description: 'Workflow ID to update' 
        },
        operations: {
          type: 'array',
          description: 'Array of diff operations to apply. Each operation must have a "type" field and relevant properties for that operation type.',
          items: {
            type: 'object',
            additionalProperties: true
          }
        },
        validateOnly: {
          type: 'boolean',
          description: 'If true, only validate operations without applying them'
        },
        continueOnError: {
          type: 'boolean',
          description: 'If true, apply valid operations even if some fail (best-effort mode). Returns applied and failed operation indices. Default: false (atomic)'
        }
      },
      required: ['id', 'operations']
    },
    annotations: {
      title: 'Update Partial Workflow',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'n8n_delete_workflow',
    description: `n8n_delete_workflow: Permanently delete a workflow from n8n instance.
Why: External API call required for destructive operation; irreversible action.
Use when: "delete workflow"; "remove workflow"; "destroy workflow"; "cleanup old workflows".
Avoid: deleting active workflows (deactivate first); deleting without confirmation; accidental deletions.
Inputs: id(string, req, workflow ID to delete).
Returns: success(boolean)=true; workflowId(string)=deleted ID; message(string)=confirmation.
Prompts->call: "Delete workflow abc123" -> { id: "abc123" }; "Remove workflow xyz" -> { id: "xyz" }
On error: 404 -> workflow already deleted or ID invalid; 401 -> check N8N_API_KEY`,
    inputSchema: {
      type: 'object',
      properties: {
        id: { 
          type: 'string', 
          description: 'Workflow ID to delete' 
        }
      },
      required: ['id']
    },
    annotations: {
      title: 'Delete Workflow',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'n8n_list_workflows',
    description: `n8n_list_workflows: List all workflows with minimal metadata for pagination.
Why: External API required to enumerate workflows; cannot list without API access.
Use when: "list workflows"; "show all workflows"; "get workflows"; "browse workflows"; "find workflows".
Avoid: getting full workflow details (use n8n_get_workflow); searching by complex criteria.
Inputs: limit(number, opt, 1-100, default=100); cursor(string, opt, pagination); active(boolean, opt, filter); tags(array, opt, filter); projectId(string, opt, enterprise); excludePinnedData(boolean, opt).
Returns: data(array)=workflows with id/name/active/tags/createdAt/updatedAt; nextCursor(string|null)=pagination token.
Prompts->call: "List all workflows" -> {}; "Show active workflows" -> { active: true }; "Get next page" -> { cursor: "abc123" }
On error: 401 -> check N8N_API_KEY; verify pagination cursor validity`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: { 
          type: 'number', 
          description: 'Number of workflows to return (1-100, default: 100)' 
        },
        cursor: { 
          type: 'string', 
          description: 'Pagination cursor from previous response' 
        },
        active: { 
          type: 'boolean', 
          description: 'Filter by active status' 
        },
        tags: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Filter by tags (exact match)' 
        },
        projectId: { 
          type: 'string', 
          description: 'Filter by project ID (enterprise feature)' 
        },
        excludePinnedData: {
          type: 'boolean',
          description: 'Exclude pinned data from response (default: true)'
        }
      }
    },
    annotations: {
      title: 'List Workflows',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  
  // Workflow Validation & Autofix
  {
    name: 'n8n_validate_workflow',
    description: `n8n_validate_workflow: Validate workflow structure, nodes, connections, and expressions for errors.
Why: External validation required; cannot detect workflow issues by inspection alone.
Use when: "validate workflow"; "check workflow"; "verify workflow"; "find workflow errors"; "debug workflow".
Avoid: assuming workflow is valid without checking; validating non-existent workflows.
Inputs: id(string, req, workflow ID); options(object, opt) with validateNodes(boolean), validateConnections(boolean), validateExpressions(boolean), profile(enum:minimal|runtime|ai-friendly|strict).
Returns: valid(boolean)=true if no errors; summary(object)=nodeCount/triggerNodes/errorCount/warningCount; errors(array)=validation issues; warnings(array)=potential issues.
Prompts->call: "Validate workflow abc123" -> { id: "abc123" }; "Check workflow with strict profile" -> { id: "xyz", options: { profile: "strict" } }
On error: 404 -> verify workflow ID exists; check options format`,
    inputSchema: {
      type: 'object',
      properties: {
        id: { 
          type: 'string', 
          description: 'Workflow ID to validate' 
        },
        options: {
          type: 'object',
          description: 'Validation options',
          properties: {
            validateNodes: { 
              type: 'boolean', 
              description: 'Validate node configurations (default: true)' 
            },
            validateConnections: { 
              type: 'boolean', 
              description: 'Validate workflow connections (default: true)' 
            },
            validateExpressions: { 
              type: 'boolean', 
              description: 'Validate n8n expressions (default: true)' 
            },
            profile: {
              type: 'string',
              enum: ['minimal', 'runtime', 'ai-friendly', 'strict'],
              description: 'Validation profile to use (default: runtime)'
            }
          }
        }
      },
      required: ['id']
    },
    annotations: {
      title: 'Validate Workflow',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'n8n_autofix_workflow',
    description: `n8n_autofix_workflow: Automatically detect and fix common workflow validation errors.
Why: External API processing required; applies automated corrections to workflow structure.
Use when: "fix workflow"; "autofix workflow"; "repair workflow"; "correct workflow errors"; "auto-correct workflow".
Avoid: applying fixes without preview first; fixing workflows with critical errors.
Inputs: id(string, req, workflow ID); applyFixes(boolean, opt, default=false, preview mode); fixTypes(array, opt) of expression-format|typeversion-correction|error-output-config|node-type-correction|webhook-missing-path|typeversion-upgrade|version-migration; confidenceThreshold(enum:high|medium|low, opt); maxFixes(number, opt).
Returns: fixesFound(number)=total issues; fixesApplied(number)=if applyFixes=true; fixes(array)=details with type/node/issue/fix/confidence; message(string)=summary.
Prompts->call: "Check workflow abc123 for issues" -> { id: "abc123" }; "Fix workflow xyz" -> { id: "xyz", applyFixes: true }
On error: 404 -> verify workflow ID; 400 -> check fixTypes format`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Workflow ID to fix'
        },
        applyFixes: {
          type: 'boolean',
          description: 'Apply fixes to workflow (default: false - preview mode)'
        },
        fixTypes: {
          type: 'array',
          description: 'Types of fixes to apply (default: all)',
          items: {
            type: 'string',
            enum: ['expression-format', 'typeversion-correction', 'error-output-config', 'node-type-correction', 'webhook-missing-path', 'typeversion-upgrade', 'version-migration']
          }
        },
        confidenceThreshold: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'Minimum confidence level for fixes (default: medium)'
        },
        maxFixes: {
          type: 'number',
          description: 'Maximum number of fixes to apply (default: 50)'
        }
      },
      required: ['id']
    },
    annotations: {
      title: 'Autofix Workflow',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  
  // Workflow Versions
  {
    name: 'n8n_workflow_versions',
    description: `n8n_workflow_versions: Manage workflow version history with list/get/rollback/delete/prune/truncate operations.
Why: External API required for version control operations; manages workflow history.
Use when: "list workflow versions"; "rollback workflow"; "restore previous version"; "delete versions"; "prune old versions".
Avoid: truncating all versions without confirmation; rolling back without validating target version.
Inputs: mode(enum:list|get|rollback|delete|prune|truncate, req); workflowId(string, opt, required for list/rollback/delete/prune); versionId(number, opt, for get/rollback/delete); limit(number, opt, for list); validateBefore(boolean, opt, for rollback); deleteAll(boolean, opt, for delete); maxVersions(number, opt, for prune); confirmTruncate(boolean, opt, required for truncate).
Returns: varies by mode - list=array of versions, get=version details, rollback=confirmation, delete=confirmation, prune=stats, truncate=confirmation.
Prompts->call: "List versions of workflow abc" -> { mode: "list", workflowId: "abc" }; "Rollback workflow xyz to version 5" -> { mode: "rollback", workflowId: "xyz", versionId: 5 }
On error: 404 -> verify workflow/version ID; 403 -> check permissions for truncate`,
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['list', 'get', 'rollback', 'delete', 'prune', 'truncate'],
          description: 'Operation mode'
        },
        workflowId: {
          type: 'string',
          description: 'Workflow ID (required for list, rollback, delete, prune)'
        },
        versionId: {
          type: 'number',
          description: 'Version ID (required for get mode and single version delete, optional for rollback)'
        },
        limit: {
          type: 'number',
          default: 10,
          description: 'Max versions to return in list mode'
        },
        validateBefore: {
          type: 'boolean',
          default: true,
          description: 'Validate workflow structure before rollback'
        },
        deleteAll: {
          type: 'boolean',
          default: false,
          description: 'Delete all versions for workflow (delete mode only)'
        },
        maxVersions: {
          type: 'number',
          default: 10,
          description: 'Keep N most recent versions (prune mode only)'
        },
        confirmTruncate: {
          type: 'boolean',
          default: false,
          description: 'REQUIRED: Must be true to truncate all versions (truncate mode only)'
        }
      },
      required: ['mode']
    },
    annotations: {
      title: 'Workflow Versions',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: true,
    },
  },
  
  // Workflow Testing
  {
    name: 'n8n_test_workflow',
    description: `n8n_test_workflow: Test or trigger workflow execution via webhook, form, or chat trigger.
Why: External API call required to execute workflows; validates trigger configuration.
Use when: "test workflow"; "trigger workflow"; "execute workflow"; "run workflow"; "debug workflow execution".
Avoid: testing workflows without trigger nodes; testing in production without validation.
Inputs: workflowId(string, req); triggerType(enum:webhook|form|chat, opt, auto-detected); httpMethod(enum:GET|POST|PUT|DELETE, opt, for webhook); webhookPath(string, opt); message(string, opt, for chat); sessionId(string, opt, for chat); data(object, opt, payload); headers(object, opt); timeout(number, opt, default=120000); waitForResponse(boolean, opt, default=true).
Returns: triggerInfo(object)=execution details; webhookUrl(string)=if applicable; message(string)=confirmation.
Prompts->call: "Test workflow abc123" -> { workflowId: "abc123" }; "Trigger webhook workflow xyz with POST" -> { workflowId: "xyz", triggerType: "webhook", httpMethod: "POST" }
On error: 404 -> verify workflow ID and trigger node exists; 400 -> check trigger configuration`,
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'Workflow ID to execute (required)'
        },
        triggerType: {
          type: 'string',
          enum: ['webhook', 'form', 'chat'],
          description: 'Trigger type. Auto-detected if not specified. Workflow must have a matching trigger node.'
        },
        // Webhook options
        httpMethod: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
          description: 'For webhook: HTTP method (default: from workflow config or POST)'
        },
        webhookPath: {
          type: 'string',
          description: 'For webhook: override the webhook path'
        },
        // Chat options
        message: {
          type: 'string',
          description: 'For chat: message to send (required for chat triggers)'
        },
        sessionId: {
          type: 'string',
          description: 'For chat: session ID for conversation continuity'
        },
        // Common options
        data: {
          type: 'object',
          description: 'Input data/payload for webhook, form fields, or execution data'
        },
        headers: {
          type: 'object',
          description: 'Custom HTTP headers'
        },
        timeout: {
          type: 'number',
          description: 'Timeout in ms (default: 120000)'
        },
        waitForResponse: {
          type: 'boolean',
          description: 'Wait for workflow completion (default: true)'
        }
      },
      required: ['workflowId']
    },
    annotations: {
      title: 'Test Workflow',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  
  // Executions Management
  {
    name: 'n8n_executions',
    description: `n8n_executions: Manage workflow executions with get/list/delete actions and multiple detail modes.
Why: External API required to access execution history and data; cannot retrieve without API.
Use when: "get execution"; "list executions"; "view execution details"; "delete execution"; "check execution status".
Avoid: fetching full execution data for large executions (use preview/summary modes); deleting without confirmation.
Inputs: action(enum:get|list|delete, req); id(string, opt, for get/delete); mode(enum:preview|summary|filtered|full|error, opt, for get); nodeNames(array, opt, for filtered); itemsLimit(number, opt); includeInputData(boolean, opt); errorItemsLimit(number, opt, for error mode); includeStackTrace(boolean, opt); includeExecutionPath(boolean, opt); fetchWorkflow(boolean, opt); limit(number, opt, for list); cursor(string, opt); workflowId(string, opt, for list); projectId(string, opt); status(enum:success|error|waiting, opt); includeData(boolean, opt).
Returns: varies by action - get=execution data (by mode), list=array of executions with pagination, delete=confirmation.
Prompts->call: "Get execution abc123" -> { action: "get", id: "abc123" }; "List executions for workflow xyz" -> { action: "list", workflowId: "xyz" }
On error: 404 -> verify execution ID; 400 -> check action/mode parameters`,
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['get', 'list', 'delete'],
          description: 'Operation: get=get execution details, list=list executions, delete=delete execution'
        },
        // For action='get' and action='delete'
        id: {
          type: 'string',
          description: 'Execution ID (required for action=get or action=delete)'
        },
        // For action='get' - detail level
        mode: {
          type: 'string',
          enum: ['preview', 'summary', 'filtered', 'full', 'error'],
          description: 'For action=get: preview=structure only, summary=2 items (default), filtered=custom, full=all data, error=optimized error debugging'
        },
        nodeNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'For action=get with mode=filtered: filter to specific nodes by name'
        },
        itemsLimit: {
          type: 'number',
          description: 'For action=get with mode=filtered: items per node (0=structure, 2=default, -1=unlimited)'
        },
        includeInputData: {
          type: 'boolean',
          description: 'For action=get: include input data in addition to output (default: false)'
        },
        // Error mode specific parameters
        errorItemsLimit: {
          type: 'number',
          description: 'For action=get with mode=error: sample items from upstream node (default: 2, max: 100)'
        },
        includeStackTrace: {
          type: 'boolean',
          description: 'For action=get with mode=error: include full stack trace (default: false, shows truncated)'
        },
        includeExecutionPath: {
          type: 'boolean',
          description: 'For action=get with mode=error: include execution path leading to error (default: true)'
        },
        fetchWorkflow: {
          type: 'boolean',
          description: 'For action=get with mode=error: fetch workflow for accurate upstream detection (default: true)'
        },
        // For action='list'
        limit: {
          type: 'number',
          description: 'For action=list: number of executions to return (1-100, default: 100)'
        },
        cursor: {
          type: 'string',
          description: 'For action=list: pagination cursor from previous response'
        },
        workflowId: {
          type: 'string',
          description: 'For action=list: filter by workflow ID'
        },
        projectId: {
          type: 'string',
          description: 'For action=list: filter by project ID (enterprise feature)'
        },
        status: {
          type: 'string',
          enum: ['success', 'error', 'waiting'],
          description: 'For action=list: filter by execution status'
        },
        includeData: {
          type: 'boolean',
          description: 'For action=list: include execution data (default: false)'
        }
      },
      required: ['action']
    },
    annotations: {
      title: 'Manage Executions',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: true,
    },
  },
  
  // System
  {
    name: 'n8n_health_check',
    description: `n8n_health_check: Check n8n instance health, API connectivity, and system status.
Why: External API call required; verifies n8n instance availability and configuration.
Use when: "check health"; "health check"; "verify connection"; "test n8n connection"; "diagnose issues".
Avoid: assuming connection is healthy without checking; ignoring diagnostic warnings.
Inputs: mode(enum:status|diagnostic, opt, default=status); verbose(boolean, opt, for diagnostic).
Returns: status(string)=healthy|degraded|error; n8nVersion(string); instanceId(string); features(object)=available capabilities; performance(object)=responseTimeMs/cacheHitRate; nextSteps(array)=recommendations.
Prompts->call: "Check n8n health" -> {}; "Run diagnostic" -> { mode: "diagnostic" }; "Health check with verbose output" -> { mode: "diagnostic", verbose: true }
On error: connection errors -> check N8N_API_URL and network; 401 -> verify N8N_API_KEY`,
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['status', 'diagnostic'],
          description: 'Mode: "status" (default) for quick health check, "diagnostic" for detailed debug info including env vars and tool status',
          default: 'status'
        },
        verbose: {
          type: 'boolean',
          description: 'Include extra details in diagnostic mode (default: false)'
        }
      }
    },
    annotations: {
      title: 'Health Check',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
];
