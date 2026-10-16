import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Search, Heart, ShoppingBag, Menu, X, Minus, Plus, ArrowUpRight,
  Check, ChevronRight, SlidersHorizontal,
} from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import baggyImage from "@/assets/baggy.jpg";
import hoodieImage from "@/assets/hoodie.jpg";
import {
  CATEGORIES, PRODUCTS, FREE_SHIPPING, SHIPPING_FEE, pkr, unitPrice,
  useShop, type Category, type Product, type Shop,
} from "@/reference/original-store";

type Overlay = null | "search" | "menu" | "cart" | "wish" | "checkout" | "size" | "welcome";
const SORTS = ["Featured", "Price Low to High", "Price High to Low", "Name"] as const;
const PROVINCES = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Jammu & Kashmir"];

export default function App() {
  const shop = useShop();
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [quick, setQuick] = useState<Product | null>(null);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!localStorage.getItem("se7en_welcome")) {
      const timer = window.setTimeout(() => setOverlay((current) => current ?? "welcome"), 4500);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2300);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOverlay(null); setQuick(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const notify = (message: string) => setToast(message);
  const goShop = (category: Category | "all") => {
    setFilter(category);
    setOverlay(null);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };
  const dismissWelcome = () => {
    localStorage.setItem("se7en_welcome", "1");
    setOverlay(null);
  };
  return (
    <main id="top">
      <div className="announcement">FREE SHIPPING OVER {pkr(FREE_SHIPPING)} <span>·</span> CASH ON DELIVERY NATIONWIDE</div>
      <Header shop={shop} open={setOverlay} />
      <Hero onShop={() => goShop("all")} />
      <Collections onPick={goShop} />
      <ShopSection shop={shop} filter={filter} setFilter={setFilter} onQuick={setQuick} notify={notify} />
      <About />
      <Newsletter notify={notify} />
      <Footer goShop={goShop} open={setOverlay} />
      {overlay === "menu" && <MobileMenu close={() => setOverlay(null)} goShop={goShop} open={setOverlay} />}
      {overlay === "search" && <SearchOverlay close={() => setOverlay(null)} onPick={(product) => { setOverlay(null); setQuick(product); }} />}
      {(overlay === "cart" || overlay === "wish") && <Drawer mode={overlay} shop={shop} close={() => setOverlay(null)} setMode={setOverlay} onQuick={setQuick} onCheckout={() => setOverlay("checkout")} />}
      {overlay === "checkout" && <Checkout shop={shop} close={() => setOverlay(null)} />}
      {overlay === "size" && <SizeGuide close={() => setOverlay(null)} />}
      {overlay === "welcome" && <Welcome close={dismissWelcome} />}
      {quick && <QuickView product={quick} shop={shop} close={() => setQuick(null)} openSize={() => setOverlay("size")} added={() => { setQuick(null); setOverlay("cart"); }} notify={notify} />}
      {toast && <div role="status" className="toast">{toast}</div>}
    </main>
  );
}

function Header({ shop, open }: { shop: Shop; open: (overlay: Overlay) => void }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="icon-button mobile-only" aria-label="Open menu" onClick={() => open("menu")}><Menu /></button>
        <a href="#top" className="brand" aria-label="SE7EN home" data-testid="link-brand-home-header"><img src="/brand/se7en-gothic-black-red.png" alt="SE7EN" /></a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#top">Home</a><a href="#shop">Shop</a><a href="#collections">Collections</a><a href="#about">About</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Search" onClick={() => open("search")}><Search /></button>
          <button className="icon-button count-button" aria-label="Wishlist" onClick={() => open("wish")}><Heart />{shop.wish.length > 0 && <span className="count">{shop.wish.length}</span>}</button>
          <button className="icon-button count-button" aria-label="Shopping bag" onClick={() => open("cart")}><ShoppingBag />{shop.count > 0 && <span className="count">{shop.count}</span>}</button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onShop }: { onShop: () => void }) {
  return (
    <section className="hero">
      <img className="hero-image" src={heroImage} alt="Model in an oversized graphic shirt, lit in red" />
      <div className="hero-ambient" aria-hidden="true" />
      <div className="hero-shade" />
      <div className="hero-copy">
        <p className="eyebrow"><span className="red-mark" /> DROP 01 · BAGGY SHIRTS + HOODIES · COMING SOON</p>
        <h1>BUILT<br /><span>DIFFERENT.</span></h1>
        <p className="hero-description">Oversized baggy shirts. Heavyweight hoodies.<br />Drop 01 is on its way.</p>
        <div className="hero-ctas"><button className="button-primary" onClick={onShop}>Explore the drop <ArrowUpRight size={16} /></button><a className="button-outline" href="#collections">Collections</a></div>
      </div>
      <div className="hero-index"><span>01</span> / 07 <i /></div>
      <div className="vertical-note">MADE FOR THE ONES WHO MOVE DIFFERENT</div>
    </section>
  );
}

