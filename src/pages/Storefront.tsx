import { useMemo, useState } from "react";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import AdSlot from "../components/AdSlot";

const floaties = [
  { e: "🛍️", top: "12%", left: "70%", d: "0s" },
  { e: "✨", top: "55%", left: "82%", d: "1.2s" },
  { e: "💸", top: "26%", left: "90%", d: "0.6s" },
  { e: "🎉", top: "68%", left: "60%", d: "1.8s" },
  { e: "🪙", top: "10%", left: "52%", d: "2.4s" },
];

export default function Storefront() {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    []
  );
  const [active, setActive] = useState("All");

  const shown = active === "All" ? products : products.filter((p) => p.category === active);

  return (
    <>
      <section className="hero">
        <div className="floaties">
          {floaties.map((f, i) => (
            <span key={i} style={{ top: f.top, left: f.left, animationDelay: f.d }}>
              {f.e}
            </span>
          ))}
        </div>
        <h1>All the shopping. None of the spending.</h1>
        <p>
          Browse, add to cart, smash checkout, and watch it ship to your door — then nothing
          arrives and your bank account stays perfect. Welcome to the haul without the bill.
        </p>
        <div className="badge-row">
          <span className="badge">🛒 $0.00 charged, ever</span>
          <span className="badge">🚚 Live fake delivery tracking</span>
          <span className="badge">🧠 100% real dopamine</span>
        </div>
      </section>

      <div className="chips">
        {categories.map((c) => (
          <button
            key={c}
            className={`chip ${active === c ? "active" : ""}`}
            onClick={() => setActive(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <AdSlot seed={0} />

      <div className="grid">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
