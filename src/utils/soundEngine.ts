/**
 * Procedural Web Audio Synthesizer & Playful Kids' Background Music Loop
 * Works reliably across mobile browsers and Android WebViews with zero external audio files.
 */
class BakerySoundEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled = true;
  private musicEnabled = true;
  private musicTimer: number | null = null;
  private melodyStep = 0;

  // Cheerful C-Major pentatonic bakery xylophone melody
  private readonly MELODY: Array<number | null> = [
    523.25, 659.25, 783.99, 659.25,
    880.0, 783.99, 659.25, null,
    587.33, 659.25, 783.99, 1046.5,
    880.0, 783.99, 523.25, null,
  ];

  private readonly BASS: Array<number | null> = [
    261.63, null, 196.0, null,
    220.0, null, 196.0, null,
    174.61, null, 196.0, null,
    261.63, null, 196.0, null,
  ];

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlockAndStartMusic() {
    this.ensureContext();
    if (this.musicEnabled) {
      this.startMusicLoop();
    }
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.ensureContext();
      this.startMusicLoop();
    } else {
      this.stopMusicLoop();
    }
  }

  public startMusicLoop() {
    if (!this.musicEnabled || this.musicTimer !== null) return;
    if (typeof window === 'undefined') return;
    this.musicTimer = window.setInterval(() => {
      if (!this.musicEnabled) return;
      const ctx = this.ctx;
      if (!ctx || ctx.state !== 'running') return;

      const idx = this.melodyStep % this.MELODY.length;
      const note = this.MELODY[idx];
      const bass = this.BASS[idx];
      this.melodyStep++;

      if (note) {
        this.playRawTone(note, 'triangle', 0.22, 0, 0.032);
      }
      if (bass) {
        this.playRawTone(bass, 'sine', 0.28, 0, 0.038);
      }
    }, 290);
  }

  public stopMusicLoop() {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playRawTone(
    freq: number,
    type: OscillatorType = 'sine',
    duration = 0.22,
    delay = 0,
    volume = 0.14,
    slideTo: number | null = null
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  public playTrayPop(progressRatio = 0.5) {
    if (!this.sfxEnabled) return;
    const base = 290 + Math.min(Math.max(progressRatio, 0), 1.3) * 290;
    this.playRawTone(base, 'sine', 0.13, 0, 0.19, base * 1.45);
    this.playRawTone(base * 1.5, 'triangle', 0.09, 0.02, 0.07);
  }

  public playSubtract() {
    if (!this.sfxEnabled) return;
    this.playRawTone(410, 'triangle', 0.15, 0, 0.16, 175);
  }

  public playWobble() {
    if (!this.sfxEnabled) return;
    this.playRawTone(210, 'sawtooth', 0.12, 0, 0.08, 150);
    this.playRawTone(170, 'sawtooth', 0.14, 0.11, 0.08, 130);
  }

  public playServeSuccess() {
    if (!this.sfxEnabled) return;
    // Bakery bell + happy triad
    const notes = [880, 1046.5, 1318.5, 1567.98];
    notes.forEach((f, idx) => {
      this.playRawTone(f, 'triangle', 0.36, idx * 0.06, 0.17);
    });
  }

  public playCoin() {
    if (!this.sfxEnabled) return;
    this.playRawTone(987.77, 'sine', 0.16, 0, 0.15);
    this.playRawTone(1318.51, 'sine', 0.25, 0.07, 0.17);
  }

  public playStarDing(starIndex = 0) {
    if (!this.sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const freq = notes[starIndex % notes.length];
    this.playRawTone(freq, 'triangle', 0.42, 0, 0.19);
    this.playRawTone(freq * 2, 'sine', 0.22, 0.015, 0.07);
  }

  public playPop(pitchMult = 1) {
    if (!this.sfxEnabled) return;
    const base = (320 + Math.random() * 140) * pitchMult;
    this.playRawTone(base, 'sine', 0.12, 0, 0.18, base * 1.9);
  }

  public playBubblePop() {
    if (!this.sfxEnabled) return;
    const base = 360 + Math.random() * 220;
    this.playRawTone(base, 'sine', 0.11, 0, 0.17, base * 2.15);
  }

  public playPinataFanfare() {
    if (!this.sfxEnabled) return;
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    chord.forEach((f, i) => {
      this.playRawTone(f, 'triangle', 0.42, i * 0.075, 0.16);
    });
  }

  public playTreasureFanfare() {
    if (!this.sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    notes.forEach((f, i) => {
      this.playRawTone(f, 'sine', 0.45, i * 0.085, 0.17);
    });
  }

  public playSplashNote(idx: number) {
    if (!this.sfxEnabled) return;
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const freq = scale[idx % scale.length];
    this.playRawTone(freq, 'triangle', 0.34, 0, 0.18);
    this.playRawTone(freq * 1.5, 'sine', 0.18, 0.02, 0.07);
  }

  public playClick() {
    if (!this.sfxEnabled) return;
    this.playRawTone(620, 'sine', 0.07, 0, 0.12, 780);
  }
}

export const soundEngine = new BakerySoundEngine();
