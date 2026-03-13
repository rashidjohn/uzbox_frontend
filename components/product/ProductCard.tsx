"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Star, Check } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistToggle } from "@/lib/hooks";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const [liked,      setLiked]      = useState(false);
  const [added,      setAdded]      = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const items          = useCartStore((s) => s.items);
  const addItem        = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const wishlistToggle = useWishlistToggle();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    const id       = String(product.id);
    const existing = items.find((i) => i.id === id);
    if (existing) {
      const newQty = Math.min(existing.quantity + 1, product.stock);
      updateQuantity(id, newQty);
    } else {
      addItem({
        id,
        name:  product.name,
        price: Number(product.current_price),
        image: product.primary_image ?? null,
        stock: product.stock,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return; // login kerak
    wishlistToggle.mutate(String(product.id), {
      onSuccess: (res: { action: string }) => setLiked(res.action === "added"),
    });
    setLiked(!liked);
  };

  const inCart = items.find((i) => i.id === String(product.id))?.quantity ?? 0;

  return (
    <Link href={`/products/${product.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{ background: "white", borderRadius: 20, border: "1px solid #e8e6e0", overflow: "hidden", transition: "box-shadow 0.2s, transform 0.2s" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.10)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
      >
        {/* Rasm */}
        <div style={{ position: "relative", aspectRatio: "1", background: "#f5f4f0" }}>
          {product.primary_image ? (
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🛍️</div>
          )}

          {product.discount_percent > 0 && (
            <span style={{ position: "absolute", top: 12, left: 12, background: "#f97316", color: "white", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>
              -{product.discount_percent}%
            </span>
          )}

          {product.stock === 0 && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(250,249,247,0.75)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#9a9a90", padding: "4px 12px", background: "white", borderRadius: 8, border: "1px solid #e8e6e0" }}>Tugagan</span>
            </div>
          )}

          {inCart > 0 && product.stock > 0 && (
            <span style={{ position: "absolute", top: 12, right: 46, background: "#22c55e", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 8 }}>
              {inCart} ta
            </span>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            title={isLoggedIn ? (liked ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish") : "Kirish talab qilinadi"}
            style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.92)", border: "none", cursor: isLoggedIn ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", opacity: isLoggedIn ? 1 : 0.5 }}
          >
            <Heart size={15} fill={liked ? "#f97316" : "none"} color={liked ? "#f97316" : "#6b6b60"} />
          </button>
        </div>

        {/* Ma'lumot */}
        <div style={{ padding: "14px 16px 16px" }}>
          {product.category_name && (
            <p style={{ fontSize: 11, color: "#f97316", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
              {product.category_name}
            </p>
          )}

          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", marginBottom: 8, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {product.name}
          </h3>

          {product.review_count > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
              <Star size={12} fill="#f97316" color="#f97316" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a18" }}>{Number(product.rating_avg).toFixed(1)}</span>
              <span style={{ fontSize: 11, color: "#9a9a90" }}>({product.review_count})</span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div>
              <span style={{ fontSize: 17, fontWeight: 700, color: "#1a1a18" }}>
                {Number(product.current_price).toLocaleString("uz-UZ")} so&apos;m
              </span>
              {product.discount_price && (
                <div style={{ fontSize: 12, color: "#9a9a90", textDecoration: "line-through" }}>
                  {Number(product.price).toLocaleString("uz-UZ")}
                </div>
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 12, background: added ? "#22c55e" : product.stock === 0 ? "#e8e6e0" : "#f97316", color: added || product.stock === 0 ? (product.stock === 0 ? "#9a9a90" : "white") : "white", border: "none", cursor: product.stock === 0 ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.2s", flexShrink: 0, fontFamily: "DM Sans, sans-serif" }}
            >
              {added ? <Check size={14} /> : <ShoppingCart size={14} />}
              <span style={{ display: "none" }}>{product.stock === 0 ? "Tugagan" : added ? "✓" : "+"}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
