/**
 * Pomera nivoe naslova u CMS sadrzaju (admin/Tiptap) tako da najnizi koriscen
 * nivo postane h2 — h1 je vec zauzet naslovom stranice. Resava "heading skip"
 * kad admin u editoru pocne sadrzaj direktno sa H3 (editor to ne sprecava).
 * Ne popravlja preskoke UNUTAR sadrzaja (npr. h2 pa odmah h4) — to je stvar
 * strukture koju bira admin, ne jednoznacna popravka.
 *
 * Identicna funkcija postoji na serveru u server/src/seo/body.ts (ista
 * napomena o duplikaciji kao svuda u seo/ — server ne moze da uvozi iz src/).
 */
export function normalizeCmsHeadings(html: string): string {
  const levels = [...html.matchAll(/<h([1-6])[^>]*>/g)].map((m) => parseInt(m[1], 10));
  if (levels.length === 0) return html;

  const shift = 2 - Math.min(...levels);
  if (shift === 0) return html;

  return html.replace(/<(\/?)h([1-6])((?:\s[^>]*)?)>/g, (_match, slash, levelStr, attrs) => {
    const newLevel = Math.min(6, Math.max(2, parseInt(levelStr, 10) + shift));
    return `<${slash}h${newLevel}${attrs}>`;
  });
}
