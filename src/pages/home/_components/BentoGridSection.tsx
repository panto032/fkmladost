import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  Calendar,
  ArrowRight,
  Newspaper,
  Handshake,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import StandingsTable from "./StandingsTable.tsx";

/* ─────────────────── Small News Card (reusable) ─────────────────── */

function SmallNewsCard({
  article,
  className = "",
}: {
  article: {
    _id: string;
    title: string;
    category: string;
    date: string;
    resolvedImageUrl?: string | null;
  };
  className?: string;
}) {
  return (
    <Link
      to={`/vesti/${article._id}`}
      className={`rounded-2xl overflow-hidden border border-border shadow-lg group cursor-pointer bg-card flex flex-col ${className}`}
    >
      <div className="relative h-36 overflow-hidden flex-shrink-0">
        {article.resolvedImageUrl && (
          <img
            src={article.resolvedImageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            {article.category}
          </span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h4 className="text-sm font-bold text-card-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {article.title}
        </h4>
        <p className="text-muted-foreground text-[11px] mt-2 flex items-center">
          <Calendar size={10} className="mr-1" /> {article.date}
        </p>
      </div>
    </Link>
  );
}

/* ─────────────────────────── Main Component ─────────────────────────── */

export default function BentoGridSection() {
  const news = useQuery(api.news.getLatest);
  const standings = useQuery(api.standings.getAll);
  const partners = useQuery(api.partners.getAll);

  const isLoading =
    news === undefined ||
    standings === undefined ||
    partners === undefined;

  if (isLoading) {
    return <BentoSkeleton />;
  }

  const featuredNews = news.length > 0 ? news[0] : null;
  const row2News = news.slice(1, 3); // 2 items for row 2
  const row3News = news.slice(3, 6); // up to 3 items for row 3

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Grid — 12 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ── CELL: STANDINGS TABLE ─────────────────────── col 1-4, row 1-2 */}
        <div className="lg:col-start-1 lg:col-end-5 lg:row-start-1 lg:row-end-3">
          <StandingsTable standings={standings} />
        </div>

        {/* ── CELL: FEATURED NEWS ───────────────────────── col 5-12, row 1 */}
        {featuredNews ? (
          <Link
            to={`/vesti/${featuredNews._id}`}
            className="lg:col-start-5 lg:col-end-13 lg:row-start-1 lg:row-end-2 rounded-2xl overflow-hidden border border-border shadow-lg relative group cursor-pointer min-h-[280px] lg:min-h-0"
          >
            <img
              src={featuredNews.resolvedImageUrl}
              alt={featuredNews.title}
              className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Newspaper size={14} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                Najnovije Vesti
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-md">
                {featuredNews.category}
              </span>
              <h4 className="text-xl sm:text-2xl font-bold text-white mt-3 leading-tight line-clamp-2">
                {featuredNews.title}
              </h4>
              <p className="text-white/60 text-sm mt-2 line-clamp-2 hidden sm:block">
                {featuredNews.excerpt}
              </p>
              <div className="flex items-center text-white/45 text-xs mt-3">
                <Calendar size={11} className="mr-1" /> {featuredNews.date}
              </div>
            </div>
          </Link>
        ) : (
          <div className="lg:col-start-5 lg:col-end-13 lg:row-start-1 lg:row-end-2 rounded-2xl bg-card border border-border shadow-lg min-h-[280px] flex items-center justify-center">
            <p className="text-muted-foreground">Nema objavljenih vesti</p>
          </div>
        )}

        {/* ── CELL: NEWS 2 ──────────────────────────────── col 5-8, row 2 */}
        {row2News.length > 0 ? (
          <SmallNewsCard
            article={row2News[0]}
            className="lg:col-start-5 lg:col-end-9 lg:row-start-2 lg:row-end-3"
          />
        ) : (
          <div className="lg:col-start-5 lg:col-end-9 lg:row-start-2 lg:row-end-3 rounded-2xl bg-card border border-border shadow-lg flex items-center justify-center p-6">
            <p className="text-muted-foreground text-sm">Još vesti uskoro</p>
          </div>
        )}

        {/* ── CELL: NEWS 3 ──────────────────────────────── col 9-12, row 2 */}
        {row2News.length > 1 ? (
          <SmallNewsCard
            article={row2News[1]}
            className="lg:col-start-9 lg:col-end-13 lg:row-start-2 lg:row-end-3"
          />
        ) : (
          <div className="lg:col-start-9 lg:col-end-13 lg:row-start-2 lg:row-end-3 rounded-2xl bg-card border border-border shadow-lg flex items-center justify-center p-6">
            <p className="text-muted-foreground text-sm">Još vesti uskoro</p>
          </div>
        )}

        {/* ── ROW 3: NEWS 4, 5, 6 ─────────────────────── col 1-12, row 3 */}
        {row3News.length >= 1 && (
          <SmallNewsCard
            article={row3News[0]}
            className="lg:col-start-1 lg:col-end-5 lg:row-start-3 lg:row-end-4"
          />
        )}
        {row3News.length >= 2 && (
          <SmallNewsCard
            article={row3News[1]}
            className="lg:col-start-5 lg:col-end-9 lg:row-start-3 lg:row-end-4"
          />
        )}
        {row3News.length >= 3 ? (
          <SmallNewsCard
            article={row3News[2]}
            className="lg:col-start-9 lg:col-end-13 lg:row-start-3 lg:row-end-4"
          />
        ) : (
          /* "Sve vesti" CTA fills the remaining row 3 space */
          <Link
            to="/vesti"
            className={`${row3News.length === 0 ? "lg:col-span-12" : row3News.length === 1 ? "lg:col-start-5 lg:col-end-13" : "lg:col-start-9 lg:col-end-13"} lg:row-start-3 lg:row-end-4 rounded-2xl bg-gradient-to-br from-[oklch(0.50_0.12_240)] to-[oklch(0.40_0.10_245)] border border-[oklch(0.55_0.10_238)] shadow-lg flex flex-col items-center justify-center p-6 text-white text-center cursor-pointer group`}
          >
            <Newspaper
              size={28}
              className="text-white/60 mb-2 group-hover:scale-110 transition-transform"
            />
            <h4 className="font-bold text-base">Sve Vesti</h4>
            <p className="text-white/60 text-xs mt-1">Pogledaj arhivu</p>
            <ArrowRight
              size={18}
              className="mt-3 text-white/70 group-hover:translate-x-1 transition-transform"
            />
          </Link>
        )}

        {/* ── CELL: PARTNERI & SPONZORI ─────────────────── full width, row 4 */}
        <div className="lg:col-span-12 rounded-2xl bg-gradient-to-br from-[oklch(0.22_0.045_252)] to-[oklch(0.18_0.04_252)] border border-[oklch(0.30_0.045_252)] shadow-lg p-5 text-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Handshake size={16} className="text-[oklch(0.69_0.07_228)]" />
              </div>
              <h3 className="text-base font-extrabold uppercase tracking-tight">
                Partneri & Sponzori
              </h3>
            </div>
          </div>

          {/* Partner items */}
          {partners.length === 0 ? (
            <div className="flex items-center justify-center py-6">
              <p className="text-[oklch(0.50_0.03_252)] text-sm">
                Partneri uskoro
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {partners.map((p, i) =>
                i === 0 ? (
                  <div
                    key={p._id}
                    className="col-span-2 sm:col-span-1 bg-white/8 rounded-xl p-4 flex items-center justify-between border border-white/10 hover:bg-white/12 transition-colors cursor-pointer group"
                  >
                    <div>
                      <span className="text-[oklch(0.69_0.07_228)] text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                        {p.level}
                      </span>
                      <span className="text-lg font-black tracking-tight">
                        {p.name}
                      </span>
                    </div>
                    <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-accent transition-all group-hover:rotate-45">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                ) : (
                  <div
                    key={p._id}
                    className="bg-white/6 rounded-xl p-3 flex flex-col justify-center items-center text-center border border-white/8 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <span className="text-[oklch(0.50_0.03_252)] text-[9px] font-bold uppercase tracking-wider mb-1">
                      {p.level}
                    </span>
                    <span className="text-sm font-bold leading-tight truncate w-full">
                      {p.name}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Skeleton Loader ─────────────────────────── */

function BentoSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Skeleton className="lg:col-start-1 lg:col-end-5 lg:row-start-1 lg:row-end-3 h-[420px] rounded-2xl" />
        <Skeleton className="lg:col-start-5 lg:col-end-13 lg:row-start-1 lg:row-end-2 h-[280px] rounded-2xl" />
        <Skeleton className="lg:col-start-5 lg:col-end-9 lg:row-start-2 lg:row-end-3 h-[200px] rounded-2xl" />
        <Skeleton className="lg:col-start-9 lg:col-end-13 lg:row-start-2 lg:row-end-3 h-[200px] rounded-2xl" />
        <Skeleton className="lg:col-start-1 lg:col-end-5 lg:row-start-3 lg:row-end-4 h-[200px] rounded-2xl" />
        <Skeleton className="lg:col-start-5 lg:col-end-9 lg:row-start-3 lg:row-end-4 h-[200px] rounded-2xl" />
        <Skeleton className="lg:col-start-9 lg:col-end-13 lg:row-start-3 lg:row-end-4 h-[200px] rounded-2xl" />
        <Skeleton className="lg:col-span-12 h-[120px] rounded-2xl" />
      </div>
    </section>
  );
}
