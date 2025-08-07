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
  AlertTriangle
} from 'lucide-react'

import { SoftwareStatusPanel } from '@/components/dashboard/SoftwareStatusPanel'
import { MoodSimulator } from '@/components/mood/MoodSimulator'
import { LiveControl } from '@/components/dashboard/LiveControl'
import { AnalyticsPanel } from '@/components/dashboard/AnalyticsPanel'
import { MoodVisualizer } from '@/components/mood/MoodVisualizer'

type TabType = 'overview' | 'mood' | 'control' | 'analytics'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [systemActive, setSystemActive] = useState(false)

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Activity },
    { id: 'mood' as TabType, label: 'Mood Designer', icon: Brain },
    { id: 'control' as TabType, label: 'Live Control', icon: Settings },
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
                  onClick={() => setActiveTab(tab.id)}
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
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Software Status */}
              <div className="lg:col-span-1">
                <SoftwareStatusPanel />
              </div>
              
              {/* Mood Visualizer */}
              <div className="lg:col-span-2">
                <MoodVisualizer systemActive={systemActive} />
              </div>
              
              {/* Quick Stats */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StatCard
                    title="Current Mood"
                    value="Contemplative"
                    icon={<Brain className="w-5 h-5" />}
                    color="purple"
                  />
                  <StatCard
                    title="Audience Size"
                    value="12 people"
                    icon={<Activity className="w-5 h-5" />}
                    color="blue"
                  />
                  <StatCard
                    title="Energy Level"
                    value="Medium"
                    icon={<BarChart3 className="w-5 h-5" />}
                    color="green"
                  />
                  <StatCard
                    title="System Uptime"
                    value="2h 34m"
                    icon={<Power className="w-5 h-5" />}
                    color="yellow"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mood' && <MoodSimulator />}
          {activeTab === 'control' && <LiveControl systemActive={systemActive} />}
          {activeTab === 'analytics' && <AnalyticsPanel />}
        </motion.div>
      </main>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: 'purple' | 'blue' | 'green' | 'yellow'
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600'
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  )
}