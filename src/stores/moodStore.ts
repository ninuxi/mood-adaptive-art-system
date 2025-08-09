// src/stores/moodStore.ts - CORRECTED EXPORTS
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { AdvancedMoodAI, ContextData, MoodPrediction, LearningMetrics, ABTestResult } from '@/lib/ai/AdvancedMoodAI'
import { VisionData } from '@/lib/vision/VisionEngine'
import { AudioData } from '@/lib/audio/AudioEngine'

export interface MoodState {
  name: string
  energy: number
  valence: number
  arousal: number
  color: string
  description: string
}

export interface EnvironmentData {
  peopleCount: number
  avgMovement: number
  audioLevel: number
  lightLevel: number
  temperature: number
  conversationalLevel: number
  musicalContent: number
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  dayOfWeek: 'weekday' | 'weekend'
  weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy'
  specialEvents: string[]
}

export interface SoftwareConnection {
  id: string
  name: string
  connected: boolean
  lastPing: number
  status: 'online' | 'offline' | 'error'
  ip?: string
  port?: number
  protocol?: 'OSC' | 'MIDI' | 'ArtNet'
}

export interface AIPredictionState {
  currentPrediction: MoodPrediction | null
  predictionHistory: Array<{
    timestamp: number
    prediction: MoodPrediction
    actualOutcome?: {
      engagement: number
      duration: number
      feedback: number
    }
  }>
  confidence: number
  learningActive: boolean
  totalExperience: number
}

export interface ABTestState {
  currentTest: {
    id: string
    moodA: string
    moodB: string
    context: string
    sessionCount: number
    isActive: boolean
  } | null
  testHistory: ABTestResult[]
  isTestingEnabled: boolean
}

export interface MoodMappings {
  [moodName: string]: {
    qlab?: {
      cue?: string
      volume: number
      fadeTime: number
      rate?: number
      playback?: 'go' | 'pause' | 'stop'
    }
    resolume?: {
      clip?: number
      opacity: number
      speed: number
      crossfader?: number
      effects?: Array<{
        layer: number
        effect: number
        param: number
        value: number
      }>
    }
    lighting?: {
      playback?: number
      intensity: number
      color: string
      transition: number
      fixtures?: Array<{
        id: number
        intensity: number
        color: string
      }>
    }
    grandma3?: {
      sequence?: number
      executors?: Array<{
        id: number
        level: number
      }>
      command?: string
    }
  }
}

export const MOOD_MAPPINGS: MoodMappings = {
  'Energetic': {
    qlab: { cue: 'energy-music', volume: 0.8, fadeTime: 2, rate: 1.2, playback: 'go' },
    resolume: { clip: 3, opacity: 0.9, speed: 1.5, crossfader: 0.8 },
    lighting: { playback: 1, intensity: 0.9, color: '#FF4444', transition: 2 },
    grandma3: { sequence: 101, command: 'Go+ Sequence 101' }
  },
  'Contemplative': {
    qlab: { cue: 'ambient-drone', volume: 0.3, fadeTime: 8, rate: 0.8, playback: 'go' },
    resolume: { clip: 1, opacity: 0.4, speed: 0.6, crossfader: 0.2 },
    lighting: { playback: 2, intensity: 0.4, color: '#8B5CF6', transition: 8 },
    grandma3: { sequence: 102, command: 'Fade 8 Sequence 102' }
  },
  'Social': {
    qlab: { cue: 'conversation-bg', volume: 0.5, fadeTime: 3, rate: 1.0, playback: 'go' },
    resolume: { clip: 5, opacity: 0.7, speed: 1.1, crossfader: 0.5 },
    lighting: { playback: 3, intensity: 0.7, color: '#10B981', transition: 3 },
    grandma3: { sequence: 103, command: 'Go Sequence 103' }
  },
  'Mysterious': {
    qlab: { cue: 'mysterious-soundscape', volume: 0.6, fadeTime: 5, rate: 0.9, playback: 'go' },
    resolume: { clip: 7, opacity: 0.6, speed: 0.7, crossfader: 0.3 },
    lighting: { playback: 4, intensity: 0.5, color: '#6366F1', transition: 5 },
    grandma3: { sequence: 104, command: 'Fade 5 Sequence 104' }
  },
  'Peaceful': {
    qlab: { cue: 'nature-ambient', volume: 0.25, fadeTime: 10, rate: 0.7, playback: 'go' },
    resolume: { clip: 2, opacity: 0.3, speed: 0.5, crossfader: 0.1 },
    lighting: { playback: 5, intensity: 0.3, color: '#06B6D4', transition: 10 },
    grandma3: { sequence: 105, command: 'Fade 10 Sequence 105' }
  }
};

