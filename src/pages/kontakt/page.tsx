import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Clock,
  Phone,
  Send,
  CheckCircle,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Adresa",
    value: "Radnička bb, 32240 Lučani, Srbija",
    subtext: 'SRC „Mr Radoš Milovanović"',
  },
  {
    icon: Mail,
    label: "Email",
    value: "fkmladostlucani@gmail.com",
    href: "mailto:fkmladostlucani@gmail.com",
  },
  {
    icon: Phone,
    label: "Telefon",
    value: "+381 32 817 809",
    href: "tel:+38132817809",
    subtext: "Mobilni: +381 62 8088 628",
  },
  {
    icon: Clock,
    label: "Radno vreme",
    value: "Pon — Pet: 09:00 — 17:00",
    subtext: "Vikend: zatvoreno",
  },
];

const SUBJECTS = [
  "Opšte pitanje",
  "Saradnja i sponzorstvo",
  "Omladinska škola — upis",
  "Mediji i akreditacije",
  "Prodaja ulaznica",
  "Ostalo",
];

const SOCIALS = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

export default function KontaktPage() {
  const sendMessage = useMutation(api.contact.send);
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: SUBJECTS[0],
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Molimo popunite sva obavezna polja.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Unesite validnu email adresu.");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });
      setIsSent(true);
    } catch {
      toast.error("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Hero banner */}
      <section className="relative bg-[oklch(0.16_0.035_252)] text-white py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.22_0.045_252)] to-[oklch(0.16_0.035_252)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-[oklch(0.69_0.07_228)] hover:text-white text-sm font-medium transition-colors mb-6"
          >
            <ArrowLeft size={16} className="mr-1" /> Nazad na početnu
          </Link>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight uppercase">
            Kontakt{" "}
          </h2>
          <p className="text-lg text-[oklch(0.55_0.04_228)] max-w-2xl mt-3">
            Pišite nam — tu smo za sva vaša pitanja, predloge i saradnju
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-[oklch(0.16_0.035_252)] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact info sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Info cards */}
              <div className="space-y-4">
                {CONTACT_INFO.map((item) => (
                  <div
                    key={item.label}
                    className="bg-[oklch(0.20_0.04_252)] rounded-xl p-5 border border-[oklch(0.26_0.04_252)] hover:border-[oklch(0.69_0.095_228)]/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[oklch(0.69_0.095_228)]/15 flex items-center justify-center flex-shrink-0">
                        <item.icon
                          size={20}
                          className="text-[oklch(0.69_0.095_228)]"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.50_0.03_252)] mb-1">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-white font-medium hover:text-[oklch(0.69_0.095_228)] transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-white font-medium">{item.value}</p>
                        )}
                        {item.subtext && (
                          <p className="text-[oklch(0.50_0.03_252)] text-sm mt-0.5">
                            {item.subtext}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social links */}
              <div className="bg-[oklch(0.20_0.04_252)] rounded-xl p-5 border border-[oklch(0.26_0.04_252)]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.50_0.03_252)] mb-3">
                  Pratite nas
                </p>
                <div className="flex gap-3">
                  {SOCIALS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      className="w-10 h-10 rounded-full bg-[oklch(0.24_0.045_252)] flex items-center justify-center hover:bg-[oklch(0.69_0.095_228)] transition-colors text-white"
                    >
                      <s.icon size={18} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Stadium mini card */}
              <div className="bg-[oklch(0.20_0.04_252)] rounded-xl overflow-hidden border border-[oklch(0.26_0.04_252)]">
                <div className="bg-gradient-to-r from-[oklch(0.69_0.095_228)]/20 to-transparent p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.69_0.095_228)] mb-1">
                    Stadion
                  </p>
                  <p className="text-white font-bold text-lg">
                    {'SRC „Mr Radoš Milovanović"'}
                  </p>
                  <p className="text-[oklch(0.50_0.03_252)] text-sm mt-1">
                    Radnička bb, 32240 Lučani
                  </p>
                  <Link
                    to="/stadion"
                    className="inline-flex items-center gap-1 text-sm text-[oklch(0.69_0.095_228)] hover:text-white transition-colors mt-3 font-medium"
                  >
                    Više o stadionu
                    <ArrowLeft size={14} className="rotate-180" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3">
              <div className="bg-[oklch(0.20_0.04_252)] rounded-2xl p-6 md:p-8 border border-[oklch(0.26_0.04_252)]">
                {isSent ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-5">
                      <CheckCircle size={36} className="text-green-400" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mb-2">
                      Poruka poslata!
                    </h3>
                    <p className="text-[oklch(0.55_0.03_252)] max-w-sm mb-6">
                      Hvala vam na poruci. Odgovorićemo vam u najkraćem
                      mogućem roku.
                    </p>
                    <Button
                      onClick={() => {
                        setIsSent(false);
                        setForm({
                          name: "",
                          email: "",
                          subject: SUBJECTS[0],
                          message: "",
                        });
                      }}
                      className="bg-[oklch(0.69_0.095_228)] hover:bg-[oklch(0.60_0.10_228)] text-white"
                    >
                      Pošalji novu poruku
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-extrabold text-white mb-1">
                      Pošaljite nam poruku
                    </h3>
                    <p className="text-[oklch(0.50_0.03_252)] text-sm mb-6">
                      Popunite formu i javićemo vam se u najkraćem mogućem roku
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Name + Email row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.03_252)] mb-1.5">
                            Ime i prezime *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Petar Petrović"
                            className="w-full bg-[oklch(0.16_0.035_252)] border border-[oklch(0.28_0.04_252)] rounded-xl px-4 py-3 text-white placeholder:text-[oklch(0.40_0.03_252)] focus:outline-none focus:border-[oklch(0.69_0.095_228)] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.03_252)] mb-1.5">
                            Email adresa *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="petar@email.com"
                            className="w-full bg-[oklch(0.16_0.035_252)] border border-[oklch(0.28_0.04_252)] rounded-xl px-4 py-3 text-white placeholder:text-[oklch(0.40_0.03_252)] focus:outline-none focus:border-[oklch(0.69_0.095_228)] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.03_252)] mb-1.5">
                          Tema
                        </label>
                        <select
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          className="w-full bg-[oklch(0.16_0.035_252)] border border-[oklch(0.28_0.04_252)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[oklch(0.69_0.095_228)] transition-colors appearance-none cursor-pointer"
                        >
                          {SUBJECTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.03_252)] mb-1.5">
                          Poruka *
                        </label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          rows={6}
                          placeholder="Napišite vašu poruku ovde..."
                          className="w-full bg-[oklch(0.16_0.035_252)] border border-[oklch(0.28_0.04_252)] rounded-xl px-4 py-3 text-white placeholder:text-[oklch(0.40_0.03_252)] focus:outline-none focus:border-[oklch(0.69_0.095_228)] transition-colors resize-none"
                        />
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[oklch(0.69_0.095_228)] hover:bg-[oklch(0.60_0.10_228)] text-white font-bold py-3 rounded-xl text-base transition-colors disabled:opacity-50"
                        size="lg"
                      >
                        {isSubmitting ? (
                          "Slanje..."
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Send size={18} />
                            Pošalji poruku
                          </span>
                        )}
                      </Button>

                      <p className="text-[oklch(0.40_0.03_252)] text-xs text-center">
                        * Obavezna polja. Vaši podaci su zaštićeni i neće biti
                        deljeni sa trećim licima.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
