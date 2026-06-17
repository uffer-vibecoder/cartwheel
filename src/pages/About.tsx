import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      <Link to="/" className="back">
        ← Back to the store
      </Link>

      <section className="hero" style={{ marginTop: 4 }}>
        <h1>About whim</h1>
        <p>
          whim is a <b>dopamine store</b> — a joyful little parody of online shopping. You
          browse, add to cart, "check out," and watch it ship to your door… except nothing is
          ever charged and nothing ever arrives. All the thrill of the haul, none of the bill.
        </p>
        <div className="badge-row">
          <span className="badge">🛒 $0.00 charged, ever</span>
          <span className="badge">📦 Nothing ever ships</span>
          <span className="badge">🧠 100% real dopamine</span>
        </div>
      </section>

      <h2 className="section-title">🌈 Why we made it</h2>
      <div className="panel" style={{ marginBottom: 18 }}>
        <p style={{ fontWeight: 700, lineHeight: 1.6, marginTop: 0 }}>
          Shopping feels good — but the good part isn't the box on your porch. Psychologists
          will tell you the <i>anticipation</i> of a purchase fires off more reward than the
          thing itself. whim leans all the way into that quirk: you get the browse, the
          add-to-cart rush, the checkout confetti, the little delivery truck inching toward
          your house — and you keep every dollar.
        </p>
        <p style={{ fontWeight: 700, lineHeight: 1.6, marginBottom: 0 }}>
          It's a playground for impulse, on purpose. Treat yourself to the <i>idea</i> of the
          thing. Then close the tab a few hundred dollars richer and weirdly satisfied.
        </p>
      </div>

      <h2 className="section-title">🛍️ How it works</h2>
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="perk">
          <span className="dot">1</span> Browse a store full of (imaginary) stuff and read
          gushing fake reviews.
        </div>
        <div className="perk">
          <span className="dot">2</span> Add things to your cart with abandon — it's free, so
          go nuts.
        </div>
        <div className="perk">
          <span className="dot">3</span> "Check out" for $0.00 and pick a delivery window (30
          seconds to 3 hours, or 🎲 surprise yourself).
        </div>
        <div className="perk">
          <span className="dot">4</span> Watch a live tracker carry your order to your
          door — then enjoy the plot twist where nothing shows up.
        </div>
        <div className="perk" style={{ borderBottom: "none" }}>
          <span className="dot">5</span> Watch your "money saved by not buying" tally climb. ⭐
        </div>
      </div>

      <h2 className="section-title">🫶 Our one rule</h2>
      <div className="panel" style={{ marginBottom: 18 }}>
        <p style={{ fontWeight: 700, lineHeight: 1.6, marginTop: 0 }}>
          We're laughing <i>with</i> shopping, never shaming the shopper. whim will never use
          fake scarcity, guilt, countdown-timer panic, or "you'll regret missing this." No dark
          patterns, no pressure. The whole point is to feel good and spend nothing — so anything
          that nudges you toward real overspending is off the table, forever.
        </p>
        <div className="strike-note" style={{ marginBottom: 0 }}>
          💚 If anything here ever feels stressful instead of fun, we built it wrong — tell us.
        </div>
      </div>

      <h2 className="section-title">🤔 Wait, is any of this real?</h2>
      <div className="panel" style={{ marginBottom: 18 }}>
        <p style={{ fontWeight: 700, lineHeight: 1.6, marginTop: 0 }}>
          Nope — and that's the joke. whim is a <b>parody and entertainment site</b>. There are
          no real products, no real prices, no inventory, and no affiliation with any real brand
          or store. Nothing is for sale, no payment is ever taken, no card details are collected,
          and nothing is shipped. The "card" field on checkout is a prop; type gibberish.
        </p>
        <p style={{ fontWeight: 700, lineHeight: 1.6, marginBottom: 0 }}>
          whim is free to use and supported by a single, clearly-labeled ad. That's it.
        </p>
      </div>

      <h2 className="section-title">🔐 Accounts & your data</h2>
      <div className="panel" style={{ marginBottom: 18 }}>
        <p style={{ fontWeight: 700, lineHeight: 1.6, marginTop: 0 }}>
          You can use whim with no account at all. If you make one, it's just a display name and
          your daydream history (the pretend orders you've placed and the money you "saved"),
          so it can follow you across visits. We don't ask for — or want — payment info, because
          there's nothing to pay for.
        </p>
        <p style={{ fontWeight: 700, lineHeight: 1.6, marginBottom: 0 }}>
          A fuller privacy policy covering cookies and our ad partner lives on its own page.
        </p>
      </div>

      <h2 className="section-title">👋 Say hi</h2>
      <div className="panel">
        <p style={{ fontWeight: 700, lineHeight: 1.6, margin: 0 }}>
          Got a feature idea, a bug, or a product you wish existed (imaginarily)? Email{" "}
          <a href="mailto:hello@trywhim.fun" style={{ color: "var(--purple)", fontWeight: 800 }}>
            hello@trywhim.fun
          </a>
          . We read everything.
        </p>
        <Link
          to="/"
          className="btn primary big"
          style={{ marginTop: 16, display: "inline-flex" }}
        >
          🛒 Start a (free) haul
        </Link>
      </div>
    </>
  );
}
