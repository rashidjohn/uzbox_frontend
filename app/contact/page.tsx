"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, Phone, MapPin, Send, Check } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <>
      <style>{`
        .co-input{width:100%;padding:13px 16px;border-radius:14px;border:1.5px solid #e8e6e0;background:#faf9f7;font-size:15px;color:#1a1a18;outline:none;transition:all 0.2s;font-family:"DM Sans",sans-serif;box-sizing:border-box;}
        .co-input:focus{border-color:#f97316;background:white;}
      `}</style>

      <Navbar />
      <main style={{ minHeight: "100vh", background: "#faf9f7", paddingTop: 96 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px 80px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#f97316", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Aloqa</p>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#1a1a18", marginBottom: 48 }}>
            Biz bilan bog'laning
          </h1>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
            {/* Kontakt ma'lumotlar */}
            <div>
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 800, color: "#1a1a18", marginBottom: 32 }}>
                Aloqa ma'lumotlari
              </h2>
              {[
                { icon: Phone, label: "Telefon", value: "+998 (71) 200-00-00" },
                { icon: Mail, label: "Email", value: "info@uzbox.uz" },
                { icon: MapPin, label: "Manzil", value: "Toshkent sh., Yunusobod tumani" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={20} color="#f97316" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "#9a9a90", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a18" }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Forma */}
            <div style={{ background: "white", borderRadius: 20, border: "1px solid #e8e6e0", padding: 32 }}>
              {sent ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Check size={28} color="#22c55e" />
                  </div>
                  <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 20, fontWeight: 700, color: "#1a1a18", marginBottom: 8 }}>
                    Xabar yuborildi!
                  </h3>
                  <p style={{ color: "#6b6b60" }}>Tez orada javob beramiz.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", display: "block", marginBottom: 6 }}>Ismingiz</label>
                    <input className="co-input" placeholder="Aziz Karimov" required
                      value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", display: "block", marginBottom: 6 }}>Email</label>
                    <input type="email" className="co-input" placeholder="email@example.com" required
                      value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18", display: "block", marginBottom: 6 }}>Xabar</label>
                    <textarea className="co-input" rows={5} placeholder="Savolingizni yozing..." required
                      value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} style={{ resize: "vertical" }} />
                  </div>
                  <button type="submit" style={{ padding: "14px", borderRadius: 14, background: "#f97316", color: "white", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "DM Sans, sans-serif" }}>
                    <Send size={18} /> Yuborish
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
