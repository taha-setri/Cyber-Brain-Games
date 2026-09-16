import React from 'react';
import { 
  Zap, 
  Brain, 
  Target, 
  Trophy, 
  User, 
  Globe, 
  ExternalLink, 
  Flame, 
  Activity, 
  Sparkles,
  ShieldCheck,
  Headphones
} from 'lucide-react';
import { UserStats, ActiveModal } from '../types';
import { soundFx } from '../services/audioService';

interface CyberMarqueeProps {
  stats: UserStats;
  onOpenModal: (modal: ActiveModal) => void;
  direction?: 'left' | 'right';
  speed?: 'normal' | 'fast';
  variant?: 'primary' | 'telemetry';
}

export const CyberMarquee: React.FC<CyberMarqueeProps> = ({
  stats,
  onOpenModal,
  direction = 'left',
  speed = 'normal',
  variant = 'primary',
}) => {
  const bestReaction = stats.reaction.bestTime ? `${stats.reaction.bestTime}ms` : 'لم يُسجل بعد';
  const bestMemory = stats.memory.highScore > 0 ? `المستوى ${stats.memory.highestLevel} (${stats.memory.highScore}ن)` : 'المستوى 1';
  const bestFocus = stats.focus.highScore > 0 ? `${stats.focus.highScore} نقطة` : 'لم يُسجل بعد';
  const bestChimp = stats.chimp.maxNumbers > 4 ? `${stats.chimp.maxNumbers} أرقام` : '4 أرقام';
  const bestMath = stats.math.highScore > 0 ? `${stats.math.highScore} نقطة` : 'لم يُسجل بعد';

  // Primary continuous items that repeat infinitely
  const primaryItems = [
    {
      id: 'item-1',
      icon: <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />,
      text: 'اختبار سرعة رد الفعل بدقة الميلي ثانية (1ms) الفائقة',
      highlight: '⚡ NEURAL VELOCITY',
      color: 'border-cyan-500/40 bg-cyan-950/50 text-cyan-200',
    },
    {
      id: 'item-stat-reaction',
      icon: <Trophy className="w-3.5 h-3.5 text-amber-400" />,
      text: `أفضل سرعة رد فعل حالياً: ${bestReaction}`,
      highlight: 'رقمك القياسي',
      color: 'border-amber-500/40 bg-amber-950/40 text-amber-200',
    },
    {
      id: 'item-chimp',
      icon: <Brain className="w-3.5 h-3.5 text-purple-400" />,
      text: `تحدي ذاكرة الشمبانزي أيومو • أعلى تسلسل ملتقط: ${bestChimp}`,
      highlight: '🦍 AYUMU SEQUENCE',
      color: 'border-purple-500/40 bg-purple-950/50 text-purple-200',
    },
    {
      id: 'item-math',
      icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
      text: `الحساب الذهني العصبي الخاطف في 60s • قياسي: ${bestMath}`,
      highlight: '⚡ SPEED MATH',
      color: 'border-cyan-500/40 bg-cyan-950/50 text-cyan-200',
    },
    {
      id: 'item-2',
      icon: <Brain className="w-3.5 h-3.5 text-purple-400" />,
      text: `تحدي مصفوفة الذاكرة البصرية التكيفية • أعلى مستوى: ${bestMemory}`,
      highlight: '🧠 VISUAL MATRIX',
      color: 'border-purple-500/40 bg-purple-950/50 text-purple-200',
    },
    {
      id: 'item-founder',
      icon: <User className="w-3.5 h-3.5 text-cyan-400" />,
      text: 'المؤسس والمطور: Taha setri (انقر لعرض بطاقة الإشراف)',
      highlight: '👑 FOUNDER',
      color: 'border-cyan-400/60 bg-gradient-to-r from-cyan-950/70 to-blue-950/70 text-cyan-100 cursor-pointer hover:border-cyan-300',
      action: () => onOpenModal('founder'),
    },
    {
      id: 'item-sister',
      icon: <Globe className="w-3.5 h-3.5 text-blue-400" />,
      text: 'المنصة الشقيقة: مخطط الميزانية والمصاريف الشخصية',
      highlight: '🌐 PREVIOUS SITE',
      color: 'border-blue-500/40 bg-blue-950/50 text-blue-200 cursor-pointer hover:border-cyan-400',
      link: 'https://personal-budget-and-expense-planner.vercel.app/',
    },
    {
      id: 'item-3',
      icon: <Target className="w-3.5 h-3.5 text-emerald-400" />,
      text: `تحدي التركيز المعرفي وتجنب المحفزات المضللة • أعلى نقاط: ${bestFocus}`,
      highlight: '🎯 COGNITIVE FOCUS',
      color: 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200',
    },
    {
      id: 'item-tip',
      icon: <Flame className="w-3.5 h-3.5 text-orange-400 animate-bounce" />,
      text: 'نصيحة ذهبية: ثبّت نظرك في منتصف الصندوق واسترخِ حتى يلمع النيون الأخضر!',
      highlight: '💡 PRO TIP',
      color: 'border-orange-500/40 bg-orange-950/40 text-orange-200',
    },
    {
      id: 'item-privacy',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />,
      text: 'بياناتك ونتائجك محفوظة محلياً 100% في جهازك بأمان تام بدون خوادم تتبع',
      highlight: '🔒 LOCAL PRIVACY',
      color: 'border-slate-700 bg-slate-900/60 text-slate-300',
    },
    {
      id: 'item-brain-music',
      icon: <Headphones className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />,
      text: 'موسيقى تحفيز العقل وترددات ألفا وبيتا وثيتا مدمجة بالمشغل الصوتي لتعزيز التركيز وسرعة الاستجابة',
      highlight: '🎧 NEURO AUDIO',
      color: 'border-cyan-500/40 bg-cyan-950/60 text-cyan-200',
    },
  ];

  // Secondary telemetry ticker items
  const telemetryItems = [
    '⚡ LATENCY: <1ms',
    '🧠 BRAIN VELOCITY: ACTIVE',
    '🎧 BINAURAL AUDIO: 10Hz ALPHA / 18Hz BETA / 6Hz THETA / 40Hz GAMMA',
    '📊 REACTION TICK: 1000Hz',
    '👤 FOUNDER: TAHA SETRI',
    '🌐 PLATFORM: NEURAL MATRIX 2026',
    '🚀 FPS TARGET: 60+ ULTRA SMOOTH',
    '💾 STORAGE: LOCAL_STORAGE ONLY',
    '🎯 CHALLENGE: BREAK THE 200MS BARRIER',
    '✨ SYNERGY: BUDGET PLANNER & NEURAL GAMES',
    '🛡️ SECURITY PROTOCOL: VERIFIED',
  ];

  const animClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  const speedClass = speed === 'fast' ? 'animate-marquee-fast' : '';

  if (variant === 'telemetry') {
    return (
      <div 
        className="w-full bg-[#030611]/90 border-y border-cyan-500/15 overflow-hidden py-1.5 backdrop-blur-sm relative z-20 hover-pause"
        dir="ltr"
      >
        <div className={`${animClass} ${speedClass} gap-8 items-center text-[10px] sm:text-[11px] font-mono tracking-widest text-cyan-400/80 uppercase select-none`}>
          {/* Loop twice for seamless infinite continuous repetition */}
          {[...telemetryItems, ...telemetryItems, ...telemetryItems, ...telemetryItems].map((item, idx) => (
            <div 
              key={`telemetry-${idx}`} 
              className="flex items-center gap-3 shrink-0 whitespace-nowrap hover:text-cyan-200 transition-colors"
              onMouseEnter={() => soundFx.playHover()}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-ping" />
              <span>{item}</span>
              <span className="text-slate-600">///</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full bg-gradient-to-r from-[#070d24]/95 via-[#0a1230]/95 to-[#070d24]/95 border-b border-cyan-500/25 py-2 overflow-hidden backdrop-blur-md relative z-30 hover-pause shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
      title="شريط النصوص المتدفقة والمتكررة - توقف عند الإشارة بالماوس"
    >
      {/* Subtle edge fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#050814] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#050814] to-transparent z-10 pointer-events-none" />

      {/* Repeating Marquee Track */}
      <div className={`${animClass} ${speedClass} items-center gap-4 sm:gap-6 select-none`}>
        {/* Repeating 3 times so the loop has zero gaps on wide screens */}
        {[...primaryItems, ...primaryItems, ...primaryItems].map((item, index) => {
          const content = (
            <div
              key={`marquee-item-${index}`}
              onClick={() => {
                if (item.action) {
                  soundFx.playClick();
                  item.action();
                } else if (item.link) {
                  soundFx.playClick();
                  window.open(item.link, '_blank', 'noopener,noreferrer');
                }
              }}
              onMouseEnter={() => soundFx.playHover()}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all duration-200 shrink-0 whitespace-nowrap shadow-sm hover:scale-105 ${item.color}`}
            >
              {item.icon}
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                {item.highlight}
              </span>
              <span className="text-slate-100">{item.text}</span>
              {item.link && (
                <ExternalLink className="w-3 h-3 text-cyan-400 opacity-70" />
              )}
            </div>
          );

          return content;
        })}
      </div>
    </div>
  );
};
