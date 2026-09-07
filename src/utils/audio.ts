import { Measure } from '../types';
import { getPitchDef } from './musicTheory';

class AudioManager {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isMuted = true; // Initially sound is off (muted)
  private timeouts: number[] = [];

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a single note like a realistic upright piano
  playNote(pitch: string, durationSeconds = 1.0, startTime?: number) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const pitchDef = getPitchDef(pitch);
    if (!pitchDef) return;

    const t = startTime !== undefined ? startTime : ctx.currentTime;
    const fundamental = pitchDef.frequency;

    // Create a multi-oscillator acoustic piano tone with harmonic richness
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, t);
    masterGain.gain.linearRampToValueAtTime(0.4, t + 0.008); // Sharp hammer attack
    masterGain.gain.exponentialRampToValueAtTime(0.001, t + durationSeconds + 0.15); // Natural decay

    // Filter to warm up tone like wooden piano soundboard
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(3200, fundamental * 4.5), t);
    filter.frequency.exponentialRampToValueAtTime(Math.min(1000, fundamental * 1.5), t + durationSeconds);

    // Harmonics: 1st (fundamental), 2nd, 3rd, 4th
    const harmonics = [
      { ratio: 1.0, gain: 0.7 },
      { ratio: 2.0, gain: 0.35 },
      { ratio: 3.0, gain: 0.15 },
      { ratio: 4.0, gain: 0.05 },
    ];

    harmonics.forEach(({ ratio, gain: hGain }) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(fundamental * ratio, t);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(hGain, t);

      osc.connect(oscGain);
      oscGain.connect(filter);

      osc.start(t);
      osc.stop(t + durationSeconds + 0.2);
    });

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);
  }

  // Metronome click (beat 1 is high pitch, beats 2-4 are lower)
  playClick(isFirstBeat = false, startTime?: number) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const t = startTime !== undefined ? startTime : ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isFirstBeat ? 1200 : 800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Play Reference Pitch (e.g. C4 or A4)
  playReferenceTone(pitch = 'C4', durationSeconds = 2.0) {
    if (this.isMuted) return;
    this.playNote(pitch, durationSeconds);
  }

  // Stop current playback
  stop() {
    this.isPlaying = false;
    this.timeouts.forEach(id => window.clearTimeout(id));
    this.timeouts = [];
  }

  // Play entire melody or specific measure with optional count-in
  playMelody(
    measures: Measure[],
    bpm: number,
    options: {
      withCountIn?: boolean;
      measureIndex?: number; // if set, play only this measure
      onHighlight?: (measureIdx: number, noteIdx: number | null) => void;
      onComplete?: () => void;
      onCountInBeat?: (beatNumber: number) => void;
    } = {}
  ) {
    this.stop();
    this.isPlaying = true;
    const beatDuration = 60 / bpm; // seconds per 1 beat (quarter note)

    const targetMeasures = options.measureIndex !== undefined
      ? [measures[options.measureIndex]].filter(Boolean)
      : measures;

    const startMeasureOffset = options.measureIndex !== undefined ? options.measureIndex : 0;

    let delay = 0.1; // small initial cushion

    // 1. Count-in (4 beats for 4/4)
    if (options.withCountIn) {
      for (let beat = 1; beat <= 4; beat++) {
        const beatTime = delay;
        const timeoutId = window.setTimeout(() => {
          if (!this.isPlaying) return;
          this.playClick(beat === 1);
          if (options.onCountInBeat) options.onCountInBeat(beat);
        }, beatTime * 1000);
        this.timeouts.push(timeoutId);
        delay += beatDuration;
      }
    }

    // 2. Play each measure and note
    targetMeasures.forEach((measure, mRelIdx) => {
      const realMeasureIdx = startMeasureOffset + mRelIdx;

      measure.notes.forEach((note, noteIdx) => {
        const noteDurationSec = note.durationBeats * beatDuration;
        const currentDelay = delay;

        const timeoutId = window.setTimeout(() => {
          if (!this.isPlaying) return;
          if (options.onHighlight) {
            options.onHighlight(realMeasureIdx, noteIdx);
          }
          // Sound note
          this.playNote(note.pitch, noteDurationSec * 0.95);
        }, currentDelay * 1000);

        this.timeouts.push(timeoutId);
        delay += noteDurationSec;
      });
    });

    // 3. Completion
    const finishTimeout = window.setTimeout(() => {
      if (this.isPlaying) {
        this.isPlaying = false;
        if (options.onHighlight) options.onHighlight(-1, null);
        if (options.onComplete) options.onComplete();
      }
    }, delay * 1000 + 300);
    this.timeouts.push(finishTimeout);
  }

  getAudioContext(): AudioContext {
    return this.getContext();
  }
}

export const audioManager = new AudioManager();
