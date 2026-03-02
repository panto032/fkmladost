import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { pioneerLeagueApi } from "@/lib/api.ts";
import { Trophy, Calendar, Star, MapPin } from "lucide-react";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";

/* ------------------------------------------------------------------ */
/*  Static fallback data — Pioneer League 2025/26                     */
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
  isHighlighted?: boolean;
};

const STANDINGS: StandingRow[] = [
  { pos: 1, club: "Radnički 1923", played: 15, won: 15, drawn: 0, lost: 0, goalsFor: 79, goalsAgainst: 3, goalDiff: 76, points: 45, isHighlighted: false },
  { pos: 2, club: "Mladost", played: 15, won: 13, drawn: 1, lost: 1, goalsFor: 43, goalsAgainst: 7, goalDiff: 36, points: 40, isHighlighted: true },
  { pos: 3, club: "Novi Pazar", played: 15, won: 10, drawn: 2, lost: 3, goalsFor: 35, goalsAgainst: 16, goalDiff: 19, points: 32, isHighlighted: false },
  { pos: 4, club: "Apolon 2018", played: 15, won: 9, drawn: 1, lost: 5, goalsFor: 19, goalsAgainst: 14, goalDiff: 5, points: 28, isHighlighted: false },
  { pos: 5, club: "Loznica", played: 15, won: 8, drawn: 2, lost: 5, goalsFor: 36, goalsAgainst: 33, goalDiff: 3, points: 26, isHighlighted: false },
  { pos: 6, club: "Pazar Juniors", played: 15, won: 7, drawn: 3, lost: 5, goalsFor: 35, goalsAgainst: 26, goalDiff: 9, points: 24, isHighlighted: false },
  { pos: 7, club: "Mačva", played: 15, won: 7, drawn: 1, lost: 7, goalsFor: 32, goalsAgainst: 27, goalDiff: 5, points: 22, isHighlighted: false },
  { pos: 8, club: "Apolon 4", played: 15, won: 7, drawn: 1, lost: 7, goalsFor: 29, goalsAgainst: 28, goalDiff: 1, points: 22, isHighlighted: false },
  { pos: 9, club: "Kiker", played: 15, won: 7, drawn: 0, lost: 8, goalsFor: 26, goalsAgainst: 32, goalDiff: -6, points: 21, isHighlighted: false },
  { pos: 10, club: "Radnički (VA)", played: 15, won: 5, drawn: 4, lost: 6, goalsFor: 17, goalsAgainst: 28, goalDiff: -11, points: 19, isHighlighted: false },
  { pos: 11, club: "Petlić SD2006", played: 15, won: 4, drawn: 3, lost: 8, goalsFor: 13, goalsAgainst: 29, goalDiff: -16, points: 15, isHighlighted: false },
  { pos: 12, club: "GFK Sloboda", played: 15, won: 4, drawn: 2, lost: 9, goalsFor: 25, goalsAgainst: 28, goalDiff: -3, points: 14, isHighlighted: false },
  { pos: 13, club: "Borac 1926", played: 15, won: 4, drawn: 1, lost: 10, goalsFor: 11, goalsAgainst: 40, goalDiff: -29, points: 13, isHighlighted: false },
  { pos: 14, club: "Smederevo 1924", played: 15, won: 3, drawn: 2, lost: 10, goalsFor: 14, goalsAgainst: 37, goalDiff: -23, points: 11, isHighlighted: false },
  { pos: 15, club: "FK Sunrise Šabac", played: 15, won: 3, drawn: 0, lost: 12, goalsFor: 10, goalsAgainst: 39, goalDiff: -29, points: 9, isHighlighted: false },
  { pos: 16, club: "Respekt", played: 15, won: 2, drawn: 1, lost: 12, goalsFor: 18, goalsAgainst: 55, goalDiff: -37, points: 7, isHighlighted: false },
];

type MatchRow = {
  round: number;
  date: string;
  home: string;
  away: string;
  score?: string;
  city?: string;
};