const MOOD_DEFINITIONS: Record<string, MoodState> = {
  'Energetic': {
    name: 'Energetic', energy: 0.9, valence: 0.8, arousal: 0.9,
    color: '#EF4444', description: 'High energy, excitement, and dynamic activity.'
  },
  'Social': {
    name: 'Social', energy: 0.7, valence: 0.9, arousal: 0.6,
    color: '#10B981', description: 'Interactive, collaborative, and friendly atmosphere.'
  },
  'Contemplative': {
    name: 'Contemplative', energy: 0.3, valence: 0.6, arousal: 0.2,
    color: '#8B5CF6', description: 'Quiet reflection, focus, and thoughtful observation.'
  },
  'Mysterious': {
    name: 'Mysterious', energy: 0.5, valence: 0.4, arousal: 0.5,
    color: '#6366F1', description: 'Intrigue, curiosity, and an enigmatic ambiance.'
  },
  'Peaceful': {
    name: 'Peaceful', energy: 0.2, valence: 0.7, arousal: 0.1,
    color: '#06B6D4', description: 'Calm, serene, and relaxing environment.'
  },
  'Safe Mode': {
    name: 'Safe Mode', energy: 0.1, valence: 0.5, arousal: 0.0,
    color: '#6B7280', description: 'Emergency stop activated - system in a safe, neutral state.'
  }
};


interface MoodStore {
  systemActive: boolean
  currentMood: MoodState
  environmentData: EnvironmentData
  softwareConnections: SoftwareConnection[]
  oscController: any | null
  oscEnabled: boolean
  lastOSCMessage: { software: string, message: string, timestamp: number } | null
  moodHistory: Array<{ timestamp: number; mood: string; duration: number }>
  audienceMetrics: {
    totalVisitors: number
    averageStayTime: number
    peakOccupancy: number
    engagementScore: number
  }
  simulationMode: boolean
  emergencyActive: boolean
  advancedAI: AdvancedMoodAI | null
  aiEnabled: boolean
  aiPrediction: AIPredictionState
  learningMetrics: LearningMetrics | null
  abTesting: ABTestState
  setSystemActive: (active: boolean) => void
  updateCurrentMood: (mood: MoodState) => void
  updateEnvironmentData: (data: Partial<EnvironmentData>) => void
  updateSoftwareConnection: (id: string, updates: Partial<SoftwareConnection>) => void
  addMoodToHistory: (mood: string) => void
  initializeOSC: () => Promise<void>
  connectToSoftware: (softwareId: string) => Promise<boolean>
  disconnectFromSoftware: (softwareId: string) => Promise<void>
  applyCurrentMoodToSoftware: () => Promise<void>
  sendOSCCommand: (software: string, command: string, args: any[]) => Promise<void>
  applyMoodToQLab: (config: any) => Promise<void>
  applyMoodToResolume: (config: any) => Promise<void>
  applyMoodToChamsys: (config: any) => Promise<void>
  applyMoodToGrandMA3: (config: any) => Promise<void>
  setSimulationMode: (enabled: boolean) => void
  emergencyStop: () => void
  initializeAdvancedAI: () => Promise<void>
  setAIEnabled: (enabled: boolean) => void
  requestAIPrediction: () => Promise<MoodPrediction | null>
  applyAIPrediction: (prediction: MoodPrediction) => Promise<void>
  recordMoodOutcome: (engagement: number, duration: number, feedback: number) => void
  updateLearningMetrics: () => Promise<void>
  exportLearningData: () => any
  importLearningData: (data: any) => Promise<void>
  resetLearning: () => Promise<void>
  startABTest: (moodA: string, moodB: string, context: string) => Promise<string>
  recordABTestResult: (mood: string, engagement: number) => void
  completeCurrentABTest: () => Promise<void>
  setABTestingEnabled: (enabled: boolean) => void
  getAIInsights: () => {
    predictionAccuracy: number
    learningProgress: number
    moodEffectiveness: Record<string, number>
    recommendations: string[]
  }
  environmentDataToContext: () => ContextData
}

