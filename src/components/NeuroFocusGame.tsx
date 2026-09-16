import React, { useState, useEffect, useRef } from 'react';
import { Target, Trophy, RotateCcw, Zap, Sparkles, Check, X } from 'lucide-react';
import { FocusStats } from '../types';
import { soundFx } from '../services/audioService';

interface NeuroFocusGameProps {
  stats: FocusStats;
  onUpdateStats: (newStats: FocusStats) => void;
}

interface WordColorPair {
  wordText: string;
  displayColor: string;
  colorName: string;
  isMatch: boolean;
}

const COLORS = [
  { name: 'أزرق نيون', code: '#00f0ff', hexClass: 'text-cyan-400' },
  { name: 'أحمر نيون', code: '#ff0055', hexClass: 'text-rose-500' },
  { name: 'أخضر نيون', code: '#00ff88', hexClass: 'text-emerald-400' },
  { name: 'أصفر نيون', code: '#ffdd00', hexClass: 'text-amber-300' },
  { name: 'بنفسجي', code: '#c084fc', hexClass: 'text-purple-400' },
];

export const NeuroFocusGame: React.FC<NeuroFocusGameProps> = ({ stats, onUpdateStats }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [currentPair, setCurrentPair] = useState<WordColorPair | null>(null);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const generateNextQuestion = () => {
    const isMatch = Math.random() > 0.5;
    const chosenColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    let wordText = '';
    if (isMatch) {
      wordText = chosenColor.name;
    } else {
      const otherColors = COLORS.filter(c => c.name !== chosenColor.name);
      wordText = otherColors[Math.floor(Math.random() * otherColors.length)].name;
    }

    setCurrentPair({
      wordText,
      displayColor: chosenColor.code,
      colorName: chosenColor.name,
      isMatch,
    });
  };

  const startGame = () => {
    soundFx.playClick();
    setIsPlaying(true);
    setTimeLeft(25);
    setScore(0);
    setCorrectCount(0);
    setTotalAnswered(0);
    setLastResult(null);
    generateNextQuestion();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    soundFx.playSuccess();

    setScore(currentScore => {
      const finalAccuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
      onUpdateStats({
        highScore: Math.max(stats.highScore, currentScore),
        bestAccuracy: Math.max(stats.bestAccuracy, finalAccuracy),
        gamesPlayed: stats.gamesPlayed + 1,
      });
      return currentScore;
    });
  };

  const handleAnswer = (userSaidMatch: boolean) => {
    if (!isPlaying || !currentPair) return;

    const isCorrect = userSaidMatch === currentPair.isMatch;
    setTotalAnswered(prev => prev + 1);

    if (isCorrect) {
      soundFx.playBeep(750, 0.08, 'sine');
      setScore(prev => prev + 100);
      setCorrectCount(prev => prev + 1);
      setLastResult('correct');
    } else {
      soundFx.playError();
      setScore(prev => Math.max(0, prev - 50));
      setLastResult('wrong');
    }

    generateNextQuestion();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0a1e24]/90 to-slate-900/90 border border-cyan-500/20 shadow-[0_0_25px_rgba(0,240,255,0.08)]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
            <Target className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>NEURO STROOP CHALLENGE • اختبار مرونة التركيز</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            تحدي التركيز المعرفي وسرعة التمييز
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            هل يتطابق <span className="text-cyan-300 font-bold">لون النص المكتوب</span> مع <span className="text-pink-400 font-bold">معنى الكلمة</span>؟ اتخذ قرارك بأقصى سرعة ممكنة خلال 25 ثانية!
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 border border-cyan-500/40 p-3.5 rounded-xl glow-cyan">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 text-cyan-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="text-right font-mono">
            <span className="text-[11px] text-slate-400 block font-sans">أعلى نتيجة تركيز</span>
            <div className="text-2xl font-black text-cyan-300">
              {stats.highScore} <span className="text-xs font-sans text-slate-400">نقطة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Focus Arena */}
      <div className="relative min-h-[380px] rounded-3xl bg-[#060b17] border-2 border-slate-800 p-6 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
        <div className="laser-scanner" />

        {!isPlaying ? (
          <div className="text-center space-y-4 max-w-md relative z-10">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              <Target className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white">اختبار ستروب المعرفي السريع</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              يقيس هذا الاختبار قدرة دماغك على كبح الاستجابة التلقائية للكلمات والتركيز على الخصائص البصرية السريعة.
            </p>
            <button
              id="btn-start-focus"
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-base shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all transform hover:scale-105"
            >
              بدء جولة التركيز (25 ثانية)
            </button>
          </div>
        ) : (
          <div className="w-full max-w-lg space-y-8 relative z-10 text-center">
            {/* Timer & Live Score Bar */}
            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-sm">
              <span className="text-slate-400 flex items-center gap-1.5">
                الوقت المتبقي:
                <span className={`text-lg font-black ${timeLeft <= 5 ? 'text-rose-400 animate-ping' : 'text-cyan-300'}`}>
                  {timeLeft}s
                </span>
              </span>
              <span className="text-emerald-400 font-bold">
                النقاط: {score}
              </span>
            </div>

            {/* Stimulus Word */}
            {currentPair && (
              <div className="py-8 px-6 rounded-2xl bg-slate-950/70 border border-cyan-500/20 shadow-inner">
                <div className="text-xs text-slate-500 mb-2">هل لون الخط يطابق معنى الكلمة؟</div>
                <div
                  className="text-5xl sm:text-6xl font-black tracking-wider transition-transform duration-100 transform active:scale-95"
                  style={{
                    color: currentPair.displayColor,
                    textShadow: `0 0 25px ${currentPair.displayColor}aa`,
                  }}
                >
                  {currentPair.wordText}
                </div>
              </div>
            )}

            {/* Decision Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                id="btn-focus-match"
                onClick={() => handleAnswer(true)}
                onMouseEnter={() => soundFx.playHover()}
                className="py-4 rounded-xl bg-emerald-950/80 border-2 border-emerald-500 hover:bg-emerald-900/90 text-emerald-200 hover:text-white font-black text-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,136,0.3)] active:scale-95 transition-all"
              >
                <Check className="w-6 h-6 text-emerald-400" />
                <span>نعم، متطابقان</span>
              </button>

              <button
                id="btn-focus-mismatch"
                onClick={() => handleAnswer(false)}
                onMouseEnter={() => soundFx.playHover()}
                className="py-4 rounded-xl bg-rose-950/80 border-2 border-rose-500 hover:bg-rose-900/90 text-rose-200 hover:text-white font-black text-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-95 transition-all"
              >
                <X className="w-6 h-6 text-rose-400" />
                <span>لا، غير متطابقين</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
