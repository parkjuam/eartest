import { PITCH_DEFINITIONS } from './musicTheory';
import { PitchDefinition } from '../types';

export interface PitchDetectionResult {
  frequency: number;
  pitchDef: PitchDefinition | null;
  cents: number; // -50 to +50
  volume: number; // 0 to 1
  isSteady: boolean;
}

// Autocorrelation Pitch Detector
export function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // If too quiet, signal is noise
  if (rms < 0.015) {
    return -1;
  }

  // Trim silence from ends
  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }
  }

  const trimmed = buffer.subarray(r1, r2);
  const trimmedSize = trimmed.length;

  const c = new Float32Array(trimmedSize);
  for (let i = 0; i < trimmedSize; i++) {
    for (let j = 0; j < trimmedSize - i; j++) {
      c[i] = c[i] + trimmed[j] * trimmed[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < trimmedSize; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  let T0 = maxpos;

  // Parabolic interpolation around peak
  if (T0 > 0 && T0 < trimmedSize - 1) {
    const x1 = c[T0 - 1];
    const x2 = c[T0];
    const x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) {
      T0 = T0 - b / (2 * a);
    }
  }

  return sampleRate / T0;
}

// Find closest pitch definition from frequency
export function findClosestPitch(frequency: number): { pitchDef: PitchDefinition | null; cents: number } {
  if (frequency < 130 || frequency > 1200) {
    return { pitchDef: null, cents: 0 };
  }

  let closestDef: PitchDefinition | null = null;
  let minDiff = Infinity;
  let cents = 0;

  for (const def of PITCH_DEFINITIONS) {
    // 1200 * log2(f / f_target)
    const centsDiff = 1200 * Math.log2(frequency / def.frequency);
    if (Math.abs(centsDiff) < Math.abs(minDiff)) {
      minDiff = centsDiff;
      closestDef = def;
      cents = Math.round(centsDiff);
    }
  }

  return { pitchDef: closestDef, cents };
}
