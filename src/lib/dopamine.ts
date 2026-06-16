import confetti from "canvas-confetti";

const PINK = ["#ff5da2", "#ffd23f", "#7c5cff", "#3dd6c4", "#ff8a5c", "#7CFC98"];

/** A quick celebratory burst — used on add-to-cart. */
export function popConfetti(x = 0.5, y = 0.5) {
  confetti({
    particleCount: 60,
    spread: 70,
    startVelocity: 35,
    origin: { x, y },
    colors: PINK,
    scalar: 0.9,
    disableForReducedMotion: true,
  });
}

/** A big, prolonged celebration — used at order placed / delivered. */
export function bigCelebration() {
  const end = Date.now() + 900;
  const frame = () => {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
      colors: PINK,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
      colors: PINK,
      disableForReducedMotion: true,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

/**
 * Fling a product emoji from (x, y) toward the cart pill (#cart-target) with a
 * little arc, then pop it out of existence. Pure motion sugar; respects reduced motion.
 */
export function flyToCart(emoji: string, x: number, y: number) {
  if (typeof document === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.getElementById("cart-target");
  if (!target) return;
  const r = target.getBoundingClientRect();
  const tx = r.left + r.width / 2;
  const ty = r.top + r.height / 2;

  const node = document.createElement("div");
  node.textContent = emoji;
  node.style.cssText = `position:fixed;left:${x}px;top:${y}px;font-size:34px;z-index:200;pointer-events:none;will-change:transform,opacity;transform:translate(-50%,-50%)`;
  document.body.appendChild(node);

  const midX = (x + tx) / 2;
  const arc = Math.min(y, ty) - 90;
  node
    .animate(
      [
        { transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: 0 },
        {
          transform: `translate(${midX - x - node.offsetWidth / 2}px, ${arc - y}px) scale(1.25)`,
          opacity: 1,
          offset: 0.5,
        },
        {
          transform: `translate(${tx - x}px, ${ty - y}px) scale(0.25)`,
          opacity: 0.2,
          offset: 1,
        },
      ],
      { duration: 650, easing: "cubic-bezier(.5,-0.2,.5,1)" }
    )
    .addEventListener("finish", () => {
      node.remove();
      target.classList.remove("bump");
      // force reflow so the animation can replay on rapid adds
      void target.offsetWidth;
      target.classList.add("bump");
    });
}

// ---- Sound: tiny synthesized blips, no assets needed ----

let ac: AudioContext | null = null;
const SOUND_KEY = "cartwheel.sound";
let soundOn = ((): boolean => {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
})();

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ac) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (AC) ac = new AC();
  }
  // Browsers start the context suspended until a user gesture; nudge it awake.
  if (ac && ac.state === "suspended") ac.resume().catch(() => {});
  return ac;
}

export function setSound(on: boolean) {
  soundOn = on;
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
  if (on) ctx(); // resume on the enabling gesture
}
export function isSoundOn() {
  return soundOn;
}

type BlipOpts = {
  dur?: number;
  type?: OscillatorType;
  to?: number; // glide to this frequency
  gain?: number;
};

function blip(freq: number, t0: number, opts: BlipOpts = {}) {
  const a = ctx();
  if (!a) return;
  const { dur = 0.12, type = "sine", to, gain = 0.22 } = opts;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** Rising "added!" chirp with a little sparkle on top. */
export function playPop() {
  if (!soundOn) return;
  const a = ctx();
  if (!a) return;
  const now = a.currentTime;
  blip(620, now, { dur: 0.1, type: "triangle", to: 980 });
  blip(1320, now + 0.07, { dur: 0.14, type: "sine", gain: 0.14 });
}

/** Bright coin "ding" for the savings tally / small wins. */
export function playCoin() {
  if (!soundOn) return;
  const a = ctx();
  if (!a) return;
  const now = a.currentTime;
  blip(1180, now, { dur: 0.08, type: "square", gain: 0.16 });
  blip(1560, now + 0.05, { dur: 0.22, type: "triangle", gain: 0.16 });
}

/** Soft confirming "ba-dum" when a delivery window is locked in. */
export function playConfirm() {
  if (!soundOn) return;
  const a = ctx();
  if (!a) return;
  const now = a.currentTime;
  blip(440, now, { dur: 0.1, type: "sine" });
  blip(660, now + 0.08, { dur: 0.16, type: "sine" });
}

/** Cha-ching cash-register flourish for checkout. */
export function playChaChing() {
  if (!soundOn) return;
  const a = ctx();
  if (!a) return;
  const now = a.currentTime;
  // two-tone register "ka-ching"
  blip(784, now, { dur: 0.09, type: "square", gain: 0.18 });
  blip(1047, now + 0.05, { dur: 0.1, type: "square", gain: 0.18 });
  // shimmer up
  blip(1318, now + 0.13, { dur: 0.18, type: "triangle", to: 2093, gain: 0.16 });
  blip(1976, now + 0.16, { dur: 0.26, type: "sine", gain: 0.12 });
}

/** Warm rising arrival arpeggio for "delivered". */
export function playArrived() {
  if (!soundOn) return;
  const a = ctx();
  if (!a) return;
  const now = a.currentTime;
  [523, 659, 784, 1047, 1319].forEach((f, i) =>
    blip(f, now + i * 0.08, { dur: 0.4, type: "sine", gain: 0.16 })
  );
}
