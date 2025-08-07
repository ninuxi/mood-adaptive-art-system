'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Volume2, 
  Eye, 
  Activity,
  TrendingUp,
  Clock
} from 'lucide-react'

interface MoodData {
  name: string
  energy: number
  valence: number
  arousal: number
  color: string
  description: string
}

interface VisualizerProps {
  systemActive: boolean
}

export function MoodVisualizer({ systemActive }: VisualizerProps) {
  const [currentMood, setCurrentMood] = useState<MoodData>({
    name: 'Contemplative',
    energy: 0.3,
    valence: 0.6,
    arousal: 0.2,
    color: '#8B5CF6',
    description: 'Quiet reflection and thoughtful observation'
  })

  const [environmentData, setEnvironmentData] = useState({
    peopleCount: 12,
    avgMovement: 0.4,
    audioLevel: 0.25,
    lightLevel: 0.7,
    temperature: 22
  })

  const moods: MoodData[] = [
    {
      name: 'Energetic',
      energy: 0.9,
      valence: 0.8,
      arousal: 0.9,
      color: '#EF4444',
      description: 'High energy and excitement'
    },
    {
      name: 'Contemplative', 
      energy: 0.3,
      valence: 0.6,
      arousal: 0.2,
      color: '#8B5CF6',
      description: 'Quiet reflection and thoughtful observation'
    },
    {
      name: 'Social',
      energy: 0.7,
      valence: 0.9,
      arousal: 0.6,
      color: '#10B981',
      description: 'Interactive and collaborative atmosphere'
    },
    {
      name: 'Mysterious',
      energy: 0.5,
      valence: 0.3,
      arousal: 0.7,
      color: '#6366F1',
      description: 'Intriguing and thought-provoking'
    },
    {
      name: 'Peaceful',
      energy: 0.2,
      valence: 0.8,
      arousal: 0.1,
      color: '#06B6D4',
      description: 'Calm and serene environment'
    }
  ]

  // Simula cambiamenti di mood quando il sistema è attivo
  useEffect(() => {
    if (!systemActive) return

    const interval = setInterval(() => {
      // Simula nuovi dati ambientali
      setEnvironmentData(prev => ({
        ...prev,
        peopleCount: Math.max(1, prev.peopleCount + Math.floor((Math.random() - 0.5) * 4)),
        avgMovement: Math.max(0, Math.min(1, prev.avgMovement + (Math.random() - 0.5) * 0.2)),
        audioLevel: Math.max(0, Math.min(1, prev.audioLevel + (Math.random() - 0.5) * 0.3))
      }))

      // Cambia mood occasionalmente
      if (Math.random() < 0.3) {
        setCurrentMood(moods[Math.floor(Math.random() * moods.length)])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [systemActive, moods])

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Mood Analysis</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            systemActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="text-sm text-gray-400">
            {systemActive ? 'Live Analysis' : 'Simulation Mode'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Mood Display */}
        <div className="space-y-6">
          <div className="text-center">
            <motion.div
              key={currentMood.name}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center relative"
              style={{ 
                background: `radial-gradient(circle, ${currentMood.color}40, ${currentMood.color}10)`,
                boxShadow: `0 0 40px ${currentMood.color}30`
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 rounded-full"
                style={{ backgroundColor: currentMood.color }}
              />
              <div className="absolute inset-0 rounded-full border-2 opacity-30" 
                   style={{ borderColor: currentMood.color }} />
            </motion.div>

            <h3 className="text-2xl font-bold text-white mb-2">{currentMood.name}</h3>
            <p className="text-gray-400 text-sm">{currentMood.description}</p>
          </div>

          {/* Mood Parameters */}
          <div className="space-y-4">
            <MoodParameter 
              label="Energy" 
              value={currentMood.energy} 
              color={currentMood.color}
              icon={<Activity className="w-4 h-4" />}
            />
            <MoodParameter 
              label="Valence" 
              value={currentMood.valence} 
              color={currentMood.color}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <MoodParameter 
              label="Arousal" 
              value={currentMood.arousal} 
              color={currentMood.color}
              icon={<Volume2 className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Environment Sensors */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-white mb-4">Environment Data</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <SensorCard
              title="People Present"
              value={`${environmentData.peopleCount}`}
              unit="persons"
              icon={<Users className="w-5 h-5" />}
              color="blue"
              trend={environmentData.peopleCount > 10 ? 'up' : 'stable'}
            />
            
            <SensorCard
              title="Movement"
              value={`${Math.round(environmentData.avgMovement * 100)}`}
              unit="%"
              icon={<Activity className="w-5 h-5" />}
              color="green"
              trend={environmentData.avgMovement > 0.5 ? 'up' : 'down'}
            />
            
            <SensorCard
              title="Audio Level"
              value={`${Math.round(environmentData.audioLevel * 100)}`}
              unit="dB"
              icon={<Volume2 className="w-5 h-5" />}
              color="yellow"
              trend={environmentData.audioLevel > 0.4 ? 'up' : 'stable'}
            />
            
            <SensorCard
              title="Ambient Light"
              value={`${Math.round(environmentData.lightLevel * 100)}`}
              unit="lux"
              icon={<Eye className="w-5 h-5" />}
              color="purple"
              trend="stable"
            />
          </div>

          {/* Mood History Timeline */}
          <div className="mt-8">
            <h5 className="text-md font-medium text-white mb-3">Recent Mood Changes</h5>
            <div className="space-y-2">
              {[
                { time: '14:32', mood: 'Social', duration: '8m' },
                { time: '14:24', mood: 'Contemplative', duration: '12m' },
                { time: '14:12', mood: 'Energetic', duration: '5m' }
              ].map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">{entry.time}</span>
                    <span className="text-sm text-gray-400">{entry.mood}</span>
                  </div>
                  <span className="text-xs text-gray-500">{entry.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Mood Override */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h5 className="text-md font-medium text-white mb-3">Quick Mood Override</h5>
        <div className="flex flex-wrap gap-2">
          {moods.map((mood) => (
            <button
              key={mood.name}
              onClick={() => setCurrentMood(mood)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                currentMood.name === mood.name
                  ? 'text-white border-2'
                  : 'text-gray-300 bg-white/5 hover:bg-white/10 border border-white/20'
              }`}
              style={{ 
                backgroundColor: currentMood.name === mood.name ? `${mood.color}30` : undefined,
                borderColor: currentMood.name === mood.name ? mood.color : undefined
              }}
            >
              {mood.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface MoodParameterProps {
  label: string
  value: number
  color: string
  icon: React.ReactNode
}

function MoodParameter({ label, value, color, icon }: MoodParameterProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {icon}
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
        <span className="text-sm text-white w-8">
          {Math.round(value * 100)}%
        </span>
      </div>
    </div>
  )
}

interface SensorCardProps {
  title: string
  value: string
  unit: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'purple'
  trend: 'up' | 'down' | 'stable'
}

function SensorCard({ title, value, unit, icon, color, trend }: SensorCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600'
  }

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→'
  }

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-gray-400'
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 bg-gradient-to-r ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <span className={`text-xs ${trendColors[trend]}`}>
          {trendIcons[trend]}
        </span>
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