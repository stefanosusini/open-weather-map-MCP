/**
 * Tests for current weather tool
 * Tests tool functionality with mocked WeatherService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { executeCurrentWeatherTool } from './current-weather.js';
import type { CurrentWeatherInput } from './current-weather.js';
import { WeatherService } from '../services/weather.js';
import type { OneCallResponse, Coordinates } from '../services/weather.types.js';

// Mock WeatherService
vi.mock('../services/weather.js');

describe('executeCurrentWeatherTool', () => {
  let mockWeatherService: vi.Mocked<WeatherService>;
  
  beforeEach(() => {
    mockWeatherService = vi.mocked(new WeatherService('test-key'));
  });

  const mockCoordinates: Coordinates = {
    lat: 40.7128,
    lon: -74.0060
  };

  const mockWeatherResponse: OneCallResponse = {
    lat: 40.7128,
    lon: -74.0060,
    timezone: 'America/New_York',
    timezone_offset: -18000,
    current: {
      dt: 1609459200,
      sunrise: 1609434000,
      sunset: 1609467600,
      temp: 15.5,
      feels_like: 12.3,
      pressure: 1013,
      humidity: 65,
      dew_point: 8.2,
      uvi: 2.5,
      clouds: 20,
      visibility: 10000,
      wind_speed: 3.5,
      wind_deg: 180,
      weather: [{
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }]
    },
    hourly: [
      {
        dt: 1609462800,
        temp: 16.2,
        feels_like: 13.1,
        pressure: 1014,
        humidity: 62,
        dew_point: 8.5,
        uvi: 3.0,
        clouds: 15,
        visibility: 10000,
        wind_speed: 4.0,
        wind_deg: 185,
        weather: [{
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }],
        pop: 0
      }
    ],
    daily: [
      {
        dt: 1609459200,
        sunrise: 1609434000,
        sunset: 1609467600,
        moonrise: 1609445000,
        moonset: 1609478000,
        moon_phase: 0.25,
        temp: {
          day: 18.0,
          min: 12.0,
          max: 20.0,
          night: 14.0,
          eve: 17.0,
          morn: 13.0
        },
        feels_like: {
          day: 15.5,
          night: 11.2,
          eve: 14.8,
          morn: 10.3
        },
        pressure: 1013,
        humidity: 65,
        dew_point: 8.2,
        wind_speed: 3.5,
        wind_deg: 180,
        weather: [{
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }],
        clouds: 20,
        pop: 0.1,
        uvi: 5.0
      }
    ]
  };

  describe('successful weather data', () => {
    it('should format basic weather information correctly', async () => {
      mockWeatherService.parseLocation.mockResolvedValue(mockCoordinates);
      mockWeatherService.getCurrentWeather.mockResolvedValue(mockWeatherResponse);

      const input: CurrentWeatherInput = {
        location: 'New York'
      };

      const result = await executeCurrentWeatherTool(mockWeatherService, input);

      expect(result).toContain('Current Weather for New York');
      expect(result).toContain('Temperature: 15.5°C');
      expect(result).toContain('Feels like: 12.3°C');
      expect(result).toContain('Weather: Clear - clear sky');
      expect(result).toContain('Humidity: 65%');
      expect(result).toContain('Pressure: 1013 hPa');
      expect(result).toContain('Wind Speed: 3.5 m/s');
      expect(result).toContain('Wind Direction: 180°');
      expect(result).toContain('Visibility: 10 km');
    });

    it('should use imperial units when specified', async () => {
      mockWeatherService.parseLocation.mockResolvedValue(mockCoordinates);
      mockWeatherService.getCurrentWeather.mockResolvedValue(mockWeatherResponse);

      const input: CurrentWeatherInput = {
        location: 'New York',
        units: 'imperial'
      };

      const result = await executeCurrentWeatherTool(mockWeatherService, input);

      expect(result).toContain('Temperature: 15.5°F');
      expect(result).toContain('Wind Speed: 3.5 mph');
      expect(mockWeatherService.getCurrentWeather).toHaveBeenCalledWith(
        mockCoordinates,
        'imperial',
        undefined
      );
    });

    it('should include hourly forecast by default', async () => {
      mockWeatherService.parseLocation.mockResolvedValue(mockCoordinates);
      mockWeatherService.getCurrentWeather.mockResolvedValue(mockWeatherResponse);

      const input: CurrentWeatherInput = {
        location: 'New York'
      };

      const result = await executeCurrentWeatherTool(mockWeatherService, input);

      expect(result).toContain('Next 6 hours:');
      expect(result).toContain('16.2°C, clear sky');
    });

    it('should include daily forecast by default', async () => {
      mockWeatherService.parseLocation.mockResolvedValue(mockCoordinates);
      mockWeatherService.getCurrentWeather.mockResolvedValue(mockWeatherResponse);

      const input: CurrentWeatherInput = {
        location: 'New York'
      };

      const result = await executeCurrentWeatherTool(mockWeatherService, input);

      expect(result).toContain('Next 3 days:');
      expect(result).toContain('12°C - 20°C, clear sky');
    });

    it('should exclude sections when specified', async () => {
      mockWeatherService.parseLocation.mockResolvedValue(mockCoordinates);
      mockWeatherService.getCurrentWeather.mockResolvedValue(mockWeatherResponse);

      const input: CurrentWeatherInput = {
        location: 'New York',
        exclude: ['hourly', 'daily']
      };

      const result = await executeCurrentWeatherTool(mockWeatherService, input);

      expect(result).not.toContain('Next 6 hours:');
      expect(result).not.toContain('Next 3 days:');
      expect(mockWeatherService.getCurrentWeather).toHaveBeenCalledWith(
        mockCoordinates,
        'metric',
        ['hourly', 'daily']
      );
    });

    it('should handle weather alerts', async () => {
      const weatherWithAlerts = {
        ...mockWeatherResponse,
        alerts: [{
          sender_name: 'National Weather Service',
          event: 'Winter Storm Warning',
          start: 1609459200,
          end: 1609545600,
          description: 'Heavy snow expected',
          tags: ['Snow']
        }]
      };

      mockWeatherService.parseLocation.mockResolvedValue(mockCoordinates);
      mockWeatherService.getCurrentWeather.mockResolvedValue(weatherWithAlerts);

      const input: CurrentWeatherInput = {
        location: 'New York'
      };

      const result = await executeCurrentWeatherTool(mockWeatherService, input);

      expect(result).toContain('Weather Alerts:');
      expect(result).toContain('⚠️  Winter Storm Warning: Heavy snow expected');
    });
  });

  describe('error handling', () => {
    it('should handle location parsing errors', async () => {
      mockWeatherService.parseLocation.mockRejectedValue(new Error('Location not found: InvalidCity'));

      const input: CurrentWeatherInput = {
        location: 'InvalidCity'
      };

      const result = await executeCurrentWeatherTool(mockWeatherService, input);

      expect(result).toBe('Error getting weather data: Location not found: InvalidCity');
    });

    it('should handle weather API errors', async () => {
      mockWeatherService.parseLocation.mockResolvedValue(mockCoordinates);
      mockWeatherService.getCurrentWeather.mockRejectedValue(new Error('Weather API request failed: 401 Unauthorized'));

      const input: CurrentWeatherInput = {
        location: 'New York'
      };

      const result = await executeCurrentWeatherTool(mockWeatherService, input);

      expect(result).toBe('Error getting weather data: Weather API request failed: 401 Unauthorized');
    });

    it('should handle unexpected errors', async () => {
      mockWeatherService.parseLocation.mockRejectedValue('Unexpected error');

      const input: CurrentWeatherInput = {
        location: 'New York'
      };

      const result = await executeCurrentWeatherTool(mockWeatherService, input);

      expect(result).toBe('An unexpected error occurred while fetching weather data.');
    });
  });
});