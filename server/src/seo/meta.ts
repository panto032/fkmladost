/**
 * Centralni izvor SEO metapodataka.
 *
 * Ovaj modul zna kako izgleda <head> za svaku javnu rutu. Koristi se za:
 *   1. server-side injekciju meta tagova u index.html (seo/index.ts)
 *   2. generisanje sitemap.xml
 *
 * VAZNO: tabela ruta ispod je duplirana i na klijentu, u src/lib/seo.ts, zato
 * sto server ima poseban tsconfig sa rootDir "src" pa ne moze da uvozi fajlove
 * van svog stabla. Kad menjas jednu tabelu, promeni i drugu.
 */

import { config } from "../config.js";

// ── Konstante o klubu ─────────────────────────────────────────────────
export const SITE = {
  name: "FK Mladost Lučani",
  shortName: "FK Mladost",
  legalName: "Fudbalski klub Mladost Lučani",
  url: config.siteUrl,
  logo: `${config.siteUrl}/logo.png`,
  ogImage: `${config.siteUrl}/og-image.jpg`,
  locale: "sr_RS",
  founded: "1952",
  email: "fkmladostlucani@gmail.com",
  phone: "+381 32 817-809",
  street: "Mr Radoša Milovanovića bb",
  city: "Lučani",
  postalCode: "32240",
  country: "RS",
  stadium: 'SRC "mr Radoš Milovanović"',
  stadiumCapacity: 6000,
  sameAs: [
    "https://www.facebook.com/FkMladostLucani/",
    "https://www.instagram.com/mladostlucanifk/",
  ],
} as const;

export interface RouteMeta {
  title: string;
  description: string;
  /** Ako je true, stranica se ne indeksira i ne ulazi u sitemap. */
  noindex?: boolean;
  /** Prioritet u sitemap-u (0.0–1.0). */
  priority?: number;
  /** Ocekivana ucestalost izmena — savet crawleru. */
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
}

/** Sufiks brenda koji se dodaje na sve naslove osim naslovne. */
const BRAND = " | FK Mladost Lučani";

export const ROUTES: Record<string, RouteMeta> = {
  "/": {
    title: "FK Mladost Lučani — Zvanični sajt kluba",
    description:
      "Zvanični sajt FK Mladost Lučani. Vesti, rezultati, tabela Super lige Srbije, raspored utakmica, prvi tim i omladinska škola. Tradicija od 1952. godine.",
    priority: 1.0,
    changefreq: "daily",
  },
  "/vesti": {
    title: "Vesti" + BRAND,
    description:
      "Najnovije vesti FK Mladost Lučani — izveštaji sa utakmica, najave, transferi i dešavanja u klubu.",
    priority: 0.9,
    changefreq: "daily",
  },
  "/prvi-tim": {
    title: "Prvi tim — igrači i statistika" + BRAND,
    description:
      "Kompletan spisak igrača prvog tima FK Mladost Lučani sa brojevima dresova, pozicijama i statistikom u sezoni Super lige Srbije.",
    priority: 0.8,
    changefreq: "weekly",
  },
  "/super-liga": {
    title: "Super liga Srbije — tabela i rezultati" + BRAND,
    description:
      "Aktuelna tabela Super lige Srbije, raspored i rezultati utakmica FK Mladost Lučani u najvišem rangu srpskog fudbala.",
    priority: 0.9,
    changefreq: "daily",
  },
  "/najava-kola": {
    title: "Najava kola — raspored i delegacije" + BRAND,
    description:
      "Najava predstojećeg kola Super lige Srbije: satnica, stadioni, sudijske delegacije i TV prenosi.",
    priority: 0.7,
    changefreq: "weekly",
  },
  "/analitika-rivala": {
    title: "Analitika rivala — H2H i forma" + BRAND,
    description:
      "Detaljna analiza narednog protivnika FK Mladost Lučani: međusobni dueli, forma timova i statistika sezone.",
    priority: 0.7,
    changefreq: "weekly",
  },
  "/omladinska-liga": {
    title: "Omladinska liga Srbije — tabela i rezultati" + BRAND,
    description:
      "Tabela, raspored, rezultati i lista strelaca omladinske selekcije FK Mladost Lučani u Omladinskoj ligi Srbije.",
    priority: 0.7,
    changefreq: "weekly",
  },
  "/kadetska-liga": {
    title: "Kadetska liga Srbije — tabela i rezultati" + BRAND,
    description:
      "Tabela, raspored, rezultati i strelci kadetske selekcije FK Mladost Lučani u Kadetskoj ligi Srbije.",
    priority: 0.7,
    changefreq: "weekly",
  },
  "/pionirska-liga": {
    title: "Pionirska liga — tabela i rezultati" + BRAND,
    description:
      "Tabela i rezultati pionirske selekcije FK Mladost Lučani — najmlađi uzrast omladinske škole kluba.",
    priority: 0.6,
    changefreq: "weekly",
  },
  "/omladinska-skola": {
    title: "Omladinska škola — kako se učlaniti" + BRAND,
    description:
      "Omladinska škola FK Mladost Lučani: selekcije po uzrastu, treneri, uslovi treniranja i način upisa mladih fudbalera.",
    priority: 0.8,
    changefreq: "monthly",
  },
  "/strucni-stab": {
    title: "Stručni štab" + BRAND,
    description:
      "Trener, pomoćni treneri i kompletan stručni štab prvog tima FK Mladost Lučani.",
    priority: 0.6,
    changefreq: "monthly",
  },
  "/stadion": {
    title: 'Stadion SRC "mr Radoš Milovanović"' + BRAND,
    description:
      'Stadion FK Mladost Lučani — SRC "mr Radoš Milovanović" u Lučanima, kapaciteta 6.000 mesta. Dom plavo-belih od 1952. godine.',
    priority: 0.7,
    changefreq: "yearly",
  },
  "/istorija-kluba": {
    title: "Istorija kluba od 1952." + BRAND,
    description:
      "Istorijat FK Mladost Lučani — od osnivanja 1952. godine do Super lige Srbije. Ključne godine, uspesi i legende kluba.",
    priority: 0.7,
    changefreq: "yearly",
  },
  "/multimedija": {
    title: "Multimedija — galerija i video" + BRAND,
    description:
      "Fotografije sa utakmica, video snimci golova i multimedijalni arhiv FK Mladost Lučani.",
    priority: 0.6,
    changefreq: "weekly",
  },
  "/dokumenta": {
    title: "Dokumenta kluba" + BRAND,
    description:
      "Zvanična dokumenta FK Mladost Lučani — statut, pravilnici, finansijski izveštaji i obrasci za preuzimanje.",
    priority: 0.5,
    changefreq: "monthly",
  },
  "/kontakt": {
    title: "Kontakt" + BRAND,
    description:
      "Kontaktirajte FK Mladost Lučani — adresa, telefon, e-mail i kontakt forma. Mr Radoša Milovanovića bb, Lučani.",
    priority: 0.6,
    changefreq: "yearly",
  },
  "/admin": {
    title: "Administracija" + BRAND,
    description: "Administrativni panel FK Mladost Lučani.",
    noindex: true,
  },
  "/auth/callback": {
    title: "Prijava" + BRAND,
    description: "Preusmeravanje nakon prijave.",
    noindex: true,
  },
};

