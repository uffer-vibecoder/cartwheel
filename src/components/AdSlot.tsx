import { useEffect, useRef } from "react";
import { adConfig, houseAds } from "../data/ads";

/**
 * A single, clearly-labeled sponsored slot. Renders a real network (Google
 * AdSense or EthicalAds) when configured, otherwise a rotating in-house "house
 * ad". Deliberately small and visually distinct from products — never disguised.
 * See src/data/ads.ts for the ethics note and setup.
 *
 * `seed` just picks which house ad shows, so different placements aren't identical.
 */
let adsenseScriptLoaded = false;

function loadAdsenseScript(publisher: string) {
  if (adsenseScriptLoaded || typeof document === "undefined") return;
  adsenseScriptLoaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`;
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);
}

export default function AdSlot({ seed = 0 }: { seed?: number }) {
  const eaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adConfig.network === "adsense" && adConfig.adsensePublisher) {
      loadAdsenseScript(adConfig.adsensePublisher);
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch {
        /* AdSense not ready yet */
      }
    }
    if (adConfig.network === "ethicalads" && adConfig.ethicalAdsPublisher && eaRef.current) {
      eaRef.current.innerHTML = "";
      const el = document.createElement("div");
      el.className = "horizontal";
      el.setAttribute("data-ea-publisher", adConfig.ethicalAdsPublisher);
      el.setAttribute("data-ea-type", "image");
      eaRef.current.appendChild(el);
      (window as any).ethicalads?.load?.();
    }
  }, []);

  // ── Google AdSense ──────────────────────────────────────────────────────
  if (adConfig.network === "adsense" && adConfig.adsensePublisher && adConfig.adsenseSlot) {
    return (
      <aside className="ad" aria-label="Advertisement">
        <span className="ad-label">Sponsored · Ad</span>
        <div className="ad-card" style={{ display: "block", padding: "18px 14px 14px" }}>
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={adConfig.adsensePublisher}
            data-ad-slot={adConfig.adsenseSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </aside>
    );
  }

  // ── EthicalAds ──────────────────────────────────────────────────────────
  if (adConfig.network === "ethicalads" && adConfig.ethicalAdsPublisher) {
    return (
      <aside className="ad" aria-label="Advertisement">
        <span className="ad-label">Sponsored · Ad</span>
        <div className="ad-card" style={{ display: "block" }} ref={eaRef} />
      </aside>
    );
  }

  // ── In-house "house ad" (default) ───────────────────────────────────────
  const ad = houseAds[seed % houseAds.length];
  return (
    <aside className="ad" aria-label="Sponsored message">
      <span className="ad-label">Sponsored · Ad</span>
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
