b637ce38 · Provereno uživo (13.8.2026): https://fkmladostlucani.com/vesti/3 vraća 301 na https://fkmladostlucani.com/vesti/3-mladost-zavrsila-drugu-fazu-priprema, tačan canonical je i u sirovom HTML-u. Redirekcija postoji u kodu od 29.7.2026 (server/src/seo/index.ts, parseNewsId + newsPath). GSC nalaz je zasnovan na lastCrawlTime 15.6.2026 — pre te izmene.
e9f815fb wont_fix: "imt mladost lucani" — vezano za konkretnog protivnika (IMT) u tekućem kolu. Ubacivanje imena u stalni tekst bi bilo netačno čim se raspored pomeri na sledećeg rivala; nije stabilna popravka.
a2fc09e8 wont_fix: "mladost lucani partizan" — isti razlog kao e9f815fb, ime protivnika vezano za konkretno kolo.
db1d1e32 wont_fix: "mladost lucani partizan karte" — kao a2fc09e8, uz to nosi nameru kupovine karata koju sajt trenutno ne podržava (nema prodaju karata).
81b1482f wont_fix: "lucani fk" — obrnut red reči ("Lučani FK") nije prirodan srpski; ne postoji rečenica gde bi ovako stajalo bez da zvuči izmišljeno.
2fb82309 wont_fix: "mladost fk" — isti razlog kao 81b1482f, obrnut i neprirodan red reči.
8a4a5601 wont_fix: "lucani stadion" — obrnut red reči bez "Mladost" između; "mladost lučani stadion" i "stadion mladost lucani" su pokriveni prirodnom rečenicom, ali dodavanje i ovog dvočlanog obrnutog para bilo bi ponavljanje bez prave rečenice iza njega.
03f25bdf wont_fix: "stadion lucani" — isti razlog kao 8a4a5601, suprotan redosled iste dve reči.
1a6ea58e wont_fix: "mladost lučani standings" — engleska varijanta, 17 impresija. Zajedno sa 9ed1813e i c2a7fff3 bi tražila 3 gotovo identične engleske rečenice na naslovnoj za ukupno ~55 impresija (0.3% ukupnih) — nabijanje bez prave koristi za čitaoca. Pokrivena je samo "games" (67 impresija, id 9e695146), koja je sama dovoljno vredna za jednu prirodnu rečenicu.
9ed1813e wont_fix: "mladost lučani table" — vidi 1a6ea58e.
c2a7fff3 wont_fix: "fc mladost lucani" — vidi 1a6ea58e.
