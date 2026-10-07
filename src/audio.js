/**
 * LeggoFacile - Audio Synthesis & Speech Synthesis Engine
 * Pure Web Audio API: Zero external audio files, zero latency, offline-ready.
 */

let audioCtx = null;

export function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Playful cartoon raspberry sound effect on pronunciation mistakes.
 * Sdrammatizza l'errore con un buffo suono comico ad onda a dente di sega e LFO a vibrazione.
 */
export function playPlayfulRaspberry() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.linearRampToValueAtTime(75, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.42);

    // Low frequency flutter (LFO) for tongue/lip vibration effect
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'square';
    lfo.frequency.setValueAtTime(32, now);
    lfoGain.gain.setValueAtTime(40, now);
    lfo.connect(osc.frequency);
    lfo.start(now);
    lfo.stop(now + 0.43);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.44);
  } catch (err) {
    console.warn('Audio raspberry warning:', err);
  }
}

/**
 * Melodic celebration fanfare for word reading success (C5 -> E5 -> G5 -> C6).
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.35);
    });
  } catch (err) {
    console.warn('Audio chime warning:', err);
  }
}

/**
 * Playful popping note when child taps on an individual syllable badge.
 */
export function playSyllablePop(pitchIndex = 0) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const basePitches = [440, 523.25, 587.33, 659.25, 783.99]; // A4, C5, D5, E5, G5
    const freq = basePitches[pitchIndex % basePitches.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch (err) {
    console.warn('Audio pop warning:', err);
  }
}

/**
 * Text-to-Speech synthesis with slow rate for early readers.
 */
export function speakText(text, rate = 0.78, pitch = 1.05) {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'it-IT';
    utter.rate = rate;
    utter.pitch = pitch;
    window.speechSynthesis.speak(utter);
  } catch (err) {
    console.warn('TTS warning:', err);
  }
}
