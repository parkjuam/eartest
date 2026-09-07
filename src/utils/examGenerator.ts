import { ExamQuestion, Measure, NoteItem, NoteValue } from '../types';

let idCounter = 1;
export const uid = () => `id_${Date.now()}_${idCounter++}`;

export function createNote(pitch: string, value: NoteValue): NoteItem {
  return {
    id: uid(),
    pitch,
    value,
    durationBeats: value === 'quarter' ? 1 : 2,
  };
}

export function createMeasure(measureNumber: number, notes: NoteItem[] = []): Measure {
  const totalBeats = notes.reduce((sum, n) => sum + n.durationBeats, 0);
  return {
    id: uid(),
    measureNumber,
    notes,
    totalBeats,
  };
}

// Preset Curated Questions for C Major, 4/4 time, Quarter & Half notes only
export const PRESET_EXAMS: ExamQuestion[] = [
  {
    id: 'exam-1',
    title: '기초 1: 도레미파솔 순차 진행',
    difficulty: '기초 (2마디)',
    description: '도(C4)부터 솔(G4)까지 차례로 올라갔다 내려오는 4분음표와 2분음표 기초 문제입니다.',
    totalBars: 2,
    bpm: 70,
    measures: [
      createMeasure(1, [
        createNote('C4', 'quarter'),
        createNote('D4', 'quarter'),
        createNote('E4', 'quarter'),
        createNote('F4', 'quarter'),
      ]),
      createMeasure(2, [
        createNote('G4', 'half'),
        createNote('E4', 'quarter'),
        createNote('C4', 'quarter'),
      ]),
    ],
  },
  {
    id: 'exam-2',
    title: '기초 2: 2분음표 호흡 익히기',
    difficulty: '기초 (2마디)',
    description: '2분음표(2박자)와 4분음표(1박자)의 길이 차이를 집중적으로 구분하는 문제입니다.',
    totalBars: 2,
    bpm: 72,
    measures: [
      createMeasure(1, [
        createNote('C4', 'half'),
        createNote('E4', 'half'),
      ]),
      createMeasure(2, [
        createNote('G4', 'quarter'),
        createNote('F4', 'quarter'),
        createNote('E4', 'half'),
      ]),
    ],
  },
  {
    id: 'exam-3',
    title: '초급 1: 비행기 멜로디 변주',
    difficulty: '초급 (4마디)',
    description: '친숙한 미-레-도 음정과 4분/2분 음표의 리듬 조합으로 구성된 4마디 문제입니다.',
    totalBars: 4,
    bpm: 75,
    measures: [
      createMeasure(1, [
        createNote('E4', 'quarter'),
        createNote('D4', 'quarter'),
        createNote('C4', 'quarter'),
        createNote('D4', 'quarter'),
      ]),
      createMeasure(2, [
        createNote('E4', 'quarter'),
        createNote('E4', 'quarter'),
        createNote('E4', 'half'),
      ]),
      createMeasure(3, [
        createNote('D4', 'quarter'),
        createNote('D4', 'quarter'),
        createNote('D4', 'half'),
      ]),
      createMeasure(4, [
        createNote('E4', 'quarter'),
        createNote('G4', 'quarter'),
        createNote('C4', 'half'),
      ]),
    ],
  },
  {
    id: 'exam-4',
    title: '중급 1: 3도 도약과 높은 도(C5)',
    difficulty: '중급 (4마디 도약)',
    description: '솔(G4)과 높은 도(C5)의 도약 음정을 듣고 2분음표로 안정적인 종지를 맺습니다.',
    totalBars: 4,
    bpm: 72,
    measures: [
      createMeasure(1, [
        createNote('C4', 'quarter'),
        createNote('E4', 'quarter'),
        createNote('G4', 'half'),
      ]),
      createMeasure(2, [
        createNote('A4', 'quarter'),
        createNote('B4', 'quarter'),
        createNote('C5', 'half'),
      ]),
      createMeasure(3, [
        createNote('B4', 'quarter'),
        createNote('A4', 'quarter'),
        createNote('G4', 'quarter'),
        createNote('F4', 'quarter'),
      ]),
      createMeasure(4, [
        createNote('E4', 'quarter'),
        createNote('D4', 'quarter'),
        createNote('C4', 'half'),
      ]),
    ],
  },
  {
    id: 'exam-5',
    title: '실전 1: 종합 청음 모의평가',
    difficulty: '실전 (4마디 복합)',
    description: '다양한 음정 도약과 리듬 변화(4분·2분음표 교차)가 포함된 표준 음악 청음 시험 문제입니다.',
    totalBars: 4,
    bpm: 76,
    measures: [
      createMeasure(1, [
        createNote('C4', 'quarter'),
        createNote('G4', 'quarter'),
        createNote('E4', 'half'),
      ]),
      createMeasure(2, [
        createNote('F4', 'quarter'),
        createNote('A4', 'quarter'),
        createNote('G4', 'half'),
      ]),
      createMeasure(3, [
        createNote('E4', 'half'),
        createNote('D4', 'quarter'),
        createNote('E4', 'quarter'),
      ]),
      createMeasure(4, [
        createNote('D4', 'half'),
        createNote('C4', 'half'),
      ]),
    ],
  },
];

// Random Exam Generator
const C_MAJOR_POOL = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

