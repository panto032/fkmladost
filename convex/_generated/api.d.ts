/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_matches from "../admin/matches.js";
import type * as admin_news from "../admin/news.js";
import type * as admin_partners from "../admin/partners.js";
import type * as admin_standings from "../admin/standings.js";
import type * as matches from "../matches.js";
import type * as news from "../news.js";
import type * as partners from "../partners.js";
import type * as standings from "../standings.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/matches": typeof admin_matches;
  "admin/news": typeof admin_news;
  "admin/partners": typeof admin_partners;
  "admin/standings": typeof admin_standings;
  matches: typeof matches;
  news: typeof news;
  partners: typeof partners;
  standings: typeof standings;
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
