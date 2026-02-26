import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Calendar, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export default function NewsSection() {
  const news = useQuery(api.news.getLatest);
  const isLoading = news === undefined;

  return (
    <section id="vesti" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex justify-between items-end mb-8 border-b border-[oklch(0.90_0.01_250)] pb-4">
        <div>
          <h3 className="text-3xl font-extrabold text-foreground uppercase tracking-tight">
            Najnovije{" "}
            <span className="text-[oklch(0.55_0.18_250)]">Vesti</span>
          </h3>
          <p className="text-muted-foreground mt-1">
            Sva aktuelna dešavanja iz kluba
          </p>
        </div>
        <button className="hidden sm:flex items-center text-[oklch(0.55_0.18_250)] font-semibold hover:text-[oklch(0.45_0.18_250)] transition-colors">
          Sve vesti <ArrowRight size={16} className="ml-1" />
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <Skeleton className="h-56 w-full" />
              <div className="p-6 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            Još nema objavljenih vesti. Pratite nas za najnovije informacije.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <article
              key={item._id}
              className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-border"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[oklch(0.55_0.18_250)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-md">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-2 flex items-center">
                  <Calendar size={14} className="mr-1" /> {item.date}
                </p>
                <h4 className="text-xl font-bold text-card-foreground mb-3 leading-tight group-hover:text-[oklch(0.55_0.18_250)] transition-colors">
                  {item.title}
                </h4>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {item.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
