"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useProfile, useUpdateProfile, useChangePassword, useOrders, useSendVerifyEmail, useCancelOrder, useAddresses, useCreateAddress, useDeleteAddress, useUpdateAddress } from "@/lib/hooks";
import {
  User, Mail, Phone, Lock, LogOut, ShoppingBag,
  ChevronRight, ChevronLeft, Check, Eye, EyeOff,
  Package, Loader2, Camera, MapPin, Plus, Trash2, Star, Edit2,
} from "lucide-react";
import api from "@/lib/api";

type Tab = "profile" | "orders" | "addresses" | "password";

const ORDER_STATUS: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  pending:    { label: "Kutilmoqda",     color: "#92400e", bg: "#fef9c3", emoji: "⏳" },
  paid:       { label: "To'landi",       color: "#1d4ed8", bg: "#eff6ff", emoji: "✅" },
  processing: { label: "Tayyorlanmoqda", color: "#6d28d9", bg: "#f5f3ff", emoji: "📦" },
  shipped:    { label: "Yo'lda",         color: "#0369a1", bg: "#f0f9ff", emoji: "🚚" },
  delivered:  { label: "Yetkazildi",     color: "#15803d", bg: "#f0fdf4", emoji: "🎉" },
  cancelled:  { label: "Bekor qilindi",  color: "#dc2626", bg: "#fef2f2", emoji: "❌" },
};

