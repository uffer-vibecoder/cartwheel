import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import DeliveryMap from "../components/DeliveryMap";
import { bigCelebration, playArrived } from "../lib/dopamine";
import { formatEta, formatWindow, realDurationFor } from "../lib/time";
import type { ActiveOrder } from "./Checkout";

const STEPS = [
  { at: 0, label: "Order placed", sub: "Your $0 went through. Nice.", icon: "✅" },
  { at: 0.08, label: "Packed with love", sub: "Bubble wrap, imaginary care", icon: "📦" },
  { at: 0.32, label: "Out for delivery", sub: "Driver is en route to you", icon: "🚚" },
  { at: 0.78, label: "Almost there", sub: "Turning onto your street", icon: "📍" },
  { at: 1, label: "Delivered!", sub: "...to a parallel universe", icon: "🎉" },
];

function loadOrder(): ActiveOrder | null {
  try {
    const raw = sessionStorage.getItem("cartwheel.order");
    return raw ? (JSON.parse(raw) as ActiveOrder) : null;
  } catch {
    return null;
  }
}

export default function Tracking() {
  const [order] = useState<ActiveOrder | null>(loadOrder);
  const [progress, setProgress] = useState(0);
  const speedRef = useRef(1);
  const progRef = useRef(0);
  const celebrated = useRef(false);

  useEffect(() => {
    if (!order) return;
    const duration = realDurationFor(order.windowSeconds);
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      progRef.current = Math.min(1, progRef.current + (dt / duration) * speedRef.current);
      setProgress(progRef.current);
      if (progRef.current >= 1) {
        if (!celebrated.current) {
          celebrated.current = true;
          playArrived();
          bigCelebration();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [order]);

  if (!order) {
    return (
      <div className="empty">
        <div className="big">📦❓</div>
        <h2>No order to track</h2>
        <p style={{ color: "var(--ink-soft)", fontWeight: 700 }}>
          Place a (free) order and the little truck will appear.
        </p>
        <Link to="/" className="btn primary big" style={{ marginTop: 16 }}>
          Go shopping
        </Link>
      </div>
    );
  }

  const delivered = progress >= 1;
  const currentIdx = STEPS.reduce((acc, s, i) => (progress >= s.at ? i : acc), 0);
  const fictionalRemaining = order.windowSeconds * (1 - progress);
  const etaText = delivered ? "Delivered 🎉" : formatEta(fictionalRemaining);

  return (
    <>
      <h1 className="section-title">{delivered ? "🎉 It's here (sort of)" : "🚚 On its way!"}</h1>

      <div className="track-wrap">
        <DeliveryMap progress={progress} />

        <div className="panel">
          <div style={{ color: "var(--ink-soft)", fontWeight: 800, fontSize: 13 }}>
            {delivered ? "STATUS" : "ESTIMATED ARRIVAL"}
          </div>
          <div className="eta-big" style={{ color: delivered ? "var(--teal)" : "var(--pink)" }}>
            {etaText}
          </div>
          <div style={{ fontWeight: 700, color: "var(--ink-soft)", marginTop: 4 }}>
            To {order.name} · {order.address}, {order.city}
          </div>
          <div className="dw-chip">
            {order.surprise ? "🎲 You rolled a" : "⏱️ Your window:"}{" "}
            <b>{formatWindow(order.windowSeconds)}</b>
            {order.surprise && " window"}
          </div>

          <div className="steps">
            {STEPS.map((s, i) => {
              const cls =
                i < currentIdx ? "done" : i === currentIdx ? "active" : "pending";
              return (
                <div className={`step ${cls}`} key={s.label}>
                  <span className="bullet">{i <= currentIdx ? s.icon : "•"}</span>
                  <div>
                    <div className="label">{s.label}</div>
                    <div className="sub">{s.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {!delivered && (
            <button
              className="btn full"
              onClick={() => (speedRef.current = 8)}
              style={{ marginTop: 6 }}
            >
              ⚡ I can't wait — speed it up
            </button>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 22 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <strong style={{ fontFamily: "Baloo 2" }}>In this delivery:</strong>
          {order.items.map((it, i) => (
            <span className="badge" key={i} style={{ background: "var(--paper)", color: "var(--ink)", border: "2px solid var(--line)" }}>
              {it.emoji} {it.name}
            </span>
          ))}
        </div>

        {delivered && (
          <div className="strike-note popin" style={{ marginTop: 16 }}>
            📭 Plot twist: nothing actually arrived — and your bank balance is exactly the
            same. You got the whole dopamine hit for ${order.total.toLocaleString()} of free.
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <Link to="/" className="btn primary big">
            🛒 Do it again
          </Link>
          {delivered && (
            <span className="pill saved" style={{ alignSelf: "center" }}>
              🪙 You've now "saved" real money by feeling this instead
            </span>
          )}
        </div>
      </div>
    </>
  );
}
