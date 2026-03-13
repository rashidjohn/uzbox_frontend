"use client";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useWishlist, useWishlistToggle } from "@/lib/hooks";
import { useCartStore } from "@/store/cart";
import { Heart, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function WishlistPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted,    setMounted]    = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  const { data: items, isLoading } = useWishlist();
  const toggle    = useWishlistToggle();
  const addItem   = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  if (!mounted) return null;

  if (!isLoggedIn)
    return (
      <>
        <Navbar />
        <div style={{ minHeight: "100vh", background: "#faf9f7", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔐</div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 28, fontWeight: 800, color: "#1a1a18", marginBottom: 12 }}>Avval kiring</h2>
            <Link href="/login?next=/wishlist" style={{ padding: "13px 28px", borderRadius: 13, background: "#f97316", color: "white", textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
              Kirish
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <style>{`
        .wl-card{background:white;border-radius:20px;border:1px solid #e8e6e0;overflow:hidden;transition:box-shadow 0.2s;}
        .wl-card:hover{box-shadow:0 4px 24px rgba(0,0,0,0.08);}
        .wl-remove{position:absolute;top:10px;right:10px;width:32px;height:32px;border-radius:10px;background:rgba(255,255,255,0.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#ef4444;transition:all 0.2s;}
        .wl-remove:hover{background:#ef4444;color:white;}
        .add-cart-btn{width:100%;padding:10px;border-radius:12px;background:#f97316;color:white;border:none;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;}
        .add-cart-btn:hover{background:#c2550a;}
        .add-cart-btn:disabled{background:#9a9a90;cursor:not-allowed;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <Navbar />
      <main style={{ minHeight: "100vh", background: "#faf9f7", paddingTop: 96 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 80px" }}>

          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#f97316", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              Sevimlilar
            </p>
            <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, color: "#1a1a18" }}>
              Mening sevimlilarim
            </h1>
          </div>

          {isLoading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
              <Loader2 size={32} color="#f97316" style={{ animation: "spin 1s linear infinite" }} />
            </div>
          )}

          {!isLoading && (!items || items.length === 0) && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Heart size={64} color="#d4d2cc" style={{ margin: "0 auto 20px" }} />
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 24, fontWeight: 800, color: "#1a1a18", marginBottom: 12 }}>
                Sevimlilar bo&apos;sh
              </h2>
              <p style={{ color: "#6b6b60", marginBottom: 28 }}>Yoqtirgan mahsulotlaringizni bu yerga saqlang</p>
              <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 13, background: "#f97316", color: "white", textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
                Katalogga o&apos;tish
              </Link>
            </div>
          )}

          {!isLoading && items && items.length > 0 && (
            <>
              <p style={{ fontSize: 14, color: "#6b6b60", marginBottom: 24 }}>
                <span style={{ fontWeight: 700, color: "#1a1a18" }}>{items.length}</span> ta mahsulot
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
                {items.map(({ id, product }) => {
                  const inCart  = cartItems.find((c) => c.id === String(product.id));
                  const canAdd  = product.stock > 0 && (!inCart || inCart.quantity < product.stock);
                  return (
                    <div key={id} className="wl-card">
                      <div style={{ position: "relative", aspectRatio: "1", background: "#f5f4f0" }}>
                        <Link href={`/products/${product.slug}`}>
                          {product.primary_image ? (
                            <Image src={product.primary_image} alt={product.name} fill style={{ objectFit: "cover" }} sizes="300px" />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🛍️</div>
                          )}
                        </Link>
                        {product.discount_percent > 0 && (
                          <span style={{ position: "absolute", top: 10, left: 10, background: "#f97316", color: "white", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 8 }}>
                            -{product.discount_percent}%
                          </span>
                        )}
                        <button
                          className="wl-remove"
                          onClick={() => toggle.mutate(String(product.id))}
                          disabled={toggle.isPending}
                          title="Sevimlilardan o'chirish"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div style={{ padding: "14px 16px 16px" }}>
                        <Link href={`/products/${product.slug}`} style={{ textDecoration: "none" }}>
                          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", marginBottom: 8, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {product.name}
                          </h3>
                        </Link>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                          <span style={{ fontSize: 17, fontWeight: 700, color: "#1a1a18" }}>
                            {Number(product.current_price).toLocaleString("uz-UZ")} so&apos;m
                          </span>
                          {product.discount_price && (
                            <span style={{ fontSize: 12, color: "#9a9a90", textDecoration: "line-through" }}>
                              {Number(product.price).toLocaleString("uz-UZ")}
                            </span>
                          )}
                        </div>
                        <button
                          className="add-cart-btn"
                          disabled={!canAdd}
                          onClick={() => {
                            if (!canAdd) return;
                            addItem({ id: String(product.id), name: product.name, price: Number(product.current_price), image: product.primary_image ?? null, stock: product.stock });
                          }}
                        >
                          <ShoppingCart size={15} />
                          {product.stock === 0 ? "Stokda yo'q" : inCart ? "Savatda bor" : "Savatga"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