function Collections({ onPick }: { onPick: (category: Category) => void }) {
  return (
    <section className="collections section-wrap" id="collections">
      <div className="section-heading">
        <div><p className="eyebrow">THE DROP / 001</p><h2>Choose your<br className="mobile-only" /> silhouette.</h2></div>
        <span className="heading-side">Two forms.<br />One point of view.</span>
      </div>
      <div className="collection-grid">
        <button className="collection-tile" onClick={() => onPick("baggy")}>
          <img src={baggyImage} alt="Charcoal oversized baggy shirt" loading="lazy" /><span className="collection-wash" />
          <span className="tile-top">01 / 02 <ArrowUpRight size={17} /></span><span className="tile-caption"><small>DROP 01 — 01</small><strong>BAGGY<br />SHIRTS</strong><em>Explore collection <ChevronRight size={14} /></em></span>
        </button>
        <button className="collection-tile" onClick={() => onPick("hoodie")}>
          <img src={hoodieImage} alt="Model wearing a black heavyweight hoodie" loading="lazy" /><span className="collection-wash" />
          <span className="tile-top">02 / 02 <ArrowUpRight size={17} /></span><span className="tile-caption"><small>DROP 01 — 02</small><strong>HEAVY<br />HOODIES</strong><em>Explore collection <ChevronRight size={14} /></em></span>
        </button>
      </div>
    </section>
  );
}

