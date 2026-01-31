# Contributing to n8n-mcp

Thank you for your interest in contributing to n8n-mcp! This document provides guidelines for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Adding New Tools](#adding-new-tools)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

---

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy toward other community members

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: for cloning and contributing
- **n8n Instance**: Access to an n8n instance for testing
- **TypeScript**: Knowledge of TypeScript

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/n8n-mcp.git
   cd n8n-mcp
   ```

3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_REPO/n8n-mcp.git
   ```

---

## Development Setup

### Install Dependencies

```bash
npm install
```

### Build Project

```bash
npm run build
```

### Run in Development Mode

```bash
npm run dev
```

### Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
# Edit .env with your n8n API credentials
```

### Test MCP Connection

```bash
npm run inspector
```

---

## Project Structure

```
src/
├── index.ts              # Entry point, server initialization
├── server.ts             # MCP server implementation
├── types/               # Type definitions
│   ├── tools.ts        # Tool and handler types
│   ├── n8n-api.ts     # n8n API types
│   └── index.ts
├── validation/           # Zod validation schemas
│   ├── base.ts         # Base schemas and utilities
│   ├── workflows.ts    # Workflow validation
│   ├── credentials.ts  # Credential validation
│   ├── tags.ts         # Tag validation
│   ├── users.ts        # User validation
│   ├── nodes.ts        # Node validation
│   ├── templates.ts    # Template validation
│   ├── audit.ts        # Audit validation
│   └── index.ts
├── tools/               # Tool definitions
│   ├── workflows.ts    # Workflow tools
│   ├── credentials.ts  # Credential tools
│   ├── tags.ts         # Tag tools
│   ├── users.ts        # User tools
│   ├── nodes.ts        # Node tools
│   ├── templates.ts    # Template tools
│   ├── audit.ts        # Audit tools
│   ├── documentation.ts # Documentation tools
│   └── index.ts
├── handlers/            # Tool implementations
│   ├── workflows.ts    # Workflow handlers
│   ├── credentials.ts  # Credential handlers
│   ├── tags.ts         # Tag handlers
│   ├── users.ts        # User handlers
│   ├── nodes.ts        # Node handlers
│   ├── templates.ts    # Template handlers
│   ├── audit.ts        # Audit handlers
│   ├── documentation.ts # Documentation handlers
│   └── index.ts
└── services/            # Business logic
    └── n8n-api-client.ts # n8n API client
```

---

## Adding New Tools

### Step 1: Define Tool Schema

Add tool definition in `src/tools/{category}.ts`:

```typescript
export const yourTool: ToolWithAnnotations = {
  name: 'n8n_your_tool',
  description: `n8n_your_tool: Brief description.
Why: External API required.
Use when: "trigger1"; "trigger2"; "trigger3".
Avoid: "non-goal1"; "non-goal2".
Inputs: param1(type, req); param2(type, opt, default=...).
Returns: field1(type)=meaning; field2(type)=meaning.
Prompts->call: "prompt1" -> { ... }; "prompt2" -> { ... }
On error: 401 -> check N8N_API_KEY; 404 -> verify id`,
  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Parameter description'
      }
    },
    required: ['param1']
  },
  annotations: {
    title: 'Your Tool',
    readOnlyHint: false,
    destructiveHint: false,
    openWorldHint: true,
  },
};
```

### Step 2: Create Zod Validation Schema

Add validation schema in `src/validation/{category}.ts`:

```typescript
import { z } from 'zod';
import { NonEmptyString } from './base.js';

export const YourToolSchema = z.object({
  param1: NonEmptyString,
  param2: z.string().optional(),
});

export type YourToolInput = z.infer<typeof YourToolSchema>;
```

### Step 3: Implement Tool Handler

Add handler in `src/handlers/{category}.ts`:

```typescript
import { ToolHandler, ToolResponse } from '../types/index.js';
import { getApiClient } from '../services/n8n-api-client.js';
import { YourToolSchema, validate } from '../validation/index.js';

export const yourToolHandler: ToolHandler = async (args: unknown): Promise<ToolResponse> => {
  try {
    // Validate input with Zod
    const validatedArgs = validate(YourToolSchema, args, 'yourTool');
    
    // Call API
    const client = getApiClient();
    const result = await client.yourApiCall(validatedArgs);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          data: result
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error executing yourTool: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,
    };
  }
};
```

### Step 4: Register Tool Handler

Register handler in `src/handlers/index.ts`:

```typescript
import { yourToolHandler } from './yourFile.js';

