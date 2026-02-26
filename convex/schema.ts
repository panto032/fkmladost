import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  news: defineTable({
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    category: v.string(),
    date: v.string(),
    sortDate: v.string(),
    imageUrl: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    published: v.boolean(),
  })
    .index("by_published", ["published"])
    .index("by_published_and_sort_date", ["published", "sortDate"]),

  matches: defineTable({
    type: v.union(v.literal("next"), v.literal("last")),
    home: v.string(),
    away: v.string(),
    homeLogoUrl: v.string(),
    awayLogoUrl: v.string(),
    homeScore: v.optional(v.number()),
    awayScore: v.optional(v.number()),
    date: v.string(),
    time: v.string(),
    stadium: v.string(),
    competition: v.string(),
    status: v.optional(v.string()),
    tvChannel: v.optional(v.string()),
    tvChannelLogoUrl: v.optional(v.string()),
  }).index("by_type", ["type"]),

  partners: defineTable({
    name: v.string(),
    level: v.string(),
    logoUrl: v.optional(v.string()),
    sortOrder: v.number(),
  }).index("by_sort_order", ["sortOrder"]),

  standings: defineTable({
    position: v.number(),
    team: v.string(),
    played: v.number(),
    wins: v.number(),
    draws: v.number(),
    losses: v.number(),
    goalDifference: v.string(),
    points: v.number(),
    isHighlighted: v.boolean(),
    logoUrl: v.optional(v.string()),
    form: v.optional(v.string()),
    goalsFor: v.optional(v.number()),
    goalsAgainst: v.optional(v.number()),
  }).index("by_position", ["position"]),

  players: defineTable({
    name: v.string(),
    number: v.number(),
    position: v.string(),
    imageUrl: v.string(),
    nationality: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    sortOrder: v.number(),
    isActive: v.boolean(),
    appearances: v.optional(v.number()),
    goals: v.optional(v.number()),
    assists: v.optional(v.number()),
    minutes: v.optional(v.number()),
    goalsConceded: v.optional(v.number()),
    yellowCards: v.optional(v.number()),
    height: v.optional(v.string()),
    weight: v.optional(v.string()),
    superligaUrl: v.optional(v.string()),
  })
    .index("by_sort_order", ["sortOrder"])
    .index("by_position", ["position"])
    .index("by_active_and_sort", ["isActive", "sortOrder"]),

  pages: defineTable({
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    published: v.boolean(),
  }).index("by_slug", ["slug"]),

  roundMatches: defineTable({
    roundNumber: v.number(),
    date: v.string(),
    time: v.string(),
    home: v.string(),
    away: v.string(),
    stadium: v.string(),
    tvChannel: v.string(),
    tvChannelLogoUrl: v.string(),
    referee: v.string(),
    assistantRef1: v.string(),
    assistantRef2: v.string(),
    fourthOfficial: v.string(),
    delegate: v.string(),
    refInspector: v.string(),
    varRef: v.string(),
    avarRef: v.string(),
    reportUrl: v.string(),
    isOurMatch: v.boolean(),
  }).index("by_round", ["roundNumber"]),

  /**
   * Međusobna analitika (H2H) scraped from the Mladost match
   * report page on superliga.rs. Replaced on every sync.
   */
  matchAnalytics: defineTable({
    roundNumber: v.number(),
    home: v.string(),
    away: v.string(),
    reportUrl: v.string(),
    // Head-to-head summary
    h2hTotalPlayed: v.number(),
    h2hHomeWins: v.number(),
    h2hDraws: v.number(),
    h2hAwayWins: v.number(),
    h2hHomeGoals: v.number(),
    h2hAwayGoals: v.number(),
    // Previous meetings
    previousMatches: v.array(
      v.object({
        date: v.string(),
        homeTeam: v.string(),
        awayTeam: v.string(),
        score: v.string(),
      }),
    ),
    // Team season statistics (label + values)
    teamStats: v.array(
      v.object({
        label: v.string(),
        homeValue: v.string(),
        awayValue: v.string(),
      }),
    ),
    // Recent form for home team
    homeForm: v.array(
      v.object({
        date: v.string(),
        result: v.string(),
        score: v.string(),
        teams: v.string(),
      }),
    ),
    // Recent form for away team
    awayForm: v.array(
      v.object({
        date: v.string(),
        result: v.string(),
        score: v.string(),
        teams: v.string(),
      }),
    ),
  }).index("by_round", ["roundNumber"]),

  /** Omladinska Liga Srbije — youth league standings */
  youthStandings: defineTable({
    position: v.number(),
    club: v.string(),
    played: v.number(),
    won: v.number(),
    drawn: v.number(),
    lost: v.number(),
    goalsFor: v.number(),
    goalsAgainst: v.number(),
    goalDiff: v.number(),
    points: v.number(),
    isHighlighted: v.boolean(),
  }).index("by_position", ["position"]),

  /** Omladinska Liga — Mladost match results & upcoming schedule */
  youthMatches: defineTable({
    round: v.number(),
    date: v.string(),
    home: v.string(),
    away: v.string(),
    score: v.optional(v.string()),
    city: v.optional(v.string()),
    isHome: v.boolean(),
  }).index("by_round", ["round"]),

  /** Omladinska Liga — top scorers */
  youthScorers: defineTable({
    rank: v.number(),
    name: v.string(),
    club: v.string(),
    goals: v.string(),
    isHighlighted: v.boolean(),
  }).index("by_rank", ["rank"]),

  /** Kadetska Liga Srbije — cadet league standings */
  cadetStandings: defineTable({
    position: v.number(),
    club: v.string(),
    played: v.number(),
    won: v.number(),
    drawn: v.number(),
    lost: v.number(),
    goalsFor: v.number(),
    goalsAgainst: v.number(),
    goalDiff: v.number(),
    points: v.number(),
    isHighlighted: v.boolean(),
  }).index("by_position", ["position"]),

  /** Kadetska Liga — Mladost match results & upcoming schedule */
  cadetMatches: defineTable({
    round: v.number(),
    date: v.string(),
    home: v.string(),
    away: v.string(),
    score: v.optional(v.string()),
    city: v.optional(v.string()),
    isHome: v.boolean(),
  }).index("by_round", ["round"]),

  /** Kadetska Liga — top scorers */
  cadetScorers: defineTable({
    rank: v.number(),
    name: v.string(),
    club: v.string(),
    goals: v.string(),
    isHighlighted: v.boolean(),
  }).index("by_rank", ["rank"]),

  /** Pionirska Liga FSRZS — standings */
  pioneerStandings: defineTable({
    position: v.number(),
    club: v.string(),
    played: v.number(),
    won: v.number(),
    drawn: v.number(),
    lost: v.number(),
    goalsFor: v.number(),
    goalsAgainst: v.number(),
    goalDiff: v.number(),
    points: v.number(),
    isHighlighted: v.boolean(),
  }).index("by_position", ["position"]),

  /** Pionirska Liga — all matches (full schedule, not just Mladost) */
  pioneerMatches: defineTable({
    round: v.number(),
    date: v.string(),
    home: v.string(),
    away: v.string(),
    score: v.optional(v.string()),
    city: v.optional(v.string()),
    isHome: v.boolean(),
  }).index("by_round", ["round"]),

  /** Super Liga Srbije — standings */
  superLeagueStandings: defineTable({
    position: v.number(),
    club: v.string(),
    played: v.number(),
    won: v.number(),
    drawn: v.number(),
    lost: v.number(),
    goalsFor: v.number(),
    goalsAgainst: v.number(),
    goalDiff: v.number(),
    points: v.number(),
    isHighlighted: v.boolean(),
  }).index("by_position", ["position"]),

  /** Super Liga — Mladost match results & upcoming schedule */
  superLeagueMatches: defineTable({
    round: v.number(),
    date: v.string(),
    home: v.string(),
    away: v.string(),
    score: v.optional(v.string()),
    city: v.optional(v.string()),
    isHome: v.boolean(),
  }).index("by_round", ["round"]),

  /** Kontakt poruke sa sajta */
  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    isRead: v.boolean(),
  }),
});
