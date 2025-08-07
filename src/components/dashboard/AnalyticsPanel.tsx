'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  Calendar, 
  Download, 
  Filter,
  TrendingUp,
  Users,
  Clock,
  Activity,
  Eye
} from 'lucide-react'
import { useMoodHistory, useAudienceMetrics } from '@/stores/moodStore'

type TimeRange = '1h' | '24h' | '7d' | '30d'

export function AnalyticsPanel() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const [selectedMetric, setSelectedMetric] = useState<'moods' | 'engagement' | 'audience'>('moods')
  
  const moodHistory = useMoodHistory()
  const audienceMetrics = useAudienceMetrics()

  // Generate mock data based on time range
  const generateTimeSeriesData = () => {
    const now = new Date()
    const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720
    const dataPoints = timeRange === '1h' ? 12 : timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30
    const interval = hours / dataPoints

    return Array.from({ length: dataPoints }, (_, i) => {
      const time = new Date(now.getTime() - (hours - i * interval) * 60 * 60 * 1000)
      return {
        time: timeRange === '7d' ? time.toLocaleDateString('en', { weekday: 'short' }) :
              timeRange === '30d' ? `${time.getDate()}/${time.getMonth() + 1}` :
              time.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        people: Math.floor(Math.random() * 20) + 5,
        energy: Math.random() * 0.8 + 0.2,
        engagement: Math.random() * 0.6 + 0.4,
        interactions: Math.floor(Math.random() * 50) + 10
      }
    })
  }

  const moodDistributionData = [
    { name: 'Contemplative', value: 35, color: '#8B5CF6' },
    { name: 'Social', value: 25, color: '#10B981' },
    { name: 'Energetic', value: 20, color: '#EF4444' },
    { name: 'Peaceful', value: 15, color: '#06B6D4' },
    { name: 'Mysterious', value: 5, color: '#6366F1' }
  ]

  const timeSeriesData = generateTimeSeriesData()

  const timeRanges = [
    { id: '1h' as TimeRange, label: '1 Hour' },
    { id: '24h' as TimeRange, label: '24 Hours' },
    { id: '7d' as TimeRange, label: '7 Days' },
    { id: '30d' as TimeRange, label: '30 Days' }
  ]

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics & Insights</h2>
          <p className="text-gray-400">Track performance and audience engagement over time</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-white/10 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  timeRange === range.id
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Visitors"
          value={audienceMetrics.totalVisitors}
          unit=""
          change={12}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Avg. Stay Time"
          value={audienceMetrics.averageStayTime}
          unit="min"
          change={8}
          icon={<Clock className="w-5 h-5" />}
          color="green"
        />
        <MetricCard
          title="Peak Occupancy"
          value={audienceMetrics.peakOccupancy}
          unit="people"
          change={-3}
          icon={<TrendingUp className="w-5 h-5" />}
          color="yellow"
        />
        <MetricCard
          title="Engagement Score"
          value={Math.round(audienceMetrics.engagementScore * 100)}
          unit="%"
          change={15}
          icon={<Activity className="w-5 h-5" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Chart */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Audience & Engagement</h3>
            <div className="flex bg-white/10 rounded-lg p-1">
              {[
                { id: 'moods' as const, label: 'Moods' },
                { id: 'engagement' as const, label: 'Engagement' },
                { id: 'audience' as const, label: 'Audience' }
              ].map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    selectedMetric === metric.id
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {metric.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {selectedMetric === 'audience' ? (
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="audienceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="time" stroke="#ffffff60" fontSize={12} />
                  <YAxis stroke="#ffffff60" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="people" 
                    stroke="#8B5CF6" 
                    fillOpacity={1} 
                    fill="url(#audienceGradient)"
                  />
                </AreaChart>
              ) : selectedMetric === 'engagement' ? (
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="time" stroke="#ffffff60" fontSize={12} />
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
                    dataKey="engagement" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="time" stroke="#ffffff60" fontSize={12} />
                  <YAxis stroke="#ffffff60" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="energy" fill="#EF4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Mood Distribution</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {moodDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 space-y-2">
            {moodDistributionData.map((mood, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: mood.color }}
                  />
                  <span className="text-sm text-gray-300">{mood.name}</span>
                </div>
                <span className="text-sm text-white">{mood.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Mood History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Recent Mood Changes</h3>
          
          <div className="space-y-3">
            {moodHistory.slice(0, 6).map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white">{entry.mood}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{entry.duration}m</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Performance Insights</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">High Performance</span>
              </div>
              <p className="text-xs text-gray-300">
                Social mood shows 25% higher engagement than average. Consider extending social triggers.
              </p>
            </div>
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Observation</span>
              </div>
              <p className="text-xs text-gray-300">
                Peak visitor hours are 2-4 PM. Consider preparing energetic moods during this time.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">Scheduling</span>
              </div>
              <p className="text-xs text-gray-300">
                Weekend patterns differ significantly. Consider creating weekend-specific mood profiles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: number
  unit: string
  change: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'purple'
}

function MetricCard({ title, value, unit, change, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600'
  }

  const changeColor = change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'
  const changeIcon = change > 0 ? '↗' : change < 0 ? '↘' : '→'

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 bg-gradient-to-r ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <span className={`text-xs ${changeColor} flex items-center space-x-1`}>
          <span>{changeIcon}</span>
          <span>{Math.abs(change)}%</span>
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">
          {value}
          <span className="text-sm text-gray-400 ml-1">{unit}</span>
        </p>
        <p className="text-sm text-gray-400">{title}</p>
      </div>
    </div>
  )
}