/** Rute koje ulaze u sitemap.xml. */
export const indexableRoutes = (): Array<[string, RouteMeta]> =>
  Object.entries(ROUTES).filter(([, meta]) => !meta.noindex);

// ── Pomocne funkcije ──────────────────────────────────────────────────

const CYR_TO_LAT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ђ: "dj", е: "e", ж: "z", з: "z",
  и: "i", ј: "j", к: "k", л: "l", љ: "lj", м: "m", н: "n", њ: "nj", о: "o",
  п: "p", р: "r", с: "s", т: "t", ћ: "c", у: "u", ф: "f", х: "h", ц: "c",
  ч: "c", џ: "dz", ш: "s",
};

const LAT_DIACRITICS: Record<string, string> = {
  č: "c", ć: "c", đ: "dj", š: "s", ž: "z",
};

/** Uklanja HTML tagove; deljena osnova za slugify na serveru i klijentu. */
function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, " ");
}

/**
 * Pretvara naslov u URL slug: cirilica i latinicni dijakritici se preslikavaju
 * na ASCII, sve ostalo sto nije slovo/cifra postaje crtica.
 *
 * Mora da daje identican rezultat kao slugify() u src/lib/seo.ts — server i
 * klijent oba racunaju kanonsku putanju vesti i oba preusmeravaju na nju, pa
 * bi razlika napravila petlju preusmeravanja. Zato se HTML uklanja ovde, a ne
 * u pozivaocu.
 */
