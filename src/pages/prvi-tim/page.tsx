import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog.tsx";
import { ArrowLeft, ExternalLink, User, Trophy, Clock, Target, Footprints, Shield, SquareSlash } from "lucide-react";
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
  appearances?: number;
  goals?: number;
  assists?: number;
  minutes?: number;
  goalsConceded?: number;
  yellowCards?: number;
  height?: string;
  weight?: string;
  superligaUrl?: string;
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

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col items-center bg-[oklch(0.16_0.035_252)] rounded-xl p-3 md:p-4">
      <div className="text-[oklch(0.69_0.095_228)] mb-1">{icon}</div>
      <span className="text-white font-bold text-lg md:text-xl">{value}</span>
      <span className="text-[oklch(0.50_0.03_252)] text-xs mt-0.5">
        {label}
      </span>
    </div>
  );
}

function PlayerBioModal({
  player,
  open,
  onOpenChange,
}: {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!player) return null;

  const hasStats =
    player.appearances !== undefined ||
    player.goals !== undefined ||
    player.assists !== undefined ||
    player.minutes !== undefined ||
    player.goalsConceded !== undefined ||
    player.yellowCards !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[oklch(0.20_0.04_252)] border-[oklch(0.28_0.04_252)] text-white p-0 overflow-hidden sm:max-w-xl max-h-[90vh] overflow-y-auto"
        showCloseButton
      >
        {/* Hero image — portrait-friendly, no crop */}
        <div className="relative bg-[oklch(0.14_0.03_252)] overflow-hidden">
          {player.imageUrl ? (
            <img
              src={player.imageUrl}
              alt={player.name}
              className="w-full max-h-[50vh] object-contain mx-auto"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center">
              <User size={80} className="text-[oklch(0.30_0.04_252)]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.20_0.04_252)] via-transparent to-transparent pointer-events-none" />
          {/* Jersey number badge */}
          <div className="absolute bottom-3 right-3 bg-[oklch(0.69_0.095_228)] text-white font-black text-3xl md:text-5xl px-4 py-2 rounded-xl shadow-lg">
            {player.number}
          </div>
        </div>

        {/* Info section */}
        <div className="px-5 pb-5 -mt-2 space-y-4">
          <DialogTitle className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {player.name}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="inline-flex items-center bg-[oklch(0.69_0.095_228)]/15 text-[oklch(0.77_0.10_225)] rounded-full px-3 py-1 font-medium">
                {player.position}
              </span>
              {player.nationality && (
                <span className="inline-flex items-center bg-[oklch(0.26_0.04_252)] text-[oklch(0.65_0.03_228)] rounded-full px-3 py-1">
                  {player.nationality}
                </span>
              )}
              {player.birthDate && (
                <span className="inline-flex items-center bg-[oklch(0.26_0.04_252)] text-[oklch(0.65_0.03_228)] rounded-full px-3 py-1">
                  {player.birthDate}
                </span>
              )}
              {player.height && (
                <span className="inline-flex items-center bg-[oklch(0.26_0.04_252)] text-[oklch(0.65_0.03_228)] rounded-full px-3 py-1">
                  {player.height}
                </span>
              )}
              {player.weight && (
                <span className="inline-flex items-center bg-[oklch(0.26_0.04_252)] text-[oklch(0.65_0.03_228)] rounded-full px-3 py-1">
                  {player.weight}
                </span>
              )}
            </div>
          </DialogDescription>

          {/* Season stats grid */}
          {hasStats && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.50_0.03_252)] mb-2">
                Statistika sezone
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <StatItem
                  icon={<Footprints size={18} />}
                  label="Nastupi"
                  value={player.appearances ?? 0}
                />
                <StatItem
                  icon={<Clock size={18} />}
                  label="Minuti"
                  value={player.minutes ?? 0}
                />
                {player.position === "Golman" ? (
                  <StatItem
                    icon={<Shield size={18} />}
                    label="Primljeni"
                    value={player.goalsConceded ?? 0}
                  />
                ) : (
                  <StatItem
                    icon={<Target size={18} />}
                    label="Golovi"
                    value={player.goals ?? 0}
                  />
                )}
              </div>
            </div>
          )}

          {/* External link */}
          {player.superligaUrl && (
            <a
              href={player.superligaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[oklch(0.69_0.095_228)] hover:text-[oklch(0.77_0.10_225)] transition-colors font-medium"
            >
              <ExternalLink size={14} />
              Pogledaj na superliga.rs
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlayerCard({
  player,
  onClick,
}: {
  player: Player;
  onClick: () => void;
}) {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative overflow-hidden rounded-t-xl bg-[oklch(0.20_0.04_252)] aspect-[3/4]">
        <img
          src={player.imageUrl}
          alt={player.name}
          className="w-full h-full object-cover group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0.035_252)] via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-0 right-0 bg-[oklch(0.69_0.095_228)] text-white font-black text-2xl md:text-4xl p-2 md:p-3 rounded-tl-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
          {player.number}
        </div>
      </div>
      <div className="bg-[oklch(0.20_0.04_252)] p-4 rounded-b-xl border-t-2 border-[oklch(0.69_0.095_228)] group-hover:bg-[oklch(0.22_0.045_252)] transition-colors">
        <h5 className="font-bold text-lg md:text-xl truncate text-white">
          {player.name}
        </h5>
        <p className="text-[oklch(0.77_0.10_225)] text-sm">{player.position}</p>
        {player.nationality && (
          <p className="text-[oklch(0.50_0.03_252)] text-xs mt-1">
            {player.nationality}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PrviTimPage() {
  const players = useQuery(api.players.getAll);
  const isLoading = players === undefined;
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const groups = players ? groupByPosition(players) : {};

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Hero banner */}
      <section className="relative bg-[oklch(0.16_0.035_252)] text-white py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.22_0.045_252)] to-[oklch(0.16_0.035_252)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-[oklch(0.69_0.07_228)] hover:text-white text-sm font-medium transition-colors mb-6"
          >
            <ArrowLeft size={16} className="mr-1" /> Nazad na početnu
          </Link>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight uppercase">
            Prvi <span className="text-[oklch(0.77_0.10_225)]">Tim</span>
          </h2>
          <p className="text-lg text-[oklch(0.55_0.04_228)] max-w-2xl mt-3">
            Kompletni roster FK Mladost Lučani za sezonu 2025/2026
          </p>
        </div>
      </section>

      {/* Players by position */}
      <section className="bg-[oklch(0.16_0.035_252)] pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="space-y-12">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-8 w-32 mb-6 bg-white/10" />
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton
                        key={j}
                        className="aspect-[3/4] rounded-xl bg-white/10"
                      />
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
                    <h3 className="text-2xl font-extrabold text-white uppercase tracking-tight mb-6 border-b border-[oklch(0.26_0.04_252)] pb-3">
                      {pos}
                      <span className="text-accent ml-3 text-lg font-medium lowercase">
                        ({group.length})
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      {group.map((player) => (
                        <PlayerCard
                          key={player._id}
                          player={player}
                          onClick={() => setSelectedPlayer(player)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              {groups["Ostalo"] && groups["Ostalo"].length > 0 && (
                <div>
                  <h3 className="text-2xl font-extrabold text-white uppercase tracking-tight mb-6 border-b border-[oklch(0.26_0.04_252)] pb-3">
                    Ostalo
                    <span className="text-accent ml-3 text-lg font-medium lowercase">
                      ({groups["Ostalo"].length})
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {groups["Ostalo"].map((player) => (
                      <PlayerCard
                        key={player._id}
                        player={player}
                        onClick={() => setSelectedPlayer(player)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Player bio modal */}
      <PlayerBioModal
        player={selectedPlayer}
        open={selectedPlayer !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPlayer(null);
        }}
      />

      <Footer />
    </div>
  );
}
