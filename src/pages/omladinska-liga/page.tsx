import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Trophy, Target, Calendar, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";

/* ------------------------------------------------------------------ */
/*  Static data — parsed from fss.rs & srpskistadioni.in.rs           */
/*  Last update: 23 feb 2026 (after round 18)                        */
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
  { pos: 1, club: "Crvena Zvezda", played: 18, won: 14, drawn: 4, lost: 0, goalsFor: 61, goalsAgainst: 15, goalDiff: 46, points: 46 },
  { pos: 2, club: "IMT Novi Beograd", played: 18, won: 10, drawn: 5, lost: 3, goalsFor: 34, goalsAgainst: 22, goalDiff: 12, points: 35 },
  { pos: 3, club: "TSC", played: 18, won: 10, drawn: 3, lost: 5, goalsFor: 35, goalsAgainst: 29, goalDiff: 6, points: 33 },
  { pos: 4, club: "Spartak ZV", played: 18, won: 11, drawn: 0, lost: 7, goalsFor: 34, goalsAgainst: 28, goalDiff: 6, points: 33 },
  { pos: 5, club: "Vojvodina", played: 18, won: 9, drawn: 3, lost: 6, goalsFor: 34, goalsAgainst: 25, goalDiff: 9, points: 30 },
  { pos: 6, club: "Čukarički", played: 18, won: 8, drawn: 5, lost: 5, goalsFor: 37, goalsAgainst: 29, goalDiff: 8, points: 29 },
  { pos: 7, club: "Mladost Lučani", played: 18, won: 7, drawn: 7, lost: 4, goalsFor: 40, goalsAgainst: 21, goalDiff: 19, points: 28 },
  { pos: 8, club: "Partizan", played: 18, won: 7, drawn: 7, lost: 4, goalsFor: 33, goalsAgainst: 35, goalDiff: -2, points: 28 },
  { pos: 9, club: "Voždovac", played: 18, won: 7, drawn: 4, lost: 7, goalsFor: 27, goalsAgainst: 29, goalDiff: -2, points: 25 },
  { pos: 10, club: "Ušće Novi Beograd", played: 18, won: 7, drawn: 4, lost: 7, goalsFor: 34, goalsAgainst: 42, goalDiff: -8, points: 25 },
  { pos: 11, club: "Novi Pazar", played: 18, won: 7, drawn: 3, lost: 8, goalsFor: 34, goalsAgainst: 40, goalDiff: -6, points: 24 },
  { pos: 12, club: "OFK Beograd", played: 18, won: 6, drawn: 5, lost: 7, goalsFor: 37, goalsAgainst: 35, goalDiff: 2, points: 23 },
  { pos: 13, club: "OFK Vršac", played: 18, won: 4, drawn: 5, lost: 9, goalsFor: 17, goalsAgainst: 29, goalDiff: -12, points: 17 },
  { pos: 14, club: "Grafičar Bg", played: 18, won: 3, drawn: 3, lost: 12, goalsFor: 21, goalsAgainst: 38, goalDiff: -17, points: 12 },
  { pos: 15, club: "Napredak Kruševac", played: 18, won: 2, drawn: 2, lost: 14, goalsFor: 23, goalsAgainst: 51, goalDiff: -28, points: 8 },
  { pos: 16, club: "Borac 1926 Čačak", played: 18, won: 0, drawn: 4, lost: 14, goalsFor: 16, goalsAgainst: 49, goalDiff: -33, points: 4 },
];

type MatchResult = {
  round: number;
  date: string;
  home: string;
  away: string;
  score: string;
  isHome: boolean;
};

