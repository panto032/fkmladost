# SEO brief — fkmladostlucani.com

Generisano: 2026-09-12 · podaci za period 2026-08-13 – 2026-09-09
Izvori: Google Search Console, PageSpeed Insights (mobilni), sopstveni crawler

## Kako koristiti ovaj dokument

Ovo je stanje sajta izmereno spolja. Ti imaš izvorni kod projekta.

- Popravi navedeno **redom prioriteta**: prvo kritično, pa ozbiljno, pa upozorenja.
- Za svaku stavku je naveden tačan URL i dokaz iz merenja.
- **Ne izmišljaj probleme kojih nema na listi.** Lista je potpuna za ono što se merilo.
- Ako neka stavka traži odluku koju ne možeš doneti iz koda (npr. koji je pravi sadržaj za stranu), navedi je kao pitanje umesto da pogađaš.
- Sekcija „Ne dirati" na kraju navodi šta već radi — to se ne menja.

### Šta da javiš nazad

**Ne piši šta si popravio.** Alat meri sajt spolja i sam će videti — samoprijavljena
popravka je tačno ono što on postoji da proveri.

Javi samo ono što se **ne može izmeriti**: nalaz koji smatraš pogrešnim, i zašto.
Upiši ih u `seo-odgovor.md` u korenu projekta, jedan po redu:

```
a1b2c3d4 · alt="" je ispravan za dekorativne slike, proverio sam svih 41
b5c6d7e8 wont_fix: traži prepravku šablona, dogovoriti sa klijentom
```

Prvi deo je `id` iz zagrade uz nalaz. Podrazumevano stanje je `false_positive`;
može i `wont_fix:` ili `client_blocked:`. Razlog je obavezan — ostaje trajno
zapisan uz nalaz i nalaz se više ne prijavljuje.

## Stanje

- Klikovi (28 dana): 764
- Impresije (28 dana): 20456
- Prosečna pozicija: 4.4
- Različitih upita: 107
- Otvorenih nalaza: 50

## Učinak prethodnih izmena

| Strana | Menjano | Pozicija pre → posle | Impresije pre → posle |
|---|---|---|---|
| `/` | 2026-09-02 | 5.3 → 2.7 ▲ | 11346 → 2933 |
| `/super-liga` | 2026-09-02 | 7.6 → 9.3 ▼ | 274 → 118 |
| `/prvi-tim` | 2026-08-13 | 7.9 → 4.8 ▲ | 24 → 353 |

_20 strana je menjano nedavno — još nema dovoljno podataka za poređenje._
_Potrebno je bar 7 dana posle izmene i dovoljno impresija; Google ne reindeksira odmah._

## Nalazi za popravku

### Kritično — 5 na 5 strana

**`/dokumenta`**
- Skoro nema teksta za crawler (122 znakova) — Verovatno se sadržaj iscrtava tek JavaScriptom. Google to vidi kao praznu stranu. _(crawler, `thin_content`, id `1119e2a7`)_
  - dokaz: `{"textLength":122}`
  - **kako se rešava:** Strana mora da isporuči sadržaj **bez JavaScripta** — prerender, SSR ili SSG. Google renderuje JS, ali u drugom, odloženom prolazu; Bing i AI crawleri uglavnom ne renderuju uopšte.

**`/index.php/component/k2/item/62-cukaricki-mladost-3-2-3-2.html`**
- Skoro nema teksta za crawler (0 znakova) — Verovatno se sadržaj iscrtava tek JavaScriptom. Google to vidi kao praznu stranu. _(crawler, `thin_content`, id `e8931765`)_
  - dokaz: `{"textLength":0}`
  - **kako se rešava:** Strana mora da isporuči sadržaj **bez JavaScripta** — prerender, SSR ili SSG. Google renderuje JS, ali u drugom, odloženom prolazu; Bing i AI crawleri uglavnom ne renderuju uopšte.

**`/index.php/component/k2/item/857-spartak-mladost-0-1-0-0.html`**
- Skoro nema teksta za crawler (0 znakova) — Verovatno se sadržaj iscrtava tek JavaScriptom. Google to vidi kao praznu stranu. _(crawler, `thin_content`, id `66a5a714`)_
  - dokaz: `{"textLength":0}`
  - **kako se rešava:** Strana mora da isporuči sadržaj **bez JavaScripta** — prerender, SSR ili SSG. Google renderuje JS, ali u drugom, odloženom prolazu; Bing i AI crawleri uglavnom ne renderuju uopšte.

