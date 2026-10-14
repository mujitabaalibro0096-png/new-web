import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Search, Heart, ShoppingBag, Menu, X, Minus, Plus, MessageCircle, Check } from "lucide-react";
import hero from "@/assets/hero.jpg";
import baggy from "@/assets/baggy.jpg";
import hoodie from "@/assets/hoodie.jpg";
import {
  CATEGORIES, PRODUCTS, FREE_SHIPPING, WHATSAPP_NUMBER, pkr, unitPrice, useShop,
  type Category, type Product, type Shop,
} from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SE7EN — Baggy Shirts & Hoodies, Pakistan" },
      { name: "description", content: "Oversized baggy shirts and heavyweight hoodies from SE7EN. Drop 01 coming soon across Pakistan." },
      { property: "og:title", content: "SE7EN — Built Different." },
      { property: "og:description", content: "Baggy shirts and hoodies. Drop 01 coming soon across Pakistan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Store,
});

type Overlay = null | "search" | "menu" | "cart" | "wish" | "checkout" | "size" | "welcome";

function Store() {
  const shop = useShop();
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [quick, setQuick] = useState<Product | null>(null);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("se7en_welcome")) {
      const t = setTimeout(() => setOverlay((o) => o ?? "welcome"), 4000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 2200); return () => clearTimeout(t); } return undefined; }, [toast]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && (setOverlay(null), setQuick(null));
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);

  const notify = (m: string) => setToast(m);
  const goShop = (c: Category | "all") => { setFilter(c); setOverlay(null); document.getElementById("shop")?.scrollIntoView(); };

  return (
    <div className="min-h-screen">
      <div className="bg-primary py-2 text-center text-[11px] uppercase tracking-[0.25em] text-primary-foreground">
        Free shipping over {pkr(FREE_SHIPPING)} · Cash on Delivery nationwide
      </div>
      <Header shop={shop} open={setOverlay} />
      <Hero onShop={() => goShop("all")} />
      <Collections onPick={goShop} />
      <ShopSection shop={shop} filter={filter} setFilter={setFilter} onQuick={setQuick} notify={notify} />
      <About />
      <Newsletter notify={notify} />
      <Footer goShop={goShop} open={setOverlay} />

      <a
        href={WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi SE7EN, I need help with an order.")}` : "#contact"}
        target={WHATSAPP_NUMBER ? "_blank" : undefined}
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center glow-dot rounded-full bg-whatsapp text-background shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      {overlay === "menu" && <MobileMenu close={() => setOverlay(null)} goShop={goShop} open={setOverlay} />}
      {overlay === "search" && <SearchOverlay close={() => setOverlay(null)} onPick={(p) => { setOverlay(null); setQuick(p); }} />}
      {(overlay === "cart" || overlay === "wish") && (
        <Drawer mode={overlay} shop={shop} close={() => setOverlay(null)} setMode={setOverlay} onQuick={setQuick} />
      )}
      {overlay === "checkout" && <Checkout shop={shop} close={() => setOverlay(null)} />}
      {overlay === "size" && <SizeGuide close={() => setOverlay(null)} />}
      {overlay === "welcome" && <Welcome close={() => { localStorage.setItem("se7en_welcome", "1"); setOverlay(null); }} />}
      {quick && (
        <QuickView p={quick} shop={shop} close={() => setQuick(null)} openSize={() => setOverlay("size")}
          added={() => { setQuick(null); setOverlay("cart"); }} />
      )}
      {toast && (
        <div role="status" className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 border border-border bg-card px-5 py-3 text-xs uppercase tracking-widest">
          {toast}
        </div>
      )}
    </div>
  );
}

