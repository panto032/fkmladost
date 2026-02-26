import { ArrowLeft, GraduationCap, Trophy, Users, Calendar, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";

/* ─── Timeline data ─── */
const TIMELINE = [
  {
    year: "1962",
    icon: <GraduationCap size={20} />,
    title: "Osnivanje omladinskog pogona",
    content: `Na inicijativu fudbalskog saveza sa sedištem u Čačku 1962. godine, oformljen je omladinski pogon FK "Mladost". Sekretar kluba Vasović Vujadin je prema preporuci i samom uviđaju okupio dečake iz varošice i okolnih sela i registrovao ih u savezu u Čačku.

Prva prijateljska utakmica odigrana je u leto 1962. godine u Čačku na stadionu FK Borac, sa FK "Borcem" koji je tada trenirao čuveni trener Dragan Bojović "Patak" — rezultat je bio 7:2 za FK "Borac".

Kapiten te prve ekipe bio je Radoš Milovanović, a trener ekipe Bogoljub Janićijević "Bule". Ispostavilo se da je ta ekipa postala okosnica budućeg napretka koji je dosegao do grupe jug Srpske lige tadašnje Jugoslavije i Prve Srpske lige.`,
    players: "Radoš Milovanović, Radosav Ćebić, Vladan Jevđović, Petar Jakovljević i drugi",
    hasImageSlot: true,
    imageSlotId: 1,
  },
  {
    year: "1971",
    icon: <Star size={20} />,
    title: "Generacija 1952/53 — Veliki uspesi",
    content: `Generacija rođena 1952. i 1953. godine pod vođstvom trenera Siniše Brkovića imala je velike uspehe — sa reprezentacijom Srbije koja je 1971. godine bila na pripremama u Lučanima igrala je 2:2.

Iz te generacije je i Tadić koji je godinama bio glavni oslonac FK "Borac" iz Čačka i reprezentativac mlade reprezentacije. Zoran Đenadić bio je okosnica prvog tima, dok je Grujičić Ljubo bio dugogodišnji igrač Mladosti, Slobode i Majdanpeka.`,
    players: "Tadić, Zoran Đenadić, Grujičić Ljubo",
  },
  {
    year: "1975–1985",
    icon: <Users size={20} />,
    title: "Nove generacije — Temelj uspeha",
    content: `Iz sledećih generacija koje su prošle omladinsku školu Mladosti iz Lučana izašli su igrači koji su obeležili uspehe FK Mladosti. Trener te generacije bio je Stevan Krasojević.`,
    players: "Mićo Lugonja, Petar Karajičić, Dragoslav Zlatić, Milan Simeunović, Dragan Janićijević (FK Borac, OFK Beograd)",
  },
  {
    year: "1985/86",
    icon: <Trophy size={20} />,
    title: "Istorijski uspeh — Elita Srbije",
    content: `U sezoni 1985/1986, generacija rođena 1968. i 1969. godine postigla je do tada najveći uspeh — osvojivši prvo mesto u ligi Čačak–Užice–Kraljevo i na turniru u Lučanima kvalifikovala se u najvišu ligu Srbije.

Ova ekipa, pojačana sa igračima Predragom Plazinićem, Radojkom Pantelićem i drugim, igrala je zapaženu ulogu u eliti gde su se takmičili Crvena Zvezda, Partizan, OFK Beograd i drugi elitni takmičari. Ekipu je vodio iskusni trener Siniša Brković.`,
    players: "Dragan Janković, Nenad Milovanović, Nenad Nikolić, Predrag Plazinić, Radojko Pantelić",
    hasImageSlot: true,
    imageSlotId: 2,
  },
  {
    year: "1990-te",
    icon: <Star size={20} />,
    title: "Vrhunac — Druga savezna liga i liga Srbija-Crna Gora",
    content: `Igrači Nenad Milovanović, Dejan Nikolić, Predrag Plazinić, Radojko Pantelić i drugi su kao prvotimci dostigli vrhunac i ulazak u drugu saveznu ligu, a zatim u ligu Srbija–Crna Gora.

Iz mlade selekcije izašla su i poznata imena — Vladimir Matijašević i Igor Dimitrijević, kao i standardni prvotimac Uroš Stamatović, Dejan Stojanović i Radoica Vasić koji je postao sinonim Mladosti.`,
    players: "Vladimir Matijašević, Igor Dimitrijević, Uroš Stamatović, Dejan Stojanović, Radoica Vasić",
  },
  {
    year: "2001/02",
    icon: <Trophy size={20} />,
    title: "Povratak u elitu",
    content: `Posle izvesnih problema i dugogodišnjeg igranja u eliti, klub je nastavio takmičenje u Zapadnoj Srbiji. U sezoni 2001/2002 godine, pod vođstvom trenera Zorana Perkovića, klub se ponovo vraća u najviši stepen takmičenja.

Iz ove generacije Ivan Milošević je postigao veliki uspeh — igranje u prvom timu i angažman u inostranstvu.`,
    players: "Nenad Novaković, Ivan Milošević, Dragan Ćirjaković",
  },
  {
    year: "Danas",
    icon: <Calendar size={20} />,
    title: "Omladinski pogon danas",
    content: `Klub se sada sa uspehom takmiči u ligi Zapadne Srbije pod vođstvom trenera Dejana Vasilića. Pored omladinskog pogona, klub poseduje kadete koji se takmiče u Zapadnoj Srbiji, pionire i petliće koji se takmiče u ligi Moravičkog okruga.`,
  },
];

/* ─── Image placeholder ─── */
function ImageSlot({ slotId }: { slotId: number }) {
  return (
    <div className="my-6 rounded-xl overflow-hidden border border-[oklch(0.30_0.045_252)] bg-[oklch(0.14_0.03_252)] flex items-center justify-center aspect-video">
      <div className="text-center p-8">
        <div className="w-14 h-14 rounded-full bg-[oklch(0.69_0.095_228)]/15 flex items-center justify-center mx-auto mb-3">
          <GraduationCap size={28} className="text-[oklch(0.69_0.095_228)]" />
        </div>
        <p className="text-[oklch(0.50_0.03_252)] text-sm font-medium">
          Slika {slotId} — Omladinski pogon
        </p>
        <p className="text-[oklch(0.40_0.03_252)] text-xs mt-1">
          Mesto za fotografiju
        </p>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function OmladinskaSkola() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Hero banner */}
      <section className="relative bg-[oklch(0.16_0.035_252)] text-white pt-16 pb-12 md:pt-24 md:pb-16 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.22_0.045_252)] to-[oklch(0.16_0.035_252)]" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[oklch(0.69_0.095_228)]/5 blur-[120px] -translate-y-1/2 translate-x-1/4" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-[oklch(0.69_0.07_228)] hover:text-white text-sm font-medium transition-colors mb-6"
          >
            <ArrowLeft size={16} className="mr-1" /> Nazad na početnu
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[oklch(0.69_0.095_228)]/15 flex items-center justify-center">
              <GraduationCap size={24} className="text-[oklch(0.69_0.095_228)]" />
            </div>
            <span className="text-[oklch(0.69_0.095_228)] text-sm font-bold uppercase tracking-widest">
              Istorija
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight uppercase text-balance">
            Omladinski{" "}
            <span className="text-[oklch(0.77_0.10_225)]">Pogon</span>
          </h2>
          <p className="text-lg text-[oklch(0.55_0.04_228)] max-w-2xl mt-4 leading-relaxed">
            {'Od 1962. godine, omladinska škola FK "Mladost" je rasadnik talenata koji su obeležili istoriju kluba i srpskog fudbala.'}
          </p>
        </div>
      </section>

      {/* Timeline content */}
      <section className="bg-[oklch(0.16_0.035_252)] pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] md:left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-[oklch(0.69_0.095_228)] via-[oklch(0.30_0.045_252)] to-transparent" />

            <div className="space-y-10">
              {TIMELINE.map((item, idx) => (
                <div key={idx} className="relative pl-14 md:pl-16">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[oklch(0.22_0.045_252)] border-2 border-[oklch(0.69_0.095_228)] flex items-center justify-center z-10">
                    <span className="text-[oklch(0.69_0.095_228)]">
                      {item.icon}
                    </span>
                  </div>

                  {/* Year badge */}
                  <div className="inline-block bg-[oklch(0.69_0.095_228)]/15 text-[oklch(0.77_0.10_225)] text-sm font-bold px-3 py-1 rounded-full mb-3">
                    {item.year}
                  </div>

                  {/* Card */}
                  <div className="bg-[oklch(0.20_0.04_252)] border border-[oklch(0.28_0.04_252)] rounded-2xl p-5 md:p-7">
                    <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mb-4">
                      {item.title}
                    </h3>

                    {/* Text paragraphs */}
                    <div className="space-y-3">
                      {item.content.split("\n\n").map((para, pIdx) => (
                        <p
                          key={pIdx}
                          className="text-[oklch(0.70_0.02_228)] text-[15px] leading-[1.8]"
                        >
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Image slot if applicable */}
                    {item.hasImageSlot && item.imageSlotId && (
                      <ImageSlot slotId={item.imageSlotId} />
                    )}

                    {/* Notable players */}
                    {item.players && (
                      <div className="mt-5 pt-4 border-t border-[oklch(0.28_0.04_252)]">
                        <p className="text-[oklch(0.50_0.03_252)] text-xs font-bold uppercase tracking-widest mb-2">
                          Istaknuti igrači
                        </p>
                        <p className="text-[oklch(0.77_0.10_225)] text-sm font-medium leading-relaxed">
                          {item.players}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
