# whim — Go-live setup

The app already runs and ships **without** any of this (local-account mode + house
ads). Do these steps to turn on real accounts and real ad revenue.

## 1. Real accounts (Supabase)

1. Create a free project at https://supabase.com → New project.
2. In the dashboard: **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](../supabase/schema.sql), and **Run**. This creates the
   `profiles`, `daydreams`, and `drop_subscriptions` tables with row-level security
   and an auto-profile trigger.
3. **Authentication → Providers → Email**: keep "Email" enabled (magic link works out
   of the box). Optionally add Google/Apple later.
4. **Authentication → URL Configuration**: add your site URL (e.g.
   `https://uffer-vibecoder.github.io/whim/`) to **Redirect URLs**.
5. **Project Settings → API**: copy the **Project URL** and the **anon public** key.
6. In the project root: `cp .env.example .env` and fill in:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
7. `npm run build && npm run deploy`. The "Join whim" screen now sends magic links and
   syncs daydream history across devices automatically — no code changes.

> Local-account data (browser-only) doesn't auto-migrate; it's a clean switch to real
> accounts. Pre-launch that's fine.

## 2. Real ads (Google AdSense)

⚠️ **AdSense requires a domain you own.** A `github.io` subpath cannot be verified and
`ads.txt` can't live at the account root, so AdSense approval needs a **custom domain**
first (see step 3). Everything below is wired and ready for that moment.

1. Sign up at https://adsense.com with your custom domain.
2. Once approved, create an **ad unit** (Display → Responsive). Note the publisher id
   (`ca-pub-…`) and the ad-unit **slot id**.
3. Add to `.env`:
   ```
   VITE_ADSENSE_PUBLISHER=ca-pub-XXXXXXXXXXXXXXXX
   VITE_ADSENSE_SLOT=1234567890
   ```
4. Edit [`public/ads.txt`](../public/ads.txt): replace `pub-0000000000000000` with your
   real publisher id (drop the `ca-` prefix).
5. `npm run build && npm run deploy`. The Sponsored slots now render AdSense; remove the
   keys to fall back to the house ad. The slot stays clearly labeled "Sponsored · Ad".

Privacy-first alternative: EthicalAds/Carbon (no behavioral targeting) — set
`adConfig.network` / `ethicalAdsPublisher` in `src/data/ads.ts`.

## 3. Custom domain (unlocks AdSense + cleaner brand)

1. Buy a domain (e.g. `whim.fun`, `playwhim.com`).
2. GitHub repo → **Settings → Pages → Custom domain**, enter it; add the DNS records
   GitHub shows (A records to GitHub Pages IPs + a CNAME for `www`).
3. Wait for the cert, enable **Enforce HTTPS**. `ads.txt` is then reachable at the root,
   and AdSense can verify the site.
