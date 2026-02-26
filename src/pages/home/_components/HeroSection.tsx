import { ChevronRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-[oklch(0.30_0.055_252)] text-white pb-28 md:pb-36 -mt-20">
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1574561937874-23dd3e64dc89?auto=format&fit=crop&q=80&w=2000"
          alt="Stadion pozadina"
          className="w-full h-full object-cover opacity-25"
        />
        {/* Lighter gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.28_0.05_252)]/70 via-[oklch(0.35_0.05_252)]/50 to-[oklch(0.40_0.04_228)]/80" />
      </div>

      {/* Accent stripe */}
      <div className="absolute top-0 left-0 w-1 h-full bg-[oklch(0.77_0.10_225)]" />

      {/* Content — extra top padding to clear the transparent header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 sm:pt-44 md:pt-48 pb-12 text-center md:text-left">
        <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-sm text-[oklch(0.85_0.08_225)] text-xs sm:text-sm font-bold mb-5 border border-white/15 uppercase tracking-widest">
          Zvanična prezentacija
        </span>
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-5 uppercase leading-[1.05] text-balance">
          Plavo-Bela{" "}
          <span className="text-[oklch(0.82_0.09_225)]">Porodica</span>
        </h2>
        <p className="text-base sm:text-lg text-white/65 max-w-2xl mx-auto md:mx-0 mb-8 leading-relaxed">
          Dobrodošli na novi dom FK Mladost Lučani. Pratite najnovije vesti,
          rezultate i dešavanja iz našeg kluba.
        </p>
        <button className="bg-white text-[oklch(0.22_0.045_252)] hover:bg-white/90 font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg flex items-center mx-auto md:mx-0">
          Kupi Ulaznice <ChevronRight className="ml-2" size={20} />
        </button>
      </div>

      {/* Bottom fade into page background */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