export const useMoodStore = create<MoodStore>()(
  subscribeWithSelector((set, get) => ({
    // ===== INITIAL STATE =====
    systemActive: false,
    currentMood: MOOD_DEFINITIONS['Contemplative'],
    environmentData: {
      peopleCount: 12,
      avgMovement: 0.4,
      audioLevel: 0.25,
      lightLevel: 0.7,
      temperature: 22,
      conversationalLevel: 0.3,
      musicalContent: 0.2,
      timeOfDay: 'afternoon',
      dayOfWeek: 'weekday',
      weather: 'sunny',
      specialEvents: []
    },
    softwareConnections: [
      { id: 'qlab', name: 'QLab', connected: false, lastPing: 0, status: 'offline', ip: '192.168.1.10', port: 53000, protocol: 'OSC' },
      { id: 'resolume', name: 'Resolume Arena', connected: false, lastPing: 0, status: 'offline', ip: '192.168.1.11', port: 7000, protocol: 'OSC' },
      { id: 'touchosc', name: 'TouchOSC', connected: false, lastPing: 0, status: 'offline', ip: '192.168.1.13', port: 9000, protocol: 'OSC' },
      { id: 'chamsys', name: 'Chamsys MagicQ', connected: false, lastPing: 0, status: 'offline', ip: '192.168.1.12', port: 6454, protocol: 'OSC' },
      { id: 'grandma3', name: 'GrandMA3', connected: false, lastPing: 0, status: 'offline', ip: '192.168.1.14', port: 8000, protocol: 'OSC' }
    ],
    oscController: null,
    oscEnabled: false,
    lastOSCMessage: null,
    moodHistory: [
      { timestamp: Date.now() - 480000, mood: 'Social', duration: 8 },
      { timestamp: Date.now() - 720000, mood: 'Contemplative', duration: 12 },
      { timestamp: Date.now() - 1020000, mood: 'Energetic', duration: 5 }
    ],
    audienceMetrics: { totalVisitors: 156, averageStayTime: 18.5, peakOccupancy: 23, engagementScore: 0.78 },
    simulationMode: true,
    emergencyActive: false,
    advancedAI: null,
    aiEnabled: false,
    aiPrediction: {
      currentPrediction: null,
      predictionHistory: [],
      confidence: 0,
      learningActive: false,
      totalExperience: 0
    },
    learningMetrics: null,
    abTesting: {
      currentTest: null,
      testHistory: [],
      isTestingEnabled: false
    },

    // ===== ACTIONS =====
    setSystemActive: (active) => set({ systemActive: active }),
    updateCurrentMood: (mood) => {
      const prevMood = get().currentMood
      set({ currentMood: mood })
      
      if (prevMood.name !== mood.name) {
        get().addMoodToHistory(prevMood.name)
        if (get().oscEnabled && !get().simulationMode) {
          get().applyCurrentMoodToSoftware()
        }
      }
    },
    updateEnvironmentData: (data) => {
      const newData = { ...get().environmentData, ...data }
      set({ environmentData: newData })
      
      if (get().aiEnabled && get().systemActive) {
        setTimeout(() => get().requestAIPrediction(), 1000)
      }
    },
    updateSoftwareConnection: (id, updates) =>
      set((state) => ({
        softwareConnections: state.softwareConnections.map((conn) =>
          conn.id === id ? { ...conn, ...updates } : conn
        )
      })),
    addMoodToHistory: (mood) => {
      const now = Date.now()
      const history = get().moodHistory
      const lastEntry = history[0]
      const duration = lastEntry ? Math.round((now - lastEntry.timestamp) / 60000) : 0
      const newHistory = [
        { timestamp: now, mood: get().currentMood.name, duration: 0 },
        ...history.slice(0, 9).map((entry, index) => 
          index === 0 ? { ...entry, duration } : entry
        )
      ]
      set({ moodHistory: newHistory })
    },
    initializeOSC: async () => { console.log('✅ OSC Controller initialized'); set({ oscEnabled: true }); },
    connectToSoftware: async (softwareId) => { get().updateSoftwareConnection(softwareId, { connected: true, status: 'online', lastPing: Date.now() }); return true; },
    disconnectFromSoftware: async (softwareId) => { get().updateSoftwareConnection(softwareId, { connected: false, status: 'offline', lastPing: 0 }); },
    applyCurrentMoodToSoftware: async () => { console.log("Applying mood to software...") },
    applyMoodToQLab: async (config) => { console.log("Applying to QLab", config) },
    applyMoodToResolume: async (config) => { console.log("Applying to Resolume", config) },
    applyMoodToChamsys: async (config) => { console.log("Applying to Chamsys", config) },
    applyMoodToGrandMA3: async (config) => { console.log("Applying to GrandMA3", config) },
    sendOSCCommand: async (software, command, args) => { console.log(`[SIMULATION] to ${software}: ${command}`, args); set({ lastOSCMessage: { software, message: `${command} ${args.join(' ')}`, timestamp: Date.now() } }); },
    setSimulationMode: (enabled) => set({ simulationMode: enabled }),
    emergencyStop: async () => { set({ emergencyActive: true, systemActive: false, currentMood: MOOD_DEFINITIONS['Safe Mode'] }); setTimeout(() => set({ emergencyActive: false }), 30000); },

    // ===== AI ACTIONS =====
    initializeAdvancedAI: async () => {
      try {
        const ai = new AdvancedMoodAI()
        set({ advancedAI: ai, aiEnabled: true, aiPrediction: { ...get().aiPrediction, learningActive: true, totalExperience: ai.getSystemStatus().totalExperience } })
        await get().updateLearningMetrics()
        console.log('🧠 Advanced AI Engine initialized')
      } catch (error) { console.error('❌ Failed to initialize Advanced AI:', error); set({ aiEnabled: false }); }
    },
    setAIEnabled: (enabled) => { set({ aiEnabled: enabled }); if (enabled && !get().advancedAI) { get().initializeAdvancedAI(); } },

    requestAIPrediction: async () => {
      const { advancedAI, aiEnabled } = get();
      if (!advancedAI || !aiEnabled) return null;
      try {
        const context = get().environmentDataToContext();
        const prediction = advancedAI.predictOptimalMood(context);
        set(state => ({
          aiPrediction: {
            ...state.aiPrediction,
            currentPrediction: prediction,
            confidence: prediction.confidence,
            predictionHistory: [{ timestamp: Date.now(), prediction }, ...state.aiPrediction.predictionHistory.slice(0, 19)]
          }
        }));
        console.log(`🧠 AI Prediction: ${prediction.recommendedMood} (${Math.round(prediction.confidence * 100)}% confidence)`);
        return prediction;
      } catch (error) {
        console.error('❌ AI prediction failed:', error);
        return null;
      }
    },

    applyAIPrediction: async (prediction) => {
      const moodDefinition = MOOD_DEFINITIONS[prediction.recommendedMood];
      if (!moodDefinition) {
        console.warn(`AI predicted an unknown mood: "${prediction.recommendedMood}". Cannot apply.`);
        return;
      }
      const newMood: MoodState = { ...moodDefinition, description: `AI: ${prediction.reasoning[0] || 'Recommended for current context.'}` };
      get().updateCurrentMood(newMood);
      console.log(`🎭 Applied AI-recommended mood: ${prediction.recommendedMood}`);
    },

    recordMoodOutcome: (engagement, duration, feedback) => {
      const { advancedAI, aiPrediction } = get();
      if (!advancedAI || !aiPrediction.currentPrediction) return;
      try {
        const context = get().environmentDataToContext();
        advancedAI.recordOutcome(context, aiPrediction.currentPrediction.recommendedMood, { engagement, duration, audienceGrowth: (engagement - 0.5) * 0.1, feedback });
        set(state => ({
          aiPrediction: {
            ...state.aiPrediction,
            predictionHistory: state.aiPrediction.predictionHistory.map((entry, i) => i === 0 ? { ...entry, actualOutcome: { engagement, duration, feedback } } : entry)
          }
        }));
        get().updateLearningMetrics();
        console.log(`📚 Recorded mood outcome: ${Math.round(engagement * 100)}% engagement`);
      } catch (error) { console.error('❌ Failed to record mood outcome:', error); }
    },

    updateLearningMetrics: async () => { /* ... */ },
    exportLearningData: () => { /* ... */ return null },
    importLearningData: async (data) => { /* ... */ },
    resetLearning: async () => { /* ... */ },
    startABTest: async (moodA, moodB, context) => { /* ... */ return ''; },
    recordABTestResult: (mood, engagement) => { /* ... */ },
    completeCurrentABTest: async () => { /* ... */ },
    setABTestingEnabled: (enabled) => { /* ... */ },
    getAIInsights: () => { /* ... */ return { predictionAccuracy: 0, learningProgress: 0, moodEffectiveness: {}, recommendations: [] }; },

    environmentDataToContext: (): ContextData => {
      const env = get().environmentData;
      const visionContext: VisionData = {
        peopleCount: env.peopleCount,
        avgMovement: env.avgMovement,
        crowdDensity: env.peopleCount / 50.0,
        dominantAge: 'mixed',
        energyLevel: Math.min(1, (env.avgMovement * 0.6) + ((env.peopleCount / 50.0) * 0.4)),
        boundingBoxes: [],
        confidence: 0.85,
      };
      const audioContext: AudioData = {
        volume: env.audioLevel,
        energy: env.audioLevel,
        conversational: env.conversationalLevel,
        musicality: env.musicalContent,
        ambientNoise: Math.max(0, 0.15 - env.audioLevel),
        frequency: 500 + (env.audioLevel * 1000),
        spectralCentroid: 1000 + env.audioLevel * 2000,
        spectralRolloff: 2000 + env.audioLevel * 3000,
        zeroCrossingRate: 0.1 + env.avgMovement * 0.1,
      };
      return {
        vision: visionContext,
        audio: audioContext,
        environmental: {
          timeOfDay: env.timeOfDay,
          dayOfWeek: env.dayOfWeek,
          season: 'spring',
          weather: env.weather,
          specialEvents: env.specialEvents,
        },
        timestamp: Date.now(),
      };
    }
  }))
);

