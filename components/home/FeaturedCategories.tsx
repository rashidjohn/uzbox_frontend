"use client";
import Link from "next/link";
import { useCategories } from "@/lib/hooks";

// Kategoriya ikonlari (slug bo'yicha)
const CAT_ICONS: Record<string, string> = {
  elektronika: "📱",
  kiyim: "👗",
  "uy-rozgor": "🏠",
  sport: "⚽",
  gozallik: "💄",
  kitoblar: "📚",
  oziq_ovqat: "🥗",
  bolalar: "🧸",
  avtomobil: "🚗",
};

const CAT_COLORS: Record<string, { bg: string; border: string }> = {
  elektronika: { bg: "#eef3ff", border: "#c7d2fe" },
  kiyim:       { bg: "#fdf3ea", border: "#fed7aa" },
  "uy-rozgor": { bg: "#f0fdf4", border: "#bbf7d0" },
  sport:       { bg: "#fef9c3", border: "#fde68a" },
  gozallik:    { bg: "#fce7f3", border: "#f9a8d4" },
  kitoblar:    { bg: "#f0f9ff", border: "#bae6fd" },
};

const DEFAULT_COLOR = { bg: "#f5f4f0", border: "#e8e6e0" };

// Skeleton placeholder
function CategorySkeleton() {
  return (
    <div
      className="skeleton"
      style={{ height: 120, borderRadius: 20 }}
    />
  );
}

export default function FeaturedCategories() {
  const { data: categories, isLoading } = useCategories();

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
            Kategoriyalar
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
            Nima qidiryapsiz?
          </h2>
        </div>
        <Link href="/products" className="see-all">
          Barchasini ko'rish →
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 16,
        }}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
          : (categories || []).slice(0, 12).map((cat) => {
              const colors = CAT_COLORS[cat.slug] ?? DEFAULT_COLOR;
              const icon = CAT_ICONS[cat.slug] ?? "🏷️";
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="cat-card"
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image}
                      alt={cat.name}
                      style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8 }}
                    />
                  ) : (
                    <span style={{ fontSize: 36 }}>{icon}</span>
                  )}
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1a1a18",
                      textAlign: "center",
                    }}
                  >
                    {cat.name}
                  </span>
                </Link>
              );
            })}

        {/* Kategoriya yo'q bo'lsa */}
        {!isLoading && (categories || []).length === 0 && (
          <p style={{ gridColumn: "1/-1", color: "#9a9a90", fontSize: 14 }}>
            Kategoriyalar yuklanmadi. Backend ishlamoqdami?
          </p>
        )}
      </div>
    </section>
  );
}
