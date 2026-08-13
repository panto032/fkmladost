/**
 * Server-rendered sadrzaj tela stranice za crawlere bez JavaScripta.
 *
 * Sajt je React SPA — bez ovoga <div id="root"> stize prazan i Google (u prvom,
 * ne-renderovanom prolazu), Bing i AI crawleri ne vide nikakav tekst. Ovde za
 * svaku rutu generisemo jednostavan, semantican HTML fragment direktno iz baze
 * (isti podaci koje API vraca klijentu) i ubacujemo ga kao pocetni sadrzaj
 * #root-a (registerHtmlSeo u index.ts). Kad se JS ucita, React preuzme #root i
 * ovaj fragment nestane — nema duplog vidljivog sadrzaja za obicne posetioce,
 * a crawleri koji ne izvrsavaju JS ga i dalje vide.
 *
 * VAZNO: ovo namerno duplira prikaz iz src/pages/* (isti princip kao meta.ts —
 * vidi napomenu tamo). Sadrzaj ne mora piksel-precizno da prati UI, samo da
 * bude tacan i citljiv.
 */

import { db } from "../db.js";
import { SITE, newsPath, stripHtml, truncate, attr, articleImageUrl, type ArticleData } from "./meta.js";

// ── Osnovni gradivni blokovi ───────────────────────────────────────────

function esc(value: unknown): string {
  return attr(String(value ?? ""));
}

function h(tag: string, content: string, attrs = ""): string {
  return `<${tag}${attrs ? " " + attrs : ""}>${content}</${tag}>`;
}

function link(href: string, content: string, attrs = ""): string {
  return `<a href="${esc(href)}"${attrs ? " " + attrs : ""}>${content}</a>`;
}

interface StandingRow {
  position: number;
  name: string;
  played: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: string | number;
  pts: number;
  highlighted: boolean;
}

function standingsTable(rows: StandingRow[], caption: string): string {
  if (!rows.length) return "";
  const body = rows
    .map(
      (r) => `<tr${r.highlighted ? ' class="nas-tim"' : ""}>
        <td>${r.position}</td>
        <td>${esc(r.name)}</td>
        <td>${r.played}</td>
        <td>${r.w}</td>
        <td>${r.d}</td>
        <td>${r.l}</td>
        <td>${r.gf}:${r.ga}</td>
        <td>${esc(r.gd)}</td>
        <td>${r.pts}</td>
      </tr>`,
    )
    .join("\n");

  return `<table>
    <caption>${esc(caption)}</caption>
    <thead>
      <tr><th>#</th><th>Klub</th><th>Утакмице</th><th>П</th><th>Н</th><th>И</th><th>Голови</th><th>Гол разлика</th><th>Бодови</th></tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`;
}

interface MatchRow {
  round?: number | string;
  date: string;
  home: string;
  away: string;
  score?: string | null;
}

function matchesList(rows: MatchRow[], title: string): string {
  if (!rows.length) return "";
  const items = rows
    .map(
      (m) =>
        `<li>${m.round !== undefined ? `${esc(m.round)}. коло — ` : ""}${esc(m.date)}: ${esc(m.home)} ${
          m.score ? esc(m.score) : "—"
        } ${esc(m.away)}</li>`,
    )
    .join("\n");
  return `<section><h2>${esc(title)}</h2><ul>${items}</ul></section>`;
}

interface ScorerRow {
  rank: number;
  name: string;
  club: string;
  goals: string;
}

function scorersList(rows: ScorerRow[], title: string): string {
  if (!rows.length) return "";
  const items = rows
    .map((s) => `<li>${s.rank}. ${esc(s.name)} (${esc(s.club)}) — ${esc(s.goals)} гол.</li>`)
    .join("\n");
  return `<section><h2>${esc(title)}</h2><ol>${items}</ol></section>`;
}

function newsListMarkup(
  items: Array<{ id: number; title: string; excerpt: string; category: string; date: string }>,
): string {
  if (!items.length) return "";
  const lis = items
    .map(
      (n) =>
        `<li><a href="${esc(newsPath(n.id, n.title))}"><h3>${esc(n.title)}</h3></a>
          <p>${esc(truncate(stripHtml(n.excerpt), 200))}</p>
          <span>${esc(n.category)} · ${esc(n.date)}</span></li>`,
    )
    .join("\n");
  return `<ul>${lis}</ul>`;
}

