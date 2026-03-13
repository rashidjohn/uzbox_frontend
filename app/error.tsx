"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#faf9f7" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "clamp(80px,20vw,140px)", fontWeight: 900, color: "#f5f4f0", lineHeight: 1, userSelect: "none" }}>
              500
            </div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, color: "#1a1a18", marginBottom: 12 }}>
              Xatolik yuz berdi
            </h1>
            <p style={{ fontSize: 16, color: "#6b6b60", lineHeight: 1.6, marginBottom: 36 }}>
              Serverda kutilmagan xatolik. Iltimos, qayta urinib ko&apos;ring yoki bosh sahifaga qayting.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={reset}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 13, background: "#f97316", color: "white", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
              >
                <RefreshCw size={18} /> Qayta urinish
              </button>
              <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 13, border: "1.5px solid #e8e6e0", background: "white", color: "#1a1a18", textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
                <Home size={18} /> Bosh sahifa
              </Link>
            </div>
            {error.digest && (
              <p style={{ marginTop: 24, fontSize: 12, color: "#c4c2bc" }}>Xato kodi: {error.digest}</p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
