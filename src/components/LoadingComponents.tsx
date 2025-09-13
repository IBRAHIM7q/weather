'use client'

import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { Cloud, Droplets, Wind, Eye, Thermometer } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'simple' | 'detailed'
}

export function LoadingSpinner({ size = 'md', variant = 'simple' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  if (variant === 'simple') {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`border-2 border-white/20 border-t-white rounded-full ${sizeClasses[size]}`}
      />
    )
  }

  return (
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} border-2 border-transparent border-t-blue-400 border-r-purple-400 rounded-full`}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} border-2 border-transparent border-t-cyan-400 border-b-pink-400 rounded-full absolute inset-0`}
      />
    </div>
  )
}

interface WeatherCardLoaderProps {
  count?: number
}

export function WeatherCardLoader({ count = 1 }: WeatherCardLoaderProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white/10 backdrop-blur-lg border-white/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Skeleton className="w-8 h-8 mx-auto mb-2" />
              <Skeleton className="h-3 w-12 mx-auto" />
              <Skeleton className="h-4 w-8 mx-auto mt-1" />
            </div>
            <div className="text-center">
              <Skeleton className="w-8 h-8 mx-auto mb-2" />
              <Skeleton className="h-3 w-12 mx-auto" />
              <Skeleton className="h-4 w-8 mx-auto mt-1" />
            </div>
            <div className="text-center">
              <Skeleton className="w-8 h-8 mx-auto mb-2" />
              <Skeleton className="h-3 w-12 mx-auto" />
              <Skeleton className="h-4 w-8 mx-auto mt-1" />
            </div>
            <div className="text-center">
              <Skeleton className="w-8 h-8 mx-auto mb-2" />
              <Skeleton className="h-3 w-12 mx-auto" />
              <Skeleton className="h-4 w-8 mx-auto mt-1" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

interface ForecastLoaderProps {
  type?: 'hourly' | 'daily'
  count?: number
}

export function ForecastLoader({ type = 'hourly', count = 8 }: ForecastLoaderProps) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className={`flex gap-3 overflow-x-auto ${type === 'hourly' ? '' : 'flex-col'}`}>
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`bg-white/10 backdrop-blur-lg border-white/20 rounded-lg p-4 flex-shrink-0 ${
              type === 'hourly' ? 'min-w-[120px]' : 'w-full'
            }`}
          >
            <div className="text-center">
              <Skeleton className="h-4 w-12 mx-auto mb-3" />
              <Skeleton className="w-8 h-8 mx-auto mb-2" />
              <Skeleton className="h-5 w-10 mx-auto mb-2" />
              <Skeleton className="h-3 w-8 mx-auto" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

interface MapLoaderProps {
  height?: string
}

export function MapLoader({ height = '400px' }: MapLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative bg-white/5 border-white/20 rounded-lg overflow-hidden"
      style={{ height }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" variant="detailed" />
          <p className="text-white/60 mt-4 text-sm">Loading map...</p>
        </div>
      </div>
      
      {/* Simulated map features */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 gap-1 h-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-full" />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

interface FullPageLoaderProps {
  message?: string
}

export function FullPageLoader({ message = 'Loading weather data...' }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <LoadingSpinner size="lg" variant="detailed" />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-white/80 mt-6 text-lg"
        >
          {message}
        </motion.p>
        
        {/* Animated weather icons */}
        <div className="flex justify-center gap-4 mt-8">
          {[Cloud, Droplets, Wind, Eye, Thermometer].map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="text-white/40"
            >
              <Icon className="w-6 h-6" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

interface ComponentLoaderProps {
  children: React.ReactNode
  isLoading: boolean
  fallback?: React.ReactNode
}

export function ComponentLoader({ children, isLoading, fallback }: ComponentLoaderProps) {
  if (isLoading) {
    return fallback || <LoadingSpinner />
  }

  return <>{children}</>
}

// Performance monitoring utilities
export const PerformanceMonitor = {
  startMeasure: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`)
    }
  },

  endMeasure: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
      const measures = performance.getEntriesByName(name)
      if (measures.length > 0) {
        const duration = measures[0].duration
        console.log(`${name} took ${duration.toFixed(2)}ms`)
        performance.clearMarks(`${name}-start`)
        performance.clearMarks(`${name}-end`)
        performance.clearMeasures(name)
        return duration
      }
    }
    return null
  },

  // Debounce function for performance optimization
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  // Throttle function for performance optimization
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle: boolean

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }
}