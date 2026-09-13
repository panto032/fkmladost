# SEO brief — fkmladostlucani.com

Generisano: 2026-09-13 · podaci za period 2026-08-14 – 2026-09-10
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

- Klikovi (28 dana): 768
- Impresije (28 dana): 20619
- Prosečna pozicija: 4.4
- Različitih upita: 107
- Otvorenih nalaza: 16

## Gde se gubi — put od pretrage do posla

| Korak | Vrednost | |
|---|---|---|
| Impresije | 22843 | za 90 dana |
| Klikovi | 869 | CTR 3.80% |
| Organske sesije | 4 | iz GA4 |
| Angažovanje | 0% | organskog saobraćaja |
| Konverzije | 0 | nijedan ključni događaj nije podešen |

**Samo 24% saobraćaja dolazi iz pretrage.**
Ostalo je direktan dolazak i preporuke. Ako je ovo aplikacija, „direct" su uglavnom
prijavljeni korisnici — rad na SEO-u se onda ne sme meriti ukupnim brojem poseta,
jer taj broj najvećim delom meri korišćenje aplikacije.

### Nijedan korak ne pada ispod praga

Put od pretrage do strane radi. To znači da je sledeći potez u širenju — više tema i
više upita — a ne u doterivanju postojećeg.

## Učinak prethodnih izmena

_26 strana je menjano nedavno — još nema dovoljno podataka za poređenje._
_Potrebno je bar 7 dana posle izmene i dovoljno impresija; Google ne reindeksira odmah._

## Nalazi za popravku

### Kritično — 5 na 5 strana

**`/dokumenta`**
- Skoro nema teksta za crawler (122 znakova) — Verovatno se sadržaj iscrtava tek JavaScriptom. Google to vidi kao praznu stranu. _(crawler, `thin_content`, id `1119e2a7`)_
  - dokaz: `{"textLength":122}`
  - **kako se rešava:** Strana mora da isporuči sadržaj **bez JavaScripta** — prerender, SSR ili SSG. Google renderuje JS, ali u drugom, odloženom prolazu; Bing i AI crawleri uglavnom ne renderuju uopšte.

**`/index.php/component/k2/item/62-cukaricki-mladost-3-2-3-2.html`**
- HTTP 404 — Strana vraća grešku. _(crawler, `crawl_http_error`, id `bc9e34b2`)_
  - dokaz: `{"status":404}`
  - **kako se rešava:** Strana vraća grešku servera. Ako treba da postoji — popraviti aplikaciju ili server. Ako ne treba — vratiti **404** (ne 5xx) ili **301** na naslednicu. 5xx je najgori od ta tri: Google ga čita kao „vrati se kasnije" i zadržava stranu u indeksu.

**`/index.php/component/k2/item/857-spartak-mladost-0-1-0-0.html`**
- HTTP 404 — Strana vraća grešku. _(crawler, `crawl_http_error`, id `73d2deb3`)_
  - dokaz: `{"status":404}`
  - **kako se rešava:** Strana vraća grešku servera. Ako treba da postoji — popraviti aplikaciju ili server. Ako ne treba — vratiti **404** (ne 5xx) ili **301** na naslednicu. 5xx je najgori od ta tri: Google ga čita kao „vrati se kasnije" i zadržava stranu u indeksu.

**`/index.php/component/k2/item/861-mladost-jedinstvo-ub-2-1-0-1.html`**
- HTTP 404 — Strana vraća grešku. _(crawler, `crawl_http_error`, id `f7a67b3c`)_
  - dokaz: `{"status":404}`
  - **kako se rešava:** Strana vraća grešku servera. Ako treba da postoji — popraviti aplikaciju ili server. Ako ne treba — vratiti **404** (ne 5xx) ili **301** na naslednicu. 5xx je najgori od ta tri: Google ga čita kao „vrati se kasnije" i zadržava stranu u indeksu.

