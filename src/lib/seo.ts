/**
 * Klijentski SEO sloj.
 *
 * Prilikom prvog ucitavanja stranice meta tagove postavlja server
 * (server/src/seo/), tako da ih vide i crawleri koji ne izvrsavaju JavaScript.
 * Ovaj modul odrzava iste tagove tacnim tokom SPA navigacije, kada server nije
 * ukljucen — zbog naslova taba, deljenja iz browsera i bookmarka.
 *
 * VAZNO: tabela ROUTES je duplirana u server/src/seo/meta.ts zato sto server
 * ima poseban tsconfig sa rootDir "src" pa ne moze da uvozi fajlove van svog
 * stabla. Kad menjas jednu tabelu, promeni i drugu.
 */

import { useEffect } from "react";

export const SITE = {
  name: "FK Mladost Lučani",
  url: import.meta.env.VITE_SITE_URL ?? "https://fkmladostlucani.com",
  ogImage: "/og-image.jpg",
} as const;

const BRAND = " | FK Mladost Lučani";

export interface RouteMeta {
  title: string;
  description: string;
  noindex?: boolean;
}

export const ROUTES: Record<string, RouteMeta> = {
  "/": {
    title: "FK Mladost Lučani — Zvanični sajt kluba",
    description:
      "Zvanični sajt FK Mladost Lučani. Vesti, rezultati, tabela Super lige Srbije, raspored utakmica, prvi tim i omladinska škola. Tradicija od 1952. godine.",
  },
  "/vesti": {
    title: "Vesti" + BRAND,
    description:
      "Najnovije vesti FK Mladost Lučani — izveštaji sa utakmica, najave, transferi i dešavanja u klubu.",
  },
  "/prvi-tim": {
    title: "Prvi tim — igrači i statistika" + BRAND,
    description:
      "Kompletan spisak igrača prvog tima FK Mladost Lučani sa brojevima dresova, pozicijama i statistikom u sezoni Super lige Srbije.",
  },
  "/super-liga": {
    title: "Super liga Srbije — tabela i rezultati" + BRAND,
    description:
      "Aktuelna tabela Super lige Srbije, raspored i rezultati utakmica FK Mladost Lučani u najvišem rangu srpskog fudbala.",
  },
  "/najava-kola": {
    title: "Najava kola — raspored i delegacije" + BRAND,
    description:
      "Najava predstojećeg kola Super lige Srbije: satnica, stadioni, sudijske delegacije i TV prenosi.",
  },
  "/analitika-rivala": {
    title: "Analitika rivala — H2H i forma" + BRAND,
    description:
      "Detaljna analiza narednog protivnika FK Mladost Lučani: međusobni dueli, forma timova i statistika sezone.",
  },
  "/omladinska-liga": {
    title: "Omladinska liga Srbije — tabela i rezultati" + BRAND,
    description:
      "Tabela, raspored, rezultati i lista strelaca omladinske selekcije FK Mladost Lučani u Omladinskoj ligi Srbije.",
  },
  "/kadetska-liga": {
    title: "Kadetska liga Srbije — tabela i rezultati" + BRAND,
    description:
      "Tabela, raspored, rezultati i strelci kadetske selekcije FK Mladost Lučani u Kadetskoj ligi Srbije.",
  },
  "/pionirska-liga": {
    title: "Pionirska liga — tabela i rezultati" + BRAND,
    description:
      "Tabela i rezultati pionirske selekcije FK Mladost Lučani — najmlađi uzrast omladinske škole kluba.",
  },
  "/omladinska-skola": {
    title: "Omladinska škola — kako se učlaniti" + BRAND,
    description:
      "Omladinska škola FK Mladost Lučani: selekcije po uzrastu, treneri, uslovi treniranja i način upisa mladih fudbalera.",
  },
  "/strucni-stab": {
    title: "Stručni štab" + BRAND,
    description:
      "Trener, pomoćni treneri i kompletan stručni štab prvog tima FK Mladost Lučani.",
  },
  "/stadion": {
    title: 'Stadion SRC "mr Radoš Milovanović"' + BRAND,
    description:
      'Stadion FK Mladost Lučani — SRC "mr Radoš Milovanović" u Lučanima, kapaciteta 6.000 mesta. Dom plavo-belih od 1952. godine.',
  },
  "/istorija-kluba": {
    title: "Istorija kluba od 1952." + BRAND,
    description:
      "Istorijat FK Mladost Lučani — od osnivanja 1952. godine do Super lige Srbije. Ključne godine, uspesi i legende kluba.",
  },
  "/multimedija": {
    title: "Multimedija — galerija i video" + BRAND,
    description:
      "Fotografije sa utakmica, video snimci golova i multimedijalni arhiv FK Mladost Lučani.",
  },
  "/dokumenta": {
    title: "Dokumenta kluba" + BRAND,
    description:
      "Zvanična dokumenta FK Mladost Lučani — statut, pravilnici, finansijski izveštaji i obrasci za preuzimanje.",
  },
  "/kontakt": {
    title: "Kontakt" + BRAND,
    description:
      "Kontaktirajte FK Mladost Lučani — adresa, telefon, e-mail i kontakt forma. Mr Radoša Milovanovića bb, Lučani.",
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

// ── Slug ──────────────────────────────────────────────────────────────

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
 * Mora da daje identičan rezultat kao slugify() u server/src/seo/meta.ts —
 * server i klijent oba računaju kanonsku putanju vesti i oba preusmeravaju na
 * nju, pa bi razlika napravila petlju preusmeravanja.
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

/** Izvlaci ID vesti iz "47" ili "47-neki-naslov" (react-router param). */
export function parseNewsId(param: string | undefined): number | null {
  if (!param) return null;
  const m = /^(\d+)(?:-.*)?$/.exec(param);
  if (!m) return null;
  const id = Number.parseInt(m[1], 10);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// ── Pomocne ───────────────────────────────────────────────────────────

export function stripHtml(html: string): string {
  return (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, max = 160): string {
  const clean = (text ?? "").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

function absolute(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE.url}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

// ── Manipulacija <head> ───────────────────────────────────────────────

function setMeta(selector: string, create: () => HTMLMetaElement, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function metaByName(name: string, content: string) {
  setMeta(`meta[name="${name}"]`, () => {
    const el = document.createElement("meta");
    el.setAttribute("name", name);
    return el;
  }, content);
}

function metaByProperty(property: string, content: string) {
  setMeta(`meta[property="${property}"]`, () => {
    const el = document.createElement("meta");
    el.setAttribute("property", property);
    return el;
  }, content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(payload: unknown | null) {
  const existing = document.head.querySelector<HTMLScriptElement>("#ld-json");
  if (!payload) return; // Ne diramo graf koji je server ubacio.
  const el =
    existing ??
    (() => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.id = "ld-json";
      document.head.appendChild(s);
      return s;
    })();
  el.textContent = JSON.stringify(payload);
}

export interface SeoInput {
  title: string;
  description: string;
  /** Putanja (npr. "/stadion") ili apsolutni URL. */
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  noindex?: boolean;
  jsonLd?: unknown;
}

/**
 * Postavlja meta tagove za trenutnu stranicu. Tagove koje je server vec ubacio
 * azurira na mestu; nedostajuce kreira.
 */
export function useSEO(input: SeoInput | null) {
  const {
    title,
    description,
    path,
    image,
    imageAlt,
    type = "website",
    noindex = false,
    jsonLd = null,
  } = input ?? ({} as SeoInput);

  const ready = input !== null;
  const imageUrl = absolute(image || SITE.ogImage);
  const canonical = absolute(path || "/");
  const serialized = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    if (!ready) return;

    document.title = title;
    metaByName("description", description);
    metaByName(
      "robots",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    );
    setCanonical(canonical);

    metaByProperty("og:title", title);
    metaByProperty("og:description", description);
    metaByProperty("og:type", type);
    metaByProperty("og:url", canonical);
    metaByProperty("og:image", imageUrl);
    metaByProperty("og:image:alt", imageAlt ?? title);

    metaByName("twitter:card", "summary_large_image");
    metaByName("twitter:title", title);
    metaByName("twitter:description", description);
    metaByName("twitter:image", imageUrl);

    setJsonLd(serialized ? JSON.parse(serialized) : null);
  }, [
    ready,
    title,
    description,
    canonical,
    imageUrl,
    imageAlt,
    type,
    noindex,
    serialized,
  ]);
}

/**
 * SEO za trenutnu rutu. Poziva se jednom, iz rutera.
 *
 *  - poznata statička ruta  → meta iz tabele ROUTES
 *  - /vesti/<id>-<slug>     → ništa; NewsDetailPage sam postavlja meta kad
 *                             učita vest (do tada ostaju serverski tagovi)
 *  - sve ostalo             → 404 meta sa noindex
 */
export function useRouteSEO(path: string) {
  const route = ROUTES[path];
  const isArticle = parseNewsId(path.replace(/^\/vesti\//, "")) !== null;

  useSEO(
    route
      ? {
          title: route.title,
          description: route.description,
          path,
          noindex: route.noindex,
        }
      : isArticle
        ? null
        : {
            title: "Stranica nije pronađena" + BRAND,
            description: "Tražena stranica ne postoji na sajtu FK Mladost Lučani.",
            path,
            noindex: true,
          },
  );
}

/** JSON-LD za pojedinačnu vest — ogledalo newsArticleSchema() na serveru. */
export function articleJsonLd(article: {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  sortDate: string;
  image: string;
}) {
  const url = `${SITE.url}${newsPath(article.id, article.title)}`;
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: truncate(article.title, 110),
    description: truncate(stripHtml(article.excerpt), 200),
    articleSection: article.category,
    image: [absolute(article.image)],
    datePublished: /^\d{4}-\d{2}-\d{2}$/.test(article.sortDate)
      ? `${article.sortDate}T00:00:00+01:00`
      : undefined,
    inLanguage: "sr-RS",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "SportsTeam", name: SITE.name, url: SITE.url },
    publisher: { "@type": "SportsTeam", name: SITE.name, url: SITE.url },
  };
}
