import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  Calendar,
  ArrowRight,
  Newspaper,
  Landmark,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import StandingsTable from "./StandingsTable.tsx";

/* ─── Helper: strip HTML tags to get plain text ─── */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/* ─────────────────── Small News Card (reusable) ─────────────────── */

type NewsArticle = {
  _id: string;
  title: string;
  excerpt?: string;
  content?: string;
  category: string;
  date: string;
  resolvedImageUrl?: string | null;
};

function SmallNewsCard({
  article,
  className = "",
}: {
  article: NewsArticle;
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
        <div>
          <h4 className="text-sm font-bold text-card-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
            {article.title}
          </h4>
          {article.excerpt && (
            <p className="text-muted-foreground text-xs mt-1.5 line-clamp-3 leading-relaxed">
              {article.excerpt}
            </p>
          )}
        </div>
        <p className="text-muted-foreground text-[11px] mt-2 flex items-center">
          <Calendar size={10} className="mr-1" /> {article.date}
        </p>
      </div>
    </Link>
  );
}

/* ────────── Medium News Card (row 2 — horizontal: thumb + full text) ────────── */

function MediumNewsCard({
  article,
  className = "",
}: {
  article: NewsArticle;
  className?: string;
}) {
  const plainText = article.content ? stripHtml(article.content) : (article.excerpt ?? "");

  return (
    <Link
      to={`/vesti/${article._id}`}
      className={`rounded-2xl overflow-hidden border border-border shadow-lg group cursor-pointer bg-card flex flex-col h-full ${className}`}
    >
      {/* Large image fills most of the card */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {article.resolvedImageUrl && (
          <img
            src={article.resolvedImageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-2.5 left-2.5">
          <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            {article.category}
          </span>
        </div>
        {/* Title + date overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-accent transition-colors">
            {article.title}
          </h4>
          <div className="flex items-center text-white/60 text-[10px] mt-1.5">
            <Calendar size={10} className="mr-1" /> {article.date}
          </div>
        </div>
      </div>

      {/* Compact text excerpt at bottom */}
      <div className="p-3.5 flex-shrink-0">
        <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2">
          {plainText}
        </p>
        <span className="text-accent text-[11px] font-semibold mt-1.5 flex items-center gap-1">
          Pročitaj više <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

/* ─────────────────────────── Main Component ─────────────────────────── */

export default function BentoGridSection() {
  const news = useQuery(api.news.getLatest);
  const standings = useQuery(api.standings.getAll);

  const isLoading =
    news === undefined ||
    standings === undefined;

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
          <MediumNewsCard
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
          <MediumNewsCard
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

        {/* ── CELL: EXPLORE CLUB PAGES ─────────────────── full width */}
        <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Istorija Kluba */}
          <Link
            to="/istorija-kluba"
            className="group relative rounded-2xl overflow-hidden min-h-[260px] shadow-xl cursor-pointer"
          >
            {/* Background image */}
            <img
              src="https://cdn.hercules.app/file_sTktNFhLtjEJYGRp7SnFFfIr"
              alt="Istorija Kluba"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 group-hover:via-black/60 transition-all duration-500" />
            {/* Accent glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-[oklch(0.69_0.095_228)]/20 to-transparent" />
            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-6">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 group-hover:bg-[oklch(0.69_0.095_228)]/30 group-hover:border-[oklch(0.69_0.095_228)]/40 transition-all duration-300">
                <Landmark size={22} className="text-white" />
              </div>
              <h4 className="text-white font-extrabold text-xl tracking-tight leading-tight">Istorija Kluba</h4>
              <p className="text-white/60 text-sm mt-1.5 leading-relaxed">Od 1952. godine do danas</p>
              <div className="flex items-center text-[oklch(0.69_0.095_228)] text-sm font-semibold mt-4 group-hover:translate-x-1.5 transition-transform duration-300">
                Saznaj više <ArrowRight size={16} className="ml-1.5 group-hover:ml-2.5 transition-all duration-300" />
              </div>
            </div>
          </Link>

          {/* Omladinska Škola */}
          <Link
            to="/omladinska-skola"
            className="group relative rounded-2xl overflow-hidden min-h-[260px] shadow-xl cursor-pointer"
          >
            <img
              src="https://cdn.hercules.app/file_kjevJTuW8Y3zKu7fz0ww5B1T"
              alt="Omladinska Škola"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 group-hover:via-black/60 transition-all duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-[oklch(0.77_0.10_225)]/20 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-6">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 group-hover:bg-[oklch(0.77_0.10_225)]/30 group-hover:border-[oklch(0.77_0.10_225)]/40 transition-all duration-300">
                <GraduationCap size={22} className="text-white" />
              </div>
              <h4 className="text-white font-extrabold text-xl tracking-tight leading-tight">Omladinska Škola</h4>
              <p className="text-white/60 text-sm mt-1.5 leading-relaxed">Rasadnik talenata od 1962.</p>
              <div className="flex items-center text-[oklch(0.77_0.10_225)] text-sm font-semibold mt-4 group-hover:translate-x-1.5 transition-transform duration-300">
                Saznaj više <ArrowRight size={16} className="ml-1.5 group-hover:ml-2.5 transition-all duration-300" />
              </div>
            </div>
          </Link>

          {/* Stadion */}
          <Link
            to="/stadion"
            className="group relative rounded-2xl overflow-hidden min-h-[260px] shadow-xl cursor-pointer"
          >
            <img
              src="https://cdn.hercules.app/file_UVSxHaKsO3WH89Qs3kT4kGB5"
              alt="Stadion"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 group-hover:via-black/60 transition-all duration-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-[oklch(0.55_0.12_240)]/20 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-6">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 group-hover:bg-[oklch(0.55_0.12_240)]/30 group-hover:border-[oklch(0.55_0.12_240)]/40 transition-all duration-300">
                <MapPin size={22} className="text-white" />
              </div>
              <h4 className="text-white font-extrabold text-xl tracking-tight leading-tight">Stadion</h4>
              <p className="text-white/60 text-sm mt-1.5 leading-relaxed">SRC "mr Radoš Milovanović"</p>
              <div className="flex items-center text-[oklch(0.55_0.12_240)] text-sm font-semibold mt-4 group-hover:translate-x-1.5 transition-transform duration-300">
                Saznaj više <ArrowRight size={16} className="ml-1.5 group-hover:ml-2.5 transition-all duration-300" />
              </div>
            </div>
          </Link>
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
