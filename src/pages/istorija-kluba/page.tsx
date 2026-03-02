import { useQuery } from "@tanstack/react-query";
import { pagesApi } from "@/lib/api.ts";
import { ArrowLeft, Landmark } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";

export default function IstorijaKluba() {
  const { data: page, isLoading } = useQuery({
    queryKey: ["page", "istorija-kluba"],
    queryFn: () => pagesApi.getBySlug("istorija-kluba"),
  });

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Hero banner — vintage / editorial style */}
      <section className="relative text-white pt-20 overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 bg-[oklch(0.16_0.035_252)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[oklch(0.13_0.03_252)] to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <Link
            to="/"
            className="inline-flex items-center text-[oklch(0.69_0.07_228)] hover:text-white text-sm font-medium transition-colors mb-8"
          >
            <ArrowLeft size={16} className="mr-1" /> Nazad na početnu
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[oklch(0.69_0.095_228)]/10 border border-[oklch(0.69_0.095_228)]/20 flex items-center justify-center">
              <Landmark size={28} className="text-[oklch(0.69_0.095_228)]" />
            </div>
            <div>
              <span className="text-[oklch(0.69_0.095_228)] text-xs font-bold uppercase tracking-[0.2em]">
                Od 1952. godine
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase text-balance leading-[0.9]">
            Istorija{" "}
            <span className="text-[oklch(0.77_0.10_225)]">Kluba</span>
          </h1>
          <p className="text-lg md:text-xl text-[oklch(0.55_0.04_228)] max-w-2xl mt-6 leading-relaxed">
            Više od sedam decenija tradicije, borbe i ljubavi prema fudbalu u srcu
            Dragačeva.
          </p>

          {/* Decorative year markers */}
          <div className="flex items-center gap-4 mt-10 text-sm font-mono text-[oklch(0.40_0.03_252)]">
            <span className="px-3 py-1 rounded-full border border-[oklch(0.30_0.04_252)]">1952</span>
            <div className="h-px flex-1 bg-gradient-to-r from-[oklch(0.30_0.04_252)] to-transparent" />
            <span className="px-3 py-1 rounded-full border border-[oklch(0.30_0.04_252)]">1992</span>
            <div className="h-px flex-1 bg-gradient-to-r from-[oklch(0.30_0.04_252)] to-transparent" />
            <span className="px-3 py-1 rounded-full border border-[oklch(0.69_0.095_228)]/30 text-[oklch(0.69_0.095_228)]">
              {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-[oklch(0.13_0.03_252)] pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Decorative top border */}
          <div className="h-1 w-24 bg-[oklch(0.69_0.095_228)] rounded-full mb-12" />

          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : page ? (
            <div
              className="prose-page prose-page-editorial"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
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
