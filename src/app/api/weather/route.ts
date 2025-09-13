import { NextRequest, NextResponse } from 'next/server'

// OpenWeatherMap API configuration
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/3.0'

interface WeatherResponse {
  coord: { lon: number; lat: number }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  base: string
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
    sea_level?: number
    grnd_level?: number
  }
  visibility: number
  wind: {
    speed: number
    deg: number
    gust?: number
  }
  clouds: { all: number }
  dt: number
  sys: {
    type: number
    id: number
    country: string
    sunrise: number
    sunset: number
  }
  timezone: number
  id: number
  name: string
  cod: number
}

interface ForecastResponse {
  cod: string
  message: number
  cnt: number
  list: Array<{
    dt: number
    main: {
      temp: number
      feels_like: number
      temp_min: number
      temp_max: number
      pressure: number
      sea_level: number
      grnd_level: number
      humidity: number
      temp_kf: number
    }
    weather: Array<{
      id: number
      main: string
      description: string
      icon: string
    }>
    clouds: { all: number }
    wind: {
      speed: number
      deg: number
      gust?: number
    }
    visibility: number
    pop: number
    rain?: { '3h': number }
    sys: { pod: string }
    dt_txt: string
  }>
  city: {
    id: number
    name: string
    coord: { lat: number; lon: number }
    country: string
    population: number
    timezone: number
    sunrise: number
    sunset: number
  }
}

interface OneCallResponse {
  lat: number
  lon: number
  timezone: string
  timezone_offset: number
  current: {
    dt: number
    sunrise: number
    sunset: number
    temp: number
    feels_like: number
    pressure: number
    humidity: number
    dew_point: number
    uvi: number
    clouds: number
    visibility: number
    wind_speed: number
    wind_deg: number
    wind_gust?: number
    weather: Array<{
      id: number
      main: string
      description: string
      icon: string
    }>
  }
  hourly: Array<{
    dt: number
    temp: number
    feels_like: number
    pressure: number
    humidity: number
    dew_point: number
    uvi: number
    clouds: number
    visibility: number
    wind_speed: number
    wind_deg: number
    wind_gust?: number
    weather: Array<{
      id: number
      main: string
      description: string
      icon: string
    }>
    pop: number
  }>
  daily: Array<{
    dt: number
    sunrise: number
    sunset: number
    moonrise: number
    moonset: number
    moon_phase: number
    temp: {
      day: number
      min: number
      max: number
      night: number
      eve: number
      morn: number
    }
    feels_like: {
      day: number
      night: number
      eve: number
      morn: number
    }
    pressure: number
    humidity: number
    dew_point: number
    wind_speed: number
    wind_deg: number
    wind_gust?: number
    weather: Array<{
      id: number
      main: string
      description: string
      icon: string
    }>
    clouds: number
    pop: number
    uvi: number
  }>
  alerts?: Array<{
    sender_name: string
    event: string
    start: number
    end: number
    description: string
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const type = searchParams.get('type') || 'current'

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    if (!OPENWEATHER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenWeatherMap API key is not configured' },
        { status: 500 }
      )
    }

    let url = ''
    let data: any

    switch (type) {
      case 'current':
        url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        const currentResponse = await fetch(url)
        if (!currentResponse.ok) {
          throw new Error(`OpenWeatherMap API error: ${currentResponse.statusText}`)
        }
        data = (await currentResponse.json()) as WeatherResponse
        break

      case 'forecast':
        url = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        const forecastResponse = await fetch(url)
        if (!forecastResponse.ok) {
          throw new Error(`OpenWeatherMap API error: ${forecastResponse.statusText}`)
        }
        data = (await forecastResponse.json()) as ForecastResponse
        break

      case 'onecall':
        url = `${OPENWEATHER_BASE_URL}/onecall?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&exclude=minutely`
        const onecallResponse = await fetch(url)
        if (!onecallResponse.ok) {
          throw new Error(`OpenWeatherMap API error: ${onecallResponse.statusText}`)
        }
        data = (await onecallResponse.json()) as OneCallResponse
        break

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter. Use "current", "forecast", or "onecall"' },
          { status: 400 }
        )
    }

    // Add CORS headers
    const response = NextResponse.json(data)
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return response

  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}