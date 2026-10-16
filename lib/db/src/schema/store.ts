import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const productsTable = pgTable("store_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull(),
  pricePkr: integer("price_pkr").notNull(),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const productVariantsTable = pgTable("store_product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  size: text("size").notNull(),
  color: text("color"),
  priceOverridePkr: integer("price_override_pkr"),
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const ordersTable = pgTable("store_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code"),
  country: text("country").notNull().default("Pakistan"),
  paymentMethod: text("payment_method").notNull().default("cod"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  status: text("status").notNull().default("new"),
  subtotalPkr: integer("subtotal_pkr").notNull(),
  shippingFeePkr: integer("shipping_fee_pkr").notNull(),
  totalPkr: integer("total_pkr").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const orderItemsTable = pgTable("store_order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => productsTable.id, { onDelete: "set null" }),
  variantId: uuid("variant_id").references(() => productVariantsTable.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  size: text("size").notNull(),
  color: text("color"),
  unitPricePkr: integer("unit_price_pkr").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotalPkr: integer("line_total_pkr").notNull(),
});
