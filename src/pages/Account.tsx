import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { formatWindow } from "../lib/time";
import { playConfirm } from "../lib/dopamine";
import { products, productById } from "../data/products";
import ProductImage from "../components/ProductImage";

export default function Account() {
  const { mode, signedIn, profile, history, collected, startProfile, signInWithEmail, signOut } =
    useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [startErr, setStartErr] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Surface any auth error Supabase appended to the redirect (query or hash).
  useEffect(() => {
    const fromHash = window.location.hash.includes("error")
      ? window.location.hash.replace(/^#\/?/, "?")
      : "";
    const params = new URLSearchParams(window.location.search || fromHash);
    const err = params.get("error_description") || params.get("error");
    if (err) setUrlError(err.replace(/\+/g, " "));
  }, []);

  async function handleStart() {
    playConfirm();
    setStartErr(null);
    setBusy(true);
    const err = await startProfile(name);
    setBusy(false);
    setStartErr(err);
  }

  async function handleEmail() {
    if (!email.trim()) return;
    setBusy(true);
    const ok = await signInWithEmail(email.trim());
    setBusy(false);
    if (ok) setSent(true);
  }

  // ── Signed out ──────────────────────────────────────────────────────────
  if (!signedIn) {
    return (
      <>
        <Link to="/" className="back">← Back to the store</Link>
        <div className="panel" style={{ maxWidth: 460, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 54 }}>🛒</div>
          <h1 style={{ fontFamily: "Baloo 2", margin: "4px 0 6px" }}>Join whim</h1>
          <p style={{ color: "var(--ink-soft)", fontWeight: 700, marginTop: 0 }}>
            Save your daydream history and your "money saved by not buying" — across every visit.
          </p>

          {(urlError || startErr) && (
            <div
              className="strike-note"
              style={{ justifyContent: "center", marginBottom: 14, color: "var(--pink)" }}
            >
              ⚠️ {startErr || urlError}
            </div>
          )}

          {/* Primary: instant profile, just a name. */}
          <div style={{ marginTop: 6, textAlign: "left" }}>
            <label className="field">
              <span>Pick a name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="dopamine_enjoyer"
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
            </label>
            <button className="btn primary big full" disabled={busy} onClick={handleStart}>
              {busy ? "Starting…" : "🎉 Start my whim profile"}
            </button>
          </div>

          {mode === "supabase" ? (
            <div style={{ marginTop: 14 }}>
              {sent ? (
                <div className="strike-note" style={{ justifyContent: "center" }}>
                  📬 Magic link sent! Check your email to sync this profile.
                </div>
              ) : showEmail ? (
                <div style={{ textAlign: "left" }}>
                  <label className="field">
                    <span>Email — sync across devices</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      onKeyDown={(e) => e.key === "Enter" && handleEmail()}
                    />
                  </label>
                  <button className="btn full" disabled={busy} onClick={handleEmail}>
                    {busy ? "Sending…" : "✨ Email me a magic link"}
                  </button>
                </div>
              ) : (
                <button
                  className="btn ghost full"
                  onClick={() => setShowEmail(true)}
                  style={{ fontSize: 14 }}
                >
                  Have an email? Sync across devices →
                </button>
              )}
              <p style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 700, marginTop: 10 }}>
                Your profile saves to the cloud, tied to this browser. Add an email anytime to use
                it on other devices.
              </p>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 700, marginTop: 10 }}>
              Saved on this device. Cloud sync turns on once Supabase keys are added.
            </p>
          )}
        </div>
      </>
    );
  }

  // ── Signed in ───────────────────────────────────────────────────────────
  const totalDaydreams = history.length;
  const limitedTotal = products.filter((p) => p.limited).length;
  return (
    <>
      <Link to="/" className="back">← Back to the store</Link>
      <div className="layout-2">
        <div className="panel">
          <h2 className="section-title" style={{ marginTop: 0 }}>🧾 Your daydreams</h2>
          {totalDaydreams === 0 ? (
            <div className="empty" style={{ padding: "30px 10px" }}>
              <div className="big">🛍️💭</div>
              <p style={{ color: "var(--ink-soft)", fontWeight: 700 }}>
                No daydreams yet. Go place a (free) order and it'll show up here.
              </p>
              <Link to="/" className="btn primary">Start daydreaming</Link>
            </div>
          ) : (
            history.map((d) => (
              <div className="cart-line" key={d.id}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>
                    {d.items.slice(0, 4).map((i) => i.emoji).join(" ")}{" "}
                    <span style={{ color: "var(--ink-soft)", fontWeight: 700 }}>
                      · {d.items.length} item{d.items.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="tagline">
                    {new Date(d.placed_at).toLocaleDateString()} · {formatWindow(d.window_seconds)}{" "}
                    window{d.surprise ? " · 🎲" : ""}
                  </div>
                </div>
                <div style={{ fontWeight: 800 }}>${d.total.toLocaleString()}</div>
              </div>
            ))
          )}
        </div>

        <div className="panel">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 44 }}>{profile?.avatar_emoji ?? "🛒"}</div>
            <h2 style={{ fontFamily: "Baloo 2", margin: "2px 0" }}>{profile?.display_name}</h2>
            <span className="dw-chip">{mode === "supabase" ? "☁️ Synced account" : "📍 On this device"}</span>
          </div>
          <div className="summary-row total" style={{ marginTop: 16 }}>
            <span>Saved by not buying</span>
            <span style={{ color: "var(--teal)" }}>${(profile?.saved_total ?? 0).toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Daydreams placed</span>
            <span>{totalDaydreams}</span>
          </div>
          <button className="btn full" style={{ marginTop: 16 }} onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 22 }}>
        <h2 className="section-title" style={{ marginTop: 0 }}>
          🏆 Your drop collection
          <span className="dw-chip" style={{ marginLeft: 10 }}>
            {collected.length} / {limitedTotal} caught
          </span>
        </h2>
        {collected.length === 0 ? (
          <div className="empty" style={{ padding: "28px 10px" }}>
            <div className="big">🗃️✨</div>
            <p style={{ color: "var(--ink-soft)", fontWeight: 700 }}>
              No drops caught yet. Find a <b>⏳ Limited</b> item and hit “Collect this drop” to
              start your trophy case.
            </p>
            <Link to="/" className="btn primary">
              Hunt for drops
            </Link>
          </div>
        ) : (
          <div className="collection-grid">
            {collected.map((c) => {
              const p = productById(c.product_id);
              if (!p) return null;
              return (
                <Link to={`/p/${p.id}`} className="collect-card" key={c.product_id}>
                  <div className="collect-thumb" style={{ background: p.bg }}>
                    <ProductImage product={p} w={240} h={240} emojiSize={40} />
                  </div>
                  <div className="collect-name">{p.name}</div>
                  <div className="tagline" style={{ fontSize: 11 }}>
                    caught {new Date(c.collected_at).toLocaleDateString()}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
