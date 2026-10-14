# SE7EN Storefront

A responsive storefront for SE7EN streetwear, featuring Drop 01 products, collections, a preview bag, wishlist, and Pakistan-focused PKR pricing.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/se7en-store/src/App.tsx` — storefront and shopping interactions
- `artifacts/se7en-store/src/index.css` — storefront styling
- `artifacts/se7en-store/src/reference/` — source files from the supplied frontend ZIP
- `artifacts/se7en-store/src/assets/` — supplied product and campaign images

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

Visitors can browse collections and products, search and sort the catalog, save wishlist items, manage a browser-persisted preview bag, view the size guide, and step through a checkout preview.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Products in the supplied catalog are marked coming soon. The bag and checkout are previews; no orders or payments are processed.
- Newsletter and welcome-offer forms are visual previews only; email addresses are not saved or sent.
- Do not add real order, payment, inventory, or email claims until the client supplies the required merchant details and integrations.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