const MATCHES: MatchRow[] = [
  // Round 1
  { round: 1, date: "09.08.2025", home: "Radnički 1923", away: "Loznica", score: "5:0", city: "Kumodraž" },
  { round: 1, date: "09.08.2025", home: "Mladost", away: "Kiker", score: "4:1", city: "Čačak" },
  { round: 1, date: "09.08.2025", home: "Novi Pazar", away: "Petlić SD2006", score: "2:0", city: "Novi Pazar" },
  { round: 1, date: "09.08.2025", home: "Apolon 2018", away: "Smederevo 1924", score: "1:0", city: "Voždovac" },
  { round: 1, date: "09.08.2025", home: "Pazar Juniors", away: "FK Sunrise Šabac", score: "3:1", city: "Užice" },
  { round: 1, date: "09.08.2025", home: "Mačva", away: "Borac 1926", score: "2:0", city: "Šabac" },
  { round: 1, date: "09.08.2025", home: "Apolon 4", away: "GFK Sloboda", score: "1:1", city: "Voždovac" },
  { round: 1, date: "09.08.2025", home: "Radnički (VA)", away: "Respekt", score: "2:1", city: "Vranje" },

  // Round 2
  { round: 2, date: "16.08.2025", home: "Loznica", away: "Radnički 1923", score: "0:6", city: "Loznica" },
  { round: 2, date: "16.08.2025", home: "Kiker", away: "Novo Pazar", score: "1:3", city: "Kruševac" },
  { round: 2, date: "16.08.2025", home: "Petlić SD2006", away: "Mladost", score: "0:4", city: "Lazarevac" },
  { round: 2, date: "16.08.2025", home: "Smederevo 1924", away: "Mačva", score: "1:2", city: "Smederevo" },
  { round: 2, date: "16.08.2025", home: "FK Sunrise Šabac", away: "Apolon 2018", score: "0:3", city: "Šabac" },
  { round: 2, date: "16.08.2025", home: "Borac 1926", away: "Pazar Juniors", score: "0:2", city: "Čačak" },
  { round: 2, date: "16.08.2025", home: "GFK Sloboda", away: "Radnički (VA)", score: "1:2", city: "Beograd" },
  { round: 2, date: "16.08.2025", home: "Respekt", away: "Apolon 4", score: "0:1", city: "Vranje" },

  // Round 3
  { round: 3, date: "24.08.2025", home: "Radnički 1923", away: "Kiker", score: "7:0", city: "Kumodraž" },
  { round: 3, date: "24.08.2025", home: "Mladost", away: "Loznica", score: "3:0", city: "Čačak" },
  { round: 3, date: "24.08.2025", home: "Novi Pazar", away: "Apolon 2018", score: "2:1", city: "Novi Pazar" },
  { round: 3, date: "24.08.2025", home: "Mačva", away: "Petlić SD2006", score: "3:1", city: "Šabac" },
  { round: 3, date: "24.08.2025", home: "Pazar Juniors", away: "Smederevo 1924", score: "2:0", city: "Užice" },
  { round: 3, date: "24.08.2025", home: "Apolon 4", away: "FK Sunrise Šabac", score: "2:0", city: "Voždovac" },
  { round: 3, date: "24.08.2025", home: "Borac 1926", away: "GFK Sloboda", score: "0:2", city: "Čačak" },
  { round: 3, date: "24.08.2025", home: "Radnički (VA)", away: "Respekt", score: "1:0", city: "Vranje" },

  // Round 4
  { round: 4, date: "27.08.2025", home: "Kiker", away: "Radnički 1923", score: "0:8", city: "Kruševac" },
  { round: 4, date: "27.08.2025", home: "Loznica", away: "Novi Pazar", score: "1:2", city: "Loznica" },
  { round: 4, date: "27.08.2025", home: "Apolon 2018", away: "Mačva", score: "1:0", city: "Voždovac" },
  { round: 4, date: "27.08.2025", home: "Petlić SD2006", away: "Pazar Juniors", score: "0:3", city: "Lazarevac" },
  { round: 4, date: "27.08.2025", home: "Smederevo 1924", away: "Apolon 4", score: "0:1", city: "Smederevo" },
  { round: 4, date: "27.08.2025", home: "FK Sunrise Šabac", away: "Borac 1926", score: "1:1", city: "Šabac" },
  { round: 4, date: "27.08.2025", home: "GFK Sloboda", away: "Radnički (VA)", score: "0:1", city: "Beograd" },
  { round: 4, date: "27.08.2025", home: "Respekt", away: "Mladost", score: "0:5", city: "Vranje" },

  // Round 5
  { round: 5, date: "31.08.2025", home: "Radnički 1923", away: "Loznica", score: "6:0", city: "Kumodraž" },
  { round: 5, date: "31.08.2025", home: "Mladost", away: "Apolon 2018", score: "3:1", city: "Čačak" },
  { round: 5, date: "31.08.2025", home: "Novi Pazar", away: "Kiker", score: "3:0", city: "Novi Pazar" },
  { round: 5, date: "31.08.2025", home: "Mačva", away: "FK Sunrise Šabac", score: "2:0", city: "Šabac" },
  { round: 5, date: "31.08.2025", home: "Pazar Juniors", away: "Borac 1926", score: "2:0", city: "Užice" },
  { round: 5, date: "31.08.2025", home: "Apolon 4", away: "Petlić SD2006", score: "3:1", city: "Voždovac" },
  { round: 5, date: "31.08.2025", home: "Smederevo 1924", away: "Radnički (VA)", score: "0:2", city: "Smederevo" },
  { round: 5, date: "31.08.2025", home: "Respekt", away: "GFK Sloboda", score: "1:2", city: "Vranje" },

  // Remaining rounds (without scores - scheduled)
  { round: 6, date: "14.09.2025", home: "Kiker", away: "Mladost", city: "Kruševac" },
  { round: 6, date: "14.09.2025", home: "Loznica", away: "Mačva", city: "Loznica" },
  { round: 6, date: "14.09.2025", home: "Apolon 2018", away: "Respekt", city: "Voždovac" },
  { round: 6, date: "14.09.2025", home: "Petlić SD2006", away: "Radnički 1923", city: "Lazarevac" },
  { round: 6, date: "14.09.2025", home: "Smederevo 1924", away: "Novi Pazar", city: "Smederevo" },
  { round: 6, date: "14.09.2025", home: "FK Sunrise Šabac", away: "Radnički (VA)", city: "Šabac" },
  { round: 6, date: "14.09.2025", home: "GFK Sloboda", away: "Pazar Juniors", city: "Beograd" },
  { round: 6, date: "14.09.2025", home: "Borac 1926", away: "Apolon 4", city: "Čačak" },
];

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

