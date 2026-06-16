// ----------------------------------------------------------------------------
// Monetization config.
//
// Ethics first: Cartwheel exists *because* impulse spending can be harmful, so the
// ad slot is deliberately small, clearly labeled "Sponsored", visually distinct
// from products (never disguised as one), and meant for a CONTEXTUAL, privacy-first
// network — NOT behavioral retargeting that preys on shopping urges.
//
// Recommended networks (no behavioral targeting, no creepy tracking):
//   • EthicalAds  → https://www.ethicalads.io/  (publisher id below)
//   • Carbon Ads  → https://www.carbonads.net/
//
// To go live: set `network` to "ethicalads" and fill `ethicalAdsPublisher`, then
// add the EthicalAds script tag in index.html. Until then, a rotating in-house
// "house ad" renders so the layout is real and revenue-ready.
// ----------------------------------------------------------------------------

export type AdNetwork = "house" | "ethicalads";

export const adConfig = {
  network: "house" as AdNetwork,
  ethicalAdsPublisher: "", // e.g. "your-site-id" once you sign up
};

export type HouseAd = {
  emoji: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  bg: string;
};

// In-house "ads" (calm, on-brand, non-predatory) shown until a real network is live.
export const houseAds: HouseAd[] = [
  {
    emoji: "🌱",
    title: "Your money, but calmer",
    body: "A budgeting app that treats spending like self-care, not shame.",
    cta: "Take a breath",
    href: "https://www.consumerfinance.gov/consumer-tools/",
    bg: "linear-gradient(120deg,#d4fc79,#96e6a1)",
  },
  {
    emoji: "📚",
    title: "Read instead of checkout",
    body: "Find your next library book — the original free dopamine.",
    cta: "Browse the stacks",
    href: "https://openlibrary.org/",
    bg: "linear-gradient(120deg,#a1c4fd,#c2e9fb)",
  },
  {
    emoji: "♻️",
    title: "Buy nothing, get everything",
    body: "Swap, gift, and borrow with neighbors instead of buying new.",
    cta: "Find your group",
    href: "https://buynothingproject.org/",
    bg: "linear-gradient(120deg,#fbc2eb,#a6c1ee)",
  },
];
