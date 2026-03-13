import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PromoBanner() {
  return (
    <section style={{ maxWidth: 1280, margin: "96px auto 0", padding: "0 24px" }}>
      <div
        style={{
          borderRadius: 32,
          padding: "72px 64px",
          background:
            "linear-gradient(135deg, #1a1a18 0%, #2d2d2a 50%, #1a1a18 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 40,
        }}
      >
        {/* Dekor */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(249,115,22,0.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: "30%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(249,115,22,0.08)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 540 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#f97316",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Maxsus taklif
          </p>
          <h2
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Birinchi buyurtmaga
            <br />
            <span style={{ color: "#f97316" }}>10% chegirma!</span>
          </h2>
          <p style={{ fontSize: 16, color: "#9a9a90", lineHeight: 1.7 }}>
            Ro'yxatdan o'ting va birinchi xaridingizda maxsus chegirmadan
            foydalaning.
          </p>
        </div>

        <Link href="/register" className="promo-btn" style={{ position: "relative", zIndex: 1 }}>
          Hozir ro'yxatdan o'ting <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
