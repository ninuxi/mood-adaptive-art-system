'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Square,
  Volume2,
  Monitor,
  Lightbulb,
  AlertTriangle,
  Power,
  Sliders,
  RotateCcw,
  Shield
} from 'lucide-react'
import { useMoodStore, useCurrentMood, useSoftwareConnections } from '@/stores/moodStore'

interface LiveControlProps {
  systemActive: boolean
}

export function LiveControl({ systemActive }: LiveControlProps) {
  const [manualOverride, setManualOverride] = useState(false)
  const [selectedOutput, setSelectedOutput] = useState<'all' | 'qlab' | 'resolume' | 'lighting'>('all')
  
  const currentMood = useCurrentMood()
  const softwareConnections = useSoftwareConnections()
  const { emergencyStop, emergencyActive, setSystemActive } = useMoodStore()

  const outputs = [
    {
      id: 'qlab' as const,
      name: 'QLab',
      icon: <Volume2 className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-600',
      status: softwareConnections.find(s => s.id === 'qlab')?.connected ? 'online' : 'offline',
      parameters: {
        volume: 0.75,
        currentCue: 'Ambient_Loop_01',
        fadeTime: 3.2
      }
    },
    {
      id: 'resolume' as const,
      name: 'Resolume',
      icon: <Monitor className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-600',
      status: softwareConnections.find(s => s.id === 'resolume')?.connected ? 'online' : 'offline',
      parameters: {
        opacity: 0.85,
        currentClip: 'Particles_Abstract',
        bpm: 85
      }
    },
    {
      id: 'lighting' as const,
      name: 'Lighting',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-600',
      status: softwareConnections.find(s => s.id === 'chamsys')?.connected ? 'online' : 'offline',
      parameters: {
        intensity: 0.9,
        colorTemp: '3200K',
        scene: 'Warm_Gallery'
      }
    }
  ]

  return (
    <div className="space-y-8">
      {/* Emergency Controls */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Emergency Controls</h3>
              <p className="text-sm text-red-300">Immediate safety overrides</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            emergencyActive 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-green-500 text-white'
          }`}>
            {emergencyActive ? 'EMERGENCY ACTIVE' : 'SYSTEM NORMAL'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={emergencyStop}
            className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>EMERGENCY STOP</span>
          </button>
          
          <button
            onClick={() => setSystemActive(false)}
            className="flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <Pause className="w-5 h-5" />
            <span>Pause System</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            <RotateCcw className="w-5 h-5" />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Output Control */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Output Control</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setManualOverride(!manualOverride)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  manualOverride
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {manualOverride ? 'MANUAL' : 'AUTO'}
              </button>
              <Sliders className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-4">
            {outputs.map((output) => (
              <motion.div
                key={output.id}
                layout
                className={`border rounded-lg p-4 transition-all cursor-pointer ${
                  selectedOutput === output.id || selectedOutput === 'all'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
                onClick={() => setSelectedOutput(
                  selectedOutput === output.id ? 'all' : output.id
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${output.color} rounded-lg flex items-center justify-center`}>
                      {output.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{output.name}</h4>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          output.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <span className="text-xs text-gray-400">
                          {output.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-white">
                      {output.id === 'qlab' && `Vol: ${Math.round(output.parameters.volume * 100)}%`}
                      {output.id === 'resolume' && `Opacity: ${Math.round(output.parameters.opacity * 100)}%`}
                      {output.id === 'lighting' && `Intensity: ${Math.round(output.parameters.intensity * 100)}%`}
                    </div>
                    <div className="text-xs text-gray-400">
                      {output.id === 'qlab' && output.parameters.currentCue}
                      {output.id === 'resolume' && `${output.parameters.bpm} BPM`}
                      {output.id === 'lighting' && output.parameters.colorTemp}
                    </div>
                  </div>
                </div>

                {(selectedOutput === output.id || selectedOutput === 'all') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-3 border-t border-white/10"
                  >
                    {/* Parameter Controls */}
                    <ParameterControl
                      label={output.id === 'qlab' ? 'Volume' : output.id === 'resolume' ? 'Opacity' : 'Intensity'}
                      value={output.id === 'qlab' ? output.parameters.volume : 
                            output.id === 'resolume' ? output.parameters.opacity : 
                            output.parameters.intensity}
                      onChange={() => {}} // Would connect to actual controls
                      disabled={!manualOverride}
                    />
                    
                    <div className="flex space-x-2">
                      <button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded transition-colors"
                        disabled={!manualOverride}
                      >
                        <Play className="w-3 h-3 mx-auto" />
                      </button>
                      <button 
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-2 px-3 rounded transition-colors"
                        disabled={!manualOverride}
                      >
                        <Pause className="w-3 h-3 mx-auto" />
                      </button>
                      <button 
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-3 rounded transition-colors"
                        disabled={!manualOverride}
                      >
                        <Square className="w-3 h-3 mx-auto" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Current Performance */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Current Performance</h3>
          
          <div className="space-y-6">
            {/* Active Mood */}
            <div className="text-center">
              <div 
                className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ 
                  background: `radial-gradient(circle, ${currentMood.color}40, ${currentMood.color}10)`,
                  boxShadow: `0 0 30px ${currentMood.color}30`
                }}
              >
                <motion.div
                  animate={{
                    scale: systemActive ? [1, 1.1, 1] : [1],
                    opacity: systemActive ? [0.6, 1, 0.6] : [0.6]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-full"
                  style={{ backgroundColor: currentMood.color }}
                />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">{currentMood.name}</h4>
              <p className="text-sm text-gray-400">{currentMood.description}</p>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">2:34</div>
                <div className="text-xs text-gray-400">Current Duration</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">78%</div>
                <div className="text-xs text-gray-400">Engagement</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">12</div>
                <div className="text-xs text-gray-400">Active Users</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">5.2s</div>
                <div className="text-xs text-gray-400">Avg Response</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-300">Quick Actions</h5>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-3 rounded transition-colors">
                  Boost Energy
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded transition-colors">
                  Calm Down
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded transition-colors">
                  Social Mode
                </button>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-2 px-3 rounded transition-colors">
                  Mystery Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ParameterControlProps {
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

function ParameterControl({ label, value, onChange, disabled = false }: ParameterControlProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="flex items-center space-x-3">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className={`w-20 h-2 rounded-lg appearance-none cursor-pointer ${
            disabled ? 'opacity-50' : ''
          } bg-white/20`}
          style={{
            background: disabled 
              ? 'rgb(255 255 255 / 0.2)' 
              : `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${value * 100}%, rgb(255 255 255 / 0.2) ${value * 100}%, rgb(255 255 255 / 0.2) 100%)`
          }}
        />
        <span className="text-sm text-white w-12 text-right">
          {Math.round(value * 100)}%
        </span>
      </div>
    </div>
  )
}