**`/multimedija`**
- Skoro nema teksta za crawler (98 znakova) — Verovatno se sadržaj iscrtava tek JavaScriptom. Google to vidi kao praznu stranu. _(crawler, `thin_content`, id `9e763104`)_
  - dokaz: `{"textLength":98}`
  - **kako se rešava:** Strana mora da isporuči sadržaj **bez JavaScripta** — prerender, SSR ili SSG. Google renderuje JS, ali u drugom, odloženom prolazu; Bing i AI crawleri uglavnom ne renderuju uopšte.

### Ozbiljno — 2 na 2 strana

**`/`**
- LCP 6.0 s — Preko 4 s je „loše"; cilj je ispod 2,5 s. _(PageSpeed, `psi_lcp`, id `ccb5f0a3`)_
  - dokaz: `{"cls":0,"score":68,"lcp_ms":5958.642690820739,"tbt_ms":213}`
  - **kako se rešava:** Ubrzati učitavanje najvećeg elementa: prioritet hero slici, odložiti nepotreban JavaScript, keširati statiku dugoročno.

**`/kontakt`**
- Skoro nema teksta za crawler (364 znakova) — Premalo sadržaja da bi strana rangirala. _(crawler, `thin_content`, id `3cb397ec`)_
  - dokaz: `{"textLength":364}`
  - **kako se rešava:** Strana mora da isporuči sadržaj **bez JavaScripta** — prerender, SSR ili SSG. Google renderuje JS, ali u drugom, odloženom prolazu; Bing i AI crawleri uglavnom ne renderuju uopšte.

### Upozorenje — 4 na 3 strana

**`/`**
- „mladost lucani omladinci" — 2 strane se takmiče za isti upit — 85 impresija, prosečna pozicija 5.6. Sve strane nose i druge upite — ne preusmeravati, nego razdvojiti ciljanje i internim linkovima označiti glavnu. _(upiti, `query_cannibalization`, id `76aa25d1`)_
  - dokaz: `{"pages":[{"url":"https://fkmladostlucani.com","drugihUpita":94,"impressions":57,"ukupnoImpresija":17932},{"url":"https://fkmladostlucani.com/omladinska-liga","drugihUpita":9,"impressions":28,"ukupnoImpresija":56}],"query":"mladost lucani omladinci","position":5.6,"impressions":85}`
  - **kako se rešava:** Odabrati jednu glavnu stranu za taj upit. Ako slabija ne nosi druge upite — spojiti sadržaj i preusmeriti je. Ako nosi — razdvojiti ciljanje i internim linkovima označiti glavnu.
- „младост табела" — 2 strane se takmiče za isti upit — 380 impresija, prosečna pozicija 7.0. Sve strane nose i druge upite — ne preusmeravati, nego razdvojiti ciljanje i internim linkovima označiti glavnu. _(upiti, `query_cannibalization`, id `1fd775f6`)_
  - dokaz: `{"pages":[{"url":"https://fkmladostlucani.com","drugihUpita":94,"impressions":218,"ukupnoImpresija":17932},{"url":"https://fkmladostlucani.com/super-liga","drugihUpita":13,"impressions":162,"ukupnoImpresija":534}],"query":"младост табела","position":7,"impressions":380}`
  - **kako se rešava:** Odabrati jednu glavnu stranu za taj upit. Ako slabija ne nosi druge upite — spojiti sadržaj i preusmeriti je. Ako nosi — razdvojiti ciljanje i internim linkovima označiti glavnu.

**`/strucni-stab`**
- „trener mladost lucani" — 2 strane se takmiče za isti upit — 31 impresija, prosečna pozicija 4.0. Sve strane nose i druge upite — ne preusmeravati, nego razdvojiti ciljanje i internim linkovima označiti glavnu. _(upiti, `query_cannibalization`, id `e621fc7f`)_
  - dokaz: `{"pages":[{"url":"https://fkmladostlucani.com/strucni-stab","drugihUpita":7,"impressions":26,"ukupnoImpresija":93},{"url":"https://fkmladostlucani.com","drugihUpita":94,"impressions":5,"ukupnoImpresija":17932}],"query":"trener mladost lucani","position":4,"impressions":31}`
  - **kako se rešava:** Odabrati jednu glavnu stranu za taj upit. Ako slabija ne nosi druge upite — spojiti sadržaj i preusmeriti je. Ako nosi — razdvojiti ciljanje i internim linkovima označiti glavnu.

