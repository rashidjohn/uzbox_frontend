"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useOrderDetail, useCancelOrder } from "@/lib/hooks";
import { Package, Truck, CheckCircle, XCircle, Clock, CreditCard, ArrowLeft, Loader2 } from "lucide-react";

const STATUS_STEPS = [
  { key: "pending",    icon: Clock,       label: "Qabul qilindi"  },
  { key: "paid",       icon: CreditCard,  label: "To'landi"       },
  { key: "processing", icon: Package,     label: "Tayyorlanmoqda" },
  { key: "shipped",    icon: Truck,       label: "Jo'natildi"     },
  { key: "delivered",  icon: CheckCircle, label: "Yetkazildi"     },
];

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string; emoji: string }> = {
  pending:    { bg: "#fef9c3", color: "#92400e", label: "Kutilmoqda",     emoji: "⏳" },
  paid:       { bg: "#eff6ff", color: "#1d4ed8", label: "To'landi",       emoji: "✅" },
  processing: { bg: "#f5f3ff", color: "#6d28d9", label: "Tayyorlanmoqda", emoji: "📦" },
  shipped:    { bg: "#f0f9ff", color: "#0369a1", label: "Yo'lda",         emoji: "🚚" },
  delivered:  { bg: "#f0fdf4", color: "#15803d", label: "Yetkazildi",     emoji: "🎉" },
  cancelled:  { bg: "#fef2f2", color: "#dc2626", label: "Bekor qilindi",  emoji: "❌" },
};

export default function OrderDetailPage() {
  const params   = useParams<{ id: string }>();
  const id       = params.id;
  const router   = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem("access_token")) router.replace("/login");
  }, [router]);

  const { data: order, isLoading, isError } = useOrderDetail(id);
  const cancelOrder = useCancelOrder();

  if (!mounted) return null;

  const statusInfo = STATUS_COLORS[order?.status ?? "pending"];
  const currentStep = STATUS_STEPS.findIndex((s) => s.key === order?.status);
  const isCancelled = order?.status === "cancelled";

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#faf9f7", paddingTop: 96 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>

          <Link href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: "#6b6b60", textDecoration: "none", marginBottom: 24 }}>
            <ArrowLeft size={16} /> Buyurtmalarimga qaytish
          </Link>

          {isLoading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Loader2 size={36} color="#f97316" style={{ animation: "spin 1s linear infinite" }} />
            </div>
          )}

          {isError && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <XCircle size={48} color="#ef4444" style={{ margin: "0 auto 16px" }} />
              <p style={{ color: "#dc2626" }}>Buyurtma topilmadi</p>
              <Link href="/profile" style={{ marginTop: 16, display: "inline-block", color: "#f97316" }}>← Profilga qaytish</Link>
            </div>
          )}

          {order && (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#f97316", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Buyurtma</p>
                  <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: "#1a1a18" }}>
                    #{id.slice(0, 8).toUpperCase()}
                  </h1>
                  <p style={{ fontSize: 13, color: "#9a9a90", marginTop: 4 }}>
                    {new Date(order.created_at).toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ padding: "7px 18px", borderRadius: 100, fontSize: 14, fontWeight: 700, background: statusInfo.bg, color: statusInfo.color }}>
                    {statusInfo.emoji} {statusInfo.label}
                  </span>
                  {order.status === "pending" && (
                    <button
                      onClick={() => { if (confirm("Haqiqatan bekor qilasizmi?")) cancelOrder.mutate(order.id, { onSuccess: () => router.push("/profile") }); }}
                      disabled={cancelOrder.isPending}
                      style={{ padding: "7px 14px", borderRadius: 10, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      {cancelOrder.isPending ? "..." : "Bekor qilish"}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress tracker */}
              {!isCancelled && (
                <div style={{ background: "white", borderRadius: 20, border: "1px solid #e8e6e0", padding: "24px", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18", marginBottom: 20 }}>Buyurtma kuzatuvi</h3>
                  <div style={{ display: "flex", alignItems: "center", overflowX: "auto", paddingBottom: 4 }}>
                    {STATUS_STEPS.map((step, idx) => {
                      const done   = idx <= currentStep;
                      const active = idx === currentStep;
                      const Icon   = step.icon;
                      return (
                        <div key={step.key} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 72 }}>
                            <div style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? (active ? "#f97316" : "#22c55e") : "#f5f4f0", boxShadow: active ? "0 0 0 4px rgba(249,115,22,0.2)" : "none" }}>
                              <Icon size={18} color={done ? "white" : "#d4d2cc"} />
                            </div>
                            <p style={{ fontSize: 10, fontWeight: 600, color: done ? "#1a1a18" : "#9a9a90", textAlign: "center", whiteSpace: "nowrap" }}>{step.label}</p>
                          </div>
                          {idx < STATUS_STEPS.length - 1 && (
                            <div style={{ flex: 1, minWidth: 24, height: 2, background: idx < currentStep ? "#22c55e" : "#e8e6e0", margin: "0 4px", marginBottom: 22 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
                {/* Mahsulotlar */}
                <div style={{ background: "white", borderRadius: 20, border: "1px solid #e8e6e0", overflow: "hidden" }}>
                  <div style={{ padding: "18px 22px", borderBottom: "1px solid #f0ede8" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18" }}>Mahsulotlar</h3>
                  </div>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 22px", borderBottom: "1px solid #f5f4f0" }}>
                      <div style={{ width: 52, height: 52, borderRadius: 10, background: "#f5f4f0", flexShrink: 0, overflow: "hidden", position: "relative" }}>
                        {item.product.primary_image
                          ? <Image src={item.product.primary_image} alt={item.product.name} fill style={{ objectFit: "cover" }} />
                          : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 22 }}>🛍️</div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product.name}</p>
                        <p style={{ fontSize: 12, color: "#9a9a90" }}>{Number(item.price).toLocaleString("uz-UZ")} × {item.quantity}</p>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{Number(item.subtotal).toLocaleString("uz-UZ")} so&apos;m</span>
                    </div>
                  ))}
                </div>

                {/* Yon panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: "white", borderRadius: 20, border: "1px solid #e8e6e0", padding: 18 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a18", marginBottom: 10 }}>📍 Manzil</h3>
                    <p style={{ fontSize: 13, color: "#6b6b60", lineHeight: 1.7 }}>
                      {order.address?.full_name && <>{order.address.full_name}<br /></>}
                      {order.address?.phone && <>{order.address.phone}<br /></>}
                      {order.address?.city}, {order.address?.district}<br />
                      {order.address?.street}
                    </p>
                  </div>
                  <div style={{ background: "white", borderRadius: 20, border: "1px solid #e8e6e0", padding: 18 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a18", marginBottom: 10 }}>💳 To&apos;lov</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: "#9a9a90" }}>Usul</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>
                        {order.payment_method === "click" ? "💳 Click" : order.payment_method === "payme" ? "📱 Payme" : "💵 Naqd"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", borderTop: "2px solid #1a1a18", marginTop: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>Jami</span>
                      <span style={{ fontFamily: "Playfair Display, serif", fontSize: 17, fontWeight: 800 }}>
                        {Number(order.total_price).toLocaleString("uz-UZ")} so&apos;m
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
