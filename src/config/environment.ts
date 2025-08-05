/**
 * Environment configuration for the MCP server
 * Manages API keys and other configuration values
 */

export interface EnvironmentConfig {
  openWeatherApiKey?: string | undefined;
}

/**
 * Load environment configuration
 * Gracefully handles missing API key with helpful error message
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  return {
    openWeatherApiKey: process.env['OPENWEATHER_API_KEY'] ?? undefined
  };
}

/**
 * Validate that required environment variables are present
 * @param config - Environment configuration to validate
 * @throws Error if required configuration is missing
 */
export function validateEnvironmentConfig(config: EnvironmentConfig): void {
  if (!config.openWeatherApiKey) {
    throw new Error(
      'OPENWEATHER_API_KEY environment variable is required. ' +
      'Sign up at https://openweathermap.org/api to get your free API key.'
    );
  }
}