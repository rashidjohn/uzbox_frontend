"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useVerifyStock } from "@/lib/hooks";

const DELIVERY_THRESHOLD = 300_000;
const DELIVERY_FEE       = 30_000;

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();

  const ids               = items.map((i) => i.id);
  const { data: stockData } = useVerifyStock(ids);

  const stockMap: Record<string, number> = {};
  if (stockData) stockData.forEach((p) => { stockMap[p.id] = p.stock; });

  const subtotal = totalPrice();
  const delivery = subtotal > DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total    = subtotal + delivery;

  // Stok muammosi bor itemlar
  const hasStockIssue = items.some((i) => {
    const realStock = stockMap[i.id];
    return realStock !== undefined && i.quantity > realStock;
  });

  if (items.length === 0)
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100vh", background: "#faf9f7", paddingTop: 96, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: 24 }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>🛒</div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 32, fontWeight: 800, color: "#1a1a18", marginBottom: 12 }}>
              Savat bo&apos;sh
            </h2>
            <p style={{ fontSize: 16, color: "#6b6b60", marginBottom: 32, maxWidth: 320, margin: "0 auto 32px" }}>
              Hali hech narsa qo&apos;shilmagan. Mahsulotlarni ko&apos;rib chiqing!
            </p>
            <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 32px", borderRadius: 14, background: "#f97316", color: "white", textDecoration: "none", fontSize: 16, fontWeight: 700 }}>
              <ShoppingBag size={18} /> Xarid qilish
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );

  return (
    <>
      <style>{`
        .cart-item{background:white;border-radius:20px;border:1px solid #e8e6e0;padding:20px;display:flex;gap:16px;align-items:center;transition:all 0.2s;}
        .cart-item.warn{border-color:#fed7aa;background:#fff7ed;}
        .qty-btn{width:32px;height:32px;border-radius:8px;border:1.5px solid #e8e6e0;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;color:#1a1a18;}
        .qty-btn:hover{border-color:#f97316;color:#f97316;}
        .qty-btn:disabled{opacity:0.35;cursor:not-allowed;}
        .remove-btn{width:36px;height:36px;border-radius:10px;border:none;background:#fef2f2;color:#ef4444;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;}
        .remove-btn:hover{background:#ef4444;color:white;}
        .checkout-btn{width:100%;padding:16px;border-radius:14px;background:#f97316;color:white;border:none;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.2s;font-family:"DM Sans",sans-serif;display:flex;align-items:center;justify-content:center;gap:10px;}
        .checkout-btn:hover:not(:disabled){background:#c2550a;transform:translateY(-1px);}
        .checkout-btn:disabled{opacity:0.6;cursor:not-allowed;}
      `}</style>

      <Navbar />
      <main style={{ minHeight: "100vh", background: "#faf9f7", paddingTop: 96 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 80px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#f97316", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Xarid</p>
              <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, color: "#1a1a18" }}>
                Savat ({items.length} ta mahsulot)
              </h1>
            </div>
            <button onClick={clearCart} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 12, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              <Trash2 size={15} /> Savatni tozalash
            </button>
          </div>

          {/* Stok ogohlantirish */}
          {hasStockIssue && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px", borderRadius: 14, background: "#fff7ed", border: "1px solid #fed7aa", marginBottom: 20 }}>
              <AlertTriangle size={18} color="#f97316" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 14, color: "#92400e", lineHeight: 1.5 }}>
                Ba&apos;zi mahsulotlar stoki o&apos;zgardi. Miqdorlar avtomatik tuzatildi.
              </p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>

            {/* Mahsulotlar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {items.map((item) => {
                const realStock  = stockMap[item.id];
                const isOverStock = realStock !== undefined && item.quantity > realStock;
                if (isOverStock && realStock !== undefined && realStock >= 0) {
                  // Avtomatik tuzatish
                  if (realStock === 0) removeItem(item.id);
                  else updateQuantity(item.id, realStock);
                }

                return (
                  <div key={item.id} className={`cart-item${isOverStock ? " warn" : ""}`}>
                    <div style={{ width: 80, height: 80, borderRadius: 14, background: "#f5f4f0", position: "relative", flexShrink: 0, overflow: "hidden" }}>
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="80px" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🛍️</div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a18", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: 14, color: "#6b6b60" }}>{Number(item.price).toLocaleString("uz-UZ")} so&apos;m / dona</p>
                      {item.stock <= 5 && item.stock > 0 && (
                        <p style={{ fontSize: 12, color: "#f97316", fontWeight: 600, marginTop: 2 }}>Faqat {item.stock} ta qoldi!</p>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 4, borderRadius: 10, border: "1.5px solid #e8e6e0" }}>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18", minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <div style={{ textAlign: "right", minWidth: 120 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a18" }}>
                        {(item.price * item.quantity).toLocaleString("uz-UZ")} so&apos;m
                      </p>
                    </div>

                    <button className="remove-btn" onClick={() => removeItem(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}

              <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, border: "1.5px solid #e8e6e0", background: "white", color: "#1a1a18", textDecoration: "none", fontSize: 14, fontWeight: 500, width: "fit-content", marginTop: 8 }}>
                ← Xaridni davom ettirish
              </Link>
            </div>

            {/* Xulosa */}
            <div style={{ position: "sticky", top: 104 }}>
              <div style={{ background: "white", borderRadius: 20, border: "1px solid #e8e6e0", padding: 24 }}>
                <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 800, color: "#1a1a18", marginBottom: 20 }}>
                  Buyurtma xulosasi
                </h2>

                <div style={{ borderTop: "1px solid #f0ede8", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, color: "#6b6b60" }}>Mahsulotlar</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#1a1a18" }}>{subtotal.toLocaleString("uz-UZ")} so&apos;m</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, color: "#6b6b60" }}>Yetkazib berish</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: delivery === 0 ? "#22c55e" : "#1a1a18" }}>
                      {delivery === 0 ? "Bepul 🎉" : `${delivery.toLocaleString("uz-UZ")} so'm`}
                    </span>
                  </div>
                  {delivery > 0 && (
                    <p style={{ fontSize: 12, color: "#9a9a90", padding: "8px 12px", background: "#f5f4f0", borderRadius: 8 }}>
                      💡 {(DELIVERY_THRESHOLD - subtotal).toLocaleString("uz-UZ")} so&apos;m ko&apos;proq xarid qiling — yetkazib berish bepul!
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderTop: "2px solid #1a1a18", marginBottom: 20 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#1a1a18" }}>Jami</span>
                  <span style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 800, color: "#1a1a18" }}>
                    {total.toLocaleString("uz-UZ")} so&apos;m
                  </span>
                </div>

                <button className="checkout-btn" disabled={hasStockIssue} onClick={() => router.push("/checkout")}>
                  Buyurtma berish <ArrowRight size={18} />
                </button>

                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
                  {["Click", "Payme", "Uzcard", "Visa"].map((p) => (
                    <span key={p} style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, border: "1px solid #e8e6e0", color: "#9a9a90" }}>{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
