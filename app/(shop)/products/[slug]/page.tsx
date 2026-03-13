"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { useProduct, useProducts, useCreateReview, useWishlistToggle, useWishlist } from "@/lib/hooks";
import { useCartStore } from "@/store/cart";
import {
  ShoppingCart, Heart, Star, Check, Truck, RotateCcw,
  Shield, Plus, Minus, Loader2,
} from "lucide-react";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useProduct(slug);
  const { data: related } = useProducts({ page: 1 });

  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "attrs" | "reviews">("desc");
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");
  const [reviewSent, setReviewSent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const wishlistToggle = useWishlistToggle();
  const { data: wishlistItems } = useWishlist();

  // isLoggedIn va wishlist
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const productId = product?.id ? String(product.id) : null;
  const isInWishlist = wishlistItems?.some((w) => String(w.product.id) === productId) ?? false;
  const actualLiked = isLoggedIn ? isInWishlist : liked;

  // Savat
  const items         = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const addItem       = useCartStore((s) => s.addItem);

  const createReview = useCreateReview(slug);

  const handleAdd = () => {
    if (!product) return;
    const id = String(product.id);
    const existing = items.find((i) => i.id === id);

    if (existing) {
      // Savatda bor — miqdorni oshirish (stok chegarasi bilan)
      const newQty = Math.min(existing.quantity + qty, product.stock);
      updateQuantity(id, newQty);
    } else {
      // Yangi mahsulot — bir marta qo'shib, keyin updateQuantity
      addItem({
        id,
        name: product.name,
        price: Number(product.current_price),
        image: product.primary_image ?? null,
        stock: product.stock,
      });
      if (qty > 1) {
        updateQuantity(id, Math.min(qty, product.stock));
      }
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReview = async () => {
    if (!myComment.trim()) return;
    await createReview.mutateAsync({ rating: myRating, comment: myComment });
    setMyComment("");
    setReviewSent(true);
    setTimeout(() => setReviewSent(false), 3000);
  };

  if (isLoading)
    return (
      <>
        <Navbar />
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
          <Loader2 size={32} color="#f97316" style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </>
    );

  if (isError || !product)
    return (
      <>
        <Navbar />
        <div style={{ minHeight: "100vh", background: "#faf9f7", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 28, fontWeight: 800, color: "#1a1a18", marginBottom: 8 }}>
              Mahsulot topilmadi
            </h2>
            <Link href="/products" style={{ padding: "12px 28px", borderRadius: 12, background: "#f97316", color: "white", textDecoration: "none", fontWeight: 600 }}>
              Katalogga qaytish
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );

  const categoryName    = product.category_name ?? product.category?.name ?? "";
  const relatedProducts = (related?.results ?? [])
    .filter((p) => p.slug !== slug && (p.category_name === categoryName || !categoryName))
    .slice(0, 4);
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(product.rating_avg));

  // Savatda nechta bor
  const inCartQty = items.find((i) => i.id === String(product.id))?.quantity ?? 0;
  const maxCanAdd = product.stock - inCartQty;

  return (
    <>
      <style>{`
        .qty-btn{width:36px;height:36px;border-radius:10px;border:1.5px solid #e8e6e0;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;color:#1a1a18;}
        .qty-btn:hover{border-color:#f97316;color:#f97316;}
        .qty-btn:disabled{opacity:0.4;cursor:not-allowed;}
        .tab-btn{padding:10px 20px;border-radius:10px;border:none;background:none;font-size:14px;font-weight:600;color:#6b6b60;cursor:pointer;transition:all 0.2s;font-family:"DM Sans",sans-serif;}
        .tab-btn.active{background:#f97316;color:white;}
        .attr-row:nth-child(odd){background:#faf9f7;}
        .review-card{padding:20px;border-radius:16px;background:white;border:1px solid #e8e6e0;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <Navbar />
      <main style={{ minHeight: "100vh", background: "#faf9f7", paddingTop: 96 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
            <Link href="/" style={{ fontSize: 13, color: "#9a9a90", textDecoration: "none" }}>Bosh sahifa</Link>
            <span style={{ color: "#d4d2cc" }}>/</span>
            <Link href="/products" style={{ fontSize: 13, color: "#9a9a90", textDecoration: "none" }}>Mahsulotlar</Link>
            <span style={{ color: "#d4d2cc" }}>/</span>
            <span style={{ fontSize: 13, color: "#1a1a18", fontWeight: 500 }}>{product.name}</span>
          </div>

          {/* Main section */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, marginBottom: 64, alignItems: "start" }}>

            {/* Rasm */}
            <div>
              <div style={{ aspectRatio: "1", background: "#f5f4f0", borderRadius: 24, overflow: "hidden", border: "1px solid #e8e6e0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100, marginBottom: 16, position: "relative" }}>
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images.find((img) => img.is_primary)?.image ?? product.images[0].image}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : product.primary_image ? (
                  <Image
                    src={product.primary_image}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  "🛍️"
                )}
              </div>
              {product.discount_percent > 0 && (
                <span style={{ display: "inline-flex", padding: "6px 14px", borderRadius: 100, background: "#fff7ed", border: "1px solid #fed7aa", fontSize: 13, fontWeight: 700, color: "#f97316" }}>
                  -{product.discount_percent}% chegirma
                </span>
              )}
            </div>

            {/* Ma'lumot */}
            <div>
              {categoryName && (
                <p style={{ fontSize: 12, fontWeight: 600, color: "#f97316", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                  {categoryName}
                </p>
              )}
              <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, color: "#1a1a18", lineHeight: 1.2, marginBottom: 16 }}>
                {product.name}
              </h1>

              {/* Reyting */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {stars.map((filled, i) => (
                    <Star key={i} size={16} fill={filled ? "#f97316" : "none"} color={filled ? "#f97316" : "#d4d2cc"} />
                  ))}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a18" }}>
                  {Number(product.rating_avg).toFixed(1)}
                </span>
                <span style={{ fontSize: 13, color: "#9a9a90" }}>({product.review_count} sharh)</span>
              </div>

              {/* Narx */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24 }}>
                <span style={{ fontFamily: "Playfair Display, serif", fontSize: 36, fontWeight: 800, color: "#1a1a18" }}>
                  {Number(product.current_price).toLocaleString()} so'm
                </span>
                {product.discount_price && (
                  <span style={{ fontSize: 18, color: "#9a9a90", textDecoration: "line-through" }}>
                    {Number(product.price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stok holati — real-time */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28, padding: "10px 16px", borderRadius: 12, background: product.stock > 5 ? "#f0fdf4" : product.stock > 0 ? "#fff7ed" : "#fef2f2", border: `1px solid ${product.stock > 5 ? "#bbf7d0" : product.stock > 0 ? "#fed7aa" : "#fecaca"}` }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: product.stock > 5 ? "#22c55e" : product.stock > 0 ? "#f97316" : "#ef4444" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: product.stock > 5 ? "#16a34a" : product.stock > 0 ? "#c2550a" : "#dc2626" }}>
                  {product.stock === 0
                    ? "Stokda yo'q"
                    : product.stock <= 5
                    ? `Faqat ${product.stock} ta qoldi!`
                    : "Stokda mavjud"}
                </span>
                {inCartQty > 0 && (
                  <span style={{ fontSize: 12, color: "#9a9a90", marginLeft: 8 }}>
                    (Savatda: {inCartQty} ta)
                  </span>
                )}
              </div>

              {/* Miqdor + savat */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 6, borderRadius: 14, border: "1.5px solid #e8e6e0", background: "white" }}>
                  <button className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}><Minus size={16} /></button>
                  <span style={{ fontSize: 16, fontWeight: 700, minWidth: 32, textAlign: "center" }}>{qty}</span>
                  <button className="qty-btn" onClick={() => setQty((q) => Math.min(maxCanAdd, q + 1))} disabled={qty >= maxCanAdd || maxCanAdd <= 0}><Plus size={16} /></button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={product.stock === 0 || maxCanAdd <= 0}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 28px", borderRadius: 14, background: added ? "#22c55e" : product.stock === 0 || maxCanAdd <= 0 ? "#9a9a90" : "#f97316", color: "white", border: "none", cursor: product.stock === 0 || maxCanAdd <= 0 ? "not-allowed" : "pointer", fontSize: 16, fontWeight: 700, transition: "all 0.3s", minWidth: 180, fontFamily: "DM Sans, sans-serif" }}
                >
                  {added
                    ? <><Check size={18} /> Qo'shildi!</>
                    : maxCanAdd <= 0 && product.stock > 0
                    ? "Savat to'ldi"
                    : <><ShoppingCart size={18} /> Savatga</>}
                </button>

                <button
                  onClick={() => {
                    if (!isLoggedIn) return;
                    wishlistToggle.mutate(productId!, {
                      onSuccess: (res: { action: string }) => setLiked(res.action === "added"),
                    });
                    setLiked(!actualLiked);
                  }}
                  style={{ width: 52, height: 52, borderRadius: 14, border: `1.5px solid ${actualLiked ? "#f97316" : "#e8e6e0"}`, background: actualLiked ? "#fff7ed" : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                >
                  <Heart size={20} fill={actualLiked ? "#f97316" : "none"} color={actualLiked ? "#f97316" : "#6b6b60"} />
                </button>
              </div>

              {qty > 1 && maxCanAdd > 0 && (
                <p style={{ fontSize: 14, color: "#6b6b60", marginBottom: 16 }}>
                  Jami: <strong style={{ color: "#1a1a18" }}>{(Number(product.current_price) * qty).toLocaleString()} so'm</strong>
                </p>
              )}

              {/* Kafolatlar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20, borderRadius: 16, background: "white", border: "1px solid #e8e6e0" }}>
                {([
                  [Truck,     "Bepul yetkazib berish", "300 000 so'mdan yuqori buyurtmalarda"],
                  [RotateCcw, "14 kun qaytarish",      "Muammo bo'lsa qaytarib bering"],
                  [Shield,    "Kafolat",                "1 yil rasmiy kafolat"],
                ] as const).map(([Icon, title, sub]) => (
                  <div key={title} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={18} color="#f97316" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18" }}>{title}</div>
                      <div style={{ fontSize: 12, color: "#9a9a90" }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tablar */}
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 24, padding: 6, background: "white", borderRadius: 14, border: "1px solid #e8e6e0", width: "fit-content" }}>
              {([["desc", "Tavsif"], ["attrs", "Xususiyatlar"], ["reviews", `Sharhlar (${product.review_count})`]] as const).map(([k, l]) => (
                <button key={k} className={`tab-btn${activeTab === k ? " active" : ""}`} onClick={() => setActiveTab(k)}>{l}</button>
              ))}
            </div>

            {activeTab === "desc" && (
              <div style={{ padding: 28, background: "white", borderRadius: 20, border: "1px solid #e8e6e0", fontSize: 15, color: "#3a3a34", lineHeight: 1.8 }}>
                {product.description || "Tavsif mavjud emas"}
              </div>
            )}

            {activeTab === "attrs" && (
              <div style={{ background: "white", borderRadius: 20, border: "1px solid #e8e6e0", overflow: "hidden" }}>
                {(product.attributes ?? []).length === 0 ? (
                  <p style={{ padding: 24, color: "#9a9a90" }}>Xususiyatlar mavjud emas</p>
                ) : (
                  (product.attributes ?? []).map((a, i) => (
                    <div key={i} className="attr-row" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", padding: "14px 24px", borderBottom: i < product.attributes.length - 1 ? "1px solid #f0ede8" : "none" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#6b6b60" }}>{a.name}</span>
                      <span style={{ fontSize: 14, color: "#1a1a18" }}>{a.value}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {typeof window !== "undefined" && localStorage.getItem("access_token") && (
                  <div style={{ padding: 24, background: "white", borderRadius: 20, border: "1px solid #e8e6e0", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a18", marginBottom: 16 }}>Sharh qoldirish</h3>
                    <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={24} fill={n <= myRating ? "#f97316" : "none"} color={n <= myRating ? "#f97316" : "#d4d2cc"} onClick={() => setMyRating(n)} style={{ cursor: "pointer" }} />
                      ))}
                    </div>
                    <textarea
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      placeholder="Mahsulot haqida fikringiz..."
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e8e6e0", fontSize: 14, fontFamily: "DM Sans, sans-serif", resize: "vertical", minHeight: 80, outline: "none", boxSizing: "border-box" }}
                    />
                    <button
                      onClick={handleReview}
                      disabled={!myComment.trim() || createReview.isPending}
                      style={{ marginTop: 12, padding: "10px 24px", borderRadius: 12, background: "#f97316", color: "white", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "DM Sans, sans-serif", opacity: myComment.trim() ? 1 : 0.5 }}
                    >
                      {reviewSent ? "✅ Yuborildi!" : createReview.isPending ? "Yuborilmoqda..." : "Yuborish"}
                    </button>
                  </div>
                )}

                {(product.reviews ?? []).length === 0 ? (
                  <p style={{ padding: 24, background: "white", borderRadius: 16, border: "1px solid #e8e6e0", color: "#9a9a90" }}>
                    Hali sharh yo&apos;q. Birinchi bo&apos;ling!
                  </p>
                ) : (
                  (product.reviews ?? []).map((r) => (
                    <div key={r.id} className="review-card">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14 }}>
                            {r.user_name?.[0] ?? "U"}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18" }}>{r.user_name}</div>
                            <div style={{ fontSize: 12, color: "#9a9a90" }}>{r.created_at?.slice(0, 10)}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 2 }}>
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} size={13} fill={i < r.rating ? "#f97316" : "none"} color={i < r.rating ? "#f97316" : "#d4d2cc"} />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: 14, color: "#3a3a34", lineHeight: 1.6 }}>{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* O'xshash mahsulotlar */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 28, fontWeight: 800, color: "#1a1a18", marginBottom: 24 }}>
                O&apos;xshash mahsulotlar
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
