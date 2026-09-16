import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  Trophy, 
  RotateCcw, 
  Zap, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Brain,
  Timer,
  ChevronRight
} from 'lucide-react';
import { ChimpStats } from '../types';
import { soundFx } from '../services/audioService';

interface ChimpMemoryGameProps {
  stats: ChimpStats;
  onUpdateStats: (newStats: ChimpStats) => void;
}

type GamePhase = 'IDLE' | 'MEMORIZE' | 'PLAYING' | 'ROUND_SUCCESS' | 'ROUND_FAILED' | 'GAME_OVER';

interface TileData {
  index: number;
  number: number | null; // 1 to N, or null for empty cell
  isRevealed: boolean;
  isCorrect: boolean;
  isWrong: boolean;
}

export const ChimpMemoryGame: React.FC<ChimpMemoryGameProps> = ({ stats, onUpdateStats }) => {
  const [phase, setPhase] = useState<GamePhase>('IDLE');
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [streak, setStreak] = useState<number>(0);
  const [nextExpectedNumber, setNextExpectedNumber] = useState<number>(1);
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [mode, setMode] = useState<'standard' | 'flash'>('standard');
  const [flashTimeRemaining, setFlashTimeRemaining] = useState<number>(0);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [lastRoundTimeMs, setLastRoundTimeMs] = useState<number | null>(null);
  const [showScienceModal, setShowScienceModal] = useState<boolean>(false);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Total grid cells: 5 columns x 5 rows = 25 cells
  const GRID_SIZE = 25;
  const flashTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Number of digits by level: Level 1 = 4 numbers, Level 2 = 5, etc. up to 11
  const getCountForLevel = (lvl: number) => {
    return Math.min(11, 3 + lvl);
  };

  const currentNumberCount = getCountForLevel(level);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearInterval(flashTimerRef.current);
    };
  }, []);

  // Generate randomized grid with numbers placed in random cells
  const spawnGrid = (numCount: number, autoMaskAfterFlash: boolean) => {
    const indices: number[] = [];
    while (indices.length < numCount) {
      const rand = Math.floor(Math.random() * GRID_SIZE);
      if (!indices.includes(rand)) {
        indices.push(rand);
      }
    }

    const newTiles: TileData[] = Array.from({ length: GRID_SIZE }, (_, i) => {
      const foundIdx = indices.indexOf(i);
      return {
        index: i,
        number: foundIdx !== -1 ? foundIdx + 1 : null,
        isRevealed: true, // Numbers visible at start
        isCorrect: false,
        isWrong: false,
      };
    });

    setTiles(newTiles);
    setNextExpectedNumber(1);
    setRoundStartTime(performance.now());

    if (autoMaskAfterFlash) {
      setPhase('MEMORIZE');
      const flashDurationMs = Math.max(800, 2200 - numCount * 120);
      setFlashTimeRemaining(Math.round(flashDurationMs / 100) / 10);

      const intervalStep = 100;
      let remaining = flashDurationMs;

      if (flashTimerRef.current) clearInterval(flashTimerRef.current);
      flashTimerRef.current = setInterval(() => {
        remaining -= intervalStep;
        setFlashTimeRemaining(Math.max(0, Math.round(remaining / 100) / 10));

        if (remaining <= 0) {
          if (flashTimerRef.current) clearInterval(flashTimerRef.current);
          maskAllTiles();
          setPhase('PLAYING');
        }
      }, intervalStep);
    } else {
      setPhase('MEMORIZE');
    }
  };

  const maskAllTiles = () => {
    setTiles(prev =>
      prev.map(t => ({
        ...t,
        isRevealed: false,
      }))
    );
  };

  const startNewGame = () => {
    soundFx.playClick();
    setLevel(1);
    setScore(0);
    setLives(3);
    setStreak(0);
    setIsNewRecord(false);
    spawnGrid(getCountForLevel(1), mode === 'flash');
  };

  const handleTileClick = (tile: TileData) => {
    if (tile.number === null || phase === 'GAME_OVER' || phase === 'ROUND_SUCCESS' || phase === 'ROUND_FAILED') {
      return;
    }

    // Standard mode: when player clicks 1, immediately mask all other numbers!
    if (mode === 'standard' && nextExpectedNumber === 1 && phase === 'MEMORIZE') {
      maskAllTiles();
      setPhase('PLAYING');
    }

    // Check if clicked the correct ascending number
    if (tile.number === nextExpectedNumber) {
      soundFx.playBeep(440 + nextExpectedNumber * 70, 0.08, 'sine');

      const nextNum = nextExpectedNumber + 1;
      setNextExpectedNumber(nextNum);

      // Reveal this tile as correct
      setTiles(prev =>
        prev.map(t =>
          t.index === tile.index
            ? { ...t, isRevealed: true, isCorrect: true }
            : t
        )
      );

      // Checked all numbers in this round!
      if (nextNum > currentNumberCount) {
        handleRoundSuccess();
      }
    } else {
      // Mistake!
      handleMistake(tile);
    }
  };

  const handleRoundSuccess = () => {
    soundFx.playSuccess();
    const roundTime = Math.round(performance.now() - roundStartTime);
    setLastRoundTimeMs(roundTime);

    const bonusPoints = currentNumberCount * 150 + Math.max(0, 1000 - Math.round(roundTime / 10));
    const newScore = score + bonusPoints;
    const newStreak = streak + 1;
    setScore(newScore);
    setStreak(newStreak);
    setPhase('ROUND_SUCCESS');

    // Update global stats
    const nextLvl = level + 1;
    const maxNumbersAchieved = Math.max(stats.maxNumbers, currentNumberCount);
    const highestLevelAchieved = Math.max(stats.highestLevel, nextLvl);
    const newBestTime = stats.bestTimeMs ? Math.min(stats.bestTimeMs, roundTime) : roundTime;

    if (maxNumbersAchieved > stats.maxNumbers || newScore > (stats.flawlessRuns * 500)) {
      setIsNewRecord(true);
    }

    onUpdateStats({
      ...stats,
      highestLevel: highestLevelAchieved,
      maxNumbers: maxNumbersAchieved,
      bestTimeMs: newBestTime,
    });

    // Auto proceed after short victory pause
    setTimeout(() => {
      setLevel(nextLvl);
      spawnGrid(getCountForLevel(nextLvl), mode === 'flash');
    }, 1200);
  };

  const handleMistake = (wrongTile: TileData) => {
    soundFx.playError();
    const newLives = lives - 1;
    setLives(newLives);
    setStreak(0);

    // Reveal all numbers to show the player the solution
    setTiles(prev =>
      prev.map(t =>
        t.index === wrongTile.index
          ? { ...t, isRevealed: true, isWrong: true }
          : { ...t, isRevealed: t.number !== null }
      )
    );

    if (newLives <= 0) {
      setPhase('GAME_OVER');
      onUpdateStats({
        ...stats,
        gamesPlayed: stats.gamesPlayed + 1,
      });
    } else {
      setPhase('ROUND_FAILED');
    }
  };

  const retryCurrentLevel = () => {
    soundFx.playClick();
    spawnGrid(currentNumberCount, mode === 'flash');
  };

  // Ayumu primate scientific rating
  const getPrimateTier = (maxNums: number) => {
    if (maxNums >= 9) {
      return {
        title: 'رتبة الشمبانزي أيومو الخارقة (AYUMU PRIMATE TIER)',
        badge: '🦍 ذاكرة فوتوغرافية استثنائية',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60',
        desc: 'أداء يفوق 99.5% من البشر! ذاكرتك اللحظية تنافس قدرات الشمبانزي أيومو الشهيرة في جامعة كيوتو.',
      };
    } else if (maxNums >= 7) {
      return {
        title: 'رتبة الذاكرة المكانية النخبوية (ELITE SPATIAL)',
        badge: '🧠 ذاكرة عمل متقدمة جداً',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/60',
        desc: 'قدرة فائقة على حفظ لقطات بصرية متعددة واسترجاعها بدقة وسرعة مذهلة.',
      };
    } else if (maxNums >= 5) {
      return {
        title: 'المعدل البشري المثالي (OPTIMAL HUMAN)',
        badge: '⚡ استجابة بصرية قوية',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/60',
        desc: 'المعدل البشري المعتاد لاختبار ميلر للذاكرة العاملة (5-7 عناصر). واصل التدريب للوصول لرتبة أيومو!',
      };
    } else {
      return {
        title: 'مستوى التدريب المبتدئ (DEVELOPING)',
        badge: '🌱 بداية واعدة',
        color: 'text-slate-300 border-slate-700 bg-slate-900/60',
        desc: 'ركز على أخذ لقطة ذهنية فورية لشكل الأرقام قبل النقر على الرقم 1.',
      };
    }
  };

  const currentTier = getPrimateTier(stats.maxNumbers || currentNumberCount);

  return (
    <div id="game-chimp-memory" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Info & High Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        
        {/* Game Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(157,78,221,0.25)]">
            <Eye className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                تحدي ذاكرة الشمبانزي (Ayumu Sequence)
              </h2>
              <button
                onClick={() => setShowScienceModal(true)}
                className="p-1 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                title="ما هي التجربة العلمية وراء هذا الاختبار؟"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              احفظ مواقع الأرقام في لمحة بصرية، ثم انقر عليها تصاعدياً بعد أن تختفي!
            </p>
          </div>
        </div>

        {/* Live Metrics: Level, Score, Lives */}
        <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs sm:text-sm">
          {/* Level & Numbers */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">المستوى:</span>
            <span className="text-purple-400 font-bold">{level}</span>
            <span className="text-[11px] text-slate-400">({currentNumberCount} أرقام)</span>
          </div>

          {/* Score */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 font-bold">{score}</span>
          </div>

          {/* Lives Shields */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
            {[1, 2, 3].map((heart) => (
              <span key={heart} className="transition-transform duration-200">
                {heart <= lives ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-500/60" />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mode Switcher & Instructions */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">النمط:</span>
          <button
            onClick={() => {
              if (phase === 'IDLE' || phase === 'GAME_OVER') {
                soundFx.playClick();
                setMode('standard');
              }
            }}
            disabled={phase !== 'IDLE' && phase !== 'GAME_OVER'}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              mode === 'standard'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            النمط القياسي (تختفي عند النقر على 1)
          </button>
          <button
            onClick={() => {
              if (phase === 'IDLE' || phase === 'GAME_OVER') {
                soundFx.playClick();
                setMode('flash');
              }
            }}
            disabled={phase !== 'IDLE' && phase !== 'GAME_OVER'}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              mode === 'flash'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ وميض أيومو الخاطف (تختفي تلقائياً)
          </button>
        </div>

        {/* Status text */}
        <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
          {mode === 'flash' && phase === 'MEMORIZE' && (
            <span className="text-cyan-400 animate-pulse font-bold flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" />
              باقي على الإخفاء: {flashTimeRemaining}s
            </span>
          )}
          {phase === 'PLAYING' && (
            <span className="text-emerald-400">
              المطلوب الآن: انقر على الرقم <strong className="text-white text-sm">[{nextExpectedNumber}]</strong>
            </span>
          )}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative rounded-3xl bg-slate-950/90 border border-purple-500/30 p-4 sm:p-8 shadow-[0_0_40px_rgba(157,78,221,0.15)] flex flex-col items-center justify-center min-h-[440px]">
        
        {/* IDLE state: Start Screen */}
        {phase === 'IDLE' && (
          <div className="text-center space-y-5 max-w-md py-8">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-500/10 border-2 border-purple-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(157,78,221,0.3)]">
              <Brain className="w-10 h-10 text-purple-400 animate-bounce" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                جاهز لاختبار الذاكرة اللحظية الفائقة؟
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                ستظهر أرقام مبعثرة داخل الشبكة. بمجرد أن تنقر على الرقم (1)، ستتحول باقي الأرقام إلى مربعات صامتة. مهمتك هي تذكر أماكنها ونقرها بالترتيب: 2، 3، 4...
              </p>
            </div>
            <button
              id="btn-start-chimp-game"
              onClick={startNewGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-base shadow-[0_0_25px_rgba(157,78,221,0.5)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              بدء الاختبار الآن ⚡
            </button>
          </div>
        )}

        {/* ACTIVE GRID */}
        {(phase === 'MEMORIZE' || phase === 'PLAYING' || phase === 'ROUND_SUCCESS' || phase === 'ROUND_FAILED') && (
          <div className="w-full max-w-lg aspect-square grid grid-cols-5 gap-2 sm:gap-3">
            {tiles.map((tile) => {
              const hasNumber = tile.number !== null;
              
              if (!hasNumber) {
                // Empty cell
                return (
                  <div 
                    key={tile.index}
                    className="rounded-2xl border border-slate-900/60 bg-slate-900/20"
                  />
                );
              }

              // Tile styling depending on phase and state
              let tileClass = 'bg-slate-900/80 border-slate-800 text-slate-400';
              let content: React.ReactNode = null;

              if (tile.isWrong) {
                // Wrong clicked tile
                tileClass = 'bg-rose-950 border-rose-500 text-rose-200 shadow-[0_0_20px_rgba(255,0,85,0.6)] animate-shake';
                content = (
                  <span className="flex flex-col items-center font-mono font-black text-xl sm:text-2xl">
                    <span>{tile.number}</span>
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  </span>
                );
              } else if (tile.isCorrect) {
                // Correctly tapped
                tileClass = 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(0,255,136,0.5)]';
                content = (
                  <span className="flex flex-col items-center font-mono font-black text-xl sm:text-2xl">
                    <span>{tile.number}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                );
              } else if (tile.isRevealed) {
                // Number visible (Memorization phase or answer reveal)
                tileClass = 'bg-purple-950/70 border-purple-400/80 text-purple-200 shadow-[0_0_15px_rgba(157,78,221,0.4)] hover:border-cyan-400';
                content = (
                  <span className="font-mono font-black text-2xl sm:text-3xl text-cyan-300">
                    {tile.number}
                  </span>
                );
              } else {
                // Masked! (The brain must recall where it was)
                tileClass = 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-600 hover:border-purple-400 text-transparent cursor-pointer active:scale-95 shadow-md hover:shadow-[0_0_15px_rgba(157,78,221,0.3)]';
                content = (
                  <div className="w-3 h-3 rounded-full bg-purple-500/30 group-hover:bg-purple-400/60" />
                );
              }

              return (
                <button
                  key={tile.index}
                  onClick={() => handleTileClick(tile)}
                  disabled={tile.isCorrect || tile.isWrong || phase === 'ROUND_SUCCESS'}
                  className={`relative rounded-2xl border-2 flex items-center justify-center transition-all duration-150 select-none ${tileClass}`}
                  aria-label={tile.number ? `Tile ${tile.number}` : 'Empty Tile'}
                >
                  {content}
                </button>
              );
            })}
          </div>
        )}

        {/* ROUND SUCCESS TOAST OVERLAY */}
        {phase === 'ROUND_SUCCESS' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 space-y-3 animate-fade-in">
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(0,255,136,0.4)]">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <h4 className="text-xl font-bold text-white">
              أحسنت! تم إتقان تسلسل {currentNumberCount} أرقام بنجاح!
            </h4>
            {lastRoundTimeMs && (
              <p className="text-xs font-mono text-cyan-300">
                زمن الاستجابة والاسترجاع: {lastRoundTimeMs} ميلي ثانية
              </p>
            )}
            <p className="text-xs text-purple-300 animate-pulse">
              جاري الانتقال للمستوى التالي وإضافة رقم إضافي...
            </p>
          </div>
        )}

        {/* ROUND FAILED (Still has lives) */}
        {phase === 'ROUND_FAILED' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 space-y-4 animate-fade-in">
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-400 text-rose-300">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h4 className="text-xl font-bold text-white mb-1">
                تسلسل غير صحيح!
              </h4>
              <p className="text-xs text-slate-300">
                تبقى لديك {lives} محاولات. شاهد مواضع الأرقام الصحيحة ثم أعد المحاولة.
              </p>
            </div>
            <button
              onClick={retryCurrentLevel}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(157,78,221,0.4)]"
            >
              إعادة تجربة هذا المستوى ⟳
            </button>
          </div>
        )}

        {/* GAME OVER MODAL */}
        {phase === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 space-y-5 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(255,170,0,0.3)]">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                انتهت الجولة المعرفية!
              </h3>
              <p className="text-sm text-slate-300">
                أقصى تسلسل أرقام تمكنت من تذكره واسترجاعه بدقة:
              </p>
            </div>

            {/* Score & sequence achieved */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">أعلى تسلسل</span>
                <span className="text-2xl font-bold text-cyan-300">{currentNumberCount} أرقام</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">النقاط الكلية</span>
                <span className="text-2xl font-bold text-amber-300">{score}</span>
              </div>
            </div>

            {/* Ayumu tier badge */}
            <div className={`p-3.5 rounded-2xl border text-xs max-w-sm ${currentTier.color}`}>
              <span className="font-bold block mb-1">{currentTier.title}</span>
              <p className="text-[11px] opacity-90">{currentTier.desc}</p>
            </div>

            <button
              id="btn-replay-chimp-game"
              onClick={startNewGame}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>جولة جديدة وتحدي الأرقام</span>
            </button>
          </div>
        )}
      </div>

      {/* Historical Best & Cognitive Tier Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tier Card */}
        <div className={`p-4 rounded-2xl border ${currentTier.color} md:col-span-2 flex items-center gap-4`}>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 shrink-0">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm text-white">{currentTier.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {currentTier.badge}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentTier.desc}
            </p>
          </div>
        </div>

        {/* Lifetime Record */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            أعلى تسلسل مسجل بحسابك
          </span>
          <div className="font-mono mt-2">
            <span className="text-3xl font-black text-cyan-300">
              {stats.maxNumbers || 4}
            </span>
            <span className="text-xs text-slate-400 mr-1.5">أرقام متتالية</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            أفضل سرعة حل: {stats.bestTimeMs ? `${stats.bestTimeMs}ms` : '--'}
          </span>
        </div>
      </div>

      {/* Scientific explanation modal */}
      {showScienceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>الأساس العلمي: تجربة الشمبانزي أيومو (Ayumu)</span>
              </h3>
              <button
                onClick={() => setShowScienceModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                في معهد أبحاث الرئيسيات بجامعة كيوتو باليابان، قاد العالم <strong>تتسورو ماتسوزاوا (Tetsuro Matsuzawa)</strong> دراسة علمية تاريخية لاختبار الذاكرة العاملة اللحظية (Eidetic Working Memory).
              </p>
              <p>
                أظهر الشمبانزي الصغير <strong>أيومو (Ayumu)</strong> قدرة خارقة على تذكر مواضع 9 أرقام مبعثرة تظهر لمدة <strong>0.2 ثانية فقط</strong> ثم تختفي بالكامل، وكان ينقر عليها بالترتيب التصاعدي الصحيح بدقة تجاوزت 90%، متفوقاً على طلاب الجامعات المتطوعين!
              </p>
              <p>
                تُظهر الأبحاث العصبية أن هذا التمرين يدرب <strong>القشرة الجبهية الحركية وشبكة الانتباه البصري-المكاني</strong>، ويساعد الإنسان على تنشيط قدرة الالتقاط الفوتوغرافي السريع للمعلومات.
              </p>
            </div>
            <button
              onClick={() => setShowScienceModal(false)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm"
            >
              فهمت الفكرة، لنبدأ التحدي!
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
