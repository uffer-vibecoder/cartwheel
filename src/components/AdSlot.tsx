import { useEffect, useRef } from "react";
import { adConfig, houseAds } from "../data/ads";

/**
 * A single, clearly-labeled sponsored slot. Renders a real network's container
 * when configured, otherwise a rotating in-house "house ad". Deliberately small
 * and visually distinct from products — see src/data/ads.ts for the ethics note.
 *
 * `seed` just picks which house ad shows, so different placements aren't identical.
 */
export default function AdSlot({ seed = 0 }: { seed?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // When a real network is configured, mount its embed here. Example (EthicalAds):
    if (adConfig.network === "ethicalads" && adConfig.ethicalAdsPublisher && ref.current) {
      ref.current.innerHTML = "";
      const el = document.createElement("div");
      el.className = "horizontal";
      el.setAttribute("data-ea-publisher", adConfig.ethicalAdsPublisher);
      el.setAttribute("data-ea-type", "image");
      ref.current.appendChild(el);
      // Requires the EthicalAds script in index.html; it auto-loads into [data-ea-publisher].
      (window as any).ethicalads?.load?.();
    }
  }, []);

  if (adConfig.network === "ethicalads" && adConfig.ethicalAdsPublisher) {
    return (
      <aside className="ad" aria-label="Advertisement">
        <span className="ad-label">Sponsored · Ad</span>
        <div ref={ref} />
      </aside>
    );
  }

  const ad = houseAds[seed % houseAds.length];
  return (
    <aside className="ad" aria-label="Sponsored message">
      <span className="ad-label">Sponsored</span>
      <a className="ad-card" href={ad.href} target="_blank" rel="noopener noreferrer sponsored">
        <span className="ad-emoji" style={{ background: ad.bg }}>
          {ad.emoji}
        </span>
        <span className="ad-text">
          <strong>{ad.title}</strong>
          <span>{ad.body}</span>
        </span>
        <span className="ad-cta">{ad.cta} →</span>
      </a>
    </aside>
  );
}