**`/index.php/component/k2/item/861-mladost-jedinstvo-ub-2-1-0-1.html`**
- Skoro nema teksta za crawler (0 znakova) — Verovatno se sadržaj iscrtava tek JavaScriptom. Google to vidi kao praznu stranu. _(crawler, `thin_content`, id `e44f5466`)_
  - dokaz: `{"textLength":0}`
  - **kako se rešava:** Strana mora da isporuči sadržaj **bez JavaScripta** — prerender, SSR ili SSG. Google renderuje JS, ali u drugom, odloženom prolazu; Bing i AI crawleri uglavnom ne renderuju uopšte.

**`/multimedija`**
- Skoro nema teksta za crawler (98 znakova) — Verovatno se sadržaj iscrtava tek JavaScriptom. Google to vidi kao praznu stranu. _(crawler, `thin_content`, id `9e763104`)_
  - dokaz: `{"textLength":98}`
  - **kako se rešava:** Strana mora da isporuči sadržaj **bez JavaScripta** — prerender, SSR ili SSG. Google renderuje JS, ali u drugom, odloženom prolazu; Bing i AI crawleri uglavnom ne renderuju uopšte.

### Ozbiljno — 5 na 5 strana

**`/`**
- LCP 6.0 s — Preko 4 s je „loše"; cilj je ispod 2,5 s. _(PageSpeed, `psi_lcp`, id `ccb5f0a3`)_
  - dokaz: `{"cls":0,"score":68,"lcp_ms":5958.642690820739,"tbt_ms":213}`
  - **kako se rešava:** Ubrzati učitavanje najvećeg elementa: prioritet hero slici, odložiti nepotreban JavaScript, keširati statiku dugoročno.

**`/analitika-rivala`**
- Skoro nema teksta za crawler (191 znakova) — Premalo sadržaja da bi strana rangirala. _(crawler, `thin_content`, id `43efa075`)_
  - dokaz: `{"textLength":191}`
  - **kako se rešava:** Strana mora da isporuči sadržaj **bez JavaScripta** — prerender, SSR ili SSG. Google renderuje JS, ali u drugom, odloženom prolazu; Bing i AI crawleri uglavnom ne renderuju uopšte.

**`/index.php/component/k2/item/62-cukaricki-mladost-3-2-3-2.html`**
- Google indeksira drugu stranu umesto ove — tvoj: https://fkmladostlucani.com/ · Google: https://fkmladostlucani.com/index.php/component/k2/item/62-cukaricki-mladost-3-2-3-2.html?tmpl=component&print=1 _(Search Console, `canonical_mismatch`, id `af733bbe`)_
  - dokaz: `{"verdict":"PASS","coverageState":"Submitted and indexed","indexingState":"INDEXING_ALLOWED","lastCrawlTime":"2026-08-24T06:29:31Z","userCanonical":"https://fkmladostlucani.com/","pageFetchState":"SUCCESSFUL","robotsTxtState":"ALLOWED","googleCanonical":"https://fkmladostlucani.com/index.php/component/k2/item/62-cukaricki-mladost-3-2-3-2.html?tmpl=component&print=1"}`
  - **kako se rešava:** Ispraviti `<link rel="canonical">` da pokazuje na samu tu stranu. Kod SPA proveriti da je tačan i u **sirovom HTML-u**, ne tek posle JavaScripta.

**`/index.php/component/k2/item/861-mladost-jedinstvo-ub-2-1-0-1.html`**
- Google indeksira drugu stranu umesto ove — tvoj: https://fkmladostlucani.com/ · Google: https://fkmladostlucani.com/index.php/component/k2/item/861-mladost-jedinstvo-ub-2-1-0-1.html _(Search Console, `canonical_mismatch`, id `a410b598`)_
  - dokaz: `{"verdict":"PASS","coverageState":"Submitted and indexed","indexingState":"INDEXING_ALLOWED","lastCrawlTime":"2026-08-29T03:22:41Z","userCanonical":"https://fkmladostlucani.com/","pageFetchState":"SUCCESSFUL","robotsTxtState":"ALLOWED","googleCanonical":"https://fkmladostlucani.com/index.php/component/k2/item/861-mladost-jedinstvo-ub-2-1-0-1.html"}`
  - **kako se rešava:** Ispraviti `<link rel="canonical">` da pokazuje na samu tu stranu. Kod SPA proveriti da je tačan i u **sirovom HTML-u**, ne tek posle JavaScripta.

**`/kontakt`**
- Skoro nema teksta za crawler (170 znakova) — Premalo sadržaja da bi strana rangirala. _(crawler, `thin_content`, id `3cb397ec`)_
  - dokaz: `{"textLength":170}`
  - **kako se rešava:** Strana mora da isporuči sadržaj **bez JavaScripta** — prerender, SSR ili SSG. Google renderuje JS, ali u drugom, odloženom prolazu; Bing i AI crawleri uglavnom ne renderuju uopšte.

