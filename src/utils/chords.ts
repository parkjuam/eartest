export interface ChordDefinition {
  name: string;
  degree: string;
  labelKo: string;
  roleKo: string;
  notes: string[];
  frequencies: number[];
}

export const C_MAJOR_CHORDS: ChordDefinition[] = [
  {
    name: 'C',
    degree: 'I',
    labelKo: '도 • 미 • 솔',
    roleKo: '으뜸화음 (1도)',
    notes: ['C3', 'C4', 'E4', 'G4'],
    frequencies: [130.81, 261.63, 329.63, 392.00],
  },
  {
    name: 'Dm',
    degree: 'ii',
    labelKo: '레 • 파 • 라',
    roleKo: '2도 화음',
    notes: ['D3', 'D4', 'F4', 'A4'],
    frequencies: [146.83, 293.66, 349.23, 440.00],
  },
  {
    name: 'Em',
    degree: 'iii',
    labelKo: '미 • 솔 • 시',
    roleKo: '3도 화음',
    notes: ['E3', 'E4', 'G4', 'B4'],
    frequencies: [164.81, 329.63, 392.00, 493.88],
  },
  {
    name: 'F',
    degree: 'IV',
    labelKo: '파 • 라 • 도',
    roleKo: '버금딸림화음 (4도)',
    notes: ['F3', 'C4', 'F4', 'A4'],
    frequencies: [174.61, 261.63, 349.23, 440.00],
  },
  {
    name: 'G',
    degree: 'V',
    labelKo: '솔 • 시 • 레',
    roleKo: '딸림화음 (5도)',
    notes: ['G3', 'B3', 'D4', 'G4'],
    frequencies: [196.00, 246.94, 293.66, 392.00],
  },
  {
    name: 'G7',
    degree: 'V7',
    labelKo: '솔 • 시 • 레 • 파',
    roleKo: '딸림7화음 (5도 7th)',
    notes: ['G3', 'B3', 'D4', 'F4'],
    frequencies: [196.00, 246.94, 293.66, 349.23],
  },
  {
    name: 'Am',
    degree: 'vi',
    labelKo: '라 • 도 • 미',
    roleKo: '6도 화음',
    notes: ['A3', 'C4', 'E4', 'A4'],
    frequencies: [220.00, 261.63, 329.63, 440.00],
  },
  {
    name: 'Bdim',
    degree: 'vii°',
    labelKo: '시 • 레 • 파',
    roleKo: '감화음 (7도)',
    notes: ['B3', 'D4', 'F4', 'B4'],
    frequencies: [246.94, 293.66, 349.23, 493.88],
  },
  {
    name: 'C7',
    degree: 'I7',
    labelKo: '도 • 미 • 솔 • 시♭',
    roleKo: '세컨더리 7화음',
    notes: ['C3', 'C4', 'E4', 'G4', 'Bb4'],
    frequencies: [130.81, 261.63, 329.63, 392.00, 466.16],
  },
];

export function getChordDef(name: string): ChordDefinition | undefined {
  if (!name) return undefined;
  return C_MAJOR_CHORDS.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
}

// Common 8-measure chord progression presets
export const CHORD_PRESETS = [
  {
    name: '기본 3화음 진행 (I-IV-V-I)',
    desc: 'C - F - G7 - C 중심의 초중등 교과서 표준 진행',
    chords: [
      { m: 1, c1: 'C', c2: null },
      { m: 2, c1: 'F', c2: null },
      { m: 3, c1: 'G7', c2: null },
      { m: 4, c1: 'C', c2: null },
      { m: 5, c1: 'C', c2: 'F' },
      { m: 6, c1: 'C', c2: 'G7' },
      { m: 7, c1: 'F', c2: 'G7' },
      { m: 8, c1: 'C', c2: null },
    ],
  },
  {
    name: '캐논 변주곡 진행 (Canon in C)',
    desc: 'C - G - Am - Em - F - C - F - G',
    chords: [
      { m: 1, c1: 'C', c2: null },
      { m: 2, c1: 'G', c2: null },
      { m: 3, c1: 'Am', c2: null },
      { m: 4, c1: 'Em', c2: null },
      { m: 5, c1: 'F', c2: null },
      { m: 6, c1: 'C', c2: null },
      { m: 7, c1: 'F', c2: 'G7' },
      { m: 8, c1: 'C', c2: null },
    ],
  },
  {
    name: '동요 & 가요 대표 4도 진행',
    desc: 'C - Am - Dm - G7 순환 코드 진행',
    chords: [
      { m: 1, c1: 'C', c2: null },
      { m: 2, c1: 'Am', c2: null },
      { m: 3, c1: 'Dm', c2: null },
      { m: 4, c1: 'G7', c2: null },
      { m: 5, c1: 'C', c2: 'Am' },
      { m: 6, c1: 'Dm', c2: 'G7' },
      { m: 7, c1: 'C', c2: 'G7' },
      { m: 8, c1: 'C', c2: null },
    ],
  },
];
