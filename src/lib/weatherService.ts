// Weather service for handling API calls and data transformation

export interface WeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  visibility: number
  feelsLike: number
  icon: string
  pressure: number
  uvIndex?: number
  coordinates: {
    lat: number
    lon: number
  }
}

export interface HourlyForecast {
  time: string
  temperature: number
  condition: string
  humidity: number
  precipitation: number
  windSpeed: number
  icon: string
}

export interface DailyForecast {
  date: string
  day: string
  highTemp: number
  lowTemp: number
  condition: string
  precipitation: number
  humidity: number
  windSpeed: number
  icon: string
  uvIndex?: number
}

export interface WeatherAlert {
  id: string
  type: 'severe' | 'moderate' | 'minor'
  category: 'storm' | 'rain' | 'wind' | 'snow' | 'temperature' | 'other'
  title: string
  description: string
  location: string
  severity: number
  startTime: string
  endTime: string
  isActive: boolean
}

class WeatherService {
  private static instance: WeatherService
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService()
    }
    return WeatherService.instance
  }

  private getCacheKey(endpoint: string, params: Record<string, any>): string {
    return `${endpoint}-${JSON.stringify(params)}`
  }

  private isDataExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.CACHE_DURATION
  }

  private async fetchWithCache(endpoint: string, params: Record<string, any> = {}) {
    const cacheKey = this.getCacheKey(endpoint, params)
    const cached = this.cache.get(cacheKey)

    if (cached && !this.isDataExpired(cached.timestamp)) {
      return cached.data
    }

    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `/api/${endpoint}${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      
      return data
    } catch (error) {
      console.error('Weather API fetch error:', error)
      throw error
    }
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const data = await this.fetchWithCache('weather', { lat, lon, type: 'current' })
      
      return {
        location: `${data.name}, ${data.sys.country}`,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        visibility: data.visibility / 1000, // Convert to km
        feelsLike: Math.round(data.main.feels_like),
        icon: data.weather[0].icon,
        pressure: data.main.pressure,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon
        }
      }
    } catch (error) {
      // Return mock data if API fails
      return {
        location: 'Unknown Location',
        temperature: 20,
        condition: 'Unknown',
        humidity: 50,
        windSpeed: 10,
        visibility: 10,
        feelsLike: 20,
        icon: '01d',
        pressure: 1013,
        coordinates: { lat, lon }
      }
    }
  }

  async getHourlyForecast(lat: number, lon: number): Promise<HourlyForecast[]> {
    try {
      const data = await this.fetchWithCache('weather', { lat, lon, type: 'forecast' })
      
      return data.list.slice(0, 24).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          hour12: false 
        }),
        temperature: Math.round(item.main.temp),
        condition: item.weather[0].description,
        humidity: item.main.humidity,
        precipitation: Math.round(item.pop * 100),
        windSpeed: Math.round(item.wind.speed * 3.6),
        icon: item.weather[0].icon
      }))
    } catch (error) {
      // Return mock data if API fails
      return Array.from({ length: 24 }, (_, i) => ({
        time: i === 0 ? 'Now' : `${i}:00`,
        temperature: 18 + Math.random() * 12,
        condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
        humidity: Math.floor(Math.random() * 40) + 40,
        precipitation: Math.floor(Math.random() * 100),
        windSpeed: Math.floor(Math.random() * 20) + 5,
        icon: '01d'
      }))
    }
  }

  async getDailyForecast(lat: number, lon: number): Promise<DailyForecast[]> {
    try {
      const data = await this.fetchWithCache('weather', { lat, lon, type: 'onecall' })
      
      return data.daily.slice(0, 7).map((item: any, index: number) => {
        const date = new Date(item.dt * 1000)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        
        return {
          date: date.toLocaleDateString(),
          day: index === 0 ? 'Today' : days[date.getDay()],
          highTemp: Math.round(item.temp.max),
          lowTemp: Math.round(item.temp.min),
          condition: item.weather[0].description,
          precipitation: Math.round(item.pop * 100),
          humidity: item.humidity,
          windSpeed: Math.round(item.wind_speed * 3.6),
          icon: item.weather[0].icon,
          uvIndex: item.uvi
        }
      })
    } catch (error) {
      // Return mock data if API fails
      return Array.from({ length: 7 }, (_, i) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const today = new Date()
        const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
        
        return {
          date: date.toLocaleDateString(),
          day: i === 0 ? 'Today' : days[date.getDay()],
          highTemp: 22 + Math.random() * 8,
          lowTemp: 12 + Math.random() * 8,
          condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
          precipitation: Math.floor(Math.random() * 100),
          humidity: Math.floor(Math.random() * 30) + 50,
          windSpeed: Math.floor(Math.random() * 15) + 5,
          icon: '01d'
        }
      })
    }
  }

  async getWeatherAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
    try {
      const data = await this.fetchWithCache('weather', { lat, lon, type: 'onecall' })
      
      if (!data.alerts) {
        return []
      }

      return data.alerts.map((alert: any, index: number) => {
        // Determine alert type and severity based on the event description
        let type: 'severe' | 'moderate' | 'minor' = 'moderate'
        let category: 'storm' | 'rain' | 'wind' | 'snow' | 'temperature' | 'other' = 'other'
        let severity = 5

        const event = alert.event.toLowerCase()
        
        if (event.includes('severe') || event.includes('extreme') || event.includes('warning')) {
          type = 'severe'
          severity = 8
        } else if (event.includes('watch') || event.includes('advisory')) {
          type = 'moderate'
          severity = 6
        } else {
          type = 'minor'
          severity = 3
        }

        if (event.includes('storm') || event.includes('thunder')) {
          category = 'storm'
        } else if (event.includes('rain') || event.includes('flood')) {
          category = 'rain'
        } else if (event.includes('wind')) {
          category = 'wind'
        } else if (event.includes('snow') || event.includes('winter')) {
          category = 'snow'
        } else if (event.includes('temperature') || event.includes('heat') || event.includes('cold')) {
          category = 'temperature'
        }

        return {
          id: `alert-${index}`,
          type,
          category,
          title: alert.event,
          description: alert.description,
          location: 'Current Area',
          severity,
          startTime: new Date(alert.start * 1000).toISOString(),
          endTime: new Date(alert.end * 1000).toISOString(),
          isActive: true
        }
      })
    } catch (error) {
      // Return mock data if API fails
      return []
    }
  }

  async getWeatherByCity(cityName: string): Promise<{ weather: WeatherData; coordinates: { lat: number; lon: number } }> {
    try {
      // First get coordinates for the city using OpenWeatherMap Geocoding API
      const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`
      const geocodingResponse = await fetch(geocodingUrl)
      
      if (!geocodingResponse.ok) {
        throw new Error(`Failed to geocode city: ${geocodingResponse.statusText}`)
      }

      const geocodingData = await geocodingResponse.json()
      
      if (!geocodingData || geocodingData.length === 0) {
        throw new Error(`City "${cityName}" not found`)
      }

      const { lat, lon, name, country } = geocodingData[0]
      const weather = await this.getCurrentWeather(lat, lon)
      
      // Update the weather location with the proper city name and country
      weather.location = `${name}, ${country}`
      
      return { weather, coordinates: { lat, lon } }
    } catch (error) {
      console.error('Error getting weather by city:', error)
      throw new Error(`Failed to get weather for ${cityName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get user's current location
  async getCurrentPosition(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`))
        }
      )
    })
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache status
  getCacheStatus(): { entries: number; size: number } {
    return {
      entries: this.cache.size,
      size: JSON.stringify([...this.cache.values()]).length
    }
  }
}

export default WeatherService