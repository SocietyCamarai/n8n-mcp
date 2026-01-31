/**
 * User Handlers
 * Handlers for user management tools
 */

import { ToolHandler, ToolResponse } from '../types/index.js';
import { getApiClient } from '../services/n8n-api-client.js';

export const listUsersHandler: ToolHandler = async (_args: {}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const users = await client.listUsers();

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          count: users.length,
          data: users,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error listing users: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const getUserHandler: ToolHandler = async (args: {
  id: string;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const user = await client.getUser(args.id);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          user,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error getting user: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};
