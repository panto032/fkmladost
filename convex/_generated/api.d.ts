/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_cadetLeague from "../admin/cadetLeague.js";
import type * as admin_matches from "../admin/matches.js";
import type * as admin_news from "../admin/news.js";
import type * as admin_pages from "../admin/pages.js";
import type * as admin_partners from "../admin/partners.js";
import type * as admin_pioneerLeague from "../admin/pioneerLeague.js";
import type * as admin_players from "../admin/players.js";
import type * as admin_standings from "../admin/standings.js";
import type * as admin_superLeague from "../admin/superLeague.js";
import type * as admin_youthLeague from "../admin/youthLeague.js";
import type * as matchAnalytics from "../matchAnalytics.js";
import type * as matches from "../matches.js";
import type * as news from "../news.js";
import type * as pages from "../pages.js";
import type * as partners from "../partners.js";
import type * as players from "../players.js";
import type * as roundMatches from "../roundMatches.js";
import type * as standings from "../standings.js";
import type * as sync_fetchFromApi from "../sync/fetchFromApi.js";
import type * as sync_saveData from "../sync/saveData.js";
import type * as sync_scrapeFromWeb from "../sync/scrapeFromWeb.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/cadetLeague": typeof admin_cadetLeague;
  "admin/matches": typeof admin_matches;
  "admin/news": typeof admin_news;
  "admin/pages": typeof admin_pages;
  "admin/partners": typeof admin_partners;
  "admin/pioneerLeague": typeof admin_pioneerLeague;
  "admin/players": typeof admin_players;
  "admin/standings": typeof admin_standings;
  "admin/superLeague": typeof admin_superLeague;
  "admin/youthLeague": typeof admin_youthLeague;
  matchAnalytics: typeof matchAnalytics;
  matches: typeof matches;
  news: typeof news;
  pages: typeof pages;
  partners: typeof partners;
  players: typeof players;
  roundMatches: typeof roundMatches;
  standings: typeof standings;
  "sync/fetchFromApi": typeof sync_fetchFromApi;
  "sync/saveData": typeof sync_saveData;
  "sync/scrapeFromWeb": typeof sync_scrapeFromWeb;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