export const toolHandlers: ToolRegistry = {
  // ... other handlers
  'n8n_your_tool': yourToolHandler,
};
```

### Step 5: Export Tool Definition

Export tool in `src/tools/index.ts`:

```typescript
import { yourTool } from './yourFile.js';

export const allTools: ToolWithAnnotations[] = [
  // ... other tools
  ...yourTool,
];
```

---

## Coding Standards

### TypeScript

- Use **strict mode** (enforced in tsconfig.json)
- Use **explicit types** - avoid `any`
- Prefer **interface** for object shapes
- Use **type** for unions and type aliases
- Add **JSDoc comments** to public functions
- Use **ES modules** with `.js` extensions

### Formatting

- Use **2 spaces** for indentation
- Maximum line length: **120 characters**
- Use **single quotes** for strings
- Add **trailing commas** in objects and arrays

### Naming Conventions

- **Tool names**: `n8n_` prefix + `snake_case` (e.g., `n8n_create_workflow`)
- **Variables**: `camelCase` (e.g., `workflowId`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- **Functions**: `camelCase` (e.g., `createWorkflow`)
- **Classes**: `PascalCase` (e.g., `N8nApiClient`)
- **Files**: `kebab-case.ts` (e.g., `workflow-handler.ts`)
- **Interfaces**: `PascalCase` (e.g., `ToolResponse`)

### Error Handling

- Always **catch errors** and return proper ToolResponse
- Use **Zod validation** for input validation
- Provide **actionable error messages**
- Log errors with context (tool name, operation, parameters)
- Map HTTP errors to user-friendly messages:
  - 401/403: Check N8N_API_KEY
  - 404: Resource not found, verify ID
  - 429: Rate limited, retry later
  - 5xx: Server error, check n8n status

### Validation

- **Always validate inputs** with Zod schemas
- Use the `validate()` helper from validation/index.ts
- Provide clear error messages for validation failures
- Return validation errors before making API calls

---

## Testing

### Unit Testing

```bash
# Run unit tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

### Integration Testing

Test with n8n instance:

```bash
# Set environment
export N8N_API_URL=https://your-test-instance.com
export N8N_API_KEY=your-test-api-key

# Run inspector
npm run inspector
```

### Manual Testing with Claude Desktop

1. Build the project: `npm run build`
2. Configure Claude Desktop with path to `dist/index.js`
3. Test tools in Claude chat

### Testing Checklist

Before submitting a PR, ensure:
- [ ] Code compiles without errors: `npm run build`
- [ ] TypeScript passes: `npm run lint`
- [ ] New tools are tested manually
- [ ] Error handling is proper
- [ ] Documentation is updated (README.md)
- [ ] Tool descriptions follow MCP standard
- [ ] Zod schemas are added/updated
- [ ] Handlers use validation schemas
- [ ] Tools are registered in handlers/index.ts
- [ ] Tools are exported in tools/index.ts

---

## Submitting Changes

### Branch Naming

Use descriptive branch names:

```
feature/add-new-tool
fix/validation-error
improvement/performance-optimization
docs/update-readme
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semi colons, etc. (no code change)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding missing tests
- `chore`: Maintenance

**Examples**:
```
feat(workflows): add workflow version rollback tool
fix(credentials): handle missing credential name
docs(readme): add docker deployment instructions
refactor(api-client): extract retry logic
```

### Pull Request Process

1. **Update documentation** - Update README.md if needed
2. **Rebase** - Keep your branch up to date with upstream
3. **Clean commits** - Squash related commits if needed
4. **Push to fork** - `git push origin feature/your-feature`
5. **Create PR** - Go to GitHub and create pull request
6. **Fill PR template** - Complete all sections in PR template
7. **Address feedback** - Respond to review comments promptly

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #123

## Changes Made
- List of changes

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] Tests pass locally
```

---

## Getting Help

- **GitHub Issues**: https://github.com/your-org/n8n-mcp/issues
- **Discussions**: https://github.com/your-org/n8n-mcp/discussions
- **n8n Community**: https://community.n8n.io/

---

## Recognition

Contributors will be recognized in:
- README.md contributors section
- RELEASE.md changelog
- Annual contributor summaries

Thank you for contributing! 🎉
