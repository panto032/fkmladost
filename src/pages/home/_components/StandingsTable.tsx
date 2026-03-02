import type { Standing } from "@/lib/api.ts";

type StandingRow = Standing;

/* ── Form dot colors ── */
function formColor(ch: string): string {
  switch (ch.toUpperCase()) {
    case "W":
      return "bg-emerald-500";
    case "D":
      return "bg-amber-400";
    case "L":
      return "bg-red-500";
    default:
      return "bg-muted-foreground/30";
  }
}

/* ── Position zone indicator ── */
function zoneClass(pos: number, total: number): string {
  if (pos <= 1) return "bg-emerald-500"; // Champions path
  if (pos <= 3) return "bg-sky-500"; // European
  if (pos > total - 3) return "bg-red-500"; // Relegation
  return "bg-transparent";
}

export default function StandingsTable({
  standings,
}: {
  standings: StandingRow[];
}) {
  const total = standings.length;

  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-lg flex flex-col h-full">
      {/* ── Header ── */}
      <div className="bg-primary px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-white/15 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-4 h-4 text-primary-foreground"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9ZM18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9Z" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <h3 className="text-sm font-extrabold text-primary-foreground uppercase tracking-wider">
            Superliga
          </h3>
          <span className="text-[10px] text-primary-foreground/50 font-medium">
            2025/26
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted/60 text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
              <th className="w-1 p-0" />
              <th className="py-2.5 pl-2 pr-1 text-center w-7">#</th>
              <th className="py-2.5 px-2 text-left">Klub</th>
              <th className="py-2.5 px-1 text-center hidden sm:table-cell w-8">
                OM
              </th>
              <th className="py-2.5 px-1 text-center hidden md:table-cell w-7">
                P
              </th>
              <th className="py-2.5 px-1 text-center hidden md:table-cell w-7">
                N
              </th>
              <th className="py-2.5 px-1 text-center hidden md:table-cell w-7">
                I
              </th>
              <th className="py-2.5 px-1 text-center hidden sm:table-cell w-9">
                GR
              </th>
              <th className="py-2.5 px-1 text-center hidden lg:table-cell w-20">
                Forma
              </th>
              <th className="py-2.5 px-2 text-center w-11 font-black">BOD</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, idx) => {
              const isOurTeam = row.isHighlighted;
              const isLast = idx === standings.length - 1;
              const formChars = (row.form ?? "").slice(-5).split("");

              return (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    isOurTeam
                      ? "bg-accent/10 hover:bg-accent/15"
                      : idx % 2 === 0
                        ? "bg-card hover:bg-muted/30"
                        : "bg-muted/10 hover:bg-muted/30"
                  } ${!isLast ? "border-b border-border/30" : ""}`}
                >
                  {/* Zone indicator bar */}
                  <td className="w-1 p-0">
                    <div
                      className={`w-[3px] h-full min-h-[40px] ${zoneClass(row.position, total)} ${
                        isOurTeam ? "!bg-accent" : ""
                      }`}
                    />
                  </td>

                  {/* Position */}
                  <td
                    className={`py-2 pl-2 pr-1 text-center font-bold ${
                      isOurTeam ? "text-accent" : "text-muted-foreground"
                    }`}
                  >
                    {row.position}
                  </td>

                  {/* Team */}
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {row.logoUrl ? (
                        <img
                          src={row.logoUrl}
                          alt={row.team}
                          className="w-5 h-5 object-contain flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[6px] font-bold text-white flex-shrink-0 ${
                            isOurTeam
                              ? "bg-accent"
                              : "bg-muted-foreground/30"
                          }`}
                        >
                          {row.team.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span
                        className={`truncate ${
                          isOurTeam
                            ? "font-extrabold text-accent"
                            : "font-medium text-card-foreground"
                        }`}
                      >
                        {row.team}
                      </span>
                    </div>
                  </td>

                  {/* Matches played */}
                  <td className="py-2 px-1 text-center text-muted-foreground hidden sm:table-cell">
                    {row.played}
                  </td>

                  {/* W D L */}
                  <td className="py-2 px-1 text-center text-muted-foreground hidden md:table-cell">
                    {row.wins}
                  </td>
                  <td className="py-2 px-1 text-center text-muted-foreground hidden md:table-cell">
                    {row.draws}
                  </td>
                  <td className="py-2 px-1 text-center text-muted-foreground hidden md:table-cell">
                    {row.losses}
                  </td>

                  {/* Goal diff */}
                  <td className="py-2 px-1 text-center hidden sm:table-cell">
                    <span
                      className={`font-semibold ${
                        row.goalDifference.startsWith("+")
                          ? "text-emerald-600 dark:text-emerald-400"
                          : row.goalDifference.startsWith("-")
                            ? "text-red-500"
                            : "text-muted-foreground"
                      }`}
                    >
                      {row.goalDifference}
                    </span>
                  </td>

                  {/* Form */}
                  <td className="py-2 px-1 hidden lg:table-cell">
                    <div className="flex items-center justify-center gap-[3px]">
                      {formChars.length > 0
                        ? formChars.map((ch, i) => (
                            <div
                              key={i}
                              className={`w-[7px] h-[7px] rounded-full ${formColor(ch)}`}
                              title={
                                ch === "W"
                                  ? "Pobeda"
                                  : ch === "D"
                                    ? "Nerešeno"
                                    : "Poraz"
                              }
                            />
                          ))
                        : Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-[7px] h-[7px] rounded-full bg-muted-foreground/20"
                            />
                          ))}
                    </div>
                  </td>

                  {/* Points */}
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-6 rounded font-black text-sm ${
                        isOurTeam
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted/40 text-card-foreground"
                      }`}
                    >
                      {row.points}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Legend ── */}
      <div className="px-4 py-2.5 border-t border-border/40 flex items-center gap-4 text-[9px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Pobeda</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Nerešeno</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Poraz</span>
        </div>
      </div>
    </div>
  );
}
