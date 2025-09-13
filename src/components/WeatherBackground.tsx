'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { PerformanceMonitor } from '@/components/LoadingComponents'

interface WeatherBackgroundProps {
  weatherCondition?: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy'
}

export default function WeatherBackground({ weatherCondition = 'cloudy' }: WeatherBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const particlesRef = useRef<THREE.Points>()
  const animationRef = useRef<number>()
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHighPerformance, setIsHighPerformance] = useState(false)

  useEffect(() => {
    // Check performance preferences
    const checkPerformance = () => {
      const highPerformance = localStorage.getItem('weatherDashboardSettings')
      if (highPerformance) {
        try {
          const settings = JSON.parse(highPerformance)
          setIsHighPerformance(settings.highPerformance || false)
        } catch (error) {
          console.error('Error parsing settings:', error)
        }
      }
    }
    
    checkPerformance()

    if (!mountRef.current) return

    PerformanceMonitor.startMeasure('WeatherBackgroundInit')

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 5
    cameraRef.current = camera

    // Renderer setup with performance optimizations
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: !isHighPerformance,
      powerPreference: isHighPerformance ? 'high-performance' : 'default'
    })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isHighPerformance ? 2 : 1))
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement)
    }
    
    rendererRef.current = renderer

    // Create particles based on weather condition
    createWeatherParticles(scene, weatherCondition)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    scene.add(directionalLight)

    // Animation loop with performance optimization
    let lastTime = 0
    const targetFPS = isHighPerformance ? 60 : 30
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime: number) => {
      animationRef.current = requestAnimationFrame(animate)

      // FPS limiting for performance
      if (currentTime - lastTime < frameInterval) {
        return
      }
      lastTime = currentTime

      // Rotate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.001
        particlesRef.current.rotation.x += 0.0005
      }

      renderer.render(scene, camera)
    }
    animate(0)

    setIsLoaded(true)
    PerformanceMonitor.endMeasure('WeatherBackgroundInit')

    // Handle resize with debounce
    const handleResize = PerformanceMonitor.debounce(() => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    }, 250)

    window.addEventListener('resize', handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement)
      }
      // Cleanup Three.js objects
      if (sceneRef.current) {
        while(sceneRef.current.children.length > 0) {
          const child = sceneRef.current.children[0]
          sceneRef.current.remove(child)
          if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
            if (child.geometry) child.geometry.dispose()
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose())
              } else {
                child.material.dispose()
              }
            }
          }
        }
      }
    }
  }, [weatherCondition, isHighPerformance])

  const createWeatherParticles = (scene: THREE.Scene, condition: string) => {
    // Adjust particle count based on performance settings
    const baseCount = isHighPerformance ? 2000 : 1000
    const particleCount = condition === 'snowy' ? baseCount : 
                         condition === 'rainy' ? Math.floor(baseCount * 1.5) : 
                         Math.floor(baseCount * 0.5)
    
    // Create geometry with buffer attributes for better performance
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 20
      positions[i3 + 1] = (Math.random() - 0.5) * 20
      positions[i3 + 2] = (Math.random() - 0.5) * 20

      // Velocity
      velocities[i3] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 1] = condition === 'rainy' ? -0.1 - Math.random() * 0.1 : 
                           condition === 'snowy' ? -0.02 - Math.random() * 0.02 : 
                           (Math.random() - 0.5) * 0.02
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02

      // Size
      sizes[i] = condition === 'rainy' ? Math.random() * 0.1 + 0.05 :
                 condition === 'snowy' ? Math.random() * 0.3 + 0.1 :
                 Math.random() * 0.2 + 0.1
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    // Create material based on weather condition
    let material: THREE.PointsMaterial

    switch (condition) {
      case 'rainy':
        material = new THREE.PointsMaterial({
          color: 0x4FC3F7,
          size: 0.1,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true
        })
        break
      case 'snowy':
        material = new THREE.PointsMaterial({
          color: 0xFFFFFF,
          size: 0.2,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true
        })
        break
      case 'stormy':
        material = new THREE.PointsMaterial({
          color: 0x9E9E9E,
          size: 0.15,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true
        })
        break
      default:
        material = new THREE.PointsMaterial({
          color: 0xE1F5FE,
          size: 0.2,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true
        })
    }

    // Create particles
    const particles = new THREE.Points(geometry, material)
    particlesRef.current = particles
    scene.add(particles)

    // Add animated clouds for cloudy conditions
    if (condition === 'cloudy' || condition === 'stormy') {
      createClouds(scene, condition === 'stormy')
    }
  }

  const createClouds = (scene: THREE.Scene, isStormy: boolean) => {
    const cloudCount = isHighPerformance ? (isStormy ? 8 : 5) : (isStormy ? 5 : 3)
    
    for (let i = 0; i < cloudCount; i++) {
      const cloudGeometry = new THREE.SphereGeometry(2 + Math.random() * 2, 8, 6)
      const cloudMaterial = new THREE.MeshLambertMaterial({
        color: isStormy ? 0x424242 : 0xF5F5F5,
        transparent: true,
        opacity: isStormy ? 0.3 : 0.4
      })
      
      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial)
      cloud.position.set(
        (Math.random() - 0.5) * 30,
        Math.random() * 10 - 5,
        (Math.random() - 0.5) * 30
      )
      cloud.scale.set(
        1 + Math.random() * 2,
        0.5 + Math.random() * 0.5,
        1 + Math.random() * 2
      )
      
      scene.add(cloud)
    }
  }

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: 'transparent',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out'
      }}
    />
  )
}