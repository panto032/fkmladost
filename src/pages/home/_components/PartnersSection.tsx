import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export default function PartnersSection() {
  const partners = useQuery(api.partners.getAll);
  const isLoading = partners === undefined;

  return (
    <div className="lg:col-span-5 flex flex-col gap-4">
      <div className="mb-2">
        <h3 className="text-3xl font-extrabold text-foreground uppercase tracking-tight">
          Klub &{" "}
          <span className="text-[oklch(0.55_0.18_250)]">Partneri</span>
        </h3>
        <p className="text-muted-foreground mt-1">
          Podrška koja nas gura napred
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="rounded-3xl h-20" />
          ))}
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-card rounded-3xl p-8 border border-border text-center">
          <p className="text-muted-foreground">Partneri će uskoro biti prikazani</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {partners.map((p, index) => {
            if (index === 0)
              return (
                <div
                  key={p._id}
                  className="col-span-2 bg-gradient-to-br from-[oklch(0.22_0.06_250)] to-[oklch(0.25_0.07_250)] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer border border-[oklch(0.30_0.06_250)]"
                >
                  <span className="text-[oklch(0.65_0.12_250)] text-xs font-bold uppercase tracking-wider mb-2 block">
                    {p.level}
                  </span>
                  <div className="h-24 flex items-center justify-center bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 mt-3 group-hover:bg-white/20 transition-colors">
                    <span className="text-3xl font-black tracking-tighter">
                      {p.name}
                    </span>
                  </div>
                </div>
              );
            if (index === 1 || index === 2)
              return (
                <div
                  key={p._id}
                  className="col-span-1 bg-card rounded-3xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow flex flex-col justify-center cursor-pointer group"
                >
                  <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-2 block">
                    {p.level}
                  </span>
                  <div className="h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="text-lg font-black text-center text-[oklch(0.22_0.06_250)] leading-tight">
                      {p.name}
                    </span>
                  </div>
                </div>
              );
            return (
              <div
                key={p._id}
                className="col-span-2 bg-[oklch(0.18_0.02_250)] text-white rounded-3xl p-6 shadow-lg flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <span className="text-[oklch(0.50_0.03_250)] text-[10px] font-bold uppercase tracking-wider mb-1 block">
                    {p.level}
                  </span>
                  <span className="font-bold text-xl tracking-tight">
                    {p.name}
                  </span>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-[oklch(0.55_0.18_250)] transition-all transform group-hover:rotate-45">
                  <ArrowRight size={20} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
