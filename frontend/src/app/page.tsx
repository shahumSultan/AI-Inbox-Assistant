import Navbar    from "@/components/Navbar";
import Hero       from "@/components/Hero";
import SocialProof from "@/components/SocialProof";
import Features   from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Pricing    from "@/components/Pricing";
import CtaBanner  from "@/components/CtaBanner";
import Footer     from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Pricing />
      <CtaBanner />
      <Footer />
    </>
  );
}
