// src/components/dashboard/AIAnalyticsPanel.tsx - AI Analytics Dashboard
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  Download,
  Upload,
  RotateCcw,
  Play,
  Pause,
  TestTube,
  Lightbulb,
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'
import { 
  useMoodStore, 
  useAIStatus, 
  useAIPrediction, 
  useLearningMetrics, 
  useABTestStatus,
  useCurrentMood,
  useEnvironmentData
} from '@/stores/moodStore'

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  color: string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  subtitle?: string
}

const MetricCard = ({ title, value, unit = '', icon, color, change, trend, subtitle }: MetricCardProps) => (
  <motion.div
    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-${color}-500/20`}>
        {icon}
      </div>
      {change !== undefined && (
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          trend === 'up' ? 'bg-green-500/20 text-green-400' :
          trend === 'down' ? 'bg-red-500/20 text-red-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {trend === 'up' && <ArrowUp className="w-3 h-3" />}
          {trend === 'down' && <ArrowDown className="w-3 h-3" />}
          <span>{change > 0 ? '+' : ''}{change}%</span>
        </div>
      )}
    </div>
    <div className="text-3xl font-bold text-white mb-1">
      {value}{unit}
    </div>
    <div className="text-sm text-gray-400">{title}</div>
    {subtitle && (
      <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
    )}
  </motion.div>
)

interface ConfidenceGaugeProps {
  confidence: number
  size?: number
}

const ConfidenceGauge = ({ confidence, size = 120 }: ConfidenceGaugeProps) => {
  const circumference = 2 * Math.PI * 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (confidence * circumference)
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={45}
          stroke="rgb(75 85 99)"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={45}
          stroke={confidence > 0.8 ? '#10B981' : confidence > 0.6 ? '#F59E0B' : '#EF4444'}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {Math.round(confidence * 100)}%
          </div>
          <div className="text-xs text-gray-400">Confidence</div>
        </div>
      </div>
    </div>
  )
}

interface PredictionCardProps {
  prediction: any
  onApply: () => void
  onRecord: (engagement: number) => void
}

const PredictionCard = ({ prediction, onApply, onRecord }: PredictionCardProps) => {
  const [showDetails, setShowDetails] = useState(false)
  const [engagement, setEngagement] = useState(0.7)

  if (!prediction) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="text-center text-gray-400">
          <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No AI prediction available</p>
          <p className="text-xs mt-2">Enable AI system to start getting predictions</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: getMoodColor(prediction.recommendedMood) }}
          />
          <h3 className="text-lg font-semibold text-white">{prediction.recommendedMood}</h3>
        </div>
        <ConfidenceGauge confidence={prediction.confidence} size={80} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-400">Energy</div>
          <div className="text-lg font-bold text-white">
            {Math.round(prediction.parameters.energy * 100)}%
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-400">Valence</div>
          <div className="text-lg font-bold text-white">
            {Math.round(prediction.parameters.valence * 100)}%
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-400">Arousal</div>
          <div className="text-lg font-bold text-white">
            {Math.round(prediction.parameters.arousal * 100)}%
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">AI Reasoning:</h4>
        <div className="space-y-1">
          {prediction.reasoning.slice(0, 2).map((reason: string, index: number) => (
            <div key={index} className="text-xs text-gray-400 flex items-start space-x-2">
              <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
        {prediction.reasoning.length > 2 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-400 hover:text-blue-300 mt-1"
          >
            {showDetails ? 'Show less' : `+${prediction.reasoning.length - 2} more reasons`}
          </button>
        )}
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4"
        >
          <div className="space-y-1">
            {prediction.reasoning.slice(2).map((reason: string, index: number) => (
              <div key={index} className="text-xs text-gray-400 flex items-start space-x-2">
                <Info className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div className="bg-blue-500/10 rounded p-2 text-center">
          <div className="text-blue-400">Expected Engagement</div>
          <div className="text-white font-bold">
            {Math.round(prediction.expectedOutcome.engagementScore * 100)}%
          </div>
        </div>
        <div className="bg-green-500/10 rounded p-2 text-center">
          <div className="text-green-400">Retention</div>
          <div className="text-white font-bold">
            {Math.round(prediction.expectedOutcome.audienceRetention * 100)}%
          </div>
        </div>
        <div className="bg-purple-500/10 rounded p-2 text-center">
          <div className="text-purple-400">Duration</div>
          <div className="text-white font-bold">
            {Math.round(prediction.predictedDuration / 60)}min
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onApply}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Apply Mood
        </button>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={engagement}
            onChange={(e) => setEngagement(parseFloat(e.target.value))}
            className="w-16"
          />
          <button
            onClick={() => onRecord(engagement)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs"
          >
            Record
          </button>
        </div>
      </div>
    </motion.div>
  )
}

interface LearningProgressProps {
  metrics: any
}

const LearningProgress = ({ metrics }: LearningProgressProps) => {
  if (!metrics) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="text-center text-gray-400">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No learning data available</p>
        </div>
      </div>
    )
  }

  const progressData = metrics.improvements.accuracyTrend.map((accuracy: number, index: number) => ({
    session: `S${index + 1}`,
    accuracy: accuracy * 100,
    trend: index > 0 ? accuracy - metrics.improvements.accuracyTrend[index - 1] : 0
  }))

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Learning Progress</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Learning Active</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{metrics.totalSessions}</div>
          <div className="text-sm text-gray-400">Total Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {Math.round(metrics.averageAccuracy * 100)}%
          </div>
          <div className="text-sm text-gray-400">Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {Math.round(metrics.improvements.learningRate * 100)}%
          </div>
          <div className="text-sm text-gray-400">Learning Rate</div>
        </div>
      </div>

      {progressData.length > 0 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="session" stroke="#ffffff60" fontSize={12} />
              <YAxis stroke="#ffffff60" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

interface MoodEffectivenessProps {
  metrics: any
}

const MoodEffectiveness = ({ metrics }: MoodEffectivenessProps) => {
  if (!metrics || !metrics.moodEffectiveness) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="text-center text-gray-400">
          <PieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No effectiveness data available</p>
        </div>
      </div>
    )
  }

  const effectivenessData = Object.entries(metrics.moodEffectiveness).map(([mood, stats]: [string, any]) => ({
    mood,
    effectiveness: Math.round(stats.avgEngagement * 100),
    usage: stats.usage,
    duration: Math.round(stats.avgDuration / 60),
    color: getMoodColor(mood)
  }))

  const COLORS = ['#EF4444', '#10B981', '#8B5CF6', '#6366F1', '#06B6D4']

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Mood Effectiveness</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Effectiveness Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={effectivenessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="mood" stroke="#ffffff60" fontSize={10} />
              <YAxis stroke="#ffffff60" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="effectiveness" fill="#8884d8" radius={[4, 4, 0, 0]}>
                {effectivenessData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Effectiveness Details */}
        <div className="space-y-3">
          {effectivenessData.map((mood, index) => (
            <div key={mood.mood} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: mood.color }}
                />
                <span className="text-white font-medium">{mood.mood}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="text-white font-bold">{mood.effectiveness}%</div>
                  <div className="text-gray-400 text-xs">Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold">{mood.usage}</div>
                  <div className="text-gray-400 text-xs">Uses</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold">{mood.duration}m</div>
                  <div className="text-gray-400 text-xs">Avg Duration</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface ABTestPanelProps {
  abTestStatus: any
  onStartTest: (moodA: string, moodB: string, context: string) => void
  onCompleteTest: () => void
}

const ABTestPanel = ({ abTestStatus, onStartTest, onCompleteTest }: ABTestPanelProps) => {
  const [moodA, setMoodA] = useState('Energetic')
  const [moodB, setMoodB] = useState('Social')
  const [context, setContext] = useState('Evening crowd')

  const moods = ['Energetic', 'Social', 'Contemplative', 'Mysterious', 'Peaceful']

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <TestTube className="w-5 h-5" />
          <span>A/B Testing</span>
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs ${
          abTestStatus.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {abTestStatus.enabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {abTestStatus.currentTest?.isActive ? (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">Active Test</h4>
              <div className="text-sm text-blue-400">{abTestStatus.currentTest.sessionCount} sessions</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-white font-bold">{abTestStatus.currentTest.moodA}</div>
                <div className="text-gray-400">Mood A</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold">{abTestStatus.currentTest.moodB}</div>
                <div className="text-gray-400">Mood B</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Context: {abTestStatus.currentTest.context}
            </div>
          </div>
          
          <button
            onClick={onCompleteTest}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Complete Test
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mood A</label>
              <select
                value={moodA}
                onChange={(e) => setMoodA(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                {moods.map(mood => (
                  <option key={mood} value={mood}>{mood}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mood B</label>
              <select
                value={moodB}
                onChange={(e) => setMoodB(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                {moods.map(mood => (
                  <option key={mood} value={mood}>{mood}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Context</label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., Evening crowd, Morning visitors, Special event"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
            />
          </div>
          
          <button
            onClick={() => onStartTest(moodA, moodB, context)}
            disabled={!abTestStatus.enabled || moodA === moodB}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm disabled:cursor-not-allowed"
          >
            Start A/B Test
          </button>
        </div>
      )}

      {abTestStatus.history.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Test Results</h4>
          <div className="space-y-2">
            {abTestStatus.history.slice(0, 3).map((test: any, index: number) => (
              <div key={test.testId} className="bg-white/5 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white">{test.moodA} vs {test.moodB}</span>
                  <span className="text-green-400 font-bold">Winner: {test.winnerMood}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {test.sampleSize} sessions • {Math.round(test.confidenceLevel * 100)}% confidence
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function AIAnalyticsPanel() {
  const aiStatus = useAIStatus()
  const prediction = useAIPrediction()
  const learningMetrics = useLearningMetrics()
  const abTestStatus = useABTestStatus()
  const currentMood = useCurrentMood()
  const environmentData = useEnvironmentData()
  
  const {
    initializeAdvancedAI,
    setAIEnabled,
    requestAIPrediction,
    applyAIPrediction,
    recordMoodOutcome,
    updateLearningMetrics,
    exportLearningData,
    importLearningData,
    resetLearning,
    startABTest,
    completeCurrentABTest,
    setABTestingEnabled,
    getAIInsights
  } = useMoodStore()

  const [insights, setInsights] = useState<any>({
    predictionAccuracy: 0,
    learningProgress: 0,
    moodEffectiveness: {},
    recommendations: []
  })

  useEffect(() => {
    const newInsights = getAIInsights()
    setInsights(newInsights)
  }, [learningMetrics, prediction])

  const handleInitializeAI = async () => {
    await initializeAdvancedAI()
    await updateLearningMetrics()
  }

  const handleApplyPrediction = async () => {
    if (prediction) {
      await applyAIPrediction(prediction)
    }
  }

  const handleRecordOutcome = (engagement: number) => {
    recordMoodOutcome(engagement, 300, engagement * 0.9) // 5min duration, feedback based on engagement
  }

  const handleStartABTest = async (moodA: string, moodB: string, context: string) => {
    await startABTest(moodA, moodB, context)
  }

  const handleExportData = () => {
    const data = exportLearningData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mood-ai-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          await importLearningData(data)
          await updateLearningMetrics()
        } catch (error) {
          console.error('Failed to import data:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">AI Analytics</h2>
          <div className={`px-3 py-1 rounded-full text-sm ${
            aiStatus.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {aiStatus.enabled ? 'AI Active' : 'AI Disabled'}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {!aiStatus.enabled ? (
            <button
              onClick={handleInitializeAI}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <Brain className="w-4 h-4" />
              <span>Initialize AI</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => requestAIPrediction()}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                <Zap className="w-4 h-4" />
                <span>New Prediction</span>
              </button>
              
              <button
                onClick={handleExportData}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <label className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import</span>
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
              
              <button
                onClick={resetLearning}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </>
          )}
        </div>
      </div>

      {aiStatus.enabled ? (
        <>
          {/* AI Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Prediction Accuracy"
              value={Math.round(insights.predictionAccuracy * 100)}
              unit="%"
              icon={<Target className="w-6 h-6 text-green-400" />}
              color="green"
              change={Math.round((insights.predictionAccuracy - 0.7) * 100)}
              trend={insights.predictionAccuracy > 0.7 ? 'up' : 'down'}
            />
            
            <MetricCard
              title="Learning Progress"
              value={Math.round(insights.learningProgress * 100)}
              unit="%"
              icon={<Brain className="w-6 h-6 text-blue-400" />}
              color="blue"
              subtitle={`${aiStatus.experience} sessions completed`}
            />
            
            <MetricCard
              title="AI Confidence"
              value={Math.round(aiStatus.confidence * 100)}
              unit="%"
              icon={<Zap className="w-6 h-6 text-purple-400" />}
              color="purple"
              trend={aiStatus.confidence > 0.7 ? 'up' : aiStatus.confidence > 0.5 ? 'stable' : 'down'}
            />
            
            <MetricCard
              title="Active Tests"
              value={abTestStatus.currentTest ? 1 : 0}
              icon={<TestTube className="w-6 h-6 text-yellow-400" />}
              color="yellow"
              subtitle={`${abTestStatus.history.length} completed`}
            />
          </div>

          {/* AI Prediction & Learning */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current AI Prediction */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5" />
                <span>AI Recommendation</span>
              </h3>
              <PredictionCard
                prediction={prediction}
                onApply={handleApplyPrediction}
                onRecord={handleRecordOutcome}
              />
            </div>

            {/* Learning Progress */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Learning Progress</span>
              </h3>
              <LearningProgress metrics={learningMetrics} />
            </div>
          </div>

          {/* Mood Effectiveness Analysis */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Mood Effectiveness Analysis</span>
            </h3>
            <MoodEffectiveness metrics={learningMetrics} />
          </div>

          {/* Pattern Recognition Insights */}
          {learningMetrics?.patternRecognition && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Time Patterns */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Time Patterns</span>
                </h3>
                <div className="space-y-3">
                  {learningMetrics.patternRecognition.timePatterns.map((pattern: any, index: number) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getMoodColor(pattern.preferredMood) }}
                          />
                          <span className="text-white font-medium">{pattern.timeRange}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{pattern.preferredMood}</div>
                          <div className="text-xs text-gray-400">
                            {Math.round(pattern.success * 100)}% success
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crowd Patterns */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Crowd Patterns</span>
                </h3>
                <div className="space-y-3">
                  {learningMetrics.patternRecognition.crowdPatterns.map((pattern: any, index: number) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getMoodColor(pattern.optimalMood) }}
                          />
                          <span className="text-white font-medium capitalize">{pattern.crowdSize} crowd</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{pattern.optimalMood}</div>
                          <div className="text-xs text-gray-400">
                            {Math.round(pattern.engagementScore * 100)}% engagement
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* A/B Testing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <TestTube className="w-5 h-5" />
                <span>A/B Testing</span>
                <button
                  onClick={() => setABTestingEnabled(!abTestStatus.enabled)}
                  className={`ml-auto px-3 py-1 rounded text-xs ${
                    abTestStatus.enabled 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  {abTestStatus.enabled ? 'Disable' : 'Enable'}
                </button>
              </h3>
              <ABTestPanel
                abTestStatus={abTestStatus}
                onStartTest={handleStartABTest}
                onCompleteTest={completeCurrentABTest}
              />
            </div>

            {/* AI Recommendations */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>AI Insights</span>
              </h3>
              <div className="space-y-3">
                {insights.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3 bg-white/5 rounded-lg p-3">
                    <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{recommendation}</span>
                  </div>
                ))}
              </div>
              
              {/* Real-time Context */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Current Context</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/5 rounded p-2">
                    <div className="text-gray-400">People</div>
                    <div className="text-white font-bold">{environmentData.peopleCount}</div>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <div className="text-gray-400">Movement</div>
                    <div className="text-white font-bold">{Math.round(environmentData.avgMovement * 100)}%</div>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <div className="text-gray-400">Audio</div>
                    <div className="text-white font-bold">{Math.round(environmentData.audioLevel * 100)}%</div>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <div className="text-gray-400">Time</div>
                    <div className="text-white font-bold capitalize">{environmentData.timeOfDay}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Metrics */}
          {learningMetrics && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Advanced Learning Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Adaptation Speed */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {Math.round(learningMetrics.improvements.adaptationSpeed * 100)}%
                  </div>
                  <div className="text-sm text-gray-400 mb-2">Adaptation Speed</div>
                  <div className="text-xs text-gray-500">
                    How quickly AI adapts to new patterns
                  </div>
                </div>

                {/* Learning Rate */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {Math.round(learningMetrics.improvements.learningRate * 100)}%
                  </div>
                  <div className="text-sm text-gray-400 mb-2">Learning Rate</div>
                  <div className="text-xs text-gray-500">
                    Efficiency of knowledge acquisition
                  </div>
                </div>

                {/* Pattern Accuracy */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {learningMetrics.patternRecognition.timePatterns.length + 
                     learningMetrics.patternRecognition.crowdPatterns.length}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">Active Patterns</div>
                  <div className="text-xs text-gray-500">
                    Recognized behavioral patterns
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* AI Not Enabled State */
        <div className="text-center py-16">
          <Brain className="w-24 h-24 mx-auto text-gray-400 mb-6 opacity-50" />
          <h3 className="text-2xl font-bold text-white mb-4">AI System Not Active</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Initialize the Advanced AI system to start getting intelligent mood predictions, 
            learning from audience behavior, and running A/B tests.
          </p>
          <button
            onClick={handleInitializeAI}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
          >
            Initialize AI System
          </button>
        </div>
      )}
    </div>
  )
}

// Helper function to get mood colors
function getMoodColor(moodName: string): string {
  const colors: Record<string, string> = {
    'Energetic': '#EF4444',
    'Social': '#10B981', 
    'Contemplative': '#8B5CF6',
    'Mysterious': '#6366F1',
    'Peaceful': '#06B6D4'
  }
  return colors[moodName] || '#8B5CF6'
}