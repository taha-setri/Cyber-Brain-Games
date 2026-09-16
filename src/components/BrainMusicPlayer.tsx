import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Radio, 
  Headphones, 
  Sparkles, 
  Activity, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Zap, 
  Brain, 
  Target, 
  Flame,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  brainMusicEngine, 
  BRAIN_TRACKS, 
  BrainTrackId, 
  BrainMusicTrack, 
  MusicState 
} from '../services/musicService';
import { soundFx } from '../services/audioService';

interface BrainMusicPlayerProps {
  onNotify?: (message: string) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const BrainMusicPlayer: React.FC<BrainMusicPlayerProps> = ({
  onNotify,
  className = '',
  defaultExpanded = false,
}) => {
  const [musicState, setMusicState] = useState<MusicState>(brainMusicEngine.getState());
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScienceModal, setShowScienceModal] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Subscribe to engine state changes
  useEffect(() => {
    const unsubscribe = brainMusicEngine.subscribe((state) => {
      setMusicState(state);
    });
    return () => unsubscribe();
  }, []);

  // Real-time canvas visualizer animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 32;
    const freqData = new Uint8Array(bufferLength);

    const render = () => {
      brainMusicEngine.getFrequencyData(freqData);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 24;
      const barWidth = (canvas.width / barCount) - 2;
      const height = canvas.height;

      const activeTrack = BRAIN_TRACKS.find(t => t.id === musicState.currentTrackId) || BRAIN_TRACKS[0];
      
      // Determine bar colors based on track
      let primaryColor = '#00f0ff';
      if (activeTrack.id === 'beta') primaryColor = '#ffaa00';
      if (activeTrack.id === 'theta') primaryColor = '#b388ff';
      if (activeTrack.id === 'gamma') primaryColor = '#00ff88';

      for (let i = 0; i < barCount; i++) {
        let val = musicState.isPlaying ? freqData[i % bufferLength] : 0;
        
        // Add subtle procedural movement if playing and low amplitude
        if (musicState.isPlaying && val < 10) {
          val = 15 + Math.sin((Date.now() / 150) + i * 0.5) * 12;
        }

        const barHeight = Math.max(3, (val / 255) * (height - 4));
        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Draw glowing bar
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, `${primaryColor}33`);
        gradient.addColorStop(1, primaryColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Top dot
        if (musicState.isPlaying && barHeight > 6) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y - 2, barWidth, 2);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [musicState.isPlaying, musicState.currentTrackId]);

  const currentTrack = BRAIN_TRACKS.find(t => t.id === musicState.currentTrackId) || BRAIN_TRACKS[0];

  const handleTogglePlay = () => {
    soundFx.playClick();
    brainMusicEngine.togglePlay();
    if (!musicState.isPlaying) {
      onNotify?.(`تم تشغيل ${currentTrack.title}`);
    } else {
      onNotify?.('تم إيقاف الموسيقى مؤقتاً');
    }
  };

  const handleNextTrack = () => {
    soundFx.playClick();
    const currentIndex = BRAIN_TRACKS.findIndex(t => t.id === musicState.currentTrackId);
    const nextTrack = BRAIN_TRACKS[(currentIndex + 1) % BRAIN_TRACKS.length];
    brainMusicEngine.setTrack(nextTrack.id);
    onNotify?.(`تم الانتقال إلى: ${nextTrack.title}`);
  };

  const handlePrevTrack = () => {
    soundFx.playClick();
    const currentIndex = BRAIN_TRACKS.findIndex(t => t.id === musicState.currentTrackId);
    const prevTrack = BRAIN_TRACKS[(currentIndex - 1 + BRAIN_TRACKS.length) % BRAIN_TRACKS.length];
    brainMusicEngine.setTrack(prevTrack.id);
    onNotify?.(`تم الانتقال إلى: ${prevTrack.title}`);
  };

  const handleSelectTrack = (track: BrainMusicTrack) => {
    soundFx.playClick();
    brainMusicEngine.setTrack(track.id);
    if (!musicState.isPlaying) {
      brainMusicEngine.play();
    }
    onNotify?.(`تم تفعيل: ${track.title}`);
  };