**`/super-liga`**
- „mladost lučani tablice" — 2 strane se takmiče za isti upit — 21 impresija, prosečna pozicija 5.4. Sve strane nose i druge upite — ne preusmeravati, nego razdvojiti ciljanje i internim linkovima označiti glavnu. _(upiti, `query_cannibalization`, id `1c442f5f`)_
  - dokaz: `{"pages":[{"url":"https://fkmladostlucani.com/super-liga","drugihUpita":13,"impressions":14,"ukupnoImpresija":534},{"url":"https://fkmladostlucani.com","drugihUpita":94,"impressions":7,"ukupnoImpresija":17932}],"query":"mladost lučani tablice","position":5.4,"impressions":21}`
  - **kako se rešava:** Odabrati jednu glavnu stranu za taj upit. Ako slabija ne nosi druge upite — spojiti sadržaj i preusmeriti je. Ako nosi — razdvojiti ciljanje i internim linkovima označiti glavnu.

### Informativno — 5 na 5 strana

**`/dokumenta`**
- Izmenjeno posle poslednjeg Google obilaska — čeka Google — Strana je menjana 2026-08-13, a Googlebot je poslednji put bio pre 41 dana. Vredi tražiti reindeksiranje u Search Console-u. _(Search Console, `stale_crawl`, id `fdb69338`)_
  - dokaz: `{"verdict":"PASS","changedAt":"2026-08-13T13:55:24.860Z","coverageState":"Submitted and indexed","indexingState":"INDEXING_ALLOWED","lastCrawlTime":"2026-08-02T21:24:56Z","pendingGoogle":true,"userCanonical":"https://fkmladostlucani.com/dokumenta","pageFetchState":"SUCCESSFUL","robotsTxtState":"ALLOWED","googleCanonical":"https://fkmladostlucani.com/dokumenta"}`
  - **kako se rešava:** Nije greška u kodu — strana je izmenjena, Google to još nije video. Zatražiti reindeksiranje u Search Console-u (URL Inspection → Request Indexing). **Ovo se ne prijavljuje kao lažan nalaz** — to je jedini instrument koji meri da li je izmena stigla do pretrage.

**`/index.php/component/k2/item/62-cukaricki-mladost-3-2-3-2.html`**
- Popravljeno na sajtu — Google još nije video novi canonical — tvoj: https://fkmladostlucani.com/ · Google: https://fkmladostlucani.com/index.php/component/k2/item/62-cukaricki-mladost-3-2-3-2.html?tmpl=component&print=1. Sajt danas ima drugačiji canonical — Google će ga videti pri sledećem obilasku. _(Search Console, `canonical_mismatch`, id `af733bbe`)_
  - dokaz: `{"verdict":"PASS","coverageState":"Submitted and indexed","indexingState":"INDEXING_ALLOWED","lastCrawlTime":"2026-08-24T06:29:31Z","pendingGoogle":true,"userCanonical":"https://fkmladostlucani.com/","pageFetchState":"SUCCESSFUL","robotsTxtState":"ALLOWED","googleCanonical":"https://fkmladostlucani.com/index.php/component/k2/item/62-cukaricki-mladost-3-2-3-2.html?tmpl=component&print=1"}`
  - **kako se rešava:** Ispraviti `<link rel="canonical">` da pokazuje na samu tu stranu. Kod SPA proveriti da je tačan i u **sirovom HTML-u**, ne tek posle JavaScripta.

