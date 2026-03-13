import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#faf9f7", paddingTop: 96 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px 80px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#f97316", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Biz haqimizda</p>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "#1a1a18", lineHeight: 1.1, marginBottom: 32 }}>
            UzBox — O'zbekistoning onlayn do'koni
          </h1>

          <div style={{ fontSize: 16, color: "#3a3a34", lineHeight: 1.8 }}>
            <p style={{ marginBottom: 24 }}>
              UzBox — O'zbekistondagi eng qulay va ishonchli onlayn xarid platformasi. Biz mijozlarimizga eng sifatli mahsulotlarni eng qulay narxlarda yetkazib berishni maqsad qilganmiz.
            </p>
            <p style={{ marginBottom: 24 }}>
              Platformamizda elektronika, kiyim-kechak, uy-ro'zg'or buyumlari, sport anjomlari va boshqa yuzlab kategoriyalardagi mahsulotlarni topishingiz mumkin.
            </p>
            <p>
              Har bir buyurtma sinchiklab ishlov beriladi va belgilangan muddatda yetkazib beriladi.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 24, marginTop: 64 }}>
            {[
              { icon: "🚀", title: "Tez yetkazish", sub: "1–3 kun ichida" },
              { icon: "🔒", title: "Xavfsiz to'lov", sub: "Click va Payme" },
              { icon: "↩️", title: "Qaytarish", sub: "14 kun ichida" },
              { icon: "🎯", title: "Sifat kafolati", sub: "100% original" },
            ].map((item) => (
              <div key={item.title} style={{ background: "white", borderRadius: 20, border: "1px solid #e8e6e0", padding: "28px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, color: "#1a1a18", marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "#9a9a90" }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
