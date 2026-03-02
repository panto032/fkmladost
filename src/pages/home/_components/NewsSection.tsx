import { useQuery } from "@tanstack/react-query";
import { newsApi } from "@/lib/api.ts";
import { Calendar, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Link } from "react-router-dom";
import { apiBaseUrl } from "@/lib/api.ts";

function getImageSrc(imageUrl: string, imageFileName?: string | null): string {
  if (imageFileName) return `${apiBaseUrl}/uploads/${imageFileName}`;
  return imageUrl;
}

export default function NewsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["news", "latest"],
    queryFn: () => newsApi.getLatest(6),
  });

  const news = data?.items ?? [];

  return (
    <section id="vesti" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex justify-between items-end mb-8 border-b border-border pb-4">
        <div>
          <h3 className="text-3xl font-extrabold text-foreground uppercase tracking-tight">
            Najnovije <span className="text-accent">Vesti</span>
          </h3>
          <p className="text-muted-foreground mt-1">Sva aktuelna dešavanja iz kluba</p>
        </div>
        <Link to="/vesti" className="hidden sm:flex items-center text-accent font-semibold hover:text-accent/80 transition-colors">
          Sve vesti <ArrowRight size={16} className="ml-1" />
        </Link>
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
          <p className="text-muted-foreground text-lg">Još nema objavljenih vesti.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <Link
              key={item.id}
              to={`/vesti/${item.id}`}
              className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-border"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={getImageSrc(item.imageUrl, item.imageFileName)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full uppercase shadow-md">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-2 flex items-center">
                  <Calendar size={14} className="mr-1" /> {item.date}
                </p>
                <h4 className="text-xl font-bold text-card-foreground mb-3 leading-tight group-hover:text-accent transition-colors">
                  {item.title}
                </h4>
                <p className="text-muted-foreground text-sm line-clamp-2">{item.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
