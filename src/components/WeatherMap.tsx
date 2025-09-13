'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Note: You'll need to replace this with your actual Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

interface WeatherMapProps {
  center?: [number, number]
  zoom?: number
  weatherData?: any
  onLocationChange?: (lng: number, lat: number) => void
}

export default function WeatherMap({ 
  center = [-122.4194, 37.7749], 
  zoom = 10,
  weatherData,
  onLocationChange 
}: WeatherMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map>()
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || !mapboxgl.accessToken) return

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom,
      pitch: 45,
      bearing: 0,
      antialias: true
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl())

    // Add geolocate control
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }))

    map.current.on('load', () => {
      setMapLoaded(true)
      addWeatherLayers()
      addWeatherMarkers()
    })

    // Handle map click
    map.current.on('click', (e) => {
      if (onLocationChange) {
        onLocationChange(e.lngLat.lng, e.lngLat.lat)
      }
    })

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (mapLoaded && weatherData) {
      updateWeatherLayers()
    }
  }, [mapLoaded, weatherData])

  const addWeatherLayers = () => {
    if (!map.current) return

    // Add 3D terrain
    map.current.addSource('mapbox-dem', {
      'type': 'raster-dem',
      'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
      'tileSize': 512,
      'maxzoom': 14
    })

    map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 })

    // Add atmosphere layer
    map.current.setFog({
      'color': 'rgb(186, 210, 235)', // Fog color
      'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
      'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
      'space-color': 'rgb(11, 11, 25)', // Background color
      'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
    })

    // Add precipitation layer (simulated)
    map.current.addSource('precipitation', {
      'type': 'raster',
      'tiles': [
        'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY'
      ],
      'tileSize': 256
    })

    map.current.addLayer({
      'id': 'precipitation',
      'type': 'raster',
      'source': 'precipitation',
      'paint': {
        'raster-opacity': 0.6,
        'raster-fade-duration': 0
      }
    })

    // Add temperature layer (simulated)
    map.current.addSource('temperature', {
      'type': 'raster',
      'tiles': [
        'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY'
      ],
      'tileSize': 256
    })

    map.current.addLayer({
      'id': 'temperature',
      'type': 'raster',
      'source': 'temperature',
      'paint': {
        'raster-opacity': 0.4,
        'raster-fade-duration': 0
      }
    })

    // Add wind layer (simulated)
    map.current.addSource('wind', {
      'type': 'raster',
      'tiles': [
        'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY'
      ],
      'tileSize': 256
    })

    map.current.addLayer({
      'id': 'wind',
      'type': 'raster',
      'source': 'wind',
      'paint': {
        'raster-opacity': 0.5,
        'raster-fade-duration': 0
      }
    })
  }

  const addWeatherMarkers = () => {
    if (!map.current) return

    // Add sample weather stations
    const weatherStations = [
      { coords: [-122.4194, 37.7749], temp: 22, condition: 'partly-cloudy' },
      { coords: [-122.4594, 37.7849], temp: 20, condition: 'cloudy' },
      { coords: [-122.3794, 37.7649], temp: 24, condition: 'sunny' },
      { coords: [-122.4294, 37.7549], temp: 18, condition: 'rainy' }
    ]

    weatherStations.forEach((station, index) => {
      const el = document.createElement('div')
      el.className = 'weather-marker'
      el.innerHTML = `
        <div class="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/20">
          <div class="text-sm font-semibold text-gray-800">${station.temp}°C</div>
          <div class="text-xs text-gray-600">${station.condition}</div>
        </div>
      `

      new mapboxgl.Marker(el)
        .setLngLat(station.coords)
        .addTo(map.current!)
    })
  }

  const updateWeatherLayers = () => {
    // Update layers based on weather data
    if (!map.current) return

    // This would typically update the map with real weather data
    // For now, we'll just ensure layers are visible
    const layers = ['precipitation', 'temperature', 'wind']
    layers.forEach(layerId => {
      if (map.current!.getLayer(layerId)) {
        map.current!.setLayoutProperty(layerId, 'visibility', 'visible')
      }
    })
  }

  const toggleLayer = (layerId: string) => {
    if (!map.current) return

    const layer = map.current.getLayer(layerId)
    if (layer) {
      const visibility = map.current.getLayoutProperty(layerId, 'visibility')
      map.current.setLayoutProperty(
        layerId,
        'visibility',
        visibility === 'visible' ? 'none' : 'visible'
      )
    }
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full min-h-[400px]" />
      
      {/* Layer controls */}
      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-3 space-y-2">
        <button
          onClick={() => toggleLayer('precipitation')}
          className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded"
        >
          Precipitation
        </button>
        <button
          onClick={() => toggleLayer('temperature')}
          className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded"
        >
          Temperature
        </button>
        <button
          onClick={() => toggleLayer('wind')}
          className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded"
        >
          Wind
        </button>
      </div>

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white">Loading map...</div>
        </div>
      )}

      <style jsx>{`
        .weather-marker {
          transition: all 0.3s ease;
        }
        .weather-marker:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  )
}