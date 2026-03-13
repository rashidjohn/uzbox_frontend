import Link from "next/link";
import { Search, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(80px, 20vw, 160px)", fontWeight: 900, color: "#f5f4f0", lineHeight: 1, marginBottom: -16, userSelect: "none" }}>
          404
        </div>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#1a1a18", marginBottom: 12 }}>
          Sahifa topilmadi
        </h1>
        <p style={{ fontSize: 16, color: "#6b6b60", lineHeight: 1.6, marginBottom: 36 }}>
          Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki o&apos;chirilgan.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 13, background: "#f97316", color: "white", textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
            <Home size={18} /> Bosh sahifa
          </Link>
          <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 13, border: "1.5px solid #e8e6e0", background: "white", color: "#1a1a18", textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
            <ShoppingBag size={18} /> Katalog
          </Link>
          <Link href="/search" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 13, border: "1.5px solid #e8e6e0", background: "white", color: "#1a1a18", textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
            <Search size={18} /> Qidiruv
          </Link>
        </div>
      </div>
    </div>
  );
}
