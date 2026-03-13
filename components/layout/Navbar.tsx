"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, Menu, X, Heart, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAutocomplete } from "@/lib/hooks";

export default function Navbar() {
  const router   = useRouter();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQ,   setSearchQ]   = useState("");
  const [showDrop,  setShowDrop]  = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: suggestions, isLoading: suggestLoading } = useAutocomplete(searchQ);

  // SSR-safe cart count
  useEffect(() => {
    const unsub = useCartStore.subscribe((s) => setCartCount(s.totalItems()));
    setCartCount(useCartStore.getState().totalItems());
    return unsub;
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Tashqariga bosganida dropdown yopilsin
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setShowDrop(false);
      setSearchQ("");
    }
  };

  const handleSuggestClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setShowDrop(false);
    setSearchQ("");
  };

  const navLinks = [
    { href: "/",         label: "Bosh sahifa" },
    { href: "/products", label: "Katalog"     },
    { href: "/about",    label: "Biz haqimizda" },
    { href: "/contact",  label: "Aloqa"       },
  ];

  return (
    <>
      <style>{`
        .navbar{position:fixed;top:0;left:0;right:0;z-index:100;transition:all 0.3s;}
        .navbar.scrolled{background:rgba(250,249,247,0.95);backdrop-filter:blur(12px);box-shadow:0 1px 24px rgba(0,0,0,0.07);}
        .navbar.top{background:white;}
        .nav-link{font-size:14px;font-weight:500;color:#3a3a34;text-decoration:none;padding:6px 4px;position:relative;transition:color 0.2s;}
        .nav-link:hover{color:#f97316;}
        .nav-link::after{content:"";position:absolute;bottom:-2px;left:0;right:0;height:2px;background:#f97316;transform:scaleX(0);transition:transform 0.2s;transform-origin:left;}
        .nav-link:hover::after{transform:scaleX(1);}
        .icon-btn{width:40px;height:40px;border-radius:12px;border:1px solid #e8e6e0;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#3a3a34;transition:all 0.2s;text-decoration:none;}
        .icon-btn:hover{border-color:#f97316;color:#f97316;background:#fff7ed;}
        .cart-btn{position:relative;width:40px;height:40px;border-radius:12px;border:1px solid #e8e6e0;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#3a3a34;transition:all 0.2s;text-decoration:none;}
        .cart-btn:hover{border-color:#f97316;color:#f97316;background:#fff7ed;}
        .mobile-link{display:block;padding:12px 20px;font-size:16px;font-weight:500;color:#1a1a18;text-decoration:none;border-radius:12px;transition:background 0.2s;}
        .mobile-link:hover{background:#f5f4f0;}
        .search-suggest{position:absolute;top:calc(100% + 6px);left:0;right:0;background:white;border-radius:14px;border:1px solid #e8e6e0;box-shadow:0 8px 32px rgba(0,0,0,0.10);z-index:200;overflow:hidden;}
        .suggest-item{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;transition:background 0.15s;text-decoration:none;}
        .suggest-item:hover{background:#faf9f7;}
      `}</style>

      <nav className={`navbar ${scrolled ? "scrolled" : "top"}`}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 72, display: "flex", alignItems: "center", gap: 32 }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <span style={{ fontFamily: "Playfair Display, serif", fontSize: 24, fontWeight: 800, color: "#1a1a18" }}>
              Uz<span style={{ color: "#f97316" }}>Box</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: "flex", gap: 24, alignItems: "center", flex: 1 }}>
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
            ))}
          </div>

          {/* Search bar — desktop */}
          <div ref={searchRef} style={{ position: "relative", width: 280 }}>
            <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ position: "relative", width: "100%" }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9a9a90", pointerEvents: "none" }} />
                <input
                  value={searchQ}
                  onChange={(e) => { setSearchQ(e.target.value); setShowDrop(true); }}
                  onFocus={() => searchQ.length >= 2 && setShowDrop(true)}
                  placeholder="Mahsulot qidiring..."
                  style={{ width: "100%", padding: "9px 36px 9px 36px", borderRadius: 12, border: "1.5px solid #e8e6e0", background: "#faf9f7", fontSize: 14, color: "#1a1a18", outline: "none", fontFamily: "DM Sans, sans-serif", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  onBlur={(e) => { if (!e.target.value) setShowDrop(false); }}
                />
                {searchQ && (
                  <button type="button" onClick={() => { setSearchQ(""); setShowDrop(false); }}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9a9a90" }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>

            {/* Autocomplete dropdown */}
            {showDrop && searchQ.length >= 2 && (
              <div className="search-suggest">
                {suggestLoading && (
                  <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, color: "#9a9a90", fontSize: 13 }}>
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    Qidirilmoqda...
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  </div>
                )}
                {!suggestLoading && suggestions && suggestions.length > 0 && (
                  <>
                    {suggestions.map((s) => (
                      <div key={s.id} className="suggest-item" onClick={() => handleSuggestClick(s.slug)}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f5f4f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                          {s.image
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={s.image} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <span style={{ fontSize: 18 }}>🛍️</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</p>
                          <p style={{ fontSize: 12, color: "#9a9a90" }}>{Number(s.price).toLocaleString("uz-UZ")} so'm</p>
                        </div>
                      </div>
                    ))}
                    <div style={{ padding: "8px 16px", borderTop: "1px solid #f0ede8" }}>
                      <button
                        onClick={() => { router.push(`/search?q=${encodeURIComponent(searchQ)}`); setShowDrop(false); }}
                        style={{ fontSize: 12, color: "#f97316", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        &ldquo;{searchQ}&rdquo; — barcha natijalarni ko&apos;rish →
                      </button>
                    </div>
                  </>
                )}
                {!suggestLoading && suggestions && suggestions.length === 0 && (
                  <div style={{ padding: "12px 16px", fontSize: 13, color: "#9a9a90" }}>
                    Natija topilmadi
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

            {/* Wishlist */}
            <Link href="/wishlist" className="icon-btn" title="Sevimlilar">
              <Heart size={18} />
            </Link>

            {/* Savat */}
            <Link href="/cart" className="cart-btn">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -6,
                  background: "#f97316", color: "white",
                  fontSize: 11, fontWeight: 700,
                  width: 18, height: 18, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid white",
                }}>
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Profil */}
            <Link href="/profile" className="icon-btn" style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18", textDecoration: "none" }}>
              👤
            </Link>

            {/* Mobil menyu */}
            <button
              className="icon-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: "none" }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobil menyu */}
        {menuOpen && (
          <div style={{ background: "white", borderTop: "1px solid #f0ede8", padding: "12px 20px 20px" }}>
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="mobile-link" onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div style={{ borderTop: "1px solid #f0ede8", marginTop: 12, paddingTop: 12, display: "flex", gap: 12 }}>
              <Link href="/wishlist" style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1px solid #e8e6e0", textAlign: "center", textDecoration: "none", fontSize: 14, color: "#1a1a18", fontWeight: 500 }}>
                ❤️ Sevimlilar
              </Link>
              <Link href="/profile" style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1px solid #e8e6e0", textAlign: "center", textDecoration: "none", fontSize: 14, color: "#1a1a18", fontWeight: 500 }}>
                👤 Profil
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