export function generateRandomExam(numBars = 4): ExamQuestion {
  const measures: Measure[] = [];

  for (let b = 1; b <= numBars; b++) {
    // 4 beats per bar using quarter (1) and half (2)
    // Possible rhythms that sum to 4:
    // [1, 1, 1, 1]
    // [2, 2]
    // [1, 1, 2]
    // [2, 1, 1]
    // [1, 2, 1]
    const rhythmPatterns: NoteValue[][] = [
      ['quarter', 'quarter', 'quarter', 'quarter'],
      ['half', 'half'],
      ['quarter', 'quarter', 'half'],
      ['half', 'quarter', 'quarter'],
      ['quarter', 'half', 'quarter'],
    ];

    // On the last bar, prefer ending with a half note on tonic C4
    const isLastBar = b === numBars;
    const lastBarPatterns: NoteValue[][] = [
      ['quarter', 'quarter', 'half'],
      ['half', 'half'],
    ];
    const chosenRhythm: NoteValue[] = isLastBar
      ? lastBarPatterns[Math.floor(Math.random() * lastBarPatterns.length)]
      : rhythmPatterns[Math.floor(Math.random() * rhythmPatterns.length)];

    const notes: NoteItem[] = [];
    let lastPitchIdx = b === 1 ? 0 : Math.floor(Math.random() * 4); // start on C4 or low pitch

    chosenRhythm.forEach((val, idx) => {
      let pitch: string;
      if (isLastBar && idx === chosenRhythm.length - 1) {
        pitch = 'C4'; // finish on tonic C4
      } else {
        // Stepwise motion or small skips (-2 to +2 steps)
        const delta = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
        lastPitchIdx = Math.max(0, Math.min(C_MAJOR_POOL.length - 1, lastPitchIdx + delta));
        pitch = C_MAJOR_POOL[lastPitchIdx];
      }
      notes.push(createNote(pitch, val));
    });

    measures.push(createMeasure(b, notes));
  }

  return {
    id: uid(),
    title: `무작위 생성 청음 시험 (${numBars}마디)`,
    difficulty: numBars === 2 ? '기초 (2마디)' : '초급 (4마디)',
    description: '4/4박자 다장조 무작위 청음 문제입니다. 4분음표와 2분음표로만 구성되어 있습니다.',
    totalBars: numBars,
    bpm: 72,
    measures,
  };
}

export interface NoteComparison {
  targetPitch: string;
  targetValue: NoteValue;
  userPitch?: string;
  userValue?: NoteValue;
  isPitchMatch: boolean;
  isRhythmMatch: boolean;
  isFullMatch: boolean;
}

export interface MeasureGrading {
  measureNumber: number;
  isPerfect: boolean;
  noteComparisons: NoteComparison[];
  targetTotalBeats: number;
  userTotalBeats: number;
}

export interface GradingReport {
  totalNotes: number;
  correctPitches: number;
  correctRhythms: number;
  perfectNotes: number;
  scorePercentage: number;
  measureGradings: MeasureGrading[];
  summaryFeedback: string;
}

export function gradeExam(targetMeasures: Measure[], userMeasures: Measure[]): GradingReport {
  let totalNotes = 0;
  let correctPitches = 0;
  let correctRhythms = 0;
  let perfectNotes = 0;

  const measureGradings: MeasureGrading[] = targetMeasures.map((targetMeasure, mIdx) => {
    const userMeasure = userMeasures[mIdx];
    const uNotes = userMeasure?.notes || [];
    const tNotes = targetMeasure.notes;

    const maxLength = Math.max(tNotes.length, uNotes.length);
    const noteComparisons: NoteComparison[] = [];
    let measurePerfect = true;

    for (let i = 0; i < maxLength; i++) {
      const tNote = tNotes[i];
      const uNote = uNotes[i];

      if (tNote) {
        totalNotes++;
      }

      const isPitchMatch = !!tNote && !!uNote && tNote.pitch === uNote.pitch;
      const isRhythmMatch = !!tNote && !!uNote && tNote.value === uNote.value;
      const isFullMatch = isPitchMatch && isRhythmMatch;

      if (isPitchMatch) correctPitches++;
      if (isRhythmMatch) correctRhythms++;
      if (isFullMatch) perfectNotes++;
      if (!isFullMatch) measurePerfect = false;

      noteComparisons.push({
        targetPitch: tNote?.pitch || '-',
        targetValue: tNote?.value || 'quarter',
        userPitch: uNote?.pitch,
        userValue: uNote?.value,
        isPitchMatch,
        isRhythmMatch,
        isFullMatch,
      });
    }

    return {
      measureNumber: targetMeasure.measureNumber,
      isPerfect: measurePerfect,
      noteComparisons,
      targetTotalBeats: targetMeasure.totalBeats,
      userTotalBeats: userMeasure ? userMeasure.totalBeats : 0,
    };
  });

  const scorePercentage = totalNotes > 0 ? Math.round((perfectNotes / totalNotes) * 100) : 0;

  let summaryFeedback = '';
  if (scorePercentage === 100) {
    summaryFeedback = '🎉 완벽합니다! 음정과 박자를 100% 정확하게 그려냈습니다!';
  } else if (scorePercentage >= 80) {
    summaryFeedback = '👏 훌륭해요! 대부분의 음정과 박자를 정확히 파악했습니다. 세부 음표를 점검해보세요.';
  } else if (scorePercentage >= 50) {
    summaryFeedback = '💪 좋은 시도입니다! 4분음표(1박)와 2분음표(2박)의 길이 차이 및 음높이를 다시 들어보세요.';
  } else {
    summaryFeedback = '🎵 기준음(C4)을 먼저 듣고, 한 마디씩 끊어서 들으며 천천히 다시 도전해보세요!';
  }

  return {
    totalNotes,
    correctPitches,
    correctRhythms,
    perfectNotes,
    scorePercentage,
    measureGradings,
    summaryFeedback,
  };
}
