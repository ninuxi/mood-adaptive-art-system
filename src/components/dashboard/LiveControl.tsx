// src/components/dashboard/LiveControl.tsx - UPDATED per Real OSC
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Square, 
  Pause, 
  RotateCcw,
  Volume2,
  Lightbulb,
  Monitor,
  Sliders,
  Send,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import { useMoodStore, useSoftwareConnections, useCurrentMood, MOOD_MAPPINGS } from '@/stores/moodStore'

interface QuickCommandProps {
  software: string
  name: string
  icon: React.ReactNode
  command: string
  args: any[]
  color: string
  disabled?: boolean
  onExecute: (software: string, command: string, args: any[]) => Promise<void>
}

const QuickCommand = ({ software, name, icon, command, args, color, disabled, onExecute }: QuickCommandProps) => {
  const [isExecuting, setIsExecuting] = useState(false)
  const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null)

  const handleExecute = async () => {
    setIsExecuting(true)
    try {
      await onExecute(software, command, args)
      setLastResult('success')
      setTimeout(() => setLastResult(null), 2000)
    } catch (error) {
      setLastResult('error')
      setTimeout(() => setLastResult(null), 3000)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <motion.button
      onClick={handleExecute}
      disabled={disabled || isExecuting}
      className={`relative p-3 rounded-lg ${color} disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <div className="flex flex-col items-center space-y-1">
        {isExecuting ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          icon
        )}
        <span className="text-xs font-medium">{name}</span>
      </div>
      
      {/* Result indicator */}
      {lastResult && (
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
          lastResult === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {lastResult === 'success' ? (
            <CheckCircle2 className="w-3 h-3 text-white" />
          ) : (
            <AlertTriangle className="w-3 h-3 text-white" />
          )}
        </div>
      )}
    </motion.button>
  )
}

interface ParameterControlProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
  onApply: (value: number) => Promise<void>
}

const ParameterControl = ({ label, value, min, max, step, unit, onChange, onApply }: ParameterControlProps) => {
  const [localValue, setLocalValue] = useState(value)
  const [isApplying, setIsApplying] = useState(false)

  const handleChange = (newValue: number) => {
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleApply = async () => {
    setIsApplying(true)
    try {
      await onApply(localValue)
    } catch (error) {
      console.error('Failed to apply parameter:', error)
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-white">{label}</label>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">
            {localValue.toFixed(step < 1 ? 2 : 0)}{unit}
          </span>
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white disabled:opacity-50"
          >
            {isApplying ? '...' : 'Apply'}
          </button>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue}
        onChange={(e) => handleChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  )
}

export function LiveControl() {
  const connections = useSoftwareConnections()
  const currentMood = useCurrentMood()
  const { 
    sendOSCCommand, 
    applyCurrentMoodToSoftware, 
    emergencyStop,
    updateCurrentMood 
  } = useMoodStore()

  const [selectedSoftware, setSelectedSoftware] = useState<string>('all')
  const [customCommand, setCustomCommand] = useState('')
  const [customArgs, setCustomArgs] = useState('')

  // Get connected software
  const connectedSoftware = connections.filter(c => c.connected)

  // Quick mood buttons
  const quickMoods = [
    { name: 'Energetic', color: '#EF4444', energy: 0.9, valence: 0.8, arousal: 0.9 },
    { name: 'Social', color: '#10B981', energy: 0.7, valence: 0.9, arousal: 0.6 },
    { name: 'Contemplative', color: '#8B5CF6', energy: 0.3, valence: 0.6, arousal: 0.2 },
    { name: 'Mysterious', color: '#6366F1', energy: 0.5, valence: 0.3, arousal: 0.7 },
    { name: 'Peaceful', color: '#06B6D4', energy: 0.2, valence: 0.8, arousal: 0.1 }
  ]

  const handleSendCommand = async (software: string, command: string, args: any[]) => {
    try {
      await sendOSCCommand(software, command, args)
      console.log(`✅ Command sent: ${software} ${command}`, args)
    } catch (error) {
      console.error(`❌ Command failed: ${software} ${command}`, error)
      throw error
    }
  }

  const handleApplyMood = async () => {
    try {
      await applyCurrentMoodToSoftware()
      console.log(`✅ Applied mood "${currentMood.name}" to all connected software`)
    } catch (error) {
      console.error('❌ Failed to apply mood:', error)
    }
  }

  const handleQuickMoodChange = async (mood: any) => {
    updateCurrentMood({
      name: mood.name,
      energy: mood.energy,
      valence: mood.valence,
      arousal: mood.arousal,
      color: mood.color,
      description: `${mood.name} mood activated manually`
    })
    
    // Auto-apply if connected
    if (connectedSoftware.length > 0) {
      setTimeout(() => handleApplyMood(), 500)
    }
  }

  const handleCustomCommand = async () => {
    if (!customCommand) return
    
    try {
      const args = customArgs ? JSON.parse(`[${customArgs}]`) : []
      const software = selectedSoftware === 'all' ? 'qlab' : selectedSoftware
      await handleSendCommand(software, customCommand, args)
    } catch (error) {
      console.error('Custom command failed:', error)
    }
  }

  const handleParameterChange = async (software: string, parameter: string, value: number) => {
    try {
      switch (software) {
        case 'qlab':
          await sendOSCCommand('qlab', `/cue/current/${parameter}`, [value])
          break
        case 'resolume':
          await sendOSCCommand('resolume', `/layer1/video/${parameter}/values`, [value])
          break
        case 'chamsys':
          await sendOSCCommand('chamsys', `/pb/1/${parameter}`, [value])
          break
      }
    } catch (error) {
      console.error(`Failed to set ${parameter}:`, error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Live Control</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            {connectedSoftware.length} software connected
          </span>
          <button
            onClick={emergencyStop}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
          >
            <Square className="w-4 h-4" />
            <span>Emergency Stop</span>
          </button>
        </div>
      </div>

      {/* Current Mood Status */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: currentMood.color }}
            >
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{currentMood.name}</h3>
              <p className="text-gray-300 text-sm">{currentMood.description}</p>
              <div className="flex space-x-4 mt-1 text-xs text-gray-400">
                <span>Energy: {(currentMood.energy * 100).toFixed(0)}%</span>
                <span>Valence: {(currentMood.valence * 100).toFixed(0)}%</span>
                <span>Arousal: {(currentMood.arousal * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleApplyMood}
            disabled={connectedSoftware.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Apply to All</span>
          </button>
        </div>
      </div>

      {/* Quick Mood Changes */}
      <div>
        <h3 className="text-white font-medium mb-3">Quick Mood Changes</h3>
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {quickMoods.map((mood) => (
            <motion.button
              key={mood.name}
              onClick={() => handleQuickMoodChange(mood)}
              className={`flex-shrink-0 p-3 rounded-lg transition-all ${
                currentMood.name === mood.name 
                  ? 'ring-2 ring-white ring-opacity-50' 
                  : ''
              }`}
              style={{ backgroundColor: mood.color + '40', borderColor: mood.color }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div 
                className="w-8 h-8 rounded-full mb-2 mx-auto"
                style={{ backgroundColor: mood.color }}
              />
              <div className="text-white text-xs font-medium">{mood.name}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Software-Specific Quick Commands */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* QLab Controls */}
        <div className="bg-white/5 backdrop-blur rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Volume2 className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-medium">QLab</h3>
            <div className={`w-2 h-2 rounded-full ${
              connections.find(c => c.id === 'qlab')?.connected ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <QuickCommand
              software="qlab"
              name="Go"
              icon={<Play className="w-5 h-5" />}
              command="/go"
              args={[]}
              color="bg-green-600 hover:bg-green-700 text-white"
              disabled={!connections.find(c => c.id === 'qlab')?.connected}
              onExecute={handleSendCommand}
            />
            <QuickCommand
              software="qlab"
              name="Stop"
              icon={<Square className="w-5 h-5" />}
              command="/stop"
              args={[]}
              color="bg-red-600 hover:bg-red-700 text-white"
              disabled={!connections.find(c => c.id === 'qlab')?.connected}
              onExecute={handleSendCommand}
            />
            <QuickCommand
              software="qlab"
              name="Pause"
              icon={<Pause className="w-5 h-5" />}
              command="/pause"
              args={[]}
              color="bg-yellow-600 hover:bg-yellow-700 text-white"
              disabled={!connections.find(c => c.id === 'qlab')?.connected}
              onExecute={handleSendCommand}
            />
            <QuickCommand
              software="qlab"
              name="Reset"
              icon={<RotateCcw className="w-5 h-5" />}
              command="/reset"
              args={[]}
              color="bg-gray-600 hover:bg-gray-700 text-white"
              disabled={!connections.find(c => c.id === 'qlab')?.connected}
              onExecute={handleSendCommand}
            />
          </div>
        </div>

        {/* Resolume Controls */}
        <div className="bg-white/5 backdrop-blur rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Monitor className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-medium">Resolume</h3>
            <div className={`w-2 h-2 rounded-full ${
              connections.find(c => c.id === 'resolume')?.connected ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <QuickCommand
              software="resolume"
              name="Play"
              icon={<Play className="w-5 h-5" />}
              command="/composition/transportcontroller/play"
              args={[1]}
              color="bg-green-600 hover:bg-green-700 text-white"
              disabled={!connections.find(c => c.id === 'resolume')?.connected}
              onExecute={handleSendCommand}
            />
            <QuickCommand
              software="resolume"
              name="Stop"
              icon={<Square className="w-5 h-5" />}
              command="/composition/transportcontroller/stop"
              args={[]}
              color="bg-red-600 hover:bg-red-700 text-white"
              disabled={!connections.find(c => c.id === 'resolume')?.connected}
              onExecute={handleSendCommand}
            />
            <QuickCommand
              software="resolume"
              name="Layer 1"
              icon={<div className="w-5 h-5 bg-white rounded text-black flex items-center justify-center text-xs font-bold">1</div>}
              command="/layer1/clip1/connect"
              args={[1]}
              color="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!connections.find(c => c.id === 'resolume')?.connected}
              onExecute={handleSendCommand}
            />
            <QuickCommand
              software="resolume"
              name="Clear"
              icon={<div className="w-5 h-5 bg-white rounded text-black flex items-center justify-center text-xs font-bold">×</div>}
              command="/layer1/clear"
              args={[]}
              color="bg-gray-600 hover:bg-gray-700 text-white"
              disabled={!connections.find(c => c.id === 'resolume')?.connected}
              onExecute={handleSendCommand}
            />
          </div>
        </div>

        {/* Lighting Controls */}
        <div className="bg-white/5 backdrop-blur rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h3 className="text-white font-medium">Lighting</h3>
            <div className={`w-2 h-2 rounded-full ${
              (connections.find(c => c.id === 'chamsys')?.connected || connections.find(c => c.id === 'grandma3')?.connected) 
                ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <QuickCommand
              software="chamsys"
              name="PB 1 Go"
              icon={<Play className="w-5 h-5" />}
              command="/pb/1/go"
              args={[]}
              color="bg-green-600 hover:bg-green-700 text-white"
              disabled={!connections.find(c => c.id === 'chamsys')?.connected}
              onExecute={handleSendCommand}
            />
            <QuickCommand
              software="chamsys"
              name="PB 1 Stop"
              icon={<Square className="w-5 h-5" />}
              command="/pb/1/stop"
              args={[]}
              color="bg-red-600 hover:bg-red-700 text-white"
              disabled={!connections.find(c => c.id === 'chamsys')?.connected}
              onExecute={handleSendCommand}
            />
            <QuickCommand
              software="grandma3"
              name="MA Go"
              icon={<Play className="w-5 h-5" />}
              command="/gma3/cmd"
              args={["Go"]}
              color="bg-green-600 hover:bg-green-700 text-white"
              disabled={!connections.find(c => c.id === 'grandma3')?.connected}
              onExecute={handleSendCommand}
            />
            <QuickCommand
              software="grandma3"
              name="MA Stop"
              icon={<Square className="w-5 h-5" />}
              command="/gma3/cmd"
              args={["Off"]}
              color="bg-red-600 hover:bg-red-700 text-white"
              disabled={!connections.find(c => c.id === 'grandma3')?.connected}
              onExecute={handleSendCommand}
            />
          </div>
        </div>
      </div>

      {/* Parameter Controls */}
      <div>
        <h3 className="text-white font-medium mb-3">Real-time Parameter Control</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ParameterControl
            label="QLab Master Volume"
            value={0.7}
            min={0}
            max={1}
            step={0.01}
            unit=""
            onChange={() => {}}
            onApply={(value) => handleParameterChange('qlab', 'sliderLevel', value)}
          />
          <ParameterControl
            label="Resolume Layer Opacity"
            value={0.8}
            min={0}
            max={1}
            step={0.01}
            unit=""
            onChange={() => {}}
            onApply={(value) => handleParameterChange('resolume', 'opacity', value)}
          />
          <ParameterControl
            label="Lighting Master"
            value={0.75}
            min={0}
            max={1}
            step={0.01}
            unit=""
            onChange={() => {}}
            onApply={(value) => handleParameterChange('chamsys', 'level', value)}
          />
        </div>
      </div>

      {/* Custom Command Interface */}
      <div className="bg-white/5 backdrop-blur rounded-lg p-4">
        <h3 className="text-white font-medium mb-3">Custom OSC Commands</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Software</label>
            <select
              value={selectedSoftware}
              onChange={(e) => setSelectedSoftware(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Connected</option>
              {connectedSoftware.map((sw) => (
                <option key={sw.id} value={sw.id}>{sw.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Command</label>
            <input
              type="text"
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              placeholder="/example/command"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Arguments</label>
            <input
              type="text"
              value={customArgs}
              onChange={(e) => setCustomArgs(e.target.value)}
              placeholder="1, 0.5, 'string'"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCustomCommand}
              disabled={!customCommand}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-white transition-colors"
            >
              Send Command
            </button>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-400">
          <p><strong>Examples:</strong></p>
          <p>QLab: <code>/go</code> | <code>/cue/1/load</code> | <code>/cue/current/sliderLevel</code> with args: <code>0.8</code></p>
          <p>Resolume: <code>/layer1/clip1/connect</code> with args: <code>1</code> | <code>/composition/crossfader</code> with args: <code>0.5</code></p>
          <p>Chamsys: <code>/pb/1/go</code> | <code>/head/1/intensity</code> with args: <code>0.9</code></p>
          <p>GrandMA3: <code>/gma3/cmd</code> with args: <code>"Go"</code> | <code>/gma3/exec/101/fader</code> with args: <code>0.8</code></p>
        </div>
      </div>

      {/* Current Mood Mapping Preview */}
      {MOOD_MAPPINGS[currentMood.name] && (
        <div className="bg-white/5 backdrop-blur rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">
            Current Mood Mapping: {currentMood.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {MOOD_MAPPINGS[currentMood.name].qlab && (
              <div className="bg-green-500/10 rounded p-3">
                <h4 className="text-green-400 font-medium mb-2">QLab</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>Cue: {MOOD_MAPPINGS[currentMood.name].qlab?.cue}</li>
                  <li>Volume: {(MOOD_MAPPINGS[currentMood.name].qlab?.volume || 0) * 100}%</li>
                  <li>Fade: {MOOD_MAPPINGS[currentMood.name].qlab?.fadeTime}s</li>
                </ul>
              </div>
            )}
            
            {MOOD_MAPPINGS[currentMood.name].resolume && (
              <div className="bg-blue-500/10 rounded p-3">
                <h4 className="text-blue-400 font-medium mb-2">Resolume</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>Clip: {MOOD_MAPPINGS[currentMood.name].resolume?.clip}</li>
                  <li>Opacity: {(MOOD_MAPPINGS[currentMood.name].resolume?.opacity || 0) * 100}%</li>
                  <li>Speed: {MOOD_MAPPINGS[currentMood.name].resolume?.speed}x</li>
                </ul>
              </div>
            )}
            
            {MOOD_MAPPINGS[currentMood.name].lighting && (
              <div className="bg-yellow-500/10 rounded p-3">
                <h4 className="text-yellow-400 font-medium mb-2">Lighting</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>Intensity: {(MOOD_MAPPINGS[currentMood.name].lighting?.intensity || 0) * 100}%</li>
                  <li>Color: {MOOD_MAPPINGS[currentMood.name].lighting?.color}</li>
                  <li>Transition: {MOOD_MAPPINGS[currentMood.name].lighting?.transition}s</li>
                </ul>
              </div>
            )}
            
            {MOOD_MAPPINGS[currentMood.name].grandma3 && (
              <div className="bg-purple-500/10 rounded p-3">
                <h4 className="text-purple-400 font-medium mb-2">GrandMA3</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>Sequence: {MOOD_MAPPINGS[currentMood.name].grandma3?.sequence}</li>
                  <li>Command: {MOOD_MAPPINGS[currentMood.name].grandma3?.command}</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}