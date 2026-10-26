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

- **Cloudflare Pages** — build command `pnpm --filter @workspace/se7en-store run build`, output directory `artifacts/se7en-store/dist/public`.
- **Vercel** — `vercel.json` at the repo root already sets the framework, build command, output directory and cache headers.

## Layout

```
artifacts/se7en-store/    the storefront (React app, styles, assets)
artifacts/api-server/     unused API scaffold from the starter
attached_assets/          product photography used by the store
```

## Notes

- Prices are PKR; free shipping over PKR 5,000.
- Newsletter signup and the `WELCOME10` welcome popup are still front-end only (no email service, no live discount).
- Product badges currently read "COMING SOON" — update the copy when the drop goes fully live.
