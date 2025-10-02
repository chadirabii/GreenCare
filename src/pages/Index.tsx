import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Showcase from "@/components/Showcase";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Showcase />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default Index;
