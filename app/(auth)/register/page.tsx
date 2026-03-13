"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Check } from "lucide-react";
import api from "@/lib/api";

function RegisterContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", password2: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string) => { setForm((f) => ({ ...f, [k]: v })); setError(""); };

  const validate = (): string => {
    if (!form.full_name.trim()) return "Ism-familya kiritish majburiy";
    if (!form.email.includes("@")) return "Email noto'g'ri formatda";
    if (form.password.length < 8) return "Parol kamida 8 ta belgidan iborat bo'lishi kerak";
    if (form.password !== form.password2) return "Parollar mos kelmaydi";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register/", {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        password2: form.password2,
      });
      if (data.access) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
      }
      setSuccess(true);
    } catch (err: unknown) {
      let msg = "Server bilan bog'lanishda xatolik";
      if (err && typeof err === "object" && "response" in err) {
        const r = (err as { response?: { data?: Record<string, unknown> } }).response;
        if (r?.data) {
          const firstVal = Object.values(r.data)[0];
          msg = Array.isArray(firstVal) ? String(firstVal[0]) : String(firstVal);
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success)
    return (
      <div style={{ minHeight: "100vh", background: "#faf9f7", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Check size={32} color="#22c55e" />
          </div>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 28, fontWeight: 800, color: "#1a1a18", marginBottom: 12 }}>
            Muvaffaqiyatli ro'yxatdan o'tdingiz!
          </h2>
          <p style={{ fontSize: 15, color: "#6b6b60", marginBottom: 32, lineHeight: 1.6 }}>
            Hisobingiz yaratildi va tizimga kirdingiz.
          </p>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 14, background: "#f97316", color: "white", textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
            Bosh sahifaga <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ["#e8e6e0", "#ef4444", "#f97316", "#22c55e"];
  const strengthLabels = ["", "Juda zaif", "O'rtacha", "Kuchli"];

  return (
    <>
      <style>{`
        .auth-input-wrap{position:relative;}
        .auth-input{width:100%;padding:13px 16px 13px 44px;border-radius:14px;border:1.5px solid #e8e6e0;background:#faf9f7;font-size:15px;color:#1a1a18;outline:none;transition:all 0.2s;font-family:"DM Sans",sans-serif;box-sizing:border-box;}
        .auth-input:focus{border-color:#f97316;background:white;box-shadow:0 0 0 3px rgba(249,115,22,0.08);}
        .auth-input.err{border-color:#ef4444;}
        .auth-btn{width:100%;padding:14px;border-radius:14px;background:#f97316;color:white;border:none;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.2s;font-family:"DM Sans",sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;}
        .auth-btn:hover:not(:disabled){background:#c2550a;transform:translateY(-1px);}
        .auth-btn:disabled{opacity:0.6;cursor:not-allowed;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ minHeight: "100vh", background: "#faf9f7", display: "flex" }}>
        {/* Chap panel */}
        <div style={{ flex: 1, background: "linear-gradient(135deg,#f97316 0%,#c2550a 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 360 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: 36, fontWeight: 800, color: "white", marginBottom: 32 }}>
                Uz<span style={{ color: "rgba(255,255,255,0.7)" }}>Box</span>
              </div>
            </Link>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 32, fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: 16 }}>
              Bugun qo'shiling!
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, marginBottom: 32 }}>
              Ro'yxatdan o'ting va birinchi buyurtmangizga <strong>10% chegirma</strong> oling.
            </p>
            {["Maxsus chegirmalar", "Buyurtmalarni kuzatish", "Tezkor checkout"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check size={12} color="white" />
                </div>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* O'ng panel */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 30, fontWeight: 800, color: "#1a1a18", marginBottom: 8 }}>
              Ro'yxatdan o'tish
            </h1>
            <p style={{ fontSize: 15, color: "#6b6b60", marginBottom: 24 }}>
              Hisobingiz bormi?{" "}
              <Link href="/login" style={{ color: "#f97316", fontWeight: 600, textDecoration: "none" }}>Kirish</Link>
            </p>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 14, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Ism */}
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", display: "block", marginBottom: 6 }}>Ism-familya</label>
                <div className="auth-input-wrap">
                  <User size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9a9a90" }} />
                  <input className="auth-input" placeholder="Aziz Karimov" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", display: "block", marginBottom: 6 }}>Email</label>
                <div className="auth-input-wrap">
                  <Mail size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9a9a90" }} />
                  <input type="email" className="auth-input" placeholder="email@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
              </div>

              {/* Telefon */}
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", display: "block", marginBottom: 6 }}>
                  Telefon <span style={{ fontSize: 12, color: "#9a9a90", fontWeight: 400 }}>(ixtiyoriy)</span>
                </label>
                <div className="auth-input-wrap">
                  <Phone size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9a9a90" }} />
                  <input className="auth-input" placeholder="+998 90 123 45 67" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
              </div>

              {/* Parol */}
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", display: "block", marginBottom: 6 }}>Parol</label>
                <div className="auth-input-wrap">
                  <Lock size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9a9a90" }} />
                  <input type={showPass ? "text" : "password"} className="auth-input" placeholder="Kamida 8 ta belgi"
                    value={form.password} onChange={(e) => set("password", e.target.value)} style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9a9a90" }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3].map((i) => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength] : "#e8e6e0", transition: "background 0.3s" }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                  </div>
                )}
              </div>

              {/* Parol tasdiqlash */}
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", display: "block", marginBottom: 6 }}>Parolni tasdiqlang</label>
                <div className="auth-input-wrap">
                  <Lock size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9a9a90" }} />
                  <input type={showPass ? "text" : "password"}
                    className={`auth-input${form.password2 && form.password !== form.password2 ? " err" : ""}`}
                    placeholder="Parolni qayta kiriting"
                    value={form.password2} onChange={(e) => set("password2", e.target.value)} />
                  {form.password2 && form.password === form.password2 && (
                    <Check size={16} color="#22c55e" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }} />
                  )}
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading
                  ? <span style={{ display: "inline-block", width: 20, height: 20, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  : <>Ro'yxatdan o'tish <ArrowRight size={18} /></>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
