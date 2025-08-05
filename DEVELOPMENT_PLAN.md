# OpenWeatherMap API Integration - Development Plan

## Project Overview

Integrating OpenWeatherMap API v3.0 (One Call API 3.0) into the existing MCP
server to provide weather data tools.

## Current Status: Planning Phase ✅

### Completed Analysis

- ✅ Analyzed existing MCP server structure
- ✅ Reviewed OpenWeatherMap API v3.0 endpoints
- ✅ Designed project architecture

## Architecture Design

### Project Structure

```text
src/
├── index.ts              # Main MCP server (keep existing structure)
├── config/
│   └── environment.ts    # API key and config management
├── services/
│   ├── weather.ts        # OpenWeatherMap API client
│   ├── weather.types.ts  # TypeScript interfaces for API responses (colocated)
│   └── weather.test.ts   # Weather service tests
└── tools/
    └── current-weather.ts    # Current & forecast weather tool
```

### Tools to Implement

#### 1. `get-current-weather`

- **Endpoint**: `/data/3.0/onecall`
- **Purpose**: Get current weather + forecasts (hourly/daily)
- **Parameters**:
  - `location` (string): City name or "lat,lon"
  - `units` (optional): metric/imperial/standard
  - `exclude` (optional): Skip data blocks
- **Returns**: Current weather, hourly (48h), daily (8d), alerts

## Implementation Plan

### Phase 1: Foundation ✅

- [x] Create directory structure
- [x] Set up environment configuration
- [x] Create TypeScript interfaces for API responses (colocated in services/)
- [x] Implement weather service client with geocoding support

### Phase 2: Core Tools 🔄

- [ ] Implement `get-current-weather` tool
- [ ] Update main server to register new tools
- [x] Add geocoding support for city names (completed in WeatherService)

### Phase 3: Transport & Infrastructure 🔄

- [ ] Add MCP_TRANSPORT and PORT to environment configuration system
- [ ] Implement dual transport support (stdio + HTTP/SSE)
- [ ] Update main server to support both transport modes
- [ ] Add comprehensive error handling
- [ ] Add input validation
- [ ] Add rate limiting protection

### Phase 4: Testing & Polish 🔄

- [x] Add unit tests for weather service
- [ ] Add integration tests for tools
- [ ] Update documentation
- [x] Test with various locations and scenarios (tested with San Miniato)

## Technical Specifications

### Configuration Management

#### Environment Variables

- `OPENWEATHER_API_KEY`: OpenWeatherMap API key (required for weather functionality)
- `MCP_TRANSPORT`: Transport mode - `stdio` (default) or `http`
- `PORT`: HTTP port when using HTTP transport (default: 3000)
- Graceful fallback if API key missing
- Optional config file support

#### Transport Modes

##### Stdio Transport (Default)

- Use for Claude Desktop integration and standard MCP clients
- Direct process communication via stdin/stdout
- More secure, lower overhead
- Usage: `npm start` or `MCP_TRANSPORT=stdio npm start`

##### HTTP Transport (SSE)

- Use for web applications, remote access, and debugging
- Server-Sent Events over HTTP
- Enables multiple clients and remote connections
- Usage: `MCP_TRANSPORT=http PORT=3000 npm start`
- Includes CORS support for web clients

### Error Handling Strategy

- API rate limiting (429 errors)
- Network connectivity issues
- Invalid location handling
- Missing API key guidance
- API response validation

### Dependencies to Add

- HTTP client library (considering `node-fetch` or built-in `fetch`)
- Input validation library (considering `zod`)

## Setup Instructions

### API Key Setup

1. Sign up at <https://openweathermap.org/api>
2. Get free API key (1000 calls/day)
3. Set environment variable: `OPENWEATHER_API_KEY=your_key_here`

### Running the Server

#### Stdio Mode (for Claude Desktop)

```bash
npm start
# or explicitly
MCP_TRANSPORT=stdio npm start
```

#### HTTP Mode (for web/remote access)

```bash
MCP_TRANSPORT=http PORT=3000 npm start
```

#### Testing HTTP Mode

```bash
# Test with curl
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list"}'
```

## Notes

- Following existing codebase patterns for consistency
- Maintaining learning-focused approach with JSDoc comments
- All tools will include proper input schema validation
- Error messages will be user-friendly and actionable
- **Weather overview tool removed**: Requires paid OpenWeatherMap subscription,
  not available in free tier
- **Historical weather tool removed**: Requires paid OpenWeatherMap subscription,
  not available in free tier
- **Types colocated**: Weather types moved from `src/types/weather.ts` to
  `src/services/weather.types.ts` for better organization
- **Free tier limitations**: Only current weather, forecasts, and geocoding
  are available with free API keys

---

**Last Updated**: 2025-08-05  
**Status**: Planning Complete - Ready for Implementation
