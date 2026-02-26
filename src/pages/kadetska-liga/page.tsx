import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Trophy, Target, Calendar, Star, MapPin } from "lucide-react";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";

/* ------------------------------------------------------------------ */
/*  Static fallback data — parsed from fss.rs                         */
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
  { pos: 1, club: "Vojvodina", played: 14, won: 11, drawn: 1, lost: 2, goalsFor: 36, goalsAgainst: 16, goalDiff: 20, points: 34 },
  { pos: 2, club: "Mladost Lučani", played: 14, won: 9, drawn: 3, lost: 2, goalsFor: 39, goalsAgainst: 13, goalDiff: 26, points: 30 },
  { pos: 3, club: "Partizan", played: 13, won: 9, drawn: 3, lost: 1, goalsFor: 40, goalsAgainst: 15, goalDiff: 25, points: 30 },
  { pos: 4, club: "Teleoptik", played: 14, won: 8, drawn: 2, lost: 4, goalsFor: 26, goalsAgainst: 25, goalDiff: 1, points: 26 },
  { pos: 5, club: "Crvena Zvezda", played: 12, won: 8, drawn: 1, lost: 3, goalsFor: 31, goalsAgainst: 8, goalDiff: 23, points: 25 },
  { pos: 6, club: "IMT", played: 14, won: 6, drawn: 4, lost: 4, goalsFor: 24, goalsAgainst: 21, goalDiff: 3, points: 22 },
  { pos: 7, club: "Real Niš", played: 14, won: 6, drawn: 3, lost: 5, goalsFor: 28, goalsAgainst: 35, goalDiff: -7, points: 21 },
  { pos: 8, club: "Čukarički", played: 13, won: 6, drawn: 3, lost: 4, goalsFor: 33, goalsAgainst: 20, goalDiff: 13, points: 21 },
  { pos: 9, club: "RFK Grafičar", played: 14, won: 6, drawn: 2, lost: 6, goalsFor: 37, goalsAgainst: 32, goalDiff: 5, points: 20 },
  { pos: 10, club: "TSC", played: 13, won: 4, drawn: 4, lost: 5, goalsFor: 20, goalsAgainst: 26, goalDiff: -6, points: 16 },
  { pos: 11, club: "011", played: 14, won: 5, drawn: 0, lost: 9, goalsFor: 19, goalsAgainst: 29, goalDiff: -10, points: 15 },
  { pos: 12, club: "Spartak", played: 13, won: 5, drawn: 0, lost: 8, goalsFor: 21, goalsAgainst: 33, goalDiff: -12, points: 15 },
  { pos: 13, club: "Voždovac", played: 14, won: 3, drawn: 5, lost: 6, goalsFor: 18, goalsAgainst: 27, goalDiff: -9, points: 14 },
  { pos: 14, club: "Vošini Klinci", played: 14, won: 4, drawn: 0, lost: 10, goalsFor: 21, goalsAgainst: 31, goalDiff: -10, points: 12 },
  { pos: 15, club: "Novi Pazar", played: 14, won: 1, drawn: 2, lost: 11, goalsFor: 9, goalsAgainst: 42, goalDiff: -33, points: 5 },
  { pos: 16, club: "OFK Vršac", played: 14, won: 0, drawn: 3, lost: 11, goalsFor: 7, goalsAgainst: 36, goalDiff: -29, points: 3 },
];

type TopScorer = {
  rank: number;
  name: string;
  club: string;
  goals: string;
  _highlighted?: boolean;
};

