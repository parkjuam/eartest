import React from 'react';
import { NoteValue } from '../types';
import { Play, Square, Delete, Gauge, Volume2, VolumeX } from 'lucide-react';

interface ScoreToolbarProps {
  activeNoteValue: NoteValue;
  onChangeNoteValue: (val: NoteValue) => void;
  isPlaying: boolean;
  onPlayAll: () => void;
  onStop: () => void;
  onDeleteLastNote: () => void;
  bpm: number;
  onChangeBpm: (bpm: number) => void;
  totalNotesCount: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
  hasChords?: boolean;
}

export const ScoreToolbar: React.FC<ScoreToolbarProps> = ({
  activeNoteValue,
  onChangeNoteValue,
  isPlaying,
  onPlayAll,
  onStop,
  onDeleteLastNote,
  bpm,
  onChangeBpm,
  totalNotesCount,
  isMuted,
  onToggleMute,
  hasChords = false,
}) => {
  return (
    <div
      id="score-toolbar"
      className="bg-[#1E293B] rounded-2xl border border-slate-800 p-3 sm:p-4 shadow-md flex flex-col gap-3 text-slate-100 print:hidden"
    >
      {/* Note Selector, Playback Controls, Delete & BPM */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Note Value Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            입력 음표:
          </span>
          <div className="inline-flex rounded-xl border border-slate-700 p-1 bg-[#0F172A]">
            <button
              type="button"
              id="btn-select-quarter"
              onClick={() => onChangeNoteValue('quarter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeNoteValue === 'quarter'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="text-lg leading-none">♩</span>
              <span>4분음표 (1박)</span>
              <span className="text-[10px] opacity-70 border border-current px-1 rounded">1</span>
            </button>

            <button
              type="button"
              id="btn-select-half"
              onClick={() => onChangeNoteValue('half')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeNoteValue === 'half'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="text-lg leading-none">𝅗𝅥</span>
              <span>2분음표 (2박)</span>
              <span className="text-[10px] opacity-70 border border-current px-1 rounded">2</span>
            </button>
          </div>
        </div>

        {/* Playback Controls, Speaker Toggle & Delete */}
        <div className="flex items-center gap-2">
          {/* Speaker On/Off Toggle Button */}
          {onToggleMute !== undefined && (
            <button
              type="button"
              id="toolbar-mute-toggle-btn"
              onClick={onToggleMute}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs ${
                isMuted
                  ? 'bg-[#0F172A] hover:bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
              }`}
              title={isMuted ? '음표 입력 시 소리 켜기 (ON)' : '음표 입력 시 소리 끄기 (OFF)'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span>소리 OFF</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 font-extrabold">소리 ON</span>
                </>
              )}
            </button>
          )}

          {isPlaying ? (
            <button
              type="button"
              id="stop-playback-btn"
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>연주 정지</span>
            </button>
          ) : (
            <button
              type="button"
              id="play-all-score-btn"
              disabled={totalNotesCount === 0 && !hasChords}
              onClick={onPlayAll}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="내가 작성한 8마디 전체 멜로디와 화음(코드)을 함께 재생합니다"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>전체 듣기 (화음+멜로디)</span>
            </button>
          )}

          {/* Delete Last Note Button */}
          <button
            type="button"
            id="delete-last-note-btn"
            disabled={totalNotesCount === 0}
            onClick={onDeleteLastNote}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0F172A] hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-700/80 rounded-xl text-xs font-medium transition-colors"
            title="마지막으로 입력한 음표를 지웁니다 (Backspace)"
          >
            <Delete className="w-3.5 h-3.5 text-red-400" />
            <span>마지막 음 지우기</span>
          </button>
        </div>

        {/* BPM Selector */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-300">빠르기:</span>
          <span className="font-mono text-amber-300 font-bold min-w-[48px]">{bpm} BPM</span>
          <input
            type="range"
            min="50"
            max="120"
            step="4"
            value={bpm}
            onChange={(e) => onChangeBpm(Number(e.target.value))}
            className="w-20 sm:w-24 accent-amber-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
