'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wifi, 
  WifiOff, 
  Music, 
  Monitor, 
  Lightbulb,
  RefreshCw,
  Settings,
  AlertCircle
} from 'lucide-react'

interface SoftwareStatus {
  id: string
  name: string
  type: 'audio' | 'video' | 'lighting'
  connected: boolean
  version: string
  lastPing: number
  icon: React.ReactNode
  color: string
}

export function SoftwareStatusPanel() {
  const [softwareList, setSoftwareList] = useState<SoftwareStatus[]>([
    {
      id: 'qlab',
      name: 'QLab',
      type: 'audio',
      connected: true,
      version: '5.3.4',
      lastPing: Date.now(),
      icon: <Music className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'resolume',
      name: 'Resolume Arena',
      type: 'video',
      connected: false,
      version: '7.16.0',
      lastPing: Date.now() - 30000,
      icon: <Monitor className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'chamsys',
      name: 'Chamsys MagicQ',
      type: 'lighting',
      connected: true,
      version: '1.9.3.1',
      lastPing: Date.now() - 2000,
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-600'
    }
  ])

  // Simula aggiornamenti di connessione
  useEffect(() => {
    const interval = setInterval(() => {
      setSoftwareList(prev => prev.map(software => ({
        ...software,
        lastPing: software.connected ? Date.now() : software.lastPing
      })))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const toggleConnection = (id: string) => {
    setSoftwareList(prev => prev.map(software => 
      software.id === id 
        ? { ...software, connected: !software.connected, lastPing: Date.now() }
        : software
    ))
  }

  const connectedCount = softwareList.filter(s => s.connected).length
  const totalCount = softwareList.length

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Software Status</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {connectedCount}/{totalCount} Connected
          </span>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {softwareList.map((software, index) => (
          <motion.div
            key={software.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${software.color} rounded-lg flex items-center justify-center`}>
                  {software.icon}
                </div>
                <div>
                  <h3 className="font-medium text-white">{software.name}</h3>
                  <p className="text-xs text-gray-400">v{software.version}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <ConnectionStatus 
                  connected={software.connected}
                  lastPing={software.lastPing}
                />
                <button
                  onClick={() => toggleConnection(software.id)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {software.connected && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-3 border-t border-white/10"
              >
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Protocol:</span>
                    <span className="ml-2 text-white">
                      {software.type === 'lighting' ? 'ArtNet' : 'OSC'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Port:</span>
                    <span className="ml-2 text-white">
                      {software.type === 'lighting' ? '6454' : 
                       software.id === 'qlab' ? '53000' : '7000'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex space-x-2">
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-4 rounded-lg transition-colors">
            Connect All
          </button>
          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg transition-colors">
            Emergency Stop
          </button>
        </div>
      </div>
    </div>
  )
}

interface ConnectionStatusProps {
  connected: boolean
  lastPing: number
}

function ConnectionStatus({ connected, lastPing }: ConnectionStatusProps) {
  const [ping, setPing] = useState(0)

  useEffect(() => {
    if (connected) {
      setPing(Date.now() - lastPing)
      const interval = setInterval(() => {
        setPing(Date.now() - lastPing)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [connected, lastPing])

  if (!connected) {
    return (
      <div className="flex items-center space-x-2">
        <WifiOff className="w-4 h-4 text-red-400" />
        <span className="text-xs text-red-400">Offline</span>
      </div>
    )
  }

  const pingColor = ping < 5000 ? 'text-green-400' : 
                   ping < 15000 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="flex items-center space-x-2">
      <Wifi className={`w-4 h-4 ${pingColor}`} />
      <span className={`text-xs ${pingColor}`}>
        {Math.floor(ping / 1000)}s
      </span>
    </div>
  )
}