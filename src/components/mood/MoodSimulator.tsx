'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Play, 
  Save,
  Copy,
  Settings,
  ArrowRight,
  Brain,
  Users,
  Clock,
  Zap
} from 'lucide-react'

interface MoodRule {
  id: string
  name: string
  condition: {
    type: 'people_count' | 'movement' | 'audio' | 'time' | 'custom'
    operator: 'greater' | 'less' | 'equals' | 'between'
    value: number | [number, number]
    label: string
  }
  action: {
    mood: string
    parameters: {
      energy: number
      valence: number
      arousal: number
    }
    outputs: {
      qlab: { volume: number; cue: string }
      resolume: { opacity: number; effect: string }
      lighting: { intensity: number; color: string }
    }
  }
  priority: number
  enabled: boolean
}

export function MoodSimulator() {
  const [rules, setRules] = useState<MoodRule[]>([
    {
      id: '1',
      name: 'Busy Gallery',
      condition: {
        type: 'people_count',
        operator: 'greater',
        value: 15,
        label: 'When more than 15 people are present'
      },
      action: {
        mood: 'Energetic',
        parameters: { energy: 0.9, valence: 0.8, arousal: 0.9 },
        outputs: {
          qlab: { volume: 0.8, cue: 'Upbeat_Ambient' },
          resolume: { opacity: 0.9, effect: 'FastParticles' },
          lighting: { intensity: 0.9, color: '#FF6B6B' }
        }
      },
      priority: 1,
      enabled: true
    },
    {
      id: '2', 
      name: 'Quiet Hours',
      condition: {
        type: 'time',
        operator: 'between',
        value: [9, 11],
        label: 'Between 9:00 and 11:00 AM'
      },
      action: {
        mood: 'Contemplative',
        parameters: { energy: 0.3, valence: 0.6, arousal: 0.2 },
        outputs: {
          qlab: { volume: 0.4, cue: 'Minimal_Drone' },
          resolume: { opacity: 0.5, effect: 'SlowFlow' },
          lighting: { intensity: 0.6, color: '#8B5CF6' }
        }
      },
      priority: 2,
      enabled: true
    }
  ])

  const [selectedRule, setSelectedRule] = useState<string | null>(null)
  const [isCreatingRule, setIsCreatingRule] = useState(false)

  const moodPresets = [
    { name: 'Energetic', color: '#EF4444', energy: 0.9, valence: 0.8, arousal: 0.9 },
    { name: 'Contemplative', color: '#8B5CF6', energy: 0.3, valence: 0.6, arousal: 0.2 },
    { name: 'Social', color: '#10B981', energy: 0.7, valence: 0.9, arousal: 0.6 },
    { name: 'Mysterious', color: '#6366F1', energy: 0.5, valence: 0.3, arousal: 0.7 },
    { name: 'Peaceful', color: '#06B6D4', energy: 0.2, valence: 0.8, arousal: 0.1 }
  ]

  const conditionTypes = [
    { id: 'people_count', label: 'People Count', icon: <Users className="w-4 h-4" /> },
    { id: 'movement', label: 'Movement Level', icon: <Zap className="w-4 h-4" /> },
    { id: 'audio', label: 'Audio Level', icon: <Brain className="w-4 h-4" /> },
    { id: 'time', label: 'Time of Day', icon: <Clock className="w-4 h-4" /> }
  ]

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ))
  }

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(rule => rule.id !== id))
    if (selectedRule === id) setSelectedRule(null)
  }

  const duplicateRule = (id: string) => {
    const rule = rules.find(r => r.id === id)
    if (rule) {
      const newRule = {
        ...rule,
        id: Date.now().toString(),
        name: `${rule.name} (Copy)`
      }
      setRules(prev => [...prev, newRule])
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Mood Programming</h2>
          <p className="text-gray-400">Create rules that define how the environment responds to context</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCreatingRule(true)}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Rule</span>
          </button>
          <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Save className="w-4 h-4" />
            <span>Save Preset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rules List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Active Rules</h3>
            
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/5 border rounded-lg p-4 transition-all cursor-pointer ${
                    selectedRule === rule.id 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setSelectedRule(rule.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        rule.enabled ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{rule.name}</h4>
                        <p className="text-xs text-gray-400">Priority: {rule.priority}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleRule(rule.id) }}
                        className={`px-2 py-1 rounded text-xs ${
                          rule.enabled 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {rule.enabled ? 'ON' : 'OFF'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicateRule(rule.id) }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteRule(rule.id) }}
                        className="p-1 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-gray-400">{rule.condition.label}</span>
                    <div className="flex items-center space-x-2">
                      <ArrowRight className="w-3 h-3 text-gray-500" />
                      <span className="text-white">{rule.action.mood}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Visual Flow Diagram */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Rule Flow Visualization</h3>
            <div className="relative">
              <svg className="w-full h-64" viewBox="0 0 800 200">
                {/* Example flow visualization */}
                <defs>
                  <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                
                {/* Input nodes */}
                <circle cx="50" cy="50" r="20" fill="#4F46E5" />
                <text x="50" y="85" textAnchor="middle" className="fill-white text-xs">Sensors</text>
                
                <circle cx="50" cy="150" r="20" fill="#059669" />
                <text x="50" y="185" textAnchor="middle" className="fill-white text-xs">Context</text>
                
                {/* Processing node */}
                <rect x="250" y="80" width="80" height="40" rx="20" fill="url(#flowGradient)" />
                <text x="290" y="105" textAnchor="middle" className="fill-white text-xs">AI Engine</text>
                
                {/* Output nodes */}
                <circle cx="550" cy="50" r="20" fill="#DC2626" />
                <text x="550" y="85" textAnchor="middle" className="fill-white text-xs">QLab</text>
                
                <circle cx="650" cy="100" r="20" fill="#7C3AED" />
                <text x="650" y="135" textAnchor="middle" className="fill-white text-xs">Resolume</text>
                
                <circle cx="550" cy="150" r="20" fill="#EA580C" />
                <text x="550" y="185" textAnchor="middle" className="fill-white text-xs">Lighting</text>
                
                {/* Connections */}
                <line x1="70" y1="50" x2="250" y2="90" stroke="#8B5CF6" strokeWidth="2" />
                <line x1="70" y1="150" x2="250" y2="110" stroke="#8B5CF6" strokeWidth="2" />
                <line x1="330" y1="90" x2="530" y2="55" stroke="#06B6D4" strokeWidth="2" />
                <line x1="330" y1="100" x2="630" y2="100" stroke="#06B6D4" strokeWidth="2" />
                <line x1="330" y1="110" x2="530" y2="145" stroke="#06B6D4" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Rule Editor Panel */}
        <div className="space-y-4">
          {selectedRule && (
            <RuleEditor 
              rule={rules.find(r => r.id === selectedRule)!}
              onUpdate={(updatedRule) => {
                setRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r))
              }}
              moodPresets={moodPresets}
            />
          )}
          
          {/* Quick Presets */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Cultural Presets</h3>
            <div className="space-y-2">
              {[
                { name: 'Art Gallery Opening', desc: 'Social, high energy', color: '#10B981' },
                { name: 'Museum Exhibition', desc: 'Contemplative, educational', color: '#8B5CF6' },
                { name: 'Corporate Event', desc: 'Professional, adaptive', color: '#06B6D4' },
                { name: 'Children Workshop', desc: 'Playful, energetic', color: '#F59E0B' }
              ].map((preset, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{preset.name}</p>
                      <p className="text-xs text-gray-400">{preset.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface RuleEditorProps {
  rule: MoodRule
  onUpdate: (rule: MoodRule) => void
  moodPresets: Array<{ name: string; color: string; energy: number; valence: number; arousal: number }>
}

function RuleEditor({ rule, onUpdate, moodPresets }: RuleEditorProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Rule Editor</h3>
        <Settings className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Rule Name</label>
          <input
            type="text"
            value={rule.name}
            onChange={(e) => onUpdate({ ...rule, name: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Target Mood</label>
          <div className="grid grid-cols-2 gap-2">
            {moodPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onUpdate({
                  ...rule,
                  action: {
                    ...rule.action,
                    mood: preset.name,
                    parameters: {
                      energy: preset.energy,
                      valence: preset.valence,
                      arousal: preset.arousal
                    }
                  }
                })}
                className={`p-2 rounded-lg text-xs text-center transition-all ${
                  rule.action.mood === preset.name
                    ? 'text-white border-2'
                    : 'text-gray-300 bg-white/5 hover:bg-white/10 border border-white/20'
                }`}
                style={{ 
                  backgroundColor: rule.action.mood === preset.name ? `${preset.color}20` : undefined,
                  borderColor: rule.action.mood === preset.name ? preset.color : undefined
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
          <input
            type="number"
            min="1"
            max="10"
            value={rule.priority}
            onChange={(e) => onUpdate({ ...rule, priority: parseInt(e.target.value) })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          />
        </div>

        <div className="pt-4 border-t border-white/10">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Output Parameters</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">QLab Volume</span>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={rule.action.outputs.qlab.volume}
                  onChange={(e) => onUpdate({
                    ...rule,
                    action: {
                      ...rule.action,
                      outputs: {
                        ...rule.action.outputs,
                        qlab: { ...rule.action.outputs.qlab, volume: parseFloat(e.target.value) }
                      }
                    }
                  })}
                  className="w-20"
                />
                <span className="text-xs text-white w-8">
                  {Math.round(rule.action.outputs.qlab.volume * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}