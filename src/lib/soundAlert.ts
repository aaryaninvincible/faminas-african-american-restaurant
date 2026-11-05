// Synthesized Restaurant Kitchen Order Bell / Chime using Web Audio API
// Requires zero external audio files and works reliably in all modern browsers.

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function playNewOrderAlertSound(): boolean {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const now = ctx.currentTime;

    // Two-tone warm brass hospitality bell chime (D5 -> A5 -> D6)
    const notes = [
      { freq: 587.33, start: 0, duration: 0.35, gain: 0.28 },
      { freq: 880.0, start: 0.18, duration: 0.45, gain: 0.32 },
      { freq: 1174.66, start: 0.38, duration: 0.75, gain: 0.26 },
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const harmonic = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.start);

      harmonic.type = 'triangle';
      harmonic.frequency.setValueAtTime(note.freq * 2, now + note.start);

      gainNode.gain.setValueAtTime(0.0001, now + note.start);
      gainNode.gain.exponentialRampToValueAtTime(note.gain, now + note.start + 0.025);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);

      osc.connect(gainNode);
      harmonic.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + note.start);
      harmonic.start(now + note.start);
      osc.stop(now + note.start + note.duration + 0.05);
      harmonic.stop(now + note.start + note.duration + 0.05);
    }

    return true;
  } catch (err) {
    console.warn('Order alert sound playback notice:', err);
    return false;
  }
}
