/**
 * Current weather tool for MCP server
 * Provides current weather and forecast data using OpenWeatherMap API
 */

import { WeatherService } from '../services/weather.js';
import type { WeatherUnits, WeatherExclude } from '../services/weather.types.js';

export interface CurrentWeatherInput {
  location: string;
  units?: WeatherUnits;
  exclude?: WeatherExclude[];
}

/**
 * Execute the get-current-weather tool
 * @param weatherService - Initialized weather service instance
 * @param input - Tool input parameters
 * @returns Formatted weather data
 */
export async function executeCurrentWeatherTool(
  weatherService: WeatherService,
  input: CurrentWeatherInput
): Promise<string> {
  try {
    // Parse the location (handles both city names and "lat,lon" format)
    const coordinates = await weatherService.parseLocation(input.location);
    
    // Get weather data from API
    const weatherData = await weatherService.getCurrentWeather(
      coordinates,
      input.units || 'metric',
      input.exclude
    );

    // Format the response for display
    const current = weatherData.current;
    const unitsSymbol = input.units === 'imperial' ? '°F' : 
                       input.units === 'standard' ? 'K' : '°C';
    
    let response = `Current Weather for ${input.location}:\n\n`;
    response += `Temperature: ${current.temp}${unitsSymbol}\n`;
    response += `Feels like: ${current.feels_like}${unitsSymbol}\n`;
    response += `Weather: ${current.weather[0]?.main} - ${current.weather[0]?.description}\n`;
    response += `Humidity: ${current.humidity}%\n`;
    response += `Pressure: ${current.pressure} hPa\n`;
    response += `Wind Speed: ${current.wind_speed} ${input.units === 'imperial' ? 'mph' : 'm/s'}\n`;
    
    if (current.wind_deg !== undefined) {
      response += `Wind Direction: ${current.wind_deg}°\n`;
    }
    
    if (current.visibility !== undefined) {
      response += `Visibility: ${current.visibility / 1000} km\n`;
    }

    // Add forecast information if not excluded
    if (!input.exclude?.includes('hourly') && weatherData.hourly) {
      response += `\nNext 6 hours:\n`;
      weatherData.hourly.slice(0, 6).forEach((hour) => {
        const time = new Date(hour.dt * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        response += `  ${time}: ${hour.temp}${unitsSymbol}, ${hour.weather[0]?.description}\n`;
      });
    }

    if (!input.exclude?.includes('daily') && weatherData.daily) {
      response += `\nNext 3 days:\n`;
      weatherData.daily.slice(0, 3).forEach((day) => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
        response += `  ${date}: ${day.temp.min}${unitsSymbol} - ${day.temp.max}${unitsSymbol}, ${day.weather[0]?.description}\n`;
      });
    }

    // Add alerts if present
    if (weatherData.alerts && weatherData.alerts.length > 0) {
      response += `\nWeather Alerts:\n`;
      weatherData.alerts.forEach((alert) => {
        response += `  ⚠️  ${alert.event}: ${alert.description}\n`;
      });
    }

    return response;

  } catch (error) {
    if (error instanceof Error) {
      return `Error getting weather data: ${error.message}`;
    }
    return 'An unexpected error occurred while fetching weather data.';
  }
}