import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Trophy, 
  Clock, 
  AlertOctagon, 
  Flame, 
  ChevronLeft,
  Sparkles,
  Award,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { ReactionStats } from '../types';
import { soundFx } from '../services/audioService';

interface ReactionTimeGameProps {
  stats: ReactionStats;
  onUpdateStats: (newStats: ReactionStats) => void;
}

type GameState = 'IDLE' | 'WAITING' | 'READY' | 'EARLY' | 'RESULT';

interface TierInfo {
  title: string;
  badge: string;
  color: string;
  desc: string;
}

export const ReactionTimeGame: React.FC<ReactionTimeGameProps> = ({ stats, onUpdateStats }) => {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [currentMs, setCurrentMs] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  
  const startTimeRef = useRef<number>(0);
  const timerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timerTimeoutRef.current) {
        clearTimeout(timerTimeoutRef.current);
      }
    };
  }, []);

  const getTier = (ms: number): TierInfo => {
    if (ms < 190) {
      return {
        title: 'رتبة السايبورغ النخبوية (CYBORG TIER)',
        badge: '⚡ استجابة شبه مستحيلة',
        color: 'text-cyan-400 border-cyan-400/50 bg-cyan-950/60',
        desc: 'سرعة رد فعلك تضاهي أنظمة الذكاء الاصطناعي والطيارين المقاتلين النخبة!',
      };
    } else if (ms < 230) {
      return {
        title: 'رتبة الطيار المقاتل (JET PILOT)',
        badge: '🚀 استجابة خارقة',
        color: 'text-emerald-400 border-emerald-400/50 bg-emerald-950/60',
        desc: 'رد فعل أسرع من 95% من البشر، تركيز عصبي حاد واستثنائي.',
      };
    } else if (ms < 280) {
      return {
        title: 'رتبة اللاعب المحترف (ESPORTS PRO)',
        badge: '🎯 رد فعل ممتاز',
        color: 'text-amber-400 border-amber-400/50 bg-amber-950/60',
        desc: 'مستوى استجابة سريع ومثالي للألعاب التنافسية وسباقات السرعة.',
      };
    } else if (ms < 350) {
      return {
        title: 'المستوى البشري الطبيعي (OPTIMAL HUMAN)',
        badge: '👤 متوسط معتاد',
        color: 'text-blue-400 border-blue-400/50 bg-blue-950/60',
        desc: 'متوسط الاستجابة البشرية المعتادة (250-320 ميلي ثانية). تدرب أكثر للارتقاء!',
      };
    } else {
      return {
        title: 'مستوى الاسترخاء (RELAXED)',
        badge: '🐢 استجابة متأخرة',
        color: 'text-rose-400 border-rose-400/50 bg-rose-950/60',
        desc: 'قد تكون مرهقاً أو مشتت الانتباه. خذ نفساً عميقاً وأعد المحاولة بتركيز!',
      };
    }
  };

  const handlePadClick = () => {
    if (gameState === 'IDLE') {
      startWaitPhase();
    } else if (gameState === 'WAITING') {
      // Early false start!
      if (timerTimeoutRef.current) {
        clearTimeout(timerTimeoutRef.current);
      }
      soundFx.playError();
      setGameState('EARLY');
    } else if (gameState === 'READY') {
      // User tapped! Measure exact milliseconds
      const reactionTime = Math.round(performance.now() - startTimeRef.current);
      setCurrentMs(reactionTime);
      setGameState('RESULT');

      // Update stats
      const newHistory = [reactionTime, ...stats.history.slice(0, 19)];
      const last5 = newHistory.slice(0, 5);
      const avg5 = Math.round(last5.reduce((a, b) => a + b, 0) / last5.length);
      const isBest = stats.bestTime === null || reactionTime < stats.bestTime;

      setIsNewRecord(isBest);
      if (isBest) {
        soundFx.playSuccess();
      } else {
        soundFx.playBeep(650, 0.1, 'sine');
      }

      onUpdateStats({
        bestTime: isBest ? reactionTime : stats.bestTime,
        lastTime: reactionTime,
        history: newHistory,
        averageLast5: avg5,
        totalAttempts: stats.totalAttempts + 1,
      });
    } else if (gameState === 'EARLY' || gameState === 'RESULT') {
      startWaitPhase();
    }
  };

  const startWaitPhase = () => {
    soundFx.playClick();
    setGameState('WAITING');
    setIsNewRecord(false);
    setCurrentMs(null);

    // Random delay between 1800ms and 4800ms
    const randomDelay = Math.floor(Math.random() * 3000) + 1800;

    timerTimeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setGameState('READY');
      soundFx.playReadySignal();
    }, randomDelay);
  };

  const handleResetHistory = () => {
    soundFx.playClick();
    onUpdateStats({
      bestTime: null,
      lastTime: null,
      history: [],
      averageLast5: null,
      totalAttempts: 0,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Title & Game Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#071329]/90 to-slate-900/90 border border-cyan-500/20 shadow-[0_0_25px_rgba(0,240,255,0.08)]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>NEURAL VELOCITY TEST • الدقة المتناهية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            اختبار سرعة رد الفعل بدقة الميلي ثانية
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            اختبر سرعة انتقال الإشارات العصبية من عينك إلى إصبعك. انقر عندما يتحول المربع النيون إلى اللون الأخضر في أقصر زمن ممكن.
          </p>
        </div>

        {/* Best Score Counter Badge */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-cyan-500/40 p-3.5 rounded-xl glow-cyan">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 text-cyan-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-medium">أعلى سرعة مسجلة</span>
            <div className="text-2xl font-black font-mono text-cyan-300">
              {stats.bestTime ? `${stats.bestTime} ms` : 'لم تسجل بعد'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage Box */}
      <div
        id="reaction-game-pad"
        onClick={handlePadClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.code === 'Space' || e.key === 'Enter') {
            e.preventDefault();
            handlePadClick();
          }
        }}
        className={`relative w-full min-h-[360px] sm:min-h-[420px] rounded-3xl cursor-pointer select-none transition-all duration-150 flex flex-col items-center justify-center p-6 sm:p-10 text-center overflow-hidden outline-none ${
          gameState === 'IDLE'
            ? 'bg-gradient-to-b from-[#09142b] to-[#040817] border-2 border-cyan-500/40 hover:border-cyan-400 glow-cyan group'
            : gameState === 'WAITING'
            ? 'bg-gradient-to-b from-[#3a0614] to-[#1a0309] border-2 border-rose-500 animate-pulse shadow-[0_0_50px_rgba(255,0,80,0.5)]'
            : gameState === 'READY'
            ? 'bg-gradient-to-b from-[#023e20] to-[#022212] border-2 border-emerald-400 glow-emerald shadow-[0_0_80px_rgba(0,255,136,0.8)]'
            : gameState === 'EARLY'
            ? 'bg-gradient-to-b from-[#2e0915] to-[#120309] border-2 border-rose-600'
            : 'bg-gradient-to-b from-[#0c1833] to-[#060c1d] border-2 border-cyan-500/50 glow-cyan'
        }`}
      >
        {/* Subtle Cyber Grid in background */}
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none"></div>

        {/* Dynamic laser scanner sweep */}
        <div className="laser-scanner" />

        {/* State Visual Content */}
        {gameState === 'IDLE' && (
          <div className="relative z-10 max-w-lg space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all">
              <Zap className="w-10 h-10" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              انقر في أي مكان للبدء
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              عند النقر، ستظهر شاشة تنبيه نيون حمراء تطلب منك الانتظار. في لحظة عشوائية غير متوقعة، ستتحول إلى <span className="text-emerald-400 font-bold">اللون الأخضر الساطع</span>. انقر حينها فوراً!
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <span>أو اضغط زر المسافة (Spacebar) للتحكم من لوحة المفاتيح</span>
            </div>
          </div>
        )}

        {gameState === 'WAITING' && (
          <div className="relative z-10 max-w-lg space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-950/80 border border-rose-500 flex items-center justify-center text-rose-400 animate-ping">
              <AlertOctagon className="w-10 h-10" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-rose-300 tracking-wide text-glow-magenta">
              انتظر... استعد!
            </h3>
            <p className="text-rose-200 text-base">
              لا تنقر الآن! انتظر حتى ينفجر المربع باللون الأخضر النيون...
            </p>
          </div>
        )}

        {gameState === 'READY' && (
          <div className="relative z-10 max-w-lg space-y-4">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-emerald-400 text-black flex items-center justify-center font-black text-4xl shadow-[0_0_40px_rgba(0,255,136,1)] animate-bounce">
              <Zap className="w-14 h-14 fill-current" />
            </div>
            <h3 className="text-4xl sm:text-6xl font-black text-emerald-300 tracking-tight text-glow-emerald">
              انقر الآن فوراً!
            </h3>
            <p className="text-emerald-100 text-lg font-bold">
              اضغط بأقصى سرعة ممكنة!
            </p>
          </div>
        )}

        {gameState === 'EARLY' && (
          <div className="relative z-10 max-w-lg space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-400">
              انطلاقة مبكرة! لقد نقرت قبل الإشارة
            </h3>
            <p className="text-slate-300 text-sm">
              يجب الانتظار بصبر حتى يتحول المربع إلى اللون الأخضر. انقر للمحاولة مجدداً.
            </p>
            <button className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-lg">
              إعادة المحاولة
            </button>
          </div>
        )}

        {gameState === 'RESULT' && currentMs !== null && (
          <div className="relative z-10 max-w-xl space-y-5">
            {isNewRecord && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold text-sm shadow-[0_0_15px_rgba(0,240,255,0.5)] animate-bounce">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>رقم قياسي جديد في سرعة رد الفعل!</span>
              </div>
            )}

            <div>
              <div className="text-6xl sm:text-8xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-100 drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]">
                {currentMs}
                <span className="text-2xl sm:text-3xl text-slate-400 font-sans mr-2">ميلي ثانية</span>
              </div>
            </div>

            {/* Neural Tier Card */}
            {(() => {
              const tier = getTier(currentMs);
              return (
                <div className={`p-4 rounded-2xl border ${tier.color} transition-all space-y-1`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-black text-base sm:text-lg">{tier.title}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/40 border border-current font-bold">
                      {tier.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 text-right">
                    {tier.desc}
                  </p>
                </div>
              );
            })()}

            <p className="text-slate-400 text-xs sm:text-sm">
              انقر في أي مكان لإجراء جولة جديدة وتدريب رد فعلك
            </p>

            <button 
              id="btn-retry-reaction"
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>جولة جديدة</span>
            </button>
          </div>
        )}
      </div>

      {/* Statistics & Analytics Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Best Score */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">أعلى سرعة (الأسرع)</span>
            <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
              {stats.bestTime ? `${stats.bestTime} ms` : '—'}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-400">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Average of last 5 */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">متوسط آخر 5 محاولات</span>
            <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
              {stats.averageLast5 ? `${stats.averageLast5} ms` : '—'}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Total Attempts */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">إجمالي المحاولات</span>
            <div className="text-xl font-bold font-mono text-purple-300 mt-1">
              {stats.totalAttempts} جولة
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-950/50 border border-purple-500/30 text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Human Benchmark */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700/50 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">المعدل البشري المرجعي</span>
            <div className="text-xl font-bold font-mono text-slate-300 mt-1">
              ~ 273 ms
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800 text-slate-400">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Trial History Bar Chart if attempts exist */}
      {stats.history.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>سجل الجولات الأخيرة (آخر {stats.history.length} محاولات)</span>
            </h4>
            <button
              onClick={handleResetHistory}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              مسح سجل الجولات
            </button>
          </div>

          <div className="flex items-end gap-2 h-28 pt-4 px-2 border-b border-slate-800">
            {stats.history.slice(0, 15).reverse().map((ms, idx) => {
              // Calculate height percentage normalized between 100ms and 500ms
              const clamped = Math.max(100, Math.min(600, ms));
              const heightPct = Math.round(((650 - clamped) / 550) * 100);
              const isBest = ms === stats.bestTime;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-cyan-300 text-[10px] font-mono px-1.5 py-0.5 rounded border border-cyan-500/40 pointer-events-none whitespace-nowrap z-20">
                    {ms}ms
                  </div>

                  <div 
                    style={{ height: `${Math.max(15, heightPct)}%` }}
                    className={`w-full rounded-t transition-all ${
                      isBest 
                        ? 'bg-gradient-to-t from-cyan-500 to-emerald-400 glow-cyan shadow-[0_0_10px_rgba(0,240,255,0.5)]' 
                        : 'bg-gradient-to-t from-slate-700 to-cyan-700 hover:to-cyan-400'
                    }`}
                  />
                  <span className="text-[10px] font-mono text-slate-500">
                    {ms}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
