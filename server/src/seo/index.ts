/**
 * SEO sloj servera.
 *
 * Sajt je SPA — bez ovoga svaka ruta vraca isti prazan index.html, pa Google
 * indeksira sve stranice pod istim naslovom, a Facebook/Viber/WhatsApp (koji
 * uopste ne izvrsavaju JavaScript) ne vide nista osim generickog opisa kluba.
 *
 * Ovde radimo dve stvari:
 *   1. registerSeoRoutes  — /robots.txt i /sitemap.xml
 *   2. registerHtmlSeo    — presrece zahteve za HTML dokumente i u index.html
 *                           ubacuje meta tagove specificne za trazenu rutu
 */

import fs from "fs/promises";
import path from "path";
import type { FastifyInstance, FastifyReply } from "fastify";

import { db } from "../db.js";
import {
  ROUTES,
  SITE,
  indexableRoutes,
  newsPath,
  parseNewsId,
  renderHead,
  staticRouteHead,
  articleHead,
  notFoundHead,
  type ArticleData,
} from "./meta.js";
import { routeBody, articleBody, fallbackBody } from "./body.js";

// ── robots.txt i sitemap.xml ──────────────────────────────────────────

export async function registerSeoRoutes(app: FastifyInstance) {
  app.get("/robots.txt", async (_req, reply) => {
    const noindex = Object.entries(ROUTES)
      .filter(([, meta]) => meta.noindex)
      .map(([route]) => `Disallow: ${route}`)
      .join("\n");

    const body = [
      "User-agent: *",
      "Allow: /",
      noindex,
      "Disallow: /api/",
      "",
      `Sitemap: ${SITE.url}/sitemap.xml`,
      "",
    ].join("\n");

    return reply
      .type("text/plain; charset=utf-8")
      .header("cache-control", "public, max-age=3600")
      .send(body);
  });

  app.get("/sitemap.xml", async (_req, reply) => {
    const entries: string[] = [];

    // Staticke rute
    for (const [route, meta] of indexableRoutes()) {
      entries.push(
        url(`${SITE.url}${route}`, {
          priority: meta.priority,
          changefreq: meta.changefreq,
        }),
      );
    }

    // Sve objavljene vesti
    try {
      const news = await db.news.findMany({
        where: { published: true },
        orderBy: { sortDate: "desc" },
        select: { id: true, title: true, updatedAt: true },
      });

      for (const item of news) {
        entries.push(
          url(`${SITE.url}${newsPath(item.id, item.title)}`, {
            lastmod: item.updatedAt.toISOString(),
            priority: 0.7,
            changefreq: "monthly",
          }),
        );
      }
    } catch (err) {
      // Sitemap sa statickim rutama je bolji od 500 greske.
      app.log.error({ err }, "sitemap: neuspesno citanje vesti iz baze");
    }

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      entries.join("\n") +
      `\n</urlset>\n`;

    return reply
      .type("application/xml; charset=utf-8")
      .header("cache-control", "public, max-age=1800")
      .send(xml);
  });
}

