"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { useProducts } from "@/lib/hooks";
import { Search, Loader2, X } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [debouncedQ, setDebouncedQ] = useState(initialQ);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading } = useProducts({ search: debouncedQ || undefined });
  const products = data?.results ?? [];
  const total = data?.count ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debouncedQ) router.push(`/search?q=${encodeURIComponent(debouncedQ)}`);
  };

  return (
    <>
      <style>{`
        .search-big{width:100%;padding:16px 20px 16px 56px;border-radius:18px;border:2px solid #e8e6e0;background:white;font-size:17px;color:#1a1a18;outline:none;transition:border-color 0.2s;font-family:"DM Sans",sans-serif;}
        .search-big:focus{border-color:#f97316;}
      `}</style>

      <Navbar />
      <main style={{ minHeight: "100vh", background: "#faf9f7", paddingTop: 96 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>

          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#1a1a18", marginBottom: 32, textAlign: "center" }}>
            Mahsulot qidirish
          </h1>

          <form onSubmit={handleSearch} style={{ position: "relative", maxWidth: 640, margin: "0 auto 48px" }}>
            <Search size={22} style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "#9a9a90" }} />
            <input
              className="search-big"
              placeholder="Mahsulot nomi, kategoriya..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button type="button" onClick={() => setQuery("")}
                style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9a9a90" }}>
                <X size={18} />
              </button>
            )}
          </form>

          {isLoading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "48px 0", gap: 12, color: "#9a9a90" }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
              Qidirilmoqda...
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {debouncedQ && !isLoading && (
            <p style={{ fontSize: 14, color: "#6b6b60", marginBottom: 24, textAlign: "center" }}>
              <strong style={{ color: "#1a1a18" }}>"{debouncedQ}"</strong> bo'yicha{" "}
              <strong style={{ color: "#f97316" }}>{total}</strong> ta natija
            </p>
          )}

          {!isLoading && products.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {!isLoading && debouncedQ && products.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 24, fontWeight: 700, color: "#1a1a18", marginBottom: 8 }}>
                Natija topilmadi
              </h3>
              <p style={{ color: "#6b6b60" }}>Boshqa kalit so'z bilan urinib ko'ring</p>
            </div>
          )}

          {!debouncedQ && !isLoading && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9a9a90", fontSize: 15 }}>
              Qidiruv uchun kalit so'z kiriting
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  );
}
