import Image from "next/image";
import Navbar from "./components/home/navbar";
import Hero from "./components/home/hero";
import CategoriesSection from "./components/home/categoriesSection";
import TrendingSection from "./components/home/trendingSection";
import TrustedCompanies from "./components/home/trustedCompanies";
import WhyDifferentSection from "./components/home/whyDifferentSection";
import Footer from "./components/home/footer";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Navbar />
      <Hero />
      <CategoriesSection />
      <TrendingSection />
      <TrustedCompanies />
      <WhyDifferentSection />
      <Footer />
    </div>
  );
}
