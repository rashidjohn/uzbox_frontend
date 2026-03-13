import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";
import type {
  Product,
  ProductDetail,
  Category,
  PaginatedResponse,
  Order,
  User,
  Address,
} from "@/types";

// ─────────────────────────────────────────────────────────────
// Kategoriyalar
// ─────────────────────────────────────────────────────────────
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/products/categories/");
      return Array.isArray(data) ? data : (data.results ?? []);
    },
    staleTime: 5 * 60_000,
  });
}

// ─────────────────────────────────────────────────────────────
// Mahsulotlar ro'yxati
// ─────────────────────────────────────────────────────────────
export function useProducts(params?: {
  search?: string;
  category?: string;
  ordering?: string;
  page?: number;
  has_discount?: boolean;
  ids?: string;         // vergul bilan ajratilgan UUID lar
}) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ["products", params],
    queryFn: async () => {
      const { data } = await api.get("/products/", { params });
      // ids filter paginate o'chirilgan — massiv qaytaradi
      if (Array.isArray(data)) {
        return { count: data.length, next: null, previous: null, results: data };
      }
      return data;
    },
    staleTime: 30_000,   // 30s — stok yangilanishi tez ko'rinsin
  });
}

// ─────────────────────────────────────────────────────────────
// Savatdagi mahsulotlar stokini tekshirish
// ─────────────────────────────────────────────────────────────
export function useVerifyStock(ids: string[]) {
  return useQuery<Product[]>({
    queryKey: ["verify-stock", ids],
    queryFn: async () => {
      if (!ids.length) return [];
      const { data } = await api.get("/products/", {
        params: { ids: ids.join(",") },
      });
      return Array.isArray(data) ? data : (data.results ?? []);
    },
    enabled: ids.length > 0,
    staleTime: 0,        // har doim yangi ma'lumot
    gcTime: 0,
  });
}

// ─────────────────────────────────────────────────────────────
// Bitta mahsulot (detail)
// ─────────────────────────────────────────────────────────────
export function useProduct(slug: string) {
  return useQuery<ProductDetail>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}/`);
      return data;
    },
    enabled: !!slug,
    staleTime: 30_000,   // 30s — stok ko'rinsin
    refetchOnWindowFocus: true,   // tab ga qaytganda yangilash
  });
}

// ─────────────────────────────────────────────────────────────
// Sharh yaratish
// ─────────────────────────────────────────────────────────────
export function useCreateReview(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { rating: number; comment: string }) =>
      api.post(`/products/${slug}/reviews/`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product", slug] }),
  });
}

// ─────────────────────────────────────────────────────────────
// Auth — profil
// ─────────────────────────────────────────────────────────────
function isLoggedIn() {
  return typeof window !== "undefined" && !!localStorage.getItem("access_token");
}

export function useProfile() {
  return useQuery<User>({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get("/auth/profile/");
      return data;
    },
    enabled: isLoggedIn(),
    retry: false,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FormData | Partial<Pick<User, "full_name" | "phone">>) =>
      api.patch("/auth/profile/", body, {
        headers: body instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { old_password: string; new_password: string }) =>
      api.post("/auth/change-password/", body).then((r) => r.data),
  });
}

// ─────────────────────────────────────────────────────────────
// Manzillar
// ─────────────────────────────────────────────────────────────
export function useAddresses() {
  return useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await api.get("/auth/addresses/");
      return Array.isArray(data) ? data : (data.results ?? []);
    },
    enabled: isLoggedIn(),
    retry: false,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<Address, "id" | "user">) =>
      api.post("/auth/addresses/", body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/auth/addresses/${id}/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

// ─────────────────────────────────────────────────────────────
// Buyurtmalar
// ─────────────────────────────────────────────────────────────
export function useOrders(page = 1) {
  return useQuery<PaginatedResponse<Order>>({
    queryKey: ["orders", page],
    queryFn: async () => {
      const { data } = await api.get("/orders/", { params: { page } });
      return data;
    },
    enabled: isLoggedIn(),
    retry: false,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      payment_method: string;
      address: Record<string, string>;
      note?: string;
      items: { product_id: string; quantity: number }[];
    }) => api.post("/orders/", body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      // Buyurtma yaratilgandan keyin mahsulot stokini yangilash
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// To'lov URL yaratish
// ─────────────────────────────────────────────────────────────
export function useCreatePayment() {
  return useMutation({
    mutationFn: ({ method, order_id }: { method: "click" | "payme"; order_id: string }) =>
      api.post(`/payments/${method}/create/`, { order_id }).then((r) => r.data),
  });
}


// ─────────────────────────────────────────────────────────────
// Wishlist
// ─────────────────────────────────────────────────────────────
export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data } = await api.get("/auth/wishlist/");
      return (Array.isArray(data) ? data : data.results ?? []) as Array<{
        id: number;
        product: import("@/types").Product;
        created_at: string;
      }>;
    },
    enabled: isLoggedIn(),
    retry: false,
  });
}

export function useWishlistToggle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      api.post(`/auth/wishlist/${productId}/toggle/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

// ─────────────────────────────────────────────────────────────
// Promo-kod tekshirish
// ─────────────────────────────────────────────────────────────
export function useCheckPromo() {
  return useMutation({
    mutationFn: (body: { code: string; order_total: number }) =>
      api.post("/orders/promo/check/", body).then((r) => r.data) as Promise<{
        valid: boolean;
        code: string;
        discount_amount: number;
        final_total: number;
        error?: string;
      }>,
  });
}

// ─────────────────────────────────────────────────────────────
// Autocomplete
// ─────────────────────────────────────────────────────────────
export function useAutocomplete(q: string) {
  return useQuery({
    queryKey: ["autocomplete", q],
    queryFn: async () => {
      const { data } = await api.get("/products/autocomplete/", { params: { q } });
      return data as Array<{ id: string; name: string; slug: string; price: number; image: string | null }>;
    },
    enabled: q.length >= 2,
    staleTime: 10_000,
  });
}

// ─────────────────────────────────────────────────────────────
// Email verification
// ─────────────────────────────────────────────────────────────
export function useSendVerifyEmail() {
  return useMutation({
    mutationFn: () => api.post("/auth/send-verify-email/").then((r) => r.data),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (body: { uid: string; token: string }) =>
      api.post("/auth/verify-email/", body).then((r) => r.data),
  });
}


// ─────────────────────────────────────────────────────────────
// Buyurtmani bekor qilish (faqat pending)
// ─────────────────────────────────────────────────────────────
export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      api.patch(`/orders/${orderId}/`, { status: "cancelled" }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Order detail (bitta buyurtma)
// ─────────────────────────────────────────────────────────────
export function useOrderDetail(orderId: string | null) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${orderId}/`);
      return data as import("@/types").Order;
    },
    enabled: !!orderId && isLoggedIn(),
    staleTime: 10_000,
  });
}

// ─────────────────────────────────────────────────────────────
// Manzil yangilash va default qilish
// ─────────────────────────────────────────────────────────────
export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<Omit<Address, "id" | "user">> }) =>
      api.patch(`/auth/addresses/${id}/`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}