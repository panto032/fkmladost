import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";

const POSITION_ORDER = ["Golman", "Odbrana", "Vezni red", "Napad"];

type Player = {
  _id: string;
  name: string;
  number: number;
  position: string;
  imageUrl: string;
  nationality?: string;
  birthDate?: string;
};

function groupByPosition(players: Player[]) {
  const groups: Record<string, Player[]> = {};
  for (const pos of POSITION_ORDER) {
    groups[pos] = [];
  }
  for (const p of players) {
    if (groups[p.position]) {
      groups[p.position].push(p);
    } else {
      if (!groups["Ostalo"]) groups["Ostalo"] = [];
      groups["Ostalo"].push(p);
    }
  }
  return groups;
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-t-xl bg-[oklch(0.20_0.04_250)] aspect-[3/4]">
        <img
          src={player.imageUrl}
          alt={player.name}
          className="w-full h-full object-cover group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.02_250)] via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-0 right-0 bg-[oklch(0.55_0.18_250)] text-white font-black text-2xl md:text-4xl p-2 md:p-3 rounded-tl-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
          {player.number}
        </div>
      </div>
      <div className="bg-[oklch(0.20_0.04_250)] p-4 rounded-b-xl border-t-2 border-[oklch(0.55_0.18_250)] group-hover:bg-[oklch(0.22_0.06_250)] transition-colors">
        <h5 className="font-bold text-lg md:text-xl truncate text-white">{player.name}</h5>
        <p className="text-[oklch(0.65_0.18_250)] text-sm">{player.position}</p>
        {player.nationality && (
          <p className="text-[oklch(0.50_0.03_250)] text-xs mt-1">{player.nationality}</p>
        )}
      </div>
    </div>
  );
}

export default function PrviTimPage() {
  const players = useQuery(api.players.getAll);
  const isLoading = players === undefined;

  const groups = players ? groupByPosition(players) : {};

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Hero banner */}
      <section className="relative bg-[oklch(0.14_0.02_250)] text-white py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.22_0.06_250)] to-[oklch(0.14_0.02_250)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-[oklch(0.65_0.12_250)] hover:text-white text-sm font-medium transition-colors mb-6"
          >
            <ArrowLeft size={16} className="mr-1" /> Nazad na početnu
          </Link>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight uppercase">
            Prvi <span className="text-[oklch(0.65_0.18_250)]">Tim</span>
          </h2>
          <p className="text-lg text-[oklch(0.55_0.06_250)] max-w-2xl mt-3">
            Kompletni roster FK Mladost Lučani za sezonu 2025/2026
          </p>
        </div>
      </section>

      {/* Players by position */}
      <section className="bg-[oklch(0.14_0.02_250)] pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="space-y-12">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-8 w-32 mb-6 bg-white/10" />
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="aspect-[3/4] rounded-xl bg-white/10" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {POSITION_ORDER.map((pos) => {
                const group = groups[pos];
                if (!group || group.length === 0) return null;
                return (
                  <div key={pos}>
                    <h3 className="text-2xl font-extrabold text-white uppercase tracking-tight mb-6 border-b border-[oklch(0.25_0.04_250)] pb-3">
                      {pos}
                      <span className="text-[oklch(0.55_0.18_250)] ml-3 text-lg font-medium lowercase">
                        ({group.length})
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      {group.map((player) => (
                        <PlayerCard key={player._id} player={player} />
                      ))}
                    </div>
                  </div>
                );
              })}
              {groups["Ostalo"] && groups["Ostalo"].length > 0 && (
                <div>
                  <h3 className="text-2xl font-extrabold text-white uppercase tracking-tight mb-6 border-b border-[oklch(0.25_0.04_250)] pb-3">
                    Ostalo
                    <span className="text-[oklch(0.55_0.18_250)] ml-3 text-lg font-medium lowercase">
                      ({groups["Ostalo"].length})
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {groups["Ostalo"].map((player) => (
                      <PlayerCard key={player._id} player={player} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
