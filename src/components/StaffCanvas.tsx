import React, { useState } from 'react';
import { Measure, NoteValue } from '../types';
import { getPitchDef, getStaffY, getLedgerLines, PITCH_DEFINITIONS } from '../utils/musicTheory';
import { audioManager } from '../utils/audio';
import { Trash2 } from 'lucide-react';

interface StaffCanvasProps {
  measures: Measure[];
  activeNoteValue: NoteValue;
  onAddNote: (measureIndex: number, pitch: string, value: NoteValue) => void;
  onDeleteNote: (measureIndex: number, noteIndex: number) => void;
  onClearMeasure?: (measureIndex: number) => void;
  onPlayMeasure?: (measureIndex: number) => void;
  highlightedNote?: { measureIdx: number; noteIdx: number | null } | null;
  selectedMeasureIdx?: number;
  onSelectMeasure?: (idx: number) => void;
  title?: string;
  readOnly?: boolean;
}

export const StaffCanvas: React.FC<StaffCanvasProps> = ({
  measures,
  activeNoteValue,
  onAddNote,
  onDeleteNote,
  onPlayMeasure,
  highlightedNote,
  selectedMeasureIdx = 0,
  onSelectMeasure,
  title,
  readOnly = false,
}) => {
  // Ensure we have exactly 8 measures (indices 0..7)
  const safeMeasures = Array.from({ length: 8 }, (_, i) => {
    return measures[i] || { id: `m-${i + 1}`, measureNumber: i + 1, notes: [], totalBeats: 0 };
  });

  // Staff geometry constants
  const staffLineSpacing = 16;
  const clefWidth = 55;
  const timeSigWidth = 35;
  const headerOffset = clefWidth + timeSigWidth + 15; // ~105px
  const measureWidth = 215; // 4 measures * 215 = 860px
  const svgWidth = headerOffset + 4 * measureWidth + 25; // 105 + 860 + 25 = 990px
  const svgHeight = 425;

  // System 1 (Top: Measures 1 to 4)
  // bottom line 1 (E4) = 112
  // line 2 (G4) = 96
  // line 3 (B4, middle) = 80
  // line 4 (D5) = 64
  // line 5 (F5, top) = 48
  const firstLineY1 = 112;
  const staffTopY1 = firstLineY1 - 4 * staffLineSpacing; // 48
  const staffBottomY1 = firstLineY1; // 112
  const system1Measures = [0, 1, 2, 3];

  // System 2 (Bottom: Measures 5 to 8)
  // bottom line 1 (E4) = 302
  // line 2 (G4) = 286
  // line 3 (B4, middle) = 270
  // line 4 (D5) = 254
  // line 5 (F5, top) = 238
  const firstLineY2 = 302;
  const staffTopY2 = firstLineY2 - 4 * staffLineSpacing; // 238
  const staffBottomY2 = firstLineY2; // 302
  const system2Measures = [4, 5, 6, 7];

  // Track hover state for phantom preview
  const [hoveredMeasure, setHoveredMeasure] = useState<number | null>(null);
  const [hoveredPitch, setHoveredPitch] = useState<string | null>(null);

  // Map mouse Y inside measure rect to closest C-major pitch
  const handleMouseMoveOnMeasure = (
    e: React.MouseEvent<SVGRectElement>,
    mIdx: number,
    firstLineY: number
  ) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeYInsideRect = e.clientY - rect.top;
    const actualSvgY = (relativeYInsideRect / rect.height) * 160 + (mIdx < 4 ? 20 : 210);

    const candidates = PITCH_DEFINITIONS.filter(p => p.staffStep >= -2 && p.staffStep <= 9);

    let closest = 'C4';
    let minDiff = Infinity;
    candidates.forEach(p => {
      const targetY = getStaffY(p.staffStep, firstLineY, staffLineSpacing);
      const diff = Math.abs(actualSvgY - targetY);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p.pitch;
      }
    });

    setHoveredMeasure(mIdx);
    setHoveredPitch(closest);
  };

  const handleMouseLeave = () => {
    setHoveredMeasure(null);
    setHoveredPitch(null);
  };

  const handleMeasureClick = (mIdx: number) => {
    if (readOnly || !hoveredPitch) return;
    const measure = safeMeasures[mIdx];
    const incomingDuration = activeNoteValue === 'quarter' ? 1 : 2;

    if (measure.totalBeats + incomingDuration > 4) {
      audioManager.playClick(false);
      return;
    }

    onAddNote(mIdx, hoveredPitch, activeNoteValue);
    audioManager.playNote(hoveredPitch, activeNoteValue === 'quarter' ? 0.6 : 1.2);
  };

  // Render a 4-measure system (Row)
  const renderSystem = (
    systemIndex: number, // 0 for Top (1-4), 1 for Bottom (5-8)
    measureIndices: number[],
    firstLineY: number,
    staffTopY: number,
    staffBottomY: number,
    systemBoxTopY: number
  ) => {
    const isBottomSystem = systemIndex === 1;

    return (
      <g key={`system-${systemIndex}`} className="system-group">
        {/* System Bracket / Left vertical line connecting staff lines */}
        <line
          x1={20}
          y1={staffTopY}
          x2={20}
          y2={staffBottomY}
          stroke="#94a3b8"
          strokeWidth="2.5"
          className="print:stroke-slate-900"
        />

        {/* 5 Staff Lines spanning across */}
        {[0, 1, 2, 3, 4].map(lineIdx => {
          const lineY = firstLineY - lineIdx * staffLineSpacing;
          return (
            <line
              key={`system-${systemIndex}-line-${lineIdx}`}
              x1={20}
              y1={lineY}
              x2={svgWidth - 25}
              y2={lineY}
              stroke="#64748b"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="print:stroke-slate-800"
            />
          );
        })}

        {/* Clef (𝄞) */}
        <text
          x={28}
          y={firstLineY - 12}
          fontSize="68"
          fontFamily="'Times New Roman', Georgia, serif"
          fill="#f8fafc"
          className="select-none pointer-events-none print:fill-slate-950"
        >
          𝄞
        </text>

        {/* Time Signature: 4/4 - 악보 관례에 따라 첫 번째 단(위 1~4마디)에만 표시하고 아래 5마디에는 표시하지 않음 */}
        {!isBottomSystem && (
          <g transform={`translate(${clefWidth + 30}, 0)`}>
            {/* 상단 4 (위의 두 칸에 꽉 차게) */}
            <text
              x={15}
              y={firstLineY - 48}
              fontSize="36"
              fontWeight="bold"
              fontFamily="'Century Schoolbook', 'Times New Roman', Georgia, serif"
              fill="#f8fafc"
              textAnchor="middle"
              dominantBaseline="central"
              className="select-none pointer-events-none print:fill-slate-950"
            >
              4
            </text>
            {/* 하단 4 (밑의 두 칸에 꽉 차게) */}
            <text
              x={15}
              y={firstLineY - 16}
              fontSize="36"
              fontWeight="bold"
              fontFamily="'Century Schoolbook', 'Times New Roman', Georgia, serif"
              fill="#f8fafc"
              textAnchor="middle"
              dominantBaseline="central"
              className="select-none pointer-events-none print:fill-slate-950"
            >
              4
            </text>
          </g>
        )}

        {/* 4 Measures in this system */}
        {measureIndices.map((mIdx, posInSystem) => {
          const measure = safeMeasures[mIdx];
          const measureStartX = headerOffset + posInSystem * measureWidth;
          const measureEndX = measureStartX + measureWidth;
          const isSelected = selectedMeasureIdx === mIdx;
          const isHovered = hoveredMeasure === mIdx;

          return (
            <g key={`measure-${mIdx}`}>
              {/* Measure Number */}
              <text
                x={measureStartX + 6}
                y={staffTopY - 10}
                fontSize="12"
                fontFamily="sans-serif"
                fontWeight="600"
                fill={isSelected ? '#fbbf24' : '#94a3b8'}
                className="select-none print:fill-slate-700"
              >
                {mIdx + 1}
              </text>

              {/* Interactive Click/Hover Zone for Measure */}
              {!readOnly && (
                <rect
                  x={measureStartX}
                  y={systemBoxTopY + 28}
                  width={measureWidth}
                  height={140}
                  fill={
                    isSelected
                      ? 'rgba(245, 158, 11, 0.08)'
                      : isHovered
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'transparent'
                  }
                  className="cursor-pointer transition-colors"
                  onMouseMove={e => handleMouseMoveOnMeasure(e, mIdx, firstLineY)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => {
                    if (onSelectMeasure) onSelectMeasure(mIdx);
                    handleMeasureClick(mIdx);
                  }}
                />
              )}

              {/* Vertical Bar Line at Measure End */}
              {posInSystem < 3 ? (
                // Regular measure line
                <line
                  x1={measureEndX}
                  y1={staffTopY}
                  x2={measureEndX}
                  y2={staffBottomY}
                  stroke="#64748b"
                  strokeWidth="1.5"
                  className="print:stroke-slate-800"
                />
              ) : isBottomSystem ? (
                // System 2, Measure 8: Final Double Bar Line (끝세로줄 𝄂)
                <g>
                  <line
                    x1={measureEndX - 6}
                    y1={staffTopY}
                    x2={measureEndX - 6}
                    y2={staffBottomY}
                    stroke="#64748b"
                    strokeWidth="1.5"
                    className="print:stroke-slate-800"
                  />
                  <line
                    x1={measureEndX}
                    y1={staffTopY}
                    x2={measureEndX}
                    y2={staffBottomY}
                    stroke="#cbd5e1"
                    strokeWidth="3.5"
                    className="print:stroke-slate-900"
                  />
                </g>
              ) : (
                // System 1, Measure 4: System end line
                <line
                  x1={measureEndX}
                  y1={staffTopY}
                  x2={measureEndX}
                  y2={staffBottomY}
                  stroke="#64748b"
                  strokeWidth="1.5"
                  className="print:stroke-slate-800"
                />
              )}

              {/* Notes in this measure */}
              {measure.notes.map((note, nIdx) => {
                const noteCount = measure.notes.length;
                const noteSpacing = (measureWidth - 40) / Math.max(1, noteCount);
                const noteX = measureStartX + 20 + nIdx * noteSpacing + noteSpacing / 2;

                const pitchDef = getPitchDef(note.pitch);
                const staffStep = pitchDef ? pitchDef.staffStep : 0;
                const noteY = getStaffY(staffStep, firstLineY, staffLineSpacing);

                // Stem direction: staffStep >= 4 (B4 and above) stems point down
                const stemDown = staffStep >= 4;
                const stemLength = 38;
                const stemX = stemDown ? noteX - 7.5 : noteX + 7.5;
                const stemY1 = noteY;
                const stemY2 = stemDown ? noteY + stemLength : noteY - stemLength;

                // Ledger lines
                const ledgerSteps = getLedgerLines(staffStep);

                // Active audio playing highlight
                const isPlayingThis =
                  highlightedNote?.measureIdx === mIdx && highlightedNote?.noteIdx === nIdx;

                return (
                  <g
                    key={note.id}
                    className="group/note cursor-pointer"
                    onClick={e => {
                      e.stopPropagation();
                      audioManager.playNote(note.pitch, note.value === 'quarter' ? 0.6 : 1.2);
                    }}
                  >
                    {/* Active audio playing highlight aura */}
                    {isPlayingThis && (
                      <circle
                        cx={noteX}
                        cy={noteY}
                        r="22"
                        fill="rgba(245, 158, 11, 0.25)"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        className="animate-pulse"
                      />
                    )}

                    {/* Ledger lines (덧줄) */}
                    {ledgerSteps.map(lStep => {
                      const lY = getStaffY(lStep, firstLineY, staffLineSpacing);
                      return (
                        <line
                          key={`ledger-${note.id}-${lStep}`}
                          x1={noteX - 16}
                          y1={lY}
                          x2={noteX + 16}
                          y2={lY}
                          stroke="#94a3b8"
                          strokeWidth="1.5"
                          className="print:stroke-slate-800"
                        />
                      );
                    })}

                    {/* Note Head: Quarter (filled) vs Half (hollow) */}
                    {note.value === 'quarter' ? (
                      // 4분음표 (채워진 타원)
                      <ellipse
                        cx={noteX}
                        cy={noteY}
                        rx="8.5"
                        ry="6"
                        transform={`rotate(-20 ${noteX} ${noteY})`}
                        fill="#f8fafc"
                        className="print:fill-slate-900"
                      />
                    ) : (
                      // 2분음표 (비어있는 타원 + 흰 테두리)
                      <ellipse
                        cx={noteX}
                        cy={noteY}
                        rx="8.5"
                        ry="6"
                        transform={`rotate(-20 ${noteX} ${noteY})`}
                        fill="#0F172A"
                        stroke="#f8fafc"
                        strokeWidth="2.8"
                        className="print:fill-white print:stroke-slate-900"
                      />
                    )}

                    {/* Note Stem (기둥) */}
                    <line
                      x1={stemX}
                      y1={stemY1}
                      x2={stemX}
                      y2={stemY2}
                      stroke="#f8fafc"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="print:stroke-slate-900"
                    />

                    {/* Pitch Name Label under staff (계이름만 표시) */}
                    {pitchDef && (
                      <text
                        x={noteX}
                        y={firstLineY + 36}
                        fontSize="12"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill={isPlayingThis ? '#fbbf24' : '#cbd5e1'}
                        className="print:fill-slate-800"
                      >
                        {pitchDef.nameKo}
                      </text>
                    )}

                    {/* Individual Note Delete Button (Appears on hover) */}
                    {!readOnly && (
                      <g
                        className="opacity-0 group-hover/note:opacity-100 transition-opacity cursor-pointer print:hidden"
                        onClick={e => {
                          e.stopPropagation();
                          onDeleteNote(mIdx, nIdx);
                        }}
                      >
                        <circle
                          cx={noteX}
                          cy={firstLineY + 54}
                          r="9"
                          fill="#7f1d1d"
                          stroke="#ef4444"
                          strokeWidth="1"
                        />
                        <text
                          x={noteX}
                          y={firstLineY + 57.5}
                          fontSize="10"
                          textAnchor="middle"
                          fill="#fecaca"
                          fontWeight="bold"
                        >
                          ×
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Phantom Note Preview on hover */}
              {!readOnly && isHovered && hoveredPitch && (
                (() => {
                  const hPitchDef = getPitchDef(hoveredPitch);
                  if (!hPitchDef) return null;
                  const hStep = hPitchDef.staffStep;
                  const hY = getStaffY(hStep, firstLineY, staffLineSpacing);

                  const curNoteCount = measure.notes.length;
                  const phantomSpacing = (measureWidth - 40) / Math.max(1, curNoteCount + 1);
                  const phantomX = measureStartX + 20 + curNoteCount * phantomSpacing + phantomSpacing / 2;

                  const stemDown = hStep >= 4;
                  const stemLength = 38;
                  const stemX = stemDown ? phantomX - 7.5 : phantomX + 7.5;
                  const ledgerSteps = getLedgerLines(hStep);

                  return (
                    <g className="pointer-events-none opacity-85 print:hidden">
                      {/* Phantom Ledger lines */}
                      {ledgerSteps.map(lStep => {
                        const lY = getStaffY(lStep, firstLineY, staffLineSpacing);
                        return (
                          <line
                            key={`phantom-ledger-${lStep}`}
                            x1={phantomX - 16}
                            y1={lY}
                            x2={phantomX + 16}
                            y2={lY}
                            stroke="#38bdf8"
                            strokeWidth="1.5"
                          />
                        );
                      })}

                      {/* Phantom Note Head */}
                      {activeNoteValue === 'quarter' ? (
                        <ellipse
                          cx={phantomX}
                          cy={hY}
                          rx="8.5"
                          ry="6"
                          transform={`rotate(-20 ${phantomX} ${hY})`}
                          fill="#38bdf8"
                        />
                      ) : (
                        <ellipse
                          cx={phantomX}
                          cy={hY}
                          rx="8.5"
                          ry="6"
                          transform={`rotate(-20 ${phantomX} ${hY})`}
                          fill="#0F172A"
                          stroke="#38bdf8"
                          strokeWidth="2.8"
                        />
                      )}

                      {/* Phantom Stem */}
                      <line
                        x1={stemX}
                        y1={hY}
                        x2={stemX}
                        y2={stemDown ? hY + stemLength : hY - stemLength}
                        stroke="#38bdf8"
                        strokeWidth="2"
                      />

                      {/* Floating Tooltip with Pitch Name */}
                      <g transform={`translate(${phantomX}, ${hY - 24})`}>
                        <rect
                          x="-22"
                          y="-14"
                          width="44"
                          height="18"
                          rx="4"
                          fill="#0369a1"
                          stroke="#38bdf8"
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="-1"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill="#ffffff"
                        >
                          {hPitchDef.nameKo}
                        </text>
                      </g>
                    </g>
                  );
                })()
              )}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div
      id="staff-canvas-wrapper"
      className="w-full bg-[#1E293B] rounded-2xl border border-slate-800 shadow-xl p-4 sm:p-5 overflow-hidden print:bg-white print:border-none print:shadow-none print:p-0"
    >
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800 print:border-slate-300">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 print:bg-slate-900"></span>
          <h3 className="font-bold text-slate-100 text-sm sm:text-base tracking-tight print:text-slate-900">
            {title || '다장조 8마디 청음 악보 (C Major)'}
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 print:text-slate-600 font-medium">
          <span>4/4 박자</span>
          <span>•</span>
          <span>다장조 (C Major)</span>
        </div>
      </div>

      {/* SVG Sheet Music Renderer with viewBox for full responsive scaling */}
      <div className="w-full overflow-x-auto pb-1 scrollbar-thin">
        <svg
          id="music-sheet-svg"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height="100%"
          className="select-none block rounded-xl print:rounded-none max-w-5xl mx-auto"
          style={{ minWidth: '780px' }}
        >
          {/* Background */}
          <rect
            x="0"
            y="0"
            width="100%"
            height={svgHeight}
            fill="#0F172A"
            rx="12"
            className="print:fill-white"
          />

          {/* System 1 (Top: 1~4마디) */}
          {renderSystem(0, system1Measures, firstLineY1, staffTopY1, staffBottomY1, 14)}

          {/* System 2 (Bottom: 5~8마디) */}
          {renderSystem(1, system2Measures, firstLineY2, staffTopY2, staffBottomY2, 204)}
        </svg>
      </div>

      {/* Footer Helper Guide */}
      {!readOnly && (
        <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 px-1 print:hidden">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              오선보의 원하는 높이를 마우스로 클릭하면 음표가 입력됩니다
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              음표에 마우스를 올리면 개별 삭제(×)가 가능합니다
            </span>
          </div>
          <div className="text-slate-300 font-mono text-[11px] bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700/80">
            현재 입력 음표: {activeNoteValue === 'quarter' ? '♩ 4분음표 (1박)' : '𝅗𝅥 2분음표 (2박)'}
          </div>
        </div>
      )}
    </div>
  );
};
