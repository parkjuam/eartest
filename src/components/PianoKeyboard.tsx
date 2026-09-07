import React from 'react';
import { NoteValue } from '../types';
import { audioManager } from '../utils/audio';
import { getPitchDef } from '../utils/musicTheory';

interface PianoKeyboardProps {
  activeNoteValue: NoteValue;
  onChangeNoteValue: (val: NoteValue) => void;
  onPlayAndAddNote?: (pitch: string, value: NoteValue) => void;
  selectedMeasureIdx: number;
}

interface KeyConfig {
  pitch: string;
  nameKo: string;
  nameEn: string;
  isBlack?: boolean;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  activeNoteValue,
  onChangeNoteValue,
  onPlayAndAddNote,
  selectedMeasureIdx,
}) => {
  // Piano keys range from C4 to E5 (standard ear training range for C Major)
  const keys: KeyConfig[] = [
    { pitch: 'C4', nameKo: '도', nameEn: 'C4' },
    { pitch: 'C#4', nameKo: '도#', nameEn: 'C#4', isBlack: true },
    { pitch: 'D4', nameKo: '레', nameEn: 'D4' },
    { pitch: 'D#4', nameKo: '레#', nameEn: 'D#4', isBlack: true },
    { pitch: 'E4', nameKo: '미', nameEn: 'E4' },
    { pitch: 'F4', nameKo: '파', nameEn: 'F4' },
    { pitch: 'F#4', nameKo: '파#', nameEn: 'F#4', isBlack: true },
    { pitch: 'G4', nameKo: '솔', nameEn: 'G4' },
    { pitch: 'G#4', nameKo: '솔#', nameEn: 'G#4', isBlack: true },
    { pitch: 'A4', nameKo: '라', nameEn: 'A4' },
    { pitch: 'A#4', nameKo: '라#', nameEn: 'A#4', isBlack: true },
    { pitch: 'B4', nameKo: '시', nameEn: 'B4' },
    { pitch: 'C5', nameKo: '높은 도', nameEn: 'C5' },
    { pitch: 'C#5', nameKo: '도#', nameEn: 'C#5', isBlack: true },
    { pitch: 'D5', nameKo: '높은 레', nameEn: 'D5' },
    { pitch: 'D#5', nameKo: '레#', nameEn: 'D#5', isBlack: true },
    { pitch: 'E5', nameKo: '높은 미', nameEn: 'E5' },
  ];

  const handleKeyClick = (pitch: string, isBlack = false) => {
    if (isBlack) return; // In C major ear exam, black keys are not used
    const duration = activeNoteValue === 'quarter' ? 0.6 : 1.2;
    audioManager.playNote(pitch, duration);

    if (onPlayAndAddNote) {
      onPlayAndAddNote(pitch, activeNoteValue);
    }
  };

  return (
    <div id="piano-input-panel" className="bg-[#1E293B] rounded-xl border border-slate-800 p-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Note Value Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">음표 선택:</span>
          <div className="inline-flex rounded-lg border border-slate-700 p-1 bg-[#0F172A]">
            <button
              id="select-quarter-note-btn"
              type="button"
              onClick={() => onChangeNoteValue('quarter')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeNoteValue === 'quarter'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="text-base leading-none">♩</span>
              <span>4분음표 (1박)</span>
            </button>
            <button
              id="select-half-note-btn"
              type="button"
              onClick={() => onChangeNoteValue('half')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeNoteValue === 'half'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="text-base leading-none">𝅗𝅥</span>
              <span>2분음표 (2박)</span>
            </button>
          </div>
        </div>

        {/* Reference & Target Measure info */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => audioManager.playReferenceTone('C4', 1.5)}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#0F172A] hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-lg transition-colors font-medium"
          >
            🔔 기준음(가온 도 C4) 듣기
          </button>
          <span className="bg-[#0F172A] px-2 py-1 rounded text-slate-300 font-medium border border-slate-700/80">
            현재 입력 대상: <strong className="text-amber-400">{selectedMeasureIdx + 1}마디</strong>
          </span>
        </div>
      </div>

      {/* Keyboard Keys */}
      <div className="relative flex justify-center overflow-x-auto pb-2 select-none">
        <div className="relative inline-flex bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
          {/* White keys */}
          <div className="flex">
            {keys
              .filter(k => !k.isBlack)
              .map((key) => {
                const isC4 = key.pitch === 'C4';
                return (
                  <button
                    key={key.pitch}
                    id={`piano-key-${key.pitch}`}
                    type="button"
                    onClick={() => handleKeyClick(key.pitch, false)}
                    className={`relative w-12 sm:w-14 h-36 bg-slate-100 hover:bg-amber-100 active:bg-amber-300 border-r border-slate-300 rounded-b-md flex flex-col justify-end items-center pb-3 transition-colors shadow-sm ${
                      isC4 ? 'border-b-4 border-b-amber-500' : ''
                    }`}
                  >
                    <span className="text-xs font-extrabold text-slate-900">{key.nameKo}</span>
                    <span className="text-[10px] font-mono text-slate-500">{key.pitch}</span>
                    {isC4 && (
                      <span className="absolute top-2 px-1 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-bold rounded">
                        가온도
                      </span>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Black keys (Absolute positioned decorative / muted) */}
          <div className="absolute top-2 left-2 flex pointer-events-none">
            {/* C#4 */}
            <div className="w-7 h-22 bg-slate-900 border border-slate-800 rounded-b-sm ml-9 opacity-80"></div>
            {/* D#4 */}
            <div className="w-7 h-22 bg-slate-900 border border-slate-800 rounded-b-sm ml-6 opacity-80"></div>
            {/* Space between E4 and F4 */}
            <div className="w-13"></div>
            {/* F#4 */}
            <div className="w-7 h-22 bg-slate-900 border border-slate-800 rounded-b-sm ml-1 opacity-80"></div>
            {/* G#4 */}
            <div className="w-7 h-22 bg-slate-900 border border-slate-800 rounded-b-sm ml-6 opacity-80"></div>
            {/* A#4 */}
            <div className="w-7 h-22 bg-slate-900 border border-slate-800 rounded-b-sm ml-6 opacity-80"></div>
            {/* Space between B4 and C5 */}
            <div className="w-13"></div>
            {/* C#5 */}
            <div className="w-7 h-22 bg-slate-900 border border-slate-800 rounded-b-sm ml-1 opacity-80"></div>
            {/* D#5 */}
            <div className="w-7 h-22 bg-slate-900 border border-slate-800 rounded-b-sm ml-6 opacity-80"></div>
          </div>
        </div>
      </div>
      <p className="text-center text-[11px] text-slate-400 mt-2">
        건반을 누르면 음을 들으면서 {selectedMeasureIdx + 1}마디에 선택된 음표(4분 또는 2분)가 즉시 악보에 입력됩니다.
      </p>
    </div>
  );
};
