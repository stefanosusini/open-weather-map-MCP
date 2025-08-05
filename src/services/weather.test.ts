/**
 * Tests for WeatherService
 * Tests API client functionality with mocked fetch responses
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WeatherService } from './weather.js';
import type { GeocodingResponse, OneCallResponse } from './weather.types.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('WeatherService', () => {
  let weatherService: WeatherService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    weatherService = new WeatherService(mockApiKey);
    mockFetch.mockClear();
  });

  describe('parseLocation', () => {
    it('should parse coordinates from lat,lon string', async () => {
      const result = await weatherService.parseLocation('40.7128,-74.0060');
      expect(result).toEqual({
        lat: 40.7128,
        lon: -74.0060
      });
    });

    it('should parse negative coordinates', async () => {
      const result = await weatherService.parseLocation('-33.8688,151.2093');
      expect(result).toEqual({
        lat: -33.8688,
        lon: 151.2093
      });
    });

    it('should geocode city names', async () => {
      const mockGeocodingResponse: GeocodingResponse[] = [{
        name: 'London',
        lat: 51.5074,
        lon: -0.1278,
        country: 'GB'
      }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeocodingResponse)
      });

      const result = await weatherService.parseLocation('London');
      expect(result).toEqual({
        lat: 51.5074,
        lon: -0.1278
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('geo/1.0/direct')
      );
    });
  });

  describe('geocodeLocation', () => {
    it('should successfully geocode a city name', async () => {
      const mockResponse: GeocodingResponse[] = [{
        name: 'Paris',
        lat: 48.8566,
        lon: 2.3522,
        country: 'FR'
      }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await weatherService.geocodeLocation('Paris');
      expect(result).toEqual({
        lat: 48.8566,
        lon: 2.3522
      });
    });

    it('should throw error when location not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      await expect(weatherService.geocodeLocation('NonexistentCity'))
        .rejects.toThrow('Location not found: NonexistentCity');
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(weatherService.geocodeLocation('London'))
        .rejects.toThrow('Geocoding failed: 404 Not Found');
    });
  });

  describe('getCurrentWeather', () => {
    it('should fetch current weather successfully', async () => {
      const mockResponse: OneCallResponse = {
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
        hourly: [],
        daily: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const coordinates = { lat: 40.7128, lon: -74.0060 };
      const result = await weatherService.getCurrentWeather(coordinates);
      
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('data/3.0/onecall')
      );
    });

    it('should include units and exclude parameters in request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      const coordinates = { lat: 40.7128, lon: -74.0060 };
      await weatherService.getCurrentWeather(coordinates, 'imperial', ['minutely', 'alerts']);

      const callUrl = (mockFetch.mock.calls[0] as string[])[0];
      expect(callUrl).toContain('units=imperial');
      expect(callUrl).toContain('exclude=minutely%2Calerts');
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      const coordinates = { lat: 40.7128, lon: -74.0060 };
      await expect(weatherService.getCurrentWeather(coordinates))
        .rejects.toThrow('Weather API request failed: 401 Unauthorized');
    });
  });


});