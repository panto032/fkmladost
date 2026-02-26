import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Newspaper } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty.tsx";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";
import NewsCard from "./_components/NewsCard.tsx";

export default function VestiPage() {
  const news = useQuery(api.news.getPublished);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Page header */}
      <div className="pt-20">
        <div className="bg-[oklch(0.22_0.045_252)] text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Newspaper size={20} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
                Vesti
              </h1>
            </div>
            <p className="text-white/60 text-sm max-w-lg">
              Najnovije vesti i dešavanja iz FK Mladost Lučani
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {news === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Newspaper />
              </EmptyMedia>
              <EmptyTitle>Nema objavljenih vesti</EmptyTitle>
              <EmptyDescription>
                Vesti će se pojaviti ovde čim budu objavljene
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            {/* Featured article */}
            <NewsCard article={news[0]} featured />

            {/* Rest of the articles */}
            {news.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {news.slice(1).map((article) => (
                  <NewsCard key={article._id} article={article} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
