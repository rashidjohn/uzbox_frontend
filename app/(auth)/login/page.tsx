"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import api from "@/lib/api";

function LoginContent() {
  const searchParams = useSearchParams();
  const next         = searchParams.get("next") ?? "/";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Barcha maydonlarni to'ldiring"); return; }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login/", { email, password });
      localStorage.setItem("access_token",  data.access);
      localStorage.setItem("refresh_token", data.refresh);
      // Login bo'lgan joyga qaytarish
      window.location.href = next;
    } catch (err: unknown) {
      let msg = "Email yoki parol noto'g'ri";
      if (err && typeof err === "object" && "response" in err) {
        const r = (err as { response?: { data?: { detail?: string; non_field_errors?: string[] } } }).response;
        msg = r?.data?.detail ?? r?.data?.non_field_errors?.[0] ?? msg;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .auth-input-wrap{position:relative;}
        .auth-input{width:100%;padding:13px 16px 13px 44px;border-radius:14px;border:1.5px solid #e8e6e0;background:#faf9f7;font-size:15px;color:#1a1a18;outline:none;transition:all 0.2s;font-family:"DM Sans",sans-serif;box-sizing:border-box;}
        .auth-input:focus{border-color:#f97316;background:white;box-shadow:0 0 0 3px rgba(249,115,22,0.08);}
        .auth-input.error{border-color:#ef4444;}
        .auth-btn{width:100%;padding:14px;border-radius:14px;background:#f97316;color:white;border:none;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.2s;font-family:"DM Sans",sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;}
        .auth-btn:hover:not(:disabled){background:#c2550a;transform:translateY(-1px);}
        .auth-btn:disabled{opacity:0.6;cursor:not-allowed;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ minHeight: "100vh", background: "#faf9f7", display: "flex" }}>
        {/* Chap dekorativ panel */}
        <div style={{ flex: 1, background: "linear-gradient(135deg,#1a1a18 0%,#2d2d2a 60%,#3a3a34 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(249,115,22,0.12)" }} />
          <div style={{ position: "absolute", bottom: -60, left: -40, width: 240, height: 240, borderRadius: "50%", background: "rgba(249,115,22,0.08)" }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 360 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: 36, fontWeight: 800, color: "white", marginBottom: 32 }}>
                Uz<span style={{ color: "#f97316" }}>Box</span>
              </div>
            </Link>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 32, fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: 16 }}>
              Xaridlarni tezroq bajaring
            </h2>
            <p style={{ fontSize: 16, color: "#6b6b60", lineHeight: 1.7 }}>
              Hisobingizga kiring va buyurtmalaringizni kuzating.
            </p>
          </div>
        </div>

        {/* O'ng panel — forma */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 32, fontWeight: 800, color: "#1a1a18", marginBottom: 8 }}>Kirish</h1>
            <p style={{ fontSize: 15, color: "#6b6b60", marginBottom: 32 }}>
              Hisobingiz yo&apos;qmi?{" "}
              <Link href="/register" style={{ color: "#f97316", fontWeight: 600, textDecoration: "none" }}>Ro&apos;yxatdan o&apos;ting</Link>
            </p>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 14, marginBottom: 20 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", display: "block", marginBottom: 6 }}>Email</label>
                <div className="auth-input-wrap">
                  <Mail size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9a9a90" }} />
                  <input
                    type="email"
                    className={`auth-input${error ? " error" : ""}`}
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", display: "block", marginBottom: 6 }}>Parol</label>
                <div className="auth-input-wrap">
                  <Lock size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9a9a90" }} />
                  <input
                    type={showPass ? "text" : "password"}
                    className={`auth-input${error ? " error" : ""}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9a9a90" }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: 8 }}>
                {loading
                  ? <span style={{ display: "inline-block", width: 20, height: 20, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  : <>Kirish <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