function url(
  loc: string,
  opts: { lastmod?: string; priority?: number; changefreq?: string },
): string {
  const parts = [`    <loc>${escapeXml(loc)}</loc>`];
  if (opts.lastmod) parts.push(`    <lastmod>${opts.lastmod}</lastmod>`);
  if (opts.changefreq) parts.push(`    <changefreq>${opts.changefreq}</changefreq>`);
  if (opts.priority !== undefined)
    parts.push(`    <priority>${opts.priority.toFixed(1)}</priority>`);
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── Injekcija meta tagova u index.html ────────────────────────────────

const SEO_START = "<!--seo-->";
const SEO_END = "<!--/seo-->";
const SSR_START = "<!--ssr-->";
const SSR_END = "<!--/ssr-->";

/** Putanje koje nikad nisu HTML dokument. */
const NON_DOCUMENT_PREFIXES = ["/api/", "/uploads/", "/assets/", "/@", "/node_modules/"];

function isDocumentRequest(pathname: string): boolean {
  if (NON_DOCUMENT_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  if (pathname === "/health" || pathname === "/robots.txt" || pathname === "/sitemap.xml")
    return false;
  // Sve sa ekstenzijom je staticki resurs (/logo.png, /assets/app-a1b2.js …)
  if (/\.[a-z0-9]{2,5}$/i.test(pathname)) return false;
  return true;
}

/**
 * Ucitava dist/index.html i registruje onRequest hook koji za svaki zahtev
 * HTML dokumenta vraca index.html sa meta tagovima za tu rutu.
 */
export async function registerHtmlSeo(app: FastifyInstance, clientDistPath: string) {
  const indexPath = path.join(clientDistPath, "index.html");

  let template: string;
  try {
    template = await fs.readFile(indexPath, "utf8");
  } catch (err) {
    app.log.error({ err, indexPath }, "SEO: ne mogu da procitam index.html — injekcija iskljucena");
    return;
  }

  const start = template.indexOf(SEO_START);
  const end = template.indexOf(SEO_END);
  if (start === -1 || end === -1 || end < start) {
    app.log.error(
      "SEO: markeri <!--seo--> nisu pronadjeni u index.html — injekcija iskljucena",
    );
    return;
  }

  const prefix = template.slice(0, start + SEO_START.length);
  const afterHead = template.slice(end);

  // <!--ssr--> markeri su unutar <div id="root">, posle <!--seo--> bloka.
  const ssrStart = afterHead.indexOf(SSR_START);
  const ssrEnd = afterHead.indexOf(SSR_END);
  const ssrAvailable = ssrStart !== -1 && ssrEnd !== -1 && ssrEnd > ssrStart;
  if (!ssrAvailable) {
    app.log.error(
      "SEO: markeri <!--ssr--> nisu pronadjeni u index.html — injekcija sadrzaja iskljucena, meta tagovi i dalje rade",
    );
  }

  const midBeforeSsr = ssrAvailable ? afterHead.slice(0, ssrStart + SSR_START.length) : afterHead;
  const tailAfterSsr = ssrAvailable ? afterHead.slice(ssrEnd) : "";

  const render = (head: string, body = "") =>
    ssrAvailable
      ? `${prefix}\n    ${head}\n    ${midBeforeSsr}${body}${tailAfterSsr}`
      : `${prefix}\n    ${head}\n    ${midBeforeSsr}`;

  /** routeBody/articleBody citaju bazu — greska tu ne sme da obori citav odgovor. */
  async function safeBody(build: () => Promise<string>, fallback: string): Promise<string> {
    try {
      return await build();
    } catch (err) {
      app.log.error({ err }, "SEO: neuspesna izgradnja SSR sadrzaja — koristim fallback");
      return fallback;
    }
  }

  app.addHook("onRequest", async (request, reply) => {
    if (request.method !== "GET" && request.method !== "HEAD") return;

    const pathname = normalizePath(request.url);
    if (!isDocumentRequest(pathname)) return;

    // Visak kose crte na kraju — 301 na kanonsku putanju.
    const raw = request.url.split("?")[0];
    if (raw !== pathname && raw.length > 1) {
      const qs = request.url.slice(raw.length);
      return reply.redirect(`${pathname}${qs}`, 301);
    }

    const staticRoute = ROUTES[pathname];
    if (staticRoute) {
      const body = await safeBody(
        () => routeBody(pathname, staticRoute),
        fallbackBody(staticRoute.title, staticRoute.description),
      );
      return send(reply, render(renderHead(staticRouteHead(pathname, staticRoute)), body), 200);
    }

    const newsId = parseNewsId(pathname);
    if (newsId !== null) {
      const article = await loadArticle(app, newsId);

      if (!article) {
        return send(reply, render(renderHead(notFoundHead(pathname))), 404);
      }

      // Kanonski URL sadrzi slug naslova — stari /vesti/47 linkovi i linkovi sa
      // zastarelim slugom (naslov je u medjuvremenu izmenjen) idu na 301.
      const canonical = newsPath(article.id, article.title);
      if (pathname !== canonical) {
        return reply.redirect(canonical, 301);
      }

      return send(reply, render(renderHead(articleHead(article)), articleBody(article)), 200);
    }

    // Nepoznata ruta — SPA prikazuje 404 stranicu, a mi vracamo i pravi
    // HTTP 404 da Google ovo ne tretira kao "soft 404".
    return send(
      reply,
      render(renderHead(notFoundHead(pathname)), fallbackBody("Stranica nije pronađena", "Tražena stranica ne postoji na sajtu FK Mladost Lučani.")),
      404,
    );
  });

  app.log.info({ routes: Object.keys(ROUTES).length }, "SEO: injekcija meta tagova aktivna");
}

async function loadArticle(
  app: FastifyInstance,
  id: number,
): Promise<ArticleData | null> {
  try {
    return await db.news.findFirst({
      where: { id, published: true },
      select: {
        id: true,
        title: true,
        excerpt: true,
        content: true,
        category: true,
        sortDate: true,
        imageUrl: true,
        imageFileName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (err) {
    app.log.error({ err, id }, "SEO: neuspesno citanje vesti");
    return null;
  }
}

function send(reply: FastifyReply, html: string, status: number) {
  return reply
    .code(status)
    .type("text/html; charset=utf-8")
    // Dokument se ne kesira jer meta tagovi zavise od sadrzaja baze;
    // hashirani /assets/* fajlovi se i dalje kesiraju normalno.
    .header("cache-control", "no-cache")
    .send(html);
}

/** Skida query string i zavrsnu kosu crtu (osim za koren). */
function normalizePath(rawUrl: string): string {
  let pathname = rawUrl.split("?")[0].split("#")[0];
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.replace(/\/+$/, "") || "/";
  }
  return pathname;
}
