'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CloudRain, Wind, Snowflake, Thermometer, MapPin, Bell, BellOff, X } from 'lucide-react'

interface WeatherAlert {
  id: string
  type: 'severe' | 'moderate' | 'minor'
  category: 'storm' | 'rain' | 'wind' | 'snow' | 'temperature' | 'other'
  title: string
  description: string
  location: string
  severity: number // 1-10
  startTime: string
  endTime: string
  isActive: boolean
}

interface LocationAlert {
  id: string
  location: string
  lat: number
  lng: number
  alertTypes: string[]
  enabled: boolean
}

interface WeatherAlertsProps {
  userLocation?: { lat: number; lng: number; city: string }
}

export default function WeatherAlerts({ userLocation }: WeatherAlertsProps) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [locationAlerts, setLocationAlerts] = useState<LocationAlert[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    // Simulate fetching weather alerts
    const fetchAlerts = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockAlerts: WeatherAlert[] = [
        {
          id: '1',
          type: 'severe',
          category: 'storm',
          title: 'Severe Thunderstorm Warning',
          description: 'Severe thunderstorms expected with damaging winds up to 90 km/h and large hail. Seek shelter immediately.',
          location: 'San Francisco Bay Area',
          severity: 8,
          startTime: '2024-01-15T14:00:00Z',
          endTime: '2024-01-15T20:00:00Z',
          isActive: true
        },
        {
          id: '2',
          type: 'moderate',
          category: 'rain',
          title: 'Heavy Rain Advisory',
          description: 'Heavy rainfall may cause flooding in low-lying areas. Drive with caution and avoid flooded roads.',
          location: 'San Francisco, CA',
          severity: 6,
          startTime: '2024-01-15T16:00:00Z',
          endTime: '2024-01-16T02:00:00Z',
          isActive: true
        },
        {
          id: '3',
          type: 'minor',
          category: 'wind',
          title: 'Wind Advisory',
          description: 'Gusty winds up to 45 km/h expected. Secure outdoor objects and be cautious while driving.',
          location: 'Coastal Areas',
          severity: 4,
          startTime: '2024-01-15T12:00:00Z',
          endTime: '2024-01-15T23:59:00Z',
          isActive: true
        }
      ]
      
      setAlerts(mockAlerts)
    }

    fetchAlerts()

    // Load saved location alerts
    const savedLocationAlerts = localStorage.getItem('locationAlerts')
    if (savedLocationAlerts) {
      setLocationAlerts(JSON.parse(savedLocationAlerts))
    } else if (userLocation) {
      // Create default location alert for user's location
      const defaultAlert: LocationAlert = {
        id: 'default',
        location: userLocation.city,
        lat: userLocation.lat,
        lng: userLocation.lng,
        alertTypes: ['severe', 'moderate'],
        enabled: true
      }
      setLocationAlerts([defaultAlert])
    }
  }, [userLocation])

  useEffect(() => {
    // Save location alerts to localStorage
    localStorage.setItem('locationAlerts', JSON.stringify(locationAlerts))
  }, [locationAlerts])

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'storm':
        return <AlertTriangle className="w-6 h-6" />
      case 'rain':
        return <CloudRain className="w-6 h-6" />
      case 'wind':
        return <Wind className="w-6 h-6" />
      case 'snow':
        return <Snowflake className="w-6 h-6" />
      case 'temperature':
        return <Thermometer className="w-6 h-6" />
      default:
        return <AlertTriangle className="w-6 h-6" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'severe':
        return 'from-red-500/20 to-red-600/20 border-red-500/30'
      case 'moderate':
        return 'from-orange-500/20 to-yellow-500/20 border-orange-500/30'
      case 'minor':
        return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30'
    }
  }

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'severe':
        return 'bg-red-500 text-white'
      case 'moderate':
        return 'bg-orange-500 text-white'
      case 'minor':
        return 'bg-yellow-500 text-gray-900'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const toggleLocationAlert = (alertId: string) => {
    setLocationAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, enabled: !alert.enabled }
          : alert
      )
    )
  }

  const addLocationAlert = () => {
    if (userLocation) {
      const newAlert: LocationAlert = {
        id: Date.now().toString(),
        location: userLocation.city,
        lat: userLocation.lat,
        lng: userLocation.lng,
        alertTypes: ['severe'],
        enabled: true
      }
      setLocationAlerts(prev => [...prev, newAlert])
    }
  }

  const activeAlerts = alerts.filter(alert => alert.isActive)

  return (
    <div className="space-y-6">
      {/* Alert Notifications */}
      <AnimatePresence>
        {activeAlerts.length > 0 && notificationsEnabled && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {activeAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`bg-gradient-to-r ${getAlertColor(alert.type)} backdrop-blur-lg border shadow-lg`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          alert.type === 'severe' ? 'bg-red-500/20' :
                          alert.type === 'moderate' ? 'bg-orange-500/20' :
                          'bg-yellow-500/20'
                        }`}>
                          {getAlertIcon(alert.category)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-semibold">{alert.title}</h4>
                            <Badge className={getAlertBadgeColor(alert.type)}>
                              {alert.type.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{alert.location}</span>
                          </div>
                          
                          <p className="text-gray-200 text-sm mb-2">{alert.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>Start: {new Date(alert.startTime).toLocaleTimeString()}</span>
                            <span>End: {new Date(alert.endTime).toLocaleTimeString()}</span>
                            <div className="flex items-center gap-1">
                              <span>Severity:</span>
                              <div className="flex gap-1">
                                {[...Array(10)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-4 rounded-sm ${
                                      i < alert.severity 
                                        ? alert.type === 'severe' ? 'bg-red-500' :
                                          alert.type === 'moderate' ? 'bg-orange-500' :
                                          'bg-yellow-500'
                                        : 'bg-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="text-gray-400 hover:text-white hover:bg-white/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Management */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Weather Alerts</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSetup(!showSetup)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Manage Locations
              </Button>
            </div>
          </div>

          {/* Location Alerts Setup */}
          {showSetup && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10 pt-4 mt-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">Alert Locations</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addLocationAlert}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Add Current Location
                  </Button>
                </div>
                
                {locationAlerts.map((locationAlert) => (
                  <div
                    key={locationAlert.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-white font-medium">{locationAlert.location}</p>
                        <p className="text-xs text-gray-400">
                          {locationAlert.lat.toFixed(2)}, {locationAlert.lng.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {locationAlert.alertTypes.map((type) => (
                          <Badge
                            key={type}
                            variant="secondary"
                            className={`text-xs ${
                              type === 'severe' ? 'bg-red-500/20 text-red-300' :
                              type === 'moderate' ? 'bg-orange-500/20 text-orange-300' :
                              'bg-yellow-500/20 text-yellow-300'
                            }`}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleLocationAlert(locationAlert.id)}
                        className={`text-xs ${
                          locationAlert.enabled 
                            ? 'bg-green-500/20 border-green-500/30 text-green-300' 
                            : 'bg-gray-500/20 border-gray-500/30 text-gray-400'
                        }`}
                      >
                        {locationAlert.enabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Alert Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="text-2xl font-bold text-red-400">
                {activeAlerts.filter(a => a.type === 'severe').length}
              </div>
              <div className="text-sm text-red-300">Severe Alerts</div>
            </div>
            
            <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-400">
                {activeAlerts.filter(a => a.type === 'moderate').length}
              </div>
              <div className="text-sm text-orange-300">Moderate Alerts</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400">
                {activeAlerts.filter(a => a.type === 'minor').length}
              </div>
              <div className="text-sm text-yellow-300">Minor Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}