function Header({ shop, open }: { shop: Shop; open: (o: Overlay) => void }) {
  const link = "text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors link-line";
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <button className="md:hidden" aria-label="Open menu" onClick={() => open("menu")}><Menu className="h-5 w-5" /></button>
        <a href="#top" className="font-display text-2xl tracking-wider">SE<span className="text-primary text-glow">7</span>EN</a>
        <nav className="hidden gap-8 md:flex">
          <a className={link} href="#top">Home</a>
          <a className={link} href="#shop">Shop</a>
          <a className={link} href="#collections">Collections</a>
          <a className={link} href="#about">About</a>
        </nav>
        <div className="flex items-center gap-4">
          <button aria-label="Search" onClick={() => open("search")}><Search className="h-5 w-5" /></button>
          <button aria-label="Wishlist" className="relative" onClick={() => open("wish")}>
            <Heart className="h-5 w-5" />{shop.wish.length > 0 && <Badge n={shop.wish.length} />}
          </button>
          <button aria-label="Shopping bag" className="relative" onClick={() => open("cart")}>
            <ShoppingBag className="h-5 w-5" />{shop.count > 0 && <Badge n={shop.count} />}
          </button>
        </div>
      </div>
    </header>
  );
}
const Badge = ({ n }: { n: number }) => (
  <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center glow rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{n}</span>
);

function Hero({ onShop }: { onShop: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      <img src={hero} alt="Model wearing an oversized SE7EN graphic tee" width={1600} height={1008} className="h-[78vh] min-h-[520px] w-full object-cover object-[60%_center]" />
      <div className="ambient pointer-events-none absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-end px-5 pb-16">
        <p className="eyebrow">Drop 01 · Baggy Shirts + Hoodies · Coming Soon</p>
        <h1 className="mt-4 text-6xl leading-[0.9] sm:text-8xl lg:text-9xl text-glow">Built<br />Different.</h1>
        <p className="mt-5 max-w-sm text-sm text-muted-foreground">Oversized baggy shirts and heavyweight hoodies. Drop 01 is on its way.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button className="btn-primary shine" onClick={onShop}>Shop the drop</button>
          <a className="btn-ghost" href="#collections">Collections</a>
        </div>
      </div>
    </section>
  );
}

