# OpenWeatherMap API Integration - Development Plan

## Project Overview

Integrating OpenWeatherMap API v3.0 (One Call API 3.0) into the existing MCP server to provide weather data tools.

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
│   └── weather.ts        # OpenWeatherMap API client
├── types/
│   └── weather.ts        # TypeScript interfaces for API responses
└── tools/
    ├── current-weather.ts    # Current & forecast weather tool
    ├── weather-overview.ts   # Human-readable weather summary
    └── historical-weather.ts # Historical weather data tool
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

#### 2. `get-weather-overview`

- **Endpoint**: `/data/3.0/onecall/overview`
- **Purpose**: Human-readable weather summary
- **Parameters**:
  - `location` (string): City name or "lat,lon"
  - `units` (optional): metric/imperial/standard
- **Returns**: Natural language weather description

#### 3. `get-historical-weather`

- **Endpoint**: `/data/3.0/onecall/timemachine`
- **Purpose**: Historical weather data
- **Parameters**:
  - `location` (string): City name or "lat,lon"
  - `date` (string): Date in YYYY-MM-DD format
  - `units` (optional): metric/imperial/standard
- **Returns**: Historical weather for specified date

## Implementation Plan

### Phase 1: Foundation 🚧

- [ ] Create directory structure
- [ ] Set up environment configuration
- [ ] Create TypeScript types for API responses
- [ ] Implement weather service client

### Phase 2: Core Tools 🔄

- [ ] Implement `get-current-weather` tool
- [ ] Implement `get-weather-overview` tool
- [ ] Update main server to register new tools
- [ ] Add geocoding support for city names

### Phase 3: Advanced Features 🔄

- [ ] Implement `get-historical-weather` tool
- [ ] Add comprehensive error handling
- [ ] Add input validation
- [ ] Add rate limiting protection

### Phase 4: Testing & Polish 🔄

- [ ] Add unit tests for weather service
- [ ] Add integration tests for tools
- [ ] Update documentation
- [ ] Test with various locations and scenarios

## Technical Specifications

### Configuration Management

- Environment variable: `OPENWEATHER_API_KEY`
- Graceful fallback if API key missing
- Optional config file support

### Error Handling Strategy

- API rate limiting (429 errors)
- Network connectivity issues
- Invalid location handling
- Missing API key guidance
- API response validation

### Dependencies to Add

- HTTP client library (considering `node-fetch` or built-in `fetch`)
- Input validation library (considering `zod`)

## API Key Setup

Users will need to:

1. Sign up at <https://openweathermap.org/api>
2. Get free API key (1000 calls/day)
3. Set environment variable: `OPENWEATHER_API_KEY=your_key_here`

## Notes

- Following existing codebase patterns for consistency
- Maintaining learning-focused approach with JSDoc comments
- All tools will include proper input schema validation
- Error messages will be user-friendly and actionable

---

**Last Updated**: 2025-08-05  
**Status**: Planning Complete - Ready for Implementation
