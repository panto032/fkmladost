import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import Header from "../../home/_components/Header.tsx";
import Footer from "../../home/_components/Footer.tsx";

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const article = useQuery(
    api.news.getById,
    id ? { id: id as Id<"news"> } : "skip",
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="pt-20">
        {article === undefined ? (
          <ArticleSkeleton />
        ) : article === null ? (
          <ArticleNotFound />
        ) : (
          <>
            {/* Hero image */}
            <div className="relative w-full h-[300px] sm:h-[420px] lg:h-[500px]">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                  <span className="bg-accent text-accent-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-md">
                    {article.category}
                  </span>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-3 leading-tight">
                    {article.title}
                  </h1>
                  <div className="flex items-center gap-4 text-white/50 text-sm mt-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} /> {article.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Tag size={14} /> {article.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Article body */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <Link
                to="/vesti"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft size={16} /> Nazad na vesti
              </Link>

              {/* Excerpt */}
              <p className="text-lg font-semibold text-foreground/80 leading-relaxed mb-8 border-l-4 border-accent pl-4">
                {article.excerpt}
              </p>

              {/* Content — render paragraphs */}
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {article.content.split("\n").map((paragraph, i) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;
                  return (
                    <p key={i} className="text-foreground/80 leading-relaxed mb-5">
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <>
      <Skeleton className="w-full h-[420px]" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-40 w-full mt-8" />
      </div>
    </>
  );
}

function ArticleNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">Vest nije pronađena</h2>
      <p className="text-muted-foreground mb-6">
        Ovaj članak ne postoji ili je uklonjen.
      </p>
      <Link
        to="/vesti"
        className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
      >
        <ArrowLeft size={16} /> Nazad na vesti
      </Link>
    </div>
  );
}
