// ── Kategoriya ─────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  parent: number | null;
  children: Category[];
}

// ── Mahsulot ───────────────────────────────────────────────
export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_name: string;
  price: number;
  discount_price: number | null;
  discount_percent: number;
  current_price: number;
  stock: number;
  rating_avg: number;
  review_count: number;
  primary_image: string | null;
}

export interface ProductDetail extends Omit<Product, "category_name"> {
  description: string;
  category: Category;
  images: ProductImage[];
  attributes: ProductAttribute[];
  reviews: Review[];
  created_at: string;
  category_name?: string;
}

// ── Sahifalash ─────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── Savat ──────────────────────────────────────────────────
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  stock: number;        // stok chegarasi — savatda nazorat uchun
}

// ── Foydalanuvchi ──────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface Address {
  id: number;
  user: string;
  title: string;
  city: string;
  district: string;
  street: string;
  extra_info: string;
  is_default: boolean;
}

// ── Buyurtma ───────────────────────────────────────────────
export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  total_price: number;
  payment_method: "click" | "payme" | "cash";
  address: Record<string, string>;
  note: string;
  items: OrderItem[];
  created_at: string;
}

// ── To'lov ─────────────────────────────────────────────────
export interface PaymentCreateResponse {
  payment_url: string;
  is_test: boolean;
  amount: number;
  order_id: string;
}