type Tab = "tabela" | "utakmice";

const TABS: { id: Tab; label: string; icon: typeof Trophy }[] = [
  { id: "tabela", label: "Tabela", icon: Trophy },
  { id: "utakmice", label: "Raspored i rezultati", icon: Calendar },
];

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function PionirskeLigaPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tabela");

  // Database queries
  const { data: dbStandings } = useQuery({
    queryKey: ["pioneerLeague", "standings"],
    queryFn: () => pioneerLeagueApi.getStandings(),
  });
  const { data: dbMatches } = useQuery({
    queryKey: ["pioneerLeague", "matches"],
    queryFn: () => pioneerLeagueApi.getMatches(),
  });

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
        isHighlighted: s.isHighlighted,
      }))
    : STANDINGS;

  const matches: MatchRow[] = (dbMatches && dbMatches.length > 0)
    ? dbMatches.map((m) => ({
        round: m.round,
        date: m.date,
        home: m.home,
        away: m.away,
        score: m.score,
        city: m.city,
      }))
    : MATCHES;

  // Mladost stats for the hero
  const mladostRow = standings.find((r) => r.isHighlighted) ?? standings.find((r) => r.club.includes("Mladost"));

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
                Prva Pionirska Liga FSRZS
              </h1>
              <p className="text-[oklch(0.65_0.03_228)] text-lg max-w-xl mb-8">
                Pratite tabelu i kompletne rezultate Prve pionirske lige FSRZS — Fudbalski savez regiona Zapadne Srbije.
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
                  alt="FK Mladost"
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
        Tabela — Pionirska liga
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
                const isMladost = row.isHighlighted ?? row.club.includes("Mladost");
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
            const isMladost = row.isHighlighted ?? row.club.includes("Mladost");
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
        Izvor: FSRZS — Analyticom COMET
      </p>
    </div>
  );
}

