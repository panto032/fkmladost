import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ArrowLeft, MapPin, Users, CalendarDays, Lightbulb, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";

/* ─── Key facts displayed as cards ─── */
const KEY_FACTS = [
  {
    icon: <Users size={22} />,
    label: "Kapacitet",
    value: "~6.000",
    detail: "sedećih mesta",
  },
  {
    icon: <MapPin size={22} />,
    label: "Lokacija",
    value: "Lučani",
    detail: "kraj reke Bjelice",
  },
  {
    icon: <Lightbulb size={22} />,
    label: "Reflektori",
    value: "2015.",
    detail: "moderni LED reflektori",
  },
  {
    icon: <Leaf size={22} />,
    label: "Hibridna trava",
    value: "2024.",
    detail: "najmodernija podloga",
  },
  {
    icon: <CalendarDays size={22} />,
    label: "Evropa",
    value: "1996 / 2017",
    detail: "Intertoto kup / Liga Evrope",
  },
];

/* ─── Image slots — will be replaced with actual photos ─── */
const STADIUM_IMAGES = {
  hero: "https://cdn.hercules.app/file_UVSxHaKsO3WH89Qs3kT4kGB5" as string | null,
  aerial: "https://cdn.hercules.app/file_sTktNFhLtjEJYGRp7SnFFfIr" as string | null,
  interior: "https://cdn.hercules.app/file_nV8TXSb6b3k7ZPORfG5TUC4w" as string | null,
  pitch: null as string | null,
};

function ImageSlot({ label }: { label: string }) {
  return (
    <div className="w-full aspect-video rounded-xl bg-[oklch(0.18_0.04_252)] border border-[oklch(0.28_0.04_252)] flex items-center justify-center">
      <div className="text-center p-6">
        <MapPin size={32} className="text-[oklch(0.35_0.04_252)] mx-auto mb-2" />
        <p className="text-[oklch(0.40_0.03_252)] text-sm">{label}</p>
      </div>
    </div>
  );
}

export default function StadionPage() {
  const page = useQuery(api.pages.getBySlug, { slug: "stadion" });
  const isLoading = page === undefined;

  return (
    <div className="min-h-screen bg-[oklch(0.13_0.03_252)] font-sans text-foreground">
      <Header />

      {/* Hero — dramatic, stadium atmosphere */}
      <section className="relative text-white pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-[oklch(0.10_0.03_252)]" />
        {/* Diagonal accent line */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[oklch(0.69_0.095_228)]/5 to-transparent skew-x-[-12deg] translate-x-1/4" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <Link
            to="/"
            className="inline-flex items-center text-[oklch(0.69_0.07_228)] hover:text-white text-sm font-medium transition-colors mb-8"
          >
            <ArrowLeft size={16} className="mr-1" /> Nazad na početnu
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — text */}
            <div>
              <span className="text-[oklch(0.69_0.095_228)] text-xs font-bold uppercase tracking-[0.2em] block mb-4">
                SRC "mr Radoš Milovanović"
              </span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.9]">
                Tvrđava u srcu{" "}
                <span className="text-[oklch(0.77_0.10_225)]">Dragačeva</span>
              </h1>
              <p className="text-lg text-[oklch(0.55_0.04_228)] max-w-lg mt-6 leading-relaxed">
                Stadion u Lučanima — sportski hram gde su padali i najveći beogradski
                klubovi. Sa kapacitetom od 6.000 sedećih mesta, dom FK Mladost od
                1952. godine.
              </p>
            </div>

            {/* Right — hero image slot */}
            <div>
              {STADIUM_IMAGES.hero ? (
                <img
                  src={STADIUM_IMAGES.hero}
                  alt="Stadion FK Mladost"
                  className="w-full rounded-2xl border border-[oklch(0.28_0.04_252)] shadow-2xl"
                />
              ) : (
                <ImageSlot label="Glavna fotografija stadiona" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Key facts strip */}
      <section className="bg-[oklch(0.16_0.035_252)] border-y border-[oklch(0.24_0.04_252)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {KEY_FACTS.map((fact) => (
              <div
                key={fact.label}
                className="bg-[oklch(0.20_0.04_252)] rounded-xl p-4 border border-[oklch(0.28_0.04_252)] text-center"
              >
                <div className="text-[oklch(0.69_0.095_228)] flex justify-center mb-2">
                  {fact.icon}
                </div>
                <p className="text-white font-black text-xl">{fact.value}</p>
                <p className="text-[oklch(0.50_0.03_252)] text-[11px] font-medium uppercase tracking-wider mt-0.5">
                  {fact.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content from DB */}
      <section className="bg-[oklch(0.13_0.03_252)] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : page ? (
            <div className="space-y-16">
              {/* Parse sections from content */}
              <StadionContent html={page.content} />
            </div>
          ) : (
            <p className="text-[oklch(0.50_0.03_252)] text-center py-12">
              Sadržaj još nije dodat.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ─── Render rich content with custom section styling ─── */
function StadionContent({ html }: { html: string }) {
  // Split by <section> tags to render each section with unique styling
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const sections = doc.querySelectorAll("section[data-section]");

  if (sections.length === 0) {
    // Fallback: render as plain prose
    return <div className="prose-page" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const sectionElements: React.ReactNode[] = [];

  sections.forEach((section) => {
    const sectionId = section.getAttribute("data-section");
    const innerHtml = section.innerHTML;

    sectionElements.push(
      <div key={sectionId} className="relative">
        {/* Accent left bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-[oklch(0.69_0.095_228)] to-[oklch(0.69_0.095_228)]/20" />
        <div className="pl-8">
          <div className="prose-page" dangerouslySetInnerHTML={{ __html: innerHtml }} />
        </div>

        {/* Image slot after specific sections */}
        {sectionId === "about" && (
          <div className="pl-8 mt-6">
            {STADIUM_IMAGES.aerial ? (
              <img src={STADIUM_IMAGES.aerial} alt="Stadion iz vazduha" className="w-full rounded-xl border border-[oklch(0.28_0.04_252)]" />
            ) : (
              <ImageSlot label="Fotografija stadiona" />
            )}
          </div>
        )}
        {sectionId === "history" && (
          <div className="pl-8 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {STADIUM_IMAGES.interior ? (
              <img src={STADIUM_IMAGES.interior} alt="Tribine stadiona" className="w-full rounded-xl border border-[oklch(0.28_0.04_252)]" />
            ) : (
              <ImageSlot label="Fotografija tribina / reflektora" />
            )}
            {STADIUM_IMAGES.pitch ? (
              <img src={STADIUM_IMAGES.pitch} alt="Teren stadiona" className="w-full rounded-xl border border-[oklch(0.28_0.04_252)]" />
            ) : (
              <ImageSlot label="Fotografija terena / hibridne trave" />
            )}
          </div>
        )}
      </div>,
    );
  });

  return <>{sectionElements}</>;
}
