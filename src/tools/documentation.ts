/**
 * Documentation Tools
 * Tool for accessing documentation about other tools
 */

import { ToolWithAnnotations } from '../types/index.js';

export const documentationTools: ToolWithAnnotations[] = [
  {
    name: 'tools_documentation',
    description: `Get documentation for n8n MCP tools. Call without parameters for quick start guide. Use topic parameter to get documentation for specific tools. Use depth='full' for comprehensive documentation.`,
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Tool name (e.g., "search_nodes") or "overview" for general guide. Leave empty for quick reference.',
        },
        depth: {
          type: 'string',
          enum: ['essentials', 'full'],
          description: 'Level of detail. "essentials" (default) for quick reference, "full" for comprehensive docs.',
          default: 'essentials',
        },
      },
    },
    annotations: {
      title: 'Tools Documentation',
      readOnlyHint: true,
      idempotentHint: true,
    },
  },
];
