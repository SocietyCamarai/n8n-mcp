/**
 * MCP Server Implementation
 * 
 * Core server logic with dual transport support:
 * - stdio: For Claude Desktop integration (local)
 * - HTTP: For cloud deployment with SSE
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializeRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { toolDefinitions } from './tools/index.js';
import { toolHandlers } from './handlers/index.js';
import { ToolResult } from './types/index.js';

/**
 * Server configuration options
 */
export interface ServerConfig {
  /** Server name (used in initialization) */
  name: string;
  /** Server version (semver format recommended) */
  version: string;
  /** Optional description for logging */
  description?: string;
  /** Port for HTTP mode (default: 3000) */
  port?: number;
  /** API key for HTTP authentication (optional but recommended for cloud) */
  apiKey?: string;
}

/**
 * MCP Server Class
 * 
 * Encapsulates all server functionality:
 * - Protocol handling
 * - Tool registration
 * - Request routing
 * - Lifecycle management
 * - Dual transport support (stdio + HTTP)
 */
export class MCPServer {
  /** MCP SDK server instance */
  private server: Server;
  
  /** Transport layer (stdio or HTTP) */
  private transport?: StdioServerTransport | any;
  
  /** Server configuration */
  private config: ServerConfig;
  
  /** HTTP server instance (for cloud mode) */
  private httpServer?: any;

  /**
   * Creates a new MCP server instance
   * @param config - Server configuration
   */
  constructor(config: ServerConfig) {
    this.config = {
      port: 3000,
      ...config
    };
    
    // Initialize MCP server with metadata and capabilities
    this.server = new Server(
      {
        name: config.name,
        version: config.version,
      },
      {
        capabilities: {
          tools: {}, // Declare that we support tools
        },
      }
    );

    // Set up request handlers
    this.setupHandlers();
    
    this.log('info', `Server instance created: ${config.name} v${config.version}`);
  }

  /**
   * Sets up all MCP protocol handlers
   * These handlers respond to messages from the client
   */
  private setupHandlers(): void {
    // Handler 1: Initialization (handshake)
    this.server.setRequestHandler(InitializeRequestSchema, async (request) => {
      this.log('debug', 'Initialize request received', {
        clientVersion: request.params.protocolVersion,
        clientInfo: request.params.clientInfo
      });

      // Return server capabilities and info
      return {
        protocolVersion: '2024-11-05', // MCP protocol version
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: this.config.name,
          version: this.config.version,
        },
      };
    });

    // Handler 2: List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      this.log('debug', `Listing ${toolDefinitions.length} tools`);
      
      // Convert our tool definitions to MCP Tool format
      const tools: Tool[] = toolDefinitions.map(def => ({
        name: def.name,
        description: def.description,
        inputSchema: def.inputSchema as any,
      }));

