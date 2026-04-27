"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import Navbar     from "@/components/Navbar";
import Hero       from "@/components/Hero";
import SocialProof from "@/components/SocialProof";
import Features   from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Pricing    from "@/components/Pricing";
import CtaBanner  from "@/components/CtaBanner";
import Footer     from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative bg-black min-h-screen">
      {/* Fixed mesh gradient behind everything */}
      <div className="fixed inset-0 z-0">
        <MeshGradient
          className="w-full h-full"
          colors={["#000000", "#06b6d4", "#0891b2", "#164e63", "#f97316"]}
          speed={0.2}
        />
        {/* Dark overlay so content is readable */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Page content */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <Pricing />
        <CtaBanner />
        <Footer />
      </div>
    </div>
  );
}
