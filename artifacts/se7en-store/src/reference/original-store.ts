import { useEffect, useState, useCallback } from "react";
import baggyBlackFuturistic from "@/assets/baggy-black-futuristic.png";
import baggyBlackCyber from "@/assets/baggy-black-cyber.png";
import baggyBlack3 from "@/assets/baggy-black-3.png";
import baggyWhite1 from "@/assets/baggy-white-1.png";
import baggyWhite2 from "@/assets/baggy-white-2.png";
import hoodie from "@/assets/hoodie.jpg";

export type Category = "baggy" | "hoodie";
export type Product = {
  id: number; name: string; category: Category; type: string; price: number;
  badge: string; sizes: string[]; colours?: string[] | undefined; image: string; note: string;
};

export const CATEGORIES: { id: Category; name: string }[] = [
  { id: "baggy", name: "Baggy Shirts" },
  { id: "hoodie", name: "Hoodies" },
];

const T = ["S", "M", "L", "XL"];
const SOON = "COMING SOON";
export const PRODUCTS: Product[] = [
  { id: 1, name: "FUTURISTIC PERSPECTIVE", category: "baggy", type: "Baggy / Oversized", price: 2899, badge: SOON, sizes: T, colours: ["Black"], image: baggyBlackFuturistic, note: "Grid perspective graphics with futuristic cyber typography on heavyweight black cotton." },
  { id: 2, name: "CYBER GOTHIC", category: "baggy", type: "Baggy / Oversized", price: 2999, badge: SOON, sizes: T, colours: ["Black"], image: baggyBlackCyber, note: "Chrome metallic tribal lettering with deep gothic edge on oversized fit." },
  { id: 3, name: "NO FILTER BAGGY", category: "baggy", type: "Baggy / Boxy", price: 2799, badge: SOON, sizes: T, colours: ["Black"], image: baggyBlack3, note: "Statement typography with crimson star accents on heavy cotton." },
  { id: 4, name: "VENOM WEB OVERSIZED", category: "baggy", type: "Baggy / Oversized", price: 2899, badge: SOON, sizes: T, colours: ["White"], image: baggyWhite1, note: "Clean white silhouette featuring deep red spider venom back design." },
  { id: 5, name: "DRIPPING SE7EN PURE", category: "baggy", type: "Baggy / Boxy", price: 2899, badge: SOON, sizes: T, colours: ["White"], image: baggyWhite2, note: "Signature bloody typography in deep blood red on crisp white jersey." },
  { id: 6, name: "HEAVYWEIGHT HOODIE", category: "hoodie", type: "Hoodie / Oversized", price: 3999, badge: SOON, sizes: T, colours: ["Black"], image: hoodie, note: "450gsm fleece, double-layer hood, tonal chest mark." },
  { id: 7, name: "NIGHT PULLOVER", category: "hoodie", type: "Hoodie / Relaxed", price: 3799, badge: SOON, sizes: T, colours: ["Black", "Red"], image: hoodie, note: "Relaxed fit with kangaroo pocket and ribbed cuffs." },
  { id: 8, name: "SE7EN ZIP HOODIE", category: "hoodie", type: "Hoodie / Zip-up", price: 4299, badge: SOON, sizes: T, colours: ["Black"], image: hoodie, note: "Full zip, heavy jersey, embroidered back logo." },
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
