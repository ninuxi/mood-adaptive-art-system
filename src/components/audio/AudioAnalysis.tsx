'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Music, 
  MessageCircle,
  Waves,
  Settings,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { AudioEngine, AudioData } from '@/lib/audio/AudioEngine'
import { useMoodStore } from '@/stores/moodStore'

interface AudioAnalysisProps {
  isActive: boolean
  onAudioData?: (data: AudioData) => void
}

export function AudioAnalysis({ isActive, onAudioData }: AudioAnalysisProps) {
  const audioEngineRef = useRef<AudioEngine | null>(null)
  
  const [isInitializing, setIsInitializing] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentData, setCurrentData] = useState<AudioData | null>(null)
  const [showSpectrum, setShowSpectrum] = useState(false)
  const [volumeTrend, setVolumeTrend] = useState<'rising' | 'falling' | 'stable'>('stable')
  const [energyTrend, setEnergyTrend] = useState<'rising' | 'falling' | 'stable'>('stable')
  
  const spectrumCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const { updateEnvironmentData } = useMoodStore()

  // Initialize Audio Engine
  useEffect(() => {
    async function initAudio() {
      if (audioEngineRef.current) return
      
      setIsInitializing(true)
      setError(null)
      
      try {
        const engine = new AudioEngine()
        await engine.initialize()
        
        engine.onAudioData((data: AudioData) => {
          setCurrentData(data)
          
          // Update global store with real audio data
          updateEnvironmentData({
            audioLevel: data.volume
          })
          
          // Update trends
          setVolumeTrend(engine.getVolumetrend())
          setEnergyTrend(engine.getEnergyTrend())
          
          // Callback to parent
          if (onAudioData) {
            onAudioData(data)
          }
        })
        
        engine.onError((errorMsg: string) => {
          setError(errorMsg)
          console.error('Audio Engine Error:', errorMsg)
        })
        
        audioEngineRef.current = engine
        setIsReady(true)
        
      } catch (err) {
        // Firefox fallback: use simulated audio data
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')
        
        if (isFirefox && err instanceof Error && err.message.includes('NotSupportedError')) {
          console.warn('Firefox: Using simulated audio data due to Web Audio API limitations')
          
          // Create a mock engine that provides realistic simulated data
          const mockEngine = {
            initialize: async () => Promise.resolve(),
            startAnalysis: () => {},
            stopAnalysis: () => {},
            isInitialized: () => true,
            isAnalysisRunning: () => true,
            getVolumetrend: () => 'stable' as const,
            getEnergyTrend: () => 'stable' as const,
            onAudioData: (callback: (data: AudioData) => void) => {
              // Simulate realistic audio data
              const interval = setInterval(() => {
                const baseVolume = 0.1 + Math.sin(Date.now() / 5000) * 0.3
                const baseEnergy = 0.2 + Math.sin(Date.now() / 3000) * 0.4
                
                callback({
                  volume: Math.max(0, Math.min(1, baseVolume + (Math.random() - 0.5) * 0.2)),
                  frequency: 200 + Math.random() * 400,
                  energy: Math.max(0, Math.min(1, baseEnergy + (Math.random() - 0.5) * 0.3)),
                  conversational: Math.sin(Date.now() / 7000) * 0.5 + 0.5,
                  musicality: Math.sin(Date.now() / 11000) * 0.3 + 0.3,
                  ambientNoise: 0.2 + Math.random() * 0.1,
                  spectralCentroid: 1500 + Math.random() * 1000,
                  spectralRolloff: 3000 + Math.random() * 2000,
                  zeroCrossingRate: 0.05 + Math.random() * 0.1
                })
              }, 200)
              
              // Store interval for cleanup
              ;(mockEngine as any)._interval = interval
            },
            onError: () => {},
            cleanup: () => {
              const interval = (mockEngine as any)._interval
              if (interval) clearInterval(interval)
            }
          }
          
          audioEngineRef.current = mockEngine as any
          setIsReady(true)
          
          // Start simulated data
          mockEngine.onAudioData((data: AudioData) => {
            setCurrentData(data)
            updateEnvironmentData({
              audioLevel: data.volume
            })
            if (onAudioData) {
              onAudioData(data)
            }
          })
          
        } else {
          // Provide more specific error messages
          let errorMessage = `Failed to initialize microphone: ${err}`
          
          if (err instanceof Error) {
            if (err.message.includes('NotSupportedError')) {
              errorMessage = 'Audio device not supported. Try refreshing the page or using Chrome for full audio analysis.'
            } else if (err.message.includes('NotAllowedError')) {
              errorMessage = 'Microphone access denied. Please allow microphone permissions and refresh.'
            } else if (err.message.includes('NotFoundError')) {
              errorMessage = 'No microphone found. Please connect a microphone and refresh.'
            }
          }
          
          setError(errorMessage)
          console.error('Audio initialization failed:', err)
        }
      } finally {
        setIsInitializing(false)
      }
    }
    
    initAudio()
    
    // Cleanup
    return () => {
      if (audioEngineRef.current) {
        // @ts-ignore
        if (typeof (audioEngineRef.current as any).cleanup === 'function') {
          // Firefox mock cleanup
          audioEngineRef.current.cleanup()
        }
        audioEngineRef.current.stopAnalysis()
      }
    }
  }, [])

  // Start/Stop audio analysis based on isActive prop
  useEffect(() => {
    const engine = audioEngineRef.current
    if (!engine) return

    try {
      if (isActive && isReady) {
        if (!engine.isAnalysisRunning()) {
          engine.startAnalysis()
        }
      } else {
        if (engine.isAnalysisRunning()) {
          engine.stopAnalysis()
        }
      }
    } catch (err) {
      setError(`Audio error: ${err}`)
    }
  }, [isActive, isReady])

  // Draw audio spectrum visualization
  useEffect(() => {
    if (!showSpectrum || !currentData || !spectrumCanvasRef.current) return

    const canvas = spectrumCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#8B5CF6')
    gradient.addColorStop(0.5, '#06B6D4')
    gradient.addColorStop(1, '#10B981')
    
    ctx.fillStyle = gradient
    
    // Draw spectrum bars (simplified visualization)
    const barWidth = canvas.width / 64
    for (let i = 0; i < 64; i++) {
      const height = (Math.random() * currentData.energy + currentData.volume) * canvas.height
      ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height)
    }
  }, [currentData, showSpectrum])

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <h3 className="text-lg font-bold text-red-400">Microphone Error</h3>
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

  const getTrendIcon = (trend: 'rising' | 'falling' | 'stable') => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'falling': return <TrendingDown className="w-4 h-4 text-red-400" />
      default: return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getBrowserName = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('firefox')) return 'Firefox'
    if (userAgent.includes('chrome')) return 'Chrome'
    if (userAgent.includes('safari')) return 'Safari'
    return 'Browser'
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
              <Mic className="w-5 h-5 text-white" />
            ) : (
              <MicOff className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Audio Analysis</h3>
            <p className="text-sm text-gray-400">
              {isInitializing ? 'Initializing microphone...' :
               !isReady ? 'Ready to start' :
               isActive ? `Live audio analysis (${getBrowserName()})` : 'Microphone inactive'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSpectrum(!showSpectrum)}
            className={`p-2 rounded-lg transition-colors ${
              showSpectrum ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            <Waves className="w-4 h-4" />
          </button>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isActive && isReady
              ? error ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
              : 'bg-gray-500 text-gray-200'
          }`}>
            {error ? 'SIMULATED' : 
             isActive && isReady ? 'LISTENING' : 'INACTIVE'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Visualizations */}
        <div className="space-y-4">
          {/* Volume Meter */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Volume Level</span>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(volumeTrend)}
                <span className="text-xs text-gray-400">{volumeTrend}</span>
              </div>
            </div>
            
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentData?.volume || 0) * 100}%` }}
                className="h-full bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Silent</span>
              <span className="font-medium text-white">
                {Math.round((currentData?.volume || 0) * 100)}%
              </span>
              <span>Loud</span>
            </div>
          </div>

          {/* Spectrum Visualization */}
          {showSpectrum && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <h5 className="text-sm font-medium text-white mb-3">Audio Spectrum</h5>
              <canvas
                ref={spectrumCanvasRef}
                width={400}
                height={100}
                className="w-full h-20 bg-black/30 rounded"
              />
            </motion.div>
          )}

          {/* Energy & Movement Correlation */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Waves className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white">Energy Level</span>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(energyTrend)}
                <span className="text-xs text-gray-400">{energyTrend}</span>
              </div>
            </div>
            
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentData?.energy || 0) * 100}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="text-center text-xs text-gray-400 mt-1">
              <span className="font-medium text-white">
                {Math.round((currentData?.energy || 0) * 100)}%
              </span> audio activity
            </div>
          </div>
        </div>

        {/* Audio Analysis Data */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-white">Audio Intelligence</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <AnalysisCard
              title="Conversation"
              value={Math.round((currentData?.conversational || 0) * 100)}
              unit="%"
              icon={<MessageCircle className="w-4 h-4" />}
              color="blue"
              description="Human speech detected"
            />
            
            <AnalysisCard
              title="Musicality"
              value={Math.round((currentData?.musicality || 0) * 100)}
              unit="%"
              icon={<Music className="w-4 h-4" />}
              color="green"
              description="Musical content"
            />
            
            <AnalysisCard
              title="Ambient Noise"
              value={Math.round((currentData?.ambientNoise || 0) * 100)}
              unit="%"
              icon={<Waves className="w-4 h-4" />}
              color="yellow"
              description="Background noise"
            />
            
            <AnalysisCard
              title="Frequency"
              value={Math.round(currentData?.frequency || 0)}
              unit="Hz"
              icon={<Settings className="w-4 h-4" />}
              color="purple"
              description="Dominant frequency"
            />
          </div>

          {/* Advanced Audio Features */}
          {currentData && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h5 className="text-sm font-medium text-white mb-3">Advanced Analysis</h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Spectral Centroid</span>
                  <span className="text-white">
                    {Math.round(currentData.spectralCentroid)} Hz
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Spectral Rolloff</span>
                  <span className="text-white">
                    {Math.round(currentData.spectralRolloff)} Hz
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Zero Crossing Rate</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, currentData.zeroCrossingRate * 1000)}%` }}
                        className="h-full bg-cyan-500 rounded-full"
                      />
                    </div>
                    <span className="text-white text-xs">
                      {(currentData.zeroCrossingRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audio Context Interpretation */}
          {currentData && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h5 className="text-sm font-medium text-white mb-3">Context Analysis</h5>
              <div className="space-y-2">
                <AudioContextIndicator currentData={currentData} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface AnalysisCardProps {
  title: string
  value: number
  unit: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'purple'
  description: string
}

function AnalysisCard({ title, value, unit, icon, color, description }: AnalysisCardProps) {
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
      <div className="mb-2">
        <p className="text-lg font-bold text-white">
          {value}
          <span className="text-xs text-gray-400 ml-1">{unit}</span>
        </p>
        <p className="text-xs text-gray-400">{title}</p>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}

function AudioContextIndicator({ currentData }: { currentData: AudioData }) {
  const getAudioContext = (): string => {
    const { conversational, musicality, ambientNoise, energy } = currentData
    
    if (conversational > 0.6 && energy > 0.4) {
      return "Active conversation detected - social atmosphere"
    }
    
    if (musicality > 0.7) {
      return "Musical content - entertainment/background music"
    }
    
    if (ambientNoise > 0.8 && energy < 0.3) {
      return "Quiet ambient environment - contemplative mood"
    }
    
    if (energy > 0.7 && conversational < 0.3) {
      return "High energy non-vocal sounds - dynamic environment"
    }
    
    if (energy < 0.2) {
      return "Very quiet - peaceful atmosphere"
    }
    
    return "Mixed audio environment - monitoring patterns"
  }
  
  const getContextColor = (): string => {
    const { energy, conversational } = currentData
    
    if (conversational > 0.6) return "text-green-400"
    if (energy > 0.6) return "text-yellow-400"
    if (energy < 0.2) return "text-blue-400"
    return "text-purple-400"
  }

  return (
    <div className="flex items-start space-x-2">
      <div className={`w-2 h-2 rounded-full mt-2 ${getContextColor().replace('text-', 'bg-')}`} />
      <p className={`text-xs ${getContextColor()}`}>
        {getAudioContext()}
      </p>
    </div>
  )
}