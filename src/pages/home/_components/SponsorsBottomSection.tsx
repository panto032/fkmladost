import { useQuery } from "@tanstack/react-query";
import { partnersApi } from "@/lib/api.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export default function SponsorsBottomSection() {
  const { data: partners, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: () => partnersApi.get(),
  });

  if (isLoading) {
    return (
      <section className="bg-card py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-64 mx-auto mb-8" />
          <div className="flex justify-center gap-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-36 h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Only show partners that have a logoUrl
  const withLogos = partners?.filter((p) => p.logoUrl) ?? [];
  if (withLogos.length === 0) return null;

  return (
    <section className="bg-card py-14 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest mb-10">
          Prijatelji Kluba i Sponzori
        </p>
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 lg:gap-20">
          {withLogos.map((sponsor) => (
            <div
              key={sponsor.id}
              className="group relative"
            >
              {/* Glow effect on hover */}
              <div className="absolute -inset-4 rounded-2xl bg-[oklch(0.55_0.18_250)]/0 group-hover:bg-[oklch(0.55_0.18_250)]/8 blur-xl transition-all duration-500" />
              <img
                src={sponsor.logoUrl}
                alt={sponsor.name}
                className="relative h-16 md:h-24 w-auto max-w-[200px] md:max-w-[280px] object-contain opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
