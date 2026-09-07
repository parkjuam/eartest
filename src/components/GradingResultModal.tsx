import React from 'react';
import { Measure } from '../types';
import { GradingReport } from '../utils/examGenerator';
import { StaffCanvas } from './StaffCanvas';
import { CheckCircle2, XCircle, AlertTriangle, RotateCcw, ArrowRight, X } from 'lucide-react';

interface GradingResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: GradingReport | null;
  targetMeasures: Measure[];
  userMeasures: Measure[];
  onRetry: () => void;
  onNextExam?: () => void;
}

export const GradingResultModal: React.FC<GradingResultModalProps> = ({
  isOpen,
  onClose,
  report,
  targetMeasures,
  userMeasures,
  onRetry,
  onNextExam,
}) => {
  if (!isOpen || !report) return null;

  const isPerfect = report.scorePercentage === 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        id="grading-result-modal"
        className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-2xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                isPerfect ? 'bg-emerald-600' : report.scorePercentage >= 70 ? 'bg-amber-600' : 'bg-slate-700'
              }`}
            >
              {isPerfect ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : report.scorePercentage >= 70 ? (
                <span className="text-xl font-black">👏</span>
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">청음 시험 채점 결과</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    isPerfect
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : report.scorePercentage >= 70
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {report.scorePercentage}점
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{report.summaryFeedback}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-400">전체 음표 수</div>
            <div className="text-xl font-bold text-slate-100 mt-1">{report.totalNotes}개</div>
          </div>
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 text-center">
            <div className="text-xs text-emerald-400 font-medium">완전 일치 (음정+박자)</div>
            <div className="text-xl font-bold text-emerald-300 mt-1">
              {report.perfectNotes} / {report.totalNotes}
            </div>
          </div>
          <div className="bg-sky-950/30 border border-sky-800/40 rounded-xl p-3 text-center">
            <div className="text-xs text-sky-400 font-medium">음정 일치</div>
            <div className="text-xl font-bold text-sky-300 mt-1">
              {report.correctPitches} / {report.totalNotes}
            </div>
          </div>
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 text-center">
            <div className="text-xs text-amber-400 font-medium">리듬 일치 (4분·2분)</div>
            <div className="text-xl font-bold text-amber-300 mt-1">
              {report.correctRhythms} / {report.totalNotes}
            </div>
          </div>
        </div>

        {/* Staves Comparison */}
        <div className="space-y-4 my-6">
          {/* Target Score */}
          <div>
            <div className="flex items-center gap-2 mb-1.5 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-emerald-400">정답 악보</span>
            </div>
            <StaffCanvas
              measures={targetMeasures}
              activeNoteValue="quarter"
              onAddNote={() => {}}
              onDeleteNote={() => {}}
              readOnly={true}
              showPitchLabels={true}
            />
          </div>

          {/* User's Score */}
          <div>
            <div className="flex items-center gap-2 mb-1.5 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-xs font-bold text-amber-400">내가 그린 악보</span>
            </div>
            <StaffCanvas
              measures={userMeasures}
              activeNoteValue="quarter"
              onAddNote={() => {}}
              onDeleteNote={() => {}}
              readOnly={true}
              showPitchLabels={true}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>다시 시도하기</span>
          </button>
          {onNextExam && (
            <button
              type="button"
              onClick={onNextExam}
              className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <span>다음 문제 풀기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
