import React, { useEffect, useRef, useState } from 'react';
import { NoteValue } from '../types';
import { autoCorrelate, findClosestPitch } from '../utils/pitchDetector';
import { audioManager } from '../utils/audio';
import { Mic, MicOff, Check, X, Sparkles, AlertCircle } from 'lucide-react';

interface MicDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote: (pitch: string, value: NoteValue) => void;
  selectedMeasureIdx: number;
  bpm: number;
}

export const MicDetectorModal: React.FC<MicDetectorModalProps> = ({
  isOpen,
  onClose,
  onAddNote,
  selectedMeasureIdx,
  bpm,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedPitch, setDetectedPitch] = useState<string | null>(null);
  const [detectedNameKo, setDetectedNameKo] = useState<string | null>(null);
  const [cents, setCents] = useState(0);
  const [volume, setVolume] = useState(0);
  const [detectedDurationSec, setDetectedDurationSec] = useState(0);
  const [autoAdd, setAutoAdd] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Pitch stability tracking
  const lastPitchRef = useRef<string | null>(null);
  const pitchStartTimeRef = useRef<number>(0);
  const currentDurationRef = useRef<number>(0);

  // Calculate classified note value based on duration
  const beatSec = 60 / bpm; // duration of 1 beat (4분음표)
  const isQuarter = currentDurationRef.current < beatSec * 1.5;
  const noteValue: NoteValue = isQuarter ? 'quarter' : 'half';

  const startListening = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      const ctx = audioManager.getAudioContext();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsListening(true);
      detectLoop();
    } catch (err) {
      console.error(err);
      setErrorMsg('마이크 접근 권한이 필요합니다. 브라우저 설정에서 마이크를 허용해주세요.');
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setDetectedPitch(null);
    setDetectedNameKo(null);
    setVolume(0);
    setDetectedDurationSec(0);
  };

  const detectLoop = () => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const buffer = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(buffer);

    // Calculate RMS volume
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const currentRms = Math.sqrt(sum / buffer.length);
    setVolume(Math.min(1, currentRms * 8));

    const freq = autoCorrelate(buffer, audioContextRef.current.sampleRate);
    const now = performance.now();

    if (freq !== -1 && currentRms > 0.02) {
      const { pitchDef, cents: pitchCents } = findClosestPitch(freq);
      if (pitchDef) {
        setCents(pitchCents);

        if (lastPitchRef.current === pitchDef.pitch) {
          // Sustained same note
          const durationSec = (now - pitchStartTimeRef.current) / 1000;
          currentDurationRef.current = durationSec;
          setDetectedDurationSec(durationSec);
        } else {
          // New pitch started
          lastPitchRef.current = pitchDef.pitch;
          pitchStartTimeRef.current = now;
          currentDurationRef.current = 0;
          setDetectedPitch(pitchDef.pitch);
          setDetectedNameKo(pitchDef.nameKo);
          setDetectedDurationSec(0);
        }
      }
    } else {
      // Silence / voice stopped
      if (lastPitchRef.current && currentDurationRef.current > 0.35) {
        // A note was finished! If autoAdd is enabled, insert it
        if (autoAdd && detectedPitch) {
          const finalVal: NoteValue = currentDurationRef.current < beatSec * 1.5 ? 'quarter' : 'half';
          onAddNote(detectedPitch, finalVal);
        }
      }
      lastPitchRef.current = null;
      currentDurationRef.current = 0;
      setDetectedDurationSec(0);
    }

    animationFrameRef.current = requestAnimationFrame(detectLoop);
  };

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualAdd = () => {
    if (!detectedPitch) return;
    onAddNote(detectedPitch, noteValue);
    audioManager.playNote(detectedPitch, noteValue === 'quarter' ? 0.6 : 1.2);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="mic-detector-modal"
        className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-2xl w-full max-w-md p-6 relative overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">음 들려주기 (마이크 피치 인식)</h3>
              <p className="text-xs text-slate-400">목소리나 악기로 음을 들려주면 악보로 변환합니다</p>
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

        {errorMsg ? (
          <div className="my-6 p-4 bg-red-950/50 border border-red-800/80 rounded-xl flex items-start gap-3 text-red-200 text-xs">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">마이크 연결 실패</p>
              <p className="mt-1">{errorMsg}</p>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center">
            {/* Listening Indicator / Volume wave */}
            <div className="relative mb-6">
              <div
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all shadow-lg ${
                  detectedPitch
                    ? 'bg-amber-500 text-slate-950 ring-8 ring-amber-500/20'
                    : 'bg-slate-800 text-slate-400 ring-4 ring-slate-800/50'
                }`}
              >
                {detectedPitch ? (
                  <>
                    <span className="text-3xl font-black tracking-tight">{detectedNameKo}</span>
                    <span className="text-xs font-mono font-bold opacity-90">{detectedPitch}</span>
                  </>
                ) : (
                  <>
                    <Mic className={`w-8 h-8 ${isListening ? 'animate-pulse text-amber-400' : ''}`} />
                    <span className="text-xs font-medium mt-1">소리를 내보세요</span>
                  </>
                )}
              </div>

              {/* Volume Ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-amber-400 pointer-events-none transition-transform duration-75"
                style={{ transform: `scale(${1 + volume * 0.4})`, opacity: volume }}
              ></div>
            </div>

            {/* Pitch Tuning Guide */}
            {detectedPitch && (
              <div className="w-full bg-[#0F172A] p-3 rounded-xl border border-slate-800 text-center mb-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>플랫 (낮음)</span>
                  <span className="font-semibold text-slate-200">
                    {Math.abs(cents) < 15 ? '정확한 음정 ✨' : cents > 0 ? `+${cents} 센트 (높음)` : `${cents} 센트 (낮음)`}
                  </span>
                  <span>샵 (높음)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 w-3 bg-amber-400 rounded-full transition-all"
                    style={{ left: `calc(50% + ${Math.max(-45, Math.min(45, cents))}% - 6px)` }}
                  ></div>
                </div>

                {/* Duration & Note Value Classification */}
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-around text-xs">
                  <div>
                    <span className="text-slate-400">지속 시간: </span>
                    <strong className="font-mono text-slate-200">{detectedDurationSec.toFixed(1)}초</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">인식된 음표: </span>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      {noteValue === 'quarter' ? '♩ 4분음표 (1박)' : '𝅗𝅥 2분음표 (2박)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Target Measure */}
            <div className="text-xs text-slate-400 mb-4">
              입력 대상: <strong className="text-amber-400 font-semibold">{selectedMeasureIdx + 1}마디</strong>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full">
              <button
                id="mic-manual-add-btn"
                type="button"
                disabled={!detectedPitch}
                onClick={handleManualAdd}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-xl transition-all shadow-xs text-sm"
              >
                <Check className="w-4 h-4" />
                악보에 추가 ({detectedPitch ? `${detectedNameKo} ${noteValue === 'quarter' ? '4분' : '2분'}` : '음 감지 대기'})
              </button>
            </div>
          </div>
        )}

        <div className="mt-2 text-center text-xs text-slate-500">
          팁: 피아노 소리나 허밍(음~)으로 맑게 소리를 내면 더 정확하게 인식됩니다.
        </div>
      </div>
    </div>
  );
};
