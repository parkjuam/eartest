import React, { useState } from 'react';
import { Measure, ExamQuestion } from '../types';
import { audioManager } from '../utils/audio';
import { Play, Square, RefreshCw, CheckCircle2, Sliders, Music, Award } from 'lucide-react';

interface ExamControlsProps {
  currentExam: ExamQuestion | null;
  userMeasures: Measure[];
  bpm: number;
  onChangeBpm: (bpm: number) => void;
  onGrade: () => void;
  onResetScore: () => void;
  selectedMeasureIdx: number;
  highlightedNote: { measureIdx: number; noteIdx: number | null } | null;
  setHighlightedNote: (val: { measureIdx: number; noteIdx: number | null } | null) => void;
}

export const ExamControls: React.FC<ExamControlsProps> = ({
  currentExam,
  userMeasures,
  bpm,
  onChangeBpm,
  onGrade,
  onResetScore,
  selectedMeasureIdx,
  highlightedNote,
  setHighlightedNote,
}) => {
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [countInBeat, setCountInBeat] = useState<number | null>(null);

  // Stop everything
  const handleStop = () => {
    audioManager.stop();
    setIsPlayingTarget(false);
    setIsPlayingUser(false);
    setCountInBeat(null);
    setHighlightedNote(null);
  };

  // Play target exam melody
  const handlePlayTarget = (measureIdx?: number) => {
    if (!currentExam) return;
    handleStop();
    setIsPlayingTarget(true);

    audioManager.playMelody(currentExam.measures, bpm, {
      withCountIn: measureIdx === undefined, // count in for full melody
      measureIndex: measureIdx,
      onCountInBeat: (beat) => {
        setCountInBeat(beat);
      },
      onHighlight: (mIdx, nIdx) => {
        setCountInBeat(null);
        setHighlightedNote({ measureIdx: mIdx, noteIdx: nIdx });
      },
      onComplete: () => {
        setIsPlayingTarget(false);
        setCountInBeat(null);
        setHighlightedNote(null);
      },
    });
  };

  // Play user drawn sheet music
  const handlePlayUserScore = (measureIdx?: number) => {
    handleStop();
    setIsPlayingUser(true);

    audioManager.playMelody(userMeasures, bpm, {
      withCountIn: measureIdx === undefined,
      measureIndex: measureIdx,
      onCountInBeat: (beat) => {
        setCountInBeat(beat);
      },
      onHighlight: (mIdx, nIdx) => {
        setCountInBeat(null);
        setHighlightedNote({ measureIdx: mIdx, noteIdx: nIdx });
      },
      onComplete: () => {
        setIsPlayingUser(false);
        setCountInBeat(null);
        setHighlightedNote(null);
      },
    });
  };

  const isAnyPlaying = isPlayingTarget || isPlayingUser;

  return (
    <div id="exam-controls-panel" className="bg-[#1E293B] rounded-xl border border-slate-800 p-4 shadow-md">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Playback Button Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Play Target Problem */}
          {currentExam && (
            <button
              id="play-target-exam-btn"
              type="button"
              onClick={() => (isPlayingTarget ? handleStop() : handlePlayTarget())}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-xs transition-all ${
                isPlayingTarget
                  ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {isPlayingTarget ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>재생 중지</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>문제 듣기 (전체)</span>
                </>
              )}
            </button>
          )}

          {/* Play Specific Measure */}
          {currentExam && (
            <button
              id="play-target-measure-btn"
              type="button"
              disabled={isAnyPlaying}
              onClick={() => handlePlayTarget(selectedMeasureIdx)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0F172A] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold disabled:opacity-40 transition-colors"
            >
              <span>{selectedMeasureIdx + 1}마디만 듣기</span>
            </button>
          )}

          {/* Play User's Drawn Score */}
          <button
            id="play-user-score-btn"
            type="button"
            onClick={() => (isPlayingUser ? handleStop() : handlePlayUserScore())}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              isPlayingUser
                ? 'bg-red-950/60 text-red-300 border-red-500/50'
                : 'bg-[#0F172A] hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>내가 그린 악보 듣기</span>
          </button>

          {/* Count-in indicator badge */}
          {countInBeat !== null && (
            <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-300 font-bold text-xs animate-bounce">
              <span>예비박:</span>
              <span className="text-sm font-extrabold">{countInBeat}</span>
            </div>
          )}
        </div>

        {/* Middle: Tempo / BPM Control */}
        <div className="flex items-center gap-3 bg-[#0F172A] px-3 py-1.5 rounded-xl border border-slate-700">
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
            빠르기: <strong className="text-slate-100 font-mono">{bpm} BPM</strong>
          </span>
          <input
            id="tempo-range-slider"
            type="range"
            min="50"
            max="108"
            step="2"
            value={bpm}
            onChange={(e) => onChangeBpm(Number(e.target.value))}
            className="w-24 sm:w-28 accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Right: Reset & Grade Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetScore}
            className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-xl text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>악보 비우기</span>
          </button>

          {currentExam && (
            <button
              id="submit-and-grade-btn"
              type="button"
              onClick={onGrade}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Award className="w-4 h-4" />
              <span>채점 및 정답 확인</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
