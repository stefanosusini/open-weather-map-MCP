#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Create a new MCP server instance with basic metadata
 * First parameter: server info (name, version)
 * Second parameter: capabilities (what the server can do)
 */
const server = new Server(
  {
    name: 'tesr-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {}, // Indicates this server provides tools
    },
  }
);

/**
 * Handle requests to list available tools
 * This is called when a client wants to know what tools are available
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'hello',
      description: 'Say hello',
      inputSchema: {
        type: 'object',
        properties: {}, // No input parameters needed for this simple tool
      },
    },
  ],
}));

/**
 * Handle requests to call/execute a specific tool
 * This is called when a client wants to actually use one of our tools
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'hello') {
    return {
      content: [{ type: 'text', text: 'Hello from MCP server!' }],
    };
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

/**
 * Main function to start the MCP server
 * Uses stdio transport to communicate with the client via stdin/stdout
 */
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server running'); // Log to stderr so it doesn't interfere with MCP protocol on stdout
}

main().catch(console.error);