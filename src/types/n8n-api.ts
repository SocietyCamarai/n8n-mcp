// n8n API Types - Essential types for n8n MCP Server

// Resource Locator Types
export interface ResourceLocatorValue {
  __rl: true;
  value: string;
  mode: 'id' | 'url' | 'expression' | string;
}

export type ExpressionValue = string | ResourceLocatorValue;

// Workflow Node Types
export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  disabled?: boolean;
  notes?: string;
  notesInFlow?: boolean;
  continueOnFail?: boolean;
  onError?: 'continueRegularOutput' | 'continueErrorOutput' | 'stopWorkflow';
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  webhookId?: string;
}

export interface WorkflowConnection {
  [sourceNodeId: string]: {
    [outputType: string]: Array<Array<{
      node: string;
      type: string;
      index: number;
    }>>;
  };
}

export interface WorkflowSettings {
  executionOrder?: 'v0' | 'v1';
  timezone?: string;
  saveDataErrorExecution?: 'all' | 'none';
  saveDataSuccessExecution?: 'all' | 'none';
  saveManualExecutions?: boolean;
  saveExecutionProgress?: boolean;
  executionTimeout?: number;
  errorWorkflow?: string;
}

export interface Workflow {
  id?: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection;
  active?: boolean;
  isArchived?: boolean;
  settings?: WorkflowSettings;
  staticData?: Record<string, unknown>;
  tags?: string[];
  updatedAt?: string;
  createdAt?: string;
  versionId?: string;
  versionCounter?: number;
  meta?: {
    instanceId?: string;
  };
}

// Execution Types
export enum ExecutionStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  WAITING = 'waiting',
}

export interface ExecutionSummary {
  id: string;
  finished: boolean;
  mode: string;
  retryOf?: string;
  retrySuccessId?: string;
  status: ExecutionStatus;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  workflowName?: string;
  waitTill?: string;
}

export interface ExecutionData {
  startData?: Record<string, unknown>;
  resultData: {
    runData: Record<string, unknown>;
    lastNodeExecuted?: string;
    error?: Record<string, unknown>;
  };
  executionData?: Record<string, unknown>;
}

export interface Execution extends ExecutionSummary {
  data?: ExecutionData;
}

// Credential Types
export interface Credential {
  id?: string;
  name: string;
  type: string;
  data?: Record<string, unknown>;
  isGlobal?: boolean;
  isResolvable?: boolean;
  isPartialData?: boolean;
  nodesAccess?: Array<{
    nodeType: string;
    date?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// Tag Types
export interface Tag {
  id?: string;
  name: string;
  workflowIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Node Types
export interface NodeType {
  name: string;
  displayName: string;
  description?: string;
  group: string[];
  version: number | number[];
  defaults?: Record<string, unknown>;
  inputs?: string[];
  outputs?: string[];
  properties?: NodeProperty[];
  codex?: {
    categories?: string[];
    subcategories?: Record<string, string[]>;
    alias?: string[];
  };
}

export interface NodeProperty {
  name: string;
  displayName: string;
  type: string;
  default?: unknown;
  description?: string;
  options?: Array<{
    name: string;
    value: string | number | boolean;
    description?: string;
  }>;
  required?: boolean;
  readOnly?: boolean;
  noDataExpression?: boolean;
  displayOptions?: {
    show?: Record<string, unknown>;
    hide?: Record<string, unknown>;
  };
}

// Template Types
export interface Template {
  id: number;
  name: string;
  description?: string;
  author?: string;
  nodes?: string[];
  views?: number;
  createdAt?: string;
  url?: string;
  workflow?: Workflow;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore?: boolean;
}

export interface ListWorkflowsResponse extends PaginatedResponse<Workflow> {}
export interface ListExecutionsResponse extends PaginatedResponse<ExecutionSummary> {}
