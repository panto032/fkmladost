"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { ConvexError } from "convex/values";

const API_BASE = "https://v3.football.api-sports.io";

/* ────────────── API response types ────────────── */

type ApiEnvelope<T> = {
  response: T;
  errors?: Record<string, string>;
};

type StandingEntry = {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  form: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
};

type LeagueStandings = {
  league: {
    id: number;
    name: string;
    season: number;
    standings: StandingEntry[][];
  };
};

type FixtureEntry = {
  fixture: {
    id: number;
    date: string;
    venue: { name: string | null; city: string | null };
    status: { short: string; long: string };
  };
  league: { name: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
};

type LeagueInfo = {
  league: { id: number; name: string };
  country: { name: string };
  seasons: { year: number; current: boolean }[];
};

/* ────────────── Helper ────────────── */

async function apiFetch<T>(endpoint: string, apiKey: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "x-apisports-key": apiKey },
  });

  if (!res.ok) {
    throw new ConvexError({
      code: "EXTERNAL_SERVICE_ERROR",
      message: `API-Football greška: ${res.status} ${res.statusText}`,
    });
  }

  const data = (await res.json()) as ApiEnvelope<T>;

  if (data.errors && Object.keys(data.errors).length > 0) {
    const errorMsg = Object.values(data.errors).join(", ");
    throw new ConvexError({
      code: "EXTERNAL_SERVICE_ERROR",
      message: `API-Football: ${errorMsg}`,
    });
  }

  return data.response;
}

function formatTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("sr-RS", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Belgrade",
    }).format(date);
  } catch {
    return "00:00";
  }
}

/* ────────────── Main sync action ────────────── */

export const syncAll = action({
  args: {},
  handler: async (ctx): Promise<{ standings: number; matches: number }> => {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "API_FOOTBALL_KEY nije podešen u Secrets",
      });
    }

    // 1) Find Serbian SuperLiga league ID and current season
    const leagues = await apiFetch<LeagueInfo[]>(
      "/leagues?country=Serbia&type=League",
      apiKey,
    );

    const superLiga = leagues.find(
      (l) =>
        l.league.name.toLowerCase().includes("super liga") ||
        l.league.name.toLowerCase().includes("superliga"),
    );

    if (!superLiga) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Srpska SuperLiga nije pronađena u API-Football",
      });
    }

    // Free API plan only supports seasons 2022-2024
    // Pick the most recent season available within that range
    const FREE_PLAN_MAX_SEASON = 2024;
    const availableSeasons = superLiga.seasons
      .filter((s) => s.year <= FREE_PLAN_MAX_SEASON)
      .sort((a, b) => b.year - a.year);

    if (availableSeasons.length === 0) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Nema dostupnih sezona za besplatni plan (2022-2024)",
      });
    }

    const leagueId = superLiga.league.id;
    const season = availableSeasons[0].year;

    // 2) Fetch standings
    const standingsData = await apiFetch<LeagueStandings[]>(
      `/standings?league=${leagueId}&season=${season}`,
      apiKey,
    );

    if (
      !standingsData.length ||
      !standingsData[0].league.standings.length
    ) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Nema podataka za tabelu",
      });
    }

    const rawStandings = standingsData[0].league.standings[0];

    const standings = rawStandings.map((s) => ({
      position: s.rank,
      team: s.team.name,
      played: s.all.played,
      wins: s.all.win,
      draws: s.all.draw,
      losses: s.all.lose,
      goalsFor: s.all.goals.for,
      goalsAgainst: s.all.goals.against,
      goalDifference:
        s.goalsDiff >= 0 ? `+${s.goalsDiff}` : `${s.goalsDiff}`,
      points: s.points,
      logoUrl: s.team.logo,
      form: s.form ?? "",
      isHighlighted: s.team.name.toLowerCase().includes("mladost"),
    }));

    // 3) Find FK Mladost team ID and fetch their fixtures
    const mladostTeam = rawStandings.find((s) =>
      s.team.name.toLowerCase().includes("mladost"),
    );

    let matchCount = 0;

    if (mladostTeam) {
      const teamId = mladostTeam.team.id;

      // Last completed match
      const lastFixtures = await apiFetch<FixtureEntry[]>(
        `/fixtures?team=${teamId}&league=${leagueId}&season=${season}&last=1`,
        apiKey,
      );

      // Next upcoming match
      const nextFixtures = await apiFetch<FixtureEntry[]>(
        `/fixtures?team=${teamId}&league=${leagueId}&season=${season}&next=1`,
        apiKey,
      );

      const matchesToSave: {
        type: "next" | "last";
        home: string;
        away: string;
        homeLogoUrl: string;
        awayLogoUrl: string;
        homeScore?: number;
        awayScore?: number;
        date: string;
        time: string;
        stadium: string;
        competition: string;
        status?: string;
      }[] = [];

      if (lastFixtures.length > 0) {
        const f = lastFixtures[0];
        matchesToSave.push({
          type: "last",
          home: f.teams.home.name,
          away: f.teams.away.name,
          homeLogoUrl: f.teams.home.logo,
          awayLogoUrl: f.teams.away.logo,
          homeScore: f.goals.home ?? 0,
          awayScore: f.goals.away ?? 0,
          date: f.fixture.date.split("T")[0],
          time: formatTime(f.fixture.date),
          stadium: f.fixture.venue.name ?? "N/A",
          competition: "SuperLiga",
          status: f.fixture.status.short,
        });
      }

      if (nextFixtures.length > 0) {
        const f = nextFixtures[0];
        matchesToSave.push({
          type: "next",
          home: f.teams.home.name,
          away: f.teams.away.name,
          homeLogoUrl: f.teams.home.logo,
          awayLogoUrl: f.teams.away.logo,
          date: f.fixture.date.split("T")[0],
          time: formatTime(f.fixture.date),
          stadium: f.fixture.venue.name ?? "N/A",
          competition: "SuperLiga",
          status: f.fixture.status.short,
        });
      }

      if (matchesToSave.length > 0) {
        await ctx.runMutation(internal.sync.saveData.saveMatches, {
          matches: matchesToSave,
        });
        matchCount = matchesToSave.length;
      }
    }

    // 4) Save standings to DB
    await ctx.runMutation(internal.sync.saveData.saveStandings, {
      standings,
    });

    return { standings: standings.length, matches: matchCount };
  },
});
