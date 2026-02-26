import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Trophy, Calendar, Star, MapPin } from "lucide-react";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";

/* ------------------------------------------------------------------ */
/*  Static fallback data — Super Liga Srbije                          */
/*  Last update: 26 feb 2026 (season 25/26)                          */
/* ------------------------------------------------------------------ */

type StandingRow = {
  pos: number;
  club: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  _highlighted?: boolean;
};

const STANDINGS: StandingRow[] = [
  { pos: 1, club: "Crvena zvezda", played: 24, won: 18, drawn: 3, lost: 3, goalsFor: 72, goalsAgainst: 19, goalDiff: 53, points: 57 },
  { pos: 2, club: "Partizan", played: 24, won: 17, drawn: 2, lost: 5, goalsFor: 55, goalsAgainst: 30, goalDiff: 25, points: 53 },
  { pos: 3, club: "Vojvodina", played: 24, won: 15, drawn: 4, lost: 5, goalsFor: 44, goalsAgainst: 24, goalDiff: 20, points: 49 },
  { pos: 4, club: "Novi Pazar", played: 24, won: 11, drawn: 6, lost: 7, goalsFor: 31, goalsAgainst: 31, goalDiff: 0, points: 39 },
  { pos: 5, club: "Železničar", played: 24, won: 11, drawn: 5, lost: 8, goalsFor: 29, goalsAgainst: 26, goalDiff: 3, points: 38 },
  { pos: 6, club: "Radnik", played: 24, won: 9, drawn: 5, lost: 10, goalsFor: 30, goalsAgainst: 29, goalDiff: 1, points: 32 },
  { pos: 7, club: "Radnički 1923", played: 24, won: 8, drawn: 8, lost: 8, goalsFor: 31, goalsAgainst: 33, goalDiff: -2, points: 32 },
  { pos: 8, club: "Čukarički", played: 24, won: 8, drawn: 7, lost: 9, goalsFor: 35, goalsAgainst: 38, goalDiff: -3, points: 31 },
  { pos: 9, club: "OFK Beograd", played: 24, won: 8, drawn: 6, lost: 10, goalsFor: 30, goalsAgainst: 32, goalDiff: -2, points: 30 },
  { pos: 10, club: "Radnički Niš", played: 24, won: 8, drawn: 5, lost: 11, goalsFor: 30, goalsAgainst: 31, goalDiff: -1, points: 29 },
  { pos: 11, club: "TSC", played: 24, won: 7, drawn: 8, lost: 9, goalsFor: 22, goalsAgainst: 27, goalDiff: -5, points: 29 },
  { pos: 12, club: "IMT", played: 24, won: 8, drawn: 4, lost: 12, goalsFor: 27, goalsAgainst: 43, goalDiff: -16, points: 28 },
  { pos: 13, club: "Mladost", played: 24, won: 6, drawn: 9, lost: 9, goalsFor: 18, goalsAgainst: 34, goalDiff: -16, points: 27 },
  { pos: 14, club: "Javor Matis", played: 24, won: 6, drawn: 8, lost: 10, goalsFor: 24, goalsAgainst: 34, goalDiff: -10, points: 26 },
  { pos: 15, club: "Spartak ŽK", played: 24, won: 3, drawn: 8, lost: 13, goalsFor: 27, goalsAgainst: 45, goalDiff: -18, points: 17 },
  { pos: 16, club: "Napredak", played: 24, won: 2, drawn: 6, lost: 16, goalsFor: 21, goalsAgainst: 50, goalDiff: -29, points: 12 },
];

type MatchRow = {
  round: number;
  date: string;
  home: string;
  away: string;
  score?: string;
  city?: string;
  isHome: boolean;
};

