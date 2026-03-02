import { useQuery } from "@tanstack/react-query";
import { playersApi } from "@/lib/api.ts";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useRef } from "react";
import { Link } from "react-router-dom";

export default function TeamSection() {
  const { data: players, isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: () => playersApi.get(),
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <section className="bg-[oklch(0.16_0.035_252)] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-48 mb-8 bg-white/10" />
          <div className="flex gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-96 w-72 flex-shrink-0 rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!players || players.length === 0) return null;

  return (
    <section className="bg-[oklch(0.16_0.035_252)] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b border-[oklch(0.26_0.04_252)] pb-4">
          <div>
            <h3 className="text-3xl font-extrabold uppercase tracking-tight">
              Prvi <span className="text-[oklch(0.77_0.10_225)]">Tim</span>
            </h3>
            <p className="text-[oklch(0.50_0.03_252)] mt-1">Sezona 2025/2026</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Scroll arrows */}
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full bg-[oklch(0.22_0.045_252)] flex items-center justify-center hover:bg-[oklch(0.69_0.095_228)] transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-[oklch(0.22_0.045_252)] flex items-center justify-center hover:bg-[oklch(0.69_0.095_228)] transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <Link
              to="/prvi-tim"
              className="hidden sm:flex items-center text-[oklch(0.77_0.10_225)] font-semibold hover:text-white transition-colors ml-2"
            >
              Prikaži ceo roster <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>

        {/* Scrollable players */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {players.map((player) => (
            <Link
              to="/prvi-tim"
              key={player.id}
              className="group cursor-pointer flex-shrink-0 w-64 md:w-72"
            >
              <div className="relative overflow-hidden rounded-t-xl bg-[oklch(0.20_0.04_252)] aspect-[3/4]">
                <img
                  src={player.imageUrl}
                  alt={player.name}
                  className="w-full h-full object-cover group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 grayscale group-hover:grayscale-0"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0.035_252)] via-transparent to-transparent opacity-80" />

                {/* Number Badge */}
                <div className="absolute bottom-0 right-0 bg-[oklch(0.69_0.095_228)] text-white font-black text-2xl md:text-4xl p-2 md:p-3 rounded-tl-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  {player.number}
                </div>
              </div>
              <div className="bg-[oklch(0.20_0.04_252)] p-4 rounded-b-xl border-t-2 border-[oklch(0.69_0.095_228)] group-hover:bg-[oklch(0.22_0.045_252)] transition-colors">
                <h5 className="font-bold text-lg md:text-xl truncate">{player.name}</h5>
                <p className="text-[oklch(0.77_0.10_225)] text-sm">{player.position}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/prvi-tim"
            className="inline-flex items-center text-[oklch(0.77_0.10_225)] font-semibold hover:text-white transition-colors"
          >
            Prikaži ceo roster <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
