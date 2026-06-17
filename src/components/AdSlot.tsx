import { useEffect, useRef, useState } from "react";
import { adConfig, houseAds } from "../data/ads";

/**
 * A single, clearly-labeled sponsored slot. Renders Google AdSense when configured
 * AND it actually has an ad to show; otherwise gracefully falls back to a rotating
 * in-house "house ad" (so the slot is never an empty box — e.g. before AdSense
 * approval, or when a request goes unfilled). Deliberately small and visually
 * distinct from products. See src/data/ads.ts for the ethics note.
 *
 * `seed` just picks which house ad shows, so different placements aren't identical.
 */
let adsenseScriptLoaded = false;

function loadAdsenseScript(publisher: string) {
  if (adsenseScriptLoaded || typeof document === "undefined") return;
  // The verification script is already in index.html <head>; don't double-load it.
  if (document.querySelector('script[src*="adsbygoogle.js"]')) {
    adsenseScriptLoaded = true;
    return;
  }
  adsenseScriptLoaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`;
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);
}

function HouseAdCard({ seed }: { seed: number }) {
  const ad = houseAds[seed % houseAds.length];
  return (
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
  );
}

/** AdSense unit that falls back to the house ad if the request goes unfilled. */
function AdSenseUnit({ seed }: { seed: number }) {
  const insRef = useRef<HTMLModElement>(null);
  const [fallback, setFallback] = useState(false);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    loadAdsenseScript(adConfig.adsensePublisher);
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      /* AdSense not ready / not approved yet */
    }
    // Poll the unit's fill status; fall back to the house ad if it stays empty.
    let tries = 0;
    const iv = window.setInterval(() => {
      const status = insRef.current?.getAttribute("data-ad-status");
      if (status === "filled") {
        setFilled(true);
        window.clearInterval(iv);
      } else if (status === "unfilled" || ++tries > 6) {
        setFallback(true);
        window.clearInterval(iv);
      }
    }, 500);
    return () => window.clearInterval(iv);
  }, []);

  if (fallback && !filled) return <HouseAdCard seed={seed} />;

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client={adConfig.adsensePublisher}
      data-ad-slot={adConfig.adsenseSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

function EthicalUnit() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const el = document.createElement("div");
    el.className = "horizontal";
    el.setAttribute("data-ea-publisher", adConfig.ethicalAdsPublisher);
    el.setAttribute("data-ea-type", "image");
    ref.current.appendChild(el);
    (window as any).ethicalads?.load?.();
  }, []);
  return <div className="ad-card" style={{ display: "block" }} ref={ref} />;
}

export default function AdSlot({ seed = 0 }: { seed?: number }) {
  const isAdsense =
    adConfig.network === "adsense" && !!adConfig.adsensePublisher && !!adConfig.adsenseSlot;
  const isEthical = adConfig.network === "ethicalads" && !!adConfig.ethicalAdsPublisher;

  return (
    <aside className="ad" aria-label={isAdsense || isEthical ? "Advertisement" : "Sponsored message"}>
      <span className="ad-label">Sponsored · Ad</span>
      {isAdsense ? (
        <AdSenseUnit seed={seed} />
      ) : isEthical ? (
        <EthicalUnit />
      ) : (
        <HouseAdCard seed={seed} />
      )}
    </aside>
  );
}
