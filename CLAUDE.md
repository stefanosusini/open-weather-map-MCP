# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a learning-focused MCP (Model Context Protocol) server implementation in TypeScript. The project is designed to be simple, incremental, and high-quality, serving as a foundation for understanding MCP concepts.

## Development Commands

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Build the project
npm run build

# Start the built server
npm start

# Run tests
npm test
npm run test:watch

# Linting and type checking
npm run lint
npm run lint:fix
npm run typecheck
```

## Architecture

### Core Components

- **src/index.ts**: Main MCP server implementation with minimal baseline
  - Uses stdio transport for communication
  - Implements basic tool listing and execution handlers
  - Currently provides a simple "hello" tool as example

### MCP Protocol Implementation

The server follows the MCP specification:

1. **ListToolsRequestSchema**: Handler that returns available tools metadata
2. **CallToolRequestSchema**: Handler that executes specific tools
3. **StdioServerTransport**: Communication layer using stdin/stdout

### Key Patterns

- Tools must be consistently defined in both list and call handlers
- All server communication uses stdio transport
- Error logging goes to stderr to avoid interfering with MCP protocol on stdout
- JSDoc comments explain MCP-specific concepts for learning purposes

## Development Notes

- This is designed as a learning project - prioritize clarity and documentation over performance
- The server is currently minimal with one example tool
- Future migration to a more performant language is considered in the design
- TypeScript configuration is strict to maintain code quality

## Adding New Tools

When adding tools, ensure:

1. Add tool metadata to `ListToolsRequestSchema` handler
2. Add tool execution logic to `CallToolRequestSchema` handler  
3. Include proper input schema validation
4. Add JSDoc comments explaining the tool's purpose

## Development Planning

Reference the `DEVELOPMENT_PLAN.md` file for the current OpenWeatherMap API integration roadmap. This file contains:

- Detailed architecture design and project structure
- Implementation phases with specific tasks
- Technical specifications and configuration requirements
- Progress tracking with checkboxes for each phase
