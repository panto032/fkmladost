/**
 * Central API client — wraps fetch with auth headers and token refresh.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "";

// ── Token storage ────────────────────────────────────────────────────
export const tokens = {
  getAccess: () => localStorage.getItem("access_token"),
  getRefresh: () => localStorage.getItem("refresh_token"),
  set: (access: string, refresh: string) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  },
  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_user");
  },
};

// ── Core fetch ────────────────────────────────────────────────────────
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refresh = tokens.getRefresh();
  if (!refresh) return false;

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) { tokens.clear(); return false; }
    const data = (await res.json()) as { accessToken: string; refreshToken: string };
    tokens.set(data.accessToken, data.refreshToken);
    return true;
  } catch {
    tokens.clear();
    return false;
  }
}

async function apiFetch(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const token = tokens.getAccess();
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // If 401 and we haven't retried, try refresh then retry once
  if (res.status === 401 && retry) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefresh().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }
    const ok = await refreshPromise!;
    if (ok) return apiFetch(path, options, false);
    tokens.clear();
    window.location.href = "/admin";
  }

  return res;
}

// ── Typed helpers ─────────────────────────────────────────────────────
async function get<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

async function put<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

async function del(path: string): Promise<void> {
  const res = await apiFetch(path, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

async function upload<T>(path: string, file: File): Promise<T> {
  const form = new FormData();
  form.append("file", file);
  const token = tokens.getAccess();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────
export interface AuthUser {
  id: number;
  username: string;
  name: string | null;
  email: string | null;
  role: "admin" | "editor";
}

export const authApi = {
  login: (username: string, password: string) =>
    post<{ accessToken: string; refreshToken: string; user: AuthUser }>(
      "/api/auth/login",
      { username, password }
    ),
  me: () => get<AuthUser>("/api/auth/me"),
  changePassword: (currentPassword: string, newPassword: string) =>
    put("/api/auth/me/password", { currentPassword, newPassword }),
};

// ── Public API ────────────────────────────────────────────────────────
export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  date: string;
  sortDate: string;
  imageUrl: string;
  imageFileName?: string | null;
  published?: boolean;
}

export const newsApi = {
  getLatest: (limit = 6) =>
    get<{ items: NewsItem[]; total: number }>(`/api/news?limit=${limit}`),
  getAll: (params?: { category?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    return get<{ items: NewsItem[]; total: number }>(`/api/news?${q}`);
  },
  getById: (id: number) => get<NewsItem>(`/api/news/${id}`),
};

export const matchesApi = {
  get: () => get<Match[]>("/api/matches"),
};

export const standingsApi = {
  get: () => get<Standing[]>("/api/standings"),
};

export const playersApi = {
  get: (position?: string) =>
    get<Player[]>(`/api/players${position ? `?position=${position}` : ""}`),
};

export const partnersApi = {
  get: () => get<Partner[]>("/api/partners"),
};

export const pagesApi = {
  getBySlug: (slug: string) => get<PageContent>(`/api/pages/${slug}`),
};

export const roundMatchesApi = {
  get: () => get<RoundMatch[]>("/api/round-matches"),
};

export const matchAnalyticsApi = {
  get: () => get<MatchAnalytics>("/api/match-analytics"),
};

export const youthLeagueApi = {
  getStandings: () => get<LeagueStanding[]>("/api/youth-league/standings"),
  getMatches: () => get<LeagueMatch[]>("/api/youth-league/matches"),
  getScorers: () => get<Scorer[]>("/api/youth-league/scorers"),
};

export const cadetLeagueApi = {
  getStandings: () => get<LeagueStanding[]>("/api/cadet-league/standings"),
  getMatches: () => get<LeagueMatch[]>("/api/cadet-league/matches"),
  getScorers: () => get<Scorer[]>("/api/cadet-league/scorers"),
};

export const pioneerLeagueApi = {
  getStandings: () => get<LeagueStanding[]>("/api/pioneer-league/standings"),
  getMatches: () => get<LeagueMatch[]>("/api/pioneer-league/matches"),
};

export const superLeagueApi = {
  getStandings: () => get<LeagueStanding[]>("/api/super-league/standings"),
  getMatches: () => get<LeagueMatch[]>("/api/super-league/matches"),
};

export const documentsApi = {
  get: (category?: string) =>
    get<Document[]>(`/api/documents${category ? `?category=${category}` : ""}`),
};

export const mediaApi = {
  get: (params?: { type?: "image" | "video"; category?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set("type", params.type);
    if (params?.category) q.set("category", params.category);
    return get<MediaItem[]>(`/api/media?${q}`);
  },
};

export const contactApi = {
  send: (data: { name: string; email: string; subject: string; message: string }) =>
    post<{ success: boolean }>("/api/contact", data),
};

// ── Admin API ─────────────────────────────────────────────────────────
export const adminNewsApi = {
  getAll: () =>
    get<{ items: NewsItem[]; total: number }>("/api/admin/news").then((r) => r.items),
  getById: (id: number) => get<NewsItem>(`/api/admin/news/${id}`),
  create: (data: Partial<NewsItem>) => post<NewsItem>("/api/admin/news", data),
  update: (id: number, data: Partial<NewsItem>) =>
    put<NewsItem>(`/api/admin/news/${id}`, data),
  remove: (id: number) => del(`/api/admin/news/${id}`),
  uploadImage: (file: File) =>
    upload<{ fileName: string; url: string }>("/api/admin/upload", file),
};

export const adminScrapeApi = {
  standings: () => post<ScrapeResult>("/api/admin/scrape/standings"),
  scrapeStandings: () => post<ScrapeResult>("/api/admin/scrape/standings"),
  matches: () => post<ScrapeResult>("/api/admin/scrape/matches"),
  scrapeMatches: () => post<ScrapeResult>("/api/admin/scrape/matches"),
  roundPreview: () => post<ScrapeResult>("/api/admin/scrape/round-preview"),
  scrapeRoundPreview: () => post<ScrapeResult>("/api/admin/scrape/round-preview"),
  matchAnalytics: () => post<ScrapeResult>("/api/admin/scrape/match-analytics"),
  scrapeMatchAnalytics: () => post<ScrapeResult>("/api/admin/scrape/match-analytics"),
  players: () => post<ScrapeResult>("/api/admin/scrape/players"),
  scrapePlayers: () => post<ScrapeResult>("/api/admin/scrape/players"),
  youthStandings: () => post<ScrapeResult>("/api/admin/scrape/youth-league/standings"),
  youthMatches: () => post<ScrapeResult>("/api/admin/scrape/youth-league/matches"),
  cadetStandings: () => post<ScrapeResult>("/api/admin/scrape/cadet-league/standings"),
  cadetMatches: () => post<ScrapeResult>("/api/admin/scrape/cadet-league/matches"),
  superLeagueStandings: () => post<ScrapeResult>("/api/admin/scrape/super-league/standings"),
  superLeagueMatches: () => post<ScrapeResult>("/api/admin/scrape/super-league/matches"),
  all: () => post<{ results: Record<string, unknown>; errors: Record<string, string> }>("/api/admin/scrape/all"),
};

export const adminCrudApi = {
  // Matches
  getMatches: () => get<Match[]>("/api/admin/matches"),
  createMatch: (data: Partial<Match>) => post<Match>("/api/admin/matches", data),
  updateMatch: (id: number, data: Partial<Match>) => put<Match>(`/api/admin/matches/${id}`, data),
  deleteMatch: (id: number) => del(`/api/admin/matches/${id}`),
  // Standings
  getStandings: () => get<Standing[]>("/api/admin/standings"),
  createStanding: (data: Partial<Standing>) => post<Standing>("/api/admin/standings", data),
  updateStanding: (id: number, data: Partial<Standing>) => put<Standing>(`/api/admin/standings/${id}`, data),
  deleteStanding: (id: number) => del(`/api/admin/standings/${id}`),
  // Players
  getPlayers: () => get<Player[]>("/api/admin/players"),
  createPlayer: (data: Partial<Player>) => post<Player>("/api/admin/players", data),
  updatePlayer: (id: number, data: Partial<Player>) => put<Player>(`/api/admin/players/${id}`, data),
  deletePlayer: (id: number) => del(`/api/admin/players/${id}`),
  deleteAllPlayers: () => del("/api/admin/players/all"),
  // Partners
  getPartners: () => get<Partner[]>("/api/admin/partners"),
  createPartner: (data: Partial<Partner>) => post<Partner>("/api/admin/partners", data),
  updatePartner: (id: number, data: Partial<Partner>) => put<Partner>(`/api/admin/partners/${id}`, data),
  deletePartner: (id: number) => del(`/api/admin/partners/${id}`),
  // Pages
  getPages: () => get<PageContent[]>("/api/admin/pages"),
  createPage: (data: Partial<PageContent>) => post<PageContent>("/api/admin/pages", data),
  updatePage: (id: number, data: Partial<PageContent>) => put<PageContent>(`/api/admin/pages/${id}`, data),
  deletePage: (id: number) => del(`/api/admin/pages/${id}`),
  // Documents
  getDocuments: () => get<Document[]>("/api/admin/documents"),
  createDocument: (data: Partial<Document>) => post<Document>("/api/admin/documents", data),
  updateDocument: (id: number, data: Partial<Document>) => put<Document>(`/api/admin/documents/${id}`, data),
  deleteDocument: (id: number) => del(`/api/admin/documents/${id}`),
  // Media
  getMedia: () => get<MediaItem[]>("/api/admin/media"),
  createMedia: (data: Partial<MediaItem>) => post<MediaItem>("/api/admin/media", data),
  updateMedia: (id: number, data: Partial<MediaItem>) => put<MediaItem>(`/api/admin/media/${id}`, data),
  deleteMedia: (id: number) => del(`/api/admin/media/${id}`),
  // Contact messages
  getMessages: () => get<ContactMessage[]>("/api/admin/contact-messages"),
  getContactMessages: () => get<ContactMessage[]>("/api/admin/contact-messages"),
  markRead: (id: number) => put(`/api/admin/contact-messages/${id}/read`, {}),
  markContactMessageRead: (id: number) => put(`/api/admin/contact-messages/${id}/read`, {}),
  deleteMessage: (id: number) => del(`/api/admin/contact-messages/${id}`),
  deleteContactMessage: (id: number) => del(`/api/admin/contact-messages/${id}`),
  // Youth league
  createYouthStanding: (data: Partial<LeagueStanding>) => post<LeagueStanding>("/api/admin/youth-league/standings", data),
  updateYouthStanding: (id: number, data: Partial<LeagueStanding>) => put<LeagueStanding>(`/api/admin/youth-league/standings/${id}`, data),
  deleteYouthStanding: (id: number) => del(`/api/admin/youth-league/standings/${id}`),
  createYouthMatch: (data: Partial<LeagueMatch>) => post<LeagueMatch>("/api/admin/youth-league/matches", data),
  updateYouthMatch: (id: number, data: Partial<LeagueMatch>) => put<LeagueMatch>(`/api/admin/youth-league/matches/${id}`, data),
  deleteYouthMatch: (id: number) => del(`/api/admin/youth-league/matches/${id}`),
  createYouthScorer: (data: Partial<Scorer>) => post<Scorer>("/api/admin/youth-league/scorers", data),
  updateYouthScorer: (id: number, data: Partial<Scorer>) => put<Scorer>(`/api/admin/youth-league/scorers/${id}`, data),
  deleteYouthScorer: (id: number) => del(`/api/admin/youth-league/scorers/${id}`),
  // Cadet league
  createCadetStanding: (data: Partial<LeagueStanding>) => post<LeagueStanding>("/api/admin/cadet-league/standings", data),
  updateCadetStanding: (id: number, data: Partial<LeagueStanding>) => put<LeagueStanding>(`/api/admin/cadet-league/standings/${id}`, data),
  deleteCadetStanding: (id: number) => del(`/api/admin/cadet-league/standings/${id}`),
  createCadetMatch: (data: Partial<LeagueMatch>) => post<LeagueMatch>("/api/admin/cadet-league/matches", data),
  updateCadetMatch: (id: number, data: Partial<LeagueMatch>) => put<LeagueMatch>(`/api/admin/cadet-league/matches/${id}`, data),
  deleteCadetMatch: (id: number) => del(`/api/admin/cadet-league/matches/${id}`),
  createCadetScorer: (data: Partial<Scorer>) => post<Scorer>("/api/admin/cadet-league/scorers", data),
  updateCadetScorer: (id: number, data: Partial<Scorer>) => put<Scorer>(`/api/admin/cadet-league/scorers/${id}`, data),
  deleteCadetScorer: (id: number) => del(`/api/admin/cadet-league/scorers/${id}`),
  // Pioneer league
  createPioneerStanding: (data: Partial<LeagueStanding>) => post<LeagueStanding>("/api/admin/pioneer-league/standings", data),
  updatePioneerStanding: (id: number, data: Partial<LeagueStanding>) => put<LeagueStanding>(`/api/admin/pioneer-league/standings/${id}`, data),
  deletePioneerStanding: (id: number) => del(`/api/admin/pioneer-league/standings/${id}`),
  createPioneerMatch: (data: Partial<LeagueMatch>) => post<LeagueMatch>("/api/admin/pioneer-league/matches", data),
  updatePioneerMatch: (id: number, data: Partial<LeagueMatch>) => put<LeagueMatch>(`/api/admin/pioneer-league/matches/${id}`, data),
  deletePioneerMatch: (id: number) => del(`/api/admin/pioneer-league/matches/${id}`),
  // Super league
  createSuperLeagueStanding: (data: Partial<LeagueStanding>) => post<LeagueStanding>("/api/admin/super-league/standings", data),
  updateSuperLeagueStanding: (id: number, data: Partial<LeagueStanding>) => put<LeagueStanding>(`/api/admin/super-league/standings/${id}`, data),
  deleteSuperLeagueStanding: (id: number) => del(`/api/admin/super-league/standings/${id}`),
  createSuperLeagueMatch: (data: Partial<LeagueMatch>) => post<LeagueMatch>("/api/admin/super-league/matches", data),
  updateSuperLeagueMatch: (id: number, data: Partial<LeagueMatch>) => put<LeagueMatch>(`/api/admin/super-league/matches/${id}`, data),
  deleteSuperLeagueMatch: (id: number) => del(`/api/admin/super-league/matches/${id}`),
};

// ── Types ─────────────────────────────────────────────────────────────
export interface Match {
  id: number;
  type: "next" | "last";
  home: string;
  away: string;
  homeLogoUrl: string;
  awayLogoUrl: string;
  homeScore?: number | null;
  awayScore?: number | null;
  date: string;
  time: string;
  stadium: string;
  competition: string;
  status?: string | null;
  tvChannel?: string | null;
  tvChannelLogoUrl?: string | null;
}

export interface Standing {
  id: number;
  position: number;
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: string;
  points: number;
  isHighlighted: boolean;
  logoUrl?: string | null;
  form?: string | null;
}

export interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
  imageUrl: string;
  nationality?: string | null;
  birthDate?: string | null;
  sortOrder: number;
  isActive: boolean;
  appearances?: number | null;
  goals?: number | null;
  assists?: number | null;
  minutes?: number | null;
  goalsConceded?: number | null;
  yellowCards?: number | null;
  height?: string | null;
  weight?: string | null;
  superligaUrl?: string | null;
}

export interface Partner {
  id: number;
  name: string;
  level: string;
  logoUrl?: string | null;
  sortOrder: number;
}

export interface PageContent {
  id: number;
  slug: string;
  title: string;
  content: string;
  published: boolean;
}

export interface RoundMatch {
  id: number;
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
}

export interface MatchAnalytics {
  id: number;
  roundNumber: number;
  home: string;
  away: string;
  reportUrl: string;
  h2hTotalPlayed: number;
  h2hHomeWins: number;
  h2hDraws: number;
  h2hAwayWins: number;
  h2hHomeGoals: number;
  h2hAwayGoals: number;
  previousMatches: Array<{ date: string; homeTeam: string; awayTeam: string; score: string }>;
  teamStats: Array<{ label: string; homeValue: string; awayValue: string }>;
  homeForm: Array<{ date: string; result: string; score: string; teams: string }>;
  awayForm: Array<{ date: string; result: string; score: string; teams: string }>;
}

export interface LeagueStanding {
  id: number;
  position: number;
  club: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  isHighlighted: boolean;
}

export interface LeagueMatch {
  id: number;
  round: number;
  date: string;
  home: string;
  away: string;
  score?: string | null;
  city?: string | null;
  isHome: boolean;
}

export interface Scorer {
  id: number;
  rank: number;
  name: string;
  club: string;
  goals: string;
  isHighlighted: boolean;
}

export interface Document {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  published: boolean;
  sortOrder: number;
}

export interface MediaItem {
  id: number;
  type: "image" | "video";
  title: string;
  description?: string | null;
  category: string;
  fileName?: string | null;
  externalUrl?: string | null;
  youtubeUrl?: string | null;
  youtubeVideoId?: string | null;
  published: boolean;
  sortOrder: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ScrapeResult {
  success: boolean;
  [key: string]: unknown;
}

export const apiBaseUrl = API_BASE;
