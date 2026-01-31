/**
 * Credential Management Tools
 * Tools for creating, updating, and deleting credentials
 */

import { ToolWithAnnotations } from '../types/index.js';

export const credentialTools: ToolWithAnnotations[] = [
  {
    name: 'n8n_create_credential',
    description: `n8n_create_credential: Create a new credential for external services (API keys, OAuth, etc.).
Why: Side-effect; stores auth credentials securely in n8n for use in workflows.
Use when: "create credential"; "add API key"; "setup auth"; "new credential for X"; configuring node authentication.
Avoid: creating duplicate credentials; simulation/dry-run; storing plaintext secrets in prompts.
Inputs: name(string, req)=display name; type(string, req)=credential type (e.g., "openAiApi", "slackApi", "githubApi"); data(object, req)=credential fields (get schema first with n8n_get_credential_schema).
Returns: id(string)=credential ID; name(string)=name; type(string)=type; createdAt(string)=timestamp.
Prompts->call: "Create OpenAI credential" -> { name: "OpenAI Production", type: "openAiApi", data: { apiKey: "sk-..." } }; "Add Slack credential" -> { name: "Slack Bot", type: "slackApi", data: { accessToken: "xoxb-..." } }
On error: 400 -> invalid type or missing required fields; 401 -> check N8N_API_KEY; 409 -> credential name exists`,
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Display name for the credential (e.g., "OpenAI Production", "Slack Bot")'
        },
        type: {
          type: 'string',
          description: 'Credential type identifier (e.g., "openAiApi", "slackApi", "githubApi", "googleOAuth2Api")'
        },
        data: {
          type: 'object',
          description: 'Credential data object with required fields. Call n8n_get_credential_schema first to see required fields for this type'
        }
      },
      required: ['name', 'type', 'data']
    },
    annotations: {
      title: 'Create Credential',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'n8n_update_credential',
    description: `n8n_update_credential: Update an existing credential's name, type, or data.
Why: Side-effect; modifies stored credentials without recreating workflows.
Use when: "update credential"; "change API key"; "rotate credentials"; "edit credential X"; updating expired tokens.
Avoid: changing credential type if workflows depend on it; simulation/dry-run; partial updates without id.
Inputs: id(string, req)=credential ID; name(string, opt)=new display name; type(string, opt)=new type; data(object, opt)=new credential data (merges with existing).
Returns: id(string)=credential ID; name(string)=updated name; type(string)=type; updatedAt(string)=timestamp.
Prompts->call: "Update credential abc123 name to Production" -> { id: "abc123", name: "Production" }; "Rotate API key for cred xyz" -> { id: "xyz", data: { apiKey: "new-key" } }
On error: 404 -> credential not found; 400 -> invalid type or data; 401 -> check N8N_API_KEY`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Credential ID to update (required)'
        },
        name: {
          type: 'string',
          description: 'New display name for the credential'
        },
        type: {
          type: 'string',
          description: 'New credential type (e.g., "openAiApi", "slackApi")'
        },
        data: {
          type: 'object',
          description: 'New credential data object (merges with existing data)'
        }
      },
      required: ['id']
    },
    annotations: {
      title: 'Update Credential',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  {
    name: 'n8n_delete_credential',
    description: `n8n_delete_credential: Permanently delete a credential by ID.
Why: Side-effect; removes stored credentials and breaks workflows using them.
Use when: "delete credential"; "remove credential"; "cleanup old credentials"; rotating credentials (delete old after creating new).
Avoid: deleting credentials still in use by workflows; without confirming ID; simulation/dry-run.
Inputs: id(string, req)=credential ID to delete.
Returns: success(boolean)=true if deleted; id(string)=deleted credential ID; message(string)=confirmation.
Prompts->call: "Delete credential abc123" -> { id: "abc123" }; "Remove old Slack credential" -> { id: "xyz789" }
On error: 404 -> credential not found; 400 -> credential in use by workflows; 401 -> check N8N_API_KEY`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Credential ID to delete (required)'
        }
      },
      required: ['id']
    },
    annotations: {
      title: 'Delete Credential',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'n8n_get_credential_schema',
    description: `n8n_get_credential_schema: Get required fields and schema for a credential type.
Why: External data; tells you exactly what fields to provide when creating credentials.
Use when: "what fields for credential"; "credential schema"; "how to create X credential"; before n8n_create_credential.
Avoid: after credential already created; when you know the schema; listing all credentials.
Inputs: credentialTypeName(string, req)=credential type (e.g., "openAiApi", "slackApi", "githubApi").
Returns: name(string)=type name; displayName(string)=human name; properties[](array)=required fields with name, type, required, description; fieldNames[](array)=list of field names for quick reference.
Prompts->call: "Schema for OpenAI credential" -> { credentialTypeName: "openAiApi" }; "What fields for Slack?" -> { credentialTypeName: "slackApi" }; "GitHub credential schema" -> { credentialTypeName: "githubApi" }
On error: 404 -> unknown credential type; 401 -> check N8N_API_KEY`,
    inputSchema: {
      type: 'object',
      properties: {
        credentialTypeName: {
          type: 'string',
          description: 'Credential type name (e.g., "openAiApi", "slackApi", "githubApi", "googleOAuth2Api", "postgres")'
        }
      },
      required: ['credentialTypeName']
    },
    annotations: {
      title: 'Get Credential Schema',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: 'n8n_transfer_credential',
    description: `n8n_transfer_credential: Move a credential to a different project.
Why: Side-effect; reorganizes credentials for access control and team management.
Use when: "transfer credential"; "move credential to project"; "share credential with team"; reorganizing access.
Avoid: transferring to same project; without destination project ID; simulation/dry-run.
Inputs: id(string, req)=credential ID to transfer; destinationProjectId(string, req)=target project ID.
Returns: id(string)=credential ID; destinationProjectId(string)=new project; message(string)=confirmation.
Prompts->call: "Transfer credential abc123 to project xyz" -> { id: "abc123", destinationProjectId: "xyz" }; "Move credential to team project" -> { id: "cred-id", destinationProjectId: "team-project-id" }
On error: 404 -> credential or project not found; 403 -> insufficient permissions; 401 -> check N8N_API_KEY`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Credential ID to transfer (required)'
        },
        destinationProjectId: {
          type: 'string',
          description: 'Destination project ID where credential will be moved (required)'
        }
      },
      required: ['id', 'destinationProjectId']
    },
    annotations: {
      title: 'Transfer Credential',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
];
