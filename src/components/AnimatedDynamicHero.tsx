import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Brain, 
  Target, 
  Trophy, 
  Activity, 
  Sparkles, 
  Flame, 
  Compass, 
  Radio, 
  User,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Headphones
} from 'lucide-react';
import { UserStats, ActiveModal } from '../types';
import { soundFx } from '../services/audioService';

interface AnimatedDynamicHeroProps {
  stats: UserStats;
  onOpenModal: (modal: ActiveModal) => void;
}

export const AnimatedDynamicHero: React.FC<AnimatedDynamicHeroProps> = ({
  stats,
  onOpenModal,
}) => {
  // Rotating animated texts that loop and repeat continuously
  const cyclingTexts = [
    {
      text: 'قس سرعة رد فعلك العصبي بدقة الميلي ثانية (1ms) الفائقة وتحدَّ أرقامك القياسية!',
      tag: 'اختبار الاستجابة العصبية',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      color: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/60',
    },
    {
      text: 'طوّر مصفوفة الذاكرة البصرية عبر تذكر تسلسل المربعات المضيئة تدريجياً!',
      tag: 'تدريب الذاكرة المكانية',
      icon: <Brain className="w-4 h-4 text-purple-400" />,
      color: 'text-purple-300 border-purple-500/40 bg-purple-950/60',
    },
    {
      text: 'تحدي ذاكرة الشمبانزي (Ayumu): التقط مواقع الأرقام بلمحة بصرية خارقة وانقرها تصاعدياً بعد أن تختفي!',
      tag: 'الذاكرة اللحظية الفائقة',
      icon: <Brain className="w-4 h-4 text-purple-400" />,
      color: 'text-purple-300 border-purple-500/40 bg-purple-950/60',
    },
    {
      text: 'الحساب الذهني العصبي الخاطف: حل أكبر قدر من المسائل الرياضية في 60 ثانية وحقق أعلى مضاعف كومبو!',
      tag: 'سرعة البديهة الحسابية',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      color: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/60',
    },
    {
      text: 'ثبّت تركيزك المعرفي العالي وتجنب الخداع البصري في التحدي التفاعلي السريع!',
      tag: 'التركيز الذهني والانتباه',
      icon: <Target className="w-4 h-4 text-emerald-400" />,
      color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/60',
    },
    {
      text: 'شغّل موسيقى وترددات تحفيز العقل (موجات ألفا وبيتا وثيتا 10Hz-40Hz) لتنشيط التركيز وسرعة البديهة أثناء اللعب!',
      tag: 'موسيقى تحفيز العقل العصبية',
      icon: <Headphones className="w-4 h-4 text-cyan-400" />,
      color: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/60',
    },
    {
      text: 'المؤسس والمطور Taha setri يرحب بك في بيئة الألعاب المصغرة والمحاكاة التفاعلية لعام 2026',
      tag: 'إشراف وتطوير المنصة',
      icon: <User className="w-4 h-4 text-amber-400" />,
      color: 'text-amber-300 border-amber-500/40 bg-amber-950/60',
    },
    {
      text: 'يمكنك الانتقال في أي وقت إلى موقعنا الشقيق: مخطط الميزانية والمصاريف الشخصية عبر الرابط العلوي',
      tag: 'المنصة الشقيقة المتكاملة',
      icon: <Compass className="w-4 h-4 text-blue-400" />,
      color: 'text-blue-300 border-blue-500/40 bg-blue-950/60',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter & text transition effect that continuously cycles & repeats
  useEffect(() => {
    let charIndex = 0;
    const targetText = cyclingTexts[currentIndex].text;
    setDisplayText('');
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      if (charIndex <= targetText.length) {
        setDisplayText(targetText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 25);

    // Switch to next text after display pause
    const switchTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cyclingTexts.length);
    }, 4800);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(switchTimer);
    };
  }, [currentIndex]);

  const currentItem = cyclingTexts[currentIndex];

  return (
    <div 
      id="animated-hero-card"
      className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0e1738]/90 via-[#070e28]/95 to-[#050819]/95 border border-cyan-500/30 shadow-[0_0_40px_rgba(0,240,255,0.14)] overflow-hidden text-center space-y-6 select-none"
    >
      {/* Moving Laser Scanner Beam */}
      <div className="laser-scanner" />

      {/* Futuristic Scanlines */}
      <div className="absolute inset-0 scanlines opacity-35 pointer-events-none" />

      {/* Top Telemetry Row with Audio Equalizer */}
      <div className="flex items-center justify-between flex-wrap gap-2 relative z-10 px-2">
        
        {/* Node Chip */}
        <div 
          onMouseEnter={() => soundFx.playHover()}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>NEURAL MATRIX INTERFACE • الإصدار التفاعلي 2026</span>
        </div>

        {/* Dynamic Sound Equalizer Visualizer */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 text-xs font-mono"
          title="ترددات المعالجة العصبية المتزامنة"
        >
          <span className="text-[10px] text-cyan-400 tracking-wider">NEURAL FREQ:</span>
          <div className="flex items-end gap-0.5 h-4 w-10 justify-center">
            <span className="w-1 bg-cyan-400 rounded-full eq-bar-1" />
            <span className="w-1 bg-purple-400 rounded-full eq-bar-2" />
            <span className="w-1 bg-emerald-400 rounded-full eq-bar-3" />
            <span className="w-1 bg-cyan-300 rounded-full eq-bar-4" />
            <span className="w-1 bg-pink-400 rounded-full eq-bar-5" />
          </div>
        </div>

      </div>

      {/* Main Dynamic Holographic Title */}
      <div className="relative z-10 space-y-3">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight drop-shadow-[0_0_30px_rgba(0,240,255,0.4)]">
          <span className="cyber-shimmer-text">منصة ألعاب العقل</span>{' '}
          <span className="text-white">وسرعة التركيز</span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          بيئة تفاعلية لاختبار قدرات الدماغ وردود الأفعال بدقة الميلي ثانية الفائقة. نافس أرقامك القياسية، وطوّر الذاكرة البصرية والتركيز العصبي مع حفظ محلي كامل.
        </p>
      </div>

      {/* Continuous Dynamic Typewriter & Moving Rotating Text Box */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <div 
          onMouseEnter={() => soundFx.playHover()}
          className={`flex items-center justify-center flex-wrap gap-2.5 px-4 py-3 sm:py-3.5 rounded-2xl border backdrop-blur-md transition-all duration-300 shadow-[0_0_25px_rgba(0,0,0,0.4)] ${currentItem.color}`}
        >
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black/50 border border-white/10 text-xs font-bold font-mono shrink-0">
            {currentItem.icon}
            <span>{currentItem.tag}</span>
          </div>

          <div className="text-xs sm:text-sm font-semibold flex items-center gap-1 text-slate-100 min-h-[1.75rem] text-center">
            <span>{displayText}</span>
            {/* Pulsing typewriter cursor */}
            <span className={`inline-block w-1.5 h-4 bg-cyan-400 rounded-full ml-1 ${isTyping ? 'animate-pulse' : 'opacity-40'}`} />
          </div>
        </div>

        {/* Text rotator indicator dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {cyclingTexts.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              onClick={() => {
                soundFx.playClick();
                setCurrentIndex(idx);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex 
                  ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]' 
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`الانتقال إلى الإشعار ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Interactive Feature Pills with Hover Kinetic Glow */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-1 text-xs font-mono relative z-10">
        
        <div 
          onMouseEnter={() => soundFx.playHover()}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-300 flex items-center gap-2 shadow-sm hover:border-cyan-400 hover:scale-105 transition-all cursor-default"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>دقة الميلي ثانية (1ms)</span>
        </div>

        <div 
          onMouseEnter={() => soundFx.playHover()}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-purple-500/30 text-purple-300 flex items-center gap-2 shadow-sm hover:border-purple-400 hover:scale-105 transition-all cursor-default"
        >
          <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>مصفوفة الذاكرة البصرية</span>
        </div>

        <div 
          onMouseEnter={() => soundFx.playHover()}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 shadow-sm hover:border-emerald-400 hover:scale-105 transition-all cursor-default"
        >
          <Trophy className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>أفضل رقم: {stats.reaction.bestTime ? `${stats.reaction.bestTime}ms` : 'بانتظار جولتك'}</span>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onOpenModal('founder');
          }}
          onMouseEnter={() => soundFx.playHover()}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-950/80 to-cyan-950/80 border border-blue-500/40 text-cyan-200 flex items-center gap-1.5 shadow-sm hover:border-cyan-400 hover:scale-105 transition-all cursor-pointer"
        >
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span>المؤسس: Taha setri</span>
        </button>

      </div>
    </div>
  );
};