function Collections({ onPick }: { onPick: (c: Category) => void }) {
  const imgs: Record<Category, string> = { baggy, hoodie };
  return (
    <section id="collections" className="mx-auto max-w-7xl px-5 py-20">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-4xl sm:text-5xl">Collections</h2>
        <p className="eyebrow hidden sm:block">Drop 01 · Coming soon.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => onPick(c.id)} className="group lift shine relative aspect-[3/4] overflow-hidden border border-border text-left">
            <img src={imgs[c.id]} alt={`${c.name} collection`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h3 className="text-2xl sm:text-3xl">{c.name}</h3>
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground group-hover:text-primary">Shop →</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

const SORTS = ["Featured", "Price Low to High", "Price High to Low", "Name"] as const;

function ShopSection({ shop, filter, setFilter, onQuick, notify }: {
  shop: Shop; filter: Category | "all"; setFilter: (c: Category | "all") => void; onQuick: (p: Product) => void; notify: (m: string) => void;
}) {
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Featured");
  const list = useMemo(() => {
    const l = PRODUCTS.filter((p) => filter === "all" || p.category === filter);
    if (sort === "Price Low to High") return [...l].sort((a, b) => a.price - b.price);
    if (sort === "Price High to Low") return [...l].sort((a, b) => b.price - a.price);
    if (sort === "Name") return [...l].sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }, [filter, sort]);
  return (
    <section id="shop" className="scroll-mt-16 border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <h2 className="text-4xl sm:text-5xl">Shop</h2>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[{ id: "all" as const, name: "All" }, ...CATEGORIES].map((c) => (
              <button key={c.id} onClick={() => setFilter(c.id)} className={`chip ${filter === c.id ? "chip-active" : ""}`}>{c.name}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="field w-auto py-2">
              {SORTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => {
            const w = shop.wish.includes(p.id);
            return (
              <article key={p.id} className="group">
                <div className="lift shine relative aspect-[4/5] overflow-hidden border border-border bg-card">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {p.badge && <span className="absolute left-2 top-2 bg-primary px-2 py-1 text-[10px] font-semibold tracking-widest text-primary-foreground">{p.badge}</span>}
                  <button aria-label={w ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={() => { shop.toggleWish(p.id); notify(w ? "Removed from wishlist" : "Saved to wishlist"); }}
                    className="absolute right-2 top-2 grid h-9 w-9 place-items-center bg-background/70">
                    <Heart className={`h-4 w-4 ${w ? "fill-primary text-primary" : ""}`} />
                  </button>
                  <button onClick={() => onQuick(p)} className="btn-light absolute inset-x-2 bottom-2 py-2 opacity-100 md:translate-y-2 md:opacity-0 md:transition md:group-hover:translate-y-0 md:group-hover:opacity-100">
                    Quick view
                  </button>
                </div>
                <div className="mt-3 flex justify-between gap-2">
                  <div>
                    <h3 className="font-sans text-sm font-semibold normal-case tracking-wide">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.type}</p>
                  </div>
                  <p className="text-sm whitespace-nowrap">{pkr(p.price)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center">
        <img src={hoodie} alt="Model wearing a black SE7EN oversized hoodie" loading="lazy" width={1024} height={1280} className="aspect-[4/5] w-full border border-border object-cover" />
        <div>
          <p className="eyebrow">About SE7EN</p>
          <h2 className="mt-4 text-5xl sm:text-6xl">Made oversized.</h2>
          <p className="mt-6 max-w-md text-muted-foreground">
            SE7EN is a streetwear label built around oversized silhouettes and heavyweight fabrics. Drop 01 — baggy shirts and hoodies — is coming soon. The details stay deliberate and the attitude simple.
          </p>
        </div>
      </div>
    </section>
  );
}

function Newsletter({ notify }: { notify: (m: string) => void }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl sm:text-4xl">Hear about drops first</h2>
          <p className="mt-2 text-sm text-muted-foreground">New releases and restocks. Nothing else.</p>
        </div>
        {done ? (
          <p className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> You're on the list.</p>
        ) : (
          <form className="flex w-full max-w-md" onSubmit={(e) => { e.preventDefault(); setDone(true); notify("Subscribed"); }}>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="field" aria-label="Email address" />
            <button className="btn-primary shrink-0">Join</button>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer({ goShop, open }: { goShop: (c: Category | "all") => void; open: (o: Overlay) => void }) {
  const a = "block py-1 text-sm text-muted-foreground hover:text-foreground text-left";
  return (
    <footer id="contact" className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-3xl">SE<span className="text-primary">7</span>EN</p>
          <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">Built different.</p>
        </div>
        <div>
          <p className="label">Shop</p>
          <button className={a} onClick={() => goShop("all")}>All Products</button>
          <button className={a} onClick={() => goShop("baggy")}>Baggy Shirts</button>
          <button className={a} onClick={() => goShop("hoodie")}>Hoodies</button>
        </div>
        <div>
          <p className="label">Help</p>
          <button className={a} onClick={() => open("size")}>Size Guide</button>
          <p className="py-1 text-sm text-muted-foreground">Shipping: {pkr(250)}, free over {pkr(FREE_SHIPPING)}</p>
          <p className="py-1 text-sm text-muted-foreground">Returns: contact us within 7 days</p>
        </div>
        <div>
          <p className="label">SE7EN</p>
          <a className={a} href="#about">About</a>
          <p className="py-1 text-sm text-muted-foreground">Instagram · TikTok · WhatsApp — links coming soon</p>
        </div>
      </div>
      <p className="border-t border-border py-6 text-center text-[11px] uppercase tracking-widest text-muted-foreground">
        © {new Date().getFullYear()} SE7EN · Frontend prototype — orders are not processed
      </p>
    </footer>
  );
}

/* ---------- Overlays ---------- */

function Modal({ close, children, wide, side }: { close: () => void; children: ReactNode; wide?: boolean; side?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex bg-overlay animate-in fade-in" onClick={close}>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        className={side
          ? "ml-auto flex h-full w-full max-w-md flex-col border-l border-border bg-background animate-in slide-in-from-right"
          : `m-auto max-h-[92vh] w-[calc(100%-2rem)] overflow-y-auto border border-border bg-background ${wide ? "max-w-4xl" : "max-w-lg"}`}
      >
        {children}
      </div>
    </div>
  );
}
const CloseBtn = ({ close }: { close: () => void }) => (
  <button aria-label="Close" onClick={close} className="p-1 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
);

function MobileMenu({ close, goShop, open }: { close: () => void; goShop: (c: Category | "all") => void; open: (o: Overlay) => void }) {
  const l = "block border-b border-border py-4 font-display text-3xl uppercase";
  return (
    <div className="fixed inset-0 z-50 bg-background p-5 animate-in fade-in">
      <div className="flex justify-end"><CloseBtn close={close} /></div>
      <nav className="mt-6">
        <a className={l} href="#top" onClick={close}>Home</a>
        <button className={`${l} w-full text-left`} onClick={() => goShop("all")}>Shop</button>
        <a className={l} href="#collections" onClick={close}>Collections</a>
        <a className={l} href="#about" onClick={close}>About</a>
        <button className={`${l} w-full text-left`} onClick={() => open("search")}>Search</button>
        <button className={`${l} w-full text-left`} onClick={() => open("wish")}>Wishlist</button>
        <button className={`${l} w-full text-left`} onClick={() => open("cart")}>Bag</button>
      </nav>
    </div>
  );
}

function SearchOverlay({ close, onPick }: { close: () => void; onPick: (p: Product) => void }) {
  const [q, setQ] = useState("");
  const res = q.trim() ? PRODUCTS.filter((p) => `${p.name} ${p.type} ${p.category}`.toLowerCase().includes(q.toLowerCase())) : [];
  return (
    <div className="fixed inset-0 z-50 bg-background/97 p-5 animate-in fade-in">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3 border-b border-foreground pb-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shirts, hoodies…" className="w-full bg-transparent font-display text-3xl uppercase outline-none placeholder:text-muted-foreground" />
          <CloseBtn close={close} />
        </div>
        <div className="mt-6 space-y-2">
          {q && res.length === 0 && <p className="text-sm text-muted-foreground">No products match “{q}”.</p>}
          {res.map((p) => (
            <button key={p.id} onClick={() => onPick(p)} className="flex w-full items-center gap-4 border border-border p-2 text-left hover:border-foreground">
              <img src={p.image} alt="" className="h-16 w-14 object-cover" />
              <div className="flex-1"><p className="text-sm font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.type}</p></div>
              <p className="pr-2 text-sm">{pkr(p.price)}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickView({ p, shop, close, added, openSize }: { p: Product; shop: Shop; close: () => void; added: () => void; openSize: () => void }) {
  const [size, setSize] = useState("");
  const [colour, setColour] = useState(p.colours?.[0]);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState("");
  const w = shop.wish.includes(p.id);
  return (
    <Modal close={close} wide>
      <div className="grid md:grid-cols-2">
        <img src={p.image} alt={p.name} className="aspect-[4/5] w-full object-cover" />
        <div className="p-6">
          <div className="flex justify-between"><p className="eyebrow">{p.type}</p><CloseBtn close={close} /></div>
          <h2 className="mt-2 text-4xl">{p.name}</h2>
          <p className="mt-2 text-lg">{pkr(size ? unitPrice(p, size) : p.price)}</p>
          <p className="mt-4 text-sm text-muted-foreground">{p.note}</p>

          {p.colours && (
            <div className="mt-6">
              <p className="label">Colour — {colour}</p>
              <div className="flex flex-wrap gap-2">{p.colours.map((c) => <button key={c} onClick={() => setColour(c)} className={`chip ${colour === c ? "chip-active" : ""}`}>{c}</button>)}</div>
            </div>
          )}
          <div className="mt-6">
            <div className="flex justify-between">
              <p className="label">Size</p>
              <button onClick={openSize} className="text-[11px] uppercase tracking-widest text-muted-foreground underline hover:text-foreground">Size guide</button>
            </div>
            <div className="flex flex-wrap gap-2">{p.sizes.map((s) => <button key={s} onClick={() => { setSize(s); setErr(""); }} className={`chip min-w-12 ${size === s ? "chip-active" : ""}`}>{s}</button>)}</div>
            {err && <p className="mt-2 text-xs text-primary">{err}</p>}
          </div>
          <div className="mt-6 flex gap-2">
            <Qty value={qty} set={setQty} />
            <button className="btn-primary flex-1 opacity-60" onClick={() => setErr("This piece is coming soon — join the list below to hear first.")}>Coming soon</button>
            <button aria-label="Wishlist" className="btn-ghost px-4" onClick={() => shop.toggleWish(p.id)}><Heart className={`h-4 w-4 ${w ? "fill-primary text-primary" : ""}`} /></button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

const Qty = ({ value, set }: { value: number; set: (n: number) => void }) => (
  <div className="flex items-center border border-border">
    <button aria-label="Decrease" className="px-3 py-3" onClick={() => set(Math.max(0, value - 1))}><Minus className="h-3 w-3" /></button>
    <span className="w-6 text-center text-sm">{value}</span>
    <button aria-label="Increase" className="px-3 py-3" onClick={() => set(value + 1)}><Plus className="h-3 w-3" /></button>
  </div>
);

function Drawer({ mode, shop, close, setMode, onQuick }: { mode: "cart" | "wish"; shop: Shop; close: () => void; setMode: (o: Overlay) => void; onQuick: (p: Product) => void }) {
  const wishItems = PRODUCTS.filter((p) => shop.wish.includes(p.id));
  const left = FREE_SHIPPING - shop.subtotal;
  return (
    <Modal close={close} side>
      <div className="flex items-center justify-between border-b border-border p-5">
        <div className="flex gap-5 text-xs uppercase tracking-widest">
          <button className={mode === "cart" ? "text-foreground" : "text-muted-foreground"} onClick={() => setMode("cart")}>Bag ({shop.count})</button>
          <button className={mode === "wish" ? "text-foreground" : "text-muted-foreground"} onClick={() => setMode("wish")}>Wishlist ({shop.wish.length})</button>
        </div>
        <CloseBtn close={close} />
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {mode === "cart" ? (
          shop.lines.length === 0 ? <Empty text="Your bag is empty." close={close} /> :
          shop.lines.map((l) => (
            <div key={l.key} className="flex gap-3">
              <img src={l.p.image} alt="" className="h-24 w-20 object-cover" />
              <div className="flex flex-1 flex-col">
                <p className="text-sm font-semibold">{l.p.name}</p>
                <p className="text-xs text-muted-foreground">{[l.colour, l.size].filter(Boolean).join(" / ")}</p>
                <div className="mt-auto flex items-center justify-between">
                  <Qty value={l.qty} set={(n) => shop.setQty(l.key, n)} />
                  <p className="text-sm">{pkr(l.unit * l.qty)}</p>
                </div>
              </div>
            </div>
          ))
        ) : wishItems.length === 0 ? <Empty text="Nothing saved yet." close={close} /> :
          wishItems.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <img src={p.image} alt="" className="h-20 w-16 object-cover" />
              <div className="flex-1"><p className="text-sm font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{pkr(p.price)}</p></div>
              <button className="chip" onClick={() => { close(); onQuick(p); }}>Select</button>
              <button aria-label="Remove" onClick={() => shop.toggleWish(p.id)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
          ))}
      </div>
      {mode === "cart" && shop.lines.length > 0 && (
        <div className="space-y-2 border-t border-border p-5 text-sm">
          <p className="text-xs text-muted-foreground">{left > 0 ? `Add ${pkr(left)} more for free shipping.` : "You've unlocked free shipping."}</p>
          <Row k="Subtotal" v={pkr(shop.subtotal)} />
          <Row k="Shipping" v={shop.shipping ? pkr(shop.shipping) : "Free"} />
          <Row k="Total" v={pkr(shop.total)} bold />
          <button className="btn-primary mt-3 w-full" onClick={() => setMode("checkout")}>Checkout</button>
        </div>
      )}
    </Modal>
  );
}
const Empty = ({ text, close }: { text: string; close: () => void }) => (
  <div className="py-16 text-center"><p className="text-sm text-muted-foreground">{text}</p><a href="#shop" onClick={close} className="btn-ghost mt-6">Continue shopping</a></div>
);
const Row = ({ k, v, bold }: { k: string; v: string; bold?: boolean }) => (
  <div className={`flex justify-between ${bold ? "border-t border-border pt-2 font-semibold" : "text-muted-foreground"}`}><span>{k}</span><span className={bold ? "" : "text-foreground"}>{v}</span></div>
);

const PROVINCES = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Jammu & Kashmir"];
const STEPS = ["Contact", "Delivery", "Payment", "Review"];

function Checkout({ shop, close }: { shop: Shop; close: () => void }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ name: "", phone: "", email: "", address: "", city: "", province: "Punjab", postal: "", payment: "Cash on Delivery" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof f, string>>>({});
  const [order, setOrder] = useState<null | { id: string; total: number; payment: string }>(null);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const validate = () => {
    const e: Partial<Record<keyof typeof f, string>> = {};
    if (step === 0) {
      if (f.name.trim().length < 2) e.name = "Enter your full name.";
      if (!/^(\+92|0)?3\d{2}[- ]?\d{7}$/.test(f.phone.replace(/\s/g, ""))) e.phone = "Enter a valid Pakistani mobile, e.g. 03001234567.";
      if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email.";
    }
    if (step === 1) {
      if (f.address.trim().length < 8) e.address = "Enter your complete address.";
      if (!f.city.trim()) e.city = "Enter your city.";
      if (f.postal && !/^\d{5}$/.test(f.postal)) e.postal = "Postal code is 5 digits.";
    }
    setErrors(e); return Object.keys(e).length === 0;
  };
  const next = () => validate() && setStep(step + 1);
  const place = () => {
    setOrder({ id: `S7-${Date.now().toString().slice(-6)}`, total: shop.total, payment: f.payment });
    shop.clear();
  };
  const F = ({ k, label, type = "text", ph }: { k: keyof typeof f; label: string; type?: string; ph?: string }) => (
    <div><label className="label" htmlFor={k}>{label}</label><input id={k} type={type} placeholder={ph} value={f[k]} onChange={set(k)} className="field" />{errors[k] && <p className="mt-1 text-xs text-primary">{errors[k]}</p>}</div>
  );

  if (order) return (
    <Modal close={close}>
      <div className="p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary"><Check className="h-6 w-6" /></div>
        <h2 className="mt-5 text-4xl">Order received</h2>
        <p className="mt-2 text-sm text-muted-foreground">Reference {order.id} · {pkr(order.total)} · {order.payment}</p>
        <p className="mx-auto mt-4 max-w-sm text-xs text-muted-foreground">This is a frontend prototype. No order has been sent and no payment was taken.</p>
        <button className="btn-primary mt-6" onClick={close}>Back to store</button>
      </div>
    </Modal>
  );

  return (
    <Modal close={close} wide>
      <div className="flex items-center justify-between border-b border-border p-5">
        <h2 className="text-2xl">Guest checkout</h2><CloseBtn close={close} />
      </div>
      <div className="grid md:grid-cols-[1fr_300px]">
        <div className="p-5">
          <ol className="mb-6 flex gap-4 text-[11px] uppercase tracking-widest">
            {STEPS.map((s, i) => <li key={s} className={i === step ? "text-primary" : i < step ? "text-foreground" : "text-muted-foreground"}>{i + 1}. {s}</li>)}
          </ol>
          {shop.lines.length === 0 ? <p className="text-sm text-muted-foreground">Your bag is empty.</p> : (
            <div className="space-y-4">
              {step === 0 && <>{F({ k: "name", label: "Full name" })}{F({ k: "phone", label: "Phone", type: "tel", ph: "03XX XXXXXXX" })}{F({ k: "email", label: "Email (optional)", type: "email" })}</>}
              {step === 1 && <>
                {F({ k: "address", label: "Complete address", ph: "House, street, area" })}
                <div className="grid gap-4 sm:grid-cols-2">{F({ k: "city", label: "City" })}{F({ k: "postal", label: "Postal code (optional)" })}</div>
                <div><label className="label" htmlFor="province">Province</label><select id="province" value={f.province} onChange={set("province")} className="field">{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select></div>
                <div><label className="label">Country</label><input value="Pakistan" disabled className="field opacity-60" /></div>
              </>}
              {step === 2 && ["Cash on Delivery", "Bank Transfer"].map((m) => (
                <label key={m} className={`flex cursor-pointer gap-3 border p-4 ${f.payment === m ? "border-primary" : "border-border"}`}>
                  <input type="radio" name="pay" checked={f.payment === m} onChange={() => setF({ ...f, payment: m })} className="accent-primary" />
                  <span><span className="block text-sm font-semibold">{m}</span>
                    <span className="text-xs text-muted-foreground">{m === "Cash on Delivery" ? "Pay in cash when your order arrives." : "Bank details are shared after the order is confirmed."}</span></span>
                </label>
              ))}
              {step === 3 && (
                <div className="space-y-3 text-sm">
                  <Review t="Contact" v={`${f.name} · ${f.phone}${f.email ? ` · ${f.email}` : ""}`} edit={() => setStep(0)} />
                  <Review t="Delivery" v={`${f.address}, ${f.city}, ${f.province}${f.postal ? ` ${f.postal}` : ""}, Pakistan`} edit={() => setStep(1)} />
                  <Review t="Payment" v={f.payment} edit={() => setStep(2)} />
                  <p className="text-xs text-muted-foreground">Prototype only — placing the order will not send it anywhere or charge you.</p>
                </div>
              )}
              <div className="flex justify-between pt-2">
                <button className="btn-ghost" onClick={() => (step ? setStep(step - 1) : close())}>{step ? "Back" : "Cancel"}</button>
                {step < 3 ? <button className="btn-primary" onClick={next}>Continue</button> : <button className="btn-primary" onClick={place}>Place order</button>}
              </div>
            </div>
          )}
        </div>
        <aside className="space-y-3 border-t border-border bg-card p-5 text-sm md:border-l md:border-t-0">
          {shop.lines.map((l) => <div key={l.key} className="flex justify-between gap-2 text-xs"><span>{l.qty}× {l.p.name} <span className="text-muted-foreground">{l.size}</span></span><span>{pkr(l.unit * l.qty)}</span></div>)}
          <Row k="Subtotal" v={pkr(shop.subtotal)} />
          <Row k="Shipping" v={shop.shipping ? pkr(shop.shipping) : "Free"} />
          <Row k="Total" v={pkr(shop.total)} bold />
        </aside>
      </div>
    </Modal>
  );
}
const Review = ({ t, v, edit }: { t: string; v: string; edit: () => void }) => (
  <div className="flex justify-between gap-4 border border-border p-3"><div><p className="label">{t}</p><p>{v}</p></div><button onClick={edit} className="text-xs uppercase tracking-widest text-muted-foreground underline">Edit</button></div>
);

function SizeGuide({ close }: { close: () => void }) {
  const rows = [["S", 40, 27], ["M", 42, 28], ["L", 44, 29], ["XL", 46, 30], ["XXL", 48, 31]];
  return (
    <Modal close={close}>
      <div className="p-6">
        <div className="flex justify-between"><h2 className="text-3xl">Size guide</h2><CloseBtn close={close} /></div>
        <p className="mt-2 text-xs text-muted-foreground">Measurements in inches, garment laid flat. Oversized fit — size down for a closer fit.</p>
        <table className="mt-5 w-full text-left text-sm">
          <thead><tr className="border-b border-border text-[11px] uppercase tracking-widest text-muted-foreground"><th className="py-2">Size</th><th>Chest</th><th>Length</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r[0]} className="border-b border-border"><td className="py-2 font-semibold">{r[0]}</td><td>{r[1]}"</td><td>{r[2]}"</td></tr>)}</tbody>
        </table>
      </div>
    </Modal>
  );
}

function Welcome({ close }: { close: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <Modal close={close}>
      <div className="p-8 text-center">
        <div className="flex justify-end"><CloseBtn close={close} /></div>
        <p className="eyebrow">Welcome to SE7EN</p>
        <h2 className="mt-3 text-5xl">10% off your first order</h2>
        {done ? (
          <><p className="mt-5 text-sm text-muted-foreground">Use this code at checkout:</p><p className="mt-2 font-display text-3xl tracking-widest text-primary">WELCOME10</p><button className="btn-ghost mt-6" onClick={close}>Start shopping</button></>
        ) : (
          <form className="mt-6 flex" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
            <input required type="email" placeholder="Email address" aria-label="Email address" className="field" />
            <button className="btn-primary shrink-0">Get code</button>
          </form>
        )}
        <button onClick={close} className="mt-4 text-[11px] uppercase tracking-widest text-muted-foreground underline">No thanks</button>
      </div>
    </Modal>
  );
}
