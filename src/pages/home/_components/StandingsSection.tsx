import { useQuery } from "@tanstack/react-query";
import { standingsApi } from "@/lib/api.ts";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";

// Fallback data for when database is empty
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

export default function StandingsSection() {
  const { data: standings, isLoading } = useQuery({
    queryKey: ["standings"],
    queryFn: () => standingsApi.get(),
  });
  const rows = standings && standings.length > 0 ? standings : FALLBACK_STANDINGS;

  return (
    <div className="lg:col-span-7">
      <div className="flex justify-between items-end mb-6 pt-2">
        <h3 className="text-2xl font-extrabold text-foreground uppercase tracking-tight">
          Tabela{" "}
          <span className="text-accent ml-2">Superlige</span>
        </h3>
        <button className="hidden sm:flex items-center text-accent font-semibold hover:text-accent/80 transition-colors text-sm bg-secondary px-4 py-2 rounded-full border border-border">
          Kompletna tabela <ArrowRight size={14} className="ml-1" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden shadow-2xl rounded-3xl border border-border bg-card">
          <table className="min-w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs text-muted-foreground uppercase bg-muted border-b border-border">
              <tr>
                <th className="px-5 py-4 text-center w-12 font-bold">#</th>
                <th className="px-5 py-4 font-bold">Klub</th>
                <th className="px-5 py-4 text-center hidden sm:table-cell font-bold">
                  Odig
                </th>
                <th className="px-5 py-4 text-center hidden md:table-cell font-bold">
                  Pob
                </th>
                <th className="px-5 py-4 text-center hidden sm:table-cell font-bold">
                  GR
                </th>
                <th className="px-5 py-4 text-center font-black text-foreground bg-muted/80">
                  Bod
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.position}
                  className={`border-b border-border/50 transition-colors hover:bg-muted/50 group ${
                    row.isHighlighted
                      ? "bg-accent/5 relative"
                      : "bg-card"
                  }`}
                >
                  {row.isHighlighted && (
                    <td className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
                  )}
                  <td
                    className={`px-5 py-4 text-center font-bold ${
                      row.isHighlighted
                        ? "text-accent"
                        : "text-muted-foreground"
                    }`}
                  >
                    {row.position}.
                  </td>
                  <td
                    className={`px-5 py-4 flex items-center ${
                      row.isHighlighted
                        ? "text-foreground font-black"
                        : "text-foreground font-semibold"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center text-[8px] font-bold text-white shadow-sm ${
                        row.isHighlighted
                          ? "bg-accent"
                          : "bg-muted-foreground/40"
                      }`}
                    >
                      {row.team.substring(0, 3).toUpperCase()}
                    </div>
                    {row.team}
                  </td>
                  <td className="px-5 py-4 text-center hidden sm:table-cell">
                    {row.played}
                  </td>
                  <td className="px-5 py-4 text-center hidden md:table-cell">
                    {row.wins}
                  </td>
                  <td className="px-5 py-4 text-center hidden sm:table-cell text-muted-foreground">
                    {row.goalDifference}
                  </td>
                  <td
                    className={`px-5 py-4 text-center font-black text-lg ${
                      row.isHighlighted
                        ? "text-accent bg-accent/5"
                        : "text-foreground bg-muted/30"
                    }`}
                  >
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
