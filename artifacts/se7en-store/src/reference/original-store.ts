import { useEffect, useState, useCallback } from "react";
import baggyBlackFuturistic from "@/assets/baggy-black-futuristic.jpg";
import baggyBlackCyber from "@/assets/baggy-black-cyber.jpg";
import baggyBlack3 from "@/assets/baggy-black-3.jpg";
import baggyWhite1 from "@/assets/baggy-white-1.jpg";
import baggyWhite2 from "@/assets/baggy-white-2.jpg";
import hoodie from "@/assets/hoodie.jpg";

export type Category = "baggy" | "hoodie";
export type Product = {
  id: number; name: string; category: Category; type: string; price: number;
  badge: string; sizes: string[]; colours?: string[] | undefined; image: string; note: string;
  /** false = teaser even when the store is live (no samples / not launched yet). */
  live?: boolean;
};

export const CATEGORIES: { id: Category; name: string }[] = [
  { id: "baggy", name: "Baggy Shirts" },
  { id: "hoodie", name: "Hoodies" },
];

const T = ["S", "M", "L", "XL"];

/**
 * Launch switch.
 *   "live"   → products are orderable (bag → checkout → WhatsApp).
 *   "teaser" → nothing can be bought; every piece shows as coming soon and the
 *              only call to action is a WhatsApp "notify me" link.
 * Flip this one value and push to switch the whole store over.
 */
export const STORE_MODE: "live" | "teaser" = "live";
export const IS_LIVE = STORE_MODE === "live";

const SOON = IS_LIVE ? "DROP 01" : "COMING SOON";
export const BADGE_LABEL = SOON;

/** A product can be bought only when the store is live and the piece itself is live. */
export const isAvailable = (product: Product) => IS_LIVE && product.live !== false;

export const WHATSAPP_LINK = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
export const PRODUCTS: Product[] = [
  { id: 1, name: "FUTURISTIC PERSPECTIVE", category: "baggy", type: "Baggy / Oversized", price: 2899, badge: SOON, sizes: T, colours: ["Black"], image: baggyBlackFuturistic, note: "Grid perspective graphics with futuristic cyber typography on heavyweight black cotton." },
  { id: 2, name: "CYBER GOTHIC", category: "baggy", type: "Baggy / Oversized", price: 2999, badge: SOON, sizes: T, colours: ["Black"], image: baggyBlackCyber, note: "Chrome metallic tribal lettering with deep gothic edge on oversized fit." },
  { id: 3, name: "NO FILTER BAGGY", category: "baggy", type: "Baggy / Boxy", price: 2799, badge: SOON, sizes: T, colours: ["Black"], image: baggyBlack3, note: "Statement typography with crimson star accents on heavy cotton." },
  { id: 4, name: "VENOM WEB OVERSIZED", category: "baggy", type: "Baggy / Oversized", price: 2899, badge: SOON, sizes: T, colours: ["White"], image: baggyWhite1, note: "Clean white silhouette featuring deep red spider venom back design." },
  { id: 5, name: "DRIPPING SE7EN PURE", category: "baggy", type: "Baggy / Boxy", price: 2899, badge: SOON, sizes: T, colours: ["White"], image: baggyWhite2, note: "Signature bloody typography in deep blood red on crisp white jersey." },
  { id: 6, name: "HEAVYWEIGHT HOODIE", category: "hoodie", type: "Hoodie / Oversized", price: 3999, badge: "COMING SOON", live: false, sizes: T, colours: ["Black"], image: hoodie, note: "450gsm fleece, double-layer hood, tonal chest mark." },
  { id: 7, name: "NIGHT PULLOVER", category: "hoodie", type: "Hoodie / Relaxed", price: 3799, badge: "COMING SOON", live: false, sizes: T, colours: ["Black", "Red"], image: hoodie, note: "Relaxed fit with kangaroo pocket and ribbed cuffs." },
  { id: 8, name: "SE7EN ZIP HOODIE", category: "hoodie", type: "Hoodie / Zip-up", price: 4299, badge: "COMING SOON", live: false, sizes: T, colours: ["Black"], image: hoodie, note: "Full zip, heavy jersey, embroidered back logo." },
];

export const FREE_SHIPPING = 5000;
export const SHIPPING_FEE = 250;
export const WHATSAPP_NUMBER = "923010802810";
export const pkr = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;

export const unitPrice = (p: Product, _size: string) => p.price;

export type CartItem = { key: string; id: number; size: string; colour?: string | undefined; qty: number };

function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const s = localStorage.getItem(key); if (s) setV(JSON.parse(s)); } catch { /* ignore */ }
    setReady(true);
  }, [key]);
  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify(v)); }, [key, v, ready]);
  return [v, setV] as const;
}

export function useShop() {
  const [cart, setCart] = usePersisted<CartItem[]>("se7en_cart", []);
  const [wish, setWish] = usePersisted<number[]>("se7en_wishlist", []);
  const add = useCallback((id: number, size: string, colour?: string, qty = 1) => {
    const key = `${id}-${size}-${colour ?? ""}`;
    setCart((c) => c.some((i) => i.key === key)
      ? c.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
      : [...c, { key, id, size, colour, qty }]);
  }, [setCart]);
  const setQty = (key: string, qty: number) =>
    setCart((c) => (qty <= 0 ? c.filter((i) => i.key !== key) : c.map((i) => (i.key === key ? { ...i, qty } : i))));
  const toggleWish = (id: number) => setWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  const lines = cart.map((i) => { const p = PRODUCTS.find((x) => x.id === i.id)!; return { ...i, p, unit: unitPrice(p, i.size) }; });
  const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
  const count = cart.reduce((s, i) => s + i.qty, 0);
  return { cart, lines, add, setQty, clear: () => setCart([]), wish, toggleWish, subtotal, shipping, total: subtotal + shipping, count };
}
export type Shop = ReturnType<typeof useShop>;
