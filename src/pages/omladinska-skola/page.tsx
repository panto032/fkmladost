import { useQuery } from "@tanstack/react-query";
import { pagesApi } from "@/lib/api.ts";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";

export default function OmladinskaSkola() {
  const { data: page, isLoading } = useQuery({
    queryKey: ["page", "omladinska-skola"],
    queryFn: () => pagesApi.getBySlug("omladinska-skola"),
  });

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Hero banner */}
      <section className="relative bg-[oklch(0.16_0.035_252)] text-white pt-16 pb-12 md:pt-24 md:pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.22_0.045_252)] to-[oklch(0.16_0.035_252)]" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[oklch(0.69_0.095_228)]/5 blur-[120px] -translate-y-1/2 translate-x-1/4" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-[oklch(0.69_0.07_228)] hover:text-white text-sm font-medium transition-colors mb-6"
          >
            <ArrowLeft size={16} className="mr-1" /> Nazad na početnu
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[oklch(0.69_0.095_228)]/15 flex items-center justify-center">
              <GraduationCap size={24} className="text-[oklch(0.69_0.095_228)]" />
            </div>
            <span className="text-[oklch(0.69_0.095_228)] text-sm font-bold uppercase tracking-widest">
              Istorija
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight uppercase text-balance">
            Omladinski{" "}
            <span className="text-[oklch(0.77_0.10_225)]">Pogon</span>
          </h2>
          <p className="text-lg text-[oklch(0.55_0.04_228)] max-w-2xl mt-4 leading-relaxed">
            {'Od 1962. godine, omladinska škola FK "Mladost" je rasadnik talenata koji su obeležili istoriju kluba i srpskog fudbala.'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-[oklch(0.16_0.035_252)] pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : page ? (
            <div
              className="prose-page"
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
