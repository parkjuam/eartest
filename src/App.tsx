import React, { useState, useEffect, useCallback } from 'react';
import { Measure, NoteValue, NoteItem } from './types';
import { audioManager } from './utils/audio';
import { Header } from './components/Header';
import { ScoreToolbar } from './components/ScoreToolbar';
import { StaffCanvas } from './components/StaffCanvas';
import { Info, Sparkles, CheckCircle2, Check, UserCheck } from 'lucide-react';

// Initialize exactly 8 blank measures for 4/4 time
function createInitial8Measures(): Measure[] {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `measure-${i + 1}`,
    measureNumber: i + 1,
    notes: [],
    totalBeats: 0,
  }));
}

export default function App() {
  const [measures, setMeasures] = useState<Measure[]>(createInitial8Measures);
  const [activeNoteValue, setActiveNoteValue] = useState<NoteValue>('quarter');
  const [selectedMeasureIdx, setSelectedMeasureIdx] = useState<number>(0);
  const [bpm, setBpm] = useState<number>(72);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => audioManager.getMuted());
  const [studentId, setStudentId] = useState<string>(() => {
    return localStorage.getItem('music_eval_student_id') || '';
  });
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem('music_eval_student_name') || '';
  });
  const [highlightedNote, setHighlightedNote] = useState<{
    measureIdx: number;
    noteIdx: number | null;
  } | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  const handleStudentIdChange = (val: string) => {
    setStudentId(val);
    localStorage.setItem('music_eval_student_id', val);
  };

  const handleStudentNameChange = (val: string) => {
    setStudentName(val);
    localStorage.setItem('music_eval_student_name', val);
  };

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const next = audioManager.toggleMute();
    setIsMuted(next);
  }, []);

  // Total notes count across all 8 measures
  const totalNotesCount = measures.reduce((acc, m) => acc + m.notes.length, 0);

  // Completed measures count (measures with 4 beats)
  const completedMeasuresCount = measures.filter((m) => m.totalBeats === 4).length;

  // Add note to a specific measure
  const handleAddNote = useCallback(
    (measureIdx: number, pitch: string, value: NoteValue) => {
      setMeasures((prev) => {
        return prev.map((measure, mIdx) => {
          if (mIdx !== measureIdx) return measure;

          const incomingDuration = value === 'quarter' ? 1 : 2;

          // Check if adding exceeds 4 beats
          if (measure.totalBeats + incomingDuration > 4) {
            audioManager.playClick(false);
            return measure;
          }

          const newNote: NoteItem = {
            id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            pitch,
            value,
            durationBeats: incomingDuration,
          };

          const updatedNotes = [...measure.notes, newNote];
          const updatedBeats = updatedNotes.reduce((sum, n) => sum + n.durationBeats, 0);

          // If current measure hits 4 beats, advance selection to next measure automatically
          if (updatedBeats === 4 && mIdx < prev.length - 1) {
            setSelectedMeasureIdx(mIdx + 1);
          }

          return {
            ...measure,
            notes: updatedNotes,
            totalBeats: updatedBeats,
          };
        });
      });
    },
    []
  );

  // Delete specific note from measure
  const handleDeleteNote = useCallback((measureIdx: number, noteIndex: number) => {
    setMeasures((prev) => {
      return prev.map((measure, mIdx) => {
        if (mIdx !== measureIdx) return measure;
        const updatedNotes = measure.notes.filter((_, nIdx) => nIdx !== noteIndex);
        return {
          ...measure,
          notes: updatedNotes,
          totalBeats: updatedNotes.reduce((sum, n) => sum + n.durationBeats, 0),
        };
      });
    });
  }, []);

  // Delete last note in the active or most recently edited measure
  const handleDeleteLastNote = useCallback(() => {
    setMeasures((prev) => {
      let targetIdx = selectedMeasureIdx;
      if (prev[targetIdx]?.notes.length === 0) {
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].notes.length > 0) {
            targetIdx = i;
            break;
          }
        }
      }

      if (prev[targetIdx]?.notes.length === 0) return prev;

      return prev.map((measure, mIdx) => {
        if (mIdx !== targetIdx) return measure;
        const updatedNotes = measure.notes.slice(0, -1);
        return {
          ...measure,
          notes: updatedNotes,
          totalBeats: updatedNotes.reduce((sum, n) => sum + n.durationBeats, 0),
        };
      });
    });
  }, [selectedMeasureIdx]);

  // Clear single measure
  const handleClearMeasure = useCallback((measureIdx: number) => {
    setMeasures((prev) =>
      prev.map((m, idx) => (idx === measureIdx ? { ...m, notes: [], totalBeats: 0 } : m))
    );
  }, []);

  // Reset entire score
  const handleResetScore = useCallback(() => {
    audioManager.stop();
    setIsPlaying(false);
    setHighlightedNote(null);
    setMeasures(createInitial8Measures());
    setSelectedMeasureIdx(0);
  }, []);

  // Play entire 8 measures
  const handlePlayAll = useCallback(() => {
    if (totalNotesCount === 0) return;
    setIsPlaying(true);

    audioManager.playMelody(measures, bpm, {
      withCountIn: true,
      onHighlight: (mIdx, nIdx) => {
        setHighlightedNote({ measureIdx: mIdx, noteIdx: nIdx });
      },
      onComplete: () => {
        setIsPlaying(false);
        setHighlightedNote(null);
      },
    });
  }, [measures, bpm, totalNotesCount]);

  // Play a specific measure by index (e.g. from measure speaker icon)
  const handlePlayMeasure = useCallback(
    (measureIndex: number) => {
      setSelectedMeasureIdx(measureIndex);
      const mNotes = measures[measureIndex]?.notes || [];
      if (mNotes.length === 0) {
        audioManager.playClick(false);
        return;
      }
      setIsPlaying(true);
      audioManager.playMelody(measures, bpm, {
        measureIndex,
        withCountIn: false,
        onHighlight: (mIdx, nIdx) => {
          setHighlightedNote({ measureIdx: mIdx, noteIdx: nIdx });
        },
        onComplete: () => {
          setIsPlaying(false);
          setHighlightedNote(null);
        },
      });
    },
    [measures, bpm]
  );

  // Stop playback
  const handleStop = useCallback(() => {
    audioManager.stop();
    setIsPlaying(false);
    setHighlightedNote(null);
  }, []);

  // Print sheet music
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Save score as PNG image file
  const handleSaveImage = useCallback(() => {
    const svgElement = document.getElementById('music-sheet-svg') as unknown as SVGSVGElement | null;
    if (!svgElement) return;

    try {
      // Clone svg to manipulate without affecting DOM
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      
      // CRITICAL: Remove all interactive note delete buttons (the red 'x' circles)
      clonedSvg.querySelectorAll('.note-delete-btn, [data-export-ignore="true"]').forEach((el) => el.remove());
      // Remove interactive measure click rects
      clonedSvg.querySelectorAll('.interactive-rect').forEach((el) => el.remove());
      // Remove phantom preview note and active audio playing aura
      clonedSvg.querySelectorAll('.phantom-note, .audio-highlight-circle').forEach((el) => el.remove());

      // Ensure dimensions are specified
      const width = 990;
      const height = 430;
      clonedSvg.setAttribute('width', `${width}`);
      clonedSvg.setAttribute('height', `${height}`);

      // Serialize SVG
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clonedSvg);

      if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
        svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = window.URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const scale = 2; // High-resolution retina scale
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw SVG image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to PNG and download
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        
        // Use student ID as filename as requested: "파일명을 학번으로해줘"
        const trimmedId = studentId.trim();
        const sanitizedId = trimmedId.replace(/[\\/:*?"<>|]/g, '');
        let filename = '';
        if (sanitizedId) {
          filename = `${sanitizedId}.png`;
        } else if (studentName.trim()) {
          filename = `${studentName.trim().replace(/[\\/:*?"<>|]/g, '')}.png`;
        } else {
          filename = `다장조_8마디_청음악보.png`;
        }

        downloadLink.download = filename;
        downloadLink.href = pngUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        window.URL.revokeObjectURL(blobURL);

        // Show feedback notification
        setSaveSuccessNotice(
          sanitizedId
            ? `악보가 "${filename}" 파일로 저장되었습니다!`
            : '악보가 그림파일(PNG)로 저장되었습니다! (학번을 입력하시면 파일명이 학번으로 저장됩니다)'
        );
        setTimeout(() => {
          setSaveSuccessNotice(null);
        }, 3500);
      };

      img.src = blobURL;
    } catch (err) {
      console.error('Image save error:', err);
    }
  }, [studentId, studentName]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '1') {
        setActiveNoteValue('quarter');
      } else if (e.key === '2') {
        setActiveNoteValue('half');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteLastNote();
      } else if (e.key === ' ') {
        e.preventDefault();
        if (isPlaying) {
          handleStop();
        } else {
          handlePlayAll();
        }
      } else if (e.key === 'ArrowRight') {
        setSelectedMeasureIdx((prev) => Math.min(7, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setSelectedMeasureIdx((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleDeleteLastNote, handlePlayAll, handleStop]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        onPrint={handlePrint}
        onResetScore={handleResetScore}
        onSaveImage={handleSaveImage}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Sheet Music Work Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 flex flex-col gap-4">
        {/* Printable Score Header (Only visible on paper print) */}
        <div className="hidden print:block mb-6 text-center border-b-2 border-slate-900 pb-4">
          <h1 className="text-2xl font-bold font-serif text-slate-950">청음 수행 평가</h1>
          <div className="flex justify-between items-center text-xs text-slate-700 mt-3 px-2 font-medium">
            <span>학번: {studentId || '___________________'}</span>
            <span>이름: {studentName || '___________________'}</span>
            <span>4/4 박자 • 다장조 (C Major)</span>
            <span>날짜: 202____. ____. ____</span>
          </div>
        </div>

        {/* Student Info Input Section (학번 및 이름 입력) */}
        <div className="bg-[#1E293B] rounded-2xl border border-slate-800 p-3.5 sm:p-4 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-100 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>학생(수험생) 정보 입력</span>
                {studentId.trim() && (
                  <span className="text-[11px] font-normal text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono">
                    저장 파일명: {studentId.trim()}.png
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                학번과 이름을 입력하면 악보 및 그림 파일(PNG)에 함께 기록되고, 파일명이 학번으로 저장됩니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <label htmlFor="student-id-input" className="text-xs font-bold text-slate-300 whitespace-nowrap">
                학번:
              </label>
              <input
                id="student-id-input"
                type="text"
                value={studentId}
                onChange={(e) => handleStudentIdChange(e.target.value)}
                placeholder="예: 10412"
                className="w-full sm:w-32 bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono font-bold focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <label htmlFor="student-name-input" className="text-xs font-bold text-slate-300 whitespace-nowrap">
                이름:
              </label>
              <input
                id="student-name-input"
                type="text"
                value={studentName}
                onChange={(e) => handleStudentNameChange(e.target.value)}
                placeholder="예: 홍길동"
                className="w-full sm:w-32 bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-bold focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Note Palette & Playback Toolbar */}
        <ScoreToolbar
          activeNoteValue={activeNoteValue}
          onChangeNoteValue={setActiveNoteValue}
          isPlaying={isPlaying}
          onPlayAll={handlePlayAll}
          onStop={handleStop}
          onDeleteLastNote={handleDeleteLastNote}
          bpm={bpm}
          onChangeBpm={setBpm}
          totalNotesCount={totalNotesCount}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />

        {/* 8-Measure Staff Canvas (4 Measures on Top, 4 Measures on Bottom) */}
        <StaffCanvas
          measures={measures}
          activeNoteValue={activeNoteValue}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onClearMeasure={handleClearMeasure}
          onPlayMeasure={handlePlayMeasure}
          highlightedNote={highlightedNote}
          selectedMeasureIdx={selectedMeasureIdx}
          onSelectMeasure={setSelectedMeasureIdx}
          title="다장조 8마디 청음 악보"
          studentId={studentId}
          studentName={studentName}
        />

        {/* Status & Guide Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden">
          {/* Progress Card */}
          <div className="bg-[#1E293B] rounded-xl border border-slate-800 p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400">마디 완성 현황</div>
              <div className="text-sm font-bold text-slate-100">
                {completedMeasuresCount} / 8마디 완성{' '}
                <span className="text-xs font-normal text-slate-400">
                  (전체 음표 {totalNotesCount}개)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-[#1E293B] rounded-xl border border-slate-800 p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-sky-300">키보드 단축키:</span>
              <div className="flex flex-wrap gap-1.5 mt-0.5 text-[11px] text-slate-400">
                <span>[1] 4분음표</span>
                <span>•</span>
                <span>[2] 2분음표</span>
                <span>•</span>
                <span>[Backspace] 지우기</span>
                <span>•</span>
                <span>[Space] 재생</span>
              </div>
            </div>
          </div>

          {/* Measure Rule Hint */}
          <div className="bg-[#1E293B] rounded-xl border border-slate-800 p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-emerald-300">소리 및 저장 안내:</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                처음에는 소리가 꺼져 있습니다. 상단 또는 툴바의 스피커(🔊) 아이콘을 눌러 [소리 ON]으로 켜면 음표 입력 시 소리를 들을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Save Notice Toast */}
      {saveSuccessNotice && (
        <div
          id="save-success-toast"
          className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border border-emerald-400 animate-bounce"
        >
          <Check className="w-5 h-5 text-emerald-200" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-3 text-center text-xs text-slate-500 print:hidden">
        다장조 8마디 청음 악보 작업기 • 위 4마디 • 아래 4마디
      </footer>
    </div>
  );
}