const MATCHES: MatchRow[] = [
  // Kola 1-8: potvrđena sa superliga.rs/sezona/raspored-i-rezultati/
  { round: 1, date: "20.07.2025", home: "Mladost", away: "IMT", score: "1:1", city: "Lučani", isHome: true },
  { round: 2, date: "26.07.2025", home: "Radnički Niš", away: "Mladost", score: "3:1", city: "Niš", isHome: false },
  { round: 3, date: "02.08.2025", home: "Mladost", away: "Radnik", score: "1:0", city: "Lučani", isHome: true },
  { round: 4, date: "09.08.2025", home: "Spartak ŽK", away: "Mladost", score: "1:1", city: "Subotica", isHome: false },
  { round: 5, date: "15.08.2025", home: "Mladost", away: "Crvena zvezda", score: "1:4", city: "Lučani", isHome: true },
  { round: 6, date: "23.08.2025", home: "OFK Beograd", away: "Mladost", score: "1:1", city: "Stara Pazova", isHome: false },
  { round: 7, date: "30.08.2025", home: "Mladost", away: "Vojvodina", score: "0:0", city: "Lučani", isHome: true },
  { round: 8, date: "14.09.2025", home: "TSC", away: "Mladost", score: "1:0", city: "Bačka Topola", isHome: false },
  // Kola 9-23: dodaj kroz admin panel (prethodni podaci bili netačni)
  // Kolo 24-25: potvrđeno sa superliga.rs/tim/mladost/
  { round: 24, date: "23.02.2026", home: "Javor Matis", away: "Mladost", score: "0:0", city: "Ivanjica", isHome: false },
  { round: 25, date: "28.02.2026", home: "Čukarički", away: "Mladost", city: "Beograd", isHome: false },
];

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

type Tab = "tabela" | "utakmice";