function ShopSection({ shop, filter, setFilter, onQuick, notify }: {
  shop: Shop; filter: Category | "all"; setFilter: (category: Category | "all") => void; onQuick: (product: Product) => void; notify: (message: string) => void;
}) {
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Featured");
  const list = useMemo(() => {
    const products = PRODUCTS.filter((product) => filter === "all" || product.category === filter);
    if (sort === "Price Low to High") return [...products].sort((a, b) => a.price - b.price);
    if (sort === "Price High to Low") return [...products].sort((a, b) => b.price - a.price);
    if (sort === "Name") return [...products].sort((a, b) => a.name.localeCompare(b.name));
    return products;
  }, [filter, sort]);
  return (
    <section className="shop-section" id="shop">
      <div className="section-wrap shop-inner">
        <div className="shop-title-row"><div><p className="eyebrow">FIRST LOOK / ALL PIECES</p><h2>The drop.</h2></div><span className="product-total">0{list.length} PIECES<br />ALL COMING SOON</span></div>
        <div className="shop-toolbar">
          <div className="filters"><SlidersHorizontal size={14} /><button onClick={() => setFilter("all")} className={filter === "all" ? "filter-active" : ""}>All pieces</button>{CATEGORIES.map((category) => <button key={category.id} onClick={() => setFilter(category.id)} className={filter === category.id ? "filter-active" : ""}>{category.name}</button>)}</div>
          <label className="sort-label">SORT <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>{SORTS.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="product-grid">
          {list.map((product, index) => <ProductCard key={product.id} product={product} saved={shop.wish.includes(product.id)} onQuick={onQuick} toggleWish={() => { const saved = shop.wish.includes(product.id); shop.toggleWish(product.id); notify(saved ? "Removed from wishlist" : "Saved to wishlist"); }} index={index} />)}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, saved, onQuick, toggleWish, index }: { product: Product; saved: boolean; onQuick: (product: Product) => void; toggleWish: () => void; index: number }) {
  const image = product.category === "baggy" ? baggyImage : hoodieImage;
  return (
    <article className="product-card" data-testid={`card-product-${product.id}`}>
      <div className="product-image-wrap">
        <img src={image} alt={product.name} loading="lazy" />
        <span className="product-badge">{product.badge}</span>
        <button className="wish-toggle" aria-label={saved ? "Remove from wishlist" : "Add to wishlist"} onClick={toggleWish}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button>
        <button className="quick-button" onClick={() => onQuick(product)}>Quick view <ArrowUpRight size={14} /></button>
        <span className="image-index">S7 / 0{index + 1}</span>
      </div>
      <div className="product-info"><div><h3>{product.name}</h3><p>{product.type}</p></div><strong>{pkr(product.price)}</strong></div>
      <p className="card-coming">AVAILABLE SOON <span /></p>
    </article>
  );
}

function About() {
  return (
    <section className="about-section" id="about">
      <div className="section-wrap about-layout">
        <div className="about-image"><img src={hoodieImage} alt="SE7EN heavyweight hoodie, made for a relaxed fit" loading="lazy" /><span>SE7EN / PAKISTAN</span></div>
        <div className="about-copy"><p className="eyebrow">A DIFFERENT KIND OF UNIFORM</p><h2>Made<br />oversized.</h2><p>SE7EN is a streetwear label built around oversized silhouettes and heavyweight fabrics. Drop 01 — baggy shirts and hoodies — is coming soon. The details stay deliberate and the attitude simple.</p><div className="about-rule"><span>01</span><span>BUILT DIFFERENT.</span></div></div>
      </div>
    </section>
  );
}

function Newsletter({ notify }: { notify: (message: string) => void }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="newsletter">
      <div className="section-wrap newsletter-inner"><div><p className="eyebrow">DON'T MISS THE DROP</p><h2>Hear first.<br /><span>Wear soon.</span></h2><p>New releases and restocks. Nothing else.</p></div>
        {done ? <p className="subscribed"><Check size={16} /> Preview only — email was not sent.</p> : <form onSubmit={(event) => { event.preventDefault(); setDone(true); notify("Preview only — email was not sent"); }}><label htmlFor="newsletter-email">EMAIL ADDRESS</label><div className="newsletter-entry"><input id="newsletter-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /><button aria-label="Preview newsletter signup"><ArrowUpRight size={18} /></button></div><small>Preview only — emails aren't saved or sent.</small></form>}
      </div>
      <span className="newsletter-watermark">7</span>
    </section>
  );
}

function Footer({ goShop, open }: { goShop: (category: Category | "all") => void; open: (overlay: Overlay) => void }) {
  return (
    <footer className="footer" id="contact"><div className="section-wrap footer-grid">
      <div className="footer-brand"><a className="brand" href="#top" aria-label="SE7EN home" data-testid="link-brand-home-footer"><img src="/brand/se7en-gothic-black-red.png" alt="SE7EN" /></a><p>BUILT DIFFERENT.</p></div>
      <div><p className="footer-label">THE DROP</p><button onClick={() => goShop("all")}>All pieces</button><button onClick={() => goShop("baggy")}>Baggy shirts</button><button onClick={() => goShop("hoodie")}>Hoodies</button></div>
      <div><p className="footer-label">NEED TO KNOW</p><button onClick={() => open("size")}>Size guide</button><p>Shipping: {pkr(SHIPPING_FEE)}<br />Free over {pkr(FREE_SHIPPING)}</p><p>Returns: contact us within 7 days</p></div>
      <div><p className="footer-label">SE7EN / PAKISTAN</p><a href="#about">About the label</a><p>Instagram · TikTok · WhatsApp<br />Links coming soon</p></div>
    </div><div className="footer-bottom"><span>© {new Date().getFullYear()} SE7EN</span><span>DROP 01 — COMING SOON</span><span>FRONTEND PREVIEW / NO ORDERS PROCESSED</span></div></footer>
  );
}

function Modal({ close, children, wide, side }: { close: () => void; children: ReactNode; wide?: boolean; side?: boolean }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><div role="dialog" aria-modal="true" className={`modal-panel${wide ? " modal-wide" : ""}${side ? " modal-side" : ""}`}>{children}</div></div>;
}
function CloseButton({ close }: { close: () => void }) { return <button aria-label="Close" className="close-button" onClick={close}><X size={19} /></button>; }

function MobileMenu({ close, goShop, open }: { close: () => void; goShop: (category: Category | "all") => void; open: (overlay: Overlay) => void }) {
  return <div className="mobile-menu"><div className="menu-top"><a className="brand" href="#top" aria-label="SE7EN home" data-testid="link-brand-home-mobile" onClick={close}><img src="/brand/se7en-gothic-black-red.png" alt="SE7EN" /></a><CloseButton close={close} /></div><nav><a href="#top" onClick={close}>Home</a><button onClick={() => goShop("all")}>Shop</button><a href="#collections" onClick={close}>Collections</a><a href="#about" onClick={close}>About</a><button onClick={() => open("search")}>Search</button><button onClick={() => open("wish")}>Wishlist</button><button onClick={() => open("cart")}>Bag</button></nav><p>DROP 01 · COMING SOON</p></div>;
}

function SearchOverlay({ close, onPick }: { close: () => void; onPick: (product: Product) => void }) {
  const [query, setQuery] = useState("");
  const results = query.trim() ? PRODUCTS.filter((product) => `${product.name} ${product.type} ${product.category}`.toLowerCase().includes(query.toLowerCase())) : [];
  return <div className="search-screen"><div className="search-content"><div className="search-bar"><Search size={20} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the drop" aria-label="Search products" /><CloseButton close={close} /></div><p className="eyebrow">{query ? `${results.length} MATCHING PIECES` : "SEARCH / DROP 01"}</p><div className="search-results">{query && results.length === 0 && <p className="muted">No products match “{query}”.</p>}{results.map((product) => <button key={product.id} onClick={() => onPick(product)}><img src={product.category === "baggy" ? baggyImage : hoodieImage} alt="" /><span><strong>{product.name}</strong><small>{product.type} · COMING SOON</small></span><b>{pkr(product.price)}</b></button>)}</div></div></div>;
}

function QuickView({ product, shop, close, openSize, added, notify }: { product: Product; shop: Shop; close: () => void; openSize: () => void; added: () => void; notify: (message: string) => void }) {
  const [size, setSize] = useState("");
  const [colour, setColour] = useState(product.colours?.[0] ?? "");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const saved = shop.wish.includes(product.id);
  const image = product.category === "baggy" ? baggyImage : hoodieImage;
  return <Modal close={close} wide><div className="quick-layout"><img className="quick-image" src={image} alt={product.name} /><div className="quick-details"><div className="quick-top"><p className="eyebrow">{product.type} / COMING SOON</p><CloseButton close={close} /></div><h2>{product.name}</h2><p className="quick-price">{pkr(size ? unitPrice(product, size) : product.price)}</p><p className="quick-note">{product.note}</p>
    <div className="quick-group"><span className="field-label">COLOUR — {colour}</span><div className="chips">{product.colours?.map((item) => <button key={item} className={`chip${colour === item ? " selected" : ""}`} onClick={() => setColour(item)}>{item}</button>)}</div></div>
    <div className="quick-group"><div className="size-title"><span className="field-label">SELECT SIZE</span><button onClick={openSize}>SIZE GUIDE</button></div><div className="chips">{product.sizes.map((item) => <button key={item} className={`chip size-chip${size === item ? " selected" : ""}`} onClick={() => { setSize(item); setError(""); }}>{item}</button>)}</div>{error && <p className="form-error">{error}</p>}</div>
    <div className="quick-actions"><Quantity value={qty} setValue={setQty} /><button className="button-primary preview-add" onClick={() => { if (!size) { setError("Choose a size to add this piece to your preview bag."); return; } shop.add(product.id, size, colour, qty); notify("Added to preview bag"); added(); }}>Add to preview bag</button><button aria-label="Save to wishlist" className={`outline-icon${saved ? " saved" : ""}`} onClick={() => { shop.toggleWish(product.id); notify(saved ? "Removed from wishlist" : "Saved to wishlist"); }}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button></div>
    <p className="preview-note">PREVIEW ONLY — THIS STYLE IS COMING SOON. NO PURCHASE CAN BE MADE.</p></div></div></Modal>;
}

function Quantity({ value, setValue }: { value: number; setValue: (value: number) => void }) {
  return <div className="quantity"><button aria-label="Decrease quantity" onClick={() => setValue(Math.max(1, value - 1))}><Minus size={13} /></button><span>{value}</span><button aria-label="Increase quantity" onClick={() => setValue(value + 1)}><Plus size={13} /></button></div>;
}

function Drawer({ mode, shop, close, setMode, onQuick, onCheckout }: { mode: "cart" | "wish"; shop: Shop; close: () => void; setMode: (overlay: Overlay) => void; onQuick: (product: Product) => void; onCheckout: () => void }) {
  const wishlist = PRODUCTS.filter((product) => shop.wish.includes(product.id));
  const left = FREE_SHIPPING - shop.subtotal;
  return <Modal close={close} side><div className="drawer-head"><div className="drawer-tabs"><button className={mode === "cart" ? "active" : ""} onClick={() => setMode("cart")}>Preview bag <span>{shop.count}</span></button><button className={mode === "wish" ? "active" : ""} onClick={() => setMode("wish")}>Wishlist <span>{shop.wish.length}</span></button></div><CloseButton close={close} /></div>
    <div className="drawer-body">{mode === "cart" ? shop.lines.length === 0 ? <EmptyState text="Your preview bag is empty." close={close} /> : shop.lines.map((line) => <div className="drawer-line" key={line.key}><img src={line.p.category === "baggy" ? baggyImage : hoodieImage} alt="" /><div className="line-details"><strong>{line.p.name}</strong><small>{[line.colour, line.size].filter(Boolean).join(" / ")}</small><div><Quantity value={line.qty} setValue={(qty) => shop.setQty(line.key, qty)} /><b>{pkr(line.unit * line.qty)}</b></div></div></div>) : wishlist.length === 0 ? <EmptyState text="Nothing saved yet." close={close} /> : wishlist.map((product) => <div className="drawer-line" key={product.id}><img src={product.category === "baggy" ? baggyImage : hoodieImage} alt="" /><div className="line-details"><strong>{product.name}</strong><small>{pkr(product.price)} · COMING SOON</small><button className="select-piece" onClick={() => { close(); onQuick(product); }}>Select piece <ArrowUpRight size={13} /></button></div><button aria-label="Remove from wishlist" className="remove-line" onClick={() => shop.toggleWish(product.id)}><X size={16} /></button></div>)}</div>
    {mode === "cart" && shop.lines.length > 0 && <div className="drawer-summary"><p className="shipping-hint">{left > 0 ? `Add ${pkr(left)} more for free shipping.` : "You've unlocked free shipping."}</p><SummaryRow label="Subtotal" value={pkr(shop.subtotal)} /><SummaryRow label="Shipping" value={shop.shipping ? pkr(shop.shipping) : "Free"} /><SummaryRow label="Total" value={pkr(shop.total)} bold /><button className="button-primary checkout-button" onClick={onCheckout}>Continue to demo checkout <ArrowUpRight size={15} /></button><p className="preview-note">DEMO ONLY · NO ORDER IS SENT · NO PAYMENT IS TAKEN</p></div>}</Modal>;
}

function EmptyState({ text, close }: { text: string; close: () => void }) { return <div className="empty-state"><span>SE7EN / 00</span><p>{text}</p><a className="button-outline" href="#shop" onClick={close}>Continue browsing <ArrowUpRight size={14} /></a></div>; }
function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) { return <div className={`summary-row${bold ? " total-row" : ""}`}><span>{label}</span><b>{value}</b></div>; }

