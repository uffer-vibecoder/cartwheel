import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { formatWindow } from "../lib/time";
import { playConfirm } from "../lib/dopamine";

export default function Account() {
  const { mode, signedIn, profile, history, signInWithEmail, signInLocal, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

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

          {mode === "supabase" ? (
            sent ? (
              <div className="strike-note" style={{ justifyContent: "center", marginTop: 18 }}>
                📬 Magic link sent! Check your email to finish signing in.
              </div>
            ) : (
              <div style={{ marginTop: 16, textAlign: "left" }}>
                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    onKeyDown={(e) => e.key === "Enter" && handleEmail()}
                  />
                </label>
                <button className="btn primary big full" disabled={busy} onClick={handleEmail}>
                  {busy ? "Sending…" : "✨ Email me a magic link"}
                </button>
              </div>
            )
          ) : (
            <div style={{ marginTop: 16, textAlign: "left" }}>
              <label className="field">
                <span>Pick a name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="dopamine_enjoyer"
                  onKeyDown={(e) => e.key === "Enter" && (playConfirm(), signInLocal(name))}
                />
              </label>
              <button
                className="btn primary big full"
                onClick={() => {
                  playConfirm();
                  signInLocal(name);
                }}
              >
                🎉 Start my whim profile
              </button>
              <p style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 700, marginTop: 10 }}>
                Saved on this device for now. Cross-device sign-in turns on once accounts go live.
              </p>
            </div>
          )}
        </div>
      </>
    );
  }

  // ── Signed in ───────────────────────────────────────────────────────────
  const totalDaydreams = history.length;
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
    </>
  );
}
