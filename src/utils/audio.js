// ============================================================
// WEB AUDIO API SOUND SYNTHESIS (NO EXTERNAL AUDIO FILES)
// ============================================================

let audioCtx = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playTone = (freq, duration, type = "sine", gainVal = 0.15, enabled = true) => {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gainNode.gain.setValueAtTime(gainVal, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context not available or user didn't interact yet
  }
};

export const playMoveSound = (isO, enabled = true) => {
  if (!enabled) return;
  if (isO) {
    playTone(587.33, 0.12, "sine", 0.18, enabled); // D5
    setTimeout(() => playTone(880, 0.14, "triangle", 0.14, enabled), 35); // A5
  } else {
    playTone(392.00, 0.12, "sawtooth", 0.12, enabled); // G4
    setTimeout(() => playTone(329.63, 0.15, "triangle", 0.15, enabled), 45); // E4
  }
};

export const playWinSound = (enabled = true) => {
  if (!enabled) return;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 - E5 - G5 - C6
  notes.forEach((note, i) => {
    setTimeout(() => playTone(note, 0.28, "sine", 0.2, enabled), i * 110);
  });
};

export const playUndoSound = (enabled = true) => {
  if (!enabled) return;
  playTone(440, 0.08, "triangle", 0.12, enabled);
  setTimeout(() => playTone(330, 0.12, "sine", 0.12, enabled), 40);
};

export const playClickSound = (enabled = true) => {
  if (!enabled) return;
  playTone(700, 0.06, "sine", 0.1, enabled);
};