### Upozorenje — 36 na 8 strana

**`/`**
- Strana rangira za „lucani mladost", a fraze nema u tekstu ni u naslovima — 52 impresija, pozicija 2.5. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `6dd39144`)_
  - dokaz: `{"query":"lucani mladost","inBody":false,"position":2.5,"inHeadings":false,"impressions":52,"trazenaFraza":"lucani mladost"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „mladost lučani utakmice", a fraze nema u tekstu ni u naslovima — 81 impresija, pozicija 3.1. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `b1ed5a06`)_
  - dokaz: `{"query":"mladost lučani utakmice","inBody":false,"position":3.1,"inHeadings":false,"impressions":81,"trazenaFraza":"mladost lucani utakmice"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „mladost lucani omladinci", a fraze nema u tekstu ni u naslovima — 85 impresija, pozicija 5.6. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `2f411b8f`)_
  - dokaz: `{"query":"mladost lucani omladinci","inBody":false,"position":5.6,"inHeadings":false,"impressions":85,"trazenaFraza":"mladost lucani omladinci"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „fk lucani", a fraze nema u tekstu ni u naslovima — 51 impresija, pozicija 2.3. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `367e024c`)_
  - dokaz: `{"query":"fk lucani","inBody":false,"position":2.3,"inHeadings":false,"impressions":51,"trazenaFraza":"fk lucani"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „fk mladost lučani утакмице", a fraze nema u tekstu ni u naslovima — 344 impresija, pozicija 2.7. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `7272376c`)_
  - dokaz: `{"query":"fk mladost lučani утакмице","inBody":false,"position":2.7,"inHeadings":false,"impressions":344,"trazenaFraza":"fk mladost lucani utakmice"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- „mladost lucani omladinci" — 2 strane se takmiče za isti upit — 85 impresija, prosečna pozicija 5.6. Sve strane nose i druge upite — ne preusmeravati, nego razdvojiti ciljanje i internim linkovima označiti glavnu. _(upiti, `query_cannibalization`, id `76aa25d1`)_
  - dokaz: `{"pages":[{"url":"https://fkmladostlucani.com","drugihUpita":94,"impressions":57,"ukupnoImpresija":17932},{"url":"https://fkmladostlucani.com/omladinska-liga","drugihUpita":9,"impressions":28,"ukupnoImpresija":56}],"query":"mladost lucani omladinci","position":5.6,"impressions":85}`
  - **kako se rešava:** Odabrati jednu glavnu stranu za taj upit. Ako slabija ne nosi druge upite — spojiti sadržaj i preusmeriti je. Ako nosi — razdvojiti ciljanje i internim linkovima označiti glavnu.
- „младост табела" — 2 strane se takmiče za isti upit — 380 impresija, prosečna pozicija 7.0. Sve strane nose i druge upite — ne preusmeravati, nego razdvojiti ciljanje i internim linkovima označiti glavnu. _(upiti, `query_cannibalization`, id `1fd775f6`)_
  - dokaz: `{"pages":[{"url":"https://fkmladostlucani.com","drugihUpita":94,"impressions":218,"ukupnoImpresija":17932},{"url":"https://fkmladostlucani.com/super-liga","drugihUpita":13,"impressions":162,"ukupnoImpresija":534}],"query":"младост табела","position":7,"impressions":380}`
  - **kako se rešava:** Odabrati jednu glavnu stranu za taj upit. Ako slabija ne nosi druge upite — spojiti sadržaj i preusmeriti je. Ako nosi — razdvojiti ciljanje i internim linkovima označiti glavnu.
- Strana rangira za „mladost lučani standings", a fraze nema u tekstu ni u naslovima — 17 impresija, pozicija 9.6. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `1a6ea58e`)_
  - dokaz: `{"query":"mladost lučani standings","inBody":false,"position":9.6,"inHeadings":false,"impressions":17,"trazenaFraza":"mladost lucani standings"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „fc mladost lucani", a fraze nema u tekstu ni u naslovima — 17 impresija, pozicija 2.5. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `c2a7fff3`)_
  - dokaz: `{"query":"fc mladost lucani","inBody":false,"position":2.5,"inHeadings":false,"impressions":17,"trazenaFraza":"fc mladost lucani"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „mladost lučani table", a fraze nema u tekstu ni u naslovima — 21 impresija, pozicija 9.6. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `9ed1813e`)_
  - dokaz: `{"query":"mladost lučani table","inBody":false,"position":9.6,"inHeadings":false,"impressions":21,"trazenaFraza":"mladost lucani table"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „imt mladost lucani", a fraze nema u tekstu ni u naslovima — 134 impresija, pozicija 6.6. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `e9f815fb`)_
  - dokaz: `{"query":"imt mladost lucani","inBody":false,"position":6.6,"inHeadings":false,"impressions":134,"trazenaFraza":"imt mladost lucani"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „lucani fk", a fraze nema u tekstu ni u naslovima — 21 impresija, pozicija 2.4. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `81b1482f`)_
  - dokaz: `{"query":"lucani fk","inBody":false,"position":2.4,"inHeadings":false,"impressions":21,"trazenaFraza":"lucani fk"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „fudbalski klub mladost lučani", a fraze nema u tekstu ni u naslovima — 19 impresija, pozicija 11.6. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `4893c39b`)_
  - dokaz: `{"query":"fudbalski klub mladost lučani","inBody":false,"position":11.6,"inHeadings":false,"impressions":19,"trazenaFraza":"fudbalski klub mladost lucani"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „mladost lučani poredak", a fraze nema u tekstu ni u naslovima — 114 impresija, pozicija 5.8. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `9fbe69ba`)_
  - dokaz: `{"query":"mladost lučani poredak","inBody":false,"position":5.8,"inHeadings":false,"impressions":114,"trazenaFraza":"mladost lucani poredak"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „младост табела", a fraze nema u tekstu ni u naslovima — 380 impresija, pozicija 7.0. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `714f02d7`)_
  - dokaz: `{"query":"младост табела","inBody":false,"position":7,"inHeadings":false,"impressions":380,"trazenaFraza":"mladost tabela"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „mladost fk", a fraze nema u tekstu ni u naslovima — 30 impresija, pozicija 2.6. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `2fb82309`)_
  - dokaz: `{"query":"mladost fk","inBody":false,"position":2.6,"inHeadings":false,"impressions":30,"trazenaFraza":"mladost fk"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „mladost lucani partizan", a fraze nema u tekstu ni u naslovima — 48 impresija, pozicija 10.4. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `a2fc09e8`)_
  - dokaz: `{"query":"mladost lucani partizan","inBody":false,"position":10.4,"inHeadings":false,"impressions":48,"trazenaFraza":"mladost lucani partizan"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „mladost lučani games", a fraze nema u tekstu ni u naslovima — 67 impresija, pozicija 3.5. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `9e695146`)_
  - dokaz: `{"query":"mladost lučani games","inBody":false,"position":3.5,"inHeadings":false,"impressions":67,"trazenaFraza":"mladost lucani games"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „fudbalski klub mladost", a fraze nema u tekstu ni u naslovima — 16 impresija, pozicija 2.1. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `bfcbd4df`)_
  - dokaz: `{"query":"fudbalski klub mladost","inBody":false,"position":2.1,"inHeadings":false,"impressions":16,"trazenaFraza":"fudbalski klub mladost"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „fk mladost lučani – табела", a fraze nema u tekstu ni u naslovima — 1197 impresija, pozicija 4.9. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `3c759ae0`)_
  - dokaz: `{"query":"fk mladost lučani – табела","inBody":false,"position":4.9,"inHeadings":false,"impressions":1197,"trazenaFraza":"fk mladost lucani tabela"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „mladost lucani partizan karte", a fraze nema u tekstu ni u naslovima — 19 impresija, pozicija 3.4. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `db1d1e32`)_
  - dokaz: `{"query":"mladost lucani partizan karte","inBody":false,"position":3.4,"inHeadings":false,"impressions":19,"trazenaFraza":"mladost lucani partizan karte"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.

**`/index.php/component/k2/item/62-cukaricki-mladost-3-2-3-2.html`**
- Strana donosi impresije, a nije u sitemapu — Provereno protiv 22 URL-ova iz sitemapa. _(sitemap, `not_in_sitemap`, id `c036e50c`)_
  - dokaz: `{"sitemapUrlCount":22}`
  - **kako se rešava:** Dodati stranu u sitemap ako treba da rangira. Ako ne treba, proveriti zašto uopšte donosi impresije.

**`/index.php/component/k2/item/857-spartak-mladost-0-1-0-0.html`**
- Googlebot nije bio 78 dana _(Search Console, `stale_crawl`, id `93eee57e`)_
  - dokaz: `{"verdict":"PASS","coverageState":"Submitted and indexed","indexingState":"INDEXING_ALLOWED","lastCrawlTime":"2026-06-25T17:59:47Z","pageFetchState":"SUCCESSFUL","robotsTxtState":"ALLOWED","googleCanonical":"https://fkmladostlucani.com/index.php/component/k2/item/857-spartak-mladost-0-1-0-0.html"}`
- Strana donosi impresije, a nije u sitemapu — Provereno protiv 22 URL-ova iz sitemapa. _(sitemap, `not_in_sitemap`, id `5787f10c`)_
  - dokaz: `{"sitemapUrlCount":22}`
  - **kako se rešava:** Dodati stranu u sitemap ako treba da rangira. Ako ne treba, proveriti zašto uopšte donosi impresije.

**`/index.php/component/k2/item/861-mladost-jedinstvo-ub-2-1-0-1.html`**
- Strana donosi impresije, a nije u sitemapu — Provereno protiv 22 URL-ova iz sitemapa. _(sitemap, `not_in_sitemap`, id `5093dff1`)_
  - dokaz: `{"sitemapUrlCount":22}`
  - **kako se rešava:** Dodati stranu u sitemap ako treba da rangira. Ako ne treba, proveriti zašto uopšte donosi impresije.

**`/prvi-tim`**
- Strana rangira za „mladost lucani igraci", a fraze nema u tekstu ni u naslovima — 68 impresija, pozicija 2.2. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `525dbf6f`)_
  - dokaz: `{"query":"mladost lucani igraci","inBody":false,"position":2.2,"inHeadings":false,"impressions":68,"trazenaFraza":"mladost lucani igraci"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „играчи fk mladost lučani", a fraze nema u tekstu ni u naslovima — 16 impresija, pozicija 2.6. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `09558a8c`)_
  - dokaz: `{"query":"играчи fk mladost lučani","inBody":false,"position":2.6,"inHeadings":false,"impressions":16,"trazenaFraza":"igraci fk mladost lucani"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.

**`/stadion`**
- Strana rangira za „lucani stadion", a fraze nema u tekstu ni u naslovima — 28 impresija, pozicija 3.1. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `8a4a5601`)_
  - dokaz: `{"query":"lucani stadion","inBody":false,"position":3.1,"inHeadings":false,"impressions":28,"trazenaFraza":"lucani stadion"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „mladost lučani stadion", a fraze nema u tekstu ni u naslovima — 79 impresija, pozicija 3.3. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `95b5a9b0`)_
  - dokaz: `{"query":"mladost lučani stadion","inBody":false,"position":3.3,"inHeadings":false,"impressions":79,"trazenaFraza":"mladost lucani stadion"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „stadion mladost lucani", a fraze nema u tekstu ni u naslovima — 58 impresija, pozicija 3.1. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `6b1b517a`)_
  - dokaz: `{"query":"stadion mladost lucani","inBody":false,"position":3.1,"inHeadings":false,"impressions":58,"trazenaFraza":"stadion mladost lucani"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- Strana rangira za „stadion lucani", a fraze nema u tekstu ni u naslovima — 19 impresija, pozicija 3.5. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `03f25bdf`)_
  - dokaz: `{"query":"stadion lucani","inBody":false,"position":3.5,"inHeadings":false,"impressions":19,"trazenaFraza":"stadion lucani"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.

**`/strucni-stab`**
- Strana rangira za „mladost lucani trener", a fraze nema u tekstu ni u naslovima — 66 impresija, pozicija 5.0. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `9ba6a5e7`)_
  - dokaz: `{"query":"mladost lucani trener","inBody":false,"position":5,"inHeadings":false,"impressions":66,"trazenaFraza":"mladost lucani trener"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- „trener mladost lucani" — 2 strane se takmiče za isti upit — 31 impresija, prosečna pozicija 4.0. Sve strane nose i druge upite — ne preusmeravati, nego razdvojiti ciljanje i internim linkovima označiti glavnu. _(upiti, `query_cannibalization`, id `e621fc7f`)_
  - dokaz: `{"pages":[{"url":"https://fkmladostlucani.com/strucni-stab","drugihUpita":7,"impressions":26,"ukupnoImpresija":93},{"url":"https://fkmladostlucani.com","drugihUpita":94,"impressions":5,"ukupnoImpresija":17932}],"query":"trener mladost lucani","position":4,"impressions":31}`
  - **kako se rešava:** Odabrati jednu glavnu stranu za taj upit. Ako slabija ne nosi druge upite — spojiti sadržaj i preusmeriti je. Ako nosi — razdvojiti ciljanje i internim linkovima označiti glavnu.
- Strana rangira za „trener mladost lucani", a fraze nema u tekstu ni u naslovima — 31 impresija, pozicija 4.0. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `62e83530`)_
  - dokaz: `{"query":"trener mladost lucani","inBody":false,"position":4,"inHeadings":false,"impressions":31,"trazenaFraza":"trener mladost lucani"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.

**`/super-liga`**
- Strana rangira za „mladost lučani tablice", a fraze nema u tekstu ni u naslovima — 21 impresija, pozicija 5.4. Ubaciti frazu u naslov sekcije ili uvod — prirodno, ne nabijanjem. _(upiti, `phrase_missing`, id `883da7d7`)_
  - dokaz: `{"query":"mladost lučani tablice","inBody":false,"position":5.4,"inHeadings":false,"impressions":21,"trazenaFraza":"mladost lucani tablice"}`
  - **kako se rešava:** Ubaciti frazu u naslov sekcije (H2) ili u prvi pasus — prirodno, ne nabijanjem. Strana već rangira, samo joj fraza nedostaje.
    **Dijakritika se NE računa** — „Zaštita na radu Kragujevac" se poklapa sa „zastita na radu kragujevac". Piši ispravan srpski.
    **Redosled reči se računa.** Umetnuta reč ili padež ruše poklapanje: „Zaštita na radu **u Kragujevcu**" se NE poklapa. Fraza mora stajati u datom redosledu, kao u naslovu — što je za lokalne upite i prirodno.
- „mladost lučani tablice" — 2 strane se takmiče za isti upit — 21 impresija, prosečna pozicija 5.4. Sve strane nose i druge upite — ne preusmeravati, nego razdvojiti ciljanje i internim linkovima označiti glavnu. _(upiti, `query_cannibalization`, id `1c442f5f`)_
  - dokaz: `{"pages":[{"url":"https://fkmladostlucani.com/super-liga","drugihUpita":13,"impressions":14,"ukupnoImpresija":534},{"url":"https://fkmladostlucani.com","drugihUpita":94,"impressions":7,"ukupnoImpresija":17932}],"query":"mladost lučani tablice","position":5.4,"impressions":21}`
  - **kako se rešava:** Odabrati jednu glavnu stranu za taj upit. Ako slabija ne nosi druge upite — spojiti sadržaj i preusmeriti je. Ako nosi — razdvojiti ciljanje i internim linkovima označiti glavnu.

### Informativno — 4 na 4 strana

**`(ceo sajt)`**
- Sajt nema merni tag (GA4) — Nijedna od 25 proverenih strana ne učitava GA4 ni GTM. Search Console vidi klik, ali ne i šta se dešava posle njega. _(crawler, `analytics_missing`, id `46612da4`)_
  - dokaz: `{"checked":25}`
  - **kako se rešava:** Ubaciti GA4 tag u `<head>` svake strane (`gtag.js` sa `G-...` mernim ID-jem). Ako property jos ne postoji, napraviti ga na analytics.google.com. Placeholder `G-XXXXXXXXXX` iz sablona NE racuna se kao tag i treba ga ukloniti.

**`/dokumenta`**
- Izmenjeno posle poslednjeg Google obilaska — čeka Google — Strana je menjana 2026-08-13, a Googlebot je poslednji put bio pre 40 dana. Vredi tražiti reindeksiranje u Search Console-u. _(Search Console, `stale_crawl`, id `fdb69338`)_
  - dokaz: `{"verdict":"PASS","changedAt":"2026-08-13T13:55:24.860Z","coverageState":"Submitted and indexed","indexingState":"INDEXING_ALLOWED","lastCrawlTime":"2026-08-02T21:24:56Z","pendingGoogle":true,"userCanonical":"https://fkmladostlucani.com/dokumenta","pageFetchState":"SUCCESSFUL","robotsTxtState":"ALLOWED","googleCanonical":"https://fkmladostlucani.com/dokumenta"}`

**`/omladinska-liga`**
- Izmenjeno posle poslednjeg Google obilaska — čeka Google — Strana je menjana 2026-08-28, a Googlebot je poslednji put bio pre 38 dana. Vredi tražiti reindeksiranje u Search Console-u. _(Search Console, `stale_crawl`, id `878db376`)_
  - dokaz: `{"verdict":"PASS","changedAt":"2026-08-28T04:02:22.695Z","coverageState":"Submitted and indexed","indexingState":"INDEXING_ALLOWED","lastCrawlTime":"2026-08-05T14:09:08Z","pendingGoogle":true,"userCanonical":"https://fkmladostlucani.com/omladinska-liga","pageFetchState":"SUCCESSFUL","robotsTxtState":"ALLOWED","googleCanonical":"https://fkmladostlucani.com/omladinska-liga"}`

**`/super-liga`**
- Izmenjeno posle poslednjeg Google obilaska — čeka Google — Strana je menjana 2026-09-02, a Googlebot je poslednji put bio pre 43 dana. Vredi tražiti reindeksiranje u Search Console-u. _(Search Console, `stale_crawl`, id `1315cc81`)_
  - dokaz: `{"verdict":"PASS","changedAt":"2026-09-02T04:02:40.438Z","coverageState":"Submitted and indexed","indexingState":"INDEXING_ALLOWED","lastCrawlTime":"2026-07-30T22:13:49Z","pendingGoogle":true,"userCanonical":"https://fkmladostlucani.com/super-liga","pageFetchState":"SUCCESSFUL","robotsTxtState":"ALLOWED","googleCanonical":"https://fkmladostlucani.com/super-liga"}`

## Preusmerenja koja treba dodati

Ove adrese Google još drži u indeksu i one donose impresije, ali nisu u aktuelnom
sitemapu — ostale su iz prethodne verzije sajta. Svakoj treba trajno preusmerenje (301).
Ne preusmeravati masovno na početnu — Google to tretira kao soft 404 i ne prenosi ništa.

| Stara adresa | Impresije | Klikovi | Predlog nove |
|---|---|---|---|
| `/vesti/3` | 5 | 0 | `/vesti` |

## Prilike — pozicija 8–20

Google već prikazuje sajt za ove upite, ali predaleko da bi se kliknulo.
Ovde pomaže doterivanje **postojeće** strane: naslov, uvod, dubina teksta, interni linkovi.

| Upit | Impresije | Klikovi | Pozicija | Strana |
|---|---|---|---|---|
| fk mladost lučani–fk partizan – табела _(strana dopunjena 2026-09-02)_ | 3085 | 0 | 10.6 | `/` |
| фк имт нови београд–fk mladost lučani – табела _(strana dopunjena 2026-09-02)_ | 319 | 0 | 9.1 | `/` |
| lučani _(strana dopunjena 2026-09-02)_ | 107 | 1 | 11.7 | `/` |
| mladost lucani partizan _(strana dopunjena 2026-09-02)_ | 48 | 0 | 10.4 | `/` |
| фк имт нови београд–fk mladost lučani _(strana dopunjena 2026-09-02)_ | 21 | 0 | 9.4 | `/` |
| mladost lučani table _(strana dopunjena 2026-09-02)_ | 18 | 0 | 9.9 | `/` |
| fudbalski klub mladost lučani _(strana dopunjena 2026-09-02)_ | 16 | 3 | 13.4 | `/` |
| mladost lučani standings _(strana dopunjena 2026-09-02)_ | 16 | 0 | 9.8 | `/` |

Spojene varijante (dijakritika i ćirilica se u Search Console vode odvojeno):

- **lučani** ← lučani (104), lucani (3)
- **mladost lucani partizan** ← mladost lucani partizan (43), mladost lučani – partizan (5)

## Brzina (mobilni, Lighthouse)

Google pragovi za „dobro": LCP ispod 2,5 s · CLS ispod 0,1 · TBT ispod 200 ms.

**Uštede ispod su Lighthouse-ova procena, ne merenje.** Provereno dvaput na terenu i
oba puta su bile optimistične — jedna slika za koju je obećano 7 kB dala je 2,4 kB,
druga ništa. Uzmi ih kao gornju granicu i izmeri posle izmene.

| Strana | Ocena | LCP | CLS | TBT |
|---|---|---|---|---|
| `/` | 68 | 6.0 s | 0.000 | 213 ms |
| `/prvi-tim` | 82 | 3.9 s | 0.001 | 17 ms |
| `/super-liga` | 83 | 3.3 s | 0.000 | 0 ms |

**`/` — šta konkretno usporava**

- Reduce unused JavaScript — procena: do 0.5 s · 70 kB
  - `https://fkmladostlucani.com/assets/index-D3q6_E8D.js`
- Render-blocking requests — procena: do 0.1 s
  - `https://fkmladostlucani.com/assets/index-STdnXSDR.css`
- Improve image delivery — procena: do 2133 kB
  - `https://fkmladostlucani.com/uploads/7f7885ae-39f9-4b43-945c-0a031152b667.png`
  - `https://fkmladostlucani.com/uploads/f8630bda-e969-4995-be6c-d503dc3e7aa5.jpeg`
  - `https://fkmladostlucani.com/stadion.jpg`
- Avoid enormous network payloads
  - `https://fkmladostlucani.com/uploads/7f7885ae-39f9-4b43-945c-0a031152b667.png`
  - `https://fkmladostlucani.com/uploads/01715852-228c-40cb-8019-714262ccc0df.jpg`
  - `https://images.unsplash.com/photo-1574561937874-23dd3e64dc89?auto=format&fit=crop&q=80&w=2000`

**`/prvi-tim` — šta konkretno usporava**

- Improve image delivery — procena: do 0.7 s · 575 kB
  - `https://www.superliga.rs/wp-content/themes/newweb-theme/images/igraci/2026/146428.png`
  - `https://fkmladostlucani.com/zajednica-logo.png`
  - `https://www.superliga.rs/wp-content/themes/newweb-theme/images/igraci/2026/26674.png`
- Reduce unused JavaScript — procena: do 0.3 s · 77 kB
  - `https://fkmladostlucani.com/assets/index-D3q6_E8D.js`
- Render-blocking requests — procena: do 0.1 s
  - `https://fkmladostlucani.com/assets/index-STdnXSDR.css`

**`/super-liga` — šta konkretno usporava**

- Reduce unused JavaScript — procena: do 0.5 s · 77 kB
  - `https://fkmladostlucani.com/assets/index-D3q6_E8D.js`
- Render-blocking requests — procena: do 0.4 s
  - `https://fkmladostlucani.com/assets/index-STdnXSDR.css`
- Improve image delivery — procena: do 49 kB
  - `https://fkmladostlucani.com/zajednica-logo.png`
  - `https://fkmladostlucani.com/msls-logo.png`
  - `https://fkmladostlucani.com/logo.png`
- Image elements do not have explicit `width` and `height`
  - `https://fkmladostlucani.com/logo.png`

## Strategija — pozicioniranje

Sve iznad je **popravka onoga što je pokvareno**. Ovaj deo je drugo pitanje:
da li uopšte ima šta da se osvoji, i gde je najveći neiskorišćen prostor.

**Trend impresija — raste.**

| Mesec | Impresije | Klikovi |
|---|---|---|
| 2026-07 | 17 | 0 |
| 2026-08 | 18590 | 718 |
| 2026-09 | 3861 | 141 |

_Obim pretrage nije meren za ovaj sajt._
_Pokrenuti `npm run cli volumes 6` (~$0.09) pa ponovo generisati brief._

### Šta OVDE treba da uradiš (ne popravka — procena)

Podaci iznad su mereni. Ovde se traži tvoja odluka šta od toga vredi:

1. **Iz spiska „upiti za koje konkurent rangira a mi ne" izaberi 3–5** koje
   ovaj sajt realno može da pokrije. Ne sve — spisak je namerno širok, i
   veliki obim ne znači da je fraza relevantna za ovaj posao.
2. **Za svaku predloži stranu**: naslov, ciljani upit, putanja, i šta mora da
   sadrži. Kolona „Namera" govori KAKAV tip strane treba — `vodič` nije
   `proizvod`, a `poređenje` nije ni jedno ni drugo.
3. **Pogledaj strukturu konkurenta iznad.** Ako mu saobraćaj nose desetine
   sličnih strana po istom obrascu, to je odgovor na „šta da pravim", i
   verovatno traži šablon, ne ručno pisanje strane po strane.
4. Ako je fraza informativna („obrazac", „primer", „zakon", „kalkulator"),
   to je i dalje prava publika — ne odbacuj je zato što ne kupuje odmah.

**Ovo je jedini deo dokumenta gde se od tebe traži procena, ne izvršavanje.**
Sve iznad je mereno i proverljivo; ovde nam treba tvoja odluka šta je od toga
vredno rada na ovom konkretnom sajtu.

## Ne dirati — već rangira (pozicija 1–7)

Ovi upiti već rade. Promene na stranama koje ih nose praviti oprezno.

| Upit | Pozicija | Impresije | Klikovi | Strana |
|---|---|---|---|---|
| mladost lucani | 2.6 | 3244 | 165 | `/` |
| фк младост лучани | 2.6 | 6625 | 102 | `/` |
| fk mladost | 3.3 | 367 | 33 | `/` |
| mladost | 4.0 | 823 | 27 | `/` |
| mladost lucani igraci | 2.0 | 59 | 26 | `/prvi-tim` |
| fk mladost lucani najnovije vesti | 1.8 | 80 | 12 | `/` |
| mladost lucani partizan karte | 3.4 | 19 | 6 | `/` |
| fk mladost lučani – табела | 4.9 | 1085 | 5 | `/` |
| mladost lucani omladinci | 5.6 | 81 | 5 | `/` |
| mladost lucani stadion | 3.3 | 74 | 5 | `/stadion` |
| играчи fk mladost lučani | 2.6 | 10 | 5 | `/prvi-tim` |
| fk lucani | 2.3 | 46 | 4 | `/` |
