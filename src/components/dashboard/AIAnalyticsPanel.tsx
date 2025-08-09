// src/components/dashboard/AIAnalyticsPanel.tsx - SIMPLIFIED VERSION
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  TestTube,
  Lightbulb,
  RotateCcw
} from 'lucide-react'

// Simplified version senza dependencies complesse
export function AIAnalyticsPanel() {
  const [aiEnabled, setAiEnabled] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  const handleInitializeAI = async () => {
    setIsInitializing(true)
    // Simulate initialization
    setTimeout(() => {
      setAiEnabled(true)
      setIsInitializing(false)
    }, 2000)
  }

  const MetricCard = ({ title, value, unit = '', icon, color, change }: any) => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-500/20`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
            change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        {value}{unit}
      </div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  )

  if (!aiEnabled) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-white">AI Analytics</h2>
            <div className="px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400">
              AI Disabled
            </div>
          </div>
        </div>

        {/* AI Not Enabled State */}
        <div className="text-center py-16">
          <Brain className="w-24 h-24 mx-auto text-gray-400 mb-6 opacity-50" />
          <h3 className="text-2xl font-bold text-white mb-4">AI System Not Active</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Initialize the Advanced AI system to start getting intelligent mood predictions, 
            learning from audience behavior, and running A/B tests.
          </p>
          <button
            onClick={handleInitializeAI}
            disabled={isInitializing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            {isInitializing ? 'Initializing AI...' : 'Initialize AI System'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">AI Analytics</h2>
          <div className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
            AI Active
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAiEnabled(false)}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset AI</span>
          </button>
        </div>
      </div>

      {/* AI Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Prediction Accuracy"
          value={85}
          unit="%"
          icon={<Target className="w-6 h-6 text-green-400" />}
          color="green"
          change={12}
        />
        
        <MetricCard
          title="Learning Progress"
          value={67}
          unit="%"
          icon={<Brain className="w-6 h-6 text-blue-400" />}
          color="blue"
        />
        
        <MetricCard
          title="AI Confidence"
          value={78}
          unit="%"
          icon={<Zap className="w-6 h-6 text-purple-400" />}
          color="purple"
        />
        
        <MetricCard
          title="Active Tests"
          value={2}
          icon={<TestTube className="w-6 h-6 text-yellow-400" />}
          color="yellow"
        />
      </div>

      {/* Current AI Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Lightbulb className="w-5 h-5" />
            <span>AI Recommendation</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-purple-500" />
                <h4 className="text-lg font-semibold text-white">Contemplative</h4>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">85%</div>
                <div className="text-xs text-gray-400">Confidence</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400">Energy</div>
                <div className="text-lg font-bold text-white">30%</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400">Valence</div>
                <div className="text-lg font-bold text-white">60%</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400">Arousal</div>
                <div className="text-lg font-bold text-white">20%</div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-300">AI Reasoning:</h5>
              <div className="space-y-1">
                <div className="text-xs text-gray-400 flex items-start space-x-2">
                  <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Low crowd density (12 people) suggests calm atmosphere</span>
                </div>
                <div className="text-xs text-gray-400 flex items-start space-x-2">
                  <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Audio analysis indicates minimal conversation</span>
                </div>
                <div className="text-xs text-gray-400 flex items-start space-x-2">
                  <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Time pattern matches contemplative preference</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Apply Mood
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                Record Feedback
              </button>
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Learning Progress</span>
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">47</div>
                <div className="text-sm text-gray-400">Total Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">85%</div>
                <div className="text-sm text-gray-400">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">78%</div>
                <div className="text-sm text-gray-400">Learning Rate</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Pattern Recognition</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm text-green-400">80%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Context Learning</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-3/5 h-full bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-sm text-blue-400">65%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Adaptation Speed</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-purple-500 rounded-full"></div>
                  </div>
                  <span className="text-sm text-purple-400">75%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mood Effectiveness */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Mood Effectiveness</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { mood: 'Energetic', effectiveness: 92, usage: 12, color: '#EF4444' },
            { mood: 'Social', effectiveness: 87, usage: 18, color: '#10B981' },
            { mood: 'Contemplative', effectiveness: 94, usage: 24, color: '#8B5CF6' },
            { mood: 'Mysterious', effectiveness: 76, usage: 8, color: '#6366F1' },
            { mood: 'Peaceful', effectiveness: 89, usage: 15, color: '#06B6D4' }
          ].map((mood) => (
            <div key={mood.mood} className="bg-white/5 rounded-lg p-4 text-center">
              <div 
                className="w-4 h-4 rounded-full mx-auto mb-2"
                style={{ backgroundColor: mood.color }}
              />
              <div className="text-white font-medium text-sm">{mood.mood}</div>
              <div className="text-lg font-bold text-white">{mood.effectiveness}%</div>
              <div className="text-xs text-gray-400">{mood.usage} uses</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <span>AI Insights & Recommendations</span>
        </h3>
        
        <div className="space-y-3">
          {[
            'Contemplative mood shows highest engagement (94%) for current audience size',
            'Morning hours favor peaceful/contemplative moods based on historical data',
            'Consider A/B testing Social vs Contemplative for afternoon sessions',
            'System accuracy has improved 12% over the last 10 sessions'
          ].map((insight, index) => (
            <div key={index} className="flex items-start space-x-3 bg-white/5 rounded-lg p-3">
              <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-300">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* A/B Testing Quick Panel */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <TestTube className="w-5 h-5" />
          <span>A/B Testing</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Active Test</h4>
            <div className="text-sm text-gray-300">Social vs Contemplative</div>
            <div className="text-xs text-gray-400 mt-1">23 sessions • 67% confidence</div>
          </div>
          
          <div className="space-y-2">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
              Start New A/B Test
            </button>
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">
              View Test History
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}