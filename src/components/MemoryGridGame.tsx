import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Trophy, 
  ShieldAlert, 
  Sparkles, 
  RotateCcw, 
  Flame, 
  Zap, 
  CheckCircle, 
  XCircle,
  Eye
} from 'lucide-react';
import { MemoryStats } from '../types';
import { soundFx } from '../services/audioService';

interface MemoryGridGameProps {
  stats: MemoryStats;
  onUpdateStats: (newStats: MemoryStats) => void;
}

type RoundStatus = 'IDLE' | 'FLASHING' | 'INTERACTIVE' | 'ROUND_SUCCESS' | 'GAME_OVER';

export const MemoryGridGame: React.FC<MemoryGridGameProps> = ({ stats, onUpdateStats }) => {
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [status, setStatus] = useState<RoundStatus>('IDLE');
  const [activePattern, setActivePattern] = useState<number[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [wrongTiles, setWrongTiles] = useState<number[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);

  const flashTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute grid dimensions based on level
  // Lvl 1-2: 3x3 (9 tiles)
  // Lvl 3-5: 4x4 (16 tiles)
  // Lvl 6-9: 5x5 (25 tiles)
  // Lvl 10+: 6x6 (36 tiles)
  const getGridConfig = (lvl: number) => {
    if (lvl <= 2) return { size: 3, total: 9, targets: lvl + 2 };
    if (lvl <= 5) return { size: 4, total: 16, targets: lvl + 2 };
    if (lvl <= 9) return { size: 5, total: 25, targets: lvl + 2 };
    return { size: 6, total: 36, targets: Math.min(15, lvl + 2) };
  };

  const currentConfig = getGridConfig(level);

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const startNewGame = () => {
    soundFx.playClick();
    setLevel(1);
    setScore(0);
    setLives(3);
    setStreak(0);
    setIsNewHigh(false);
    startRound(1, 0, 3, 0);
  };

  const startRound = (lvl: number, currentScore: number, currentLives: number, currentStreak: number) => {
    const config = getGridConfig(lvl);
    
    // Generate random unique pattern of targets
    const available = Array.from({ length: config.total }, (_, i) => i);
    const pattern: number[] = [];
    for (let i = 0; i < config.targets; i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      pattern.push(available.splice(randomIndex, 1)[0]);
    }

    setActivePattern(pattern);
    setSelectedTiles([]);
    setWrongTiles([]);
    setStatus('FLASHING');

    soundFx.playBeep(520, 0.1, 'sine');

    // Display pattern for duration depending on difficulty
    const flashDuration = Math.max(1000, 2400 - lvl * 100);

    flashTimerRef.current = setTimeout(() => {
      setStatus('INTERACTIVE');
      soundFx.playBeep(800, 0.08, 'sine');
    }, flashDuration);
  };

  const handleTileClick = (tileIndex: number) => {
    if (status !== 'INTERACTIVE') return;
    if (selectedTiles.includes(tileIndex) || wrongTiles.includes(tileIndex)) return;

    // Check if clicked tile is in pattern
    if (activePattern.includes(tileIndex)) {
      // Correct tile!
      soundFx.playBeep(600 + selectedTiles.length * 80, 0.08, 'triangle');
      const newSelected = [...selectedTiles, tileIndex];
      setSelectedTiles(newSelected);

      // Check if finished this round!
      if (newSelected.length === activePattern.length) {
        // Complete Round
        const roundPoints = (level * 150) + (streak * 50);
        const nextScore = score + roundPoints;
        const nextLevel = level + 1;
        const nextStreak = streak + 1;

        setScore(nextScore);
        setStreak(nextStreak);
        setStatus('ROUND_SUCCESS');
        soundFx.playLevelUp();

        // Update high-score live
        const isHigh = nextScore > stats.highScore;
        if (isHigh) {
          setIsNewHigh(true);
        }

        onUpdateStats({
          highScore: Math.max(stats.highScore, nextScore),
          highestLevel: Math.max(stats.highestLevel, nextLevel),
          gamesPlayed: stats.gamesPlayed,
          perfectRounds: wrongTiles.length === 0 ? stats.perfectRounds + 1 : stats.perfectRounds,
        });

        // Advance to next round after short delay
        setTimeout(() => {
          setLevel(nextLevel);
          startRound(nextLevel, nextScore, lives, nextStreak);
        }, 1200);
      }
    } else {
      // Wrong tile!
      soundFx.playError();
      const newWrongs = [...wrongTiles, tileIndex];
      setWrongTiles(newWrongs);
      const remainingLives = lives - 1;
      setLives(remainingLives);
      setStreak(0);

      if (remainingLives <= 0) {
        // Game Over!
        setStatus('GAME_OVER');
        onUpdateStats({
          highScore: Math.max(stats.highScore, score),
          highestLevel: Math.max(stats.highestLevel, level),
          gamesPlayed: stats.gamesPlayed + 1,
          perfectRounds: stats.perfectRounds,
        });
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#180926]/90 to-slate-900/90 border border-purple-500/30 shadow-[0_0_25px_rgba(157,78,221,0.1)]">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-widest">
            <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>VISUAL MATRIX RECALL • تحدي شبكة الذاكرة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            تحدي شبكة الذاكرة البصرية
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            احفظ مواقع المربعات النيون الساطعة قبل أن تختفي، ثم أعد الضغط عليها بدقة بالغة دون ارتكاب أي خطأ.
          </p>
        </div>

        {/* High-Score & Level Badge */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-purple-500/40 p-3.5 rounded-xl glow-magenta">
          <div className="p-2.5 rounded-lg bg-purple-950/80 text-purple-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="text-right font-mono">
            <span className="text-[11px] text-slate-400 block font-sans">أعلى نتيجة محفوظة</span>
            <div className="text-2xl font-black text-purple-300">
              {stats.highScore} <span className="text-xs font-sans text-slate-400">نقطة</span>
            </div>
            <div className="text-[10px] text-cyan-400">
              المستوى القياسي: {stats.highestLevel}
            </div>
          </div>
        </div>
      </div>

      {/* In-Game Status Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm">
        
        {/* Current Level */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">المستوى الحالي:</span>
          <span className="px-3 py-1 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 font-black font-mono text-base">
            {level}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            ({currentConfig.size}×{currentConfig.size} - {currentConfig.targets} خلايا)
          </span>
        </div>

        {/* Current Score & Streak */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs">النقاط:</span>
            <span className="font-mono font-bold text-cyan-300 text-lg">
              {score}
            </span>
          </div>

          {streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>كومبو ×{streak}</span>
            </div>
          )}
        </div>

        {/* Neural Shields (Lives) */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">الدروع العصبية:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heart) => (
              <span
                key={heart}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  heart <= lives
                    ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] scale-100'
                    : 'bg-slate-800 border border-slate-700 scale-75 opacity-40'
                }`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Main Grid Area */}
      <div className="relative min-h-[420px] rounded-3xl bg-[#080d1e] border-2 border-slate-800 p-6 sm:p-8 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Cyber grid background */}
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
        <div className="laser-scanner" />

        {/* Start Game Screen */}
        {status === 'IDLE' && (
          <div className="text-center space-y-5 max-w-md relative z-10">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_25px_rgba(157,78,221,0.4)]">
              <Eye className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white">
              جاهز لتمرين الذاكرة البصرية النيون؟
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              ستومض شبكة من المربعات بالأزرق النيون الساطع لفترة وجيزة. مهمتك هي تذكر مواقعها وإعادة الضغط عليها بالكامل.
            </p>
            <button
              id="btn-start-memory"
              onClick={startNewGame}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-base shadow-[0_0_20px_rgba(157,78,221,0.5)] transition-all transform hover:scale-105"
            >
              بدء التحدي الآن
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {status === 'GAME_OVER' && (
          <div className="text-center space-y-5 max-w-md relative z-10">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-rose-950/80 border border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.5)]">
              <ShieldAlert className="w-10 h-10" />
            </div>

            {isNewHigh && (
              <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-950/80 border border-amber-400 text-amber-300 text-xs font-bold animate-bounce">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>رقم قياسي جديد! تم حفظ أعلى نتيجة محلياً</span>
              </div>
            )}

            <h3 className="text-3xl font-black text-rose-400">
              استُنفدت الدروع العصبية!
            </h3>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">المستوى المحقق:</span>
                <span className="font-mono font-bold text-purple-300">{level}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">النتيجة النهائية:</span>
                <span className="font-mono font-bold text-cyan-300 text-lg">{score} نقطة</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-800 pt-2">
                <span className="text-slate-400">أعلى نتيجة لك على هذا الجهاز:</span>
                <span className="font-mono font-bold text-emerald-400">{Math.max(stats.highScore, score)} نقطة</span>
              </div>
            </div>

            <button
              id="btn-restart-memory"
              onClick={startNewGame}
              className="px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2 mx-auto transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة المحاولة والتحدي</span>
            </button>
          </div>
        )}

        {/* Active Grid Gameplay */}
        {(status === 'FLASHING' || status === 'INTERACTIVE' || status === 'ROUND_SUCCESS') && (
          <div className="flex flex-col items-center space-y-5 relative z-10 w-full">
            
            {/* Status Guide Text */}
            <div className="text-center font-bold text-sm sm:text-base">
              {status === 'FLASHING' && (
                <span className="text-cyan-300 flex items-center justify-center gap-2 text-glow-cyan animate-pulse">
                  <Eye className="w-4 h-4" />
                  احفظ مواقع المربعات النيون المضيئة الآن...
                </span>
              )}
              {status === 'INTERACTIVE' && (
                <span className="text-purple-300 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  اضغط على المربعات التي ظهرت ({selectedTiles.length} / {activePattern.length})
                </span>
              )}
              {status === 'ROUND_SUCCESS' && (
                <span className="text-emerald-400 flex items-center justify-center gap-2 text-glow-emerald animate-bounce">
                  <CheckCircle className="w-5 h-5" />
                  رائع! تم تذكر النمط بنجاح، جاري الانتقال للمستوى التالي...
                </span>
              )}
            </div>

            {/* Grid Container */}
            <div
              className="grid gap-2.5 sm:gap-3.5 p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/20 shadow-[0_0_30px_rgba(0,240,255,0.1)] transition-all"
              style={{
                gridTemplateColumns: `repeat(${currentConfig.size}, minmax(0, 1fr))`,
                width: currentConfig.size === 3 ? '270px' : currentConfig.size === 4 ? '340px' : currentConfig.size === 5 ? '390px' : '440px',
                maxWidth: '90vw',
              }}
            >
              {Array.from({ length: currentConfig.total }, (_, idx) => {
                const isTarget = activePattern.includes(idx);
                const isFlashing = status === 'FLASHING' && isTarget;
                const isSelectedCorrect = selectedTiles.includes(idx);
                const isWrong = wrongTiles.includes(idx);
                const isRevealedOnSuccess = status === 'ROUND_SUCCESS' && isTarget;

                let tileClass = 'bg-[#0f172a] border-slate-800 hover:border-slate-700';

                if (isFlashing) {
                  tileClass = 'bg-cyan-400 border-cyan-300 glow-cyan-lg shadow-[0_0_20px_rgba(0,240,255,0.9)] scale-95';
                } else if (isSelectedCorrect || isRevealedOnSuccess) {
                  tileClass = 'bg-emerald-500 border-emerald-300 glow-emerald shadow-[0_0_20px_rgba(0,255,136,0.8)] scale-95';
                } else if (isWrong) {
                  tileClass = 'bg-rose-600 border-rose-400 glow-magenta shadow-[0_0_20px_rgba(244,63,94,0.9)] animate-shake';
                } else if (status === 'INTERACTIVE') {
                  tileClass = 'bg-slate-900 border-cyan-900/60 hover:border-cyan-400/80 hover:bg-slate-800/90 cursor-pointer active:scale-95';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleTileClick(idx)}
                    onMouseEnter={() => {
                      if (status === 'INTERACTIVE') soundFx.playHover();
                    }}
                    disabled={status !== 'INTERACTIVE' || isSelectedCorrect || isWrong}
                    className={`aspect-square rounded-xl border transition-all duration-150 flex items-center justify-center ${tileClass}`}
                  >
                    {isSelectedCorrect && (
                      <CheckCircle className="w-5 h-5 text-white drop-shadow" />
                    )}
                    {isWrong && (
                      <XCircle className="w-5 h-5 text-white drop-shadow" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Target Count Indicator */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span>الخلايا المتبقية:</span>
              <span className="font-bold text-cyan-300">
                {activePattern.length - selectedTiles.length}
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