**`/index.php/component/k2/item/861-mladost-jedinstvo-ub-2-1-0-1.html`**
- Popravljeno na sajtu — Google još nije video novi canonical — tvoj: https://fkmladostlucani.com/ · Google: https://fkmladostlucani.com/index.php/component/k2/item/861-mladost-jedinstvo-ub-2-1-0-1.html. Sajt danas ima drugačiji canonical — Google će ga videti pri sledećem obilasku. _(Search Console, `canonical_mismatch`, id `a410b598`)_
  - dokaz: `{"verdict":"PASS","coverageState":"Submitted and indexed","indexingState":"INDEXING_ALLOWED","lastCrawlTime":"2026-08-29T03:22:41Z","pendingGoogle":true,"userCanonical":"https://fkmladostlucani.com/","pageFetchState":"SUCCESSFUL","robotsTxtState":"ALLOWED","googleCanonical":"https://fkmladostlucani.com/index.php/component/k2/item/861-mladost-jedinstvo-ub-2-1-0-1.html"}`
  - **kako se rešava:** Ispraviti `<link rel="canonical">` da pokazuje na samu tu stranu. Kod SPA proveriti da je tačan i u **sirovom HTML-u**, ne tek posle JavaScripta.

**`/omladinska-liga`**
- Izmenjeno posle poslednjeg Google obilaska — čeka Google — Strana je menjana 2026-08-28, a Googlebot je poslednji put bio pre 38 dana. Vredi tražiti reindeksiranje u Search Console-u. _(Search Console, `stale_crawl`, id `878db376`)_
  - dokaz: `{"verdict":"PASS","changedAt":"2026-08-28T04:02:22.695Z","coverageState":"Submitted and indexed","indexingState":"INDEXING_ALLOWED","lastCrawlTime":"2026-08-05T14:09:08Z","pendingGoogle":true,"userCanonical":"https://fkmladostlucani.com/omladinska-liga","pageFetchState":"SUCCESSFUL","robotsTxtState":"ALLOWED","googleCanonical":"https://fkmladostlucani.com/omladinska-liga"}`
  - **kako se rešava:** Nije greška u kodu — strana je izmenjena, Google to još nije video. Zatražiti reindeksiranje u Search Console-u (URL Inspection → Request Indexing). **Ovo se ne prijavljuje kao lažan nalaz** — to je jedini instrument koji meri da li je izmena stigla do pretrage.

**`/super-liga`**
- Izmenjeno posle poslednjeg Google obilaska — čeka Google — Strana je menjana 2026-09-12, a Googlebot je poslednji put bio pre 44 dana. Vredi tražiti reindeksiranje u Search Console-u. _(Search Console, `stale_crawl`, id `1315cc81`)_
  - dokaz: `{"verdict":"PASS","changedAt":"2026-09-12T18:35:20.136Z","coverageState":"Submitted and indexed","indexingState":"INDEXING_ALLOWED","lastCrawlTime":"2026-07-30T22:13:49Z","pendingGoogle":true,"userCanonical":"https://fkmladostlucani.com/super-liga","pageFetchState":"SUCCESSFUL","robotsTxtState":"ALLOWED","googleCanonical":"https://fkmladostlucani.com/super-liga"}`
  - **kako se rešava:** Nije greška u kodu — strana je izmenjena, Google to još nije video. Zatražiti reindeksiranje u Search Console-u (URL Inspection → Request Indexing). **Ovo se ne prijavljuje kao lažan nalaz** — to je jedini instrument koji meri da li je izmena stigla do pretrage.

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
| fk mladost lučani–fk partizan – табела _(strana dopunjena 2026-09-12)_ | 3085 | 0 | 10.6 | `/` |
| фк имт нови београд–fk mladost lučani – табела _(strana dopunjena 2026-09-12)_ | 319 | 0 | 9.1 | `/` |
| lučani _(strana dopunjena 2026-09-12)_ | 108 | 1 | 11.6 | `/` |
| mladost lucani partizan _(strana dopunjena 2026-09-12)_ | 48 | 0 | 10.4 | `/` |
| фк имт нови београд–fk mladost lučani _(strana dopunjena 2026-09-12)_ | 21 | 0 | 9.4 | `/` |
| fudbalski klub mladost lučani _(strana dopunjena 2026-09-12)_ | 19 | 3 | 11.6 | `/` |
| mladost lučani table _(strana dopunjena 2026-09-12)_ | 18 | 0 | 9.9 | `/` |
| mladost lučani standings _(strana dopunjena 2026-09-12)_ | 17 | 0 | 9.6 | `/` |

