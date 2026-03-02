import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { newsApi } from "@/lib/api.ts";
import { Newspaper, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";
import NewsCard from "./_components/NewsCard.tsx";

const PAGE_SIZE = 9;

export default function VestiPage() {
  const [offset, setOffset] = useState(0);
  const [allItems, setAllItems] = useState<Awaited<ReturnType<typeof newsApi.getAll>>["items"]>([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["news", "list", offset],
    queryFn: async () => {
      const result = await newsApi.getAll({ limit: PAGE_SIZE, offset });
      if (offset === 0) {
        setAllItems(result.items);
      } else {
        setAllItems((prev) => [...prev, ...result.items]);
      }
      return result;
    },
  });

  const total = data?.total ?? 0;
  const canLoadMore = allItems.length < total;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="pt-20">
        <div className="bg-[oklch(0.22_0.045_252)] text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Newspaper size={20} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">Vesti</h1>
            </div>
            <p className="text-white/60 text-sm max-w-lg">Najnovije vesti i dešavanja iz FK Mladost Lučani</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading && offset === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : allItems.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><Newspaper /></EmptyMedia>
              <EmptyTitle>Nema objavljenih vesti</EmptyTitle>
              <EmptyDescription>Vesti će se pojaviti ovde čim budu objavljene</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <NewsCard article={allItems[0]} featured />
            {allItems.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {allItems.slice(1).map((article) => <NewsCard key={article.id} article={article} />)}
              </div>
            )}
            {canLoadMore && (
              <div className="flex justify-center mt-12">
                <Button variant="secondary" size="lg" className="gap-2" disabled={isFetching}
                  onClick={() => setOffset((prev) => prev + PAGE_SIZE)}>
                  <ChevronDown size={18} />
                  {isFetching ? "Učitavanje..." : "Učitaj još vesti"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
