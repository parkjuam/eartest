import React from 'react';
import { Measure } from '../types';
import { C_MAJOR_CHORDS, CHORD_PRESETS, getChordDef } from '../utils/chords';
import { audioManager } from '../utils/audio';
import { Music, Play, Sparkles, Volume2, XCircle } from 'lucide-react';

interface ChordPanelProps {
  measures: Measure[];
  selectedMeasureIdx: number;
  onSelectMeasure: (idx: number) => void;
  onSetChord: (measureIdx: number, slot: 1 | 2, chord: string | null) => void;
  onApplyPreset: (presetChords: { m: number; c1: string | null; c2: string | null }[]) => void;
  onClearAllChords: () => void;
  onPlayMeasure: (measureIdx: number) => void;
  isPlaying: boolean;
}

export const ChordPanel: React.FC<ChordPanelProps> = ({
  measures,
  selectedMeasureIdx,
  onSelectMeasure,
  onSetChord,
  onApplyPreset,
  onClearAllChords,
  onPlayMeasure,
  isPlaying,
}) => {
  const currentMeasure = measures[selectedMeasureIdx] || {
    id: 'temp',
    measureNumber: selectedMeasureIdx + 1,
    notes: [],
    totalBeats: 0,
    chord1: null,
    chord2: null,
  };

  const chord1 = currentMeasure.chord1;
  const chord2 = currentMeasure.chord2;

  // Handle chord 1 click
  const handleSelectChord1 = (chordName: string | null) => {
    onSetChord(selectedMeasureIdx, 1, chordName);
    if (chordName) {
      // Play preview sound immediately: "코드를 넣으면 그 코드를 연주해줘 (예: C코드 도미솔)"
      audioManager.playChord(chordName, 1.4, undefined, true);
    }
  };

  // Handle chord 2 click (optional / can be omitted)
  const handleSelectChord2 = (chordName: string | null) => {
    onSetChord(selectedMeasureIdx, 2, chordName);
    if (chordName) {
      audioManager.playChord(chordName, 1.4, undefined, true);
    }
  };

  const chord1Def = chord1 ? getChordDef(chord1) : null;
  const chord2Def = chord2 ? getChordDef(chord2) : null;

  return (
    <div
      id="chord-management-panel"
      className="bg-[#1E293B] rounded-2xl border border-slate-800 p-3.5 sm:p-5 shadow-md flex flex-col gap-4 text-slate-100 print:hidden"
    >
      {/* Header & Measure Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>화음(코드) 반주 입력</span>
              <span className="text-[11px] font-medium text-sky-400 bg-sky-950/70 border border-sky-800/70 px-2 py-0.5 rounded-full">
                첫 째박(필수) & 셋 째박(생략 가능)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              코드를 선택하면 악보 위에 표시되고 음표(멜로디)와 화음이 함께 연주됩니다.
            </p>
          </div>
        </div>

        {/* Measure Select Tabs 1~8 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs text-slate-400 font-semibold mr-1 whitespace-nowrap">마디 선택:</span>
          {measures.map((m, idx) => {
            const isSelected = selectedMeasureIdx === idx;
            const hasChords = Boolean(m.chord1 || m.chord2);

            return (
              <button
                key={m.id || idx}
                type="button"
                onClick={() => onSelectMeasure(idx)}
                className={`flex flex-col items-center justify-center min-w-[38px] px-2 py-1 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-xs'
                    : hasChords
                    ? 'bg-[#0F172A] text-sky-300 border-sky-800/60 hover:bg-slate-800'
                    : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{idx + 1}마디</span>
                <span className="text-[9px] font-mono leading-none opacity-80 mt-0.5">
                  {m.chord1 ? (m.chord2 ? `${m.chord1}+${m.chord2}` : m.chord1) : '-'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Measure Active Chord Info & Play Button */}
      <div className="bg-[#0F172A] rounded-xl border border-slate-800/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <span className="font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
            제 {selectedMeasureIdx + 1} 마디
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">1박 코드:</span>
            {chord1 ? (
              <span className="font-bold text-sky-300 bg-sky-950/80 border border-sky-700/60 px-2 py-0.5 rounded-md">
                {chord1} <span className="text-[10px] text-sky-400 font-normal">({chord1Def?.labelKo})</span>
              </span>
            ) : (
              <span className="text-slate-500 italic">미입력</span>
            )}
          </div>

          <span className="text-slate-600">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">3박 코드:</span>
            {chord2 ? (
              <span className="font-bold text-purple-300 bg-purple-950/80 border border-purple-700/60 px-2 py-0.5 rounded-md">
                {chord2} <span className="text-[10px] text-purple-400 font-normal">({chord2Def?.labelKo})</span>
              </span>
            ) : (
              <span className="text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md text-[11px]">
                생략됨 (1박 코드가 4박 전체 지속)
              </span>
            )}
          </div>
        </div>

        {/* Play This Measure with chords & notes */}
        <button
          type="button"
          disabled={isPlaying}
          onClick={() => onPlayMeasure(selectedMeasureIdx)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-xs shrink-0"
          title="선택한 마디의 화음과 멜로디를 함께 들어봅니다"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{selectedMeasureIdx + 1}마디 코드+멜로디 듣기</span>
        </button>
      </div>

      {/* Dual Chord Slots Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Slot 1: First Beat (첫 째박 - 기본/필수 코드) */}
        <div className="bg-[#131E31] rounded-xl border border-sky-900/40 p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 text-xs font-extrabold flex items-center justify-center">
                1
              </span>
              <span className="text-xs font-bold text-slate-200">
                첫 째박 코드 <span className="text-sky-400 font-normal">(1박 시작 화음)</span>
              </span>
            </div>
            {chord1 && (
              <button
                type="button"
                onClick={() => handleSelectChord1(null)}
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                title="1박 코드 지우기"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>코드 삭제</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {C_MAJOR_CHORDS.map(c => {
              const isActive = chord1 === c.name;
              return (
                <button
                  key={`c1-${c.name}`}
                  type="button"
                  onClick={() => handleSelectChord1(c.name)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border text-left ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md font-bold'
                      : 'bg-[#0F172A] hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-sky-500/50'
                  }`}
                  title={`${c.name} 코드: ${c.labelKo} (${c.roleKo}) 클릭 시 즉시 연주`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold">{c.name}</span>
                    <Volume2 className={`w-2.5 h-2.5 ${isActive ? 'text-slate-950' : 'text-sky-400 opacity-60'}`} />
                  </div>
                  <span className={`text-[10px] mt-0.5 leading-tight ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                    {c.labelKo}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot 2: Third Beat (셋 째박 - 생략 가능 코드) */}
        <div className="bg-[#171E36] rounded-xl border border-purple-900/40 p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-extrabold flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-bold text-slate-200">
                셋 째박 코드 <span className="text-purple-400 font-normal">(선택 • 생략 가능)</span>
              </span>
            </div>

            {/* Omit (생략) button */}
            <button
              type="button"
              onClick={() => handleSelectChord2(null)}
              className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium transition-all ${
                !chord2
                  ? 'bg-purple-950/80 text-purple-300 border-purple-600/80 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {!chord2 ? '✓ 2번째 코드 생략됨' : '코드 생략하기'}
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {C_MAJOR_CHORDS.map(c => {
              const isActive = chord2 === c.name;
              return (
                <button
                  key={`c2-${c.name}`}
                  type="button"
                  onClick={() => handleSelectChord2(c.name)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border text-left ${
                    isActive
                      ? 'bg-purple-500 text-white border-purple-400 shadow-md font-bold'
                      : 'bg-[#0F172A] hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-purple-500/50'
                  }`}
                  title={`${c.name} 코드: ${c.labelKo} (${c.roleKo}) 클릭 시 즉시 연주`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold">{c.name}</span>
                    <Volume2 className={`w-2.5 h-2.5 ${isActive ? 'text-white' : 'text-purple-400 opacity-60'}`} />
                  </div>
                  <span className={`text-[10px] mt-0.5 leading-tight ${isActive ? 'text-purple-100 font-medium' : 'text-slate-400'}`}>
                    {c.labelKo}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Presets & Reset Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-slate-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>추천 다장조 진행:</span>
          </div>

          {CHORD_PRESETS.map((preset, pIdx) => (
            <button
              key={`preset-${pIdx}`}
              type="button"
              onClick={() => onApplyPreset(preset.chords)}
              className="px-2.5 py-1 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 text-[11px] font-medium transition-all"
              title={preset.desc}
            >
              {preset.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClearAllChords}
          className="text-[11px] text-slate-400 hover:text-red-400 transition-colors ml-auto"
        >
          전체 마디 코드 초기화
        </button>
      </div>
    </div>
  );
};
