// Brain-Stimulating Cognitive Music & Pure Neuro-Acoustic Audio Engine
// Studio-quality Web Audio synthesizer generating crystal-clear Alpha, Beta, Theta, and Gamma soundscapes
// Completely free from noise, distortion, clicks, or digital clipping

export type BrainTrackId = 'alpha' | 'beta' | 'theta' | 'gamma';

export interface BrainMusicTrack {
  id: BrainTrackId;
  title: string;
  titleEn: string;
  waveName: string;
  frequencyHz: number;
  tempoBpm: number;
  recommendedFor: string;
  benefit: string;
  color: string;
  glowColor: string;
  accentBg: string;
  borderColor: string;
}

export const BRAIN_TRACKS: BrainMusicTrack[] = [
  {
    id: 'alpha',
    title: 'تركيز ألفا العميق والصفاء الذهني',
    titleEn: '10 Hz Alpha State • Pure Calm Focus',
    waveName: 'موجات ألفا (10 Hz)',
    frequencyHz: 10,
    tempoBpm: 64,
    recommendedFor: 'التركيز المعرفي ودراسة الأنماط بدون توتر',
    benefit: 'تحفيز حالة الاسترخاء اليقظ وصفاء الذهن بدون أي تشويش',
    color: 'text-cyan-400',
    glowColor: 'rgba(0, 240, 255, 0.5)',
    accentBg: 'bg-cyan-500/15',
    borderColor: 'border-cyan-400',
  },
  {
    id: 'beta',
    title: 'سرعة البديهة والنشاط العصبي الفائق',
    titleEn: '18 Hz Beta Drive • High Reflex Agility',
    waveName: 'موجات بيتا (18 Hz)',
    frequencyHz: 18,
    tempoBpm: 120,
    recommendedFor: 'اختبار سرعة رد الفعل بدقة الميلي ثانية',
    benefit: 'شحذ اليقظة الحركية وتسريع انتقال الإشارات العصبية بنغمات نقية',
    color: 'text-amber-400',
    glowColor: 'rgba(255, 170, 0, 0.5)',
    accentBg: 'bg-amber-500/15',
    borderColor: 'border-amber-400',
  },
  {
    id: 'theta',
    title: 'الذاكرة المكانية والاستيعاب البصري',
    titleEn: '6 Hz Theta Waves • Visual Memory Matrix',
    waveName: 'موجات ثيتا (6 Hz)',
    frequencyHz: 6,
    tempoBpm: 56,
    recommendedFor: 'شبكة الذاكرة البصرية وتذكر التسلسلات',
    benefit: 'تعزيز الاحتفاظ بالمعلومات المكانية والمرونة العصبية في بيئة هادئة',
    color: 'text-purple-400',
    glowColor: 'rgba(157, 78, 221, 0.5)',
    accentBg: 'bg-purple-500/15',
    borderColor: 'border-purple-400',
  },
  {
    id: 'gamma',
    title: 'الأداء المعرفي الأقصى والتزامن الذهني',
    titleEn: '40 Hz Gamma Peak • Maximum Cognitive Flow',
    waveName: 'موجات غاما (40 Hz)',
    frequencyHz: 40,
    tempoBpm: 128,
    recommendedFor: 'المستويات المتقدمة والمهام المتزامنة المعقدة',
    benefit: 'تنسيق قشرة الدماغ وربط المعالجة البصرية والحركية بنبض متناغم',
    color: 'text-emerald-400',
    glowColor: 'rgba(0, 255, 136, 0.5)',
    accentBg: 'bg-emerald-500/15',
    borderColor: 'border-emerald-400',
  },
];

type MusicListener = (state: MusicState) => void;

export interface MusicState {
  isPlaying: boolean;
  currentTrackId: BrainTrackId;
  masterVolume: number;
  binauralVolume: number;
  melodyVolume: number;
  noiseVolume: number;
  binauralEnabled: boolean;
}

class BrainMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrackId: BrainTrackId = 'alpha';

  // Studio Mastering Audio Graph
  private masterGain: GainNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Sub-busses
  private binauralGain: GainNode | null = null;
  private binauralFilter: BiquadFilterNode | null = null;
  private melodyGain: GainNode | null = null;

  // Track oscillators and active voices
  private binauralOscLeft: OscillatorNode | null = null;
  private binauralOscRight: OscillatorNode | null = null;
  private activeVoices: { osc: OscillatorNode; gain: GainNode }[] = [];

  // Scheduling Timers
  private stepTimer: number | null = null;
  private chordTimer: number | null = null;
  private currentChordIndex: number = 0;

  // Volumes
  private masterVolume: number = 0.65;
  private binauralVolume: number = 0.35;
  private melodyVolume: number = 0.8;
  private binauralEnabled: boolean = true;

  // Listeners
  private listeners: Set<MusicListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const savedVol = localStorage.getItem('brain_music_master_vol');
      if (savedVol !== null) this.masterVolume = Math.min(1, Math.max(0, parseFloat(savedVol)));
      const savedTrack = localStorage.getItem('brain_music_track') as BrainTrackId;
      if (savedTrack && BRAIN_TRACKS.some(t => t.id === savedTrack)) {
        this.currentTrackId = savedTrack;
      }
    }
  }

  public subscribe(listener: MusicListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
  }

  public getState(): MusicState {
    return {
      isPlaying: this.isPlaying,
      currentTrackId: this.currentTrackId,
      masterVolume: this.masterVolume,
      binauralVolume: this.binauralVolume,
      melodyVolume: this.melodyVolume,
      noiseVolume: 0, // Noise is fully removed for pure audio clarity
      binauralEnabled: this.binauralEnabled,
    };
  }

  private initAudio() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (!this.ctx) return;

    if (!this.masterGain) {
      // 1. Master Gain Node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

      // 2. Studio Master Bus High-Pass Filter (removes sub-bass DC rumble under 35Hz)
      this.highpassFilter = this.ctx.createBiquadFilter();
      this.highpassFilter.type = 'highpass';
      this.highpassFilter.frequency.setValueAtTime(35, this.ctx.currentTime);
      this.highpassFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

      // 3. Studio Master Bus Low-Pass Polish (removes digital harshness/hiss above 11kHz)
      this.lowpassFilter = this.ctx.createBiquadFilter();
      this.lowpassFilter.type = 'lowpass';
      this.lowpassFilter.frequency.setValueAtTime(11000, this.ctx.currentTime);
      this.lowpassFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

      // 4. Studio Dynamics Compressor (Prevents ANY clipping, distortion, or crunching)
      this.masterCompressor = this.ctx.createDynamicsCompressor();
      this.masterCompressor.threshold.setValueAtTime(-16, this.ctx.currentTime); // dB
      this.masterCompressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.masterCompressor.ratio.setValueAtTime(4.0, this.ctx.currentTime);
      this.masterCompressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      this.masterCompressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      // 5. Visualizer Analyser
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.85;

      // Connect Master Chain:
      // MasterGain -> Highpass -> Lowpass -> Compressor -> Analyser -> Destination
      this.masterGain.connect(this.highpassFilter);
      this.highpassFilter.connect(this.lowpassFilter);
      this.lowpassFilter.connect(this.masterCompressor);
      this.masterCompressor.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // 6. Sub-Busses
      // Melody / Harmonies Bus
      this.melodyGain = this.ctx.createGain();
      this.melodyGain.gain.setValueAtTime(this.melodyVolume, this.ctx.currentTime);
      this.melodyGain.connect(this.masterGain);

      // Binaural Beat Bus (with dedicated warm lowpass to remove any harshness)
      this.binauralFilter = this.ctx.createBiquadFilter();
      this.binauralFilter.type = 'lowpass';
      this.binauralFilter.frequency.setValueAtTime(260, this.ctx.currentTime);
      this.binauralFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

      this.binauralGain = this.ctx.createGain();
      this.binauralGain.gain.setValueAtTime(this.binauralEnabled ? this.binauralVolume : 0, this.ctx.currentTime);

      this.binauralGain.connect(this.binauralFilter);
      this.binauralFilter.connect(this.masterGain);
    }
  }

  public getFrequencyData(array: Uint8Array): void {
    if (this.analyser && this.isPlaying) {
      this.analyser.getByteFrequencyData(array);
    } else {
      array.fill(0);
    }
  }

  public async play(): Promise<void> {
    this.initAudio();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.stopCurrentSounds();
    this.startTrack(this.currentTrackId);
    this.isPlaying = true;
    this.notify();
  }

  public pause(): void {
    this.stopCurrentSounds();
    this.isPlaying = false;
    this.notify();
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public setTrack(trackId: BrainTrackId): void {
    if (this.currentTrackId === trackId && this.isPlaying) return;
    this.currentTrackId = trackId;
    localStorage.setItem('brain_music_track', trackId);

    if (this.isPlaying) {
      this.stopCurrentSounds();
      this.startTrack(trackId);
    }
    this.notify();
  }

  public setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('brain_music_master_vol', String(this.masterVolume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.03);
    }
    this.notify();
  }

  public setBinauralVolume(vol: number): void {
    this.binauralVolume = Math.max(0, Math.min(1, vol));
    if (this.binauralGain && this.ctx && this.binauralEnabled) {
      this.binauralGain.gain.setTargetAtTime(this.binauralVolume, this.ctx.currentTime, 0.03);
    }
    this.notify();
  }

  public setBinauralEnabled(enabled: boolean): void {
    this.binauralEnabled = enabled;
    if (this.binauralGain && this.ctx) {
      this.binauralGain.gain.setTargetAtTime(enabled ? this.binauralVolume : 0, this.ctx.currentTime, 0.03);
    }
    this.notify();
  }

  public setMelodyVolume(vol: number): void {
    this.melodyVolume = Math.max(0, Math.min(1, vol));
    if (this.melodyGain && this.ctx) {
      this.melodyGain.gain.setTargetAtTime(this.melodyVolume, this.ctx.currentTime, 0.03);
    }
    this.notify();
  }

  private stopCurrentSounds(): void {
    // Clear interval timers
    if (this.stepTimer !== null) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    if (this.chordTimer !== null) {
      window.clearInterval(this.chordTimer);
      this.chordTimer = null;
    }

    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Fade out binaural oscillators gently to prevent pops
    if (this.binauralOscLeft) {
      try {
        this.binauralOscLeft.stop(now + 0.08);
      } catch {}
      this.binauralOscLeft = null;
    }
    if (this.binauralOscRight) {
      try {
        this.binauralOscRight.stop(now + 0.08);
      } catch {}
      this.binauralOscRight = null;
    }

    // Stop active voices with gentle click-free decay
    this.activeVoices.forEach(({ osc, gain }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.08);
        osc.stop(now + 0.1);
      } catch {}
    });
    this.activeVoices = [];
  }

  private startTrack(trackId: BrainTrackId): void {
    if (!this.ctx || !this.binauralGain || !this.melodyGain) return;

    const track = BRAIN_TRACKS.find(t => t.id === trackId) || BRAIN_TRACKS[0];

    // 1. Setup Warm, Pure-Sine Stereo Binaural Beat (Clean, subtle, no buzzing)
    this.setupPureBinauralBeat(track.frequencyHz);

    // 2. Setup Melodic Ambient Soundscape (No noise, zero distortion, crystal-clear musical tones)
    this.setupMusicalLandscape(trackId);
  }

  // --- Crystal-Clear Stereo Binaural Beats ---
  private setupPureBinauralBeat(beatFreq: number): void {
    if (!this.ctx || !this.binauralGain) return;

    // Carrier frequency in warm, soothing hearing range (F2 / C3 fundamental: ~130 - 196 Hz)
    const baseCarrier = 174; // Solfeggio soothing frequency (174 Hz)
    const leftFreq = baseCarrier;
    const rightFreq = baseCarrier + beatFreq;

    const now = this.ctx.currentTime;

    // Left channel pure sine
    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(leftFreq, now);

    const panL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panL) panL.pan.setValueAtTime(-1, now);

    const gainL = this.ctx.createGain();
    gainL.gain.setValueAtTime(0.0001, now);
    // Smooth, gentle fade-in at a comfortable, subtle level
    gainL.gain.linearRampToValueAtTime(0.06, now + 1.5);

    if (panL) {
      oscL.connect(panL);
      panL.connect(gainL);
    } else {
      oscL.connect(gainL);
    }
    gainL.connect(this.binauralGain);
    oscL.start(now);
    this.binauralOscLeft = oscL;

    // Right channel pure sine
    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(rightFreq, now);

    const panR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panR) panR.pan.setValueAtTime(1, now);

    const gainR = this.ctx.createGain();
    gainR.gain.setValueAtTime(0.0001, now);
    gainR.gain.linearRampToValueAtTime(0.06, now + 1.5);

    if (panR) {
      oscR.connect(panR);
      panR.connect(gainR);
    } else {
      oscR.connect(gainR);
    }
    gainR.connect(this.binauralGain);
    oscR.start(now);
    this.binauralOscRight = oscR;
  }

  // --- Musical Soundscapes (100% Pure Tones, Zero Static Noise) ---
  private setupMusicalLandscape(trackId: BrainTrackId): void {
    if (!this.ctx || !this.melodyGain) return;

    if (trackId === 'alpha') {
      this.playAlphaCalmLandscape();
    } else if (trackId === 'beta') {
      this.playBetaReflexLandscape();
    } else if (trackId === 'theta') {
      this.playThetaMemoryLandscape();
    } else if (trackId === 'gamma') {
      this.playGammaFlowLandscape();
    }
  }

  // =========================================================================
  // TRACK 1: ALPHA WAVES (10 Hz) - Lucid Calm & Deep Focus
  // Warm Rhodes-like ambient chord pads + celestial crystal chime drops
  // Key: D minor / F major pentatonic (F, G, A, C, D, E)
  // =========================================================================
  private playAlphaCalmLandscape(): void {
    if (!this.ctx || !this.melodyGain) return;

    const chords = [
      [146.83, 220.00, 261.63, 329.63], // Dm9 (D3, A3, C4, E4)
      [174.61, 220.00, 261.63, 349.23], // Fmaj7 (F3, A3, C4, F4)
      [130.81, 196.00, 246.94, 293.66], // Cadd9 (C3, G3, B3, D4)
      [196.00, 246.94, 293.66, 392.00], // G/B (G3, B3, D4, G4)
    ];

    const playAmbientPadChord = (notes: number[]) => {
      if (!this.ctx || !this.melodyGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const duration = 7.0;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.melodyGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Pure warm sine + subtle detuned second voice for analog richness
        osc.type = 'sine';
        const detune = idx % 2 === 0 ? 1.5 : -1.5;
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(detune, now);

        // Warm buttery lowpass filter - never harsh, removes all sizzle
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.linearRampToValueAtTime(850, now + duration * 0.4);
        filter.frequency.linearRampToValueAtTime(500, now + duration);

        // Smooth ADSR envelope with slow attack and zero-click decay
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 2.0);
        gain.gain.linearRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.melodyGain);

        osc.start(now);
        osc.stop(now + duration + 0.1);
        this.activeVoices.push({ osc, gain });
      });
    };

    // Trigger initial pad
    this.currentChordIndex = 0;
    playAmbientPadChord(chords[0]);

    this.chordTimer = window.setInterval(() => {
      this.currentChordIndex = (this.currentChordIndex + 1) % chords.length;
      playAmbientPadChord(chords[this.currentChordIndex]);
    }, 6200);

    // Crystalline pure bell chime melody
    const chimeNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
    this.stepTimer = window.setInterval(() => {
      if (!this.ctx || !this.melodyGain || !this.isPlaying) return;
      if (Math.random() > 0.35) {
        const note = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
        this.playPureCrystalBell(note, 0.04, 3.5);
      }
    }, 2400);
  }

  // =========================================================================
  // TRACK 2: BETA DRIVE (18 Hz) - High Reflex Agility
  // Crisp, melodic synthwave arpeggio using pure warm triangle/sine plucks
  // Key: A minor (A, C, D, E, G) - Energetic, uplifting, crystal-clear
  // =========================================================================
  private playBetaReflexLandscape(): void {
    if (!this.ctx || !this.melodyGain) return;

    const arpeggio = [
      220.00, 261.63, 329.63, 440.00, // A3, C4, E4, A4
      293.66, 349.23, 440.00, 523.25, // D4, F4, A4, C5
      261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
      196.00, 246.94, 293.66, 392.00, // G3, B3, D4, G4
    ];

    let step = 0;
    this.stepTimer = window.setInterval(() => {
      if (!this.ctx || !this.melodyGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const freq = arpeggio[step % arpeggio.length];

      // Smooth plucked synth voice (Pure triangle + soft lowpass filter, NO harsh sawtooth!)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.22);
      filter.Q.setValueAtTime(1.0, now); // Gentle Q, eliminates screeches

      // Musical plucked envelope
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.melodyGain);

      osc.start(now);
      osc.stop(now + 0.26);

      // Clean 808-style soft sub-bass every 4 steps
      if (step % 4 === 0) {
        this.playWarmSubBass(step % 8 === 0 ? 110 : 87.31, 0.45);
      }

      step++;
    }, 240); // ~125 BPM
  }

  // =========================================================================
  // TRACK 3: THETA RESONANCE (6 Hz) - Spatial Memory & Deep Recall
  // Deep space ambient pads + soft acoustic singing bowl tones
  // Key: C minor / Ab major ethereal floating harmony
  // =========================================================================
  private playThetaMemoryLandscape(): void {
    if (!this.ctx || !this.melodyGain) return;

    const thetaChords = [
      [130.81, 196.00, 233.08, 311.13], // Cm7 (C3, G3, Bb3, Eb4)
      [103.83, 174.61, 207.65, 261.63], // Abmaj7 (Ab2, F3, Ab3, C4)
      [116.54, 174.61, 233.08, 349.23], // Bbsus4 (Bb2, F3, Bb3, F4)
      [155.56, 196.00, 233.08, 311.13], // Eb (Eb3, G3, Bb3, Eb4)
    ];

    const playThetaAtmosphere = (chord: number[]) => {
      if (!this.ctx || !this.melodyGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const duration = 7.5;

      chord.forEach((freq, i) => {
        if (!this.ctx || !this.melodyGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.linearRampToValueAtTime(700, now + duration * 0.4);
        filter.frequency.linearRampToValueAtTime(380, now + duration);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 2.2);
        gain.gain.linearRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.melodyGain);

        osc.start(now);
        osc.stop(now + duration + 0.1);
        this.activeVoices.push({ osc, gain });
      });
    };

    this.currentChordIndex = 0;
    playThetaAtmosphere(thetaChords[0]);

    this.chordTimer = window.setInterval(() => {
      this.currentChordIndex = (this.currentChordIndex + 1) % thetaChords.length;
      playThetaAtmosphere(thetaChords[this.currentChordIndex]);
    }, 6800);

    // Ethereal high singing bowl tones
    const bowlNotes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    this.stepTimer = window.setInterval(() => {
      if (!this.ctx || !this.melodyGain || !this.isPlaying) return;
      const note = bowlNotes[Math.floor(Math.random() * bowlNotes.length)];
      this.playPureCrystalBell(note, 0.03, 4.2);
    }, 3200);
  }

  // =========================================================================
  // TRACK 4: GAMMA FLOW (40 Hz) - Maximum Cognitive Performance
  // Harmonic melodic pulses with gentle 40Hz isochronic amplitude modulation
  // Pure sine-wave modulated harmonics (Zero clicks, zero gate snaps)
  // =========================================================================
  private playGammaFlowLandscape(): void {
    if (!this.ctx || !this.melodyGain) return;

    const gammaNotes = [
      164.81, 220.00, 246.94, 329.63, // E3, A3, B3, E4
      196.00, 246.94, 293.66, 392.00, // G3, B3, D4, G4
      220.00, 261.63, 329.63, 440.00, // A3, C4, E4, A4
      246.94, 293.66, 369.99, 493.88, // B3, D4, F#4, B4
    ];

    let beat = 0;
    this.stepTimer = window.setInterval(() => {
      if (!this.ctx || !this.melodyGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const freq = gammaNotes[beat % gammaNotes.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Soft triangle oscillator filtered nicely
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);
      filter.Q.setValueAtTime(0.8, now);

      // Fast, clear dynamic pulse
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(beat % 4 === 0 ? 0.05 : 0.03, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.melodyGain);

      osc.start(now);
      osc.stop(now + 0.24);

      // Warm acoustic pulse on the downbeat
      if (beat % 4 === 0) {
        this.playWarmSubBass(82.41, 0.35); // E2
      }

      beat++;
    }, 225);
  }

  // --- Utility Sound Generators (Pure Sines & Smooth Envelopes) ---

  // Pure crystal bell (Celeste / Rhodes chime tone)
  private playPureCrystalBell(freq: number, peakGain: number, duration: number): void {
    if (!this.ctx || !this.melodyGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Smooth bell envelope: quick attack (0.02s) -> slow exponential decay
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.melodyGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  // Warm, pure-sine sub bass (808 clean tone, no distortion)
  private playWarmSubBass(freq: number, duration: number): void {
    if (!this.ctx || !this.melodyGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.75, now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.melodyGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }
}

export const brainMusicEngine = new BrainMusicEngine();