const TOP_SCORERS: TopScorer[] = [
  { rank: 1, name: "Tadija Cojić", club: "Real Niš", goals: "15" },
  { rank: 2, name: "Vasilije Guberinić", club: "Mladost L", goals: "14" },
  { rank: 3, name: "Danilo Fekete", club: "Čukarički", goals: "10" },
  { rank: 3, name: "Uroš Zdjelarić", club: "Partizan", goals: "10" },
  { rank: 5, name: "Mihajlo Radović", club: "RFK Grafičar", goals: "9" },
  { rank: 6, name: "Vahid Gicić", club: "TSC", goals: "8" },
  { rank: 7, name: "Damjan Jović", club: "Vojvodina", goals: "7" },
  { rank: 7, name: "Ivan Trailović", club: "Vojvodina", goals: "7" },
  { rank: 7, name: "Luka Trpevski", club: "RFK Grafičar", goals: "7" },
  { rank: 10, name: "Damjan Batak", club: "Partizan", goals: "6" },
  { rank: 10, name: "Matija Delibašić", club: "Vojvodina", goals: "6" },
  { rank: 10, name: "Konstantin Milovanović", club: "Čukarički", goals: "6" },
  { rank: 10, name: "Aleksa Mitić", club: "IMT", goals: "6" },
  { rank: 10, name: "Aleksa Mraović", club: "011", goals: "6" },
  { rank: 10, name: "Uroš Stevanović", club: "Mladost L", goals: "6" },
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
  { round: 1, date: "09.08.2025", home: "Mladost", away: "Teleoptik", score: "7:0", city: "Lučani", isHome: true },
  { round: 2, date: "16.08.2025", home: "TSC", away: "Mladost", score: "1:1", city: "Bačka Topola", isHome: false },
  { round: 3, date: "24.08.2025", home: "Mladost", away: "RFK Grafičar", score: "3:2", city: "Lučani", isHome: true },
  { round: 4, date: "27.08.2025", home: "OFK Vršac", away: "Mladost", score: "0:4", city: "Vršac", isHome: false },
  { round: 5, date: "31.08.2025", home: "Mladost", away: "Spartak", score: "5:1", city: "Lučani", isHome: true },
  { round: 6, date: "14.09.2025", home: "IMT", away: "Mladost", score: "0:3", city: "Novi Beograd", isHome: false },
  { round: 7, date: "20.09.2025", home: "Mladost", away: "Novi Pazar", score: "4:0", city: "Lučani", isHome: true },
  { round: 8, date: "28.09.2025", home: "Partizan", away: "Mladost", score: "2:2", city: "Zemun", isHome: false },
  { round: 9, date: "05.10.2025", home: "Mladost", away: "Vošini Klinci", score: "2:0", city: "Lučani", isHome: true },
  { round: 10, date: "18.10.2025", home: "Mladost", away: "Crvena Zvezda", score: "1:0", city: "Lučani", isHome: true },
  { round: 11, date: "22.10.2025", home: "Real Niš", away: "Mladost", score: "1:1", city: "Niš", isHome: false },
  { round: 12, date: "26.10.2025", home: "Mladost", away: "Vojvodina", score: "0:1", city: "Lučani", isHome: true },
  { round: 13, date: "02.11.2025", home: "Čukarički", away: "Mladost", score: "3:1", city: "Beograd", isHome: false },
  { round: 14, date: "05.11.2025", home: "Mladost", away: "011", score: "5:2", city: "Lučani", isHome: true },
  { round: 15, date: "22.11.2025", home: "Voždovac", away: "Mladost", score: "1:0", city: "Beograd", isHome: false },
  { round: 16, date: "29.11.2025", home: "Teleoptik", away: "Mladost", score: "3:1", city: "Zemun", isHome: false },
  { round: 17, date: "07.12.2025", home: "Mladost", away: "TSC", score: "2:0", city: "Lučani", isHome: true },
  { round: 18, date: "21.02.2026", home: "RFK Grafičar", away: "Mladost", score: "3:2", city: "Beograd", isHome: false },
  { round: 19, date: "01.03.2026", home: "Mladost", away: "OFK Vršac", city: "Lučani", isHome: true },
];

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

type Tab = "tabela" | "utakmice" | "strelci";