const MLADOST_RESULTS: MatchResult[] = [
  { round: 1, date: "09.08.2025", home: "Mladost L", away: "OFK Beograd", score: "2:1", isHome: true },
  { round: 2, date: "16.08.2025", home: "TSC", away: "Mladost L", score: "3:2", isHome: false },
  { round: 3, date: "23.08.2025", home: "Mladost L", away: "Grafičar", score: "3:0", isHome: true },
  { round: 4, date: "27.08.2025", home: "OFK Vršac", away: "Mladost L", score: "0:0", isHome: false },
  { round: 5, date: "31.08.2025", home: "Mladost L", away: "Spartak", score: "6:1", isHome: true },
  { round: 6, date: "13.09.2025", home: "IMT", away: "Mladost L", score: "1:1", isHome: false },
  { round: 7, date: "20.09.2025", home: "Mladost L", away: "Novi Pazar", score: "4:0", isHome: true },
  { round: 8, date: "27.09.2025", home: "Partizan", away: "Mladost L", score: "1:0", isHome: false },
  { round: 9, date: "04.10.2025", home: "Mladost L", away: "Borac 1926", score: "8:1", isHome: true },
  { round: 10, date: "18.10.2025", home: "Mladost L", away: "Crvena Zvezda", score: "1:1", isHome: true },
  { round: 11, date: "22.10.2025", home: "Napredak", away: "Mladost L", score: "2:5", isHome: false },
  { round: 12, date: "26.10.2025", home: "Mladost L", away: "Vojvodina", score: "0:0", isHome: true },
  { round: 13, date: "02.11.2025", home: "Čukarički", away: "Mladost L", score: "2:2", isHome: false },
  { round: 14, date: "05.11.2025", home: "Mladost L", away: "Ušće", score: "1:0", isHome: true },
  { round: 15, date: "22.11.2025", home: "Voždovac", away: "Mladost L", score: "1:0", isHome: false },
  { round: 16, date: "29.11.2025", home: "OFK Beograd", away: "Mladost L", score: "2:2", isHome: false },
  { round: 17, date: "06.12.2025", home: "Mladost L", away: "TSC", score: "3:3", isHome: true },
  { round: 18, date: "21.02.2026", home: "Grafičar", away: "Mladost L", score: "2:0", isHome: false },
];

type TopScorer = {
  rank: number;
  name: string;
  club: string;
  goals: string;
  _highlighted?: boolean;
};

const TOP_SCORERS: TopScorer[] = [
  { rank: 1, name: "Ahmed Oriyjomi Lebi", club: "IMT", goals: "16 (4)" },
  { rank: 2, name: "Adam Musa", club: "Mladost L", goals: "15" },
  { rank: 3, name: "Srđan Borovina", club: "Vojvodina", goals: "13 (2)" },
  { rank: 4, name: "Mateo Maravić", club: "Čukarički", goals: "13 (3)" },
  { rank: 5, name: "Dušan Radović", club: "Partizan", goals: "11" },
  { rank: 6, name: "Martins Idowu", club: "Ušće", goals: "11 (3)" },
  { rank: 7, name: "Matej Gaštarov", club: "C. Zvezda", goals: "9 (2)" },
  { rank: 8, name: "Jovan Popović", club: "Novi Pazar", goals: "9 (4)" },
  { rank: 9, name: "James Daniel Wisdom", club: "Spartak", goals: "8" },
  { rank: 10, name: "Lazar Peranović", club: "Vojvodina", goals: "8" },
  { rank: 11, name: "Uroš Đorđević", club: "C. Zvezda", goals: "8" },
  { rank: 12, name: "Đorđe Krivokapić", club: "Grafičar", goals: "8" },
  { rank: 13, name: "Jovan Mrvaljević", club: "OFK Beograd", goals: "8 (1)" },
  { rank: 14, name: "Davorin Tošić", club: "C. Zvezda", goals: "8 (3)" },
];

type UpcomingMatch = {
  round: number;
  date: string;
  home: string;
  away: string;
  city: string;
};