// ===== UTILITY FUNCTIONS =====
function generateAIRecommendations(metrics: LearningMetrics, aiPrediction: AIPredictionState): string[] { /* ... */ return []; }


// ✅ FIXED: Exported all selector hooks to be used by React components.
// This was the cause of the build errors.
export const useSystemActive = () => useMoodStore((state) => state.systemActive);
export const useCurrentMood = () => useMoodStore((state) => state.currentMood);
export const useEnvironmentData = () => useMoodStore((state) => state.environmentData);
export const useSoftwareConnections = () => useMoodStore((state) => state.softwareConnections);
export const useMoodHistory = () => useMoodStore((state) => state.moodHistory);
export const useAudienceMetrics = () => useMoodStore((state) => state.audienceMetrics);
export const useOSCStatus = () => useMoodStore((state) => ({ 
  enabled: state.oscEnabled, 
  lastMessage: state.lastOSCMessage 
}));
export const useAIStatus = () => useMoodStore((state) => ({
  enabled: state.aiEnabled,
  active: state.aiPrediction.learningActive,
  experience: state.aiPrediction.totalExperience,
  confidence: state.aiPrediction.confidence
}));
export const useAIPrediction = () => useMoodStore((state) => state.aiPrediction.currentPrediction);
export const useLearningMetrics = () => useMoodStore((state) => state.learningMetrics);
export const useABTestStatus = () => useMoodStore((state) => ({
  enabled: state.abTesting.isTestingEnabled,
  currentTest: state.abTesting.currentTest,
  history: state.abTesting.testHistory
}));