const TABS: { id: Tab; label: string; icon: typeof Trophy }[] = [
  { id: "tabela", label: "Tabela", icon: Trophy },
  { id: "utakmice", label: "Raspored i rezultati", icon: Calendar },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SuperLigaPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tabela");

  // Database queries
  const dbStandings = useQuery(api.admin.superLeague.getStandings);
  const dbMatches = useQuery(api.admin.superLeague.getMatches);

  // Use DB data if present, otherwise fall back to static data
  const standings: StandingRow[] = (dbStandings && dbStandings.length > 0)
    ? dbStandings.map((s) => ({
        pos: s.position,
        club: s.club,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDiff: s.goalDiff,
        points: s.points,
        _highlighted: s.isHighlighted,
      }))
    : STANDINGS.map((s) => ({ ...s, _highlighted: s.club === "Mladost" }));

  // Use static data directly — DB had stale/incorrect match data
  // Once correct data is entered via admin, switch back to DB
  const matches: MatchRow[] = MATCHES;

  // Mladost stats for the hero
  const mladostRow = standings.find((r) => r._highlighted) ?? standings.find((r) => r.club.includes("Mladost"));

  return (
    <div className="min-h-screen bg-[oklch(0.96_0.01_228)] text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.18_0.04_252)] via-[oklch(0.22_0.05_248)] to-[oklch(0.15_0.04_260)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.45_0.15_30/0.15),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Title */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(0.45_0.15_30/0.2)] border border-[oklch(0.45_0.15_30/0.3)] text-[oklch(0.80_0.08_30)] text-sm font-semibold mb-4">
                <Star size={14} className="fill-current" />
                Sezona 2025/26
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
                Mozzart Bet Super Liga
              </h1>
              <p className="text-[oklch(0.65_0.03_228)] text-lg max-w-xl mb-8">
                Pratite tabelu, raspored i statistiku FK Mladost Lučani u Mozzart Bet Super ligi Srbije.
              </p>

              {/* Quick stats */}
              {mladostRow && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Pozicija", value: `${mladostRow.pos}.` },
                    { label: "Bodovi", value: String(mladostRow.points) },
                    { label: "Gol razlika", value: `${mladostRow.goalDiff > 0 ? "+" : ""}${mladostRow.goalDiff}` },
                    { label: "Golovi", value: `${mladostRow.goalsFor}` },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center backdrop-blur-sm"
                    >
                      <div className="text-2xl md:text-3xl font-extrabold text-[oklch(0.80_0.08_30)]">
                        {stat.value}
                      </div>
                      <div className="text-xs text-[oklch(0.55_0.03_228)] uppercase tracking-wider mt-1">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Club crest */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-[oklch(0.45_0.15_30/0.3)] blur-3xl rounded-full scale-150" />
                <img
                  src="https://cdn.hercules.app/file_O3xXQalJmikyjBgRaWY6p4A8"
                  alt="FK Mladost Lučani"
                  className="relative w-40 h-40 md:w-52 md:h-52 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab navigation */}
      <div className="sticky top-20 z-30 bg-white/90 backdrop-blur-md border-b border-[oklch(0.90_0.015_228)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[oklch(0.30_0.055_252)] text-white shadow-md"
                      : "text-[oklch(0.45_0.03_252)] hover:bg-[oklch(0.94_0.015_228)] hover:text-[oklch(0.30_0.055_252)]"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {activeTab === "tabela" && <StandingsTable data={standings} />}
        {activeTab === "utakmice" && <MatchesList data={matches} />}
      </div>

      <Footer />
    </div>
  );
}

/* ================================================================== */
/*  Standings Table                                                    */
/* ================================================================== */

function StandingsTable({ data }: { data: StandingRow[] }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-[oklch(0.22_0.045_252)] mb-6 flex items-center gap-3">
        <Trophy size={24} className="text-[oklch(0.69_0.095_228)]" />
        Tabela — Super liga
      </h2>

      <div className="bg-white rounded-2xl shadow-lg border border-[oklch(0.92_0.01_228)] overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[oklch(0.22_0.045_252)] text-white text-xs uppercase tracking-wider">
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">Klub</th>
                <th className="py-3 px-3 text-center">U</th>
                <th className="py-3 px-3 text-center">P</th>
                <th className="py-3 px-3 text-center">N</th>
                <th className="py-3 px-3 text-center">I</th>
                <th className="py-3 px-3 text-center">G+</th>
                <th className="py-3 px-3 text-center">G-</th>
                <th className="py-3 px-3 text-center">GR</th>
                <th className="py-3 px-3 text-center font-bold">Bod</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const isMladost = row._highlighted ?? row.club.includes("Mladost");
                return (
                  <tr
                    key={`${row.pos}-${row.club}`}
                    className={`border-b border-[oklch(0.94_0.01_228)] transition-colors ${
                      isMladost
                        ? "bg-[oklch(0.55_0.12_240/0.08)] font-semibold"
                        : "hover:bg-[oklch(0.97_0.005_228)]"
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-[oklch(0.45_0.03_252)]">
                      {row.pos}
                    </td>
                    <td className="py-3 px-4">
                      <span className={isMladost ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.25_0.04_252)]"}>
                        {row.club}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-[oklch(0.45_0.03_252)]">{row.played}</td>
                    <td className="py-3 px-3 text-center text-green-700 font-semibold">{row.won}</td>
                    <td className="py-3 px-3 text-center text-amber-600">{row.drawn}</td>
                    <td className="py-3 px-3 text-center text-red-600">{row.lost}</td>
                    <td className="py-3 px-3 text-center text-[oklch(0.45_0.03_252)]">{row.goalsFor}</td>
                    <td className="py-3 px-3 text-center text-[oklch(0.45_0.03_252)]">{row.goalsAgainst}</td>
                    <td className="py-3 px-3 text-center font-semibold">
                      <span className={row.goalDiff > 0 ? "text-green-700" : row.goalDiff < 0 ? "text-red-600" : "text-[oklch(0.45_0.03_252)]"}>
                        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg font-extrabold text-base ${
                        isMladost
                          ? "bg-[oklch(0.55_0.12_240)] text-white"
                          : "bg-[oklch(0.95_0.01_228)] text-[oklch(0.25_0.04_252)]"
                      }`}>
                        {row.points}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-[oklch(0.94_0.01_228)]">
          {data.map((row) => {
            const isMladost = row._highlighted ?? row.club.includes("Mladost");
            return (
              <div
                key={`${row.pos}-${row.club}`}
                className={`flex items-center gap-3 px-4 py-3 ${
                  isMladost ? "bg-[oklch(0.55_0.12_240/0.08)]" : ""
                }`}
              >
                <span className="w-7 text-center font-bold text-sm text-[oklch(0.45_0.03_252)]">
                  {row.pos}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm truncate ${isMladost ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.25_0.04_252)]"}`}>
                    {row.club}
                  </div>
                  <div className="text-xs text-[oklch(0.55_0.03_252)]">
                    {row.played}u · {row.won}p {row.drawn}n {row.lost}i · {row.goalsFor}:{row.goalsAgainst}
                  </div>
                </div>
                <span className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl font-extrabold text-lg ${
                  isMladost
                    ? "bg-[oklch(0.55_0.12_240)] text-white"
                    : "bg-[oklch(0.95_0.01_228)] text-[oklch(0.25_0.04_252)]"
                }`}>
                  {row.points}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-[oklch(0.55_0.03_252)] mt-4 text-right">
        Izvor: superliga.rs · Mozzart Bet Super liga Srbije
      </p>
    </div>
  );
}

/* ================================================================== */
/*  Matches List                                                       */
/* ================================================================== */

function getResultColor(match: MatchRow): string {
  if (!match.score) return "";
  const parts = match.score.split(":");
  if (parts.length !== 2) return "";
  const homeGoals = parseInt(parts[0]);
  const awayGoals = parseInt(parts[1]);
  if (isNaN(homeGoals) || isNaN(awayGoals)) return "";

  // Determine Mladost's result
  if (match.isHome) {
    if (homeGoals > awayGoals) return "text-green-700";
    if (homeGoals < awayGoals) return "text-red-600";
    return "text-amber-600";
  } else {
    if (awayGoals > homeGoals) return "text-green-700";
    if (awayGoals < homeGoals) return "text-red-600";
    return "text-amber-600";
  }
}

function getResultLabel(match: MatchRow): string {
  if (!match.score) return "";
  const parts = match.score.split(":");
  if (parts.length !== 2) return "";
  const homeGoals = parseInt(parts[0]);
  const awayGoals = parseInt(parts[1]);
  if (isNaN(homeGoals) || isNaN(awayGoals)) return "";

  if (match.isHome) {
    if (homeGoals > awayGoals) return "P";
    if (homeGoals < awayGoals) return "I";
    return "N";
  } else {
    if (awayGoals > homeGoals) return "P";
    if (awayGoals < homeGoals) return "I";
    return "N";
  }
}

function getResultBg(label: string): string {
  if (label === "P") return "bg-green-600 text-white";
  if (label === "I") return "bg-red-600 text-white";
  if (label === "N") return "bg-amber-500 text-white";
  return "bg-[oklch(0.94_0.015_228)] text-[oklch(0.45_0.03_252)]";
}

function MatchesList({ data }: { data: MatchRow[] }) {
  // Sort by round descending (most recent first)
  const sorted = [...data].sort((a, b) => b.round - a.round);

  // Calculate W/D/L record
  const wins = data.filter((m) => getResultLabel(m) === "P").length;
  const draws = data.filter((m) => getResultLabel(m) === "N").length;
  const losses = data.filter((m) => getResultLabel(m) === "I").length;

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-[oklch(0.22_0.045_252)] mb-2 flex items-center gap-3">
        <Calendar size={24} className="text-[oklch(0.69_0.095_228)]" />
        Raspored i rezultati
      </h2>
      <p className="text-sm text-[oklch(0.55_0.03_252)] mb-6">
        Utakmice FK Mladost Lučani u sezoni 2025/26 · <span className="font-semibold text-green-700">{wins}P</span>{" "}
        <span className="font-semibold text-amber-600">{draws}N</span>{" "}
        <span className="font-semibold text-red-600">{losses}I</span>
      </p>

      <div className="bg-white rounded-2xl shadow-lg border border-[oklch(0.92_0.01_228)] overflow-hidden">
        <div className="divide-y divide-[oklch(0.94_0.01_228)]">
          {sorted.map((match) => {
            const resultLabel = getResultLabel(match);
            const resultColor = getResultColor(match);
            const isUpcoming = !match.score;

            return (
              <div
                key={`${match.round}-${match.home}-${match.away}`}
                className={`px-4 sm:px-6 py-4 transition-colors ${
                  isUpcoming
                    ? "bg-[oklch(0.55_0.12_240/0.06)]"
                    : "hover:bg-[oklch(0.98_0.005_228)]"
                }`}
              >
                {/* Desktop layout */}
                <div className="hidden sm:flex items-center gap-4">
                  {/* Round badge */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[oklch(0.94_0.015_228)] flex items-center justify-center">
                    <span className="text-xs font-bold text-[oklch(0.40_0.04_252)]">{match.round}.</span>
                  </div>

                  {/* Date & city */}
                  <div className="w-32 flex-shrink-0">
                    <div className="text-sm font-semibold text-[oklch(0.25_0.04_252)]">{match.date}</div>
                    {match.city && (
                      <div className="text-xs text-[oklch(0.55_0.03_252)] flex items-center gap-1 mt-0.5">
                        <MapPin size={10} />
                        {match.city}
                      </div>
                    )}
                  </div>

                  {/* Teams */}
                  <div className="flex-1 flex items-center gap-3">
                    <span className={`text-sm font-semibold text-right flex-1 truncate ${
                      match.isHome ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.25_0.04_252)]"
                    }`}>
                      {match.home}
                    </span>

                    {/* Score */}
                    <div className={`w-16 text-center font-extrabold text-lg ${
                      isUpcoming ? "text-[oklch(0.55_0.03_252)]" : resultColor
                    }`}>
                      {match.score || "—"}
                    </div>

                    <span className={`text-sm font-semibold text-left flex-1 truncate ${
                      !match.isHome ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.25_0.04_252)]"
                    }`}>
                      {match.away}
                    </span>
                  </div>

                  {/* Result badge */}
                  <div className="flex-shrink-0 w-8">
                    {resultLabel ? (
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${getResultBg(resultLabel)}`}>
                        {resultLabel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold bg-[oklch(0.55_0.12_240/0.15)] text-[oklch(0.40_0.10_240)]">
                        ?
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="sm:hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[oklch(0.55_0.03_252)]">{match.round}. kolo</span>
                    <span className="text-xs text-[oklch(0.55_0.03_252)]">{match.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className={`text-sm font-semibold truncate ${
                        match.isHome ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.25_0.04_252)]"
                      }`}>
                        {match.home}
                      </div>
                      <div className={`text-sm font-semibold truncate ${
                        !match.isHome ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.25_0.04_252)]"
                      }`}>
                        {match.away}
                      </div>
                    </div>
                    <div className={`text-lg font-extrabold ${isUpcoming ? "text-[oklch(0.55_0.03_252)]" : resultColor}`}>
                      {match.score || "—"}
                    </div>
                    {resultLabel ? (
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${getResultBg(resultLabel)}`}>
                        {resultLabel}
                      </span>
                    ) : (
                      <span className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center bg-[oklch(0.55_0.12_240/0.15)] text-[oklch(0.40_0.10_240)]">
                        ?
                      </span>
                    )}
                  </div>
                  {match.city && (
                    <div className="text-xs text-[oklch(0.55_0.03_252)] flex items-center gap-1 mt-1.5">
                      <MapPin size={10} />
                      {match.city}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-[oklch(0.55_0.03_252)] mt-4 text-right">
        Izvor: superliga.rs · Mozzart Bet Super liga Srbije
      </p>
    </div>
  );
}
