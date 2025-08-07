# MOOD System - Setup Guide

## 🚀 Quick Setup (Settimana 1)

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Git

### Installation Steps

```bash
# 1. Clone il repository
git clone https://github.com/yourusername/mood-adaptive-art-system.git
cd mood-adaptive-art-system

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 📁 Project Structure

```
mood-adaptive-art-system/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main dashboard
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard modules
│   │   │   ├── SoftwareStatusPanel.tsx
│   │   │   ├── LiveControl.tsx
│   │   │   └── AnalyticsPanel.tsx
│   │   └── mood/               # Mood analysis components
│   │       ├── MoodVisualizer.tsx
│   │       └── MoodSimulator.tsx
│   ├── stores/                 # State management (Zustand)
│   │   └── moodStore.ts
│   └── types/                  # TypeScript definitions
├── public/                     # Static assets
├── docs/                       # Documentation
└── tests/                      # Test files
```

## 🎯 Settimana 1 - Features Completate

### ✅ Dashboard Base
- **Main Navigation**: Overview, Mood Designer, Live Control, Analytics
- **Responsive Design**: Modern glassmorphism UI con Tailwind
- **State Management**: Zustand store per gestione stato globale

### ✅ Software Status Panel
- **Connection Monitoring**: QLab, Resolume, Chamsys status
- **Real-time Pings**: Simulazione connessioni software professionali
- **Protocol Info**: OSC/ArtNet details
- **Quick Actions**: Connect All, Emergency Stop

### ✅ Mood Visualizer
- **Live Mood Display**: Visualizzazione mood corrente con animazioni
- **Environment Sensors**: People count, movement, audio level
- **Mood Parameters**: Energy, Valence, Arousal bars
- **History Timeline**: Recent mood changes tracking
- **Manual Override**: Quick mood selection buttons

### ✅ Mood Simulator (Programming Interface)
- **Visual Rule Builder**: IF/THEN mood programming logic
- **Rule Management**: Create, edit, delete, priority system
- **Cultural Presets**: Gallery, Museum, Corporate event templates
- **Parameter Mapping**: Mood → Software output mapping
- **Flow Visualization**: Visual representation of AI → Software pipeline

### ✅ Live Control Interface  
- **Emergency Controls**: Stop, pause, reset con stati di sicurezza
- **Output Management**: Individual software control (QLab/Resolume/Lighting)
- **Manual Override Mode**: Direct parameter control
- **Performance Monitoring**: Current mood metrics, duration, engagement
- **Quick Actions**: Preset mood triggers

### ✅ Analytics Dashboard
- **Time Range Selection**: 1h, 24h, 7d, 30d views
- **Key Metrics Cards**: Visitors, stay time, peak occupancy, engagement
- **Interactive Charts**: Recharts integration con audience/engagement/mood data
- **Mood Distribution**: Pie chart breakdown of mood usage
- **Performance Insights**: AI-driven recommendations
- **Export Functionality**: Data download capabilities

## 🔧 Technical Implementation

### State Management
- **Zustand Store**: Reactive state management
- **Auto-simulation**: Realistic environment data when system active
- **Selectors**: Optimized re-renders con selectors specifici
- **Persistence**: Local storage per settings (future)

### UI/UX Features
- **Framer Motion**: Smooth animations e transitions
- **Glassmorphism**: Modern backdrop-blur effects
- **Color-coded Status**: Visual feedback per connessioni/stati
- **Responsive Grid**: Layout adapts da mobile a desktop
- **Dark Theme**: Professional dark interface
- **Loading States**: Skeleton loading e progressive disclosure

### Simulation System
- **Environment Simulation**: Realistic people count, movement, audio fluctuations
- **Mood AI Logic**: Context-aware mood selection based on environment
- **Software Integration Mock**: OSC/MIDI/ArtNet protocol simulation
- **Real-time Updates**: 3-second intervals per realistic data flow

## 🚧 Next Steps - Settimana 2

### Computer Vision Integration
- **Webcam Access**: Browser getUserMedia API
- **People Detection**: YOLO.js o MediaPipe implementation
- **Movement Analysis**: Optical flow detection
- **Crowd Density**: Real-time audience size estimation

### Audio Analysis
- **Microphone Input**: Web Audio API integration  
- **Real-time FFT**: Frequency analysis per mood detection
- **Volume Detection**: Ambient sound level monitoring
- **Voice Activity**: Conversation energy detection

### Enhanced AI Engine
- **Decision Logic**: More sophisticated mood selection algorithm  
- **Learning System**: Track what moods work best in different contexts
- **Predictive Modes**: Anticipate mood changes based on patterns
- **Safety Logic**: Prevent jarring mood transitions

## 📋 Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking

# Testing (future)
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## 🐛 Troubleshooting

### Common Issues

**Port 3000 already in use**
```bash
lsof -ti:3000 | xargs kill -9
# or use different port
npm run dev -- -p 3001
```

**TypeScript errors**
```bash
npm run type-check
# Fix type issues in components
```

**Styles not loading**
```bash
# Check Tailwind config
npm run build
# Restart dev server
```

### Performance Tips
- Use React DevTools per component profiling
- Monitor bundle size con `npm run build`
- Check network tab per asset loading
- Use Lighthouse per performance audit

## 🎨 Customization

### Adding New Moods
1. Update `moodStore.ts` con new mood definitions
2. Add color schemes in `MoodVisualizer.tsx`
3. Update preset templates in `MoodSimulator.tsx`

### New Software Integrations
1. Add connection config in `moodStore.ts`
2. Create protocol handler in future `/lib/protocols/`
3. Update UI in `SoftwareStatusPanel.tsx`

### Custom Analytics
1. Add metrics in `audienceMetrics` store
2. Create charts in `AnalyticsPanel.tsx`
3. Add export formatters per data processing

## 📝 Commit Message Convention

```
feat: add new mood visualization component
fix: resolve connection timeout issue  
docs: update setup instructions
style: improve dashboard responsiveness
refactor: optimize state management
test: add mood simulation tests
```

---

**🎯 Current Status**: Settimana 1 Complete - Dashboard & Simulator Functional
**⏭️ Next Sprint**: Computer Vision + Audio Analysis Integration