const UPCOMING_MATCHES: UpcomingMatch[] = [
  { round: 19, date: "01.03.2026", home: "Mladost L", away: "OFK Vršac", city: "Lučani" },
  { round: 20, date: "07.03.2026", home: "Spartak", away: "Mladost L", city: "Subotica" },
  { round: 21, date: "14.03.2026", home: "Mladost L", away: "IMT", city: "Lučani" },
  { round: 22, date: "21.03.2026", home: "Novi Pazar", away: "Mladost L", city: "Novi Pazar" },
  { round: 23, date: "04.04.2026", home: "Mladost L", away: "Partizan", city: "Lučani" },
  { round: 24, date: "09.04.2026", home: "Borac 1926", away: "Mladost L", city: "Čačak" },
  { round: 25, date: "18.04.2026", home: "Crvena Zvezda", away: "Mladost L", city: "Beograd" },
  { round: 26, date: "25.04.2026", home: "Mladost L", away: "Napredak", city: "Lučani" },
  { round: 27, date: "02.05.2026", home: "Vojvodina", away: "Mladost L", city: "Novi Sad" },
  { round: 28, date: "09.05.2026", home: "Mladost L", away: "Čukarički", city: "Lučani" },
  { round: 29, date: "16.05.2026", home: "Ušće", away: "Mladost L", city: "Novi Beograd" },
  { round: 30, date: "23.05.2026", home: "Mladost L", away: "Voždovac", city: "Lučani" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function mladostResult(score: string, isHome: boolean): "W" | "D" | "L" {
  const [h, a] = score.split(":").map(Number);
  const mladostGoals = isHome ? h : a;
  const opponentGoals = isHome ? a : h;
  if (mladostGoals > opponentGoals) return "W";
  if (mladostGoals < opponentGoals) return "L";
  return "D";
}

const RESULT_COLORS = {
  W: "bg-green-600 text-white",
  D: "bg-amber-500 text-white",
  L: "bg-red-600 text-white",
} as const;

const RESULT_LABELS = { W: "P", D: "N", L: "I" } as const;

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

type Tab = "tabela" | "rezultati" | "strelci" | "raspored";

const TABS: { id: Tab; label: string; icon: typeof Trophy }[] = [
  { id: "tabela", label: "Tabela", icon: Trophy },
  { id: "rezultati", label: "Rezultati", icon: Calendar },
  { id: "strelci", label: "Strelci", icon: Target },
  { id: "raspored", label: "Raspored", icon: Calendar },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OmladinskaLigaPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tabela");

  // Database queries — public (no auth required)
  const dbStandings = useQuery(api.admin.youthLeague.getStandings);
  const dbMatches = useQuery(api.admin.youthLeague.getMatches);
  const dbScorers = useQuery(api.admin.youthLeague.getScorers);

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

  const playedMatches: MatchResult[] = (dbMatches && dbMatches.length > 0)
    ? dbMatches.filter((m) => !!m.score).map((m) => ({
        round: m.round,
        date: m.date,
        home: m.home,
        away: m.away,
        score: m.score ?? "",
        isHome: m.isHome,
      }))
    : MLADOST_RESULTS;

  const upcomingMatches: UpcomingMatch[] = (dbMatches && dbMatches.length > 0)
    ? dbMatches.filter((m) => !m.score).map((m) => ({
        round: m.round,
        date: m.date,
        home: m.home,
        away: m.away,
        city: m.city ?? "",
      }))
    : UPCOMING_MATCHES;

  const scorers: TopScorer[] = (dbScorers && dbScorers.length > 0)
    ? dbScorers.map((s) => ({
        rank: s.rank,
        name: s.name,
        club: s.club,
        goals: s.goals,
        _highlighted: s.isHighlighted,
      }))
    : TOP_SCORERS.map((s) => ({ ...s, _highlighted: s.club === "Mladost L" }));

  // Mladost stats for the hero
  const mladostRow = standings.find((r) => r._highlighted) ?? standings.find((r) => r.club.includes("Mladost"));

  return (
    <div className="min-h-screen bg-[oklch(0.96_0.01_228)] text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.18_0.04_252)] via-[oklch(0.22_0.05_248)] to-[oklch(0.15_0.04_260)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.55_0.12_240/0.15),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Logo & title */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(0.55_0.12_240/0.2)] border border-[oklch(0.55_0.12_240/0.3)] text-[oklch(0.77_0.10_225)] text-sm font-semibold mb-4">
                <Star size={14} className="fill-current" />
                Sezona 2025/26
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
                Omladinska Liga Srbije
              </h1>
              <p className="text-[oklch(0.65_0.03_228)] text-lg max-w-xl mb-8">
                Pratite rezultate, tabelu i statistiku omladinske selekcije FK Mladost Lučani u Omladinskoj ligi Srbije.
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
                      <div className="text-2xl md:text-3xl font-extrabold text-[oklch(0.77_0.10_225)]">
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
                <div className="absolute inset-0 bg-[oklch(0.55_0.12_240/0.3)] blur-3xl rounded-full scale-150" />
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
        {activeTab === "rezultati" && <ResultsList data={playedMatches} />}
        {activeTab === "strelci" && <ScorersList data={scorers} />}
        {activeTab === "raspored" && <ScheduleList data={upcomingMatches} />}
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
        Tabela — 18. kolo
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
                    key={row.pos}
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
                key={row.pos}
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
        Izvor: fss.rs · Poslednje ažuriranje: 23. feb 2026
      </p>
    </div>
  );
}

/* ================================================================== */
/*  Mladost Results                                                    */
/* ================================================================== */

function ResultsList({ data }: { data: MatchResult[] }) {
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const visible = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-[oklch(0.22_0.045_252)] mb-6 flex items-center gap-3">
        <Calendar size={24} className="text-[oklch(0.69_0.095_228)]" />
        Rezultati Mladosti — Sezona 25/26
      </h2>

      {/* Form strip */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-sm font-semibold text-[oklch(0.40_0.04_252)] mr-1">Forma:</span>
        {data.map((m) => {
          const res = mladostResult(m.score, m.isHome);
          return (
            <span
              key={m.round}
              className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${RESULT_COLORS[res]}`}
              title={`Kolo ${m.round}: ${m.home} ${m.score} ${m.away}`}
            >
              {RESULT_LABELS[res]}
            </span>
          );
        })}
      </div>

      {/* Result cards */}
      <div className="space-y-3">
        {visible.map((m) => {
          const res = mladostResult(m.score, m.isHome);
          const [homeGoals, awayGoals] = m.score.split(":").map(Number);
          return (
            <div
              key={m.round}
              className="bg-white rounded-xl border border-[oklch(0.92_0.01_228)] shadow-sm overflow-hidden"
            >
              <div className="flex items-stretch">
                {/* Result indicator */}
                <div className={`w-1.5 flex-shrink-0 ${
                  res === "W" ? "bg-green-500" : res === "D" ? "bg-amber-400" : "bg-red-500"
                }`} />

                <div className="flex-1 px-4 py-3 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                    {/* Round & date */}
                    <div className="text-xs text-[oklch(0.55_0.03_252)] font-medium">
                      <span className="font-bold text-[oklch(0.40_0.04_252)]">Kolo {m.round}</span>
                      {" · "}
                      {m.date}
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${RESULT_COLORS[res]}`}>
                      {res === "W" ? "Pobeda" : res === "D" ? "Nerešeno" : "Poraz"}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-2">
                    <span className={`flex-1 text-right text-sm font-semibold truncate ${
                      m.isHome ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.30_0.04_252)]"
                    }`}>
                      {m.home}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="bg-[oklch(0.22_0.045_252)] text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold">
                        {homeGoals}
                      </span>
                      <span className="text-[oklch(0.50_0.03_252)] text-xs">:</span>
                      <span className="bg-[oklch(0.22_0.045_252)] text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold">
                        {awayGoals}
                      </span>
                    </div>
                    <span className={`flex-1 text-left text-sm font-semibold truncate ${
                      !m.isHome ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.30_0.04_252)]"
                    }`}>
                      {m.away}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg bg-white border border-[oklch(0.90_0.015_228)] disabled:opacity-30 hover:bg-[oklch(0.96_0.01_228)] transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-[oklch(0.40_0.04_252)]">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-2 rounded-lg bg-white border border-[oklch(0.90_0.015_228)] disabled:opacity-30 hover:bg-[oklch(0.96_0.01_228)] transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
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
                key={s.name}
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
        Broj u zagradi = golovi iz penala · Izvor: srpskistadioni.in.rs
      </p>
    </div>
  );
}

/* ================================================================== */
/*  Upcoming schedule                                                  */
/* ================================================================== */

function ScheduleList({ data }: { data: UpcomingMatch[] }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-[oklch(0.22_0.045_252)] mb-6 flex items-center gap-3">
        <Calendar size={24} className="text-[oklch(0.69_0.095_228)]" />
        Raspored — Prolećni deo
      </h2>

      <div className="space-y-3">
        {data.map((m) => {
          const isHome = m.home.includes("Mladost");
          return (
            <div
              key={m.round}
              className="bg-white rounded-xl border border-[oklch(0.92_0.01_228)] shadow-sm px-4 sm:px-6 py-4"
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="text-xs font-bold text-[oklch(0.40_0.04_252)]">
                  Kolo {m.round}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isHome
                      ? "bg-[oklch(0.55_0.12_240/0.15)] text-[oklch(0.40_0.10_240)]"
                      : "bg-[oklch(0.94_0.015_228)] text-[oklch(0.50_0.03_252)]"
                  }`}>
                    {isHome ? "DOMAĆIN" : "GOST"}
                  </span>
                  <span className="text-xs text-[oklch(0.55_0.03_252)]">{m.date}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <span className={`flex-1 text-right text-sm font-semibold truncate ${
                  isHome ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.30_0.04_252)]"
                }`}>
                  {m.home}
                </span>
                <span className="text-[oklch(0.55_0.03_252)] text-xs font-bold">vs</span>
                <span className={`flex-1 text-left text-sm font-semibold truncate ${
                  !isHome ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.30_0.04_252)]"
                }`}>
                  {m.away}
                </span>
              </div>

              <div className="text-xs text-center text-[oklch(0.55_0.03_252)] mt-2">
                {m.city}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
