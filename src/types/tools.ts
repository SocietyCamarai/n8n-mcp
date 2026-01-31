/**
 * Tool Definition Types
 */

import { Tool as SDKTool } from '@modelcontextprotocol/sdk/types.js';

export interface ToolDefinition extends SDKTool {
  // Tool definition extends SDK Tool type
}

export interface ToolAnnotation {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface ToolWithAnnotations extends ToolDefinition {
  annotations?: ToolAnnotation;
}

export interface ToolResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
    resource?: any;
  }>;
  isError?: boolean;
  _meta?: {
    [x: string]: unknown;
    progressToken?: string | number;
  };
}

// Alias for server.ts compatibility
export type ToolResult = ToolResponse;

export type ToolHandler = (args: any) => Promise<ToolResponse>;

export interface ToolRegistry {
  [key: string]: ToolHandler;
}