// ── Rute sa dinamickim podacima ────────────────────────────────────────

export async function homeBody(): Promise<string> {
  const [standings, news, nextMatch] = await Promise.all([
    db.standing.findMany({ orderBy: { position: "asc" } }),
    db.news.findMany({
      where: { published: true },
      orderBy: { sortDate: "desc" },
      take: 6,
      select: { id: true, title: true, excerpt: true, category: true, date: true },
    }),
    db.match.findFirst({ where: { type: "next" } }),
  ]);

  const parts: string[] = [
    `<h1>${esc(SITE.name)}</h1>`,
    `<p>Zvanični sajt FK Mladost Lučani — Super liga Srbije. Vesti, rezultati, tabela, raspored utakmica i sve o plavo-belima iz Lučana. Tradicija od 1952.</p>`,
  ];

  if (nextMatch) {
    parts.push(
      `<section><h2>Naredna utakmica</h2><p>${esc(nextMatch.home)} — ${esc(nextMatch.away)}, ${esc(
        nextMatch.date,
      )} ${esc(nextMatch.time)}, ${esc(nextMatch.stadium)} (${esc(nextMatch.competition)})</p></section>`,
    );
  }

  if (standings.length) {
    parts.push(
      standingsTable(
        standings.map((s) => ({
          position: s.position,
          name: s.team,
          played: s.played,
          w: s.wins,
          d: s.draws,
          l: s.losses,
          gf: s.goalsFor,
          ga: s.goalsAgainst,
          gd: s.goalDifference,
          pts: s.points,
          highlighted: s.isHighlighted,
        })),
        "Tabela Super lige Srbije",
      ),
    );
    // Direktan link ka /super-liga razdvaja ciljanje upita "tabela" — na
    // naslovnoj je ovo samo mini-pregled, kompletna/azurna tabela zivi tamo.
    parts.push(`<p>${link("/super-liga", "Kompletna tabela Super lige, raspored i rezultati →")}</p>`);
  }

  if (news.length) {
    parts.push(`<section><h2>Najnovije vesti</h2>${newsListMarkup(news)}</section>`);
  }

  return parts.join("\n");
}

export async function prviTimBody(): Promise<string> {
  const players = await db.player.findMany({
    where: { isActive: true },
    orderBy: [{ position: "asc" }, { sortOrder: "asc" }],
  });

  const groups = new Map<string, typeof players>();
  for (const p of players) {
    if (!groups.has(p.position)) groups.set(p.position, []);
    groups.get(p.position)!.push(p);
  }

  const sections = [...groups.entries()]
    .map(([position, group]) => {
      const items = group
        .map(
          (p) =>
            `<li>#${p.number} ${esc(p.name)}${p.nationality ? ` (${esc(p.nationality)})` : ""}${
              p.appearances != null ? ` — ${p.appearances} утакмица` : ""
            }${p.goals != null ? `, ${p.goals} голова` : ""}</li>`,
        )
        .join("\n");
      return `<section><h2>${esc(position)}</h2><ul>${items}</ul></section>`;
    })
    .join("\n");

  return `<h1>Prvi tim FK Mladost Lučani</h1>
    <p>Kompletan spisak igrača prvog tima sa brojevima dresova, pozicijama i statistikom u sezoni Super lige Srbije.</p>
    ${sections}`;
}