/* ================================================================== */
/*  Matches List (grouped by round)                                   */
/* ================================================================== */

function MatchesList({ data }: { data: MatchRow[] }) {
  // Group matches by round
  const matchesByRound = data.reduce(
    (acc, match) => {
      if (!acc[match.round]) {
        acc[match.round] = [];
      }
      acc[match.round].push(match);
      return acc;
    },
    {} as Record<number, MatchRow[]>
  );

  // Sort rounds in descending order (most recent first)
  const sortedRounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-[oklch(0.22_0.045_252)] mb-6 flex items-center gap-3">
        <Calendar size={24} className="text-[oklch(0.69_0.095_228)]" />
        Raspored i rezultati
      </h2>

      <div className="space-y-8">
        {sortedRounds.map((round) => {
          const roundMatches = matchesByRound[round];
          return (
            <div key={round} className="bg-white rounded-2xl shadow-lg border border-[oklch(0.92_0.01_228)] overflow-hidden">
              {/* Round header */}
              <div className="bg-[oklch(0.22_0.045_252)] px-4 sm:px-6 py-3">
                <h3 className="text-white font-bold text-lg">Kolo {round}</h3>
              </div>

              {/* Matches in this round */}
              <div className="divide-y divide-[oklch(0.94_0.01_228)]">
                {roundMatches.map((match) => {
                  const isMladostInvolved = match.home.includes("Mladost") || match.away.includes("Mladost");
                  const isUpcoming = !match.score;
                  const homeIsMladost = match.home.includes("Mladost");
                  const awayIsMladost = match.away.includes("Mladost");

                  return (
                    <div
                      key={`${match.round}-${match.home}-${match.away}`}
                      className={`px-4 sm:px-6 py-4 transition-colors ${
                        isMladostInvolved && !isUpcoming
                          ? "bg-[oklch(0.55_0.12_240/0.06)]"
                          : isUpcoming
                            ? "bg-[oklch(0.55_0.12_240/0.04)]"
                            : "hover:bg-[oklch(0.98_0.005_228)]"
                      }`}
                    >
                      {/* Desktop layout */}
                      <div className="hidden sm:flex items-center gap-4">
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
                            homeIsMladost ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.25_0.04_252)]"
                          }`}>
                            {match.home}
                          </span>

                          {/* Score */}
                          <div className="w-16 text-center font-extrabold text-lg text-[oklch(0.25_0.04_252)]">
                            {match.score || "UNESEN"}
                          </div>

                          <span className={`text-sm font-semibold text-left flex-1 truncate ${
                            awayIsMladost ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.25_0.04_252)]"
                          }`}>
                            {match.away}
                          </span>
                        </div>
                      </div>

                      {/* Mobile layout */}
                      <div className="sm:hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-[oklch(0.55_0.03_252)]">{match.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className={`text-sm font-semibold truncate ${
                              homeIsMladost ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.25_0.04_252)]"
                            }`}>
                              {match.home}
                            </div>
                            <div className={`text-sm font-semibold truncate ${
                              awayIsMladost ? "text-[oklch(0.40_0.10_240)] font-extrabold" : "text-[oklch(0.25_0.04_252)]"
                            }`}>
                              {match.away}
                            </div>
                          </div>
                          <div className="text-lg font-extrabold text-[oklch(0.25_0.04_252)]">
                            {match.score || "UNESEN"}
                          </div>
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
          );
        })}
      </div>

      <p className="text-xs text-[oklch(0.55_0.03_252)] mt-4 text-right">
        Izvor: FSRZS — Analyticom COMET
      </p>
    </div>
  );
}
