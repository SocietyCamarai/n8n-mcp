/**
 * Audit Tools
 * Tools for generating n8n audit reports
 */

import { ToolWithAnnotations } from '../types/index.js';

export const auditTools: ToolWithAnnotations[] = [
  {
    name: 'n8n_generate_audit',
    description: `n8n_generate_audit: Generate security and risk audit report for n8n instance.
Why: External data source; provides security insights, credential risks, and compliance information.
Use when: "audit n8n"; "security report"; "check credentials"; "risk assessment"; "security scan"; compliance check.
Avoid: frequent audits (cache results); simulation/dry-run; when audit was recently run.
Inputs: none.
Returns: risk(string)=overall risk level (low/medium/high/critical); sections[](array)=audit sections with title, description, recommendation, location[](array)=affected items with kind, id, name.
Prompts->call: "Generate audit report" -> {}; "Security audit" -> {}; "Check credentials risk" -> {}; "Run audit" -> {}
On error: 401 -> check N8N_API_KEY env var; 500 -> retry or check n8n instance health`,
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: {
      title: 'Generate Audit Report',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
];