export function slugify(input: string): string {
  const lowered = stripTags(input ?? "").toLowerCase();
  let out = "";
  for (const ch of lowered) {
    out += CYR_TO_LAT[ch] ?? LAT_DIACRITICS[ch] ?? ch;
  }
  return out
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Kanonska putanja vesti, npr. /vesti/47-pobeda-u-lucanima */
export function newsPath(id: number, title: string): string {
  const slug = slugify(title);
  return slug ? `/vesti/${id}-${slug}` : `/vesti/${id}`;
}

/** Izvlaci ID vesti iz /vesti/47 ili /vesti/47-neki-naslov. */
export function parseNewsId(pathname: string): number | null {
  const m = /^\/vesti\/(\d+)(?:-[^/]*)?$/.exec(pathname);
  if (!m) return null;
  const id = Number.parseInt(m[1], 10);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/** Uklanja HTML tagove i visestruke razmake iz teksta. */
export function stripHtml(html: string): string {
  return (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Skracuje tekst na granici reci, do zadate duzine. */
export function truncate(text: string, max = 160): string {
  const clean = (text ?? "").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

/** Escape za tekst unutar HTML atributa. */
export function attr(value: string): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Escape za JSON-LD unutar <script>. JSON.stringify pokriva navodnike, a
 * dodatno se neutralise "</script>" i U+2028/2029 koji lome parser.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(new RegExp("\\u2028", "g"), "\\u2028")
    .replace(new RegExp("\\u2029", "g"), "\\u2029");
}

/** Pretvara relativnu putanju slike u apsolutni URL. */
export function absoluteUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return SITE.ogImage;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE.url}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

// ── JSON-LD gradivni blokovi ──────────────────────────────────────────

/** Organizacija/klub — koristi se kao publisher i na naslovnoj strani. */
export function sportsTeamSchema() {
  return {
    "@type": "SportsTeam",
    "@id": `${SITE.url}/#klub`,
    name: SITE.name,
    alternateName: [SITE.shortName, SITE.legalName, "Mladost Lučani"],
    legalName: SITE.legalName,
    sport: "Fudbal",
    url: SITE.url,
    logo: SITE.logo,
    image: SITE.ogImage,
    foundingDate: SITE.founded,
    email: SITE.email,
    telephone: SITE.phone,
    sameAs: [...SITE.sameAs],
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.street,
      addressLocality: SITE.city,
      postalCode: SITE.postalCode,
      addressCountry: SITE.country,
    },
    location: {
      "@type": "StadiumOrArena",
      name: SITE.stadium,
      maximumAttendeeCapacity: SITE.stadiumCapacity,
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE.street,
        addressLocality: SITE.city,
        postalCode: SITE.postalCode,
        addressCountry: SITE.country,
      },
    },
    memberOf: {
      "@type": "SportsOrganization",
      name: "Super liga Srbije",
      url: "https://www.superliga.rs/",
    },
  };
}

function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE.url}/#sajt`,
    url: SITE.url,
    name: SITE.name,
    inLanguage: "sr-RS",
    publisher: { "@id": `${SITE.url}/#klub` },
  };
}