Spojene varijante (dijakritika i ćirilica se u Search Console vode odvojeno):

- **lučani** ← lučani (104), lucani (4)
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
| 2026-09 | 4236 | 151 |

_Obim pretrage nije meren za ovaj sajt._
_Pokrenuti `npm run cli volumes 6` (~$0.09) pa ponovo generisati brief._

**Autoritet — profil linkova.**

| Domen | Linkova | Domena koji linkuju | Rank |
|---|---|---|---|
| **mi** | 2630 | 380 | 233 |
| forebet.com | 376764 | 17902 | 374 |

**Razlika je 47×.** Ovo je jedini uzrok koji se NE resava u kodu ovog sajta.
Ako su tehnika i sadrzaj u redu a pozicija ne mrda, razlog je ovde — i popravlja
se van repoa (spominjanja, katalozi, saradnje), ne izmenom strane.

**Ko su stvarni konkurenti** (izvedeno iz preklapanja upita, ne procenjeno):

- `forebet.com` — 9 zajedničkih upita (od ukupno 1302 koje pokriva)

**Upiti za koje `forebet.com` rangira a mi ne** — gotov spisak sadržaja koji fali:

| Upit | Pretraga/mes | Njihova pozicija |
|---|---|---|
| eurobasket | 49500 | 44 |
| evroliga standing | 22200 | 41 |
| црвена звезда партизан | 22200 | 28 |
| војводина црвена звезда | 18100 | 37 |
| партизан црвена звезда | 14800 | 35 |
| црвена звезда војводина | 14800 | 37 |
| novi pazar fk | 12100 | 49 |
| fk novi pazar | 12100 | 47 |
| crvena zvezda vs partizan | 12100 | 26 |
| црвена звезда нови пазар | 12100 | 34 |
| атлетико мадрид барселона | 9900 | 22 |
| superliga srbija | 9900 | 53 |
| партизан офк београд | 9900 | 27 |
| partizan vs crvena zvezda | 9900 | 36 |
| црвена звезда селтик | 8100 | 51 |

**Koje strane konkurentu donose saobraćaj** — to je struktura koja pobeđuje:

- `/` — 22 upita
- `/en/football/matches/albania-serbia-2250451` — 13 upita
- `/en/football/matches/real-madrid-barcelona-2316517` — 10 upita
- `/en/football/matches/partizan-aek-larnaka-2307232` — 10 upita
- `/en/football/matches/fk-radnicki-1923-crvena-zvezda-2310582` — 10 upita
- `/en/football/matches/spartak-subotica-partizan-2310446` — 10 upita
- `/en/football/matches/crvena-zvezda-vojvodina-2310530` — 9 upita
- `/en/football-tips-and-predictions-for-today` — 8 upita
- `/en/football/matches/psg-real-madrid-2307097` — 8 upita
- `/en/football/matches/atl%C3%A9tico-madrid-real-madrid-2412571` — 7 upita

**GEO — da li nas AI pominje.** Pitanje: „фк младост лучани — šta preporučuješ u Srbiji? Navedi konkretna imena i sajtove."

**Ne pominje nas** (gpt-4.1-mini, 2026-09-12). Proveriti da li `robots.txt` blokira AI botove i da li strana isporučuje sadržaj bez JavaScripta.

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
| mladost lucani | 2.6 | 3264 | 163 | `/` |
| фк младост лучани | 2.6 | 6751 | 100 | `/` |
| fk mladost | 3.2 | 371 | 34 | `/` |
| mladost | 4.1 | 831 | 28 | `/` |
| mladost lucani igraci | 2.0 | 61 | 27 | `/prvi-tim` |
| fk mladost lucani najnovije vesti | 1.8 | 80 | 12 | `/` |
| mladost lucani partizan karte | 3.4 | 19 | 6 | `/` |
| fk mladost lučani – табела | 4.9 | 1097 | 5 | `/` |
| mladost lucani omladinci | 5.6 | 81 | 5 | `/` |
| играчи fk mladost lučani | 2.6 | 10 | 5 | `/prvi-tim` |
| mladost lucani stadion | 3.3 | 78 | 4 | `/stadion` |
| fk lucani | 2.3 | 45 | 4 | `/` |

