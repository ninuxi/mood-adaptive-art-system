// OSC Protocol controller for professional software integration
// This will be implemented in Week 3 with actual OSC library

export interface OSCMessage {
  address: string
  args: (number | string | boolean)[]
}

export interface SoftwareConnection {
  id: string
  name: string
  ip: string
  port: number
  protocol: 'OSC' | 'MIDI' | 'ArtNet'
  connected: boolean
  lastPing: number
}

// QLab OSC Commands
export const QLAB_COMMANDS = {
  // Playback control
  GO: '/go',
  STOP: '/stop',
  PAUSE: '/pause',
  RESET: '/reset',
  
  // Cue control
  CUE_GO: (cueId: string) => `/cue/${cueId}/go`,
  CUE_STOP: (cueId: string) => `/cue/${cueId}/stop`,
  CUE_LOAD: (cueId: string) => `/cue/${cueId}/load`,
  
  // Parameter control
  CUE_VOLUME: (cueId: string) => `/cue/${cueId}/sliderLevel`,
  CUE_RATE: (cueId: string) => `/cue/${cueId}/rate`,
  CUE_FADE: (cueId: string) => `/cue/${cueId}/fadeTime`,
  
  // Workspace
  WORKSPACE: '/workspace'
}

// Resolume OSC Commands  
export const RESOLUME_COMMANDS = {
  // Layer control
  LAYER_OPACITY: (layer: number) => `/layer${layer}/video/opacity/values`,
  LAYER_CLIP: (layer: number, clip: number) => `/layer${layer}/clip${clip}/connect`,
  LAYER_CLEAR: (layer: number) => `/layer${layer}/clear`,
  
  // Effects
  EFFECT_PARAM: (layer: number, effect: number, param: number) => 
    `/layer${layer}/video/effect${effect}/param${param}/values`,
  EFFECT_BYPASS: (layer: number, effect: number) => 
    `/layer${layer}/video/effect${effect}/bypassed`,
    
  // Composition
  COMP_BPM: '/composition/tempocontroller/tempo',
  COMP_CROSSFADER: '/composition/crossfader',
  
  // Transport
  TRANSPORT_PLAY: '/composition/transportcontroller/play',
  TRANSPORT_STOP: '/composition/transportcontroller/stop'
}

// Lighting Control (ArtNet/DMX mapping)
export const DMX_CHANNELS = {
  // Generic fixture mapping
  INTENSITY: 1,
  RED: 2,
  GREEN: 3,
  BLUE: 4,
  WHITE: 5,
  STROBE: 6,
  
  // Scene control
  SCENE_SELECT: 10,
  SCENE_FADE_TIME: 11,
  MASTER_INTENSITY: 12
}

export class OSCController {
  private connections: Map<string, SoftwareConnection> = new Map()
  private mockMode: boolean = true // Set to false when implementing real OSC
  
  // Connection callbacks
  private onConnectionChange?: (id: string, connected: boolean) => void
  private onMessage?: (software: string, message: string) => void

  constructor() {
    // Initialize default connections
    this.initializeConnections()
  }

  private initializeConnections() {
    const defaultConnections: SoftwareConnection[] = [
      {
        id: 'qlab',
        name: 'QLab',
        ip: '192.168.1.10',
        port: 53000,
        protocol: 'OSC',
        connected: false,
        lastPing: 0
      },
      {
        id: 'resolume',
        name: 'Resolume Arena',
        ip: '192.168.1.11', 
        port: 7000,
        protocol: 'OSC',
        connected: false,
        lastPing: 0
      },
      {
        id: 'chamsys',
        name: 'Chamsys MagicQ',
        ip: '192.168.1.12',
        port: 6454,
        protocol: 'ArtNet',
        connected: false,
        lastPing: 0
      }
    ]

    defaultConnections.forEach(conn => {
      this.connections.set(conn.id, conn)
    })
  }

  // Connection management
  async connect(softwareId: string): Promise<boolean> {
    const connection = this.connections.get(softwareId)
    if (!connection) {
      throw new Error(`Unknown software: ${softwareId}`)
    }

    if (this.mockMode) {
      // Simulate connection
      connection.connected = true
      connection.lastPing = Date.now()
      
      if (this.onConnectionChange) {
        this.onConnectionChange(softwareId, true)
      }
      
      console.log(`[MOCK] Connected to ${connection.name} at ${connection.ip}:${connection.port}`)
      return true
    }

    // Real implementation would go here
    // Example: await this.establishOSCConnection(connection)
    
    return false
  }

  async disconnect(softwareId: string): Promise<void> {
    const connection = this.connections.get(softwareId)
    if (!connection) return

    connection.connected = false
    connection.lastPing = 0

    if (this.onConnectionChange) {
      this.onConnectionChange(softwareId, false)
    }

    console.log(`Disconnected from ${connection.name}`)
  }

  // Send commands to QLab
  async sendToQLab(command: string, args: (number | string)[] = []): Promise<void> {
    const connection = this.connections.get('qlab')
    if (!connection?.connected) {
      throw new Error('QLab not connected')
    }

    if (this.mockMode) {
      console.log(`[QLAB MOCK] ${command}`, args)
      if (this.onMessage) {
        this.onMessage('qlab', `${command} ${args.join(' ')}`)
      }
      return
    }

    // Real OSC implementation would go here
    // await this.sendOSC(connection, { address: command, args })
  }

