"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShoppingBag, Home, Package } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId      = searchParams.get("order_id");
  const method       = searchParams.get("method") ?? "online";
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  const methodLabel =
    method === "click" ? "Click" :
    method === "payme" ? "Payme" :
    method === "cash"  ? "Naqd pul" : "Online";

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes confetti {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(100px) rotate(720deg); opacity: 0; }
        }
        .confetti-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 2px;
          animation: confetti 1.5s ease-out forwards;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#faf9f7", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>

        {/* Konfetti */}
        {show && [
          { left: "20%", top: "10%", bg: "#f97316", delay: "0s" },
          { left: "40%", top: "5%",  bg: "#22c55e", delay: "0.1s" },
          { left: "60%", top: "8%",  bg: "#6366f1", delay: "0.2s" },
          { left: "75%", top: "12%", bg: "#f97316", delay: "0.15s" },
          { left: "30%", top: "6%",  bg: "#f43f5e", delay: "0.05s" },
          { left: "85%", top: "4%",  bg: "#22c55e", delay: "0.3s" },
          { left: "15%", top: "15%", bg: "#6366f1", delay: "0.25s" },
          { left: "50%", top: "3%",  bg: "#f97316", delay: "0.4s" },
        ].map((c, i) => (
          <div
            key={i}
            className="confetti-dot"
            style={{ left: c.left, top: c.top, background: c.bg, animationDelay: c.delay }}
          />
        ))}

        <div
          style={{
            textAlign: "center",
            maxWidth: 480,
            opacity:   show ? 1 : 0,
            transform: show ? "none" : "translateY(24px)",
            transition: "all 0.6s ease",
          }}
        >
          {/* Check icon */}
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: "#f0fdf4", border: "3px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", animation: show ? "popIn 0.5s ease" : "none" }}>
            <CheckCircle size={48} color="#22c55e" />
          </div>

          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "#1a1a18", marginBottom: 16 }}>
            Buyurtma muvaffaqiyatli!
          </h1>

          <p style={{ fontSize: 16, color: "#6b6b60", lineHeight: 1.7, marginBottom: 24 }}>
            Buyurtmangiz qabul qilindi. Tez orada siz bilan bog&apos;lanamiz va yetkazib berish vaqtini bildiramiz.
          </p>

          {/* Buyurtma ma'lumotlari */}
          {orderId && (
            <div style={{ padding: "16px 20px", borderRadius: 16, background: "white", border: "1px solid #e8e6e0", marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#9a9a90" }}>Buyurtma raqami</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a18", fontFamily: "monospace" }}>
                  #{orderId.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#9a9a90" }}>To&apos;lov usuli</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#f97316" }}>{methodLabel}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#9a9a90" }}>Holati</span>
                <span style={{ fontSize: 13, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: "#f0fdf4", color: "#15803d" }}>
                  ✅ Qabul qilindi
                </span>
              </div>
            </div>
          )}

          {/* Keyingi qadam */}
          <div style={{ padding: "14px 18px", borderRadius: 14, background: "#fff7ed", border: "1px solid #fed7aa", marginBottom: 32, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <Package size={18} color="#f97316" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 14, color: "#92400e", lineHeight: 1.5, textAlign: "left" }}>
              {method === "cash"
                ? "Yetkazib beruvchi siz bilan bog'lanadi va naqd pul to'laysiz."
                : "To'lov tasdiqlanganidan so'ng buyurtmangiz tayyorlanadi."}
            </p>
          </div>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 14, background: "#f97316", color: "white", textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
              <ShoppingBag size={18} /> Buyurtmalarim
            </Link>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 14, border: "1.5px solid #e8e6e0", background: "white", color: "#1a1a18", textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
              <Home size={18} /> Bosh sahifa
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
