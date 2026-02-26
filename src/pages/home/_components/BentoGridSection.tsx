import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  Calendar,
  ArrowRight,
  Trophy,
  Newspaper,
  Users,
  Handshake,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Link } from "react-router-dom";

const FALLBACK_STANDINGS = [
  { position: 1, team: "Crvena zvezda", played: 22, wins: 19, draws: 2, losses: 1, goalDifference: "+45", points: 59, isHighlighted: false },
  { position: 2, team: "Partizan", played: 22, wins: 17, draws: 3, losses: 2, goalDifference: "+32", points: 54, isHighlighted: false },
  { position: 3, team: "TSC", played: 22, wins: 12, draws: 7, losses: 3, goalDifference: "+18", points: 43, isHighlighted: false },
  { position: 4, team: "Čukarički", played: 22, wins: 10, draws: 5, losses: 7, goalDifference: "+8", points: 35, isHighlighted: false },
  { position: 5, team: "FK Mladost", played: 22, wins: 10, draws: 3, losses: 9, goalDifference: "-2", points: 33, isHighlighted: true },
  { position: 6, team: "Vojvodina", played: 22, wins: 8, draws: 7, losses: 7, goalDifference: "0", points: 31, isHighlighted: false },
  { position: 7, team: "Novi Pazar", played: 22, wins: 9, draws: 3, losses: 10, goalDifference: "-4", points: 30, isHighlighted: false },
  { position: 8, team: "Radnički 1923", played: 22, wins: 9, draws: 2, losses: 11, goalDifference: "-5", points: 29, isHighlighted: false },
];

/* ─────────────────────────── Main Component ─────────────────────────── */

