import HeroSection from "@/components/landing/hero/hero_section";
import { Header } from "@/components/ui/navbar";

export const runtime = 'edge'

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
    </>
  );
}
