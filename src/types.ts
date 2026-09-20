export type NoteValue = 'quarter' | 'half'; // 4분음표 (1박), 2분음표 (2박)

export interface NoteItem {
  id: string;
  pitch: string; // e.g. "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5"
  value: NoteValue; // 'quarter' = 1 beat, 'half' = 2 beats
  durationBeats: number; // 1 or 2
}

export interface Measure {
  id: string;
  measureNumber: number;
  notes: NoteItem[];
  totalBeats: number; // max 4 for 4/4
  chord1?: string | null; // 첫 째박 코드 (Beat 1, e.g. 'C', 'G7', etc.)
  chord2?: string | null; // 셋 째박 코드 (Beat 3, optional / 생략 가능)
}

export interface ExamQuestion {
  id: string;
  title: string;
  difficulty: '기초 (2마디)' | '초급 (4마디)' | '중급 (4마디 도약)' | '실전 (4마디 복합)';
  description: string;
  measures: Measure[];
  totalBars: number;
  bpm: number;
}

export interface PitchDefinition {
  pitch: string; // e.g., "C4"
  nameKo: string; // "도"
  nameEn: string; // "C"
  octave: number; // 4
  frequency: number; // Hz
  midi: number;
  staffStep: number; // Step from bottom staff line (E4 = 0, F4 = 1, G4 = 2, A4 = 3, B4 = 4, C5 = 5, D5 = 6, E5 = 7, D4 = -1, C4 = -2)
}

export type AppMode = 'exam' | 'free_draw' | 'teacher_mode';