## Svesno odloženo — ne prijavljivati ponovo

- Google indeksira drugu stranu umesto ove (`/vesti/3`) — false_positive: Provereno uživo (13.8.2026): https://fkmladostlucani.com/vesti/3 vraća 301 na https://fkmladostlucani.com/vesti/3-mladost-zavrsila-drugu-fazu-priprema, tačan canonical je i u sirovom HTML-u. Redirekcija postoji u kodu od 29.7.2026 (server/src/seo/index.ts, parseNewsId + newsPath). GSC nalaz je zasnovan na lastCrawlTime 15.6.2026 — pre te izmene.
- Strana rangira za „fc mladost lucani", a fraze nema u tekstu ni u naslovima (`/`) — wont_fix: "fc mladost lucani" — vidi 1a6ea58e.
- Strana rangira za „mladost lučani table", a fraze nema u tekstu ni u naslovima (`/`) — wont_fix: "mladost lučani table" — vidi 1a6ea58e.
- Strana rangira za „lucani fk", a fraze nema u tekstu ni u naslovima (`/`) — wont_fix: "lucani fk" — obrnut red reči ("Lučani FK") nije prirodan srpski; ne postoji rečenica gde bi ovako stajalo bez da zvuči izmišljeno.
- Strana rangira za „mladost fk", a fraze nema u tekstu ni u naslovima (`/`) — wont_fix: "mladost fk" — isti razlog kao 81b1482f, obrnut i neprirodan red reči.
- Strana rangira za „mladost lucani partizan", a fraze nema u tekstu ni u naslovima (`/`) — wont_fix: "mladost lucani partizan" — isti razlog kao e9f815fb, ime protivnika vezano za konkretno kolo.
- Strana rangira za „mladost lučani standings", a fraze nema u tekstu ni u naslovima (`/`) — wont_fix: "mladost lučani standings" — engleska varijanta, 17 impresija. Zajedno sa 9ed1813e i c2a7fff3 bi tražila 3 gotovo identične engleske rečenice na naslovnoj za ukupno ~55 impresija (0.3% ukupnih) — nabijanje bez prave koristi za čitaoca. Pokrivena je samo "games" (67 impresija, id 9e695146), koja je sama dovoljno vredna za jednu prirodnu rečenicu.
- Strana rangira za „imt mladost lucani", a fraze nema u tekstu ni u naslovima (`/`) — wont_fix: "imt mladost lucani" — vezano za konkretnog protivnika (IMT) u tekućem kolu. Ubacivanje imena u stalni tekst bi bilo netačno čim se raspored pomeri na sledećeg rivala; nije stabilna popravka.
- Strana rangira za „mladost lucani partizan karte", a fraze nema u tekstu ni u naslovima (`/`) — wont_fix: "mladost lucani partizan karte" — kao a2fc09e8, uz to nosi nameru kupovine karata koju sajt trenutno ne podržava (nema prodaju karata).
- Strana rangira za „lucani stadion", a fraze nema u tekstu ni u naslovima (`/stadion`) — wont_fix: "lucani stadion" — obrnut red reči bez "Mladost" između; "mladost lučani stadion" i "stadion mladost lucani" su pokriveni prirodnom rečenicom, ali dodavanje i ovog dvočlanog obrnutog para bilo bi ponavljanje bez prave rečenice iza njega.
- Strana rangira za „stadion lucani", a fraze nema u tekstu ni u naslovima (`/stadion`) — wont_fix: "stadion lucani" — isti razlog kao 8a4a5601, suprotan redosled iste dve reči.
