/**
 * n8n API Client
 * Lightweight HTTP client for n8n API
 * Based on n8n-nodes-mcp-main implementation
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  Workflow,
  Execution,
  ExecutionSummary,
  Credential,
  PaginatedResponse,
  NodeType,
  Template,
} from '../types/index.js';

export interface N8nApiConfig {
  baseUrl: string;
  apiKey: string;
}

export class N8nApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'N8nApiError';
  }
}

export class N8nApiClient {
  private client: AxiosInstance;
  private config: N8nApiConfig;
  private originalBaseUrl: string;

  constructor(config: N8nApiConfig) {
    this.config = config;
    this.originalBaseUrl = config.baseUrl;
    
    // Ensure baseUrl ends with /api/v1 (like main project)
    // Handle case where user already included /api/v1
    let apiUrl = config.baseUrl;
    if (!apiUrl.endsWith('/api/v1')) {
      // Remove trailing slash if present, then add /api/v1
      apiUrl = `${apiUrl.replace(/\/$/, '')}/api/v1`;
    }

    console.error(`[n8n-mcp] Initializing API client with base URL: ${apiUrl}`);
    console.error(`[n8n-mcp] Original URL: ${config.baseUrl}`);

    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          const url = error.config?.url || 'unknown';
          
          console.error(`[n8n-mcp] API Error ${status} on ${url}:`, data);
          
          if (status === 401) {
            throw new N8nApiError('Authentication failed. Check your N8N_API_KEY.', status, data);
          } else if (status === 404) {
            throw new N8nApiError(`Resource not found: ${url}`, status, data);
          } else if (status === 422) {
            throw new N8nApiError(`Validation error: ${JSON.stringify(data)}`, status, data);
          } else {
            const errorMessage = (data as any)?.message || error.message;
            throw new N8nApiError(
              `API Error ${status}: ${errorMessage}`,
              status,
              data
            );
          }
        }
        throw new N8nApiError(`Network error: ${error.message}`);
      }
    );
  }

  // Health Check - Use /healthz endpoint (like main project)
  async healthCheck(): Promise<{ status: string; version?: string; instanceId?: string }> {
    try {
      // Try the standard healthz endpoint (available on all n8n instances)
      // The healthz endpoint is at the root, not under /api/v1
      const healthzUrl = this.originalBaseUrl.replace(/\/api\/v\d+\/?$/, '').replace(/\/$/, '') + '/healthz';
      
      console.error(`[n8n-mcp] Health check - trying: ${healthzUrl}`);

      const response = await axios.get(healthzUrl, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });

      console.error(`[n8n-mcp] Health check response: ${response.status}`);

      if (response.status === 200 && response.data?.status === 'ok') {
        return {
          status: 'ok',
          version: response.data?.version,
          instanceId: response.data?.instanceId,
        };
      }

      // If healthz doesn't work, fall back to API check
      throw new Error('healthz endpoint not available');
    } catch (error) {
      console.error(`[n8n-mcp] Health check error:`, error);
      
      // If healthz endpoint doesn't exist, try listing workflows with limit 1
      // This is a fallback for older n8n versions
      try {
        console.error(`[n8n-mcp] Trying fallback: listing workflows`);
        await this.client.get('/workflows', { params: { limit: 1 } });
        return {
          status: 'ok',
        };
      } catch (fallbackError) {
        console.error(`[n8n-mcp] Fallback also failed:`, fallbackError);
        if (fallbackError instanceof N8nApiError) {
          throw fallbackError;
        }
        throw new N8nApiError('Failed to check health');
      }
    }
  }

  // Workflows
  async listWorkflows(options: {
    limit?: number;
    cursor?: string;
    active?: boolean;
    tags?: string[];
  } = {}): Promise<PaginatedResponse<Workflow>> {
    const params: Record<string, any> = {};
    if (options.limit) params.limit = options.limit;
    if (options.cursor) params.cursor = options.cursor;
    if (options.active !== undefined) params.active = options.active;
    if (options.tags?.length) params.tags = options.tags.join(',');

    const response = await this.client.get('/workflows', { params });
    return {
      data: response.data.data || [],
      nextCursor: response.data.nextCursor,
      hasMore: response.data.nextCursor !== undefined,
    };
  }

  async getWorkflow(id: string): Promise<Workflow> {
    const response = await this.client.get(`/workflows/${id}`);
    return response.data;
  }

  async createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
    const response = await this.client.post('/workflows', workflow);
    return response.data;
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    const response = await this.client.put(`/workflows/${id}`, workflow);
    return response.data;
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.client.delete(`/workflows/${id}`);
  }

  // Executions
  async listExecutions(options: {
    limit?: number;
    cursor?: string;
    workflowId?: string;
    status?: string;
    includeData?: boolean;
  } = {}): Promise<PaginatedResponse<ExecutionSummary>> {
    const params: Record<string, any> = {};
    if (options.limit) params.limit = options.limit;
    if (options.cursor) params.cursor = options.cursor;
    if (options.workflowId) params.workflowId = options.workflowId;
    if (options.status) params.status = options.status;
    if (options.includeData) params.includeData = 'true';

    const response = await this.client.get('/executions', { params });
    return {
      data: response.data.data || [],
      nextCursor: response.data.nextCursor,
      hasMore: response.data.nextCursor !== undefined,
    };
  }

  async getExecution(id: string, includeData?: boolean): Promise<Execution> {
    const params = includeData ? { includeData: 'true' } : {};
    const response = await this.client.get(`/executions/${id}`, { params });
    return response.data;
  }

  async deleteExecution(id: string): Promise<void> {
    await this.client.delete(`/executions/${id}`);
  }

  // Credentials
  async listCredentials(): Promise<Credential[]> {
    const response = await this.client.get('/credentials');
    return response.data.data || [];
  }

  async getCredential(id: string): Promise<Credential> {
    const response = await this.client.get(`/credentials/${id}`);
    return response.data;
  }

  async createCredential(credential: Partial<Credential>): Promise<Credential> {
    const response = await this.client.post('/credentials', credential);
    return response.data;
  }

  async updateCredential(id: string, credential: Partial<Credential>): Promise<Credential> {
    const response = await this.client.put(`/credentials/${id}`, credential);
    return response.data;
  }

  async deleteCredential(id: string): Promise<void> {
    await this.client.delete(`/credentials/${id}`);
  }

  async getCredentialSchema(type: string): Promise<any> {
    const response = await this.client.get(`/credential-types/${type}`);
    return response.data;
  }

  // Node Types - Use /node-types endpoint (like main project)
  async listNodeTypes(): Promise<NodeType[]> {
    const response = await this.client.get('/node-types');
    return response.data.data || [];
  }

  async getNodeType(name: string): Promise<NodeType> {
    const response = await this.client.get(`/node-types/${name}`);
    return response.data;
  }

  // Templates (from n8n.io)
  async searchTemplates(query: string, limit: number = 20): Promise<Template[]> {
    // Templates are fetched from n8n.io public API
    const response = await axios.get('https://api.n8n.io/api/templates/search', {
      params: { query, limit },
      timeout: 10000,
    });
    return response.data.data || [];
  }

  async getTemplate(templateId: number): Promise<Template> {
    const response = await axios.get(`https://api.n8n.io/api/templates/${templateId}`, {
      timeout: 10000,
    });
    return response.data;
  }

  // Workflow Versions
  async listWorkflowVersions(workflowId: string, limit: number = 10): Promise<any[]> {
    const response = await this.client.get(`/workflows/${workflowId}/versions`, {
      params: { limit },
    });
    return response.data.data || [];
  }

  async getWorkflowVersion(workflowId: string, versionId: number): Promise<any> {
    const response = await this.client.get(`/workflows/${workflowId}/versions/${versionId}`);
    return response.data;
  }

  async rollbackWorkflowVersion(workflowId: string, versionId: number): Promise<Workflow> {
    const response = await this.client.post(`/workflows/${workflowId}/versions/${versionId}/rollback`);
    return response.data;
  }

  // Tags
  async listTags(): Promise<any[]> {
    const response = await this.client.get('/tags');
    return response.data.data || [];
  }

  async createTag(name: string): Promise<any> {
    const response = await this.client.post('/tags', { name });
    return response.data;
  }

  async deleteTag(id: string): Promise<void> {
    await this.client.delete(`/tags/${id}`);
  }

  async updateTag(id: string, name: string): Promise<any> {
    const response = await this.client.put(`/tags/${id}`, { name });
    return response.data;
  }

  // Users
  async listUsers(): Promise<any[]> {
    const response = await this.client.get('/users');
    return response.data.data || [];
  }

  async getUser(id: string): Promise<any> {
    const response = await this.client.get(`/users/${id}`);
    return response.data;
  }

  // Audit
  async generateAudit(): Promise<any> {
    const response = await this.client.post('/audit');
    return response.data;
  }

  // Transfer credential to another project
  async transferCredential(id: string, destinationProjectId: string): Promise<any> {
    const response = await this.client.post(`/credentials/${id}/transfer`, {
      destinationProjectId,
    });
    return response.data;
  }
}

// Create singleton instance
let apiClient: N8nApiClient | null = null;

export function getApiClient(config?: N8nApiConfig): N8nApiClient {
  if (!apiClient && config) {
    apiClient = new N8nApiClient(config);
  }
  if (!apiClient) {
    throw new Error('API client not initialized');
  }
  return apiClient;
}

export function initializeApiClient(config: N8nApiConfig): N8nApiClient {
  apiClient = new N8nApiClient(config);
  return apiClient;
}
