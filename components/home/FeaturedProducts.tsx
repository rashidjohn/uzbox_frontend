"use client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { useProducts } from "@/lib/hooks";

export default function FeaturedProducts() {
  const { data, isLoading, isError } = useProducts({
    ordering: "-rating_avg",
    page: 1,
  });

  const products = data?.results?.slice(0, 8) ?? [];

  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 24px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 48,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#f97316",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Tavsiya etiladi
          </p>
          <h2
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 800,
              color: "#1a1a18",
              lineHeight: 1.1,
            }}
          >
            Mashhur mahsulotlar
          </h2>
        </div>
        <Link href="/products" className="see-all">
          Barchasini ko'rish →
        </Link>
      </div>

      {isLoading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 0",
            gap: 12,
            color: "#9a9a90",
          }}
        >
          <Loader2
            size={24}
            style={{ animation: "spin 1s linear infinite" }}
          />
          <span>Yuklanmoqda...</span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {isError && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "#9a9a90",
            fontSize: 14,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <p>Mahsulotlarni yuklashda xatolik. Backend ishlamoqdami?</p>
        </div>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#9a9a90" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <p>Hali mahsulot qo'shilmagan. Admin paneldan mahsulot kiriting.</p>
        </div>
      )}
    </section>
  );
}
