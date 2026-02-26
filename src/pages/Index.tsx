import Header from "./home/_components/Header.tsx";
import HeroSection from "./home/_components/HeroSection.tsx";
import MatchWidgets from "./home/_components/MatchWidgets.tsx";
import BentoGridSection from "./home/_components/BentoGridSection.tsx";
import TeamSection from "./home/_components/TeamSection.tsx";
import SponsorsBottomSection from "./home/_components/SponsorsBottomSection.tsx";
import Footer from "./home/_components/Footer.tsx";

export default function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <HeroSection />
      <MatchWidgets />
      <BentoGridSection />
      <TeamSection />
      <SponsorsBottomSection />
      <Footer />
    </div>
  );
}
