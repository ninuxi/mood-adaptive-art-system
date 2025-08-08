// src/components/dashboard/SoftwareStatusPanel.tsx - UPDATED per Real OSC
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wifi, 
  WifiOff, 
  Play, 
  Square, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Settings,
  Power,
  PowerOff
} from 'lucide-react'
import { useMoodStore, useSoftwareConnections, useOSCStatus } from '@/stores/moodStore'

interface ConnectionCardProps {
  connection: {
    id: string
    name: string
    connected: boolean
    lastPing: number
    status: 'online' | 'offline' | 'error'
    ip?: string
    port?: number
    protocol?: 'OSC' | 'MIDI' | 'ArtNet'
  }
  onConnect: (id: string) => Promise<void>
  onDisconnect: (id: string) => Promise<void>
  onTest: (id: string) => Promise<void>
}

const ConnectionCard = ({ connection, onConnect, onDisconnect, onTest }: ConnectionCardProps) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [ping, setPing] = useState<number>(0)
  
  // Calculate ping time from lastPing
  useEffect(() => {
    if (connection.connected && connection.lastPing > 0) {
      const pingTime = Date.now() - connection.lastPing
      setPing(Math.min(pingTime, 999))
    }
  }, [connection.lastPing, connection.connected])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await onConnect(connection.id)
    } catch (error) {
      console.error(`Failed to connect to ${connection.name}:`, error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await onDisconnect(connection.id)
    } catch (error) {
      console.error(`Failed to disconnect from ${connection.name}:`, error)
    }
  }

  const handleTest = async () => {
    try {
      await onTest(connection.id)
    } catch (error) {
      console.error(`Failed to test ${connection.name}:`, error)
    }
  }

  const getStatusColor = () => {
    switch (connection.status) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-red-500'
      case 'error': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (connection.status) {
      case 'online': return <CheckCircle2 className="w-4 h-4 text-green-400" />
      case 'offline': return <WifiOff className="w-4 h-4 text-red-400" />
      case 'error': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          <div>
            <h3 className="text-white font-medium text-sm">{connection.name}</h3>
            <p className="text-gray-300 text-xs">
              {connection.ip}:{connection.port} ({connection.protocol})
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-xs text-gray-400">
            {connection.connected ? `${ping}ms` : 'Offline'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {connection.connected ? (
            <>
              <button
                onClick={handleDisconnect}
                className="flex items-center space-x-1 px-2 py-1 bg-red-600/20 hover:bg-red-600/30 rounded text-red-400 text-xs transition-colors"
              >
                <PowerOff className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
              <button
                onClick={handleTest}
                className="flex items-center space-x-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 rounded text-blue-400 text-xs transition-colors"
              >
                <Activity className="w-3 h-3" />
                <span>Test</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center space-x-1 px-2 py-1 bg-green-600/20 hover:bg-green-600/30 rounded text-green-400 text-xs transition-colors disabled:opacity-50"
            >
              <Power className="w-3 h-3" />
              <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
            </button>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          {connection.lastPing > 0 ? (
            new Date(connection.lastPing).toLocaleTimeString()
          ) : (
            'Never'
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function SoftwareStatusPanel() {
  const connections = useSoftwareConnections()
  const oscStatus = useOSCStatus()
  const { 
    connectToSoftware, 
    disconnectFromSoftware, 
    sendOSCCommand, 
    initializeOSC,
    emergencyStop 
  } = useMoodStore()

  const [isInitializing, setIsInitializing] = useState(false)

  // Initialize OSC on component mount
  useEffect(() => {
    if (!oscStatus.enabled) {
      handleInitializeOSC()
    }
  }, [])

  const handleInitializeOSC = async () => {
    setIsInitializing(true)
    try {
      await initializeOSC()
      console.log('✅ OSC System initialized')
    } catch (error) {
      console.error('❌ Failed to initialize OSC:', error)
    } finally {
      setIsInitializing(false)
    }
  }

  const handleConnect = async (id: string) => {
    try {
      const success = await connectToSoftware(id)
      if (success) {
        console.log(`✅ Connected to ${id}`)
      } else {
        console.error(`❌ Failed to connect to ${id}`)
      }
    } catch (error) {
      console.error(`Connection error for ${id}:`, error)
    }
  }

  const handleDisconnect = async (id: string) => {
    try {
      await disconnectFromSoftware(id)
      console.log(`🔌 Disconnected from ${id}`)
    } catch (error) {
      console.error(`Disconnection error for ${id}:`, error)
    }
  }

  const handleTest = async (id: string) => {
    try {
      // Send a test command based on software type
      switch (id) {
        case 'qlab':
          await sendOSCCommand('qlab', '/workspace', [])
          break
        case 'resolume':
          await sendOSCCommand('resolume', '/composition', [])
          break
        case 'touchosc':
          await sendOSCCommand('touchosc', '/ping', [1])
          break
        case 'chamsys':
          await sendOSCCommand('chamsys', '/status', [])
          break
        case 'grandma3':
          await sendOSCCommand('grandma3', '/gma3/status', [])
          break
      }
      console.log(`🔔 Test command sent to ${id}`)
    } catch (error) {
      console.error(`Test command failed for ${id}:`, error)
    }
  }

  const handleConnectAll = async () => {
    const promises = connections.map(conn => 
      conn.connected ? Promise.resolve() : handleConnect(conn.id)
    )
    await Promise.allSettled(promises)
  }

  const handleDisconnectAll = async () => {
    const promises = connections.map(conn => 
      conn.connected ? handleDisconnect(conn.id) : Promise.resolve()
    )
    await Promise.allSettled(promises)
  }

  const connectedCount = connections.filter(c => c.connected).length
  const totalCount = connections.length

  return (
    <div className="space-y-6">
      {/* Header con OSC Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">Software Connections</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${oscStatus.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-300">
              OSC {oscStatus.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
        
        <div className="text-sm text-gray-400">
          {connectedCount} / {totalCount} connected
        </div>
      </div>

      {/* OSC Initialization */}
      {!oscStatus.enabled && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <h3 className="text-white font-medium">OSC System Not Initialized</h3>
                <p className="text-gray-300 text-sm">Click to initialize real OSC communication</p>
              </div>
            </div>
            <button
              onClick={handleInitializeOSC}
              disabled={isInitializing}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm disabled:opacity-50"
            >
              {isInitializing ? 'Initializing...' : 'Initialize OSC'}
            </button>
          </div>
        </div>
      )}

      {/* Last OSC Message */}
      {oscStatus.lastMessage && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sm">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-medium">{oscStatus.lastMessage.software}:</span>
            <span className="text-gray-300">{oscStatus.lastMessage.message}</span>
            <span className="text-gray-500 ml-auto">
              {new Date(oscStatus.lastMessage.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex space-x-3">
        <button
          onClick={handleConnectAll}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
        >
          <Wifi className="w-4 h-4" />
          <span>Connect All</span>
        </button>
        
        <button
          onClick={handleDisconnectAll}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
        >
          <WifiOff className="w-4 h-4" />
          <span>Disconnect All</span>
        </button>
        
        <button
          onClick={emergencyStop}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors ml-auto"
        >
          <Square className="w-4 h-4" />
          <span>Emergency Stop</span>
        </button>
      </div>

      {/* Connection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connections.map((connection) => (
          <ConnectionCard
            key={connection.id}
            connection={connection}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onTest={handleTest}
          />
        ))}
      </div>

      {/* Network Status Info */}
      <div className="bg-white/5 backdrop-blur rounded-lg p-4">
        <h3 className="text-white font-medium mb-2">Network Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Local Network:</span>
            <span className="text-white ml-2">192.168.1.0/24</span>
          </div>
          <div>
            <span className="text-gray-400">OSC Ports:</span>
            <span className="text-white ml-2">53000, 7000, 8000, 9000</span>
          </div>
          <div>
            <span className="text-gray-400">ArtNet:</span>
            <span className="text-white ml-2">6454</span>
          </div>
          <div>
            <span className="text-gray-400">Discovery:</span>
            <span className="text-green-400 ml-2">Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}