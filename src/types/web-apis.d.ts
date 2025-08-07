// Web API type extensions for better TypeScript compatibility

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

// Web Audio API type fixes for Vercel build compatibility
interface AnalyserNode {
  getByteFrequencyData(array: Uint8Array): void;
  getFloatFrequencyData(array: Float32Array): void;
  frequencyBinCount: number;
}

// Override strict buffer types for Web Audio API
declare module "*.audio" {
  const content: string;
  export default content;
}

export {};