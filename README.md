# SE7EN Storefront

Responsive storefront for **SE7EN**, a Pakistani streetwear label. Built with Vite + React + TypeScript, fully static (cart and wishlist live in `localStorage`) and deploying as a single-page site.

## Ordering

Checkout is guest-only: name, phone, address, payment method. Pressing **Send order on WhatsApp** builds a fully formatted order message and opens `wa.me` with it prefilled, so the customer just presses Send in WhatsApp. The store takes no payment itself; cash on delivery nationwide, bank details are shared on WhatsApp.

The WhatsApp number lives in `artifacts/se7en-store/src/reference/original-store.ts` (`WHATSAPP_NUMBER`).

## Run locally

```bash
pnpm install
pnpm run dev        # http://localhost:5173
```

On Windows you can also double-click `start_website.bat`.

## Build

```bash
pnpm run build
```

Output is written to `artifacts/se7en-store/dist/public`.

## Deploy

The storefront deploys to Vercel as **one static project**. Vercel builds from the repository root (so the pnpm workspace catalog and `attached_assets/` resolve) and only publishes the Vite output. Everything is configured in `vercel.json`:

| Setting | Value |
| --- | --- |
| Framework preset | `Other` |
| Install command | `pnpm install` (Vercel default; the committed lockfile makes it deterministic) |
| Build command | `pnpm --filter @workspace/se7en-store run build` |
| Output directory | `artifacts/se7en-store/dist/public` |

- Leave **Root Directory** at the repository root and keep the dashboard build/output fields empty — `vercel.json` wins.
- `artifacts/api-server` and `artifacts/mockup-sandbox` are intentionally **not** deployed. The storefront is fully static and never calls the API, and the API only exposes `/api/healthz`, so it is dead weight (plus it needs `DATABASE_URL`).
- `rewrites` sends every non-file path to `index.html` so client-side links never 404, and the `headers` block long-caches hashed assets under `/assets/`.
- To add the API later, reintroduce a `services` block in `vercel.json` (see git history, commit `0deaa72`) and mirror it with a Vercel project setting Root Directory = repo root.

## Layout

```
artifacts/se7en-store/    the storefront (React app, styles, assets)
artifacts/api-server/     Express API service (health check only today)
attached_assets/          product photography used by the store
```

## Notes

- Prices are PKR; free shipping over PKR 5,000.
- **Launch switch:** `STORE_MODE` in `artifacts/se7en-store/src/reference/original-store.ts` is `"live"` (bag → checkout → WhatsApp) or `"teaser"` (nothing buyable, WhatsApp "notify me" only). Every badge, badge label and CTA follows it.
- **Per-product availability:** each product also has an optional `live` flag. `live: false` keeps a piece on "coming soon" (wishlist + WhatsApp notify, no add to bag) even while the rest of the store is live — the three hoodies use this until samples land. Delete the flag or set it to `true` to start selling that piece.
- There is no backend by design: the bag and wishlist live in `localStorage`, and orders are handed off to WhatsApp.
- `WELCOME10` is a real 10% discount applied in checkout, claimed from the welcome popup and stored in `localStorage` (`se7en_promo`).
- "Get drop alerts" in the newsletter section opens WhatsApp with a prefilled message — no email collection, so there is nothing to store or leak.
- Policies (shipping, returns, privacy) are in-app copy in `App.tsx` → `Policies`. Review the wording before running any paid traffic.
- Replace `WHATSAPP_NUMBER` and the `https://se7en-storefront.vercel.app` canonical/OG URLs in `index.html` if either changes.
