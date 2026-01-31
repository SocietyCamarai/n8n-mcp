/**
 * Credential Handlers
 * Handlers for credential management tools
 */

import { ToolHandler, ToolResponse } from '../types/index.js';
import { getApiClient } from '../services/n8n-api-client.js';

export const createCredentialHandler: ToolHandler = async (args: {
  name: string;
  type: string;
  data: Record<string, any>;
  isResolvable?: boolean;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const credential = await client.createCredential({
      name: args.name,
      type: args.type,
      data: args.data,
      isResolvable: args.isResolvable,
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          credentialId: credential.id,
          name: credential.name,
          type: credential.type,
          message: `Credential "${credential.name}" created successfully`,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error creating credential: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const updateCredentialHandler: ToolHandler = async (args: {
  id: string;
  name?: string;
  type?: string;
  data?: Record<string, any>;
  isGlobal?: boolean;
  isResolvable?: boolean;
  isPartialData?: boolean;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const update: any = {};
    
    if (args.name) update.name = args.name;
    if (args.type) update.type = args.type;
    if (args.data) update.data = args.data;
    if (args.isGlobal !== undefined) update.isGlobal = args.isGlobal;
    if (args.isResolvable !== undefined) update.isResolvable = args.isResolvable;
    if (args.isPartialData !== undefined) update.isPartialData = args.isPartialData;

    const credential = await client.updateCredential(args.id, update);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          credentialId: credential.id,
          name: credential.name,
          message: `Credential "${credential.name}" updated successfully`,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error updating credential: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const deleteCredentialHandler: ToolHandler = async (args: {
  id: string;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    await client.deleteCredential(args.id);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          credentialId: args.id,
          message: `Credential ${args.id} deleted successfully`,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error deleting credential: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const getCredentialSchemaHandler: ToolHandler = async (args: {
  credentialTypeName: string;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const schema = await client.getCredentialSchema(args.credentialTypeName);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          credentialType: args.credentialTypeName,
          schema,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error getting credential schema: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const transferCredentialHandler: ToolHandler = async (args: {
  id: string;
  destinationProjectId: string;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    await client.transferCredential(args.id, args.destinationProjectId);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          credentialId: args.id,
          destinationProjectId: args.destinationProjectId,
          message: `Credential ${args.id} transferred successfully`,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error transferring credential: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};