const TABS: { id: Tab; label: string; icon: typeof Trophy }[] = [
  { id: "tabela", label: "Tabela", icon: Trophy },
  { id: "utakmice", label: "Raspored i rezultati", icon: Calendar },
  { id: "strelci", label: "Strelci", icon: Target },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function KadetskaLigaPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tabela");

  // Database queries
  const dbStandings = useQuery(api.admin.cadetLeague.getStandings);
  const dbScorers = useQuery(api.admin.cadetLeague.getScorers);
  const dbMatches = useQuery(api.admin.cadetLeague.getMatches);

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
    : STANDINGS.map((s) => ({ ...s, _highlighted: s.club === "Mladost Lučani" }));

  const scorers: TopScorer[] = (dbScorers && dbScorers.length > 0)
    ? dbScorers.map((s) => ({
        rank: s.rank,
        name: s.name,
        club: s.club,
        goals: s.goals,
        _highlighted: s.isHighlighted,
      }))
    : TOP_SCORERS.map((s) => ({ ...s, _highlighted: s.club === "Mladost L" }));

  const matches: MatchRow[] = (dbMatches && dbMatches.length > 0)
    ? dbMatches.map((m) => ({
        round: m.round,
        date: m.date,
        home: m.home,
        away: m.away,
        score: m.score,
        city: m.city,
        isHome: m.isHome,
      }))
    : MATCHES;

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
                Kadetska Liga Srbije
              </h1>
              <p className="text-[oklch(0.65_0.03_228)] text-lg max-w-xl mb-8">
                Pratite tabelu, raspored i statistiku kadetske selekcije FK Mladost Lučani u Kadetskoj ligi Srbije.
              </p>

              {/* Quick stats */}
              {mladostRow && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Pozicija", value: `${mladostRow.pos}.` },
                    { label: "Bodovi", value: String(mladostRow.points) },
                    { label: "Gol razlika", value: `+${mladostRow.goalDiff}` },
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
        {activeTab === "strelci" && <ScorersList data={scorers} />}
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
        Tabela — Kadetska liga
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
        Izvor: fss.rs · Poslednje ažuriranje: 26. feb 2026
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
        Izvor: fss.rs · Kadetska liga Srbije 25/26
      </p>
    </div>
  );
}

/* ================================================================== */
/*  Top scorers                                                        */
/* ================================================================== */

function ScorersList({ data }: { data: TopScorer[] }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-[oklch(0.22_0.045_252)] mb-6 flex items-center gap-3">
        <Target size={24} className="text-[oklch(0.69_0.095_228)]" />
        Lista strelaca
      </h2>

      <div className="bg-white rounded-2xl shadow-lg border border-[oklch(0.92_0.01_228)] overflow-hidden">
        <div className="divide-y divide-[oklch(0.94_0.01_228)]">
          {data.map((s) => {
            const isMladost = s._highlighted ?? s.club === "Mladost L";
            return (
              <div
                key={`${s.rank}-${s.name}`}
                className={`flex items-center gap-4 px-4 sm:px-6 py-4 ${
                  isMladost ? "bg-[oklch(0.55_0.12_240/0.08)]" : "hover:bg-[oklch(0.98_0.005_228)]"
                } transition-colors`}
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0 ${
                  s.rank <= 3
                    ? "bg-[oklch(0.69_0.095_228)] text-white"
                    : "bg-[oklch(0.94_0.015_228)] text-[oklch(0.40_0.04_252)]"
                }`}>
                  {s.rank}
                </div>

                {/* Name & club */}
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm truncate ${
                    isMladost ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.25_0.04_252)]"
                  }`}>
                    {s.name}
                    {isMladost && (
                      <Star size={12} className="inline ml-1.5 text-[oklch(0.69_0.095_228)] fill-current" />
                    )}
                  </div>
                  <div className="text-xs text-[oklch(0.55_0.03_252)]">{s.club}</div>
                </div>

                {/* Goals */}
                <div className="flex-shrink-0 text-right">
                  <span className={`text-lg font-extrabold ${
                    isMladost ? "text-[oklch(0.40_0.10_240)]" : "text-[oklch(0.25_0.04_252)]"
                  }`}>
                    {s.goals}
                  </span>
                  <div className="text-[10px] text-[oklch(0.55_0.03_252)] uppercase tracking-wider">golova</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-[oklch(0.55_0.03_252)] mt-4 text-right">
        Izvor: fss.rs · Kadetska liga Srbije
      </p>
    </div>
  );
}