      return { tools };
    });

    // Handler 3: Execute a tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      this.log('info', `Tool called: ${name}`, { args });

      try {
        // Look up the tool handler
        const handler = toolHandlers[name];
        
        if (!handler) {
          throw new Error(`Unknown tool: ${name}. Available tools: ${Object.keys(toolHandlers).join(', ')}`);
        }

        // Execute the tool
        const result = await handler(args);
        
        // Format result for MCP
        const toolResult: ToolResult = {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' 
                ? result 
                : JSON.stringify(result, null, 2)
            }
          ]
        };

        this.log('debug', `Tool ${name} executed successfully`);
        return toolResult;

      } catch (error) {
        // Handle errors gracefully
        this.log('error', `Tool ${name} failed`, { error });
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Unknown error occurred';

        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool '${name}': ${errorMessage}`
            }
          ],
          isError: true
        };
      }
    });
  }

  /**
   * Starts the server with the specified transport mode
   * @param mode - 'stdio' for local Claude Desktop, 'http' for cloud/VPS
   */
  async start(mode: 'stdio' | 'http' = 'stdio'): Promise<void> {
    if (mode === 'stdio') {
      await this.startStdio();
    } else {
      await this.startHttp();
    }
  }

  /**
   * Starts the server in stdio mode (for Claude Desktop)
   */
  private async startStdio(): Promise<void> {
    // Create stdio transport (for Claude Desktop)
    this.transport = new StdioServerTransport();
    
    // Connect server to transport
    await this.server.connect(this.transport);
    
    this.log('info', 'Server started and listening on stdio');
    
    // Keep the process alive
    await new Promise(() => {
      // Server runs indefinitely until process is killed
    });
  }

  /**
   * Starts the server in HTTP mode (for cloud/VPS deployment)
   * Uses SSE (Server-Sent Events) for real-time communication
   */
  private async startHttp(): Promise<void> {
    const express = await import('express');
    const { default: expressApp } = express;
    const app = expressApp();
    
    // Enable JSON parsing
    app.use(express.json());
    
    const port = this.config.port || 3000;
    const apiKey = this.config.apiKey;
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        server: this.config.name,
        version: this.config.version,
        timestamp: new Date().toISOString()
      });
    });
    
    // SSE endpoint for MCP communication
    app.get('/mcp', (req, res) => {
      // Optional API key authentication
      if (apiKey) {
        const providedKey = req.headers['x-api-key'] || req.query.apiKey;
        if (providedKey !== apiKey) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }
      }
      
      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      this.log('info', 'Client connected via SSE');
      
      // Send initial connection message
      res.write(`data: ${JSON.stringify({ type: 'connected', server: this.config.name })}\n\n`);
      
      // Handle client disconnect
      req.on('close', () => {
        this.log('info', 'Client disconnected from SSE');
      });
      
      // Keep connection alive
      const keepAlive = setInterval(() => {
        res.write(':ping\n\n');
      }, 30000);
      
      req.on('close', () => {
        clearInterval(keepAlive);
      });
    });
    
    // POST endpoint for tool calls (alternative to SSE)
    app.post('/mcp/call', async (req, res) => {
      // Optional API key authentication
      if (apiKey) {
        const providedKey = req.headers['x-api-key'] || req.query.apiKey;
        if (providedKey !== apiKey) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }
      }
      
      const { name, arguments: args } = req.body;
      
      try {
        const handler = toolHandlers[name];
        if (!handler) {
          res.status(404).json({ error: `Unknown tool: ${name}` });
          return;
        }
        
        const result = await handler(args);
        res.json({ success: true, result });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: errorMessage });
      }
    });
    
    // GET endpoint to list tools
    app.get('/mcp/tools', (req, res) => {
      // Optional API key authentication
      if (apiKey) {
        const providedKey = req.headers['x-api-key'] || req.query.apiKey;
        if (providedKey !== apiKey) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }
      }
      
      const tools = toolDefinitions.map(def => ({
        name: def.name,
        description: def.description,
        inputSchema: def.inputSchema,
      }));
      
      res.json({ tools });
    });
    
    // Start HTTP server
    this.httpServer = app.listen(port, () => {
      this.log('info', `HTTP server started on port ${port}`);
      this.log('info', `Health check: http://localhost:${port}/health`);
      this.log('info', `MCP endpoint: http://localhost:${port}/mcp`);
      this.log('info', `Tools endpoint: http://localhost:${port}/mcp/tools`);
      if (apiKey) {
        this.log('info', 'API key authentication enabled');
      }
    });
    
    // Keep the process alive
    await new Promise(() => {
      // Server runs indefinitely
    });
  }

  /**
   * Gracefully shuts down the server
   */
  async stop(): Promise<void> {
    this.log('info', 'Shutting down server...');
    
    if (this.httpServer) {
      this.httpServer.close();
    }
    
    await this.server.close();
    this.log('info', 'Server stopped');
  }

  /**
   * Logging helper
   */
  private log(level: 'info' | 'debug' | 'error', message: string, meta?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    
    // Log to stderr to avoid interfering with stdio transport
    console.error(JSON.stringify(logEntry));
  }
}
