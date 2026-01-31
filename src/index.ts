#!/usr/bin/env node
/**
 * n8n MCP Server
 * 
 * A production-ready MCP server for managing n8n workflows, nodes, and templates.
 * Provides 30+ tools for comprehensive n8n automation management.
 * 
 * Features:
 * - Dual transport support (stdio for Claude Desktop, HTTP for cloud)
 * - Comprehensive tool set for workflow CRUD operations
 * - Credential and tag management
 * - Workflow validation and auto-fixing
 * - Execution monitoring
 */

import dotenv from 'dotenv';
import { MCPServer } from './server.js';
import { initializeApiClient } from './services/n8n-api-client.js';

// Load environment variables
dotenv.config();

// Get configuration from environment variables
function getConfig() {
  const baseUrl = process.env.N8N_API_URL || 
                  process.env.N8N_HOST || 
                  process.env.N8N_BASE_URL ||
                  process.env.N8N_URL;
  
  const apiKey = process.env.N8N_API_KEY || 
                 process.env.N8N_KEY ||
                 process.env.API_KEY;

  const port = parseInt(process.env.PORT || '3000', 10);
  const apiKeyHttp = process.env.MCP_API_KEY;
  const transport = process.env.MCP_TRANSPORT || 'stdio';

  return { baseUrl, apiKey, port, apiKeyHttp, transport };
}

// Validate configuration
function validateConfig(): { baseUrl: string; apiKey: string } {
  const config = getConfig();
  
  if (!config.baseUrl) {
    console.error('❌ Error: Missing n8n API URL configuration');
    console.error('');
    console.error('Please set one of these environment variables:');
    console.error('  - N8N_API_URL (recommended)');
    console.error('  - N8N_HOST');
    console.error('  - N8N_BASE_URL');
    console.error('  - N8N_URL');
    console.error('');
    console.error('Example:');
    console.error('  N8N_API_URL=https://your-n8n-instance.com');
    console.error('');
    console.error('Note: Do NOT include /api/v1 in the URL - it will be added automatically');
    process.exit(1);
  }

  if (!config.apiKey) {
    console.error('❌ Error: Missing n8n API key');
    console.error('');
    console.error('Please set one of these environment variables:');
    console.error('  - N8N_API_KEY (recommended)');
    console.error('  - N8N_KEY');
    console.error('  - API_KEY');
    console.error('');
    console.error('Example:');
    console.error('  N8N_API_KEY=n8n_api_xxxxxxxxxxxxxxxx');
    process.exit(1);
  }

  return { baseUrl: config.baseUrl, apiKey: config.apiKey };
}

// Main function
async function main() {
  const config = getConfig();
  const { baseUrl, apiKey } = validateConfig();
  
  // Initialize API client
  initializeApiClient({
    baseUrl,
    apiKey,
  });

  // Create MCP server
  const server = new MCPServer({
    name: 'n8n-mcp',
    version: '2.0.0',
    description: 'MCP server for n8n API',
    port: config.port,
    apiKey: config.apiKeyHttp,
  });

  // Determine transport mode
  const transport = config.transport as 'stdio' | 'http';
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.error('\n👋 Shutting down n8n MCP server...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('\n👋 Shutting down n8n MCP server...');
    await server.stop();
    process.exit(0);
  });

  // Start server
  try {
    await server.start(transport);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Run main
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