export async function superLigaBody(): Promise<string> {
  const [standings, matches] = await Promise.all([
    db.superLeagueStanding.findMany({ orderBy: { position: "asc" } }),
    db.superLeagueMatch.findMany({ orderBy: { round: "asc" } }),
  ]);

  const played = matches.filter((m) => m.score);
  const upcoming = matches.filter((m) => !m.score);

  return `<h1>Super liga Srbije — tabela i rezultati</h1>
    <p>Aktuelna tabela Super lige Srbije, raspored i rezultati utakmica FK Mladost Lučani u najvišem rangu srpskog fudbala.</p>
    ${standingsTable(
      standings.map((s) => ({
        position: s.position,
        name: s.club,
        played: s.played,
        w: s.won,
        d: s.drawn,
        l: s.lost,
        gf: s.goalsFor,
        ga: s.goalsAgainst,
        gd: s.goalDiff,
        pts: s.points,
        highlighted: s.isHighlighted,
      })),
      "Tabela Super lige Srbije",
    )}
    ${matchesList(
      played.slice(-10).map((m) => ({ round: m.round, date: m.date, home: m.home, away: m.away, score: m.score })),
      "Odigrane utakmice",
    )}
    ${matchesList(
      upcoming.slice(0, 10).map((m) => ({ round: m.round, date: m.date, home: m.home, away: m.away })),
      "Predstojeće utakmice",
    )}`;
}

async function youthStyleBody(opts: {
  title: string;
  description: string;
  standings: Array<{
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
  }>;
  matches: Array<{ round: number; date: string; home: string; away: string; score?: string | null }>;
  scorers?: Array<{ rank: number; name: string; club: string; goals: string }>;
}): Promise<string> {
  return `<h1>${esc(opts.title)}</h1>
    <p>${esc(opts.description)}</p>
    ${standingsTable(
      opts.standings.map((s) => ({
        position: s.position,
        name: s.club,
        played: s.played,
        w: s.won,
        d: s.drawn,
        l: s.lost,
        gf: s.goalsFor,
        ga: s.goalsAgainst,
        gd: s.goalDiff,
        pts: s.points,
        highlighted: s.isHighlighted,
      })),
      opts.title,
    )}
    ${matchesList(opts.matches.slice(0, 15), "Raspored i rezultati")}
    ${opts.scorers ? scorersList(opts.scorers, "Lista strelaca") : ""}`;
}

export async function omladinskaLigaBody(): Promise<string> {
  const [standings, matches, scorers] = await Promise.all([
    db.youthStanding.findMany({ orderBy: { position: "asc" } }),
    db.youthMatch.findMany({ orderBy: { round: "asc" } }),
    db.youthScorer.findMany({ orderBy: { rank: "asc" } }),
  ]);
  return youthStyleBody({
    title: "Omladinska liga Srbije",
    description: "Tabela, raspored, rezultati i lista strelaca omladinske selekcije FK Mladost Lučani.",
    standings,
    matches,
    scorers,
  });
}

export async function kadetskaLigaBody(): Promise<string> {
  const [standings, matches, scorers] = await Promise.all([
    db.cadetStanding.findMany({ orderBy: { position: "asc" } }),
    db.cadetMatch.findMany({ orderBy: { round: "asc" } }),
    db.cadetScorer.findMany({ orderBy: { rank: "asc" } }),
  ]);
  return youthStyleBody({
    title: "Kadetska liga Srbije",
    description: "Tabela, raspored, rezultati i strelci kadetske selekcije FK Mladost Lučani.",
    standings,
    matches,
    scorers,
  });
}

export async function pionirskaLigaBody(): Promise<string> {
  const [standings, matches] = await Promise.all([
    db.pioneerStanding.findMany({ orderBy: { position: "asc" } }),
    db.pioneerMatch.findMany({ orderBy: { round: "asc" } }),
  ]);
  return youthStyleBody({
    title: "Pionirska liga",
    description: "Tabela i rezultati pionirske selekcije FK Mladost Lučani.",
    standings,
    matches,
  });
}

export async function najavaKolaBody(): Promise<string> {
  const matches = await db.roundMatch.findMany({ orderBy: { roundNumber: "asc" } });
  if (!matches.length) return `<h1>Najava kola</h1><p>Najava predstojećeg kola Super lige Srbije.</p>`;

  const round = matches[0].roundNumber;
  const items = matches
    .map(
      (m) =>
        `<li>${esc(m.date)} ${esc(m.time)} — ${esc(m.home)} : ${esc(m.away)} (${esc(m.stadium)})${
          m.tvChannel ? `, prenos: ${esc(m.tvChannel)}` : ""
        }${m.referee ? `, sudija: ${esc(m.referee)}` : ""}</li>`,
    )
    .join("\n");

  return `<h1>Najava ${esc(round)}. kola Super lige Srbije</h1>
    <p>Satnica, stadioni, sudijske delegacije i TV prenosi za predstojeće kolo.</p>
    <ul>${items}</ul>`;
}

