import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productById } from "../data/products";
import { reviewsFor } from "../data/reviews";
import { useCart } from "../store/CartContext";
import { playPop, popConfetti } from "../lib/dopamine";

export default function ProductPage() {
  const { id } = useParams();
  const product = id ? productById(id) : undefined;
  const { add } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="empty">
        <div className="big">🫥</div>
        <h2>That product wandered off</h2>
        <Link to="/" className="btn primary" style={{ marginTop: 16 }}>
          Back to the store
        </Link>
      </div>
    );
  }

  const reviews = reviewsFor(product.id, 4);

  function addToCart() {
    add(product!);
    playPop();
    popConfetti(0.5, 0.4);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1100);
  }

  return (
    <>
      <Link to="/" className="back">
        ← Keep browsing
      </Link>

      <div className="pdp">
        <div className="hero-img popin" style={{ background: product.bg }}>
          {product.emoji}
        </div>

        <div>
          <div className="stars" style={{ fontSize: 15 }}>
            <span className="s">★★★★★</span>
            {product.rating} · {product.reviewCount.toLocaleString()} reviews
          </div>
          <h1 style={{ fontSize: 34, margin: "8px 0 4px" }}>{product.name}</h1>
          <div className="tagline" style={{ fontSize: 16 }}>
            {product.tagline}
          </div>
          {product.secondhand && (
            <div className="dw-chip" style={{ marginTop: 10 }}>
              ♻️ Thrifted{product.condition ? ` · ${product.condition}` : ""}
            </div>
          )}

          <div className="price-row" style={{ margin: "16px 0" }}>
            <span className="price" style={{ fontSize: 34 }}>
              ${product.price}
            </span>
            {product.was && <span className="was">${product.was}</span>}
            {product.was && (
              <span className="badge" style={{ background: "var(--pink-soft)", color: "var(--pink)" }}>
                Save ${product.was - product.price}
              </span>
            )}
          </div>

          <p style={{ fontWeight: 600, lineHeight: 1.5, color: "var(--ink-soft)" }}>
            {product.blurb}
          </p>

          <div style={{ margin: "16px 0" }}>
            {product.perks.map((perk) => (
              <div className="perk" key={perk}>
                <span className="dot">✔</span> {perk}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              className={`btn primary big ${added ? "added" : ""}`}
              onClick={addToCart}
            >
              {added ? "Added! 🎉" : "🛒 Add to cart"}
            </button>
            <button
              className="btn big ghost"
              onClick={() => {
                add(product);
                playPop();
                navigate("/checkout");
              }}
            >
              ⚡ Buy now
            </button>
          </div>
        </div>
      </div>

      <h2 className="section-title" style={{ marginTop: 34 }}>
        💬 What dopamine shoppers say
      </h2>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
        {reviews.map((r, i) => (
          <div className="panel" key={i} style={{ padding: 18 }}>
            <div className="review" style={{ margin: 0, background: "transparent", padding: 0 }}>
              <div className="top">
                <span className="av">{r.emoji}</span>
                <div>
                  <div>{r.name}</div>
                  <div className="s" style={{ color: "#ffb800", fontSize: 13 }}>
                    {"★".repeat(r.stars)}
                    {"☆".repeat(5 - r.stars)}
                  </div>
                </div>
              </div>
              <div style={{ fontWeight: 800, marginTop: 10 }}>{r.title}</div>
              <p style={{ margin: "6px 0 0", color: "var(--ink-soft)", fontWeight: 600 }}>
                {r.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
