import { useEffect, useState, useCallback } from "react";
import baggy from "@/assets/baggy.jpg";
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

const T = ["S", "M", "L", "XL", "XXL"];
const SOON = "COMING SOON";
export const PRODUCTS: Product[] = [
  { id: 1, name: "DISTRICT OVERSIZED", category: "baggy", type: "Baggy / Oversized", price: 2899, badge: SOON, sizes: ["M", "L", "XL", "XXL"], colours: ["Black", "Charcoal", "White"], image: baggy, note: "Washed finish, wide body, ribbed collar." },
  { id: 2, name: "RAW FORM", category: "baggy", type: "Baggy / Oversized", price: 2999, badge: SOON, sizes: ["M", "L", "XL", "XXL"], colours: ["Black", "Charcoal", "Red"], image: baggy, note: "Extra-long body and sleeves, heavy jersey." },
  { id: 3, name: "WIDE CUT SHIRT", category: "baggy", type: "Baggy / Boxy", price: 2699, badge: SOON, sizes: T, colours: ["Black", "White"], image: baggy, note: "Boxy cut with dropped shoulders and a clean back." },
  { id: 4, name: "HEAVYWEIGHT HOODIE", category: "hoodie", type: "Hoodie / Oversized", price: 3999, badge: SOON, sizes: T, colours: ["Black", "Charcoal"], image: hoodie, note: "450gsm fleece, double-layer hood, tonal chest mark." },
  { id: 5, name: "NIGHT PULLOVER", category: "hoodie", type: "Hoodie / Relaxed", price: 3799, badge: SOON, sizes: T, colours: ["Black", "Red"], image: hoodie, note: "Relaxed fit with kangaroo pocket and ribbed cuffs." },
  { id: 6, name: "SE7EN ZIP HOODIE", category: "hoodie", type: "Hoodie / Zip-up", price: 4299, badge: SOON, sizes: T, colours: ["Black"], image: hoodie, note: "Full zip, heavy jersey, embroidered back logo." },
];

export const FREE_SHIPPING = 5000;
export const SHIPPING_FEE = 250;
export const WHATSAPP_NUMBER = ""; // set real number (international, no +)
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
