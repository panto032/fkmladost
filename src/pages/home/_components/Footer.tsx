import { Facebook, Instagram, Twitter, MapPin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.18_0.04_252)] text-white pt-16 pb-8 border-t-4 border-[oklch(0.69_0.095_228)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Club info */}
          <div>
            <div className="flex items-center mb-4">
              <img
                src="https://cdn.hercules.app/file_axTcoMfvHwfbwT3EXxUl4neg"
                alt="FK Mladost Lučani"
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <h4 className="text-xl font-bold uppercase">FK Mladost</h4>
            </div>
            <p className="text-[oklch(0.55_0.03_252)] text-sm mb-6">
              Zvanična internet prezentacija Fudbalskog kluba Mladost Lučani.
              Tradicija duga od 1952. godine.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[oklch(0.24_0.045_252)] flex items-center justify-center hover:bg-[oklch(0.69_0.095_228)] transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[oklch(0.24_0.045_252)] flex items-center justify-center hover:bg-[oklch(0.69_0.095_228)] transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[oklch(0.24_0.045_252)] flex items-center justify-center hover:bg-[oklch(0.69_0.095_228)] transition-colors"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Club links */}
          <div>
            <h5 className="font-bold uppercase tracking-wider mb-4 border-b border-[oklch(0.28_0.045_252)] pb-2">
              Klub
            </h5>
            <ul className="space-y-2 text-[oklch(0.55_0.03_252)] text-sm">
              <li>
                <Link to="/istorija-kluba" className="hover:text-white transition-colors">
                  Istorijat kluba
                </Link>
              </li>
              <li>
                <Link to="/stadion" className="hover:text-white transition-colors">
                  Stadion
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Uprava
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Sponzori i Partneri
                </a>
              </li>
            </ul>
          </div>

          {/* Teams links */}
          <div>
            <h5 className="font-bold uppercase tracking-wider mb-4 border-b border-[oklch(0.28_0.045_252)] pb-2">
              Timovi
            </h5>
            <ul className="space-y-2 text-[oklch(0.55_0.03_252)] text-sm">
              <li>
                <Link to="/prvi-tim" className="hover:text-white transition-colors">
                  Prvi Tim
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Stručni štab
                </a>
              </li>
              <li>
                <Link to="/omladinska-skola" className="hover:text-white transition-colors">
                  Omladinska Škola
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Tabela i Rezultati
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-bold uppercase tracking-wider mb-4 border-b border-[oklch(0.28_0.045_252)] pb-2">
              Kontakt
            </h5>
            <ul className="space-y-3 text-[oklch(0.55_0.03_252)] text-sm">
              <li className="flex items-start">
                <MapPin
                  size={16}
                  className="mr-2 text-[oklch(0.69_0.095_228)] mt-1 flex-shrink-0"
                />
                <span>Radnička bb, 32240 Lučani, Srbija</span>
              </li>
              <li className="flex items-center">
                <Mail
                  size={16}
                  className="mr-2 text-[oklch(0.69_0.095_228)] flex-shrink-0"
                />
                <span>office@fkmladostlucani.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* League logos */}
        <div className="border-t border-[oklch(0.26_0.04_252)] pt-8 pb-8">
          <p className="text-[oklch(0.40_0.03_252)] text-[11px] font-semibold uppercase tracking-widest text-center mb-5">
            Član lige
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <img
              src="https://cdn.hercules.app/file_dqOXXSNAxrK08T7IquGfAAtu"
              alt="Mozzart Bet SuperLiga"
              className="h-10 object-contain"
            />
            <div className="w-px h-8 bg-[oklch(0.28_0.04_252)] hidden sm:block" />
            <img
              src="https://cdn.hercules.app/file_usixoQAS2hJa8900TJh3WrYo"
              alt="Zajednica SuperLige i Prve Lige"
              className="h-20 object-contain brightness-0 invert opacity-70"
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[oklch(0.26_0.04_252)] pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[oklch(0.50_0.03_252)]">
          <p>
            &copy; {new Date().getFullYear()} FK Mladost Lučani. Sva prava
            zadržana.
          </p>
          <div className="mt-4 md:mt-0 space-x-4">
            <a href="#" className="hover:text-white">
              Politika privatnosti
            </a>
            <a href="#" className="hover:text-white">
              Uslovi korišćenja
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
