#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { WeatherService } from './services/weather.js';
import { executeCurrentWeatherTool } from './tools/current-weather.js';
import type { CurrentWeatherInput } from './tools/current-weather.js';
import { loadEnvironmentConfig } from './config/environment.js';

// Initialize environment configuration and weather service
const config = loadEnvironmentConfig();
let weatherService: WeatherService | null = null;

// Initialize weather service if API key is available
if (config.openWeatherApiKey) {
  console.log('OPENWEATHER_API_KEY found', config.openWeatherApiKey);
  weatherService = new WeatherService(config.openWeatherApiKey);
} else {
  console.error('Warning: OPENWEATHER_API_KEY not found. Weather tools will be unavailable.');
}

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
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [];

  // Add weather tools if service is available
  if (weatherService) {
    tools.push({
      name: 'get-current-weather',
      description: 'Get current weather and forecasts for a location',
      inputSchema: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'City name or coordinates (lat,lon format)',
          },
          units: {
            type: 'string',
            enum: ['metric', 'imperial', 'standard'],
            description: 'Temperature units (default: metric)',
          },
          exclude: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['current', 'minutely', 'hourly', 'daily', 'alerts'],
            },
            description: 'Data sections to exclude from response',
          },
        },
        required: ['location'],
      },
    });
  }

  return { tools };
});

/**
 * Handle requests to call/execute a specific tool
 * This is called when a client wants to actually use one of our tools
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'get-current-weather') {
    if (!weatherService) {
      return {
        content: [{ 
          type: 'text', 
          text: 'Weather service unavailable. Please set OPENWEATHER_API_KEY environment variable.' 
        }],
      };
    }

    try {
      const input = request.params.arguments as unknown as CurrentWeatherInput;
      const result = await executeCurrentWeatherTool(weatherService, input);
      return {
        content: [{ type: 'text', text: result }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      };
    }
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