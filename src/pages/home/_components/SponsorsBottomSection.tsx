import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export default function SponsorsBottomSection() {
  const partners = useQuery(api.partners.getAll);
  const isLoading = partners === undefined;

  if (isLoading) {
    return (
      <section className="bg-card py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-64 mx-auto mb-8" />
          <div className="flex flex-wrap justify-center gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-32 h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!partners || partners.length === 0) return null;

  return (
    <section className="bg-card py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8">
          Prijatelji Kluba i Sponzori
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
          {partners.map((sponsor) => (
            <div
              key={sponsor._id}
              className="w-32 h-16 md:w-48 md:h-20 bg-muted rounded-lg border border-border flex flex-col items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:border-[oklch(0.55_0.18_250)] hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              {sponsor.logoUrl ? (
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  className="max-h-10 max-w-[80%] object-contain"
                />
              ) : (
                <>
                  <span className="font-black text-foreground text-lg md:text-xl uppercase tracking-tighter">
                    {sponsor.name.split(" ")[0]}
                  </span>
                  <span className="text-[10px] text-[oklch(0.55_0.18_250)] font-semibold uppercase">
                    {sponsor.level}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
