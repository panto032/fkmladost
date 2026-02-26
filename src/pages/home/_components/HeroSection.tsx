import { ChevronRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-[oklch(0.22_0.06_250)] text-white pb-24 md:pb-32">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=2000"
          alt="Stadion pozadina"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.06_250)] via-[oklch(0.22_0.06_250)]/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center md:text-left">
        <span className="inline-block py-1 px-3 rounded-full bg-[oklch(0.30_0.08_250)] text-[oklch(0.75_0.08_250)] text-sm font-semibold mb-4 border border-[oklch(0.40_0.10_250)]">
          Zvanična prezentacija
        </span>
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 uppercase text-balance">
          Plavo-Bela{" "}
          <span className="text-[oklch(0.65_0.18_250)]">Porodica</span>
        </h2>
        <p className="text-lg md:text-xl text-[oklch(0.70_0.06_250)] max-w-2xl mx-auto md:mx-0 mb-8">
          Dobrodošli na novi dom FK Mladost Lučani. Pratite najnovije vesti,
          rezultate i dešavanja iz našeg kluba.
        </p>
        <button className="bg-white text-[oklch(0.22_0.06_250)] hover:bg-[oklch(0.95_0.005_250)] font-bold py-3 px-8 rounded-md transition duration-300 shadow-lg flex items-center mx-auto md:mx-0">
          Kupi Ulaznice <ChevronRight className="ml-2" size={20} />
        </button>
      </div>
    </section>
  );
}
