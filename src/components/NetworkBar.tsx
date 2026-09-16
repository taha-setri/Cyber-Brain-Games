import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Shield, 
  AlertTriangle, 
  Database, 
  User, 
  Activity,
  Zap,
  Radio,
  Headphones
} from 'lucide-react';
import { ActiveModal, UserStats } from '../types';
import { soundFx } from '../services/audioService';
import { brainMusicEngine, BRAIN_TRACKS, MusicState } from '../services/musicService';

interface NetworkBarProps {
  stats: UserStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenModal: (modal: ActiveModal) => void;
}

export const NetworkBar: React.FC<NetworkBarProps> = ({
  stats,
  isMuted,
  onToggleMute,
  onOpenModal,
}) => {
  const [musicState, setMusicState] = useState<MusicState>(brainMusicEngine.getState());

  useEffect(() => {
    const unsub = brainMusicEngine.subscribe((state) => {
      setMusicState(state);
    });
    return () => unsub();
  }, []);

  const activeTrack = BRAIN_TRACKS.find(t => t.id === musicState.currentTrackId) || BRAIN_TRACKS[0];
  return (
    <header id="network-bar" className="w-full bg-[#070c1e]/90 border-b border-cyan-500/20 backdrop-blur-md sticky top-0 z-40">
      {/* Top micro status line */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Left Side: Cyber Network Status & External Link */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-semibold tracking-wider">TAHA NEURAL NETWORK</span>
          </div>

          <a 
            id="link-previous-site"
            href="https://personal-budget-and-expense-planner.vercel.app/"
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => soundFx.playClick()}
            className="group flex items-center gap-1.5 px-3 py-1 rounded bg-gradient-to-r from-blue-950/80 to-purple-950/80 border border-blue-500/30 hover:border-cyan-400 text-blue-200 hover:text-cyan-300 transition-all duration-200 shadow-sm hover:shadow-[0_0_12px_rgba(0,240,255,0.3)]"
            title="الانتقال إلى موقع مخطط الميزانية والمصاريف الشخصية"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
            <span className="font-medium text-[11px] sm:text-xs">الموقع السابق: مخطط الميزانية والمصاريف الشخصية</span>
            <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Right Side: Quick High-Scores, Audio toggle & Legal/Founder links */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          
          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400">
              <Zap className="w-3 h-3" />
              أفضل رد فعل: {stats.reaction.bestTime ? `${stats.reaction.bestTime}ms` : '--'}
            </span>
            <span className="w-px h-3 bg-slate-700"></span>
            <span className="text-cyan-400">
              أعلى ذاكرة: م{stats.memory.highestLevel} ({stats.memory.highScore}ن)
            </span>
          </div>

          {/* Brain Music Quick Indicator / Toggle */}
          <button
            id="btn-network-bar-music"
            onClick={() => {
              soundFx.playClick();
              brainMusicEngine.togglePlay();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono transition-all duration-200 ${
              musicState.isPlaying
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'bg-slate-900/80 border-slate-700 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300'
            }`}
            title={musicState.isPlaying ? `يعمل الآن: ${activeTrack.title} (انقر للإيقاف)` : 'تشغيل موسيقى تحفيز العقل'}
          >
            {musicState.isPlaying ? (
              <>
                <span className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-cyan-400 eq-bar-1 inline-block" />
                  <span className="w-0.5 bg-cyan-400 eq-bar-2 inline-block" />
                  <span className="w-0.5 bg-cyan-400 eq-bar-3 inline-block" />
                </span>
                <span className="font-semibold text-cyan-200 hidden sm:inline">
                  {activeTrack.waveName}
                </span>
                <span className="font-semibold text-cyan-200 sm:hidden">
                  موسيقى
                </span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">موسيقى العقل</span>
                <span className="sm:hidden">موسيقى</span>
              </>
            )}
          </button>

          {/* Sound FX Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={() => {
              onToggleMute();
              soundFx.playClick();
            }}
            className={`p-1.5 rounded border transition-colors ${
              isMuted 
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-400 hover:bg-rose-900/60' 
                : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 glow-cyan'
            }`}
            title={isMuted ? 'تفعيل المؤثرات الصوتية النيون' : 'كتم المؤثرات الصوتية'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Founder Badge Link */}
          <button
            id="btn-founder-modal"
            onClick={() => {
              soundFx.playClick();
              onOpenModal('founder');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 hover:border-purple-300 text-purple-200 text-[11px] font-semibold transition-all hover:shadow-[0_0_10px_rgba(157,78,221,0.4)]"
          >
            <User className="w-3 h-3 text-purple-400" />
            <span>المؤسس: Taha setri</span>
          </button>

          {/* Quick Legal Drops */}
          <div className="flex items-center gap-1">
            <button
              id="btn-privacy-modal"
              onClick={() => {
                soundFx.playClick();
                onOpenModal('privacy');
              }}
              className="px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 text-[11px] transition-colors"
              title="سياسة الخصوصية"
            >
              الخصوصية
            </button>
            <button
              id="btn-disclaimer-modal"
              onClick={() => {
                soundFx.playClick();
                onOpenModal('disclaimer');
              }}
              className="px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 text-[11px] transition-colors"
              title="إخلاء المسؤولية"
            >
              إخلاء المسؤولية
            </button>
            <button
              id="btn-cookies-modal"
              onClick={() => {
                soundFx.playClick();
                onOpenModal('cookies');
              }}
              className="px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 text-[11px] transition-colors"
              title="ملفات الكوكيز والتخزين"
            >
              الكوكيز
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
