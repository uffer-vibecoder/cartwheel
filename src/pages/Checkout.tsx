import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../store/CartContext";
import { useAuth } from "../store/AuthContext";
import { bigCelebration, playChaChing, playConfirm } from "../lib/dopamine";
import {
  MAX_WINDOW,
  MIN_WINDOW,
  formatWindow,
  randomWindow,
  windowPresets,
} from "../lib/time";

export type ActiveOrder = {
  name: string;
  address: string;
  city: string;
  items: { emoji: string; name: string }[];
  total: number;
  placedAt: number;
  windowSeconds: number;
  surprise: boolean;
};

export default function Checkout() {
  const { lines, subtotal, checkout } = useCart();
  const { recordDaydream } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    zip: "",
    card: "",
  });
  const [placing, setPlacing] = useState(false);
  const [windowSeconds, setWindowSeconds] = useState(30);
  const [surprise, setSurprise] = useState(false);

  function pickWindow(secs: number) {
    setWindowSeconds(secs);
    setSurprise(false);
    playConfirm();
  }

  function surpriseMe() {
    setWindowSeconds(randomWindow(Math.random()));
    setSurprise(true);
    playConfirm();
  }

  if (lines.length === 0 && !placing) {
    return (
      <div className="empty">
        <div className="big">🧾</div>
        <h2>Nothing to check out (yet)</h2>
        <Link to="/" className="btn primary big" style={{ marginTop: 16 }}>
          Go add some joy
        </Link>
      </div>
    );
  }

  const ready =
    form.name.trim() && form.address.trim() && form.city.trim() && form.zip.trim();

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function placeOrder() {
    if (!ready) return;
    setPlacing(true);
    playChaChing();
    bigCelebration();

    const order: ActiveOrder = {
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      items: lines.map((l) => ({ emoji: l.product.emoji, name: l.product.name })),
      total: subtotal,
      placedAt: Date.now(),
      windowSeconds,
      surprise,
    };
    try {
      sessionStorage.setItem("cartwheel.order", JSON.stringify(order));
    } catch {
      /* ignore */
    }
    // Record to the account's daydream history (no-op if signed out).
    void recordDaydream({
      total: subtotal,
      window_seconds: windowSeconds,
      surprise,
      items: order.items,
    });
    checkout(subtotal);
    window.setTimeout(() => navigate("/tracking"), 700);
  }

  return (
    <>
      <Link to="/cart" className="back">
        ← Back to cart
      </Link>
      <h1 className="section-title">🧾 Checkout</h1>

      <div className="layout-2">
        <div className="panel">
          <h3 style={{ marginBottom: 14 }}>🚚 Ship it to…</h3>
          <label className="field">
            <span>Full name</span>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Alex Dopamine"
            />
          </label>
          <label className="field">
            <span>Street address</span>
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Serotonin Ave"
            />
          </label>
          <div className="row-2">
            <label className="field">
              <span>City</span>
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Feelgood"
              />
            </label>
            <label className="field">
              <span>ZIP</span>
              <input
                value={form.zip}
                onChange={(e) => set("zip", e.target.value)}
                placeholder="00000"
                inputMode="numeric"
              />
            </label>
          </div>

          <h3 style={{ margin: "20px 0 12px" }}>⏱️ Delivery window</h3>
          <div className="dw-presets">
            {windowPresets.map((p) => (
              <button
                key={p.seconds}
                type="button"
                className={`chip ${!surprise && windowSeconds === p.seconds ? "active" : ""}`}
                onClick={() => pickWindow(p.seconds)}
              >
                {p.emoji} {p.label}
              </button>
            ))}
            <button
              type="button"
              className={`chip dice ${surprise ? "active" : ""}`}
              onClick={surpriseMe}
            >
              🎲 Surprise me
            </button>
          </div>

          <div className="dw-slider">
            <input
              type="range"
              min={MIN_WINDOW}
              max={MAX_WINDOW}
              step={5}
              value={windowSeconds}
              onChange={(e) => {
                setWindowSeconds(Number(e.target.value));
                setSurprise(false);
              }}
              aria-label="Custom delivery window"
            />
            <div className="dw-readout">
              <span className="dw-value">{formatWindow(windowSeconds)}</span>
              <span className="dw-sub">
                {surprise
                  ? "🎲 a mystery window — you won't know till checkout"
                  : windowSeconds <= 45
                  ? "watch it arrive in real time"
                  : "the tracker fast-forwards so you're not actually waiting"}
              </span>
            </div>
          </div>

          <h3 style={{ margin: "20px 0 12px" }}>💳 Payment</h3>
          <label className="field">
            <span>Card number (don't worry, it goes nowhere)</span>
            <input
              value={form.card}
              onChange={(e) => set("card", e.target.value)}
              placeholder="•••• •••• •••• 0000"
              inputMode="numeric"
            />
          </label>
          <div className="strike-note">
            🔒 This form is fake. Nothing is sent, stored, or charged. Type gibberish.
          </div>
        </div>

        <div className="panel">
          <h3 style={{ marginBottom: 12 }}>Order summary</h3>
          {lines.map((l) => (
            <div className="summary-row" key={l.product.id}>
              <span>
                {l.product.emoji} {l.product.name} × {l.qty}
              </span>
              <span>${l.product.price * l.qty}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ color: "var(--teal)" }}>FREE</span>
          </div>
          <div className="summary-row total">
            <span>You'll be "charged"</span>
            <span style={{ color: "var(--teal)" }}>$0.00</span>
          </div>
          <div style={{ textAlign: "right", color: "var(--ink-soft)", fontWeight: 700 }}>
            (pretend total ${subtotal.toLocaleString()})
          </div>

          <button
            className="btn primary big full"
            style={{ marginTop: 16 }}
            disabled={!ready || placing}
            onClick={placeOrder}
          >
            {placing ? "🎉 Placing order…" : "✨ Place order for $0"}
          </button>
        </div>
      </div>
    </>
  );
}
