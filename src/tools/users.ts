/**
 * User Management Tools
 * Tools for managing n8n users
 */

import { ToolWithAnnotations } from '../types/index.js';

export const userTools: ToolWithAnnotations[] = [
  {
    name: 'n8n_list_users',
    description: `n8n_list_users: Retrieve all users from n8n instance.
Why: External data source; provides user inventory for access management and collaboration.
Use when: "show users"; "list all users"; "who has access"; "get users"; managing permissions.
Avoid: creating users; modifying users; when user list is already known.
Inputs: none.
Returns: data[](array)=list of users with id, email, firstName, lastName, createdAt, updatedAt, isPending; count(number)=total users.
Prompts->call: "Show me all users" -> {}; "List users" -> {}; "Who has access" -> {}
On error: 401 -> check N8N_API_KEY env var; 403 -> insufficient permissions; 500 -> retry or check n8n instance health`,
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: {
      title: 'List Users',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'n8n_get_user',
    description: `n8n_get_user: Get detailed information about a specific user.
Why: External data source; retrieves user details for management and verification.
Use when: "get user details"; "user info"; "who is user"; "check user"; verifying user access.
Avoid: listing all users; creating users; when user ID is unknown.
Inputs: id(string, req)=user ID to retrieve.
Returns: id(string)=user ID; email(string)=user email; firstName(string)=first name; lastName(string)=last name; createdAt(string)=creation timestamp; updatedAt(string)=update timestamp; isPending(boolean)=pending status.
Prompts->call: "Get user abc123" -> { id: "abc123" }; "User info for xyz" -> { id: "xyz" }; "Details of user 123" -> { id: "123" }
On error: 404 -> user not found; 401 -> check N8N_API_KEY env var; 403 -> insufficient permissions`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          minLength: 1,
          description: 'ID of the user to retrieve (required)',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
    annotations: {
      title: 'Get User',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
];
