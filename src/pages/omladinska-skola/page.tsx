import { ArrowLeft, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";

export default function OmladinskaSkola() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Hero banner */}
      <section className="relative bg-[oklch(0.16_0.035_252)] text-white pt-16 pb-12 md:pt-24 md:pb-16 overflow-hidden">
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

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight uppercase text-balance">
            Omladinski{" "}
            <span className="text-[oklch(0.77_0.10_225)]">Pogon</span>
          </h1>
          <p className="text-lg text-[oklch(0.55_0.04_228)] max-w-2xl mt-4 leading-relaxed">
            {'Od 1962. godine, omladinska škola FK "Mladost" je rasadnik talenata koji su obeležili istoriju kluba i srpskog fudbala.'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-[oklch(0.16_0.035_252)] pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <p className="text-[oklch(0.75_0.03_252)] text-lg leading-relaxed">
            {'Na inicijativu fudbalskog saveza sa sedištem u Čačku 1962. godine, oformljen je omladinski pogon FK "Mladost". Sekretar kluba Vasović Vujadin je prema preporuci i samom uviđaju okupio dečake iz varošice i okolnih sela i registrovao ih u savezu u Čačku.'}
          </p>

          <img
            src="/omladinska-skola-1.jpg"
            alt="Omladinski pogon FK Mladost Lučani, generacija 1962. godine"
            className="w-full rounded-2xl shadow-xl"
            loading="lazy"
            decoding="async"
          />

          <p className="text-[oklch(0.75_0.03_252)] text-lg leading-relaxed">
            {'Prva prijateljska utakmica odigrana je u leto 1962. g. u Čačku na stadionu FK Borac, sa FK "Borcem" koji je tada trenirao čuveni trener Dragan Bojović "Patak", i rezultat je bio 7:2 za FK "Borac". Kapiten te prve ekipe je bio Radoš Milovanović, a trener ekipe Bogoljub Janićijević "Bule". Ispostavilo se da je ta ekipa postala okosnica budućeg napredka koji je dosegao do grupe jug Srpske lige tadašnje Jugoslavije i Prve Srpske lige. Igrači iz te generacije su Radoš Milovanović, Radosav Ćebić, Vladan Jevđović, Petar Jakovljević i drugi.'}
          </p>

          <p className="text-[oklch(0.75_0.03_252)] text-lg leading-relaxed">
            {'Generacija rođena 1952. i 1953. godine pod vođstvom trenera Siniše Brkovića, imala je velike uspehe pa je sa reprezentacijom Srbije koja je 1971. god. bila na pripremama u Lučanima igrala 2:2, i iz te generacije je i Tadić koji je godinama bio glavni oslonac FK "Borac" iz Čačka i reprezentativac mlade reprezentacije, Zoran Đenadić okosnica prvog tima, Grujičić Ljubo dugogodišnji igrač Mladosti, Slobode i Majdanpeka. Iz sledećih generacija koje su prošle omladinsku školu Mladosti iz Lučana, izašli su igrači koji su obeležili uspehe FK Mladosti i to: Mićo Lugonja, Petar Karajičić, Dragoslav Zlatić, Milan Simeunović, Dragan Janićijević koji je igrao u FK "Borcu" i OFK "Beograd". Trener te generacije je bio Stevan Krasojević.'}
          </p>

          <p className="text-[oklch(0.75_0.03_252)] text-lg leading-relaxed">
            {'U sezoni 1985/1986. generacija rođena 1968. i 1969. godine postigla je do tada najveći uspeh osvojivši prvo mesto u ligi Čačak-Užice i Kraljevo i na turniru u Lučanima kvalifikovala se u najvišu ligu Srbije. U toj ekipi igrali su Dragan Janković, Nenad Milovanović, Nenad Nikolić i drugi. Ova ekipa pojačana sa igračima Predragom Plazinićem, Radojkom Pantelićem i drugim, igrala je zapaženu ulogu u eliti gde su se takmičili Crvena Zvezda, Partizan, OFK Beograd i drugi elitni takmičari, i ovu ekipu je vodio iskusni trener Siniša Brković.'}
          </p>

          <img
            src="/omladinska-skola-2.jpg"
            alt="Omladinska škola FK Mladost Lučani"
            className="w-full rounded-2xl shadow-xl"
            loading="lazy"
            decoding="async"
          />

          <p className="text-[oklch(0.75_0.03_252)] text-lg leading-relaxed">
            {'Igrači Nenad Milovanović, Dejan Nikolić, Predrag Plazinić, Radojko Pantelić i drugi su kao prvotimci dostigli vrhunac i ulazak u drugu saveznu ligu, a zatim u ligu Srbija-Crna Gora. Iz mlade selekcije izašla su i poznata imena Vladimir Matijašević i Igor Dimitrijević, kao i standardni prvotimac Uroš Stamatović, Dejan Stojanović i Radoica Vasić koji je postao sinonim Mladosti.'}
          </p>

          <p className="text-[oklch(0.75_0.03_252)] text-lg leading-relaxed">
            {'Posle izvesnih problema i dugogodišnjeg igranja u eliti, klub je nastavio takmičenje u Zapadnoj Srbiji. U sezoni 2001/2002. godine pod vođstvom trenera Zorana Perkovića klub se ponovo vraća u najviši stepen takmičenja, a u toj generaciji su bili Nenad Novaković, Ivan Milošević, Dragan Ćirjaković i drugi. Iz ove generacije Ivan Milošević je postigao veliki uspeh — igranje u prvom timu i angažman u inostranstvu.'}
          </p>

          <p className="text-[oklch(0.75_0.03_252)] text-lg leading-relaxed">
            {'Klub se sada sa uspehom takmiči u ligi Zapadne Srbije pod vođstvom trenera Dejana Vasilića. Pored omladinskog pogona, klub poseduje kadete koji se takmiče u Zapadnoj Srbiji, pionire i petliće koji se takmiče u ligi Moravičkog okruga.'}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