  const getTrackIcon = (id: BrainTrackId) => {
    switch (id) {
      case 'alpha': return <Brain className="w-4 h-4 text-cyan-400" />;
      case 'beta': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'theta': return <Target className="w-4 h-4 text-purple-400" />;
      case 'gamma': return <Flame className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div 
      id="brain-music-player"
      className={`rounded-3xl bg-[#090e24]/90 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(0,240,255,0.12)] transition-all duration-300 relative overflow-hidden ${className}`}
    >
      {/* Decorative top pulse glow */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 transition-colors duration-500"
        style={{ backgroundColor: currentTrack.color.includes('cyan') ? '#00f0ff' : currentTrack.color.includes('amber') ? '#ffaa00' : currentTrack.color.includes('purple') ? '#b388ff' : '#00ff88' }}
      />

      {/* Main Bar (Always Visible Compact Header) */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left / Start Info: Playing Status & Track Identity */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-[240px]">
          
          {/* Main Play/Pause Button */}
          <motion.button
            id="btn-music-play-pause"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleTogglePlay}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
              musicState.isPlaying
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,240,255,0.6)]'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40'
            }`}
            title={musicState.isPlaying ? 'إيقاف مؤقت' : 'تشغيل موسيقى تحفيز العقل'}
          >
            {musicState.isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-[-1px]" />
            )}
          </motion.button>

          {/* Track Name, Frequency Badge & Visualizer */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${currentTrack.accentBg} ${currentTrack.color} border border-current/20`}>
                <Radio className="w-3 h-3 animate-pulse" />
                <span>{currentTrack.waveName}</span>
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Headphones className="w-3 h-3 text-cyan-400" />
                <span>موصى به مع السماعات للترددات الثنائية</span>
              </span>
            </div>

            <h3 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
              <span>{currentTrack.title}</span>
              {musicState.isPlaying && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </h3>
          </div>

        </div>

        {/* Center: Live Waveform Canvas Visualizer */}
        <div className="flex-1 min-w-[120px] max-w-xs h-10 hidden md:flex items-center justify-center px-2 py-1 rounded-xl bg-[#050814]/70 border border-slate-800/80">
          <canvas 
            ref={canvasRef} 
            width={160} 
            height={32}
            className="w-full h-full"
          />
        </div>

        {/* Right Controls: Skip, Volume, Settings & Expand */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Previous Track */}
          <button
            id="btn-music-prev"
            onClick={handlePrevTrack}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
            title="المقطع السابق"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Next Track */}
          <button
            id="btn-music-next"
            onClick={handleNextTrack}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
            title="المقطع التالي"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Quick Volume Slider (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <button
              onClick={() => {
                if (musicState.masterVolume > 0) {
                  brainMusicEngine.setMasterVolume(0);
                } else {
                  brainMusicEngine.setMasterVolume(0.65);
                }
              }}
              className="text-slate-400 hover:text-cyan-300 transition-colors"
              title={musicState.masterVolume === 0 ? 'إلغاء الكتم' : 'كتم الموسيقى'}
            >
              {musicState.masterVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              )}
            </button>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicState.masterVolume}
              onChange={(e) => brainMusicEngine.setMasterVolume(parseFloat(e.target.value))}
              className="w-16 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              title="مستوى صوت الموسيقى"
            />
            <span className="text-[10px] font-mono text-slate-400 w-6 text-left">
              {Math.round(musicState.masterVolume * 100)}%
            </span>
          </div>

          {/* Settings Toggle */}
          <button
            id="btn-music-settings"
            onClick={() => {
              soundFx.playClick();
              setShowSettings(!showSettings);
            }}
            className={`p-2 rounded-xl border transition-colors ${
              showSettings 
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                : 'bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 border-slate-700'
            }`}
            title="إعدادات الصوت والترددات"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Science Modal / Info Button */}
          <button
            id="btn-music-science-info"
            onClick={() => {
              soundFx.playClick();
              setShowScienceModal(true);
            }}
            className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 transition-colors"
            title="كيف تحفز هذه الموجات عقلك وسرعة رد فعلك؟"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Expand/Collapse Tracks List */}
          <button
            id="btn-music-expand"
            onClick={() => {
              soundFx.playClick();
              setIsExpanded(!isExpanded);
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all"
            title={isExpanded ? 'طي قائمة الترددات' : 'عرض كافة ترددات تحفيز العقل'}
          >
            <span>{isExpanded ? 'إخفاء الأنماط' : 'اختر النمط الذهني'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

        </div>

      </div>

      {/* Advanced Audio Sliders / Settings Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-800 bg-[#060a1c] px-4 sm:px-6 py-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              
              {/* Master volume */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>مستوى الصوت العام</span>
                  </span>
                  <span className="font-mono text-cyan-300">{Math.round(musicState.masterVolume * 100)}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicState.masterVolume}
                  onChange={(e) => brainMusicEngine.setMasterVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Melody / Ambient Harmonies Volume */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>نقاء النغمات والأمبينت</span>
                  </span>
                  <span className="font-mono text-emerald-300">{Math.round(musicState.melodyVolume * 100)}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicState.melodyVolume}
                  onChange={(e) => brainMusicEngine.setMelodyVolume(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Binaural Beat Carrier Volume & Toggle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                    <span>النبضات الثنائية (Binaural)</span>
                  </span>
                  <button 
                    onClick={() => brainMusicEngine.setBinauralEnabled(!musicState.binauralEnabled)}
                    className={`text-[10px] px-1.5 py-0.5 rounded ${musicState.binauralEnabled ? 'bg-purple-900/80 text-purple-200' : 'bg-slate-800 text-slate-500'}`}
                  >
                    {musicState.binauralEnabled ? 'مفعل' : 'معطل'}
                  </button>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  disabled={!musicState.binauralEnabled}
                  value={musicState.binauralVolume}
                  onChange={(e) => brainMusicEngine.setBinauralVolume(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40"
                />
              </div>

            </div>

            {/* Studio Clarity Notice */}
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-medium">صوت استوديو عالي النقاء: تمت إزالة كافة مصادر التشويش مع معالج ديناميكي مانع للفرقعة والتشويه.</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                <span>يُفضل استخدام سماعات الأذن لعزل الترددات الذهنية</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Tracks Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-800/90 bg-[#060a1c]/80 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                  اختر النمط الصوتي المحفز للنشاط الذهني الحالي:
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                مبني على أحدث أبحاث الترددات الحيوية والنغمات التوافقية
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {BRAIN_TRACKS.map((track) => {
                const isSelected = track.id === musicState.currentTrackId;
                const isPlayingThis = isSelected && musicState.isPlaying;

                return (
                  <motion.div
                    key={track.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTrack(track)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between text-right space-y-3 ${
                      isSelected
                        ? `${track.accentBg} ${track.borderColor} border-2 shadow-[0_0_20px_${track.glowColor}]`
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {/* Active playing indicator badge */}
                    {isSelected && (
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/40 text-[10px] font-mono text-white">
                        {isPlayingThis ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>يعمل الآن</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3 text-cyan-400" />
                            <span>محدد</span>
                          </>
                        )}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`p-1.5 rounded-lg ${track.accentBg} border border-current/20`}>
                          {getTrackIcon(track.id)}
                        </div>
                        <span className={`text-xs font-bold font-mono ${track.color}`}>
                          {track.waveName}
                        </span>
                      </div>

                      <h5 className="font-bold text-sm text-slate-100 mb-1 leading-snug">
                        {track.title}
                      </h5>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {track.benefit}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Target className="w-3 h-3 text-cyan-400" />
                        <span>{track.recommendedFor}</span>
                      </span>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Science & Brainwaves Modal */}
      <AnimatePresence>
        {showScienceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="max-w-xl w-full bg-[#080d22] border border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,240,255,0.25)] space-y-5 text-right relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <h3 className="text-base sm:text-lg font-bold text-cyan-200">
                    كيف تعمل موسيقى تحفيز العقل والنبضات الثنائية؟
                  </h3>
                </div>
                <button
                  onClick={() => setShowScienceModal(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  إغلاق
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  تم تصميم المحرك الصوتي في المنصة وفق مبادئ علم الصوتيات العصبية (Neuroacoustics) والتزامن الدماغي (Brainwave Entrainment):
                </p>

                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-1">
                    <h5 className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Brain className="w-4 h-4" />
                      <span>موجات ألفا (10 Hz Alpha)</span>
                    </h5>
                    <p className="text-[12px] text-slate-300">
                      تنشط أثناء الاسترخاء المركز واليقظة الذهنية الصافية. تساعدك على البقاء هادئاً بدون توتر، مما يقلل من الأخطاء في ألعاب التركيز.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-1">
                    <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      <span>موجات بيتا (18 Hz Beta)</span>
                    </h5>
                    <p className="text-[12px] text-slate-300">
                      مرتبطة بالتفكير السريع والاستجابة اللحظية ونشاط رد الفعل الحركي. مثالية لتسجيل أرقام قياسية في اختبار سرعة رد الفعل بدقة الميلي ثانية.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1">
                    <h5 className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Target className="w-4 h-4" />
                      <span>موجات ثيتا (6 Hz Theta)</span>
                    </h5>
                    <p className="text-[12px] text-slate-300">
                      تحفز الذاكرة المكانية العميقة وتسهل تشفير الأنماط البصرية في قشرة الدماغ الصدغية، مما يعطيك أفضلية في شبكة الذاكرة البصرية.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                    <h5 className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Flame className="w-4 h-4" />
                      <span>موجات غاما (40 Hz Gamma)</span>
                    </h5>
                    <p className="text-[12px] text-slate-300">
                      أعلى ترددات المخ تزامناً، مسؤولة عن تدفق الانتباه المتزامن وربط الإدراك الحسي بالحركي للأداء الفائق في أعلى المستويات.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-2 text-[11px] text-slate-400">
                  <Headphones className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>نصيحة ذهبية:</strong> للاستفادة القصوى من النبضات ثنائية الأذنين (Binaural Beats)، ارتدِ سماعات الرأس (Stereo Headphones) ليتمكن الدماغ من دمج الترددين المستقلين في كل أذن بنجاح.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowScienceModal(false)}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  فهمت ذلك، فلنبدأ التدريب
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
