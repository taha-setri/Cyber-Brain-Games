import React, { useState } from 'react';
import { 
  Zap, 
  Brain, 
  Target, 
  Sparkles,
  Eye,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveGame, ActiveModal, UserStats } from './types';
import { loadUserStats, saveUserStats, clearAllLocalData } from './services/storageService';
import { soundFx } from './services/audioService';
import { NetworkBar } from './components/NetworkBar';
import { CyberMarquee } from './components/CyberMarquee';
import { CyberParticlesCanvas } from './components/CyberParticlesCanvas';
import { AnimatedDynamicHero } from './components/AnimatedDynamicHero';
import { ReactionTimeGame } from './components/ReactionTimeGame';
import { MemoryGridGame } from './components/MemoryGridGame';
import { NeuroFocusGame } from './components/NeuroFocusGame';
import { ChimpMemoryGame } from './components/ChimpMemoryGame';
import { SpeedMathGame } from './components/SpeedMathGame';
import { Modals } from './components/Modals';
import { Footer } from './components/Footer';
import { BrainMusicPlayer } from './components/BrainMusicPlayer';

export default function App() {
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [activeGame, setActiveGame] = useState<ActiveGame>('reaction');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.getMuted());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync stats changes to localStorage
  const updateStats = (updater: (prev: UserStats) => UserStats) => {
    setStats((prev) => {
      const next = updater(prev);
      saveUserStats(next);
      return next;
    });
  };

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    showToast(muted ? 'تم كتم المؤثرات الصوتية' : 'تم تفعيل المؤثرات الصوتية النيون');
  };

  const handleClearStorage = () => {
    clearAllLocalData();
    setStats(loadUserStats());
    showToast('تم تصفير جميع البيانات وسجلات الألعاب محلياً بنجاح');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050814] text-slate-100 relative selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      
      {/* Interactive Background Particles & Cyber Grid */}
      <CyberParticlesCanvas />
      <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none z-0" />
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[10%] w-[600px] h-[350px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none z-0" />

      {/* Top Network Bar */}
      <NetworkBar 
        stats={stats}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenModal={(modal) => setActiveModal(modal)}
      />

      {/* Dynamic Continuous Moving Marquee 1: Right-to-Left Primary Stream */}
      <CyberMarquee 
        stats={stats}
        onOpenModal={(modal) => setActiveModal(modal)}
        direction="left"
        speed="normal"
        variant="primary"
      />

      {/* High-Tech Telemetry Fast Streamer 2: Left-to-Right Counter-Stream */}
      <CyberMarquee 
        stats={stats}
        onOpenModal={(modal) => setActiveModal(modal)}
        direction="right"
        speed="fast"
        variant="telemetry"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="px-5 py-2.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Page Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10 space-y-8">
        
        {/* Futuristic Platform Dynamic Hero with Typewriter & Rotating Texts */}
        <AnimatedDynamicHero 
          stats={stats}
          onOpenModal={(modal) => setActiveModal(modal)}
        />

        {/* Brain-Stimulating Focus & Neuro-Acoustic Music Player */}
        <BrainMusicPlayer onNotify={(msg) => showToast(msg)} />

        {/* Game Mode Navigation Tabs */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          
          {/* Tab 1: Reaction Time */}
          <motion.button
            id="tab-reaction-game"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onMouseEnter={() => soundFx.playHover()}
            onClick={() => {
              soundFx.playClick();
              setActiveGame('reaction');
            }}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
              activeGame === 'reaction'
                ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-slate-700'
            }`}
          >
            <Zap className={`w-4 h-4 ${activeGame === 'reaction' ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <span>اختبار سرعة رد الفعل (ms)</span>
          </motion.button>

          {/* Tab 2: Visual Memory Grid */}
          <motion.button
            id="tab-memory-game"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onMouseEnter={() => soundFx.playHover()}
            onClick={() => {
              soundFx.playClick();
              setActiveGame('memory');
            }}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
              activeGame === 'memory'
                ? 'bg-purple-500/20 border-2 border-purple-400 text-purple-300 shadow-[0_0_20px_rgba(157,78,221,0.4)]'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-purple-300 hover:border-slate-700'
            }`}
          >
            <Brain className={`w-4 h-4 ${activeGame === 'memory' ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
            <span>شبكة الذاكرة البصرية</span>
          </motion.button>

          {/* Tab 3: Chimp Memory Test */}
          <motion.button
            id="tab-chimp-game"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onMouseEnter={() => soundFx.playHover()}
            onClick={() => {
              soundFx.playClick();
              setActiveGame('chimp');
            }}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
              activeGame === 'chimp'
                ? 'bg-purple-600/25 border-2 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(157,78,221,0.45)]'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-purple-300 hover:border-slate-700'
            }`}
          >
            <Eye className={`w-4 h-4 ${activeGame === 'chimp' ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
            <span>ذاكرة الشمبانزي (Ayumu)</span>
          </motion.button>

          {/* Tab 4: Speed Neuro Math */}
          <motion.button
            id="tab-math-game"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onMouseEnter={() => soundFx.playHover()}
            onClick={() => {
              soundFx.playClick();
              setActiveGame('math');
            }}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
              activeGame === 'math'
                ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-slate-700'
            }`}
          >
            <Calculator className={`w-4 h-4 ${activeGame === 'math' ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <span>الحساب الذهني الخاطف</span>
          </motion.button>

          {/* Tab 5: Neuro Focus */}
          <motion.button
            id="tab-focus-game"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onMouseEnter={() => soundFx.playHover()}
            onClick={() => {
              soundFx.playClick();
              setActiveGame('focus');
            }}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
              activeGame === 'focus'
                ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(0,255,136,0.4)]'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-emerald-300 hover:border-slate-700'
            }`}
          >
            <Target className={`w-4 h-4 ${activeGame === 'focus' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>تحدي التركيز المعرفي</span>
          </motion.button>

        </div>

        {/* Active Game View with Smooth Kinetic Animations */}
        <section className="transition-all duration-300">
          <AnimatePresence mode="wait">
            {activeGame === 'reaction' && (
              <motion.div
                key="reaction"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <ReactionTimeGame 
                  stats={stats.reaction}
                  onUpdateStats={(newStats) => {
                    updateStats(prev => ({ ...prev, reaction: newStats }));
                  }}
                />
              </motion.div>
            )}

            {activeGame === 'memory' && (
              <motion.div
                key="memory"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <MemoryGridGame 
                  stats={stats.memory}
                  onUpdateStats={(newStats) => {
                    updateStats(prev => ({ ...prev, memory: newStats }));
                  }}
                />
              </motion.div>
            )}

            {activeGame === 'chimp' && (
              <motion.div
                key="chimp"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <ChimpMemoryGame 
                  stats={stats.chimp}
                  onUpdateStats={(newStats) => {
                    updateStats(prev => ({ ...prev, chimp: newStats }));
                  }}
                />
              </motion.div>
            )}

            {activeGame === 'math' && (
              <motion.div
                key="math"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <SpeedMathGame 
                  stats={stats.math}
                  onUpdateStats={(newStats) => {
                    updateStats(prev => ({ ...prev, math: newStats }));
                  }}
                />
              </motion.div>
            )}

            {activeGame === 'focus' && (
              <motion.div
                key="focus"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <NeuroFocusGame 
                  stats={stats.focus}
                  onUpdateStats={(newStats) => {
                    updateStats(prev => ({ ...prev, focus: newStats }));
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>

      {/* Pre-Footer Kinetic Marquee Streamer */}
      <div className="mt-8">
        <CyberMarquee 
          stats={stats}
          onOpenModal={(modal) => setActiveModal(modal)}
          direction="right"
          speed="normal"
          variant="primary"
        />
      </div>

      {/* Footer */}
      <Footer onOpenModal={(modal) => setActiveModal(modal)} />

      {/* Universal Modals (Privacy, Disclaimer, Cookies, Founder) */}
      <Modals 
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onClearStorage={handleClearStorage}
      />

    </div>
  );
}
