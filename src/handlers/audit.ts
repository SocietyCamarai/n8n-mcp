/**
 * Audit Handlers
 * Handlers for audit tools
 */

import { ToolHandler, ToolResponse } from '../types/index.js';
import { getApiClient } from '../services/n8n-api-client.js';

export const generateAuditHandler: ToolHandler = async (_args: {}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const audit = await client.generateAudit();

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          risk: audit.risk,
          sections: audit.sections,
          summary: {
            totalSections: audit.sections?.length || 0,
            riskLevel: audit.risk,
          },
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error generating audit: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};
