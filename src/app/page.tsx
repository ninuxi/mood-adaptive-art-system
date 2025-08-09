// src/app/page.tsx - DEBUG VERSION
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Brain, 
  Settings, 
  BarChart3, 
  Play,
  Pause,
  Power,
  AlertTriangle,
  Sliders,
  Users,
  Clock,
  TrendingUp
} from 'lucide-react'

import { SoftwareStatusPanel } from '@/components/dashboard/SoftwareStatusPanel'
import { MoodSimulator } from '@/components/mood/MoodSimulator'
import { LiveControl } from '@/components/dashboard/LiveControl'
import { AnalyticsPanel } from '@/components/dashboard/AnalyticsPanel'
import { AIAnalyticsPanel } from '@/components/dashboard/AIAnalyticsPanel'
import { MoodVisualizer } from '@/components/mood/MoodVisualizer'
import { CameraVision } from '@/components/vision/CameraVision'
import { AudioAnalysis } from '@/components/audio/AudioAnalysis'

type TabType = 'overview' | 'vision' | 'mood' | 'control' | 'ai-analytics' | 'analytics'

interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  color: string
  change?: number
}

const StatCard = ({ title, value, unit = '', icon, color, change }: StatCardProps) => (
  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg bg-${color}-500/20`}>
        {icon}
      </div>
      {change && (
        <div className={`text-xs px-2 py-1 rounded-full ${
          change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {change > 0 ? '+' : ''}{change}%
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-white">{value}{unit}</div>
    <div className="text-sm text-gray-400">{title}</div>
  </div>
)

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [systemActive, setSystemActive] = useState(false)

  console.log('Dashboard rendering, activeTab:', activeTab) // ⭐ DEBUG

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Activity },
    { id: 'vision' as TabType, label: 'AI Sensors', icon: Brain },
    { id: 'mood' as TabType, label: 'Mood Designer', icon: Settings },
    { id: 'control' as TabType, label: 'Live Control', icon: Sliders },
    { id: 'ai-analytics' as TabType, label: 'AI Analytics', icon: TrendingUp },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MOOD Controller</h1>
                <p className="text-sm text-gray-400">Adaptive Artistic Environment</p>
              </div>
            </div>
            
            {/* System Status & Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  systemActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`} />
                <span className="text-sm text-gray-300">
                  {systemActive ? 'System Active' : 'System Idle'}
                </span>
              </div>
              
              <button
                onClick={() => setSystemActive(!systemActive)}
                className={`p-2 rounded-lg transition-colors ${
                  systemActive 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {systemActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                <Power className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-white/10 backdrop-blur-sm bg-black/10">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    console.log('Tab clicked:', tab.id) // ⭐ DEBUG
                    setActiveTab(tab.id)
                  }}
                  className={`flex items-center space-x-2 px-4 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {activeTab === 'overview' && (
            <>
              {/* Top Row - Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                  title="Current Mood"
                  value="Contemplative"
                  icon={<Brain className={`w-5 h-5 text-purple-400`} />}
                  color="purple"
                  change={5}
                />
                <StatCard
                  title="Active Visitors"
                  value="12"
                  icon={<Users className={`w-5 h-5 text-blue-400`} />}
                  color="blue"
                  change={8}
                />
                <StatCard
                  title="Avg Stay Time"
                  value="18.5"
                  unit="min"
                  icon={<Clock className={`w-5 h-5 text-green-400`} />}
                  color="green"
                  change={12}
                />
                <StatCard
                  title="Engagement"
                  value="78"
                  unit="%"
                  icon={<TrendingUp className={`w-5 h-5 text-yellow-400`} />}
                  color="yellow"
                  change={-3}
                />
              </div>

              {/* Main Content Row */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Software Status - Left Column */}
                <div className="xl:col-span-1">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6">Software Connections</h2>
                    <SoftwareStatusPanel />
                  </div>
                </div>
                
                {/* Mood Analysis - Center/Right Columns */}
                <div className="xl:col-span-2">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-white">Mood Analysis</h2>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${systemActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <span className="text-sm text-gray-400">
                          {systemActive ? 'Simulation Mode' : 'Idle'}
                        </span>
                      </div>
                    </div>
                    <MoodVisualizer systemActive={systemActive} />
                  </div>
                </div>
              </div>

              {/* Environment Data Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Environment Metrics */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Environment Data</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">12</div>
                      <div className="text-sm text-gray-400">People Present</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">40%</div>
                      <div className="text-sm text-gray-400">Movement</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-yellow-400">🔊</span>
                      </div>
                      <div className="text-2xl font-bold text-white">25</div>
                      <div className="text-sm text-gray-400">Audio Level (dB)</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-purple-400">👁️</span>
                      </div>
                      <div className="text-2xl font-bold text-white">70</div>
                      <div className="text-sm text-gray-400">Ambient Light (lux)</div>
                    </div>
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">AI Processing</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm text-green-400">75%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Network Latency</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="w-1/4 h-full bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm text-green-400">45ms</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Memory Usage</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="w-1/2 h-full bg-yellow-500 rounded-full"></div>
                        </div>
                        <span className="text-sm text-yellow-400">52%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">OSC Connections</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-white">0/5</span>
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'vision' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-6">Computer Vision</h2>
                <CameraVision isActive={systemActive} />
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-6">Audio Analysis</h2>
                <AudioAnalysis isActive={systemActive} />
              </div>
            </div>
          )}

          {activeTab === 'mood' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">Mood Designer</h2>
              <MoodSimulator />
            </div>
          )}

          {activeTab === 'control' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <LiveControl />
            </div>
          )}

          {/* ⭐ AI ANALYTICS - REAL COMPONENT */}
          {activeTab === 'ai-analytics' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <AIAnalyticsPanel />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">Analytics & Insights</h2>
              <AnalyticsPanel />
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}