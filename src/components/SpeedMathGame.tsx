import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Calculator, 
  Trophy, 
  RotateCcw, 
  Zap, 
  Flame, 
  Sparkles, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  Award,
  TrendingUp,
  Brain,
  Hash
} from 'lucide-react';
import { MathStats } from '../types';
import { soundFx } from '../services/audioService';

interface SpeedMathGameProps {
  stats: MathStats;
  onUpdateStats: (newStats: MathStats) => void;
}

type GameMode = 'blitz' | 'true_false' | 'missing';

interface MathQuestion {
  promptText: string;
  correctAnswer: number | boolean;
  options: (number | boolean)[];
  displayType: 'multiple_choice' | 'true_false';
}

export const SpeedMathGame: React.FC<SpeedMathGameProps> = ({ stats, onUpdateStats }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>('blitz');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreakInGame, setMaxStreakInGame] = useState<number>(0);
  const [totalAttempted, setTotalAttempted] = useState<number>(0);
  const [totalCorrect, setTotalCorrect] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [flashFeedback, setFlashFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate varied arithmetic equations based on mode & current score
  const generateQuestion = useCallback((mode: GameMode, currentScore: number): MathQuestion => {
    // Difficulty tier scales with score
    const difficultyLevel = Math.min(4, Math.floor(currentScore / 250) + 1);

    if (mode === 'true_false') {
      // Flash True/False mode
      const ops = ['+', '-', '×'];
      const op = ops[Math.floor(Math.random() * (difficultyLevel > 1 ? 3 : 2))];
      let a = 0, b = 0, realAnswer = 0;

      if (op === '+') {
        a = Math.floor(Math.random() * (20 * difficultyLevel)) + 8;
        b = Math.floor(Math.random() * (20 * difficultyLevel)) + 8;
        realAnswer = a + b;
      } else if (op === '-') {
        a = Math.floor(Math.random() * (30 * difficultyLevel)) + 15;
        b = Math.floor(Math.random() * (a - 5)) + 5;
        realAnswer = a - b;
      } else {
        a = Math.floor(Math.random() * 10) + 3;
        b = Math.floor(Math.random() * 10) + 3;
        realAnswer = a * b;
      }

      const isTruth = Math.random() > 0.5;
      const displayedAnswer = isTruth 
        ? realAnswer 
        : realAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);

      return {
        promptText: `${a} ${op} ${b} = ${displayedAnswer}`,
        correctAnswer: isTruth,
        options: [true, false],
        displayType: 'true_false',
      };
    }

    if (mode === 'missing') {
      // Missing number puzzle: e.g. ? + 18 = 45 or 8 × ? = 72
      const ops = ['+', '-', '×'];
      const op = ops[Math.floor(Math.random() * (difficultyLevel > 1 ? 3 : 2))];
      let a = 0, b = 0, answer = 0;

      if (op === '+') {
        a = Math.floor(Math.random() * 35) + 12;
        b = Math.floor(Math.random() * 35) + 12;
        answer = a; // ? is a
        const prompt = `? + ${b} = ${a + b}`;
        return createMultipleChoice(prompt, answer);
      } else if (op === '-') {
        a = Math.floor(Math.random() * 50) + 25;
        b = Math.floor(Math.random() * (a - 10)) + 8;
        answer = b; // ? is b
        const prompt = `${a} - ? = ${a - b}`;
        return createMultipleChoice(prompt, answer);
      } else {
        const factors = [3, 4, 6, 7, 8, 9, 11, 12];
        a = factors[Math.floor(Math.random() * factors.length)];
        b = Math.floor(Math.random() * 9) + 2;
        answer = a;
        const prompt = `? × ${b} = ${a * b}`;
        return createMultipleChoice(prompt, answer);
      }
    }

    // Default Blitz Mode: rapid arithmetic
    if (difficultyLevel === 1) {
      // Simple addition / subtraction
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        const a = Math.floor(Math.random() * 35) + 8;
        const b = Math.floor(Math.random() * 35) + 8;
        return createMultipleChoice(`${a} + ${b}`, a + b);
      } else {
        const a = Math.floor(Math.random() * 50) + 20;
        const b = Math.floor(Math.random() * (a - 8)) + 5;
        return createMultipleChoice(`${a} - ${b}`, a - b);
      }
    } else if (difficultyLevel === 2) {
      // Multiplication / Division
      const isMult = Math.random() > 0.4;
      if (isMult) {
        const a = Math.floor(Math.random() * 11) + 3;
        const b = Math.floor(Math.random() * 11) + 3;
        return createMultipleChoice(`${a} × ${b}`, a * b);
      } else {
        const divisor = Math.floor(Math.random() * 9) + 2;
        const quotient = Math.floor(Math.random() * 12) + 2;
        return createMultipleChoice(`${divisor * quotient} ÷ ${divisor}`, quotient);
      }
    } else {
      // Complex / Two-step mental math
      const a = Math.floor(Math.random() * 9) + 3;
      const b = Math.floor(Math.random() * 8) + 2;
      const c = Math.floor(Math.random() * 20) + 5;
      const isAddBonus = Math.random() > 0.5;
      const result = isAddBonus ? (a * b) + c : (a * b) - c;
      const opSign = isAddBonus ? '+' : '-';
      return createMultipleChoice(`(${a} × ${b}) ${opSign} ${c}`, result);
    }
  }, []);

  const createMultipleChoice = (prompt: string, correct: number): MathQuestion => {
    const offsets = [-10, -5, -2, -1, 1, 2, 3, 5, 10];
    const choices = new Set<number>([correct]);

    while (choices.size < 4) {
      const offset = offsets[Math.floor(Math.random() * offsets.length)];
      const candidate = correct + offset;
      if (candidate >= 0 && candidate !== correct) {
        choices.add(candidate);
      }
    }

    const shuffled = Array.from(choices).sort(() => Math.random() - 0.5);
    return {
      promptText: prompt,
      correctAnswer: correct,
      options: shuffled,
      displayType: 'multiple_choice',
    };
  };

  // Keyboard shortcut listener (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || !currentQuestion) return;

      if (currentQuestion.displayType === 'true_false') {
        if (e.key === 't' || e.key === 'T' || e.key === '1') {
          handleAnswer(true);
        } else if (e.key === 'f' || e.key === 'F' || e.key === '2') {
          handleAnswer(false);
        }
      } else {
        const keyNum = parseInt(e.key, 10);
        if (keyNum >= 1 && keyNum <= 4) {
          const selectedOption = currentQuestion.options[keyNum - 1];
          if (selectedOption !== undefined) {
            handleAnswer(selectedOption);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentQuestion]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startGame = () => {
    soundFx.playClick();
    setIsPlaying(true);
    setGameOver(false);
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setMaxStreakInGame(0);
    setTotalAttempted(0);
    setTotalCorrect(0);
    setFlashFeedback(null);

    const firstQ = generateQuestion(gameMode, 0);
    setCurrentQuestion(firstQ);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeExpired = () => {
    setIsPlaying(false);
    setGameOver(true);
    soundFx.playLevelUp();
  };

  // Update stats upon game over
  useEffect(() => {
    if (gameOver) {
      const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
      onUpdateStats({
        highScore: Math.max(stats.highScore, score),
        maxStreak: Math.max(stats.maxStreak, maxStreakInGame),
        totalSolved: stats.totalSolved + totalCorrect,
        gamesPlayed: stats.gamesPlayed + 1,
        bestAccuracy: Math.max(stats.bestAccuracy, accuracy),
      });
    }
  }, [gameOver]);

  const handleAnswer = (chosen: number | boolean) => {
    if (!isPlaying || !currentQuestion) return;

    setTotalAttempted(prev => prev + 1);
    const isCorrect = chosen === currentQuestion.correctAnswer;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreakInGame(prev => Math.max(prev, newStreak));
      setTotalCorrect(prev => prev + 1);

      // Multiplier based on combo streak
      const multiplier = newStreak >= 10 ? 2.5 : newStreak >= 5 ? 1.8 : newStreak >= 3 ? 1.4 : 1.0;
      const points = Math.round(100 * multiplier);
      const newScore = score + points;
      setScore(newScore);

      // Pitch escalates with streak
      soundFx.playBeep(440 + Math.min(newStreak * 40, 600), 0.08, 'triangle');
      setFlashFeedback('correct');

      // Add 1 second bonus time for long streaks
      if (newStreak % 5 === 0) {
        setTimeLeft(prev => Math.min(75, prev + 2));
      }

      setTimeout(() => setFlashFeedback(null), 250);
      setCurrentQuestion(generateQuestion(gameMode, newScore));
    } else {
      soundFx.playError();
      setStreak(0);
      setFlashFeedback('wrong');
      setTimeout(() => setFlashFeedback(null), 300);
      setCurrentQuestion(generateQuestion(gameMode, score));
    }
  };

  // Cognitive math tier assessment
  const getMathTier = (high: number) => {
    if (high >= 2500) {
      return {
        title: 'رتبة المعالج الكمومي (QUANTUM CALCULATOR)',
        badge: '⚡ حاسوب بشري فائق',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/60',
        desc: 'سرعة معالجة رقمية خارقة! عقلك يقوم بالعمليات الحسابية بدون أي تأخير إدراكي.',
      };
    } else if (high >= 1600) {
      return {
        title: 'رتبة عبقري الرياضيات الذهنية (MATH GENIUS)',
        badge: '🚀 استجابة عددية حادة',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60',
        desc: 'مرونة حسابية مذهلة وتركيز عالي تحت ضغط الوقت بدقة استثنائية.',
      };
    } else if (high >= 900) {
      return {
        title: 'مستوى التفكير السريع (SPEED LOGIC)',
        badge: '🎯 سرعة ممتازة',
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/60',
        desc: 'أداء يفوق المتوسط البشري، استجابة سريعة لجدول الضرب والجمع المركب.',
      };
    } else {
      return {
        title: 'مستوى التدريب والنشاط (DEVELOPING)',
        badge: '🌱 تنشيط المسارات العصبية',
        color: 'text-slate-300 border-slate-700 bg-slate-900/60',
        desc: 'تدرب يومياً لمدة 3 دقائق لتعزيز سرعة الاسترجاع التلقائي للأرقام.',
      };
    }
  };

  const currentTier = getMathTier(stats.highScore || score);
  const accuracyPercent = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 100;

  return (
    <div id="game-speed-math" className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Header Info & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <Calculator className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              الحساب الذهني العصبي الخاطف (Speed Neuro Math)
            </h2>
            <p className="text-xs text-slate-400">
              حل أكبر عدد من المعادلات الحسابية السريعة بدقة لتعزيز قوة وسرعة التفكير!
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs sm:text-sm">
          
          {/* Timer Clock */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            timeLeft <= 10 && isPlaying
              ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-950/80 border-slate-800 text-cyan-300'
          }`}>
            <Timer className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">{timeLeft}s</span>
          </div>

          {/* Score */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 font-bold">{score}</span>
          </div>

          {/* Streak Combo */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
            streak >= 5 
              ? 'bg-amber-950/60 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(255,170,0,0.3)]'
              : 'bg-slate-950/80 border-slate-800 text-slate-400'
          }`}>
            <Flame className={`w-4 h-4 ${streak >= 3 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
            <span className="font-bold">{streak}x</span>
          </div>

        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">نمط التحدي:</span>
          <button
            onClick={() => {
              if (!isPlaying) {
                soundFx.playClick();
                setGameMode('blitz');
              }
            }}
            disabled={isPlaying}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              gameMode === 'blitz'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ السرعة القصوى (60s Blitz)
          </button>
          <button
            onClick={() => {
              if (!isPlaying) {
                soundFx.playClick();
                setGameMode('true_false');
              }
            }}
            disabled={isPlaying}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              gameMode === 'true_false'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ✓/✕ صحيح أم خاطئ خاطف
          </button>
          <button
            onClick={() => {
              if (!isPlaying) {
                soundFx.playClick();
                setGameMode('missing');
              }
            }}
            disabled={isPlaying}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              gameMode === 'missing'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(157,78,221,0.3)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ? لغز الرقم المفقود
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400 hidden sm:block">
          💡 يمكنك استخدام الأرقام (1, 2, 3, 4) في لوحة المفاتيح للإجابة السريعة!
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className={`relative rounded-3xl bg-slate-950/90 border transition-all duration-300 p-6 sm:p-10 min-h-[380px] flex flex-col items-center justify-center ${
        flashFeedback === 'correct'
          ? 'border-emerald-500 shadow-[0_0_40px_rgba(0,255,136,0.3)]'
          : flashFeedback === 'wrong'
          ? 'border-rose-500 shadow-[0_0_40px_rgba(255,0,85,0.3)]'
          : 'border-cyan-500/30 shadow-[0_0_35px_rgba(0,240,255,0.12)]'
      }`}>
        
        {/* IDLE SCREEN */}
        {!isPlaying && !gameOver && (
          <div className="text-center space-y-5 max-w-md py-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-500/10 border-2 border-cyan-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.3)]">
              <Hash className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                جاهز لشحن مهارات الحساب الذهني؟
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                لديك 60 ثانية لحل أكبر كمية من المسائل الرياضية التفاعلية. كل سلسلة إجابات صحيحة متتالية تمنحك مضاعف نقاط Combo إضافي!
              </p>
            </div>
            <button
              id="btn-start-speed-math"
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-[0_0_25px_rgba(0,240,255,0.5)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              بدء جولة الـ 60 ثانية ⚡
            </button>
          </div>
        )}

        {/* ACTIVE PLAYING SCREEN */}
        {isPlaying && currentQuestion && (
          <div className="w-full max-w-lg space-y-8 animate-fade-in">
            
            {/* Equation Display Box */}
            <div className="py-8 px-6 rounded-3xl bg-slate-900/90 border border-slate-700/80 text-center shadow-inner relative overflow-hidden">
              {/* Progress bar line */}
              <div 
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-1000"
                style={{ width: `${(timeLeft / 60) * 100}%` }}
              />

              <span className="text-[11px] font-mono text-slate-400 tracking-wider block mb-2">
                EQUATION • اضغط أو اختر الإجابة
              </span>

              <div className="text-4xl sm:text-5xl font-mono font-black text-white tracking-widest drop-shadow-md">
                {currentQuestion.promptText}
              </div>
            </div>

            {/* Answers Controls */}
            {currentQuestion.displayType === 'true_false' ? (
              /* True / False binary buttons */
              <div className="grid grid-cols-2 gap-4">
                <button
                  id="btn-math-true"
                  onClick={() => handleAnswer(true)}
                  className="py-5 px-4 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900/90 border-2 border-emerald-500 text-emerald-300 font-bold text-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:scale-102 active:scale-98 transition-all"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span>صحيح (True)</span>
                </button>
                <button
                  id="btn-math-false"
                  onClick={() => handleAnswer(false)}
                  className="py-5 px-4 rounded-2xl bg-rose-950/70 hover:bg-rose-900/90 border-2 border-rose-500 text-rose-300 font-bold text-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,85,0.3)] hover:scale-102 active:scale-98 transition-all"
                >
                  <XCircle className="w-6 h-6 text-rose-400" />
                  <span>خاطئ (False)</span>
                </button>
              </div>
            ) : (
              /* 4 Multiple Choice Grid */
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    id={`btn-math-option-${idx + 1}`}
                    onClick={() => handleAnswer(opt)}
                    className="relative group py-4 px-6 rounded-2xl bg-slate-900/90 hover:bg-cyan-950/80 border-2 border-slate-700 hover:border-cyan-400 text-white font-mono font-bold text-2xl flex items-center justify-between shadow-md hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-102 active:scale-98 transition-all duration-150"
                  >
                    <span className="text-xs font-sans text-slate-500 group-hover:text-cyan-400">
                      [{idx + 1}]
                    </span>
                    <span className="text-2xl sm:text-3xl text-cyan-200 group-hover:text-white">
                      {String(opt)}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-cyan-400 transition-colors" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Stats Bar */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
              <span>المحلولة: {totalCorrect} من {totalAttempted}</span>
              <span>الدقة: {accuracyPercent}%</span>
              <span>أعلى كومبو: {maxStreakInGame}x</span>
            </div>

          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameOver && (
          <div className="text-center space-y-6 max-w-md py-6 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(255,170,0,0.3)]">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                انتهت جولة الـ 60 ثانية!
              </h3>
              <p className="text-xs text-slate-300">
                نتائج تحليلك العصبي الرياضي في هذه الجولة:
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">النقاط الكلية</span>
                <span className="text-2xl font-bold text-amber-300">{score}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">المسائل الصحيحة</span>
                <span className="text-2xl font-bold text-emerald-400">{totalCorrect}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">نسبة الدقة</span>
                <span className="text-2xl font-bold text-cyan-300">{accuracyPercent}%</span>
              </div>
            </div>

            {/* Neuro Tier Badge */}
            <div className={`p-4 rounded-2xl border text-xs text-right ${currentTier.color}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white">{currentTier.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/60 border">
                  {currentTier.badge}
                </span>
              </div>
              <p className="text-[11px] opacity-90">{currentTier.desc}</p>
            </div>

            <button
              id="btn-replay-speed-math"
              onClick={startGame}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg hover:scale-102 active:scale-98 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>جولة جديدة وتحطيم الرقم القياسي</span>
            </button>
          </div>
        )}

      </div>

      {/* Historical Best Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tier Card */}
        <div className={`p-4 rounded-2xl border ${currentTier.color} md:col-span-2 flex items-center gap-4`}>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 shrink-0">
            <Brain className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm text-white">{currentTier.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
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
            أعلى رقم قياسي بالرياضيات
          </span>
          <div className="font-mono mt-2">
            <span className="text-3xl font-black text-amber-300">
              {stats.highScore || 0}
            </span>
            <span className="text-xs text-slate-400 mr-1.5">نقطة</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            أعلى كومبو متتالي: {stats.maxStreak || 0}x • المسائل المحلولة: {stats.totalSolved || 0}
          </span>
        </div>

      </div>

    </div>
  );
};
