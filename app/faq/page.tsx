"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "Buyurtma qancha vaqtda yetkaziladi?", a: "Odatda 1–3 ish kuni ichida yetkazib beramiz. Toshkent shahrida — 1 kunda, viloyatlarga — 2–3 kunda." },
  { q: "Tolovni qanday amalga oshirish mumkin?", a: "Click, Payme yoki yetkazib berganda naqd pul orqali tolov qilishingiz mumkin." },
  { q: "Mahsulotni qaytarish mumkinmi?", a: "Ha, sotib olingan kundan boshlab 14 kun ichida qaytarishingiz mumkin. Mahsulot asl holida, qadoqlanmagan bo'lishi kerak." },
  { q: "Ro'yxatdan o'tmasdan xarid qilish mumkinmi?", a: "Ha, mehmon sifatida ham xarid qilishingiz mumkin. Lekin hisobga kirish orqali buyurtmalaringizni kuzatishingiz osonroq bo'ladi." },
  { q: "Yetkazib berish narxi qancha?", a: "300 000 so'm va undan yuqori buyurtmalar uchun yetkazib berish bepul. Undan past summalarda 30 000 so'm yetkazib berish narxi qo'shiladi." },
  { q: "Mahsulot sifatiga kafolat bormi?", a: "Ha, barcha mahsulotlarimiz original va sifat belgisi bor. Kafolat muddati mahsulotga qarab 6 oydan 2 yilgacha." },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#faf9f7", paddingTop: 96 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#f97316", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Yordam</p>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#1a1a18", marginBottom: 48 }}>
            Ko'p so'raladigan savollar
          </h1>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: "white",
                  borderRadius: 16,
                  border: `1px solid ${open === i ? "#f97316" : "#e8e6e0"}`,
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: "100%",
                    padding: "20px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a18" }}>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    color="#f97316"
                    style={{ flexShrink: 0, transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}
                  />
                </button>
                {open === i && (
                  <div style={{ padding: "0 24px 20px", fontSize: 15, color: "#3a3a34", lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