export default function ProfilePage() {
  const [tab,          setTab]          = useState<Tab>("profile");
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [ordersPage,   setOrdersPage]   = useState(1);

  // Avatar yuklash
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  const { data: user,       isLoading: profileLoading  } = useProfile();
  const { data: ordersData, isLoading: ordersLoading   } = useOrders(ordersPage);
  const updateProfile   = useUpdateProfile();
  const sendVerifyEmail = useSendVerifyEmail();
  const [verifyMsg,  setVerifyMsg]  = useState<string | null>(null);
  const changePassword = useChangePassword();
  const cancelOrder    = useCancelOrder();
  const { data: addresses = [], isLoading: addrLoading } = useAddresses();
  const createAddress  = useCreateAddress();
  const deleteAddress  = useDeleteAddress();
  const updateAddress  = useUpdateAddress();

  // Manzil form state
  const emptyAddr = { title: "", city: "", district: "", street: "", extra_info: "", is_default: false };
  const [addrForm,    setAddrForm]    = useState(emptyAddr);
  const [addrEdit,    setAddrEdit]    = useState<number | null>(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrSaving,  setAddrSaving]  = useState(false);

  const handleAddrSave = async () => {
    if (!addrForm.title || !addrForm.city || !addrForm.district || !addrForm.street) return;
    setAddrSaving(true);
    try {
      if (addrEdit !== null) {
        await updateAddress.mutateAsync({ id: addrEdit, body: addrForm });
      } else {
        await createAddress.mutateAsync(addrForm);
      }
      setAddrForm(emptyAddr);
      setAddrEdit(null);
      setShowAddrForm(false);
    } finally {
      setAddrSaving(false);
    }
  };

  const handleAddrEdit = (addr: typeof addresses[0]) => {
    setAddrForm({ title: addr.title, city: addr.city, district: addr.district, street: addr.street, extra_info: addr.extra_info, is_default: addr.is_default });
    setAddrEdit(addr.id);
    setShowAddrForm(true);
  };

  const [editName,  setEditName]  = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saved,     setSaved]     = useState(false);
  const [showOld,   setShowOld]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [passwords, setPasswords] = useState({ old: "", new1: "", new2: "" });
  const [passMsg,   setPassMsg]   = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (user) { setEditName(user.full_name); setEditPhone(user.phone); }
  }, [user]);

  const handleSave = async () => {
    if (avatarFile) {
      const fd = new FormData();
      fd.append("full_name", editName);
      fd.append("phone",     editPhone);
      fd.append("avatar",    avatarFile);
      await updateProfile.mutateAsync(fd);
      setAvatarFile(null);
      setAvatarPreview(null);
    } else {
      await updateProfile.mutateAsync({ full_name: editName, phone: editPhone });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePassword = async () => {
    if (passwords.new1.length < 8) { setPassMsg({ type: "err", text: "Yangi parol kamida 8 ta belgi" }); return; }
    if (passwords.new1 !== passwords.new2) { setPassMsg({ type: "err", text: "Parollar mos kelmaydi" }); return; }
    try {
      await changePassword.mutateAsync({ old_password: passwords.old, new_password: passwords.new1 });
      setPassMsg({ type: "ok", text: "Parol muvaffaqiyatli o'zgartirildi!" });
      setPasswords({ old: "", new1: "", new2: "" });
      setTimeout(() => setPassMsg(null), 3000);
    } catch {
      setPassMsg({ type: "err", text: "Eski parol noto'g'ri" });
    }
  };

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) await api.post("/auth/logout/", { refresh });
    } catch {
      // token muammosi bo'lsa ham chiqamiz
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/";
    }
  };

  if (!isLoggedIn)
    return (
      <>
        <Navbar />
        <div style={{ minHeight: "100vh", background: "#faf9f7", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
          <div style={{ textAlign: "center", maxWidth: 360, padding: 24 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🔐</div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 28, fontWeight: 800, color: "#1a1a18", marginBottom: 12 }}>Avval kiring</h2>
            <p style={{ fontSize: 15, color: "#6b6b60", marginBottom: 28, lineHeight: 1.6 }}>Profil sahifasini ko&apos;rish uchun hisobingizga kiring.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link href="/login?next=/profile" style={{ padding: "13px 28px", borderRadius: 13, background: "#f97316", color: "white", textDecoration: "none", fontWeight: 700, fontSize: 15 }}>Kirish</Link>
              <Link href="/register" style={{ padding: "13px 28px", borderRadius: 13, border: "1.5px solid #e8e6e0", background: "white", color: "#1a1a18", textDecoration: "none", fontWeight: 600, fontSize: 15 }}>Ro&apos;yxatdan o&apos;tish</Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );

  const orders     = ordersData?.results ?? [];
  const totalOrders = ordersData?.count ?? 0;
  const orderPages  = Math.ceil(totalOrders / 10);

  const navItems: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "profile",   label: "Mening profilim",   icon: User        },
    { key: "orders",    label: "Buyurtmalarim",      icon: ShoppingBag },
    { key: "addresses", label: "Manzillarim",         icon: MapPin      },
    { key: "password",  label: "Parol o'zgartirish",  icon: Lock        },
  ];

  // Avatar: preview → user.avatar → harf
  const avatarSrc = avatarPreview ?? (user?.avatar ?? null);

  return (
    <>
      <style>{`
        .pf-input{width:100%;padding:12px 16px;border-radius:12px;border:1.5px solid #e8e6e0;background:#faf9f7;font-size:15px;color:#1a1a18;outline:none;transition:all 0.2s;font-family:"DM Sans",sans-serif;box-sizing:border-box;}
        .pf-input:focus{border-color:#f97316;background:white;box-shadow:0 0 0 3px rgba(249,115,22,0.08);}
        .pf-label{font-size:14px;font-weight:600;color:#1a1a18;display:block;margin-bottom:6px;}
        .pf-save-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:13px 28px;border-radius:13px;background:#f97316;color:white;border:none;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.2s;font-family:"DM Sans",sans-serif;}
        .pf-save-btn:hover{background:#c2550a;}
        .pf-save-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .sidebar-item{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:13px;cursor:pointer;transition:all 0.2s;border:none;background:none;width:100%;text-align:left;font-family:"DM Sans",sans-serif;}
        .sidebar-item:hover{background:#f5f4f0;}
        .sidebar-item.active{background:#fff7ed;}
        .order-card{background:white;border-radius:16px;border:1px solid #e8e6e0;padding:20px;margin-bottom:14px;transition:box-shadow 0.2s;}
        .order-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.06);}
        .pg-btn{min-width:36px;height:36px;border-radius:10px;border:1.5px solid #e8e6e0;background:white;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;color:#1a1a18;}
        .pg-btn:hover:not(:disabled){border-color:#f97316;color:#f97316;}
        .pg-btn.active{background:#f97316;border-color:#f97316;color:white;}
        .pg-btn:disabled{opacity:0.35;cursor:not-allowed;}
        .addr-card{background:white;border-radius:16px;border:1.5px solid #e8e6e0;padding:18px 20px;margin-bottom:12px;transition:all 0.2s;position:relative;}
        .addr-card:hover{border-color:#f97316;box-shadow:0 4px 16px rgba(249,115,22,0.08);}
        .addr-card.default{border-color:#f97316;background:#fff7ed;}
        .addr-input{width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid #e8e6e0;background:#faf9f7;font-size:14px;color:#1a1a18;outline:none;box-sizing:border-box;font-family:"DM Sans",sans-serif;}
        .addr-input:focus{border-color:#f97316;background:white;box-shadow:0 0 0 3px rgba(249,115,22,0.08);}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <Navbar />
      <main style={{ minHeight: "100vh", background: "#faf9f7", paddingTop: 96 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#f97316", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Hisob</p>
            <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, color: "#1a1a18" }}>Mening sahifam</h1>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 28, alignItems: "start" }}>

            {/* Sidebar */}
            <div style={{ background: "white", borderRadius: 20, border: "1px solid #e8e6e0", padding: 16, position: "sticky", top: 104 }}>
              {/* Avatar */}
              <div style={{ textAlign: "center", padding: "20px 0 16px", borderBottom: "1px solid #f0ede8", marginBottom: 12 }}>
                <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 12px" }}>
                  {avatarSrc ? (
                    <Image src={avatarSrc} alt="Avatar" width={72} height={72}
                      style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid #f97316" }} />
                  ) : (
                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#c2550a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "white" }}>
                      {user?.full_name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  {/* Kamera tugmasi */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: "50%", background: "#f97316", border: "2px solid white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Camera size={12} color="white" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                </div>
                {avatarFile && (
                  <p style={{ fontSize: 12, color: "#f97316", fontWeight: 600 }}>Saqlash tugmasini bosing</p>
                )}
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18", marginBottom: 2 }}>{user?.full_name ?? "..."}</p>
                <p style={{ fontSize: 13, color: "#9a9a90" }}>{user?.email ?? ""}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.key} className={`sidebar-item${tab === item.key ? " active" : ""}`} onClick={() => setTab(item.key)}>
                      <Icon size={18} color={tab === item.key ? "#f97316" : "#6b6b60"} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: tab === item.key ? "#f97316" : "#1a1a18", flex: 1 }}>{item.label}</span>
                      <ChevronRight size={14} color="#d4d2cc" />
                    </button>
                  );
                })}
                <div style={{ borderTop: "1px solid #f0ede8", marginTop: 8, paddingTop: 8 }}>
                  <button className="sidebar-item" onClick={handleLogout}>
                    <LogOut size={18} color="#ef4444" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#ef4444" }}>Chiqish</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ background: "white", borderRadius: 20, border: "1px solid #e8e6e0", padding: 32 }}>

              {/* ── Profil ── */}
              {tab === "profile" && (
                <div>
                  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 800, color: "#1a1a18", marginBottom: 24 }}>Shaxsiy ma&apos;lumotlar</h2>
                  {profileLoading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                      <Loader2 size={28} color="#f97316" style={{ animation: "spin 1s linear infinite" }} />
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                      <div style={{ gridColumn: "1/-1" }}>
                        <label className="pf-label"><User size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />Ism-familya</label>
                        <input className="pf-input" placeholder="Aziz Karimov" value={editName} onChange={(e) => setEditName(e.target.value)} />
                      </div>
                      <div>
                        <label className="pf-label"><Mail size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />Email</label>
                        <input className="pf-input" type="email" disabled value={user?.email ?? ""} style={{ opacity: 0.6, cursor: "not-allowed" }} />
                        {user && !user.is_verified && (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6, padding: "7px 12px", borderRadius: 10, background: "#fff7ed", border: "1px solid #fed7aa" }}>
                            <span style={{ fontSize: 12, color: "#92400e" }}>⚠️ Email tasdiqlanmagan</span>
                            <button
                              onClick={() => sendVerifyEmail.mutate(undefined as never, { onSuccess: () => setVerifyMsg("Email yuborildi!"), onError: () => setVerifyMsg("Xatolik") })}
                              disabled={sendVerifyEmail.isPending}
                              style={{ fontSize: 12, color: "#f97316", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                            >
                              {sendVerifyEmail.isPending ? "..." : "Tasdiqlash →"}
                            </button>
                          </div>
                        )}
                        {user?.is_verified && <p style={{ fontSize: 12, color: "#15803d", marginTop: 4 }}>✅ Email tasdiqlangan</p>}
                        {verifyMsg && <p style={{ fontSize: 12, color: "#f97316", marginTop: 4 }}>{verifyMsg}</p>}
                      </div>
                      <div>
                        <label className="pf-label"><Phone size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />Telefon</label>
                        <input className="pf-input" placeholder="+998 90 123 45 67" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                      </div>
                    </div>
                  )}
                  <button className="pf-save-btn" onClick={handleSave} disabled={updateProfile.isPending}>
                    {saved ? <><Check size={18} /> Saqlandi!</> : updateProfile.isPending ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                </div>
              )}

              {/* ── Buyurtmalar ── */}
              {tab === "orders" && (
                <div>
                  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 800, color: "#1a1a18", marginBottom: 24 }}>
                    Buyurtmalarim {totalOrders > 0 && <span style={{ fontSize: 16, color: "#9a9a90" }}>({totalOrders} ta)</span>}
                  </h2>

                  {ordersLoading && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                      <Loader2 size={28} color="#f97316" style={{ animation: "spin 1s linear infinite" }} />
                    </div>
                  )}

                  {!ordersLoading && orders.length === 0 && (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                      <Package size={48} color="#d4d2cc" style={{ margin: "0 auto 16px" }} />
                      <p style={{ fontSize: 16, color: "#6b6b60", marginBottom: 20 }}>Hali buyurtma yo&apos;q</p>
                      <Link href="/products" style={{ display: "inline-block", padding: "12px 24px", borderRadius: 12, background: "#f97316", color: "white", textDecoration: "none", fontWeight: 600 }}>
                        Xarid qilish
                      </Link>
                    </div>
                  )}

                  {!ordersLoading && orders.map((order) => {
                    const s = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
                    return (
                      <div key={order.id} className="order-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                          <div>
                            <Link href={`/orders/${order.id}`} style={{ textDecoration: "none" }}>
                            <p style={{ fontSize: 15, fontWeight: 700, color: "#f97316", marginBottom: 2 }}>#{order.id.slice(0, 8).toUpperCase()} →</p>
                          </Link>
                            <p style={{ fontSize: 13, color: "#9a9a90" }}>{order.created_at?.slice(0, 10)}</p>
                          </div>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 100, background: s.bg, color: s.color, fontSize: 12, fontWeight: 700 }}>
                            {s.emoji} {s.label}
                          </span>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          {(order.items ?? []).map((item, i) => (
                            <p key={i} style={{ fontSize: 13, color: "#3a3a34", padding: "4px 0", borderBottom: i < order.items.length - 1 ? "1px dashed #f0ede8" : "none" }}>
                              • {item.product?.name ?? "Mahsulot"} × {item.quantity}
                            </p>
                          ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18" }}>{Number(order.total_price).toLocaleString()} so&apos;m</span>
                          <span style={{ fontSize: 13, color: "#9a9a90", textTransform: "capitalize" }}>{order.payment_method}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Buyurtmalar pagination */}
                  {orderPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 16 }}>
                      <button className="pg-btn" onClick={() => setOrdersPage((p) => p - 1)} disabled={ordersPage <= 1}><ChevronLeft size={16} /></button>
                      {Array.from({ length: orderPages }, (_, i) => i + 1).map((n) => (
                        <button key={n} className={`pg-btn${ordersPage === n ? " active" : ""}`} onClick={() => setOrdersPage(n)}>{n}</button>
                      ))}
                      <button className="pg-btn" onClick={() => setOrdersPage((p) => p + 1)} disabled={ordersPage >= orderPages}><ChevronRight size={16} /></button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Manzillar ── */}
              {tab === "addresses" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                    <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 800, color: "#1a1a18" }}>Manzillarim</h2>
                    <button
                      onClick={() => { setAddrEdit(null); setAddrForm(emptyAddr); setShowAddrForm(true); }}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 12, background: "#f97316", color: "white", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                    >
                      <Plus size={16} /> Yangi manzil
                    </button>
                  </div>

                  {/* Manzil qo'shish / tahrirlash formasi */}
                  {showAddrForm && (
                    <div style={{ background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: 16, padding: 20, marginBottom: 20 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18", marginBottom: 16 }}>
                        {addrEdit !== null ? "Manzilni tahrirlash" : "Yangi manzil qo'shish"}
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                        <div>
                          <label className="pf-label">Nomi *</label>
                          <input className="addr-input" value={addrForm.title} onChange={e => setAddrForm(p => ({ ...p, title: e.target.value }))} placeholder="Uy, Ish, Onam uyi..." />
                        </div>
                        <div>
                          <label className="pf-label">Shahar *</label>
                          <input className="addr-input" value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))} placeholder="Toshkent" />
                        </div>
                        <div>
                          <label className="pf-label">Tuman *</label>
                          <input className="addr-input" value={addrForm.district} onChange={e => setAddrForm(p => ({ ...p, district: e.target.value }))} placeholder="Chilonzor" />
                        </div>
                        <div>
                          <label className="pf-label">Ko&apos;cha, uy * </label>
                          <input className="addr-input" value={addrForm.street} onChange={e => setAddrForm(p => ({ ...p, street: e.target.value }))} placeholder="Bunyodkor 5, 12-xonadon" />
                        </div>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label className="pf-label">Qo&apos;shimcha ma&apos;lumot</label>
                        <input className="addr-input" value={addrForm.extra_info} onChange={e => setAddrForm(p => ({ ...p, extra_info: e.target.value }))} placeholder="4-qavat, qo'ng'iroq qiling..." />
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#1a1a18", cursor: "pointer", marginBottom: 16 }}>
                        <input type="checkbox" checked={addrForm.is_default} onChange={e => setAddrForm(p => ({ ...p, is_default: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "#f97316" }} />
                        Asosiy manzil sifatida belgilash
                      </label>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={handleAddrSave}
                          disabled={addrSaving || !addrForm.title || !addrForm.city || !addrForm.district || !addrForm.street}
                          className="pf-save-btn"
                          style={{ flex: 1 }}
                        >
                          {addrSaving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={16} />}
                          {addrEdit !== null ? "Saqlash" : "Qo'shish"}
                        </button>
                        <button
                          onClick={() => { setShowAddrForm(false); setAddrEdit(null); setAddrForm(emptyAddr); }}
                          style={{ padding: "13px 20px", borderRadius: 13, border: "1.5px solid #e8e6e0", background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                        >
                          Bekor
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manzillar ro'yxati */}
                  {addrLoading ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Loader2 size={28} color="#f97316" style={{ animation: "spin 1s linear infinite" }} />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 0", background: "white", borderRadius: 20, border: "1px solid #e8e6e0" }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📍</div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a18", marginBottom: 6 }}>Manzil yo&apos;q</p>
                      <p style={{ fontSize: 14, color: "#9a9a90" }}>Tez yetkazib berish uchun manzil qo&apos;shing</p>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div key={addr.id} className={`addr-card${addr.is_default ? " default" : ""}`}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                              <MapPin size={15} color="#f97316" />
                              <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18" }}>{addr.title}</span>
                              {addr.is_default && (
                                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 100, background: "#f97316", color: "white" }}>
                                  ★ Asosiy
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: 14, color: "#6b6b60", lineHeight: 1.6, margin: 0 }}>
                              {addr.city}, {addr.district}<br />
                              {addr.street}
                              {addr.extra_info && <><br /><span style={{ color: "#9a9a90" }}>{addr.extra_info}</span></>}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            {!addr.is_default && (
                              <button
                                onClick={() => updateAddress.mutate({ id: addr.id, body: { is_default: true } })}
                                title="Asosiy qilish"
                                style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid #e8e6e0", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              >
                                <Star size={14} color="#f97316" />
                              </button>
                            )}
                            <button
                              onClick={() => handleAddrEdit(addr)}
                              title="Tahrirlash"
                              style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid #e8e6e0", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <Edit2 size={14} color="#6b6b60" />
                            </button>
                            <button
                              onClick={() => { if (confirm("Bu manzilni o'chirasizmi?")) deleteAddress.mutate(addr.id); }}
                              title="O'chirish"
                              style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid #fecaca", background: "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <Trash2 size={14} color="#dc2626" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── Parol ── */}
              {tab === "password" && (
                <div>
                  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 800, color: "#1a1a18", marginBottom: 24 }}>Parol o&apos;zgartirish</h2>
                  {passMsg && (
                    <div style={{ padding: "12px 16px", borderRadius: 12, background: passMsg.type === "ok" ? "#f0fdf4" : "#fef2f2", border: `1px solid ${passMsg.type === "ok" ? "#bbf7d0" : "#fecaca"}`, color: passMsg.type === "ok" ? "#15803d" : "#dc2626", fontSize: 14, marginBottom: 20 }}>
                      {passMsg.text}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>
                    {[
                      { key: "old",  label: "Joriy parol",             show: showOld, toggle: () => setShowOld(!showOld) },
                      { key: "new1", label: "Yangi parol",             show: showNew, toggle: () => setShowNew(!showNew) },
                      { key: "new2", label: "Yangi parolni tasdiqlang", show: showNew, toggle: () => {} },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="pf-label">{f.label}</label>
                        <div style={{ position: "relative" }}>
                          <input type={f.show ? "text" : "password"} className="pf-input"
                            placeholder="••••••••" style={{ paddingRight: 44 }}
                            value={passwords[f.key as keyof typeof passwords]}
                            onChange={(e) => setPasswords((p) => ({ ...p, [f.key]: e.target.value }))} />
                          {f.key !== "new2" && (
                            <button type="button" onClick={f.toggle}
                              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9a9a90" }}>
                              {f.show ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button className="pf-save-btn" onClick={handlePassword} disabled={changePassword.isPending} style={{ width: "fit-content" }}>
                      <Lock size={16} /> {changePassword.isPending ? "O'zgartirilmoqda..." : "Parolni o'zgartirish"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}