/** Mrvice (breadcrumbs) za podstranice. */
function breadcrumbSchema(trail: Array<{ name: string; url: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface ArticleData {
  id: number;
  title: string;
  excerpt: string;
  content?: string | null;
  category: string;
  sortDate: string;
  imageUrl: string;
  imageFileName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** ISO datum objave — sortDate je "YYYY-MM-DD", pa pada nazad na createdAt. */
function publishedIso(article: ArticleData): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(article.sortDate)
    ? `${article.sortDate}T00:00:00+01:00`
    : article.createdAt.toISOString();
}

export function articleImageUrl(article: {
  imageUrl: string;
  imageFileName?: string | null;
}): string {
  if (article.imageFileName) return `${SITE.url}/uploads/${article.imageFileName}`;
  return absoluteUrl(article.imageUrl);
}

function newsArticleSchema(article: ArticleData, url: string) {
  return {
    "@type": "NewsArticle",
    "@id": `${url}#vest`,
    headline: truncate(article.title, 110),
    description: truncate(stripHtml(article.excerpt), 200),
    articleSection: article.category,
    image: [articleImageUrl(article)],
    datePublished: publishedIso(article),
    dateModified: article.updatedAt.toISOString(),
    inLanguage: "sr-RS",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@id": `${SITE.url}/#klub` },
    publisher: { "@id": `${SITE.url}/#klub` },
    isPartOf: { "@id": `${SITE.url}/#sajt` },
  };
}

// ── Sastavljanje <head> bloka ─────────────────────────────────────────

export interface HeadMeta {
  title: string;
  description: string;
  canonical: string;
  image: string;
  imageAlt?: string;
  ogType: "website" | "article";
  noindex?: boolean;
  /** Dodatni @graph unosi za JSON-LD. */
  graph?: unknown[];
  /** article:* tagovi za vesti. */
  article?: { published: string; modified: string; section: string };
}

/** Gradi kompletan sadrzaj SEO bloka koji se ubacuje u index.html. */
export function renderHead(meta: HeadMeta): string {
  const robots = meta.noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  const graph = [websiteSchema(), sportsTeamSchema(), ...(meta.graph ?? [])];

  const lines = [
    `<title>${attr(meta.title)}</title>`,
    `<meta name="description" content="${attr(meta.description)}" />`,
    `<link rel="canonical" href="${attr(meta.canonical)}" />`,
    `<meta name="robots" content="${robots}" />`,
    ``,
    `<meta property="og:title" content="${attr(meta.title)}" />`,
    `<meta property="og:description" content="${attr(meta.description)}" />`,
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:url" content="${attr(meta.canonical)}" />`,
    `<meta property="og:image" content="${attr(meta.image)}" />`,
    `<meta property="og:image:alt" content="${attr(meta.imageAlt ?? meta.title)}" />`,
    `<meta property="og:locale" content="${SITE.locale}" />`,
    `<meta property="og:site_name" content="${attr(SITE.name)}" />`,
  ];

  // Dimenzije prijavljujemo samo za nasu fiksnu OG sliku; za slike vesti su
  // nepoznate, a netacne dimenzije lome pregled na drustvenim mrezama.
  if (meta.image === SITE.ogImage) {
    lines.push(
      `<meta property="og:image:type" content="image/jpeg" />`,
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
    );
  }

  if (meta.article) {
    lines.push(
      ``,
      `<meta property="article:published_time" content="${attr(meta.article.published)}" />`,
      `<meta property="article:modified_time" content="${attr(meta.article.modified)}" />`,
      `<meta property="article:section" content="${attr(meta.article.section)}" />`,
      `<meta property="article:publisher" content="${SITE.sameAs[0]}" />`,
    );
  }

  lines.push(
    ``,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${attr(meta.title)}" />`,
    `<meta name="twitter:description" content="${attr(meta.description)}" />`,
    `<meta name="twitter:image" content="${attr(meta.image)}" />`,
    ``,
    // id="ld-json" — klijentski useSEO azurira bas ovaj tag pri SPA navigaciji
    // umesto da dodaje drugi graf.
    `<script type="application/ld+json" id="ld-json">${jsonLd({
      "@context": "https://schema.org",
      "@graph": graph,
    })}</script>`,
  );

  return lines.join("\n    ");
}

/** Meta za jednu od statickih ruta. */
export function staticRouteHead(pathname: string, route: RouteMeta): HeadMeta {
  const canonical = `${SITE.url}${pathname === "/" ? "/" : pathname}`;
  const graph: unknown[] = [];

  if (pathname !== "/") {
    graph.push(
      breadcrumbSchema([
        { name: "Početna", url: `${SITE.url}/` },
        { name: route.title.replace(BRAND, ""), url: canonical },
      ]),
    );
  }

  return {
    title: route.title,
    description: route.description,
    canonical,
    image: SITE.ogImage,
    imageAlt: `${SITE.name} — ${SITE.stadium}`,
    ogType: "website",
    noindex: route.noindex,
    graph,
  };
}

/**
 * Prag ispod kog se opis smatra "thin content" — excerpt-ovi u bazi su cesto
 * pisani kao naslovi ("Plavo-beli otpočeli pripreme", 28 znakova), ne kao
 * rezimei, pa cesto padaju ispod ovoga.
 */
const MIN_DESCRIPTION_LENGTH = 70;

/**
 * Meta opis vesti. Kad je excerpt kratak, dopunjuje se cinjenicama koje vec
 * postoje u bazi (kategorija, naziv kluba) — ne izmislja se nista o samoj
 * vesti, samo se doda kontekst koji stranica realno ima.
 */
function articleDescription(article: ArticleData): string {
  const summary = stripHtml(article.excerpt) || stripHtml(article.content ?? "") || "";
  if (summary.length >= MIN_DESCRIPTION_LENGTH) return truncate(summary, 160);

  const padded = summary
    ? `${summary} Pročitajte celu vest iz kategorije ${article.category} na sajtu ${SITE.name}.`
    : `Vest iz kategorije ${article.category} na sajtu ${SITE.name}.`;
  return truncate(padded, 160);
}

/** Meta za pojedinacnu vest. */
export function articleHead(article: ArticleData): HeadMeta {
  const canonical = `${SITE.url}${newsPath(article.id, article.title)}`;

  return {
    title: truncate(`${article.title}${BRAND}`, 70),
    description: articleDescription(article),
    canonical,
    image: articleImageUrl(article),
    imageAlt: article.title,
    ogType: "article",
    graph: [
      newsArticleSchema(article, canonical),
      breadcrumbSchema([
        { name: "Početna", url: `${SITE.url}/` },
        { name: "Vesti", url: `${SITE.url}/vesti` },
        { name: truncate(article.title, 70), url: canonical },
      ]),
    ],
    article: {
      published: publishedIso(article),
      modified: article.updatedAt.toISOString(),
      section: article.category,
    },
  };
}

/** Meta za nepostojecu stranicu (404). */
export function notFoundHead(pathname: string): HeadMeta {
  return {
    title: "Stranica nije pronađena" + BRAND,
    description: "Tražena stranica ne postoji na sajtu FK Mladost Lučani.",
    canonical: `${SITE.url}${pathname}`,
    image: SITE.ogImage,
    ogType: "website",
    noindex: true,
  };
}
