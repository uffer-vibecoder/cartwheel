# 🛒 whim — an American dopamine store

A playful, colorful **"dopamine website"**: a fake e-commerce store where you browse,
add to cart, check out, and watch a live delivery truck crawl toward your door — except
**nothing is ever charged and nothing ever ships**. All the thrill of the haul, none of
the bill.

Inspired by the Korean "도파민 사이트" (dopamine site) trend, reimagined with American
products and an Amazon/DoorDash-style delivery tracker.

**🔗 Live:** https://uffer-vibecoder.github.io/whim/

**Accounts + ads:** local-account mode and a house-ad slot work out of the box.
To turn on real Supabase accounts and Google AdSense, see [docs/GO-LIVE.md](docs/GO-LIVE.md).

## The loop

1. **Storefront** — browse punny American products, filter by category
2. **Product page** — fake glowing reviews, "Add to cart" / "Buy now"
3. **Cart** — quantities, a running "$0.00 actually charged" tally
4. **Checkout** — enter a (fake) address, smash "Place order for $0" → confetti + cha-ching
5. **Tracking** — a live animated map: truck drives warehouse → your home, ETA countdown,
   step-by-step progress, big celebration on delivery, and the punchline: nothing arrived.

Every "purchase" adds to a persistent **"money saved by feeling this instead"** tally.

## Tech

- **Vite + React 18 + TypeScript**
- **react-router-dom** for routing
- **canvas-confetti** for celebrations
- Web Audio API for synthesized blips/cha-ching (no audio assets)
- Cart persists in `localStorage`; the active order rides in `sessionStorage`
- Product photos are curated [Unsplash](https://unsplash.com) images (free license), with
  an emoji-on-gradient fallback if one fails to load

## Docs

- [ROADMAP.md](ROADMAP.md) — what's shipped and what's next (accounts, drops, monetization)
- [docs/claude-design-prompt.md](docs/claude-design-prompt.md) — paste-ready brief for designing in Claude

## Run it

> Note: on this machine Node lives at `~/.local/node/bin`, which isn't on the default
> PATH. Prefix commands with it:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build to dist/
npm run preview  # preview the production build
```

## Structure

```
src/
  data/products.ts     # the fake catalog
  data/reviews.ts      # deterministic fake reviews
  store/CartContext.tsx# cart state + persistence + "saved" tally
  lib/dopamine.ts      # confetti + synthesized sounds
  components/
    ProductCard.tsx
    DeliveryMap.tsx     # the animated SVG truck-on-a-road map
  pages/
    Storefront.tsx Product.tsx Cart.tsx Checkout.tsx Tracking.tsx
```

It's a parody / toy. No real commerce, no payment processing, no data leaves the page.
