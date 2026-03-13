"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const SLIDES = [
  {
    tag: "Yangi kolleksiya",
    title: "Moda va",
    accent: "Zamonaviylik",
    sub: "Eng yangi mahsulotlar sizni kutmoqda",
    bg: "#fdf3ea",
    dot: "#f97316",
  },
  {
    tag: "Maxsus taklif",
    title: "Chegirmali",
    accent: "Mahsulotlar",
    sub: "Tanlangan mahsulotlarda katta aksiya",
    bg: "#eef7ee",
    dot: "#22c55e",
  },
  {
    tag: "Premium sifat",
    title: "Sifat va",
    accent: "Ishonch",
    sub: "Har bir mahsulotda 100% kafolat",
    bg: "#eef3ff",
    dot: "#6366f1",
  },
];

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const slide = SLIDES[active];

  useEffect(() => {
    setVisible(true);
    const t = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      style={{
        minHeight: "100vh",
        background: slide.bg,
        transition: "background 0.8s ease",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dekorativ doiralar */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `${slide.dot}18`,
          transition: "background 0.8s",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          right: "20%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `${slide.dot}12`,
          transition: "background 0.8s",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "-5%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `${slide.dot}10`,
          transition: "background 0.8s",
        }}
      />

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "120px 24px 80px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 700 }}>
          {/* Tag */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 100,
              background: "white",
              border: `1px solid ${slide.dot}40`,
              marginBottom: 32,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s ease 0.1s",
            }}
          >
            <Sparkles size={15} color={slide.dot} />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: slide.dot,
                letterSpacing: "0.04em",
              }}
            >
              {slide.tag}
            </span>
          </div>

          {/* Sarlavha */}
          <h1
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(52px, 7vw, 96px)",
              fontWeight: 900,
              lineHeight: 1.05,
              color: "#1a1a18",
              letterSpacing: "-2px",
              marginBottom: 24,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.6s ease 0.2s",
            }}
          >
            {slide.title}
            <br />
            <span style={{ color: slide.dot, transition: "color 0.8s" }}>
              {slide.accent}
            </span>
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "#6b6b60",
              lineHeight: 1.7,
              maxWidth: 480,
              marginBottom: 48,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s ease 0.3s",
            }}
          >
            {slide.sub}
          </p>

          {/* CTA tugmalar */}
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              opacity: visible ? 1 : 0,
              transition: "all 0.6s ease 0.4s",
            }}
          >
            <Link
              href="/products"
              className="hero-btn-primary"
              style={{
                background: slide.dot,
                boxShadow: `0 8px 24px ${slide.dot}40`,
              }}
            >
              Xarid qilish <ArrowRight size={18} />
            </Link>
            <Link href="/products?has_discount=true" className="hero-btn-secondary">
              Aksiyalar
            </Link>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 10,
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: i === active ? 32 : 10,
              height: 10,
              borderRadius: 5,
              background: i === active ? slide.dot : "#d4d2cc",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </section>
  );
}
