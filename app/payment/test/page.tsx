"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";

function TestPaymentContent() {
  const params = useSearchParams();
  const router = useRouter();

  const method = params.get("method") ?? "click";
  const orderId = params.get("order_id") ?? "";
  const amount = Number(params.get("amount") ?? 0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDemo = orderId.startsWith("guest-") || orderId.startsWith("demo-");

  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    if (isDemo) {
      // Demo rejim — to'g'ridan to'g'ri success ga o'tamiz
      setTimeout(() => router.push("/payment/success"), 800);
      return;
    }

    try {
      await api.post("/payments/test/confirm/", { order_id: orderId });
      router.push("/payment/success");
    } catch {
      setError("To'lovni tasdiqlashda xatolik. Buyurtma ID to'g'rimi?");
      setLoading(false);
    }
  };

  const handleCancel = () => router.back();

  const methodLabel = method === "click" ? "Click" : method === "payme" ? "Payme" : method;
  const emoji = method === "click" ? "💳" : method === "payme" ? "📱" : "💵";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf9f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 24,
          border: "1px solid #e8e6e0",
          padding: "48px 40px",
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#fff7ed",
              border: "2px solid #fed7aa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 32,
            }}
          >
            {emoji}
          </div>
          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: 6,
              background: "#fef9c3",
              border: "1px solid #fde68a",
              fontSize: 12,
              fontWeight: 700,
              color: "#92400e",
              marginBottom: 12,
            }}
          >
            🧪 TEST REJIM
          </div>
          <h1
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: 26,
              fontWeight: 800,
              color: "#1a1a18",
              marginBottom: 8,
            }}
          >
            {methodLabel} orqali to'lov
          </h1>
          <p style={{ fontSize: 14, color: "#6b6b60" }}>
            Bu — real to'lov emas. Faqat sinov uchun.
          </p>
        </div>

        {/* To'lov ma'lumotlari */}
        <div
          style={{
            background: "#faf9f7",
            borderRadius: 16,
            border: "1px solid #e8e6e0",
            padding: "20px 24px",
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 14, color: "#6b6b60" }}>Buyurtma ID</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", fontFamily: "monospace" }}>
              {isDemo ? "DEMO" : orderId.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 14, color: "#6b6b60" }}>To'lov usuli</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18" }}>{methodLabel}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e8e6e0", paddingTop: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#1a1a18" }}>Jami summa</span>
            <span style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 800, color: "#f97316" }}>
              {amount.toLocaleString()} so'm
            </span>
          </div>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              borderRadius: 12,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Tugmalar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: "15px",
              borderRadius: 14,
              background: "#22c55e",
              color: "white",
              border: "none",
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "DM Sans, sans-serif",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <><CheckCircle size={20} /> To'lovni tasdiqlash</>
            )}
          </button>

          <button
            onClick={handleCancel}
            disabled={loading}
            style={{
              padding: "13px",
              borderRadius: 14,
              background: "white",
              color: "#6b6b60",
              border: "1.5px solid #e8e6e0",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Bekor qilish
          </button>
        </div>

        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

export default function TestPaymentPage() {
  return (
    <Suspense fallback={null}>
      <TestPaymentContent />
    </Suspense>
  );
}
