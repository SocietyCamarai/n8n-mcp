/**
 * Tag Management Tools
 * Tools for managing n8n tags
 */

import { ToolWithAnnotations } from '../types/index.js';

export const tagTools: ToolWithAnnotations[] = [
  {
    name: 'n8n_list_tags',
    description: `n8n_list_tags: Retrieve all tags from n8n instance.
Why: External data source; provides tag inventory for workflow organization and filtering.
Use when: "show tags"; "list all tags"; "what tags exist"; "get tags"; organizing workflows by tags.
Avoid: creating new tags; modifying tags; when tag list is already known.
Inputs: none.
Returns: data[](array)=list of tags with id, name, createdAt, updatedAt; count(number)=total tags.
Prompts->call: "Show me all tags" -> {}; "List available tags" -> {}; "What tags do I have" -> {}
On error: 401 -> check N8N_API_KEY env var; 500 -> retry or check n8n instance health`,
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: {
      title: 'List Tags',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'n8n_create_tag',
    description: `n8n_create_tag: Create a new tag in n8n.
Why: Side-effect operation; creates persistent tag for workflow organization.
Use when: "create tag"; "add new tag"; "make a tag called"; organizing workflows; categorizing.
Avoid: creating duplicate tags; creating tags without purpose; simulation/dry-run.
Inputs: name(string, req, minLength=1)=tag name to create.
Returns: id(string)=new tag ID; name(string)=tag name; createdAt(string)=creation timestamp; updatedAt(string)=update timestamp.
Prompts->call: "Create tag production" -> { name: "production" }; "Add tag urgent" -> { name: "urgent" }; "Make tag called API" -> { name: "API" }
On error: 400 -> tag name invalid or duplicate; 401 -> check N8N_API_KEY env var`,
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          description: 'Name of the tag to create (required)',
        },
      },
      required: ['name'],
      additionalProperties: false,
    },
    annotations: {
      title: 'Create Tag',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  {
    name: 'n8n_delete_tag',
    description: `n8n_delete_tag: Delete a tag from n8n instance.
Why: Side-effect operation; removes tag permanently from the system.
Use when: "delete tag"; "remove tag"; "eliminate tag"; cleaning up unused tags.
Avoid: deleting tags still in use; deleting without confirmation; simulation/dry-run.
Inputs: id(string, req)=tag ID to delete.
Returns: success(boolean)=true if deleted; message(string)=confirmation message.
Prompts->call: "Delete tag with ID abc123" -> { id: "abc123" }; "Remove tag xyz" -> { id: "xyz" }
On error: 404 -> tag not found; 401 -> check N8N_API_KEY env var; 400 -> tag in use by workflows`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          minLength: 1,
          description: 'ID of the tag to delete (required)',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
    annotations: {
      title: 'Delete Tag',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'n8n_update_tag',
    description: `n8n_update_tag: Update an existing tag's name.
Why: Side-effect operation; modifies tag name for better organization.
Use when: "rename tag"; "update tag name"; "change tag to"; correcting tag names.
Avoid: renaming to existing tag name; simulation/dry-run.
Inputs: id(string, req)=tag ID to update; name(string, req, minLength=1)=new tag name.
Returns: id(string)=tag ID; name(string)=updated name; updatedAt(string)=update timestamp.
Prompts->call: "Rename tag abc123 to production" -> { id: "abc123", name: "production" }; "Update tag xyz to urgent" -> { id: "xyz", name: "urgent" }
On error: 404 -> tag not found; 400 -> duplicate name; 401 -> check N8N_API_KEY env var`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          minLength: 1,
          description: 'ID of the tag to update (required)',
        },
        name: {
          type: 'string',
          minLength: 1,
          description: 'New name for the tag (required)',
        },
      },
      required: ['id', 'name'],
      additionalProperties: false,
    },
    annotations: {
      title: 'Update Tag',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
];
