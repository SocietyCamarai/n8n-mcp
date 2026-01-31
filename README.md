# n8n-mcp: Model Context Protocol Server for n8n

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Server-green)](https://modelcontextprotocol.io/)

A production-ready MCP (Model Context Protocol) server that provides comprehensive access to n8n automation platform. Enables AI models to manage workflows, credentials, nodes, templates, and monitor executions through a standardized protocol.

## 📋 Table of Contents

- [What is n8n-mcp?](#what-is-n8n-mcp)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Docker Deployment](#docker-deployment)
- [Linux Server Deployment](#linux-server-deployment)
- [Configuration](#configuration)
- [MCP Client Setup](#mcp-client-setup)
- [Available Tools](#available-tools)
- [Usage Examples](#usage-examples)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

---

## What is n8n-mcp?

**n8n-mcp** is a Model Context Protocol (MCP) server that acts as a bridge between AI models and n8n automation platform. It exposes n8n's API capabilities through standardized tools that AI models can call directly.

### Why use n8n-mcp?

- **Direct AI Integration**: AI models can create, modify, and manage n8n workflows without manual intervention
- **Comprehensive API Access**: Full access to n8n's REST API through typed tools
- **Dual Transport**: Supports both stdio (for Claude Desktop) and HTTP (for cloud deployment)
- **Validation**: Runtime input validation with Zod ensures data integrity
- **Production Ready**: Built following MCP best practices with proper error handling

### Use Cases

- 🤖 **AI Workflow Generation**: Let AI models create and optimize n8n workflows
- 🔧 **Workflow Management**: CRUD operations on workflows with validation
- 🔐 **Credential Management**: Secure credential creation and updates
- 📊 **Execution Monitoring**: Track workflow executions and debug issues
- 🏗️ **Template Deployment**: Deploy workflow templates from a library
- 🏷️ **Tag Management**: Organize workflows with tags
- 🔍 **Node Discovery**: Search and validate n8n node types
- 📝 **Auditing**: Generate comprehensive audit reports

---

## Features

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **Workflow CRUD** | Create, read, update, delete workflows with validation |
| **Partial Updates** | Incremental workflow updates with diff operations |
| **Workflow Validation** | Validate structure, nodes, connections, expressions |
| **Autofix** | Automatically fix common workflow errors |
| **Version Control** | Manage workflow version history, rollback, prune |
| **Execution Management** | List, get details, delete workflow executions |
| **Trigger Workflows** | Test workflows via webhook/form/chat triggers |
| **Credential Management** | Create, update, delete, transfer credentials |
| **Tag Management** | Organize workflows with tags |
| **User Management** | List and get user information |
| **Node Discovery** | Search n8n nodes, get node details, validate nodes |
| **Template Deployment** | Deploy workflow templates from library |
| **Health Checks** | Monitor n8n instance health and API connectivity |
| **Audit Reports** | Generate comprehensive audit reports |

### Technical Features

- ✅ **TypeScript**: Full type safety with comprehensive type definitions
- ✅ **Zod Validation**: Runtime input validation for all tools
- ✅ **Dual Transport**: Stdio (Claude Desktop) + HTTP (cloud/SSE)
- ✅ **Tool Descriptions**: High-signal, low-token descriptions per MCP standard
- ✅ **Error Handling**: Comprehensive error handling with actionable messages
- ✅ **Pagination**: Built-in support for paginated API responses
- ✅ **Version-Aware**: Handles different n8n API versions
- ✅ **Docker Ready**: Containerized deployment with health checks

---

## Architecture

### Project Structure

```
n8n-mcp/
├── src/
│   ├── index.ts              # Entry point - server initialization
│   ├── server.ts             # MCP server implementation with dual transport
│   ├── types/               # TypeScript type definitions
│   │   ├── tools.ts        # Tool and handler types
│   │   ├── n8n-api.ts     # n8n API types
│   │   └── index.ts
│   ├── validation/           # Zod validation schemas by category
│   │   ├── base.ts         # Base schemas and utilities
│   │   ├── workflows.ts    # Workflow validation schemas
│   │   ├── credentials.ts  # Credential validation schemas
│   │   ├── tags.ts         # Tag validation schemas
│   │   ├── users.ts        # User validation schemas
│   │   ├── nodes.ts        # Node validation schemas
│   │   ├── templates.ts    # Template validation schemas
│   │   ├── audit.ts        # Audit validation schemas
│   │   └── index.ts
│   ├── tools/               # Tool definitions organized by category
│   │   ├── workflows.ts    # Workflow management tools
│   │   ├── credentials.ts  # Credential management tools
│   │   ├── tags.ts         # Tag management tools
│   │   ├── users.ts        # User management tools
│   │   ├── nodes.ts        # Node discovery tools
│   │   ├── templates.ts    # Template deployment tools
│   │   ├── audit.ts        # Audit tools
│   │   ├── documentation.ts # Documentation tools
│   │   └── index.ts
│   ├── handlers/            # Tool implementations with validation
│   │   ├── workflows.ts    # Workflow handlers
│   │   ├── credentials.ts  # Credential handlers
│   │   ├── tags.ts         # Tag handlers
│   │   ├── users.ts        # User handlers
│   │   ├── nodes.ts        # Node handlers
│   │   ├── templates.ts    # Template handlers
│   │   ├── audit.ts        # Audit handlers
│   │   ├── documentation.ts # Documentation handlers
│   │   └── index.ts
│   └── services/            # Business logic and API clients
│       └── n8n-api-client.ts # n8n API client
├── dist/                   # Compiled JavaScript (generated by build)
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

### MCP Protocol Flow

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│   AI Model  │                    │  MCP Client  │                    │   n8n-mcp    │
│             │                    │   (Claude)  │                    │   (Server)    │
└─────┬─────┘                    └──────┬──────┘                    └──────┬──────┘
      │                                  │                                         │
      │ 1. Lists Tools                  │                                         │
      │<---------------------------------┘                                         │
      │                                  │                                         │
      │ 2. Request Tool                  │ 3. Call Tool (JSON)                  │
      │<---------------------------------┘<-----------------------------------┘
      │                                  │                                         │
      │ 5. Tool Result                  │ 4. n8n API Call                    │
      │<---------------------------------┘<---------------------------------┘
      │                                  │                                         │
      │                                  │                                         │
                                        │                                         │
                                        └────────────────┬─────────────────────────┘
                                                         │
                                                         │
                                                         │
                                                ┌────────┴────────┐
                                                │   n8n Instance   │
                                                └─────────────────┘
```

---

## Quick Start

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **n8n Instance**: Self-hosted or n8n Cloud
- **n8n API Key**: Generated from n8n settings
- **MCP Client**: Claude Desktop or any MCP-compatible client
- **⚠️ REQUIRED: n8n-nodes-mcp Node** - This MCP server requires the n8n community nodes to be installed in your n8n instance. Without these community nodes, the MCP server will not function properly as it relies on their availability for certain operations.

  **How to Install n8n-nodes-mcp:**
  
  1. **For Self-Hosted n8n:**
     - Go to your n8n instance's settings
     - Navigate to **Community Nodes**
     - Search for "n8n-nodes-mcp" or go to the package repository
     - Install the package by providing the repository URL or uploading the package file
  
  2. **For Docker n8n:**
     ```bash
     # Run n8n container
     docker run -it --rm \
       -v n8n_data:/data \
       -e N8N_BASIC_AUTH_USER=admin \
       -e N8N_BASIC_AUTH_PASSWORD=password \
       -e N8N_HOST=http://n8n:5678 \
       n8nio/n8n:latest
   
     # Then install via CLI
     docker exec -it n8n npm install n8n-nodes-mcp
     ```
  
  3. **For n8n Cloud:**
     - Community nodes can only be installed in self-hosted instances
     - You will need to migrate to a self-hosted setup if using n8n Cloud
  
  **Verification:**
  - After installation, verify the nodes are available in n8n
  - Check that nodes like "AI Agent", "MCP Tools", "Workflow Assistant" are visible in the node palette
  
  **Why This is Required:**
  - The MCP server is designed to work with these specific community nodes
  - Many tools validate against node schemas and parameters
  - Without these nodes, certain operations may fail or return unexpected errors

### 5-Minute Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-org/n8n-mcp.git
   cd n8n-mcp
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Create .env file
   cat > .env << EOF
   N8N_API_URL=https://your-n8n-instance.com
   N8N_API_KEY=n8n_api_xxxxxxxxxxxxxxxx
   EOF
   ```

3. **Build and Run**
   ```bash
   npm run build
   npm start
   ```

4. **Configure Claude Desktop**
   Add to Claude Desktop config:
   ```json
   {
     "mcpServers": {
       "n8n-mcp": {
         "command": "node",
         "args": ["/path/to/n8n-mcp/dist/index.js"]
       }
     }
   }
   ```

5. **Test**
   In Claude: "List all workflows in n8n"

---

## Installation

### Local Development

#### 1. Clone Repository
```bash
git clone https://github.com/your-org/n8n-mcp.git
cd n8n-mcp
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Build Project
```bash
npm run build
```

#### 4. Run Server (Stdio Mode)
```bash
# With environment variables
N8N_API_URL=https://your-n8n.com N8N_API_KEY=xxx npm start

# Or with .env file
npm start
```

#### 5. Run Server (HTTP Mode)
```bash
# With environment variables
N8N_API_URL=https://your-n8n.com N8N_API_KEY=xxx npm run start:http

# Optional: Set API key for HTTP authentication
MCP_TRANSPORT=http MCP_API_KEY=your-secret-key npm run start:http
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Watch mode for development |
| `npm start` | Start server in stdio mode |
| `npm run start:http` | Start server in HTTP mode |
| `npm run start:stdio` | Start server in stdio mode (explicit) |
| `npm run lint` | Run TypeScript type checking |
| `npm run clean` | Clean dist directory |

---

## Docker Deployment

### Dockerfile

A `Dockerfile` is included in the project for containerized deployment.

```dockerfile
# Dockerfile for n8n-mcp
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source and compiled files
COPY dist ./dist

# Create non-root user
RUN addgroup -g 1000 -S nodejs && \
    adduser -S -u 1000 -G nodejs nodejs

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port for HTTP mode
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Default command (stdio mode)
CMD ["node", "dist/index.js"]
```

### Build Docker Image

```bash
docker build -t n8n-mcp:latest .
```

### Run Docker Container

#### Stdio Mode (Claude Desktop)

```bash
docker run --rm \
  -v /path/to/n8n-mcp/dist:/app/dist \
  -e N8N_API_URL=https://your-n8n.com \
  -e N8N_API_KEY=your-api-key \
  n8n-mcp:latest
```

#### HTTP Mode (Cloud)

```bash
docker run -d \
  --name n8n-mcp \
  -p 3000:3000 \
  -v /path/to/n8n-mcp/dist:/app/dist \
  -e N8N_API_URL=https://your-n8n.com \
  -e N8N_API_KEY=your-api-key \
  -e MCP_TRANSPORT=http \
  -e MCP_API_KEY=your-http-secret-key \
  n8n-mcp:latest
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  n8n-mcp:
    build: .
    container_name: n8n-mcp
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - N8N_API_URL=https://your-n8n-instance.com
      - N8N_API_KEY=${N8N_API_KEY}
      - MCP_TRANSPORT=http
      - MCP_API_KEY=${MCP_API_KEY}
      - PORT=3000
    volumes:
      - ./dist:/app/dist
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
```

```bash
# Start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Linux Server Deployment

### Option 1: Direct Deployment with PM2

#### 1. Prepare Server

SSH into your Linux server:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /opt/n8n-mcp
sudo chown $USER:$USER /opt/n8n-mcp
cd /opt/n8n-mcp
```

#### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/your-org/n8n-mcp.git .

# Install dependencies
npm install --production

# Build application
npm run build

# Create .env file
cat > .env << EOF
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key
MCP_TRANSPORT=http
PORT=3000
MCP_API_KEY=your-secret-http-key
EOF

# Protect .env file
chmod 600 .env
```

#### 3. Start with PM2

```bash
# Start application (HTTP mode)
pm2 start dist/index.js --name n8n-mcp -- --env-file .env

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd -u $USER --hp /opt/n8n-mcp
```

#### 4. Configure Firewall (UFW)

```bash
# Allow traffic on port 3000
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

#### 5. Configure Nginx Reverse Proxy (Optional)

```bash
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/n8n-mcp
```

```nginx
# /etc/nginx/sites-available/n8n-mcp
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support for SSE
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/n8n-mcp /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Option 2: Docker Deployment on Linux Server

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create directory
mkdir -p ~/n8n-mcp
cd ~/n8n-mcp

# Clone repository
git clone https://github.com/your-org/n8n-mcp.git .

# Create .env file
cat > .env << EOF
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key
MCP_TRANSPORT=http
PORT=3000
MCP_API_KEY=your-secret-http-key
EOF

chmod 600 .env

# Start with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Monitoring with PM2

```bash
# View application status
pm2 status

# View logs
pm2 logs n8n-mcp

# Restart application
pm2 restart n8n-mcp

# Stop application
pm2 stop n8n-mcp

# Monitor resources
pm2 monit
```

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|-----------|---------|-------------|
| `N8N_API_URL` | Yes | - | Base URL of your n8n instance (e.g., `https://n8n.your-domain.com`) |
| `N8N_API_KEY` | Yes | - | n8n API key for authentication |
| `MCP_TRANSPORT` | No | `stdio` | Transport mode: `stdio` or `http` |
| `PORT` | No | `3000` | Port for HTTP mode |
| `MCP_API_KEY` | No | - | Optional API key for HTTP mode authentication |
| `N8N_HOST` | No | - | Deprecated: Use `N8N_API_URL` |
| `N8N_KEY` | No | - | Deprecated: Use `N8N_API_KEY` |

### Getting n8n API Key

1. **n8n Self-Hosted**:
   - Go to Settings → API
   - Click "Create API Key"
   - Copy the key

2. **n8n Cloud**:
   - Go to https://app.n8n.cloud/settings/api
   - Click "Create API Key"
   - Copy the key

### .env File Example

```bash
# n8n Configuration
N8N_API_URL=https://n8n.your-domain.com
N8N_API_KEY=n8n_api_xxxxxxxxxxxxxxxx

# MCP Server Configuration
MCP_TRANSPORT=http
PORT=3000
MCP_API_KEY=your-secret-http-key

# Optional: Override for backward compatibility
# N8N_HOST=https://n8n.your-domain.com
# N8N_KEY=n8n_api_xxxxxxxxxxxxxxxx
```

---

## MCP Client Setup

### Claude Desktop

1. **Locate Config File**:

   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add n8n-mcp Server**:

   ```json
   {
     "mcpServers": {
       "n8n-mcp": {
         "command": "node",
         "args": ["/absolute/path/to/n8n-mcp/dist/index.js"],
         "env": {
           "N8N_API_URL": "https://your-n8n-instance.com",
           "N8N_API_KEY": "your-api-key"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

4. **Verify Connection**: In Claude, ask "What n8n workflows are available?"

### HTTP Client Usage

If running in HTTP mode (cloud deployment), you can use the HTTP endpoints:

#### Health Check
```bash
curl http://localhost:3000/health
```

#### List Tools
```bash
curl -H "x-api-key: your-http-secret" \
  http://localhost:3000/mcp/tools
```

#### Call Tool (POST)
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-http-secret" \
  -d '{
    "name": "n8n_list_workflows",
    "arguments": {"limit": 10}
  }' \
  http://localhost:3000/mcp/call
```

### SSE Connection (HTTP Mode)

```javascript
// Connect via Server-Sent Events
const eventSource = new EventSource('http://localhost:3000/mcp');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('MCP Event:', data);
};

eventSource.onerror = (error) => {
  console.error('SSE Error:', error);
};
```

---

## Available Tools

### Workflow Management (10 tools)

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `n8n_create_workflow` | Create new workflow | name, nodes[], connections{}, settings{} | workflowId, name |
| `n8n_get_workflow` | Get workflow details | id, mode(full/details/structure/minimal) | workflow data |
| `n8n_update_full_workflow` | Replace entire workflow | id, nodes[], connections{}, settings{} | workflowId, name |
| `n8n_update_partial_workflow` | Incremental update | id, operations[] | applied, failed |
| `n8n_delete_workflow` | Delete workflow | id | success, workflowId |
| `n8n_list_workflows` | List workflows | limit, cursor, active, tags | data[], nextCursor |
| `n8n_validate_workflow` | Validate workflow | id, options | valid, errors, warnings |
| `n8n_autofix_workflow` | Auto-fix errors | id, applyFixes, fixTypes | fixesFound, fixesApplied |
| `n8n_test_workflow` | Test/trigger workflow | workflowId, triggerType, data | triggerInfo |
| `n8n_executions` | Manage executions | action, id, mode, etc. | execution data |
| `n8n_workflow_versions` | Version control | mode, workflowId, versionId | versions/details |
| `n8n_health_check` | Health check | mode, verbose | status, version, features |

### Credential Management (5 tools)

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `n8n_create_credential` | Create credential | name, type, data | id, name |
| `n8n_update_credential` | Update credential | id, name, type, data | id, name |
| `n8n_delete_credential` | Delete credential | id | success |
| `n8n_get_credential_schema` | Get schema | credentialTypeName | schema data |
| `n8n_transfer_credential` | Transfer credential | id, destinationProjectId | success |

### Tag Management (4 tools)

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `n8n_list_tags` | List tags | limit, cursor | data[], nextCursor |
| `n8n_create_tag` | Create tag | name | id, name |
| `n8n_update_tag` | Update tag | id, name | id, name |
| `n8n_delete_tag` | Delete tag | id | success |

### User Management (2 tools)

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `n8n_list_users` | List users | limit, cursor | data[], nextCursor |
| `n8n_get_user` | Get user | id | user data |

### Node Discovery (3 tools)

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `search_nodes` | Search nodes | query, limit, category | nodes[] |
| `get_node` | Get node details | name, includeParameters | node data |
| `validate_node` | Validate node | nodeType, parameters | valid, errors |

### Template Management (3 tools)

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `get_template` | Get template | id | template data |
| `search_templates` | Search templates | query, category, limit | templates[] |
| `n8n_deploy_template` | Deploy template | templateId, name, customizations | workflowId |

### Audit Tools (1 tool)

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `n8n_generate_audit` | Generate audit | scope, filters, includeDetails | audit report |

### Documentation (1 tool)

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `tools_documentation` | Get tool docs | toolName, mode | documentation |

**Total Tools: 29**

---

## Usage Examples

### Example 1: Create a Simple Workflow

```javascript
// In Claude, ask:
"Create a workflow named 'Hello World' with a webhook trigger and a HTTP request node that sends a GET request to https://api.example.com"
```

The AI will call:
```javascript
n8n_create_workflow({
  name: "Hello World",
  nodes: [
    {
      id: "webhook_1",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [250, 300],
      parameters: {
        httpMethod: "POST",
        path: "hello"
      }
    },
    {
      id: "http_1",
      name: "HTTP Request",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.1,
      position: [450, 300],
      parameters: {
        method: "GET",
        url: "https://api.example.com"
      }
    }
  ],
  connections: {
    "Webhook": {
      "main": [[{node: "HTTP Request", type: "main", index: 0}]]
    }
  }
})
```

### Example 2: List All Workflows

```javascript
// In Claude, ask:
"List all workflows in n8n"
```

Response:
```json
{
  "data": [
    {
      "id": "abc123",
      "name": "Daily Sales Report",
      "active": true,
      "tags": ["reports", "sales"],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T15:30:00Z"
    }
  ],
  "nextCursor": null
}
```

### Example 3: Get Workflow Structure

```javascript
// In Claude, ask:
"Show me the structure of workflow 'abc123' with just nodes and connections"
```

Response:
```json
{
  "id": "abc123",
  "name": "Daily Sales Report",
  "nodes": [
    {
      "id": "node_1",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "disabled": false
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "HTTP Request", "type": "main", "index": 0}]]
    }
  }
}
```

### Example 4: Validate Workflow

```javascript
// In Claude, ask:
"Validate workflow 'abc123' and check for errors"
```

Response:
```json
{
  "valid": false,
  "summary": {
    "totalNodes": 5,
    "enabledNodes": 5,
    "triggerNodes": 1,
    "errorCount": 2,
    "warningCount": 1
  },
  "errors": [
    {
      "node": "HTTP Request",
      "message": "Missing node ID"
    },
    {
      "node": "Webhook",
      "message": "Missing webhook path"
    }
  ],
  "warnings": [
    {
      "node": "Function",
      "message": "Node has no connections"
    }
  ]
}
```

### Example 5: Incremental Update

```javascript
// In Claude, ask:
"Disable node 'Function' in workflow 'abc123'"
```

Response:
```json
{
  "success": true,
  "workflowId": "abc123",
  "applied": 1,
  "failed": 0,
  "operations": [
    {
      "index": 0,
      "type": "disableNode",
      "nodeName": "Function"
    }
  ],
  "message": "Applied 1 operations to workflow"
}
```

### Example 6: Health Check

```javascript
// In Claude, ask:
"Check n8n instance health"
```

Response:
```json
{
  "status": "healthy",
  "n8nVersion": "1.120.0",
  "instanceId": "abc123-def456",
  "features": {
    "sourceControl": true,
    "externalHooks": true,
    "workers": false
  },
  "performance": {
    "responseTimeMs": 150,
    "cacheHitRate": "85%"
  },
  "nextSteps": [
    "Instance is healthy",
    "n8n version is up to date"
  ]
}
```

### Example 7: Generate Audit Report

```javascript
// In Claude, ask:
"Generate an audit report of all workflows"
```

Response:
```json
{
  "summary": {
    "totalWorkflows": 25,
    "activeWorkflows": 18,
    "inactiveWorkflows": 7,
    "credentials": 12,
    "tags": 8
  },
  "workflows": [
    {
      "id": "abc123",
      "name": "Daily Sales Report",
      "status": "active",
      "lastExecution": "2024-01-30T10:00:00Z",
      "executionsLastWeek": 7
    }
  ],
  "recommendations": [
    "Consider enabling error workflows",
    "Review inactive workflows for cleanup"
  ]
}
```

---

## Development

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/your-org/n8n-mcp.git
cd n8n-mcp

# Install dependencies
npm install

# Run in watch mode
npm run dev
```

### Running Tests

```bash
# Run TypeScript compiler check
npm run lint

# Build for production
npm run build

# Test with MCP Inspector
npm run inspector
```

### Project Structure for Contributors

- **Add new tool**: Add definition in `src/tools/{category}.ts` and handler in `src/handlers/{category}.ts`
- **Add validation schema**: Add Zod schema in `src/validation/{category}.ts`
- **Update types**: Add types in `src/types/` if needed
- **Follow naming**: Use `n8n_` prefix for all tool names

### Best Practices

- ✅ Use Zod schemas for validation
- ✅ Follow MCP tool description standard
- ✅ Handle errors gracefully with actionable messages
- ✅ Return structured responses
- ✅ Use TypeScript strict mode
- ✅ Add JSDoc comments
- ✅ Test with MCP Inspector before committing

---

## Troubleshooting

### Common Issues

#### Issue: "Error: Missing n8n API URL configuration"

**Solution**:
```bash
# Set N8N_API_URL environment variable
export N8N_API_URL=https://your-n8n-instance.com

# Or create .env file
echo "N8N_API_URL=https://your-n8n-instance.com" > .env
```

#### Issue: "Error: Missing n8n API key"

**Solution**:
```bash
# Generate API key in n8n Settings → API
# Then set environment variable
export N8N_API_KEY=n8n_api_xxxxxxxxxxxxxxxx

# Or add to .env
echo "N8N_API_KEY=n8n_api_xxxxxxxxxxxxxxxx" >> .env
```

#### Issue: Claude Desktop doesn't recognize the MCP server

**Solution**:
1. Check config file path is correct
2. Verify absolute path to `dist/index.js`
3. Check environment variables are set in config
4. Restart Claude Desktop completely

#### Issue: Docker container exits immediately

**Solution**:
```bash
# Check logs
docker logs n8n-mcp

# Common causes:
# - Missing environment variables
# - Invalid N8N_API_URL or N8N_API_KEY
# - Network connectivity issues
```

#### Issue: "401 Unauthorized" errors

**Solution**:
- Verify API key is correct
- Check API key hasn't expired
- Ensure IP is whitelisted (if applicable)
- Verify `N8N_API_URL` is correct (no typos)

#### Issue: "n8n-nodes-mcp node not found"

**Solution**:
- ⚠️ **CRITICAL: This MCP server REQUIRES the n8n community node `n8n-nodes-mcp` to be installed in your n8n instance**
- **Install via n8n UI**: 
  1. Go to Settings → Community Nodes
  2. Search for "n8n-nodes-mcp" or "AI Agent"
  3. Click Install on the found package
  4. Restart n8n instance
- **Install via CLI (Docker)**:
  ```bash
  # Run n8n container
  docker run -it --rm \
    -v n8n_data:/data \
    -v n8n_home:/home/node/.n8n \
    -e N8N_BASIC_AUTH_USER=admin \
    -e N8N_BASIC_AUTH_PASSWORD=password \
    -e N8N_HOST=http://n8n:5678 \
    n8nio/n8n:latest
  
  # Then install the package
  docker exec -it n8n npm install n8n-nodes-mcp
  ```
- **Verify Installation**:
  1. After installation, check node palette
  2. Look for nodes like "AI Agent", "MCP Tools", "Workflow Assistant"
  3. These nodes should now be available
- **Common Problems**:
  - Package not found: Check n8n version compatibility
  - Node not visible: Try refreshing n8n browser page
  - Installation fails: Check n8n logs for errors
- **Why This is Required**:
  - Many MCP tools validate against these specific node schemas
  - Without them, tools may return validation errors
  - Some features depend on these nodes being available

#### Issue: Build errors with TypeScript

**Solution**:
```bash
# Clean and rebuild
npm run clean
npm run build

# Check TypeScript version
npm list typescript

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

Enable verbose logging:

```bash
# Set verbose mode
export DEBUG=n8n-mcp:*

# Or in .env
echo "DEBUG=n8n-mcp:*" >> .env
```

### Health Check

Always run health check before using other tools:

```bash
# Via HTTP endpoint
curl http://localhost:3000/health

# Via MCP tool
n8n_health_check({ mode: "diagnostic", verbose: true })
```

### Getting Help

- **GitHub Issues**: https://github.com/your-org/n8n-mcp/issues
- **n8n Community**: https://community.n8n.io/
- **MCP Documentation**: https://modelcontextprotocol.io/

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Acknowledgments

- Built on [Model Context Protocol](https://modelcontextprotocol.io/)
- Inspired by [n8n-nodes-mcp](https://github.com/czlonkowski/n8n-mcp)
- Uses [n8n](https://n8n.io/) REST API

---

**Version**: 2.0.0  
**Last Updated**: 2026-01-31  
**MCP Protocol Version**: 2024-11-05
