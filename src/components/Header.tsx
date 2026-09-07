import React from 'react';
import { Volume2, VolumeX, Printer, RotateCcw, ImageDown } from 'lucide-react';

interface HeaderProps {
  onPrint: () => void;
  onResetScore: () => void;
  onSaveImage: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onPrint,
  onResetScore,
  onSaveImage,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 shadow-md print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md font-serif text-2xl font-bold">
            𝄞
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
                청음 수행 평가
              </h1>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold rounded-full">
                4/4 박자 • 다장조
              </span>
            </div>
            <p className="text-xs text-slate-400">
              선생님이 들려주는 음을 듣고 오선보에 알맞은 음표를 적어보세요.
            </p>
          </div>
        </div>

        {/* Right: Essential Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Speaker On / Off Toggle Button (Initially OFF) */}
          <button
            type="button"
            id="speaker-mute-toggle-btn"
            onClick={onToggleMute}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs border ${
              isMuted
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
            }`}
            title={isMuted ? '스피커 켜기 (소리 재생 ON)' : '스피커 끄기 (음소거 OFF)'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">소리 끔 (OFF)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-extrabold">소리 켬 (ON)</span>
              </>
            )}
          </button>

          {/* Reset Score */}
          <button
            type="button"
            id="reset-score-btn"
            onClick={onResetScore}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E293B] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
            title="악보를 처음 상태로 비웁니다"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>악보 비우기</span>
          </button>

          {/* Save as Image (PNG) Button */}
          <button
            type="button"
            id="save-image-btn"
            onClick={onSaveImage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            title="악보를 그림 파일(PNG)로 저장하여 다운로드합니다"
          >
            <ImageDown className="w-4 h-4 text-emerald-100" />
            <span>그림파일로 저장</span>
          </button>

          {/* Print/Export */}
          <button
            type="button"
            id="print-sheet-btn"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
            title="악보 인쇄 / PDF 저장"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>인쇄</span>
          </button>
        </div>
      </div>
    </header>
  );
};
