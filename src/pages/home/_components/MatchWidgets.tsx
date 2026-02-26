import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export default function MatchWidgets() {
  const nextMatch = useQuery(api.matches.getByType, { type: "next" });
  const lastMatch = useQuery(api.matches.getByType, { type: "last" });

  const isLoading = nextMatch === undefined || lastMatch === undefined;

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 z-10">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Next Match */}
        {isLoading ? (
          <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/40">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center w-5/12">
                <Skeleton className="w-20 h-20 rounded-full mb-3" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-10 w-12" />
              <div className="flex flex-col items-center w-5/12">
                <Skeleton className="w-20 h-20 rounded-full mb-3" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <Skeleton className="h-14 w-full mt-8 rounded-2xl" />
          </div>
        ) : nextMatch ? (
          <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[oklch(0.94_0.015_228)] rounded-bl-full -z-10 transition-transform duration-700 group-hover:scale-110" />
            <div className="flex justify-between items-center mb-6">
              <span className="bg-[oklch(0.90_0.02_228)] text-[oklch(0.40_0.06_252)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center shadow-sm">
                <Calendar size={14} className="mr-1" /> Najava Meča
              </span>
              <span className="text-xs font-semibold text-[oklch(0.50_0.03_252)] bg-white px-2 py-1 rounded-md shadow-sm">
                {nextMatch.competition}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 relative">
              <div className="text-center w-5/12 flex flex-col items-center">
                <img
                  src={nextMatch.homeLogoUrl}
                  alt={nextMatch.home}
                  className="w-16 h-16 sm:w-24 sm:h-24 object-contain drop-shadow-lg mb-3 hover:scale-110 transition-transform duration-300"
                />
                <span className="font-extrabold text-[oklch(0.22_0.045_252)] text-sm sm:text-lg">
                  {nextMatch.home}
                </span>
              </div>
              <div className="w-2/12 text-center flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
                <span className="text-[oklch(0.88_0.01_228)] font-black text-3xl sm:text-5xl italic tracking-tighter drop-shadow-sm">
                  VS
                </span>
              </div>
              <div className="text-center w-5/12 flex flex-col items-center">
                <img
                  src={nextMatch.awayLogoUrl}
                  alt={nextMatch.away}
                  className="w-16 h-16 sm:w-24 sm:h-24 object-contain drop-shadow-lg mb-3 hover:scale-110 transition-transform duration-300"
                />
                <span className="font-extrabold text-[oklch(0.22_0.045_252)] text-sm sm:text-lg">
                  {nextMatch.away}
                </span>
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center text-sm font-medium text-[oklch(0.50_0.03_252)] bg-[oklch(0.97_0.01_228)]/80 p-4 rounded-2xl border border-[oklch(0.92_0.015_228)] shadow-inner">
              <div className="flex items-center">
                <Clock size={16} className="mr-2 text-accent" />{" "}
                {nextMatch.date} u {nextMatch.time}
              </div>
              <div className="hidden sm:block text-[oklch(0.85_0.01_228)] mx-4">
                |
              </div>
              <div className="flex items-center mt-2 sm:mt-0">
                <MapPin size={16} className="mr-2 text-accent" />{" "}
                {nextMatch.stadium}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/40 flex items-center justify-center min-h-[250px]">
            <p className="text-[oklch(0.50_0.03_252)] font-medium">
              Nema zakazanih mečeva
            </p>
          </div>
        )}

        {/* Last Match */}
        {isLoading ? (
          <div className="flex-1 bg-[oklch(0.22_0.045_252)] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[oklch(0.28_0.04_252)]">
            <Skeleton className="h-6 w-32 mb-6 bg-[oklch(0.30_0.04_252)]" />
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center w-4/12">
                <Skeleton className="w-16 h-16 rounded-full mb-3 bg-[oklch(0.30_0.04_252)]" />
                <Skeleton className="h-5 w-20 bg-[oklch(0.30_0.04_252)]" />
              </div>
              <Skeleton className="h-14 w-24 bg-[oklch(0.30_0.04_252)]" />
              <div className="flex flex-col items-center w-4/12">
                <Skeleton className="w-16 h-16 rounded-full mb-3 bg-[oklch(0.30_0.04_252)]" />
                <Skeleton className="h-5 w-20 bg-[oklch(0.30_0.04_252)]" />
              </div>
            </div>
          </div>
        ) : lastMatch ? (
          <div className="flex-1 bg-gradient-to-br from-[oklch(0.22_0.045_252)] to-[oklch(0.18_0.04_252)] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[oklch(0.28_0.04_252)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[oklch(0.26_0.04_252)]/30 rounded-bl-full -z-10 transition-transform duration-700 group-hover:scale-110" />
            <div className="flex justify-between items-center mb-6">
              <span className="bg-[oklch(0.26_0.04_252)]/80 backdrop-blur-sm text-[oklch(0.77_0.08_228)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[oklch(0.35_0.04_252)]">
                Prethodni Meč
              </span>
              <span className="text-xs font-medium text-[oklch(0.60_0.06_228)]">
                {lastMatch.competition}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-center w-4/12 flex flex-col items-center">
                <img
                  src={lastMatch.homeLogoUrl}
                  alt={lastMatch.home}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] mb-3 hover:scale-110 transition-transform duration-300"
                />
                <span className="font-semibold text-sm sm:text-base">
                  {lastMatch.home}
                </span>
              </div>
              <div className="w-4/12 text-center px-1">
                <div className="bg-[oklch(0.16_0.035_252)]/60 backdrop-blur-md rounded-2xl py-3 px-4 sm:px-6 inline-block shadow-inner border border-[oklch(0.28_0.04_252)]/60 transform group-hover:scale-105 transition-transform duration-500">
                  <span className="text-3xl sm:text-5xl font-black tracking-widest text-white">
                    {lastMatch.homeScore} : {lastMatch.awayScore}
                  </span>
                </div>
                {lastMatch.status && (
                  <p className="text-[10px] sm:text-xs text-[oklch(0.60_0.08_228)] mt-4 font-bold uppercase tracking-widest">
                    {lastMatch.status}
                  </p>
                )}
              </div>
              <div className="text-center w-4/12 flex flex-col items-center">
                <img
                  src={lastMatch.awayLogoUrl}
                  alt={lastMatch.away}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] mb-3 hover:scale-110 transition-transform duration-300"
                />
                <span className="font-semibold text-sm sm:text-base">
                  {lastMatch.away}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-gradient-to-br from-[oklch(0.22_0.045_252)] to-[oklch(0.18_0.04_252)] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[oklch(0.28_0.04_252)] flex items-center justify-center min-h-[250px]">
            <p className="text-[oklch(0.60_0.06_228)] font-medium">
              Nema odigranih mečeva
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
