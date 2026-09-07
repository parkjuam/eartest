import { PitchDefinition } from '../types';

export const PITCH_DEFINITIONS: PitchDefinition[] = [
  { pitch: 'G3', nameKo: '낮은 솔', nameEn: 'G3', octave: 3, frequency: 196.00, midi: 55, staffStep: -5 },
  { pitch: 'A3', nameKo: '낮은 라', nameEn: 'A3', octave: 3, frequency: 220.00, midi: 57, staffStep: -4 },
  { pitch: 'B3', nameKo: '낮은 시', nameEn: 'B3', octave: 3, frequency: 246.94, midi: 59, staffStep: -3 },
  { pitch: 'C4', nameKo: '도', nameEn: 'C4', octave: 4, frequency: 261.63, midi: 60, staffStep: -2 }, // Middle C, 1 ledger line below
  { pitch: 'D4', nameKo: '레', nameEn: 'D4', octave: 4, frequency: 293.66, midi: 62, staffStep: -1 }, // Space below 1st line
  { pitch: 'E4', nameKo: '미', nameEn: 'E4', octave: 4, frequency: 329.63, midi: 64, staffStep: 0 },  // 1st line
  { pitch: 'F4', nameKo: '파', nameEn: 'F4', octave: 4, frequency: 349.23, midi: 65, staffStep: 1 },  // 1st space
  { pitch: 'G4', nameKo: '솔', nameEn: 'G4', octave: 4, frequency: 392.00, midi: 67, staffStep: 2 },  // 2nd line
  { pitch: 'A4', nameKo: '라', nameEn: 'A4', octave: 4, frequency: 440.00, midi: 69, staffStep: 3 },  // 2nd space
  { pitch: 'B4', nameKo: '시', nameEn: 'B4', octave: 4, frequency: 493.88, midi: 71, staffStep: 4 },  // 3rd line
  { pitch: 'C5', nameKo: '높은 도', nameEn: 'C5', octave: 5, frequency: 523.25, midi: 72, staffStep: 5 }, // 3rd space
  { pitch: 'D5', nameKo: '높은 레', nameEn: 'D5', octave: 5, frequency: 587.33, midi: 74, staffStep: 6 }, // 4th line
  { pitch: 'E5', nameKo: '높은 미', nameEn: 'E5', octave: 5, frequency: 659.25, midi: 76, staffStep: 7 }, // 4th space
  { pitch: 'F5', nameKo: '높은 파', nameEn: 'F5', octave: 5, frequency: 698.46, midi: 77, staffStep: 8 }, // 5th line
  { pitch: 'G5', nameKo: '높은 솔', nameEn: 'G5', octave: 5, frequency: 783.99, midi: 79, staffStep: 9 }, // Space above 5th line
];

export const C_MAJOR_KEYBOARD_PITCHES = [
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'
];

export function getPitchDef(pitch: string): PitchDefinition | undefined {
  return PITCH_DEFINITIONS.find(p => p.pitch === pitch);
}

export function getStaffY(staffStep: number, firstLineY: number, lineSpacing: number): number {
  // E4 is staffStep 0 = first line (bottom line)
  // Each step is half of lineSpacing (since line to space is half spacing)
  // Higher staffStep means higher pitch = smaller Y in SVG
  return firstLineY - (staffStep * (lineSpacing / 2));
}

// Check if pitch needs ledger lines
export function getLedgerLines(staffStep: number): number[] {
  // Returns array of staffSteps that need ledger lines
  const lines: number[] = [];
  if (staffStep <= -2) {
    // Below staff: E4=0, D4=-1 (no line), C4=-2 (1 line), B3=-3, A3=-4 (2 lines), G3=-5
    for (let step = -2; step >= staffStep; step -= 2) {
      lines.push(step);
    }
  } else if (staffStep >= 10) {
    // Above staff: F5=8 (top line), G5=9 (space above), A5=10 (1 line), B5=11, C6=12
    for (let step = 10; step <= staffStep; step += 2) {
      lines.push(step);
    }
  }
  return lines;
}