export async function analitikaRivalaBody(): Promise<string> {
  const a = await db.matchAnalytics.findFirst({ orderBy: { roundNumber: "desc" } });
  if (!a)
    return `<h1>Analitika rivala</h1><p>Detaljna analiza narednog protivnika FK Mladost Lučani: međusobni dueli, forma timova i statistika sezone.</p>`;

  return `<h1>Analitika rivala — ${esc(a.home)} : ${esc(a.away)}</h1>
    <p>Analiza pred ${esc(a.roundNumber)}. kolo: međusobni duel ${esc(a.home)} i ${esc(a.away)}.</p>
    <section><h2>Međusobni duели (H2H)</h2>
      <ul>
        <li>Odigrano: ${a.h2hTotalPlayed}</li>
        <li>Pobede ${esc(a.home)}: ${a.h2hHomeWins}</li>
        <li>Nerešeno: ${a.h2hDraws}</li>
        <li>Pobede ${esc(a.away)}: ${a.h2hAwayWins}</li>
        <li>Golovi: ${a.h2hHomeGoals}:${a.h2hAwayGoals}</li>
      </ul>
    </section>`;
}

export async function vestiListBody(): Promise<string> {
  const items = await db.news.findMany({
    where: { published: true },
    orderBy: { sortDate: "desc" },
    take: 20,
    select: { id: true, title: true, excerpt: true, category: true, date: true },
  });

  return `<h1>Vesti</h1>
    <p>Najnovije vesti FK Mladost Lučani — izveštaji sa utakmica, najave, transferi i dešavanja u klubu.</p>
    ${newsListMarkup(items)}`;
}

export async function dokumentaBody(): Promise<string> {
  const docs = await db.document.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } });
  if (!docs.length)
    return `<h1>Dokumenta kluba</h1><p>Zvanična dokumenta FK Mladost Lučani — statut, pravilnici, finansijski izveštaji i obrasci za preuzimanje.</p>`;

  const items = docs
    .map(
      (d) =>
        `<li>${link(`/uploads/${d.fileName}`, esc(d.title))}${
          d.description ? ` — ${esc(d.description)}` : ""
        } (${esc(d.category)})</li>`,
    )
    .join("\n");

  return `<h1>Dokumenta kluba</h1>
    <p>Zvanična dokumenta FK Mladost Lučani — statut, pravilnici, finansijski izveštaji i obrasci za preuzimanje.</p>
    <ul>${items}</ul>`;
}

export async function multimedijaBody(): Promise<string> {
  const [images, videos] = await Promise.all([
    db.mediaItem.findMany({ where: { published: true, type: "image" }, orderBy: { sortOrder: "asc" }, take: 30 }),
    db.mediaItem.findMany({ where: { published: true, type: "video" }, orderBy: { sortOrder: "asc" }, take: 30 }),
  ]);

  const list = (rows: typeof images, label: string) =>
    rows.length
      ? `<section><h2>${esc(label)}</h2><ul>${rows
          .map((m) => `<li>${esc(m.title)} (${esc(m.category)})</li>`)
          .join("\n")}</ul></section>`
      : "";

  return `<h1>Multimedija</h1>
    <p>Fotografije sa utakmica, video snimci golova i multimedijalni arhiv FK Mladost Lučani.</p>
    ${list(images, "Fotografije")}
    ${list(videos, "Video")}`;
}

/** Sadrzajne stranice iz admin CMS-a (Page model) — isti HTML kao klijent. */
export async function cmsPageBody(slug: string, title: string, lead: string): Promise<string> {
  const page = await db.page.findFirst({ where: { slug, published: true } });
  return `<h1>${esc(title)}</h1>
    <p>${esc(lead)}</p>
    ${page ? page.content : ""}`;
}

