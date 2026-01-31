/**
 * Tag Handlers
 * Handlers for tag management tools
 */

import { ToolHandler, ToolResponse } from '../types/index.js';
import { getApiClient } from '../services/n8n-api-client.js';

export const listTagsHandler: ToolHandler = async (_args: {}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const tags = await client.listTags();

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          count: tags.length,
          data: tags,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error listing tags: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const createTagHandler: ToolHandler = async (args: {
  name: string;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const tag = await client.createTag(args.name);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          tagId: tag.id,
          name: tag.name,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt,
          message: `Tag "${tag.name}" created successfully with ID: ${tag.id}`,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error creating tag: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const deleteTagHandler: ToolHandler = async (args: {
  id: string;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    await client.deleteTag(args.id);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          tagId: args.id,
          message: `Tag ${args.id} deleted successfully`,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error deleting tag: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};

export const updateTagHandler: ToolHandler = async (args: {
  id: string;
  name: string;
}): Promise<ToolResponse> => {
  try {
    const client = getApiClient();
    const tag = await client.updateTag(args.id, args.name);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          tagId: tag.id,
          name: tag.name,
          updatedAt: tag.updatedAt,
          message: `Tag "${tag.name}" updated successfully`,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error updating tag: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};
