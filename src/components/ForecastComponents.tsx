'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets } from 'lucide-react'

interface HourlyForecast {
  time: string
  temperature: number
  condition: string
  humidity: number
  precipitation: number
  windSpeed: number
}

interface DailyForecast {
  date: string
  day: string
  highTemp: number
  lowTemp: number
  condition: string
  precipitation: number
  humidity: number
  windSpeed: number
}

interface ForecastComponentsProps {
  hourlyData?: HourlyForecast[]
  dailyData?: DailyForecast[]
  unit?: 'celsius' | 'fahrenheit'
}

export default function ForecastComponents({ 
  hourlyData = [], 
  dailyData = [],
  unit = 'celsius' 
}: ForecastComponentsProps) {
  const convertTemp = (temp: number) => {
    return unit === 'celsius' ? temp : Math.round((temp * 9/5) + 32)
  }

  const getWeatherIcon = (condition: string, size = 'w-8 h-8') => {
    const iconClass = `${size} mx-auto mb-2`
    switch(condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className={`${iconClass} text-yellow-400`} />
      case 'rain':
      case 'rainy':
        return <CloudRain className={`${iconClass} text-blue-400`} />
      case 'snow':
      case 'snowy':
        return <CloudSnow className={`${iconClass} text-blue-200`} />
      default:
        return <Cloud className={`${iconClass} text-gray-400`} />
    }
  }

  // Generate sample data if none provided
  const sampleHourlyData: HourlyForecast[] = hourlyData.length > 0 ? hourlyData : 
    Array.from({ length: 24 }, (_, i) => ({
      time: i === 0 ? 'Now' : `${i}:00`,
      temperature: 18 + Math.random() * 12,
      condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
      humidity: Math.floor(Math.random() * 40) + 40,
      precipitation: Math.floor(Math.random() * 100),
      windSpeed: Math.floor(Math.random() * 20) + 5
    }))

  const sampleDailyData: DailyForecast[] = dailyData.length > 0 ? dailyData :
    Array.from({ length: 7 }, (_, i) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const today = new Date()
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
      
      return {
        date: date.toLocaleDateString(),
        day: i === 0 ? 'Today' : days[date.getDay()],
        highTemp: 22 + Math.random() * 8,
        lowTemp: 12 + Math.random() * 8,
        condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
        precipitation: Math.floor(Math.random() * 100),
        humidity: Math.floor(Math.random() * 30) + 50,
        windSpeed: Math.floor(Math.random() * 15) + 5
      }
    })

  return (
    <div className="space-y-8">
      {/* Hourly Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <h3 className="text-2xl font-bold text-white mb-4">24-Hour Forecast</h3>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {sampleHourlyData.map((hour, index) => (
            <motion.div
              key={hour.time}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex-shrink-0"
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 min-w-[140px]">
                <CardContent className="p-4 text-center">
                  <p className="text-gray-300 text-sm font-medium mb-3">
                    {hour.time}
                  </p>
                  
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {getWeatherIcon(hour.condition)}
                  </motion.div>
                  
                  <p className="text-white text-xl font-bold mb-2">
                    {convertTemp(hour.temperature)}°
                  </p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-gray-300">{hour.precipitation}%</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1">
                      <Wind className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-gray-300">{hour.windSpeed}km/h</span>
                    </div>
                  </div>
                  
                  {hour.precipitation > 70 && (
                    <Badge 
                      variant="secondary" 
                      className="mt-2 bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
                    >
                      Heavy Rain
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Daily Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h3 className="text-2xl font-bold text-white mb-4">7-Day Forecast</h3>
        <div className="space-y-3">
          {sampleDailyData.map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-white font-semibold">{day.day}</p>
                        <p className="text-xs text-gray-400">{day.date.split('/').slice(1).join('/')}</p>
                      </div>
                      
                      <motion.div
                        whileHover={{ rotate: 15 }}
                        transition={{ duration: 0.3 }}
                      >
                        {getWeatherIcon(day.condition, 'w-10 h-10')}
                      </motion.div>
                      
                      <div className="text-sm text-gray-300">
                        <p className="capitalize">{day.condition}</p>
                        <div className="flex gap-3 mt-1 text-xs">
                          <span className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-blue-400" />
                            {day.precipitation}%
                          </span>
                          <span className="flex items-center gap-1">
                            <Wind className="w-3 h-3 text-green-400" />
                            {day.windSpeed}km/h
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-white">
                            {convertTemp(day.highTemp)}°
                          </span>
                          <span className="text-lg text-gray-400">
                            {convertTemp(day.lowTemp)}°
                          </span>
                        </div>
                        <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-red-400 rounded-full mt-1"></div>
                      </div>
                      
                      {day.precipitation > 60 && (
                        <Badge 
                          variant="secondary" 
                          className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                        >
                          Rainy
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}