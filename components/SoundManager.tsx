"use client";

import { useEffect, useState } from "react";

// Simple beep sounds using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }

  // Initialize audio context (must be called after user interaction)
  async initialize() {
    if (this.isInitialized || !this.audioContext) return;

    try {
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  private playTone(frequency: number, duration: number, volume: number = 0.3) {
    if (this.isMuted || !this.audioContext || !this.isInitialized) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.error("Sound playback error:", error);
    }
  }

  pegHit() {
    // Higher pitched quick beep
    this.playTone(800, 0.05, 0.2);
  }

  bigWin() {
    // Victory fanfare
    if (this.isMuted || !this.audioContext) return;
    this.playTone(523, 0.1, 0.3); // C
    setTimeout(() => this.playTone(659, 0.1, 0.3), 100); // E
    setTimeout(() => this.playTone(784, 0.2, 0.3), 200); // G
  }

  win() {
    // Positive chime
    this.playTone(659, 0.15, 0.25); // E
  }

  loss() {
    // Sad tone
    this.playTone(196, 0.3, 0.2); // G (low)
  }

  drop() {
    // Starting sound
    this.playTone(440, 0.1, 0.15); // A
  }
}

let soundManagerInstance: SoundManager | null = null;

export function useSoundManager() {
  const [soundManager, setSoundManager] = useState<SoundManager | null>(null);

  useEffect(() => {
    if (!soundManagerInstance) {
      soundManagerInstance = new SoundManager();
    }
    setSoundManager(soundManagerInstance);
  }, []);

  return soundManager;
}

export { SoundManager };
