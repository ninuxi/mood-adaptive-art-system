'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  CameraOff, 
  Eye, 
  Users, 
  Activity,
  AlertCircle,
  Loader2,
  Settings
} from 'lucide-react'
import { VisionEngine, VisionData } from '@/lib/vision/VisionEngine'
import { useMoodStore } from '@/stores/moodStore'

interface CameraVisionProps {
  isActive: boolean
  onVisionData?: (data: VisionData) => void
}

export function CameraVision({ isActive, onVisionData }: CameraVisionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const visionEngineRef = useRef<VisionEngine | null>(null)
  
  const [isInitializing, setIsInitializing] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentData, setCurrentData] = useState<VisionData | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  
  const { updateEnvironmentData } = useMoodStore()

  // Initialize Vision Engine
  useEffect(() => {
    async function initVision() {
      if (visionEngineRef.current) return
      
      setIsInitializing(true)
      setError(null)
      
      try {
        const engine = new VisionEngine()
        await engine.initialize()
        
        engine.onVisionData((data: VisionData) => {
          setCurrentData(data)
          
          // Update global store with real vision data
          updateEnvironmentData({
            peopleCount: data.peopleCount,
            avgMovement: data.avgMovement
          })
          
          // Callback to parent
          if (onVisionData) {
            onVisionData(data)
          }
        })
        
        engine.onError((errorMsg: string) => {
          setError(errorMsg)
          console.error('Vision Engine Error:', errorMsg)
        })
        
        visionEngineRef.current = engine
        setIsReady(true)
        
      } catch (err) {
        setError(`Failed to initialize camera: ${err}`)
        console.error('Vision initialization failed:', err)
      } finally {
        setIsInitializing(false)
      }
    }
    
    initVision()
    
    // Cleanup
    return () => {
      if (visionEngineRef.current) {
        visionEngineRef.current.stopDetection()
      }
    }
  }, [])

  // Start/Stop camera based on isActive prop
  useEffect(() => {
    async function handleCameraState() {
      const engine = visionEngineRef.current
      if (!engine || !videoRef.current || !canvasRef.current) return

      try {
        if (isActive && isReady) {
          if (!engine.isDetectionRunning()) {
            await engine.startCamera(videoRef.current, canvasRef.current)
            engine.startDetection()
          }
        } else {
          engine.stopDetection()
        }
      } catch (err) {
        setError(`Camera error: ${err}`)
      }
    }

    handleCameraState()
  }, [isActive, isReady])

  const toggleDebugView = () => {
    setShowDebug(!showDebug)
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <h3 className="text-lg font-bold text-red-400">Camera Error</h3>
        </div>
        <p className="text-red-300 text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Reload Page
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isActive && isReady 
              ? 'bg-green-500' 
              : isInitializing 
              ? 'bg-yellow-500' 
              : 'bg-gray-500'
          }`}>
            {isInitializing ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : isActive && isReady ? (
              <Camera className="w-5 h-5 text-white" />
            ) : (
              <CameraOff className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Computer Vision</h3>
            <p className="text-sm text-gray-400">
              {isInitializing ? 'Initializing AI model...' :
               !isReady ? 'Ready to start' :
               isActive ? 'Live people detection' : 'Camera inactive'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleDebugView}
            className={`p-2 rounded-lg transition-colors ${
              showDebug ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isActive && isReady
              ? 'bg-green-500 text-white'
              : 'bg-gray-500 text-gray-200'
          }`}>
            {isActive && isReady ? 'ACTIVE' : 'INACTIVE'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Feed */}
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ 
                display: isActive && isReady ? 'block' : 'none'
              }}
            />
            {!isActive || !isReady ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <CameraOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    {isInitializing ? 'Loading AI model...' : 'Camera inactive'}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
          
          {currentData && (
            <div className="text-center text-sm text-gray-400">
              Model: {visionEngineRef.current?.getModelInfo()}
              {currentData.confidence > 0 && (
                <span className="ml-2">
                  | Confidence: {Math.round(currentData.confidence * 100)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Live Data */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-white">Live Detection Data</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <DataCard
              title="People Detected"
              value={currentData?.peopleCount || 0}
              unit="persons"
              icon={<Users className="w-4 h-4" />}
              color="blue"
            />
            
            <DataCard
              title="Movement Level"
              value={Math.round((currentData?.avgMovement || 0) * 100)}
              unit="%"
              icon={<Activity className="w-4 h-4" />}
              color="green"
            />
            
            <DataCard
              title="Crowd Density"
              value={Math.round((currentData?.crowdDensity || 0) * 100)}
              unit="units"
              icon={<Eye className="w-4 h-4" />}
              color="yellow"
            />
            
            <DataCard
              title="Energy Level"
              value={Math.round((currentData?.energyLevel || 0) * 100)}
              unit="%"
              icon={<Activity className="w-4 h-4" />}
              color="purple"
            />
          </div>

          {currentData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Dominant Age Group</span>
                <span className="text-white capitalize">{currentData.dominantAge}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Movement Activity</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentData.avgMovement * 100}%` }}
                        className="h-full bg-green-500 rounded-full"
                      />
                    </div>
                    <span className="text-white text-xs w-8">
                      {Math.round(currentData.avgMovement * 100)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Detection Quality</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentData.confidence || 0) * 100}%` }}
                        className="h-full bg-purple-500 rounded-full"
                      />
                    </div>
                    <span className="text-white text-xs w-8">
                      {Math.round((currentData.confidence || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debug Panel */}
      {showDebug && currentData && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-6 border-t border-white/10"
        >
          <h5 className="text-sm font-medium text-white mb-3">Debug Information</h5>
          <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-gray-300">
            <pre>{JSON.stringify(currentData, null, 2)}</pre>
          </div>
        </motion.div>
      )}
    </div>
  )
}

interface DataCardProps {
  title: string
  value: number
  unit: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'purple'
}

function DataCard({ title, value, unit, icon, color }: DataCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600'
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 bg-gradient-to-r ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-lg font-bold text-white">
          {value}
          <span className="text-xs text-gray-400 ml-1">{unit}</span>
        </p>
        <p className="text-xs text-gray-400">{title}</p>
      </div>
    </div>
  )
}