function Checkout({ shop, close }: { shop: Shop; close: () => void }) {
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState({ name: "", phone: "", email: "", address: "", city: "", province: "Punjab", postal: "", payment: "Cash on Delivery" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [complete, setComplete] = useState(false);
  const update = (key: keyof typeof fields, value: string) => setFields((current) => ({ ...current, [key]: value }));
  const validate = () => {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (fields.name.trim().length < 2) next.name = "Enter your full name.";
      if (!/^(\+92|0)?3\d{2}[- ]?\d{7}$/.test(fields.phone.replace(/\s/g, ""))) next.phone = "Enter a valid Pakistani mobile, e.g. 03001234567.";
      if (fields.email && !/^\S+@\S+\.\S+$/.test(fields.email)) next.email = "Enter a valid email.";
    }
    if (step === 1) {
      if (fields.address.trim().length < 8) next.address = "Enter your complete address.";
      if (!fields.city.trim()) next.city = "Enter your city.";
      if (fields.postal && !/^\d{5}$/.test(fields.postal)) next.postal = "Postal code is 5 digits.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const placePreview = () => { setComplete(true); shop.clear(); };
  if (complete) return <Modal close={close}><div className="completion"><span className="completion-check"><Check size={21} /></span><p className="eyebrow">DEMO COMPLETE</p><h2>Preview only.</h2><p>Thanks, {fields.name}. This is only a checkout preview. No order has been sent, no inventory reserved, and no payment was taken.</p><button className="button-primary" onClick={close}>Back to store</button></div></Modal>;
  return <Modal close={close} wide><div className="checkout-head"><div><p className="eyebrow">A CHECKOUT PREVIEW</p><h2>Guest checkout</h2></div><CloseButton close={close} /></div><div className="checkout-warning">DEMO ONLY — no order is sent and no payment is taken.</div>
    <div className="checkout-layout"><div className="checkout-form"><ol className="steps">{["Contact", "Delivery", "Payment", "Review"].map((name, index) => <li className={index === step ? "current" : index < step ? "passed" : ""} key={name}><span>0{index + 1}</span>{name}</li>)}</ol>
      {shop.lines.length === 0 ? <p className="muted">Your preview bag is empty.</p> : <div className="step-content">
        {step === 0 && <><Field label="Full name" value={fields.name} onChange={(value) => update("name", value)} error={errors.name} /><Field label="Phone" type="tel" placeholder="03XX XXXXXXX" value={fields.phone} onChange={(value) => update("phone", value)} error={errors.phone} /><Field label="Email (optional)" type="email" value={fields.email} onChange={(value) => update("email", value)} error={errors.email} /></>}
        {step === 1 && <><Field label="Complete address" placeholder="House, street, area" value={fields.address} onChange={(value) => update("address", value)} error={errors.address} /><div className="field-pair"><Field label="City" value={fields.city} onChange={(value) => update("city", value)} error={errors.city} /><Field label="Postal code (optional)" value={fields.postal} onChange={(value) => update("postal", value)} error={errors.postal} /></div><label className="field-label">PROVINCE<select className="form-field" value={fields.province} onChange={(event) => update("province", event.target.value)}>{PROVINCES.map((province) => <option key={province}>{province}</option>)}</select></label><Field label="Country" value="Pakistan" onChange={() => undefined} disabled /></>}
        {step === 2 && <div className="payment-options">{["Cash on Delivery", "Bank Transfer"].map((payment) => <label className={fields.payment === payment ? "payment-choice chosen" : "payment-choice"} key={payment}><input type="radio" checked={fields.payment === payment} onChange={() => update("payment", payment)} /><span><b>{payment}</b><small>{payment === "Cash on Delivery" ? "Pay in cash when your order arrives." : "Bank details are shared after the order is confirmed."}</small></span></label>)}<p className="preview-note">Payment options are shown for demo only. No payment setup is connected.</p></div>}
        {step === 3 && <div className="review-list"><Review label="Contact" value={`${fields.name} · ${fields.phone}${fields.email ? ` · ${fields.email}` : ""}`} edit={() => setStep(0)} /><Review label="Delivery" value={`${fields.address}, ${fields.city}, ${fields.province}${fields.postal ? ` ${fields.postal}` : ""}, Pakistan`} edit={() => setStep(1)} /><Review label="Payment" value={fields.payment} edit={() => setStep(2)} /><p className="preview-note">This is a demo. Confirming does not place an order or take payment.</p></div>}
        <div className="checkout-controls"><button className="button-outline" onClick={() => step ? setStep(step - 1) : close()}>{step ? "Back" : "Cancel"}</button>{step < 3 ? <button className="button-primary" onClick={() => { if (validate()) setStep(step + 1); }}>Continue <ArrowUpRight size={15} /></button> : <button className="button-primary" onClick={placePreview}>Complete preview <Check size={15} /></button>}</div>
      </div>}
    </div><aside className="checkout-summary"><p className="field-label">YOUR PREVIEW BAG</p>{shop.lines.map((line) => <div className="checkout-item" key={line.key}><span>{line.qty}× {line.p.name} <small>{line.size}</small></span><b>{pkr(line.unit * line.qty)}</b></div>)}<SummaryRow label="Subtotal" value={pkr(shop.subtotal)} /><SummaryRow label="Shipping" value={shop.shipping ? pkr(shop.shipping) : "Free"} /><SummaryRow label="Total" value={pkr(shop.total)} bold /></aside></div></Modal>;
}

function Field({ label, type = "text", placeholder, value, onChange, error, disabled }: { label: string; type?: string; placeholder?: string; value: string; onChange: (value: string) => void; error?: string; disabled?: boolean }) {
  return <label className="field-label">{label}<input className="form-field" type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} />{error && <small className="form-error">{error}</small>}</label>;
}
function Review({ label, value, edit }: { label: string; value: string; edit: () => void }) { return <div className="review-card"><span><small>{label}</small>{value}</span><button onClick={edit}>Edit</button></div>; }

function SizeGuide({ close }: { close: () => void }) {
  const rows = [["S", "40", "27"], ["M", "42", "28"], ["L", "44", "29"], ["XL", "46", "30"], ["XXL", "48", "31"]];
  return <Modal close={close}><div className="size-guide"><div className="modal-heading"><div><p className="eyebrow">FIT / REFERENCE</p><h2>Size guide</h2></div><CloseButton close={close} /></div><p>Measurements in inches, garment laid flat. Oversized fit — size down for a closer fit.</p><table><thead><tr><th>Size</th><th>Chest</th><th>Length</th></tr></thead><tbody>{rows.map((row) => <tr key={row[0]}><th>{row[0]}</th><td>{row[1]}"</td><td>{row[2]}"</td></tr>)}</tbody></table></div></Modal>;
}

function Welcome({ close }: { close: () => void }) {
  const [done, setDone] = useState(false);
  return <Modal close={close}><div className="welcome-modal"><div className="welcome-close"><CloseButton close={close} /></div><p className="eyebrow">WELCOME OFFER / PREVIEW ONLY</p><h2>10% off your<br />first order.</h2>{done ? <><p>Preview code:</p><strong className="welcome-code">WELCOME10</strong><p className="preview-note">This offer isn't active. Your email wasn't saved or sent.</p><button className="button-outline" onClick={close}>Start browsing</button></> : <form onSubmit={(event) => { event.preventDefault(); setDone(true); }}><label className="field-label" htmlFor="welcome-email">EMAIL ADDRESS</label><div className="welcome-entry"><input id="welcome-email" type="email" required placeholder="you@example.com" /><button className="button-primary">Preview code</button></div></form>}<button className="no-thanks" onClick={close}>No thanks</button><p className="preview-note">Demo only — discount is not active and email isn't saved or sent.</p></div></Modal>;
}