/** Kontakt — statican sadrzaj, nema CMS zapis. */
export function kontaktBody(): string {
  return `<h1>Kontakt</h1>
    <p>Kontaktirajte FK Mladost Lučani.</p>
    <address>
      ${esc(SITE.street)}, ${esc(SITE.postalCode)} ${esc(SITE.city)}, Srbija<br/>
      ${esc(SITE.stadium)}<br/>
      Tel: ${esc(SITE.phone)}<br/>
      E-mail: ${esc(SITE.email)}
    </address>`;
}

const STAFF: Array<{ name: string; role: string; category: string }> = [
  { name: "Nikola Mijailović", role: "Šef stručnog štaba", category: "Trenerski tim" },
  { name: "Goran Janković", role: "Prvi pomoćni trener", category: "Trenerski tim" },
  { name: "Nermin Useni", role: "Drugi pomoćni trener", category: "Trenerski tim" },
  { name: "Danijel Stojković", role: "Trener analitičar", category: "Trenerski tim" },
  { name: "Zlatko Zečević", role: "Trener golmana", category: "Trenerski tim" },
  { name: "Ivan Stevanović", role: "Trener fizičke spreme", category: "Stručni tim" },
  { name: "Snežana Markićević", role: "Lekar", category: "Medicinski tim" },
  { name: "Miloš Stojić", role: "Fizioterapeut", category: "Medicinski tim" },
  { name: "Srđan Kuzmanović", role: "Fizioterapeut", category: "Medicinski tim" },
];

/** Strucni stab — statican spisak, nema CMS zapis (vidi src/pages/strucni-stab/page.tsx). */
export function strucniStabBody(): string {
  const items = STAFF.map((s) => `<li>${esc(s.name)} — ${esc(s.role)} (${esc(s.category)})</li>`).join("\n");
  return `<h1>Stručni štab</h1>
    <p>Trener, pomoćni treneri i kompletan stručni štab prvog tima FK Mladost Lučani.</p>
    <ul>${items}</ul>`;
}

/** Sadrzaj vesti — pun tekst je vec u bazi, samo ga umotamo u semanticki HTML. */
export function articleBody(article: ArticleData): string {
  const img = articleImageUrl(article);
  return `<article>
    <h1>${esc(article.title)}</h1>
    <p><em>${esc(article.category)} · ${esc(article.sortDate)}</em></p>
    <img src="${esc(img)}" alt="${esc(article.title)}" />
    ${article.content ?? `<p>${esc(article.excerpt)}</p>`}
  </article>`;
}

/** Generic fallback za rute bez posebnog renderera. */
export function fallbackBody(title: string, description: string): string {
  return `<h1>${esc(title)}</h1><p>${esc(description)}</p>`;
}

/** Bira renderer za datu statičku rutu; nepoznata ruta pada na naslov + opis. */
export async function routeBody(
  pathname: string,
  route: { title: string; description: string },
): Promise<string> {
  switch (pathname) {
    case "/":
      return homeBody();
    case "/prvi-tim":
      return prviTimBody();
    case "/super-liga":
      return superLigaBody();
    case "/omladinska-liga":
      return omladinskaLigaBody();
    case "/kadetska-liga":
      return kadetskaLigaBody();
    case "/pionirska-liga":
      return pionirskaLigaBody();
    case "/najava-kola":
      return najavaKolaBody();
    case "/analitika-rivala":
      return analitikaRivalaBody();
    case "/vesti":
      return vestiListBody();
    case "/dokumenta":
      return dokumentaBody();
    case "/multimedija":
      return multimedijaBody();
    case "/istorija-kluba":
      return cmsPageBody("istorija-kluba", "Istorija kluba", "Istorijat FK Mladost Lučani od 1952. godine.");
    case "/omladinska-skola":
      return cmsPageBody(
        "omladinska-skola",
        "Omladinska škola",
        "Selekcije po uzrastu, treneri i način upisa mladih fudbalera.",
      );
    case "/stadion":
      return cmsPageBody(
        "stadion",
        'Stadion SRC "mr Radoš Milovanović"',
        "Dom FK Mladost Lučani od 1952. godine.",
      );
    case "/kontakt":
      return kontaktBody();
    case "/strucni-stab":
      return strucniStabBody();
    default:
      return fallbackBody(route.title, route.description);
  }
}
