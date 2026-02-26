import Header from "./home/_components/Header.tsx";
import HeroSection from "./home/_components/HeroSection.tsx";
import MatchWidgets from "./home/_components/MatchWidgets.tsx";
import NewsSection from "./home/_components/NewsSection.tsx";
import PartnersSection from "./home/_components/PartnersSection.tsx";
import StandingsSection from "./home/_components/StandingsSection.tsx";
import TeamSection from "./home/_components/TeamSection.tsx";
import SponsorsBottomSection from "./home/_components/SponsorsBottomSection.tsx";
import Footer from "./home/_components/Footer.tsx";

export default function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <HeroSection />
      <MatchWidgets />
      <NewsSection />

      {/* Partners & Standings */}
      <section
        id="partneri"
        className="bg-muted py-16 border-t border-border shadow-inner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <PartnersSection />
            <StandingsSection />
          </div>
        </div>
      </section>

      {/* Prvi Tim */}
      <TeamSection />

      {/* Sponzori i Prijatelji */}
      <SponsorsBottomSection />

      <Footer />
    </div>
  );
}
