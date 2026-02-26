import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Link } from "react-router-dom";
import {
  Swords,
  Trophy,
  TrendingUp,
  Calendar,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";

export default function AnalitikaRivalaPage() {
  const analytics = useQuery(api.matchAnalytics.getCurrent);
  const isLoading = analytics === undefined;

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_228)] font-sans text-foreground">
      <Header />

      {/* Hero — stays dark for brand impact */}
      <section className="relative text-white pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-[oklch(0.10_0.03_252)]" />
        {/* Decorative diagonal */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[oklch(0.69_0.095_228)]/5 to-transparent skew-x-[-12deg] translate-x-1/4" />
        {/* Decorative grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.69 0.095 228) 1px, transparent 1px), linear-gradient(90deg, oklch(0.69 0.095 228) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <Link
            to="/najava-kola"
            className="inline-flex items-center gap-2 text-[oklch(0.65_0.03_228)] hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Nazad na najavu kola
          </Link>
          <span className="text-[oklch(0.69_0.095_228)] text-xs font-bold uppercase tracking-[0.2em] block mb-4">
            Mozzart Bet Super liga Srbije
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-[0.9]">
            Analitika{" "}
            <span className="text-[oklch(0.77_0.10_225)]">Rivala</span>
          </h1>
          {!isLoading && analytics && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center bg-[oklch(0.69_0.095_228)]/10 border border-[oklch(0.69_0.095_228)]/20 rounded-full px-4 py-1.5">
                <span className="text-[oklch(0.69_0.095_228)] text-sm font-bold">
                  {analytics.roundNumber}. Kolo
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
                <Swords size={14} className="text-[oklch(0.77_0.10_225)]" />
                <span className="text-white/80 text-sm font-semibold">
                  {analytics.home} vs {analytics.away}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Content — light background */}
      <section className="bg-[oklch(0.97_0.01_228)] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <LoadingSkeleton />
          ) : !analytics ? (
            <EmptyState />
          ) : (
            <div className="space-y-10">
              <H2HSummary analytics={analytics} />
              <PreviousMatches analytics={analytics} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TeamStats analytics={analytics} />
                <RecentForm analytics={analytics} />
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ─── Types ─── */
type AnalyticsData = {
  home: string;
  away: string;
  roundNumber: number;
  reportUrl: string;
  h2hTotalPlayed: number;
  h2hHomeWins: number;
  h2hDraws: number;
  h2hAwayWins: number;
  h2hHomeGoals: number;
  h2hAwayGoals: number;
  previousMatches: Array<{
    date: string;
    homeTeam: string;
    awayTeam: string;
    score: string;
  }>;
  teamStats: Array<{
    label: string;
    homeValue: string;
    awayValue: string;
  }>;
  homeForm: Array<{
    date: string;
    result: string;
    score: string;
    teams: string;
  }>;
  awayForm: Array<{
    date: string;
    result: string;
    score: string;
    teams: string;
  }>;
};

/* ─── H2H Summary ─── */
function H2HSummary({ analytics }: { analytics: AnalyticsData }) {
  const { h2hTotalPlayed, h2hHomeWins, h2hDraws, h2hAwayWins, h2hHomeGoals, h2hAwayGoals, home, away } = analytics;
  const total = h2hTotalPlayed || 1;

  return (
    <div className="rounded-2xl border border-[oklch(0.90_0.015_228)] bg-white shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="px-6 py-4 bg-[oklch(0.96_0.01_228)] border-b border-[oklch(0.90_0.015_228)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[oklch(0.69_0.095_228)]/15 flex items-center justify-center">
          <Trophy size={16} className="text-[oklch(0.69_0.095_228)]" />
        </div>
        <h2 className="text-[oklch(0.20_0.04_252)] font-bold text-lg uppercase tracking-wide">
          Međusobni rezultati
        </h2>
        {h2hTotalPlayed > 0 && (
          <span className="ml-auto text-[oklch(0.55_0.03_252)] text-sm">
            {h2hTotalPlayed} odigranih utakmica
          </span>
        )}
      </div>

      <div className="p-6">
        {h2hTotalPlayed === 0 ? (
          <p className="text-[oklch(0.55_0.03_252)] text-center py-8">
            Nema podataka o međusobnim rezultatima.
          </p>
        ) : (
          <>
            {/* Visual bar chart */}
            <div className="mb-8">
              {/* Team names */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-[oklch(0.69_0.095_228)] font-extrabold text-lg uppercase tracking-tight">
                  {home}
                </span>
                <span className="text-[oklch(0.55_0.03_252)] font-bold text-xs uppercase tracking-widest">
                  Nerešeno
                </span>
                <span className="text-[oklch(0.50_0.10_250)] font-extrabold text-lg uppercase tracking-tight">
                  {away}
                </span>
              </div>

              {/* Win distribution bar */}
              <div className="relative h-12 rounded-xl overflow-hidden flex">
                <div
                  className="bg-[oklch(0.69_0.095_228)] flex items-center justify-center transition-all duration-700"
                  style={{ width: `${(h2hHomeWins / total) * 100}%` }}
                >
                  {h2hHomeWins > 0 && (
                    <span className="text-white font-black text-lg">
                      {h2hHomeWins}
                    </span>
                  )}
                </div>
                <div
                  className="bg-[oklch(0.85_0.01_228)] flex items-center justify-center transition-all duration-700"
                  style={{ width: `${(h2hDraws / total) * 100}%` }}
                >
                  {h2hDraws > 0 && (
                    <span className="text-[oklch(0.45_0.03_252)] font-bold text-lg">
                      {h2hDraws}
                    </span>
                  )}
                </div>
                <div
                  className="bg-[oklch(0.50_0.10_250)] flex items-center justify-center transition-all duration-700"
                  style={{ width: `${(h2hAwayWins / total) * 100}%` }}
                >
                  {h2hAwayWins > 0 && (
                    <span className="text-white font-black text-lg">
                      {h2hAwayWins}
                    </span>
                  )}
                </div>
              </div>

              {/* Labels under bar */}
              <div className="flex justify-between mt-2 text-xs text-[oklch(0.55_0.03_252)]">
                <span>
                  {h2hHomeWins} {h2hHomeWins === 1 ? "pobeda" : "pobeda"}
                </span>
                <span>{h2hDraws} nerešeno</span>
                <span>
                  {h2hAwayWins} {h2hAwayWins === 1 ? "pobeda" : "pobeda"}
                </span>
              </div>
            </div>

            {/* Goals comparison */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Golovi"
                homeValue={String(h2hHomeGoals)}
                awayValue={String(h2hAwayGoals)}
                home={home}
                away={away}
              />
              <div className="flex flex-col items-center justify-center bg-[oklch(0.97_0.01_228)] rounded-xl p-4 border border-[oklch(0.92_0.01_228)]">
                <span className="text-[oklch(0.55_0.03_252)] text-[10px] uppercase tracking-widest mb-1">
                  Ukupno
                </span>
                <span className="text-[oklch(0.20_0.04_252)] font-black text-3xl">
                  {h2hTotalPlayed}
                </span>
                <span className="text-[oklch(0.55_0.03_252)] text-[10px] uppercase tracking-widest mt-1">
                  Utakmica
                </span>
              </div>
              <StatCard
                label="Prosek golova"
                homeValue={
                  h2hTotalPlayed > 0
                    ? (h2hHomeGoals / h2hTotalPlayed).toFixed(1)
                    : "0"
                }
                awayValue={
                  h2hTotalPlayed > 0
                    ? (h2hAwayGoals / h2hTotalPlayed).toFixed(1)
                    : "0"
                }
                home={home}
                away={away}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  homeValue,
  awayValue,
  home,
  away,
}: {
  label: string;
  homeValue: string;
  awayValue: string;
  home: string;
  away: string;
}) {
  return (
    <div className="bg-[oklch(0.97_0.01_228)] rounded-xl p-4 border border-[oklch(0.92_0.01_228)]">
      <p className="text-[oklch(0.55_0.03_252)] text-[10px] uppercase tracking-widest text-center mb-3">
        {label}
      </p>
      <div className="flex items-center justify-between gap-2">
        <div className="text-center flex-1">
          <p className="text-[oklch(0.69_0.095_228)] font-black text-2xl">
            {homeValue}
          </p>
          <p className="text-[oklch(0.55_0.03_252)] text-[9px] uppercase mt-1 truncate">
            {home}
          </p>
        </div>
        <div className="w-px h-8 bg-[oklch(0.90_0.015_228)]" />
        <div className="text-center flex-1">
          <p className="text-[oklch(0.50_0.10_250)] font-black text-2xl">
            {awayValue}
          </p>
          <p className="text-[oklch(0.55_0.03_252)] text-[9px] uppercase mt-1 truncate">
            {away}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Previous Matches ─── */
function PreviousMatches({ analytics }: { analytics: AnalyticsData }) {
  const { previousMatches } = analytics;

  if (previousMatches.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[oklch(0.90_0.015_228)] bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-[oklch(0.96_0.01_228)] border-b border-[oklch(0.90_0.015_228)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[oklch(0.69_0.095_228)]/15 flex items-center justify-center">
          <Calendar size={16} className="text-[oklch(0.69_0.095_228)]" />
        </div>
        <h2 className="text-[oklch(0.20_0.04_252)] font-bold text-lg uppercase tracking-wide">
          Prethodne utakmice
        </h2>
      </div>

      <div className="divide-y divide-[oklch(0.93_0.01_228)]">
        {previousMatches.map((match, i) => {
          const parts = match.score.split(/[:\-]/);
          const homeGoals = parseInt(parts[0]?.trim() ?? "", 10);
          const awayGoals = parseInt(parts[1]?.trim() ?? "", 10);
          const isMladostHome = match.homeTeam
            .toUpperCase()
            .includes("MLADOST");
          const isMladostAway = match.awayTeam
            .toUpperCase()
            .includes("MLADOST");
          let resultClass = "bg-[oklch(0.90_0.01_228)] text-[oklch(0.45_0.03_252)]";
          if (!isNaN(homeGoals) && !isNaN(awayGoals)) {
            if (homeGoals > awayGoals) {
              resultClass = isMladostHome
                ? "bg-emerald-500/15 text-emerald-600"
                : "bg-red-500/10 text-red-500";
            } else if (awayGoals > homeGoals) {
              resultClass = isMladostAway
                ? "bg-emerald-500/15 text-emerald-600"
                : "bg-red-500/10 text-red-500";
            } else {
              resultClass = "bg-amber-500/15 text-amber-600";
            }
          }

          return (
            <div
              key={i}
              className="px-6 py-4 flex items-center gap-4 hover:bg-[oklch(0.97_0.01_228)] transition-colors"
            >
              {/* Date */}
              <span className="text-[oklch(0.55_0.03_252)] text-xs font-mono w-20 shrink-0">
                {match.date}
              </span>

              {/* Home team */}
              <span
                className={`flex-1 text-right font-bold text-sm uppercase tracking-tight ${
                  isMladostHome
                    ? "text-[oklch(0.69_0.095_228)]"
                    : "text-[oklch(0.30_0.04_252)]"
                }`}
              >
                {match.homeTeam}
              </span>

              {/* Score */}
              <div
                className={`px-3 py-1 rounded-lg font-black text-sm min-w-[56px] text-center ${resultClass}`}
              >
                {match.score}
              </div>

              {/* Away team */}
              <span
                className={`flex-1 text-left font-bold text-sm uppercase tracking-tight ${
                  isMladostAway
                    ? "text-[oklch(0.69_0.095_228)]"
                    : "text-[oklch(0.30_0.04_252)]"
                }`}
              >
                {match.awayTeam}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Team Statistics ─── */
function TeamStats({ analytics }: { analytics: AnalyticsData }) {
  const { teamStats, home, away } = analytics;

  if (teamStats.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[oklch(0.90_0.015_228)] bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-[oklch(0.96_0.01_228)] border-b border-[oklch(0.90_0.015_228)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[oklch(0.69_0.095_228)]/15 flex items-center justify-center">
          <BarChart3 size={16} className="text-[oklch(0.69_0.095_228)]" />
        </div>
        <h2 className="text-[oklch(0.20_0.04_252)] font-bold text-lg uppercase tracking-wide">
          Statistika sezone
        </h2>
      </div>

      <div className="p-6">
        {/* Team headers */}
        <div className="flex justify-between items-center mb-5 px-2">
          <span className="text-[oklch(0.69_0.095_228)] font-bold text-xs uppercase tracking-widest">
            {home}
          </span>
          <span className="text-[oklch(0.50_0.10_250)] font-bold text-xs uppercase tracking-widest">
            {away}
          </span>
        </div>

        <div className="space-y-3">
          {teamStats.map((stat, i) => {
            const homeNum = parseFloat(stat.homeValue) || 0;
            const awayNum = parseFloat(stat.awayValue) || 0;
            const max = Math.max(homeNum, awayNum, 1);

            return (
              <div key={i}>
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-[oklch(0.25_0.04_252)] font-bold text-sm w-12 text-right shrink-0">
                    {stat.homeValue}
                  </span>
                  <div className="flex-1 flex items-center gap-1">
                    {/* Home bar (grows right-to-left) */}
                    <div className="flex-1 flex justify-end">
                      <div
                        className="h-5 rounded-l-md bg-[oklch(0.69_0.095_228)]/50 transition-all duration-500"
                        style={{ width: `${(homeNum / max) * 100}%` }}
                      />
                    </div>
                    {/* Away bar (grows left-to-right) */}
                    <div className="flex-1">
                      <div
                        className="h-5 rounded-r-md bg-[oklch(0.50_0.10_250)]/50 transition-all duration-500"
                        style={{ width: `${(awayNum / max) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[oklch(0.25_0.04_252)] font-bold text-sm w-12 text-left shrink-0">
                    {stat.awayValue}
                  </span>
                </div>
                <p className="text-[oklch(0.55_0.03_252)] text-[10px] uppercase tracking-widest text-center">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Recent Form ─── */
function RecentForm({ analytics }: { analytics: AnalyticsData }) {
  const { homeForm, awayForm, home, away } = analytics;

  if (homeForm.length === 0 && awayForm.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[oklch(0.90_0.015_228)] bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-[oklch(0.96_0.01_228)] border-b border-[oklch(0.90_0.015_228)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[oklch(0.69_0.095_228)]/15 flex items-center justify-center">
          <TrendingUp size={16} className="text-[oklch(0.69_0.095_228)]" />
        </div>
        <h2 className="text-[oklch(0.20_0.04_252)] font-bold text-lg uppercase tracking-wide">
          Forma
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Home form */}
        {homeForm.length > 0 && (
          <FormSection teamName={home} matches={homeForm} isHome />
        )}

        {/* Divider */}
        {homeForm.length > 0 && awayForm.length > 0 && (
          <div className="border-t border-[oklch(0.93_0.01_228)]" />
        )}

        {/* Away form */}
        {awayForm.length > 0 && (
          <FormSection teamName={away} matches={awayForm} isHome={false} />
        )}
      </div>
    </div>
  );
}

function FormSection({
  teamName,
  matches,
  isHome,
}: {
  teamName: string;
  matches: Array<{
    date: string;
    result: string;
    score: string;
    teams: string;
  }>;
  isHome: boolean;
}) {
  return (
    <div>
      <h3
        className={`font-bold text-sm uppercase tracking-widest mb-3 ${
          isHome
            ? "text-[oklch(0.69_0.095_228)]"
            : "text-[oklch(0.50_0.10_250)]"
        }`}
      >
        {teamName}
      </h3>

      {/* Form badges row */}
      <div className="flex gap-1.5 mb-4">
        {matches.map((m, i) => (
          <FormBadge key={i} result={m.result} />
        ))}
      </div>

      {/* Match list */}
      <div className="space-y-2">
        {matches.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[oklch(0.97_0.01_228)] border border-[oklch(0.93_0.01_228)]"
          >
            <FormBadge result={m.result} size="sm" />
            <span className="text-[oklch(0.55_0.03_252)] text-[11px] font-mono w-16 shrink-0">
              {m.date}
            </span>
            <span className="text-[oklch(0.35_0.04_252)] text-xs font-semibold truncate flex-1">
              {m.teams}
            </span>
            <span className="text-[oklch(0.20_0.04_252)] font-bold text-xs shrink-0">
              {m.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormBadge({
  result,
  size = "md",
}: {
  result: string;
  size?: "sm" | "md";
}) {
  const letter = result.toUpperCase();
  let bgColor = "bg-[oklch(0.90_0.01_228)]";
  let textColor = "text-[oklch(0.50_0.03_252)]";

  if (letter === "P" || letter === "W") {
    bgColor = "bg-emerald-500/15";
    textColor = "text-emerald-600";
  } else if (letter === "I" || letter === "L") {
    bgColor = "bg-red-500/12";
    textColor = "text-red-500";
  } else if (letter === "N" || letter === "D") {
    bgColor = "bg-amber-500/15";
    textColor = "text-amber-600";
  }

  const sizeClass =
    size === "sm"
      ? "w-5 h-5 text-[9px]"
      : "w-8 h-8 text-xs";

  return (
    <div
      className={`${sizeClass} rounded-md ${bgColor} ${textColor} flex items-center justify-center font-black`}
    >
      {letter}
    </div>
  );
}

/* ─── Loading skeleton ─── */
function LoadingSkeleton() {
  return (
    <div className="space-y-10">
      <Skeleton className="h-72 w-full rounded-2xl bg-[oklch(0.92_0.01_228)]" />
      <Skeleton className="h-56 w-full rounded-2xl bg-[oklch(0.92_0.01_228)]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-80 rounded-2xl bg-[oklch(0.92_0.01_228)]" />
        <Skeleton className="h-80 rounded-2xl bg-[oklch(0.92_0.01_228)]" />
      </div>
    </div>
  );
}

/* ─── Empty state ─── */
function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[oklch(0.69_0.095_228)]/10 border border-[oklch(0.69_0.095_228)]/20 flex items-center justify-center">
        <Swords size={28} className="text-[oklch(0.69_0.095_228)]" />
      </div>
      <p className="text-[oklch(0.35_0.04_252)] text-lg font-semibold mb-2">
        Analitika rivala jos nije dostupna
      </p>
      <p className="text-[oklch(0.55_0.03_252)] text-sm max-w-md mx-auto">
        Kliknite "Sinhronizuj analitiku" u Admin panelu kako biste preuzeli
        podatke sa superliga.rs
      </p>
      <Link
        to="/najava-kola"
        className="inline-flex items-center gap-2 mt-6 text-[oklch(0.69_0.095_228)] hover:text-[oklch(0.50_0.10_250)] font-semibold text-sm transition-colors"
      >
        <ArrowLeft size={16} />
        Pogledajte najavu kola
      </Link>
    </div>
  );
}
