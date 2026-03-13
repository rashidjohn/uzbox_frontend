import Link from "next/link";

const FOOTER_LINKS = [
  {
    title: "Do'kon",
    links: [
      { label: "Mahsulotlar", href: "/products" },
      { label: "Qidiruv", href: "/search" },
      { label: "Sevimlilar", href: "/wishlist" },
    ],
  },
  {
    title: "Yordam",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Aloqa", href: "/contact" },
      { label: "Buyurtmalarim", href: "/profile" },
    ],
  },
  {
    title: "Kompaniya",
    links: [
      { label: "Biz haqimizda", href: "/about" },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ background: "#1a1a18", color: "#a8a89e", marginTop: 120 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px 40px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 48,
            marginBottom: 64,
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: 28,
                fontWeight: 800,
                color: "white",
                marginBottom: 16,
              }}
            >
              Uz<span style={{ color: "#f97316" }}>Box</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#6b6b60" }}>
              O'zbekistondagi eng sifatli mahsulotlar bir joyda.
            </p>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map(({ title, links }) => (
            <div key={title}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "white",
                  marginBottom: 20,
                }}
              >
                {title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {links.map(({ label, href }) => (
                  <Link key={href} href={href} className="footer-link">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div
          style={{
            borderTop: "1px solid #2a2a28",
            paddingTop: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <span style={{ fontSize: 13, color: "#4a4a44" }}>
            © {new Date().getFullYear()} UzBox. Barcha huquqlar himoyalangan.
          </span>
          <div style={{ display: "flex", gap: 12 }}>
            {["Click", "Payme", "Uzcard"].map((p) => (
              <span
                key={p}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid #2a2a28",
                  color: "#6b6b60",
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
