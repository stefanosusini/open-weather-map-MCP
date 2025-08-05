/**
 * OpenWeatherMap API client service
 * Handles HTTP requests to the OpenWeatherMap API v3.0
 */

import {
  OneCallResponse,
  WeatherOverviewResponse,
  HistoricalWeatherResponse,
  GeocodingResponse,
  WeatherUnits,
  WeatherExclude,
  Coordinates
} from '../types/weather.js';

export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Convert city name to coordinates using OpenWeatherMap Geocoding API
   * @param location - City name (e.g., "London", "New York")
   * @returns Promise with coordinates
   */
  async geocodeLocation(location: string): Promise<Coordinates> {
    const url = new URL(`${this.baseUrl}/geo/1.0/direct`);
    url.searchParams.set('q', location);
    url.searchParams.set('limit', '1');
    url.searchParams.set('appid', this.apiKey);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as GeocodingResponse[];
    
    if (data.length === 0) {
      throw new Error(`Location not found: ${location}`);
    }

    return {
      lat: data[0]!.lat,
      lon: data[0]!.lon
    };
  }

  /**
   * Parse location input - handles both city names and "lat,lon" format
   * @param location - Either city name or "lat,lon" coordinates
   * @returns Promise with coordinates
   */
  async parseLocation(location: string): Promise<Coordinates> {
    // Check if location is in "lat,lon" format
    const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (coordPattern.test(location)) {
      const [latStr, lonStr] = location.split(',');
      const lat = Number(latStr);
      const lon = Number(lonStr);
      return { lat, lon };
    }

    // Otherwise, geocode the city name
    return this.geocodeLocation(location);
  }

  /**
   * Get current weather and forecasts using One Call API 3.0
   * @param coordinates - Location coordinates
   * @param units - Temperature units (default: metric)
   * @param exclude - Data sections to exclude
   * @returns Promise with weather data
   */
  async getCurrentWeather(
    coordinates: Coordinates,
    units: WeatherUnits = 'metric',
    exclude?: WeatherExclude[]
  ): Promise<OneCallResponse> {
    const url = new URL(`${this.baseUrl}/data/3.0/onecall`);
    url.searchParams.set('lat', coordinates.lat.toString());
    url.searchParams.set('lon', coordinates.lon.toString());
    url.searchParams.set('appid', this.apiKey);
    url.searchParams.set('units', units);
    
    if (exclude && exclude.length > 0) {
      url.searchParams.set('exclude', exclude.join(','));
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<OneCallResponse>;
  }

  /**
   * Get human-readable weather overview using One Call API 3.0
   * @param coordinates - Location coordinates
   * @param units - Temperature units (default: metric)
   * @returns Promise with weather overview
   */
  async getWeatherOverview(
    coordinates: Coordinates,
    units: WeatherUnits = 'metric'
  ): Promise<WeatherOverviewResponse> {
    const url = new URL(`${this.baseUrl}/data/3.0/onecall/overview`);
    url.searchParams.set('lat', coordinates.lat.toString());
    url.searchParams.set('lon', coordinates.lon.toString());
    url.searchParams.set('appid', this.apiKey);
    url.searchParams.set('units', units);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Weather overview API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<WeatherOverviewResponse>;
  }

  /**
   * Get historical weather data using One Call API 3.0 Time Machine
   * @param coordinates - Location coordinates
   * @param date - Date in YYYY-MM-DD format
   * @param units - Temperature units (default: metric)
   * @returns Promise with historical weather data
   */
  async getHistoricalWeather(
    coordinates: Coordinates,
    date: string,
    units: WeatherUnits = 'metric'
  ): Promise<HistoricalWeatherResponse> {
    // Convert date to Unix timestamp
    const timestamp = Math.floor(new Date(date).getTime() / 1000);
    
    const url = new URL(`${this.baseUrl}/data/3.0/onecall/timemachine`);
    url.searchParams.set('lat', coordinates.lat.toString());
    url.searchParams.set('lon', coordinates.lon.toString());
    url.searchParams.set('dt', timestamp.toString());
    url.searchParams.set('appid', this.apiKey);
    url.searchParams.set('units', units);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Historical weather API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<HistoricalWeatherResponse>;
  }
}