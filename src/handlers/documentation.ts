/**
 * Documentation Handlers
 * Handler for tools_documentation tool
 */

import { ToolHandler, ToolResponse } from '../types/index.js';
import { allTools, toolCategories } from '../tools/index.js';

export const documentationHandler: ToolHandler = async (args: {
  topic?: string;
  depth?: 'essentials' | 'full';
}): Promise<ToolResponse> => {
  const topic = args.topic || 'overview';
  const depth = args.depth || 'essentials';

  if (topic === 'overview') {
    const totalTools = allTools.length;
    const categories = Object.entries(toolCategories).map(([cat, tools]) => 
      `- ${cat}: ${tools.length} tools`
    ).join('\n');

    return {
      content: [{
        type: 'text',
        text: `n8n MCP Server - Quick Start Guide

Total Tools Available: ${totalTools}

Categories:
${categories}

Quick Tips:
- Use search_nodes to find available nodes
- Use get_node to get detailed node configuration
- Use n8n_create_workflow to create new workflows
- Use n8n_list_workflows to see existing workflows
- Use tools_documentation with topic="<tool_name>" for specific tool help

For detailed documentation on any tool, call:
tools_documentation({ topic: "tool_name", depth: "full" })`,
      }],
    };
  }

  // Find the tool
  const tool = allTools.find(t => t.name === topic);
  
  if (!tool) {
    return {
      content: [{
        type: 'text',
        text: `Tool '${topic}' not found.\n\nAvailable tools:\n${allTools.map(t => `- ${t.name}`).join('\n')}`,
      }],
      isError: true,
    };
  }

  if (depth === 'essentials') {
    return {
      content: [{
        type: 'text',
        text: `${tool.name}\n\n${tool.description}\n\nInput Schema:\n${JSON.stringify(tool.inputSchema, null, 2)}`,
      }],
    };
  }

  // Full documentation
  const annotations = (tool as any).annotations;
  const outputSchema = (tool as any).outputSchema;

  let doc = `# ${tool.name}\n\n`;
  doc += `## Description\n${tool.description}\n\n`;
  
  if (annotations) {
    doc += `## Annotations\n`;
    if (annotations.title) doc += `- Title: ${annotations.title}\n`;
    if (annotations.readOnlyHint !== undefined) doc += `- Read Only: ${annotations.readOnlyHint}\n`;
    if (annotations.destructiveHint !== undefined) doc += `- Destructive: ${annotations.destructiveHint}\n`;
    if (annotations.idempotentHint !== undefined) doc += `- Idempotent: ${annotations.idempotentHint}\n`;
    if (annotations.openWorldHint !== undefined) doc += `- Open World: ${annotations.openWorldHint}\n`;
    doc += '\n';
  }

  doc += `## Input Schema\n\`\`\`json\n${JSON.stringify(tool.inputSchema, null, 2)}\n\`\`\`\n\n`;

  if (outputSchema) {
    doc += `## Output Schema\n\`\`\`json\n${JSON.stringify(outputSchema, null, 2)}\n\`\`\`\n\n`;
  }

  return {
    content: [{
      type: 'text',
      text: doc,
    }],
  };
};
