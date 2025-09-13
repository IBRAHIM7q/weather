'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { X, Settings, Palette, Thermometer, Globe, Bell, Zap } from 'lucide-react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  currentUnit: 'celsius' | 'fahrenheit'
  onUnitChange: (unit: 'celsius' | 'fahrenheit') => void
  currentTheme: string
  onThemeChange: (theme: string) => void
}

interface Settings {
  unit: 'celsius' | 'fahrenheit'
  theme: 'dark' | 'light' | 'neon' | 'holographic'
  animations: boolean
  highPerformance: boolean
  notifications: boolean
  autoLocation: boolean
  mapStyle: 'dark' | 'light' | 'satellite' | 'streets'
  refreshInterval: number // minutes
}

export default function SettingsPanel({ 
  isOpen, 
  onClose, 
  currentUnit, 
  onUnitChange, 
  currentTheme, 
  onThemeChange 
}: SettingsPanelProps) {
  const [settings, setSettings] = useState<Settings>({
    unit: currentUnit,
    theme: currentTheme as any,
    animations: true,
    highPerformance: false,
    notifications: true,
    autoLocation: true,
    mapStyle: 'dark',
    refreshInterval: 10
  })

  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('weatherDashboardSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveSettings = () => {
    localStorage.setItem('weatherDashboardSettings', JSON.stringify(settings))
    onUnitChange(settings.unit)
    onThemeChange(settings.theme)
    setHasChanges(false)
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', settings.theme)
    
    // Apply performance settings
    if (settings.highPerformance) {
      document.documentElement.setAttribute('data-performance', 'high')
    } else {
      document.documentElement.removeAttribute('data-performance')
    }
    
    // Apply animations setting
    if (settings.animations) {
      document.documentElement.setAttribute('data-animations', 'enabled')
    } else {
      document.documentElement.setAttribute('data-animations', 'disabled')
    }
  }

  const resetSettings = () => {
    const defaultSettings: Settings = {
      unit: 'celsius',
      theme: 'dark',
      animations: true,
      highPerformance: false,
      notifications: true,
      autoLocation: true,
      mapStyle: 'dark',
      refreshInterval: 10
    }
    setSettings(defaultSettings)
    setHasChanges(true)
  }

  const themeOptions = [
    { value: 'dark', label: 'Dark Mode', color: 'bg-gray-800' },
    { value: 'light', label: 'Light Mode', color: 'bg-gray-200' },
    { value: 'neon', label: 'Neon', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { value: 'holographic', label: 'Holographic', color: 'bg-gradient-to-r from-cyan-500 to-blue-500' }
  ]

  const mapStyleOptions = [
    { value: 'dark', label: 'Dark Theme' },
    { value: 'light', label: 'Light Theme' },
    { value: 'satellite', label: 'Satellite' },
    { value: 'streets', label: 'Streets' }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Settings</h2>
                <p className="text-gray-400 text-sm">Customize your weather dashboard experience</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Settings Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-6">
              {/* Units */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Thermometer className="w-5 h-5" />
                    Units
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="unit-toggle" className="text-gray-300">
                      Temperature Unit
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${settings.unit === 'celsius' ? 'text-white' : 'text-gray-400'}`}>
                        °C
                      </span>
                      <Switch
                        id="unit-toggle"
                        checked={settings.unit === 'fahrenheit'}
                        onCheckedChange={(checked) => 
                          updateSetting('unit', checked ? 'fahrenheit' : 'celsius')
                        }
                      />
                      <span className={`text-sm ${settings.unit === 'fahrenheit' ? 'text-white' : 'text-gray-400'}`}>
                        °F
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Palette className="w-5 h-5" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300 mb-3 block">Theme</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {themeOptions.map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => updateSetting('theme', theme.value as any)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 relative overflow-hidden ${
                            settings.theme === theme.value
                              ? 'border-white/50 bg-white/10 ring-2 ring-white/30'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-full h-12 rounded mb-2 ${theme.color}`}></div>
                          <span className="text-sm text-gray-300 relative z-10">{theme.label}</span>
                          {settings.theme === theme.value && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300 mb-3 block">Map Style</Label>
                    <Select 
                      value={settings.mapStyle} 
                      onValueChange={(value) => updateSetting('mapStyle', value as any)}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mapStyleOptions.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Performance */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="w-5 h-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="animations" className="text-gray-300">
                        Animations
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">Enable smooth animations and transitions</p>
                    </div>
                    <Switch
                      id="animations"
                      checked={settings.animations}
                      onCheckedChange={(checked) => updateSetting('animations', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="high-performance" className="text-gray-300">
                        High Performance Mode
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">Reduce visual effects for better performance</p>
                    </div>
                    <Switch
                      id="high-performance"
                      checked={settings.highPerformance}
                      onCheckedChange={(checked) => updateSetting('highPerformance', checked)}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 mb-3 block">
                      Refresh Interval: {settings.refreshInterval} minutes
                    </Label>
                    <Slider
                      value={[settings.refreshInterval]}
                      onValueChange={(value) => updateSetting('refreshInterval', value[0])}
                      max={60}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location & Notifications */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Globe className="w-5 h-5" />
                    Location & Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-location" className="text-gray-300">
                        Auto-detect Location
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">Use your current location automatically</p>
                    </div>
                    <Switch
                      id="auto-location"
                      checked={settings.autoLocation}
                      onCheckedChange={(checked) => updateSetting('autoLocation', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications" className="text-gray-300">
                        Weather Alerts
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">Receive severe weather notifications</p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={settings.notifications}
                      onCheckedChange={(checked) => updateSetting('notifications', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
                  Unsaved changes
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetSettings}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Reset to Default
              </Button>
              <Button
                onClick={saveSettings}
                disabled={!hasChanges}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}