export default function BentoGridSection() {
  const news = useQuery(api.news.getLatest);
  const standings = useQuery(api.standings.getAll);
  const partners = useQuery(api.partners.getAll);
  const players = useQuery(api.players.getAll);

  const isLoading =
    news === undefined ||
    standings === undefined ||
    partners === undefined ||
    players === undefined;

  if (isLoading) {
    return <BentoSkeleton />;
  }

  const standingsRows =
    standings.length > 0 ? standings : FALLBACK_STANDINGS;
  const featuredNews = news.length > 0 ? news[0] : null;
  const smallNews = news.slice(1, 3);
  const featuredPlayers = players.slice(0, 3);

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Grid — 12 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ── CELL: STANDINGS TABLE ─────────────────────── col 1-5, row 1-2 */}
        <div className="lg:col-start-1 lg:col-end-6 lg:row-start-1 lg:row-end-3 bg-card rounded-2xl overflow-hidden border border-border shadow-lg flex flex-col">
          {/* Header */}
          <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Trophy size={16} className="text-accent" />
              </div>
              <h3 className="text-base font-extrabold text-foreground uppercase tracking-tight">
                Tabela Superlige
              </h3>
            </div>
            <button className="text-[11px] text-accent font-semibold flex items-center hover:text-accent/80 transition-colors gap-1">
              Kompletna <ArrowRight size={11} />
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] text-muted-foreground uppercase bg-muted/40 sticky top-0">
                <tr>
                  <th className="px-3 py-2.5 text-center w-8 font-bold">#</th>
                  <th className="px-3 py-2.5 text-left font-bold">Klub</th>
                  <th className="px-3 py-2.5 text-center hidden sm:table-cell font-bold">
                    OM
                  </th>
                  <th className="px-3 py-2.5 text-center hidden md:table-cell font-bold">
                    POB
                  </th>
                  <th className="px-3 py-2.5 text-center hidden sm:table-cell font-bold">
                    GR
                  </th>
                  <th className="px-3 py-2.5 text-center font-black text-foreground">
                    BOD
                  </th>
                </tr>
              </thead>
              <tbody>
                {standingsRows.map((row) => (
                  <tr
                    key={row.position}
                    className={`border-b border-border/30 transition-colors hover:bg-muted/30 ${
                      row.isHighlighted ? "bg-accent/5 relative" : ""
                    }`}
                  >
                    {row.isHighlighted && (
                      <td className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r-full" />
                    )}
                    <td
                      className={`px-3 py-3 text-center text-xs font-bold ${
                        row.isHighlighted
                          ? "text-accent"
                          : "text-muted-foreground"
                      }`}
                    >
                      {row.position}.
                    </td>
                    <td
                      className={`px-3 py-3 ${
                        row.isHighlighted
                          ? "text-foreground font-black"
                          : "text-foreground font-medium"
                      }`}
                    >
                      <div className="flex items-center text-xs">
                        <div
                          className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0 ${
                            row.isHighlighted
                              ? "bg-accent"
                              : "bg-muted-foreground/30"
                          }`}
                        >
                          {row.team.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate">{row.team}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-xs hidden sm:table-cell text-muted-foreground">
                      {row.played}
                    </td>
                    <td className="px-3 py-3 text-center text-xs hidden md:table-cell text-muted-foreground">
                      {row.wins}
                    </td>
                    <td className="px-3 py-3 text-center text-xs hidden sm:table-cell text-muted-foreground">
                      {row.goalDifference}
                    </td>
                    <td
                      className={`px-3 py-3 text-center font-black text-sm ${
                        row.isHighlighted
                          ? "text-accent bg-accent/5"
                          : "text-foreground bg-muted/20"
                      }`}
                    >
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CELL: FEATURED NEWS ───────────────────────── col 6-12, row 1 */}
        {featuredNews ? (
          <div className="lg:col-start-6 lg:col-end-13 lg:row-start-1 lg:row-end-2 rounded-2xl overflow-hidden border border-border shadow-lg relative group cursor-pointer min-h-[280px] lg:min-h-0">
            <img
              src={featuredNews.imageUrl}
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
          </div>
        ) : (
          <div className="lg:col-start-6 lg:col-end-13 lg:row-start-1 lg:row-end-2 rounded-2xl bg-card border border-border shadow-lg min-h-[280px] flex items-center justify-center">
            <p className="text-muted-foreground">Nema objavljenih vesti</p>
          </div>
        )}

        {/* ── CELL: NEWS 2 ──────────────────────────────── col 6-9, row 2 */}
        {smallNews.length > 0 ? (
          <div className="lg:col-start-6 lg:col-end-10 lg:row-start-2 lg:row-end-3 rounded-2xl overflow-hidden border border-border shadow-lg group cursor-pointer bg-card flex flex-col">
            <div className="relative h-36 overflow-hidden flex-shrink-0">
              <img
                src={smallNews[0].imageUrl}
                alt={smallNews[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {smallNews[0].category}
                </span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <h4 className="text-sm font-bold text-card-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
                {smallNews[0].title}
              </h4>
              <p className="text-muted-foreground text-[11px] mt-2 flex items-center">
                <Calendar size={10} className="mr-1" /> {smallNews[0].date}
              </p>
            </div>
          </div>
        ) : (
          <div className="lg:col-start-6 lg:col-end-10 lg:row-start-2 lg:row-end-3 rounded-2xl bg-card border border-border shadow-lg flex items-center justify-center p-6">
            <p className="text-muted-foreground text-sm">Još vesti uskoro</p>
          </div>
        )}

        {/* ── CELL: NEWS 3 / "Sve Vesti" CTA ────────────── col 10-12, row 2 */}
        {smallNews.length > 1 ? (
          <div className="lg:col-start-10 lg:col-end-13 lg:row-start-2 lg:row-end-3 rounded-2xl overflow-hidden border border-border shadow-lg group cursor-pointer bg-card flex flex-col">
            <div className="relative h-36 overflow-hidden flex-shrink-0">
              <img
                src={smallNews[1].imageUrl}
                alt={smallNews[1].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {smallNews[1].category}
                </span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <h4 className="text-sm font-bold text-card-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
                {smallNews[1].title}
              </h4>
              <p className="text-muted-foreground text-[11px] mt-2 flex items-center">
                <Calendar size={10} className="mr-1" /> {smallNews[1].date}
              </p>
            </div>
          </div>
        ) : (
          <div className="lg:col-start-10 lg:col-end-13 lg:row-start-2 lg:row-end-3 rounded-2xl bg-gradient-to-br from-[oklch(0.50_0.12_240)] to-[oklch(0.40_0.10_245)] border border-[oklch(0.55_0.10_238)] shadow-lg flex flex-col items-center justify-center p-6 text-white text-center cursor-pointer group">
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
          </div>
        )}

        {/* ── CELL: PARTNERI & SPONZORI ─────────────────── col 1-5, row 3 */}
        <div className="lg:col-start-1 lg:col-end-6 lg:row-start-3 lg:row-end-4 rounded-2xl bg-gradient-to-br from-[oklch(0.22_0.045_252)] to-[oklch(0.18_0.04_252)] border border-[oklch(0.30_0.045_252)] shadow-lg p-5 text-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Handshake size={16} className="text-[oklch(0.69_0.07_228)]" />
              </div>
              <h3 className="text-base font-extrabold uppercase tracking-tight">
                Partneri
              </h3>
            </div>
          </div>

          {/* Partner items */}
          {partners.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[oklch(0.50_0.03_252)] text-sm">
                Partneri uskoro
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 flex-1">
              {partners.map((p, i) =>
                i === 0 ? (
                  <div
                    key={p._id}
                    className="col-span-2 bg-white/8 rounded-xl p-4 flex items-center justify-between border border-white/10 hover:bg-white/12 transition-colors cursor-pointer group"
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

        {/* ── CELL: IGRAČI HIGHLIGHT ────────────────────── col 6-12, row 3 */}
        <div className="lg:col-start-6 lg:col-end-13 lg:row-start-3 lg:row-end-4 rounded-2xl bg-[oklch(0.16_0.035_252)] border border-[oklch(0.26_0.04_252)] shadow-lg p-5 text-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Users size={16} className="text-[oklch(0.77_0.10_225)]" />
              </div>
              <h3 className="text-base font-extrabold uppercase tracking-tight">
                Prvi Tim
              </h3>
            </div>
            <Link
              to="/prvi-tim"
              className="text-[11px] text-[oklch(0.77_0.10_225)] font-semibold flex items-center hover:text-white transition-colors gap-1"
            >
              Svi igrači <ArrowRight size={11} />
            </Link>
          </div>

          {/* Players */}
          {featuredPlayers.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[oklch(0.50_0.03_252)] text-sm">
                Roster uskoro
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 flex-1">
              {featuredPlayers.map((player) => (
                <Link
                  to="/prvi-tim"
                  key={player._id}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-xl bg-[oklch(0.20_0.04_252)] aspect-[3/4]">
                    <img
                      src={player.imageUrl}
                      alt={player.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.03_252)] via-transparent to-transparent opacity-90" />
                    {/* Number badge */}
                    <div className="absolute bottom-0 right-0 bg-[oklch(0.55_0.12_240)] text-white font-black text-lg p-1.5 px-2.5 rounded-tl-xl shadow-lg">
                      {player.number}
                    </div>
                    {/* Name */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 pr-12">
                      <h5 className="font-bold text-sm leading-tight truncate">
                        {player.name}
                      </h5>
                      <p className="text-[oklch(0.77_0.10_225)] text-[11px]">
                        {player.position}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
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
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Skeleton className="lg:col-start-1 lg:col-end-6 lg:row-start-1 lg:row-end-3 h-[420px] rounded-2xl" />
        <Skeleton className="lg:col-start-6 lg:col-end-13 lg:row-start-1 lg:row-end-2 h-[280px] rounded-2xl" />
        <Skeleton className="lg:col-start-6 lg:col-end-10 lg:row-start-2 lg:row-end-3 h-[200px] rounded-2xl" />
        <Skeleton className="lg:col-start-10 lg:col-end-13 lg:row-start-2 lg:row-end-3 h-[200px] rounded-2xl" />
        <Skeleton className="lg:col-start-1 lg:col-end-6 h-[200px] rounded-2xl" />
        <Skeleton className="lg:col-start-6 lg:col-end-13 h-[200px] rounded-2xl" />
      </div>
    </section>
  );
}
