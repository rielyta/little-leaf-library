import { About } from "@/components/landing/About";
import { CallToAction } from "@/components/landing/CallToAction";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ReadingFeatures } from "@/components/landing/ReadingFeatures";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <About />
        <ReadingFeatures />
        <HowItWorks />
        <CallToAction />
      </main>
      <SiteFooter />
    </>
  );
}