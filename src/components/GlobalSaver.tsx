import { useEffect, useRef, useState } from "react";
import { useCart } from "../store/CartContext";

// "Saved worldwide" meter. On a visitor's first load it seeds a starting value in
// the low hundreds (persisted), then climbs gently in real time and folds in their
// own "money saved by not buying". Calm and readable — not a slot machine.
const SEED_KEY = "whim.global.v1";
const RATE = 0.4; // dollars/second — gentle, readable tick

type Seed = { base: number; ts: number };

function loadSeed(): Seed {
  try {
    const raw = localStorage.getItem(SEED_KEY);
    if (raw) {
      const s = JSON.parse(raw) as Seed;
      if (typeof s.base === "number" && typeof s.ts === "number") return s;
    }
  } catch {
    /* ignore */
  }
  // First visit: start somewhere in the low hundreds.
  const s: Seed = { base: 180 + Math.floor(Math.random() * 600), ts: Date.now() };
  try {
    localStorage.setItem(SEED_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
  return s;
}

function compute(seed: Seed, userSaved: number): number {
  const secs = Math.max(0, (Date.now() - seed.ts) / 1000);
  return seed.base + secs * RATE + userSaved;
}

export default function GlobalSaver() {
  const { savedTotal } = useCart();
  const seedRef = useRef<Seed | null>(null);
  if (!seedRef.current) seedRef.current = loadSeed();
  const [val, setVal] = useState(() => compute(seedRef.current!, savedTotal));
  const savedRef = useRef(savedTotal);
  savedRef.current = savedTotal;

  useEffect(() => {
    const seed = seedRef.current!;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const tick = () => setVal(compute(seed, savedRef.current));
      tick();
      const timer = window.setInterval(tick, 3000);
      return () => clearInterval(timer);
    }
    let raf = 0;
    const loop = () => {
      setVal(compute(seed, savedRef.current));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const perMinute = Math.round(RATE * 60);

  return (
    <section className="global-saver" aria-label="Money saved worldwide, live">
      <div className="gs-label">
        <span className="gs-live" /> Saved by not buying · worldwide, live
      </div>
      <div className="gs-amount" aria-live="off">
        ${Math.floor(val).toLocaleString()}
      </div>
      <div className="gs-footrow">
        <span className="gs-chip">≈ ${perMinute.toLocaleString()}/min</span>
        <span className="gs-sub">…and counting. Every cart you don't check out adds to it. 🎉</span>
      </div>
    </section>
  );
}
