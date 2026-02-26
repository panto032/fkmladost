import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Calendar, Clock, MapPin, Scale, Eye, Shield, Swords } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Link } from "react-router-dom";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";

export default function NajavaKolaPage() {
  const matches = useQuery(api.roundMatches.getAll);
  const isLoading = matches === undefined;

  const roundNumber = matches?.[0]?.roundNumber ?? 0;

  return (
    <div className="min-h-screen bg-[oklch(0.13_0.03_252)] font-sans text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative text-white pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-[oklch(0.10_0.03_252)]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[oklch(0.69_0.095_228)]/5 to-transparent skew-x-[-12deg] translate-x-1/4" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <span className="text-[oklch(0.69_0.095_228)] text-xs font-bold uppercase tracking-[0.2em] block mb-4">
            Mozzart Bet Super liga Srbije
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-[0.9]">
            Najava{" "}
            <span className="text-[oklch(0.77_0.10_225)]">Kola</span>
          </h1>
          {roundNumber > 0 && (
            <div className="mt-4 inline-flex items-center bg-[oklch(0.69_0.095_228)]/10 border border-[oklch(0.69_0.095_228)]/20 rounded-full px-4 py-1.5">
              <span className="text-[oklch(0.69_0.095_228)] text-sm font-bold">
                {roundNumber}. Kolo
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Analytics CTA */}
      <section className="bg-[oklch(0.15_0.04_252)] border-y border-[oklch(0.24_0.04_252)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/analitika-rivala"
            className="flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[oklch(0.69_0.095_228)]/15 flex items-center justify-center group-hover:bg-[oklch(0.69_0.095_228)]/25 transition-colors">
                <Swords size={16} className="text-[oklch(0.69_0.095_228)]" />
              </div>
              <div>
                <span className="text-white font-bold text-sm group-hover:text-[oklch(0.77_0.10_225)] transition-colors">
                  Analitika rivala
                </span>
                <span className="text-[oklch(0.45_0.03_252)] text-xs block">
                  Međusobni rezultati, statistika, forma timova
                </span>
              </div>
            </div>
            <span className="text-[oklch(0.69_0.095_228)] text-sm font-semibold group-hover:translate-x-1 transition-transform">
              {"→"}
            </span>
          </Link>
        </div>
      </section>

      {/* Matches grid */}
      <section className="bg-[oklch(0.13_0.03_252)] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[oklch(0.50_0.03_252)] text-lg">
                Najava kola jos nije dostupna.
              </p>
              <p className="text-[oklch(0.40_0.03_252)] text-sm mt-2">
                Kliknite "Sinhronizuj najavu kola" u Admin panelu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {matches.map((match) => (
                <MatchCard key={match._id} match={match} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ─── Single match card ─── */

type RoundMatch = {
  _id: string;
  roundNumber: number;
  date: string;
  time: string;
  home: string;
  away: string;
  stadium: string;
  tvChannel: string;
  tvChannelLogoUrl: string;
  referee: string;
  assistantRef1: string;
  assistantRef2: string;
  fourthOfficial: string;
  delegate: string;
  refInspector: string;
  varRef: string;
  avarRef: string;
  reportUrl: string;
  isOurMatch: boolean;
};

function MatchCard({ match }: { match: RoundMatch }) {
  const isOurs = match.isOurMatch;

  return (
    <div
      className={`rounded-2xl overflow-hidden border shadow-lg transition-all duration-300 hover:shadow-xl ${
        isOurs
          ? "border-[oklch(0.69_0.095_228)]/50 bg-gradient-to-br from-[oklch(0.20_0.06_240)] to-[oklch(0.16_0.04_252)] ring-1 ring-[oklch(0.69_0.095_228)]/20"
          : "border-[oklch(0.28_0.04_252)] bg-[oklch(0.18_0.04_252)]"
      }`}
    >
      {/* Header bar */}
      <div className={`px-5 py-3 flex items-center justify-between ${
        isOurs ? "bg-[oklch(0.69_0.095_228)]/10" : "bg-[oklch(0.22_0.04_252)]"
      }`}>
        <div className="flex items-center gap-3 text-[oklch(0.65_0.03_228)] text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} />
            <span>{match.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} />
            <span>{match.time}</span>
          </div>
        </div>
        {match.tvChannelLogoUrl && (
          <img
            src={match.tvChannelLogoUrl}
            alt={match.tvChannel}
            className="h-5 object-contain"
          />
        )}
      </div>

      {/* Teams */}
      <div className="px-5 py-5">
        <div className="flex items-center justify-between">
          <span className={`font-extrabold text-lg uppercase tracking-tight ${
            isOurs && match.home.toUpperCase().includes("MLADOST")
              ? "text-[oklch(0.69_0.095_228)]"
              : "text-white"
          }`}>
            {match.home}
          </span>
          <span className="text-[oklch(0.40_0.03_252)] font-bold text-sm mx-3">vs</span>
          <span className={`font-extrabold text-lg uppercase tracking-tight text-right ${
            isOurs && match.away.toUpperCase().includes("MLADOST")
              ? "text-[oklch(0.69_0.095_228)]"
              : "text-white"
          }`}>
            {match.away}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-3 text-[oklch(0.50_0.03_252)] text-xs">
          <MapPin size={12} />
          <span>{match.stadium}</span>
        </div>
      </div>

      {/* Officials */}
      <div className="px-5 pb-5">
        <div className="bg-[oklch(0.14_0.03_252)] rounded-xl p-4 border border-[oklch(0.24_0.04_252)]">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
            {/* Left column - referees */}
            <div className="space-y-1.5">
              <OfficialRow icon={<Scale size={11} />} label="Sudija" value={match.referee} />
              <OfficialRow label="1. pomoćni" value={match.assistantRef1} />
              <OfficialRow label="2. pomoćni" value={match.assistantRef2} />
              <OfficialRow label="4. sudija" value={match.fourthOfficial} />
            </div>
            {/* Right column - officials */}
            <div className="space-y-1.5">
              <OfficialRow icon={<Eye size={11} />} label="Delegat" value={match.delegate} />
              <OfficialRow label="Kontrolor" value={match.refInspector} />
              <OfficialRow icon={<Shield size={11} />} label="VAR" value={match.varRef} />
              <OfficialRow label="AVAR" value={match.avarRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfficialRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-1">
      {icon && <span className="text-[oklch(0.50_0.03_252)] mt-px">{icon}</span>}
      <span className="text-[oklch(0.45_0.03_252)] font-semibold shrink-0">{label}:</span>
      <span className="text-[oklch(0.65_0.03_228)] truncate">{value}</span>
    </div>
  );
}
