"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { useProducts, useCategories } from "@/lib/hooks";
import { Search, SlidersHorizontal, X, ChevronDown, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const SORT_OPTIONS = [
  { value: "",                  label: "Standart" },
  { value: "price",             label: "Narx: arzondan" },
  { value: "-price",            label: "Narx: qimmatdan" },
  { value: "-rating_avg",       label: "Reyting bo'yicha" },
  { value: "-discount_percent", label: "Chegirma bo'yicha" },
  { value: "-created_at",       label: "Eng yangi" },
];

const PAGE_SIZE = 20;

/** Smart pagination — ko'p sahifalarda ham joriy sahifa ko'rinadi */
function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const delta = 2;
  const range: number[] = [];
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }
  const pages: (number | "…")[] = [1];
  if (range[0] > 2) pages.push("…");
  pages.push(...range);
  if (range[range.length - 1] < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const sortRef      = useRef<HTMLDivElement>(null);

  const [search,         setSearch]         = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category,       setCategory]       = useState(searchParams.get("category") ?? "");
  const [sort,           setSort]           = useState("");
  const [onlyDiscount,   setOnlyDiscount]   = useState(searchParams.get("has_discount") === "true");
  const [page,           setPage]           = useState(1);
  const [sortOpen,       setSortOpen]       = useState(false);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Filter o'zgarganda 1-sahifaga
  useEffect(() => { setPage(1); }, [debouncedSearch, category, sort, onlyDiscount]);

  // Sort dropdown — tashqariga bosganda yopish
  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sortOpen]);

  const { data, isLoading, isError } = useProducts({
    search:       debouncedSearch || undefined,
    category:     category        || undefined,
    ordering:     sort            || undefined,
    page,
    has_discount: onlyDiscount    || undefined,
  });

  const { data: categories } = useCategories();

  const products   = data?.results ?? [];
  const total      = data?.count ?? 0;
  const hasNext    = !!data?.next;
  const hasPrev    = !!data?.previous;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const activeSort = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Standart";
  const pageNums   = getPageNumbers(page, totalPages);

  return (
    <>
      <style>{`
        .search-input{width:100%;padding:12px 16px 12px 44px;border-radius:14px;border:1.5px solid #e8e6e0;background:white;font-size:15px;color:#1a1a18;outline:none;transition:border-color 0.2s;font-family:"DM Sans",sans-serif;}
        .search-input:focus{border-color:#f97316;}
        .filter-btn{display:flex;align-items:center;gap:8px;padding:11px 18px;border-radius:12px;border:1.5px solid #e8e6e0;background:white;font-size:14px;font-weight:500;color:#1a1a18;cursor:pointer;transition:all 0.2s;white-space:nowrap;font-family:"DM Sans",sans-serif;}
        .filter-btn:hover,.filter-btn.active{border-color:#f97316;color:#f97316;background:#fff7ed;}
        .cat-pill{padding:8px 18px;border-radius:100px;border:1.5px solid #e8e6e0;background:white;font-size:13px;font-weight:500;color:#3a3a34;cursor:pointer;transition:all 0.2s;font-family:"DM Sans",sans-serif;}
        .cat-pill:hover{border-color:#f97316;color:#f97316;}
        .cat-pill.active{background:#f97316;border-color:#f97316;color:white;}
        .sort-option{padding:10px 16px;font-size:14px;color:#3a3a34;cursor:pointer;transition:background 0.15s;}
        .sort-option:hover{background:#f5f4f0;}
        .sort-option.active{color:#f97316;font-weight:600;}
        .page-btn{min-width:38px;height:38px;padding:0 6px;border-radius:10px;border:1.5px solid #e8e6e0;background:white;font-size:14px;font-weight:500;color:#1a1a18;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;}
        .page-btn:hover:not(:disabled){border-color:#f97316;color:#f97316;}
        .page-btn.active{background:#f97316;border-color:#f97316;color:white;}
        .page-btn:disabled{opacity:0.35;cursor:not-allowed;}
        .page-dots{min-width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:14px;color:#9a9a90;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <Navbar />
      <main style={{ minHeight: "100vh", background: "#faf9f7", paddingTop: 96 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 80px" }}>

          {/* Sarlavha */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#f97316", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Katalog</p>
            <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#1a1a18", lineHeight: 1.1 }}>
              Barcha mahsulotlar
            </h1>
          </div>

          {/* Qidiruv + saralash */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9a9a90" }} />
              <input
                className="search-input"
                placeholder="Mahsulot qidiring..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9a9a90" }}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort dropdown — outside click bilan yopiladi */}
            <div style={{ position: "relative" }} ref={sortRef}>
              <button className={`filter-btn${sortOpen ? " active" : ""}`} onClick={() => setSortOpen(!sortOpen)}>
                <SlidersHorizontal size={16} />
                {activeSort}
                <ChevronDown size={14} style={{ transform: sortOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {sortOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "white", borderRadius: 14, border: "1px solid #e8e6e0", boxShadow: "0 8px 32px rgba(0,0,0,0.10)", zIndex: 50, minWidth: 200, overflow: "hidden" }}>
                  {SORT_OPTIONS.map((o) => (
                    <div key={o.value} className={`sort-option${sort === o.value ? " active" : ""}`} onClick={() => { setSort(o.value); setSortOpen(false); }}>
                      {o.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className={`filter-btn${onlyDiscount ? " active" : ""}`} onClick={() => setOnlyDiscount(!onlyDiscount)}>
              {onlyDiscount && <X size={15} />} Chegirmali
            </button>
          </div>

          {/* Kategoriyalar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            <button className={`cat-pill${!category ? " active" : ""}`} onClick={() => setCategory("")}>Barchasi</button>
            {(categories ?? []).map((cat) => (
              <button key={cat.id} className={`cat-pill${category === cat.slug ? " active" : ""}`} onClick={() => setCategory(cat.slug)}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Son */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <p style={{ fontSize: 14, color: "#6b6b60" }}>
              <span style={{ fontWeight: 700, color: "#1a1a18" }}>{total}</span> ta mahsulot
            </p>
            {totalPages > 1 && (
              <p style={{ fontSize: 13, color: "#9a9a90" }}>{page}/{totalPages} sahifa</p>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 12, color: "#9a9a90" }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
              Yuklanmoqda...
            </div>
          )}

          {/* Xato */}
          {isError && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <p style={{ fontSize: 16, color: "#6b6b60" }}>Backend bilan ulanishda xatolik</p>
            </div>
          )}

          {/* Mahsulotlar grid */}
          {!isLoading && !isError && (
            products.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24, marginBottom: 48 }}>
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 24, fontWeight: 700, color: "#1a1a18", marginBottom: 8 }}>
                  Mahsulot topilmadi
                </h3>
                <button onClick={() => { setSearch(""); setCategory(""); setOnlyDiscount(false); }} style={{ padding: "12px 28px", borderRadius: 12, background: "#f97316", color: "white", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                  Filtrlarni tozalash
                </button>
              </div>
            )
          )}

          {/* Smart Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={!hasPrev}>
                <ChevronLeft size={16} />
              </button>

              {pageNums.map((n, i) =>
                n === "…" ? (
                  <span key={`dots-${i}`} className="page-dots">…</span>
                ) : (
                  <button
                    key={n}
                    className={`page-btn${page === n ? " active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                )
              )}

              <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={!hasNext}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
