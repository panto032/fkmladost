import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1574561937874-23dd3e64dc89?auto=format&fit=crop&q=80&w=2000",
    tag: "Zvanična prezentacija",
    title: "Plavo-Bela",
    titleAccent: "Porodica",
    description:
      "Dobrodošli na novi dom FK Mladost Lučani. Pratite najnovije vesti, rezultate i dešavanja iz našeg kluba.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1759156207851-ff2c0a158797?auto=format&fit=crop&q=80&w=2000",
    tag: "Navijači",
    title: "Uvek Uz",
    titleAccent: "Mladost",
    description:
      "Naši navijači su srce kluba. Na svakoj utakmici, kod kuće ili na gostovanju, plavo-bela boja sija najjače.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1686399922306-9936feee3138?auto=format&fit=crop&q=80&w=2000",
    tag: "Tim",
    title: "Snaga U",
    titleAccent: "Jedinstvu",
    description:
      "Naš tim je spreman za nova poglavlja. Zajedno gradimo budućnost FK Mladost Lučani.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1595030044556-acfaa61edc0f?auto=format&fit=crop&q=80&w=2000",
    tag: "Stadion",
    title: "Naš",
    titleAccent: "Stadion",
    description:
      "Stadion u Lučanima — mesto gde se istorija piše, emocije žive i gde svaka utakmica postaje nezaboravna.",
  },
] as const;

const INTERVAL_MS = 6000;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current],
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <section className="relative h-[520px] sm:h-[560px] md:h-[600px] overflow-hidden bg-[oklch(0.16_0.035_252)]">
      {/* Background images with crossfade */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <img
            src={slide.image}
            alt={slide.tag}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.04_252)]/90 via-[oklch(0.14_0.035_252)]/70 to-[oklch(0.16_0.035_252)]/40" />
        </motion.div>
      </AnimatePresence>

      {/* Bottom fade to background */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/60 to-transparent z-10 pointer-events-none" />

      {/* Geometric accent line */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[oklch(0.77_0.10_225)] z-20" />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Tag pill */}
              <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md text-[oklch(0.77_0.10_225)] text-xs sm:text-sm font-bold mb-5 border border-white/10 uppercase tracking-widest">
                {slide.tag}
              </span>

              {/* Title */}
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-4 uppercase leading-[1.05]">
                <span className="text-white">{slide.title}</span>
                <br />
                <span className="text-[oklch(0.77_0.10_225)]">
                  {slide.titleAccent}
                </span>
              </h2>

              {/* Description */}
              <p className="text-base sm:text-lg text-white/60 max-w-xl mb-8 leading-relaxed">
                {slide.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots + Navigation */}
          <div className="flex items-center gap-4">
            {/* Dots */}
            <div className="flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="group relative h-2.5 rounded-full transition-all duration-500 overflow-hidden"
                  style={{ width: i === current ? 40 : 10 }}
                  aria-label={`Slide ${i + 1}`}
                >
                  <span className="absolute inset-0 rounded-full bg-white/20" />
                  {i === current && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-[oklch(0.77_0.10_225)]"
                      layoutId="activeDot"
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-1 ml-4">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all duration-300"
                aria-label="Prethodni slajd"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all duration-300"
                aria-label="Sledeći slajd"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Slide counter */}
            <span className="text-white/30 text-sm font-mono ml-auto hidden sm:block">
              {String(current + 1).padStart(2, "0")} /{" "}
              {String(SLIDES.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
