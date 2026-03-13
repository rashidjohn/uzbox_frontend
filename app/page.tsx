import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PromoBanner from "@/components/home/PromoBanner";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#faf9f7" }}>
      <Navbar />
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <PromoBanner />
      <Footer />
    </main>
  );
}
