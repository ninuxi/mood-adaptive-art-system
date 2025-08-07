# MOOD - Adaptive Artistic Environment Controller

> **AI-Powered system for controlling interactive art installations**

[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 What is MOOD?

MOOD is a professional-grade system that bridges AI analysis with industry-standard creative software, creating responsive art installations that adapt to their audience in real-time.

### Key Features

- **🤖 AI-Driven Analysis**: Computer vision + audio analysis for real-time mood detection
- **🎛️ Professional Integration**: Controls QLab, Resolume, Chamsys via OSC/MIDI/ArtNet
- **📊 Curator Dashboard**: Visual programming interface for artists and technicians
- **🎭 Cultural Presets**: Pre-configured behaviors for galleries, museums, events
- **📈 Analytics & Learning**: Track audience engagement and optimize experiences

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Analysis   │────│  MOOD Engine    │────│ Creative Software│
│                 │    │                 │    │                 │
│ • Computer Vision│    │ • Mood Mapping  │    │ • QLab (OSC)    │
│ • Audio Analysis │    │ • Learning AI   │    │ • Resolume (OSC)│
│ • Context Data   │    │ • Safety Logic  │    │ • Chamsys (ArtNet)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Curator Dashboard│
                    │                 │
                    │ • Live Control  │
                    │ • Show Designer │
                    │ • Analytics     │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mood-adaptive-art-system.git
cd mood-adaptive-art-system

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 📁 Project Structure

```
mood-adaptive-art-system/
├── src/
│   ├── app/                    # Next.js app router
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard modules
│   │   ├── mood/               # Mood analysis components
│   │   ├── software/           # Software integrations
│   │   └── ui/                 # Base UI components
│   ├── lib/                    # Utilities and configurations
│   ├── hooks/                  # Custom React hooks
│   ├── stores/                 # State management (Zustand)
│   └── types/                  # TypeScript definitions
├── public/                     # Static assets
├── docs/                       # Documentation
└── tests/                      # Test files
```

## 🎛️ Dashboard Features

### 1. Software Status Panel
Monitor real-time connections to:
- **QLab**: Audio/Video cue control
- **Resolume Arena**: Visual effects
- **Chamsys MagicQ**: Lighting control

### 2. Mood Programmer
Visual node-based programming for:
- Mood → Action mapping
- Conditional triggers
- Timeline scheduling

### 3. Live Control
- Current mood visualization
- Manual override controls
- Emergency stop systems

### 4. Analytics & Reports
- Audience interaction heatmaps
- Mood journey tracking
- Performance insights

## 🔧 Development Roadmap

- **Week 1** ✅ Dashboard + Mood Simulator
- **Week 2** 🔄 Computer Vision + Audio Analysis
- **Week 3** 📅 OSC/MIDI Integration + Generative Engine
- **Week 4** 📅 Polish + Demo + Documentation

## 🎨 Use Cases

- **Museums**: Interactive exhibitions that adapt to visitor engagement
- **Galleries**: Responsive installations for opening events
- **Corporate Events**: Dynamic environments that match audience energy
- **Festivals**: Large-scale installations with crowd-responsive behaviors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built for the intersection of technology and culture, enabling artists and institutions to create more engaging, responsive experiences.

---

**Built with ❤️ for the creative community**