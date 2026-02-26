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
    imageUrl: v.string(),
    published: v.boolean(),
  }).index("by_published", ["published"]),

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
  })
    .index("by_sort_order", ["sortOrder"])
    .index("by_position", ["position"])
    .index("by_active_and_sort", ["isActive", "sortOrder"]),
});