// ===== AUTO-SIMULATION =====
useMoodStore.subscribe(
  (state) => state.systemActive,
  (systemActive) => {
    if (systemActive && useMoodStore.getState().simulationMode) {
      const intervalId = setInterval(() => {
        const state = useMoodStore.getState();
        if (!state.systemActive || !state.simulationMode) { clearInterval(intervalId); return; }
        
        const env = state.environmentData;
        const newData = {
          peopleCount: Math.max(1, env.peopleCount + Math.floor((Math.random() - 0.5) * 4)),
          avgMovement: Math.max(0, Math.min(1, env.avgMovement + (Math.random() - 0.5) * 0.2)),
          audioLevel: Math.max(0, Math.min(1, env.audioLevel + (Math.random() - 0.5) * 0.3)),
          conversationalLevel: Math.max(0, Math.min(1, env.conversationalLevel + (Math.random() - 0.5) * 0.2)),
          musicalContent: Math.max(0, Math.min(1, env.musicalContent + (Math.random() - 0.5) * 0.1)),
          timeOfDay: getCurrentTimeOfDay(),
          dayOfWeek: isWeekend() ? 'weekend' as const : 'weekday' as const
        };
        state.updateEnvironmentData(newData);
        
        if (state.aiEnabled && Math.random() < 0.3) {
          state.requestAIPrediction().then(prediction => {
            if (prediction && prediction.confidence > 0.7) { state.applyAIPrediction(prediction); }
          });
        } else if (!state.aiEnabled && Math.random() < 0.2) {
          let targetMood = MOOD_DEFINITIONS['Contemplative'];
          if (newData.peopleCount > 15 && newData.avgMovement > 0.6) {
            targetMood = MOOD_DEFINITIONS['Energetic'];
          } else if (newData.peopleCount > 8 && newData.audioLevel > 0.4) {
            targetMood = MOOD_DEFINITIONS['Social'];
          }
          state.updateCurrentMood(targetMood);
        }
      }, 3000);
    }
  }
);

function getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';  
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}