  // Send commands to Resolume
  async sendToResolume(command: string, args: (number | string)[] = []): Promise<void> {
    const connection = this.connections.get('resolume')
    if (!connection?.connected) {
      throw new Error('Resolume not connected')
    }

    if (this.mockMode) {
      console.log(`[RESOLUME MOCK] ${command}`, args)
      if (this.onMessage) {
        this.onMessage('resolume', `${command} ${args.join(' ')}`)
      }
      return
    }

    // Real OSC implementation would go here
    // await this.sendOSC(connection, { address: command, args })
  }

  // Send DMX data to lighting
  async sendDMX(channel: number, value: number): Promise<void> {
    const connection = this.connections.get('chamsys')
    if (!connection?.connected) {
      throw new Error('Lighting controller not connected')
    }

    if (this.mockMode) {
      console.log(`[DMX MOCK] Channel ${channel}: ${value}`)
      if (this.onMessage) {
        this.onMessage('chamsys', `DMX Ch${channel}=${value}`)
      }
      return
    }

    // Real ArtNet implementation would go here
    // await this.sendArtNet(connection, channel, value)
  }

  // High-level mood control methods
  async applyMoodToQLab(moodRecommendation: any): Promise<void> {
    const { qlab } = moodRecommendation.softwareRecommendations
    
    try {
      // Set volume
      await this.sendToQLab(QLAB_COMMANDS.CUE_VOLUME('current'), [qlab.volume])
      
      // Load appropriate cue
      await this.sendToQLab(QLAB_COMMANDS.CUE_LOAD(qlab.cue))
      
      // Set fade time
      await this.sendToQLab(QLAB_COMMANDS.CUE_FADE('current'), [qlab.fadeTime])
      
    } catch (error) {
      console.error('Failed to apply mood to QLab:', error)
    }
  }

  async applyMoodToResolume(moodRecommendation: any): Promise<void> {
    const { resolume } = moodRecommendation.softwareRecommendations
    
    try {
      // Set layer opacity
      await this.sendToResolume(RESOLUME_COMMANDS.LAYER_OPACITY(1), [resolume.opacity])
      
      // Trigger clip (simplified - would need actual clip mapping)
      await this.sendToResolume(RESOLUME_COMMANDS.LAYER_CLIP(1, 1), [1])
      
      // Set speed
      await this.sendToResolume(RESOLUME_COMMANDS.COMP_BPM, [120 * resolume.speed])
      
    } catch (error) {
      console.error('Failed to apply mood to Resolume:', error)
    }
  }

  async applyMoodToLighting(moodRecommendation: any): Promise<void> {
    const { lighting } = moodRecommendation.softwareRecommendations
    
    try {
      // Set intensity
      await this.sendDMX(DMX_CHANNELS.INTENSITY, Math.round(lighting.intensity * 255))
      
      // Parse color (simplified)
      const color = this.hexToRGB(lighting.color)
      await this.sendDMX(DMX_CHANNELS.RED, color.r)
      await this.sendDMX(DMX_CHANNELS.GREEN, color.g)
      await this.sendDMX(DMX_CHANNELS.BLUE, color.b)
      
      // Set fade time (would need specific fixture support)
      console.log(`Lighting transition time: ${lighting.transition}s`)
      
    } catch (error) {
      console.error('Failed to apply mood to lighting:', error)
    }
  }

  // Apply complete mood recommendation to all software
  async applyMoodRecommendation(moodRecommendation: any): Promise<void> {
    const promises: Promise<void>[] = [] // Explicit typing
    
    if (this.connections.get('qlab')?.connected) {
      promises.push(this.applyMoodToQLab(moodRecommendation))
    }
    
    if (this.connections.get('resolume')?.connected) {
      promises.push(this.applyMoodToResolume(moodRecommendation))
    }
    
    if (this.connections.get('chamsys')?.connected) {
      promises.push(this.applyMoodToLighting(moodRecommendation))
    }

    try {
      await Promise.all(promises)
      console.log(`Applied ${moodRecommendation.recommendedMood} mood to all connected software`)
    } catch (error) {
      console.error('Failed to apply mood to some software:', error)
    }
  }

  // Utility methods
  private hexToRGB(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 }
  }

  // Status and monitoring
  getConnections(): SoftwareConnection[] {
    return Array.from(this.connections.values())
  }

  getConnectionStatus(softwareId: string): SoftwareConnection | null {
    return this.connections.get(softwareId) || null
  }

  isConnected(softwareId: string): boolean {
    return this.connections.get(softwareId)?.connected || false
  }

  // Event handlers
  onConnectionStatusChange(callback: (id: string, connected: boolean) => void): void {
    this.onConnectionChange = callback
  }

  onMessageSent(callback: (software: string, message: string) => void): void {
    this.onMessage = callback
  }

  // Mock mode control (for development)
  setMockMode(enabled: boolean): void {
    this.mockMode = enabled
    console.log(`OSC Mock mode: ${enabled ? 'enabled' : 'disabled'}`)
  }

  isMockMode(): boolean {
    return this.mockMode
  }

  // Emergency stop all software
  async emergencyStopAll(): Promise<void> {
    const promises: Promise<void>[] = [] // Explicit typing
    
    if (this.connections.get('qlab')?.connected) {
      promises.push(this.sendToQLab(QLAB_COMMANDS.STOP))
    }
    
    if (this.connections.get('resolume')?.connected) {
      promises.push(this.sendToResolume(RESOLUME_COMMANDS.TRANSPORT_STOP))
    }
    
    if (this.connections.get('chamsys')?.connected) {
      promises.push(this.sendDMX(DMX_CHANNELS.MASTER_INTENSITY, 0))
    }

    try {
      await Promise.all(promises)
      console.log('Emergency stop sent to all connected software')
    } catch (error) {
      console.error('Emergency stop failed:', error)
    }
  }
}