import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./store/CartContext";
import { useAuth } from "./store/AuthContext";
import { isSoundOn, playCoin, setSound } from "./lib/dopamine";
import AdSlot from "./components/AdSlot";
import Storefront from "./pages/Storefront";
import ProductPage from "./pages/Product";
import CartPage from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Tracking from "./pages/Tracking";
import About from "./pages/About";
import Account from "./pages/Account";

function Header() {
  const { itemCount, savedTotal } = useCart();
  const { signedIn, profile } = useAuth();
  const [sound, setS] = useState(isSoundOn());
  const navigate = useNavigate();

  // Bump the cart badge whenever the item count changes.
  const countRef = useRef<HTMLSpanElement>(null);
  const prevCount = useRef(itemCount);
  useEffect(() => {
    if (itemCount !== prevCount.current && countRef.current) {
      const el = countRef.current;
      el.classList.remove("pulse-num");
      void el.offsetWidth;
      el.classList.add("pulse-num");
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  // Chime + bump the savings tally when it grows.
  const savedRef = useRef<HTMLSpanElement>(null);
  const prevSaved = useRef(savedTotal);
  useEffect(() => {
    if (savedTotal > prevSaved.current) {
      playCoin();
      const el = savedRef.current;
      if (el) {
        el.classList.remove("pulse-num");
        void el.offsetWidth;
        el.classList.add("pulse-num");
      }
    }
    prevSaved.current = savedTotal;
  }, [savedTotal]);

  return (
    <header className="header">
      <Link to="/" className="logo">
        <span className="mark">🛒</span>
        <span>
          whim<b>.</b>
        </span>
      </Link>
      <div className="spacer" />
      {savedTotal > 0 && (
        <span ref={savedRef} className="pill saved" title="Money you didn't actually spend">
          🪙 ${savedTotal.toLocaleString()} saved
        </span>
      )}
      <button
        className="icon-btn"
        title={sound ? "Mute sounds" : "Unmute sounds"}
        onClick={() => {
          const next = !sound;
          setSound(next);
          setS(next);
        }}
      >
        {sound ? "🔊" : "🔇"}
      </button>
      <button
        className="icon-btn"
        title={signedIn ? `Signed in as ${profile?.display_name}` : "Sign in"}
        onClick={() => navigate("/account")}
      >
        {signedIn ? profile?.avatar_emoji ?? "🙂" : "👤"}
      </button>
      <button id="cart-target" className="pill cart-pill" onClick={() => navigate("/cart")}>
        🛍️ Cart <span ref={countRef} className="count">{itemCount}</span>
      </button>
    </header>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <div className="app">
      <Header />
      <main key={location.pathname} className="page">
        <Routes location={location}>
          <Route path="/" element={<Storefront />} />
          <Route path="/p/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/about" element={<About />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </main>
      <footer className="footer">
        <AdSlot seed={1} />
        <nav style={{ marginTop: 20, display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/about" style={{ fontWeight: 800, color: "var(--purple)" }}>
            About
          </Link>
          <a
            href="mailto:hello@trywhim.fun"
            style={{ fontWeight: 800, color: "var(--purple)" }}
          >
            Contact
          </a>
        </nav>
        <div style={{ marginTop: 14 }}>
          whim is a <b>dopamine store</b> — a joyful parody. Nothing is for sale, no card is
          charged, nothing ships. 💸
        </div>
        <div>Treat yourself to the <i>idea</i> of it. All the thrill of the haul, none of the bill.</div>
      </footer>
    </div>
  );
}
