'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, Eye, Thermometer, MapPin, Settings, Search } from 'lucide-react'
import WeatherBackground from '@/components/WeatherBackground'
import WeatherMap from '@/components/WeatherMap'
import ForecastComponents from '@/components/ForecastComponents'
import WeatherAlerts from '@/components/WeatherAlerts'
import SettingsPanel from '@/components/SettingsPanel'
import WeatherService, { WeatherData, HourlyForecast, DailyForecast, WeatherAlert } from '@/lib/weatherService'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface WeatherDashboardProps {
  // Empty interface for future props
}

export default function WeatherDashboard({}: WeatherDashboardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([])
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([])
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius')
  const [searchQuery, setSearchQuery] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number; city: string } | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [weatherService] = useState(() => WeatherService.getInstance())
  const [isClient, setIsClient] = useState(false)
  const [theme, setTheme] = useState('dark')

  // Fix hydration mismatch by only running client-side
  useEffect(() => {
    setIsClient(true)
    
    // Load saved theme
    const savedTheme = localStorage.getItem('weatherDashboardTheme')
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
    
    fetchWeatherData()
  }, [])

  useEffect(() => {
    // Apply theme changes
    if (isClient) {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('weatherDashboardTheme', theme)
    }
  }, [theme, isClient])

  const fetchWeatherData = async (lat?: number, lon?: number) => {
    try {
      setLoading(true)
      
      let coordinates = { lat, lon }
      
      // Use current location if no coordinates provided
      if (!lat || !lon) {
        try {
          const position = await weatherService.getCurrentPosition()
          coordinates = { lat: position.lat, lon: position.lon }
          setUserLocation({
            lat: position.lat,
            lon: position.lon,
            city: 'Current Location'
          })
        } catch (error) {
          // Fallback to default location (San Francisco)
          coordinates = { lat: 37.7749, lon: -122.4194 }
          setUserLocation({
            lat: 37.7749,
            lon: -122.4194,
            city: 'San Francisco, CA'
          })
        }
      }

      // Fetch all weather data in parallel
      const [currentWeather, hourly, daily, weatherAlerts] = await Promise.all([
        weatherService.getCurrentWeather(coordinates.lat, coordinates.lon),
        weatherService.getHourlyForecast(coordinates.lat, coordinates.lon),
        weatherService.getDailyForecast(coordinates.lat, coordinates.lon),
        weatherService.getWeatherAlerts(coordinates.lat, coordinates.lon)
      ])

      setWeather(currentWeather)
      setHourlyForecast(hourly)
      setDailyForecast(daily)
      setAlerts(weatherAlerts)
      
      if (!userLocation) {
        setUserLocation({
          lat: coordinates.lat,
          lon: coordinates.lon,
          city: currentWeather.location
        })
      }
      
    } catch (error) {
      console.error('Error fetching weather data:', error)
      // Set fallback data
      setWeather({
        location: 'Unknown Location',
        temperature: 20,
        condition: 'Unknown',
        humidity: 50,
        windSpeed: 10,
        visibility: 10,
        feelsLike: 20,
        icon: '01d',
        pressure: 1013,
        coordinates: { lat: 0, lon: 0 }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      setSearchError(null)
      
      const result = await weatherService.getWeatherByCity(searchQuery)
      
      setWeather(result.weather)
      setUserLocation({
        lat: result.coordinates.lat,
        lon: result.coordinates.lon,
        city: result.weather.location
      })

      // Fetch additional data for the new location
      const [hourly, daily, weatherAlerts] = await Promise.all([
        weatherService.getHourlyForecast(result.coordinates.lat, result.coordinates.lon),
        weatherService.getDailyForecast(result.coordinates.lat, result.coordinates.lon),
        weatherService.getWeatherAlerts(result.coordinates.lat, result.coordinates.lon)
      ])

      setHourlyForecast(hourly)
      setDailyForecast(daily)
      setAlerts(weatherAlerts)
      setSearchQuery('') // Clear search after successful search
      
    } catch (error) {
      console.error('Error searching for city:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to search for city'
      setSearchError(errorMessage)
      
      // Show error for 3 seconds
      setTimeout(() => {
        setSearchError(null)
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  const convertTemp = (temp: number) => {
    return unit === 'celsius' ? temp : Math.round((temp * 9/5) + 32)
  }

  const getWeatherIcon = (icon: string) => {
    // Map OpenWeatherMap icon codes to our components
    if (icon.includes('01')) return <Sun className="w-16 h-16 text-yellow-400" />
    if (icon.includes('02') || icon.includes('03') || icon.includes('04')) return <Cloud className="w-16 h-16 text-gray-400" />
    if (icon.includes('09') || icon.includes('10')) return <CloudRain className="w-16 h-16 text-blue-400" />
    if (icon.includes('13')) return <CloudSnow className="w-16 h-16 text-blue-200" />
    return <Cloud className="w-16 h-16 text-gray-400" />
  }

  return (
    <div className="min-h-screen transition-all duration-300" data-theme={isClient ? theme : 'dark'}>
      {/* Only render 3D background on client-side */}
      {isClient && (
        <WeatherBackground weatherCondition={weather?.condition.toLowerCase().includes('clear') ? 'sunny' : 'cloudy'} />
      )}
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" style={{ backgroundColor: `rgb(var(--blob-color-1))` }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" style={{ backgroundColor: `rgb(var(--blob-color-2))` }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" style={{ backgroundColor: `rgb(var(--blob-color-3))` }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 lg:mb-8 gap-4 lg:gap-6"
        >
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 lg:mb-2 leading-tight">
              AetherWeather
            </h1>
            <p className="text-base sm:text-lg text-gray-300">Futuristic Weather Dashboard</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 w-full sm:w-48 lg:w-56 text-sm sm:text-base pr-10"
                />
                {searchError && (
                  <div className="absolute -bottom-8 left-0 right-0 text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-500/30 whitespace-nowrap overflow-hidden text-ellipsis">
                    {searchError}
                  </div>
                )}
              </div>
              <Button type="submit" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex-shrink-0">
                <Search className="w-4 h-4" />
              </Button>
            </form>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex-shrink-0 px-3 sm:px-4"
              >
                °{unit === 'celsius' ? 'C' : 'F'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsSettingsOpen(true)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex-shrink-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Main weather card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="weather-card overflow-hidden">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {loading ? (
                <div className="space-y-6">
                  <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-32 sm:h-8 sm:w-48 mx-auto" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-16 sm:h-20 w-full" />
                    ))}
                  </div>
                </div>
              ) : weather && (
                <div className="text-center">
                  {/* Location and main weather */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 flex-shrink-0" />
                    <h2 className="text-lg sm:text-xl md:text-2xl text-white font-medium truncate px-2">
                      {weather.location}
                    </h2>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mb-6 sm:mb-8">
                    <div className="text-center">
                      {getWeatherIcon(weather.icon)}
                      <p className="text-gray-300 mt-2 text-sm sm:text-base capitalize">
                        {weather.condition}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-none">
                        {convertTemp(weather.temperature)}°
                      </div>
                      <p className="text-gray-300 mt-2 text-sm sm:text-base">
                        Feels like {convertTemp(weather.feelsLike)}°
                      </p>
                    </div>
                  </div>

                  {/* Weather details grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="weather-card">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <Droplets className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mx-auto mb-1 sm:mb-2" />
                        <p className="text-gray-300 text-xs sm:text-sm">Humidity</p>
                        <p className="text-white text-lg sm:text-xl font-semibold">
                          {weather.humidity}%
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="weather-card">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <Wind className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-1 sm:mb-2" />
                        <p className="text-gray-300 text-xs sm:text-sm">Wind</p>
                        <p className="text-white text-lg sm:text-xl font-semibold">
                          {weather.windSpeed} km/h
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="weather-card">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mx-auto mb-1 sm:mb-2" />
                        <p className="text-gray-300 text-xs sm:text-sm">Visibility</p>
                        <p className="text-white text-lg sm:text-xl font-semibold">
                          {weather.visibility} km
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="weather-card">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <Thermometer className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 mx-auto mb-1 sm:mb-2" />
                        <p className="text-gray-300 text-xs sm:text-sm">Pressure</p>
                        <p className="text-white text-lg sm:text-xl font-semibold">
                          {weather.pressure} hPa
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Forecast Components */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-6xl mx-auto mt-6 lg:mt-8"
        >
          <ForecastComponents 
            hourlyData={hourlyForecast} 
            dailyData={dailyForecast} 
            unit={unit} 
          />
        </motion.div>

        {/* Interactive Weather Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-6xl mx-auto mt-6 lg:mt-8"
        >
          <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 lg:mb-4">Interactive Weather Map</h3>
          <Card className="weather-card">
            <CardContent className="p-0">
              <div className="h-64 sm:h-80 lg:h-96">
                <WeatherMap 
                  center={userLocation ? [userLocation.lon, userLocation.lat] : [-122.4194, 37.7749]}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weather Alerts System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="max-w-6xl mx-auto mt-6 lg:mt-8"
        >
          <WeatherAlerts userLocation={userLocation} alerts={alerts} />
        </motion.div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUnit={unit}
        onUnitChange={setUnit}
        currentTheme={theme}
        onThemeChange={setTheme}
      />

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}