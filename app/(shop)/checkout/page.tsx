"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useCartStore } from "@/store/cart";
import { useVerifyStock, useAddresses, useCheckPromo } from "@/lib/hooks";
import api from "@/lib/api";
import {
  Check, ChevronRight, MapPin, CreditCard,
  ShoppingBag, ArrowLeft, Truck, AlertTriangle,
} from "lucide-react";

type Step = "address" | "payment" | "confirm";
type PaymentMethod = "click" | "payme" | "cash";

interface AddressForm {
  full_name: string; phone: string; city: string;
  district: string; street: string; extra: string;
}

const CITIES = [
  "Toshkent", "Samarqand", "Buxoro", "Namangan", "Andijon",
  "Farg'ona", "Nukus", "Qarshi", "Termiz", "Jizzax",
  "Navoiy", "Urganch", "Guliston",
];

const DELIVERY_THRESHOLD = 300_000;
const DELIVERY_FEE       = 30_000;

export default function CheckoutPage() {
  const router              = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [isLoggedIn, setIsLoggedIn]      = useState(false);
  const [mounted,    setMounted]         = useState(false);

  useEffect(() => {
    setMounted(true);
    const logged = !!localStorage.getItem("access_token");
    setIsLoggedIn(logged);
    if (!logged) {
      router.replace("/login?next=/checkout");
    }
  }, [router]);

  const [step,      setStep]      = useState<Step>("address");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("click");
  const [loading,   setLoading]   = useState(false);
  const [apiError,  setApiError]  = useState("");
  const [errors,    setErrors]    = useState<Partial<AddressForm>>({});
  const [useMyAddr,   setUseMyAddr]   = useState(false);
  const [promoCode,   setPromoCode]   = useState("");
  const [guestEmail,  setGuestEmail]  = useState("");
  const [promoResult, setPromoResult] = useState<{ discount_amount: number; final_total: number; code: string } | null>(null);
  const [promoError,  setPromoError]  = useState("");

  const [addr, setAddr] = useState<AddressForm>({
    full_name: "", phone: "", city: "Toshkent",
    district: "", street: "", extra: "",
  });

  // Foydalanuvchining saqlangan manzillari
  const { data: myAddresses } = useAddresses();
  const defaultAddr = myAddresses?.find((a) => a.is_default) ?? myAddresses?.[0];

  // Checkout sahifasida stok tekshiruv
  const ids = items.map((i) => i.id);
  const { data: stockData } = useVerifyStock(ids);
  const stockIssues = stockData
    ? items.filter((item) => {
        const real = stockData.find((p) => p.id === item.id);
        return real && item.quantity > real.stock;
      })
    : [];

  const subtotal      = totalPrice();
  const delivery      = subtotal > DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const promoDiscount = promoResult?.discount_amount ?? 0;
  const total         = subtotal + delivery - promoDiscount;

  const checkPromo = useCheckPromo();

  const handlePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError("");
    setPromoResult(null);
    try {
      const res = await checkPromo.mutateAsync({ code: promoCode.toUpperCase(), order_total: subtotal });
      if (res.valid) {
        setPromoResult({ discount_amount: res.discount_amount, final_total: res.final_total, code: res.code });
      } else {
        setPromoError(res.error ?? "Promo-kod yaroqsiz");
      }
    } catch {
      setPromoError("Promo-kod topilmadi");
    }
  };

  const setField = (k: keyof AddressForm, v: string) => {
    setAddr((a) => ({ ...a, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validateAddress = (): boolean => {
    const e: Partial<AddressForm> = {};
    if (!addr.full_name.trim()) e.full_name = "Ism-familya kiritish shart";
    if (!addr.phone.trim())     e.phone     = "Telefon kiritish shart";
    if (!addr.district.trim())  e.district  = "Tuman kiritish shart";
    if (!addr.street.trim())    e.street    = "Manzil kiritish shart";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Saqlangan manzilni to'ldirish
  const fillFromSaved = () => {
    if (!defaultAddr) return;
    setAddr({
      full_name: addr.full_name || "",
      phone:     addr.phone     || "",
      city:      defaultAddr.city,
      district:  defaultAddr.district,
      street:    defaultAddr.street,
      extra:     defaultAddr.extra_info || "",
    });
    setUseMyAddr(true);
  };

  const handleOrder = async () => {
    setLoading(true);
    setApiError("");

    try {
      const orderRes = await api.post("/orders/", {
        payment_method: payMethod,
        address: {
          full_name: addr.full_name,
          phone:     addr.phone,
          city:      addr.city,
          district:  addr.district,
          street:    addr.street,
          extra_info: addr.extra,
        },
        note:  "",
        promo_code: promoResult?.code ?? "",
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      });

      const orderId = orderRes.data.id;
      clearCart();

      // Naqd pul — to'lov sahifasiga o'tish shart emas
      if (payMethod === "cash") {
        router.push(`/payment/success?order_id=${orderId}&method=cash`);
        return;
      }

      // Click yoki Payme — URL olish
      try {
        const payRes = await api.post(`/payments/${payMethod}/create/`, { order_id: orderId });
        setLoading(false);
        window.location.href = payRes.data.payment_url;
        return;
      } catch {
        setLoading(false);
        router.push(`/payment/test?method=${payMethod}&order_id=${orderId}&amount=${total}`);
        return;
      }
    } catch (err: unknown) {
      setLoading(false);
      let msg = "Buyurtmada xatolik yuz berdi";
      if (err && typeof err === "object" && "response" in err) {
        const r = (err as { response?: { data?: { items?: string[]; detail?: string; non_field_errors?: string[] } } }).response;
        if (Array.isArray(r?.data?.items))   msg = r!.data!.items![0];
        else if (r?.data?.detail)            msg = r.data.detail;
        else if (r?.data?.non_field_errors)  msg = r.data.non_field_errors![0];
      }
      setApiError(msg);
    }
  };

  if (!mounted || !isLoggedIn) return null;

  if (items.length === 0)
    return (
      <>
        <Navbar />
        <div style={{ minHeight: "100vh", background: "#faf9f7", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 28, fontWeight: 800, color: "#1a1a18", marginBottom: 12 }}>Savat bo&apos;sh</h2>
            <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 13, background: "#f97316", color: "white", textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
              <ShoppingBag size={18} /> Xarid qilish
            </Link>
          </div>
        </div>
      </>
    );

  const steps = [
    { key: "address", label: "Manzil",     icon: MapPin     },
    { key: "payment", label: "To'lov",     icon: CreditCard },
    { key: "confirm", label: "Tasdiqlash", icon: Check      },
  ] as const;
  const stepIdx = steps.findIndex((s) => s.key === step);

  return (
    <>
      <style>{`
        .co-input{width:100%;padding:12px 16px;border-radius:12px;border:1.5px solid #e8e6e0;background:#faf9f7;font-size:15px;color:#1a1a18;outline:none;transition:all 0.2s;font-family:"DM Sans",sans-serif;box-sizing:border-box;}
        .co-input:focus{border-color:#f97316;background:white;}
        .co-input.err{border-color:#ef4444;}
        .co-label{font-size:14px;font-weight:600;color:#1a1a18;display:block;margin-bottom:6px;}
        .co-err{font-size:12px;color:#ef4444;margin-top:4px;}
        .pay-card{border:2px solid #e8e6e0;border-radius:16px;padding:16px 20px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:14px;margin-bottom:10px;}
        .pay-card:hover{border-color:#f97316;}
        .pay-card.active{border-color:#f97316;background:#fff7ed;}
        .next-btn{flex:1;padding:14px;border-radius:14px;background:#f97316;color:white;border:none;font-size:16px;font-weight:700;cursor:pointer;font-family:"DM Sans",sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;}
        .next-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .back-btn{display:flex;align-items:center;gap:6px;padding:10px 16px;border-radius:12px;border:1.5px solid #e8e6e0;background:white;font-size:14px;font-weight:500;color:#1a1a18;cursor:pointer;font-family:"DM Sans",sans-serif;}
        .saved-addr-btn{display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:12px;border:1.5px solid #f97316;background:#fff7ed;font-size:13px;font-weight:600;color:#f97316;cursor:pointer;margin-bottom:16px;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <Navbar />
      <main style={{ minHeight: "100vh", background: "#faf9f7", paddingTop: 96 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

          {/* Progress steps */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 48 }}>
            {steps.map((s, i) => {
              const done = i < stepIdx, active = i === stepIdx;
              const Icon = s.icon;
              return (
                <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? "#22c55e" : active ? "#f97316" : "#e8e6e0" }}>
                      {done ? <Check size={20} color="white" strokeWidth={3} /> : <Icon size={20} color={active ? "white" : "#9a9a90"} />}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? "#f97316" : done ? "#22c55e" : "#9a9a90" }}>{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ width: 80, height: 2, background: done ? "#22c55e" : "#e8e6e0", margin: "0 8px", marginBottom: 20 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Stok ogohlantirish */}
          {stockIssues.length > 0 && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px", borderRadius: 14, background: "#fef2f2", border: "1px solid #fecaca", marginBottom: 20 }}>
              <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#dc2626", marginBottom: 4 }}>Stok muammosi!</p>
                {stockIssues.map((item) => {
                  const real = stockData!.find((p) => p.id === item.id);
                  return (
                    <p key={item.id} style={{ fontSize: 13, color: "#dc2626" }}>
                      • {item.name}: savatda {item.quantity} ta, lekin stokda {real?.stock ?? 0} ta bor
                    </p>
                  );
                })}
                <Link href="/cart" style={{ fontSize: 13, color: "#dc2626", fontWeight: 700, textDecoration: "underline" }}>
                  Savatni tahrirlash →
                </Link>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>
            <div style={{ background: "white", borderRadius: 20, border: "1px solid #e8e6e0", padding: 32 }}>

              {apiError && (
                <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 14, marginBottom: 20 }}>
                  {apiError}
                </div>
              )}

              {/* ── Manzil ── */}
              {step === "address" && (
                <div>
                  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 800, color: "#1a1a18", marginBottom: 16 }}>
                    Yetkazib berish manzili
                  </h2>

                  {/* Saqlangan manzil */}
                  {defaultAddr && !useMyAddr && (
                    <button className="saved-addr-btn" onClick={fillFromSaved}>
                      <MapPin size={15} /> Saqlangan manzilimni ishlatish — {defaultAddr.city}, {defaultAddr.street}
                    </button>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label className="co-label">Ism-familya</label>
                      <input className={`co-input${errors.full_name ? " err" : ""}`} placeholder="Aziz Karimov"
                        value={addr.full_name} onChange={(e) => setField("full_name", e.target.value)} />
                      {errors.full_name && <p className="co-err">{errors.full_name}</p>}
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label className="co-label">Telefon</label>
                      <input className={`co-input${errors.phone ? " err" : ""}`} placeholder="+998 90 123 45 67"
                        value={addr.phone} onChange={(e) => setField("phone", e.target.value)} />
                      {errors.phone && <p className="co-err">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="co-label">Shahar</label>
                      <select className="co-input" value={addr.city} onChange={(e) => setField("city", e.target.value)}>
                        {CITIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="co-label">Tuman</label>
                      <input className={`co-input${errors.district ? " err" : ""}`} placeholder="Yunusobod tumani"
                        value={addr.district} onChange={(e) => setField("district", e.target.value)} />
                      {errors.district && <p className="co-err">{errors.district}</p>}
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label className="co-label">Ko&apos;cha, uy</label>
                      <input className={`co-input${errors.street ? " err" : ""}`} placeholder="Amir Temur ko'chasi, 15-uy"
                        value={addr.street} onChange={(e) => setField("street", e.target.value)} />
                      {errors.street && <p className="co-err">{errors.street}</p>}
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label className="co-label">Qo&apos;shimcha ma&apos;lumot <span style={{ fontSize: 12, color: "#9a9a90", fontWeight: 400 }}>(ixtiyoriy)</span></label>
                      <input className="co-input" placeholder="Podyezd, qavat, kvartira..."
                        value={addr.extra} onChange={(e) => setField("extra", e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
                    <Link href="/cart"><button className="back-btn"><ArrowLeft size={16} /> Savat</button></Link>
                    <button className="next-btn" onClick={() => { if (validateAddress()) setStep("payment"); }}>
                      Davom <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── To'lov ── */}
              {step === "payment" && (
                <div>
                  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 800, color: "#1a1a18", marginBottom: 24 }}>
                    To&apos;lov usuli
                  </h2>
                  {([
                    { key: "click", emoji: "💳", name: "Click",    desc: "Click ilovasi orqali" },
                    { key: "payme", emoji: "📱", name: "Payme",    desc: "Payme ilovasi orqali" },
                    { key: "cash",  emoji: "💵", name: "Naqd pul", desc: "Yetkazib berganda to'laysiz" },
                  ] as const).map((p) => (
                    <div key={p.key} className={`pay-card${payMethod === p.key ? " active" : ""}`} onClick={() => setPayMethod(p.key)}>
                      <span style={{ fontSize: 28 }}>{p.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18" }}>{p.name}</div>
                        <div style={{ fontSize: 13, color: "#9a9a90" }}>{p.desc}</div>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${payMethod === p.key ? "#f97316" : "#d4d2cc"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {payMethod === p.key && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316" }} />}
                      </div>
                    </div>
                  ))}

                  {/* Promo-kod */}
                  <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: "#faf9f7", border: "1px solid #e8e6e0" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", marginBottom: 10 }}>🎁 Promo-kod bormi?</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="co-input"
                        placeholder="SALE20"
                        value={promoCode}
                        onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); setPromoError(""); }}
                        style={{ textTransform: "uppercase", letterSpacing: "0.05em", flex: 1 }}
                      />
                      <button
                        onClick={handlePromo}
                        disabled={!promoCode.trim() || checkPromo.isPending}
                        style={{ padding: "10px 18px", borderRadius: 12, background: "#f97316", color: "white", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, flexShrink: 0, fontFamily: "DM Sans, sans-serif", opacity: !promoCode.trim() ? 0.5 : 1 }}
                      >
                        {checkPromo.isPending ? "..." : "Qo\'lash"}
                      </button>
                    </div>
                    {promoError && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>{promoError}</p>}
                    {promoResult && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, padding: "8px 12px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                        <span style={{ fontSize: 16 }}>✅</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>{promoResult.code} — chegirma qo\'landi!</p>
                          <p style={{ fontSize: 12, color: "#15803d" }}>-{promoResult.discount_amount.toLocaleString("uz-UZ")} so\'m</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    <button className="back-btn" onClick={() => setStep("address")}><ArrowLeft size={16} /> Orqaga</button>
                    <button className="next-btn" onClick={() => setStep("confirm")}>Davom <ChevronRight size={18} /></button>
                  </div>
                </div>
              )}

              {/* ── Tasdiqlash ── */}
              {step === "confirm" && (
                <div>
                  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 800, color: "#1a1a18", marginBottom: 24 }}>
                    Buyurtmani tasdiqlash
                  </h2>

                  <div style={{ padding: 16, borderRadius: 14, background: "#faf9f7", border: "1px solid #e8e6e0", marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#6b6b60" }}>Manzil</span>
                      <button onClick={() => setStep("address")} style={{ fontSize: 12, color: "#f97316", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>O&apos;zgartirish</button>
                    </div>
                    <p style={{ fontSize: 14, color: "#1a1a18", lineHeight: 1.6 }}>
                      {addr.full_name} · {addr.phone}<br />
                      {addr.city}, {addr.district}, {addr.street}
                      {addr.extra && <><br />{addr.extra}</>}
                    </p>
                  </div>

                  <div style={{ padding: 16, borderRadius: 14, background: "#faf9f7", border: "1px solid #e8e6e0", marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#6b6b60" }}>To&apos;lov</span>
                      <button onClick={() => setStep("payment")} style={{ fontSize: 12, color: "#f97316", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>O&apos;zgartirish</button>
                    </div>
                    <p style={{ fontSize: 14, color: "#1a1a18" }}>
                      {payMethod === "click" ? "💳 Click" : payMethod === "payme" ? "📱 Payme" : "💵 Naqd pul"}
                      {payMethod !== "cash" && (
                        <span style={{ fontSize: 12, color: "#f97316", marginLeft: 8 }}>→ to&apos;lov sahifasiga o&apos;tasiz</span>
                      )}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="back-btn" onClick={() => setStep("payment")}><ArrowLeft size={16} /> Orqaga</button>
                    <button
                      className="next-btn"
                      onClick={handleOrder}
                      disabled={loading || stockIssues.length > 0}
                    >
                      {loading ? (
                        <span style={{ display: "inline-block", width: 20, height: 20, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      ) : (
                        <>{payMethod === "cash" ? "Buyurtma berish" : "To'lovga o'tish"} <Check size={18} /></>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Buyurtma xulosasi */}
            <div style={{ background: "white", borderRadius: 20, border: "1px solid #e8e6e0", padding: 24, position: "sticky", top: 104 }}>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 18, fontWeight: 800, color: "#1a1a18", marginBottom: 16 }}>
                Buyurtma ({items.length} ta)
              </h3>
              <div style={{ marginBottom: 16, maxHeight: 200, overflowY: "auto" }}>
                {items.map((i) => (
                  <div key={i.id} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f5f4f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {i.image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={i.image} alt={i.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                        : "🛍️"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name}</p>
                      <p style={{ fontSize: 12, color: "#9a9a90" }}>x{i.quantity}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {(i.price * i.quantity).toLocaleString("uz-UZ")}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid #f0ede8", paddingTop: 14, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#6b6b60" }}>Mahsulotlar</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{subtotal.toLocaleString("uz-UZ")} so&apos;m</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#6b6b60", display: "flex", alignItems: "center", gap: 4 }}>
                    <Truck size={13} /> Yetkazish
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: delivery === 0 ? "#22c55e" : "#1a1a18" }}>
                    {delivery === 0 ? "Bepul" : `${delivery.toLocaleString("uz-UZ")} so'm`}
                  </span>
                </div>
                {promoResult && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#15803d" }}>🎁 {promoResult.code}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>
                      -{promoResult.discount_amount.toLocaleString("uz-UZ")} so'm
                    </span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderTop: "2px solid #1a1a18" }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>Jami</span>
                <span style={{ fontFamily: "Playfair Display, serif", fontSize: 20, fontWeight: 800 }}>
                  {total.toLocaleString("uz-UZ")} so&apos;m
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}