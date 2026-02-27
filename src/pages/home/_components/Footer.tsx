import { Facebook, Instagram, Twitter, MapPin, Mail, Phone } from "lucide-react";
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
                src="https://cdn.hercules.app/file_O3xXQalJmikyjBgRaWY6p4A8"
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
                <Link to="/stadion" className="hover:text-white transition-colors">
                  Stadion
                </Link>
              </li>
              <li>
                <Link to="/strucni-stab" className="hover:text-white transition-colors">
                  Stručni štab
                </Link>
              </li>
              <li>
                <Link to="/najava-kola" className="hover:text-white transition-colors">
                  Najava kola
                </Link>
              </li>
              <li>
                <Link to="/analitika-rivala" className="hover:text-white transition-colors">
                  Analitika rivala
                </Link>
              </li>
              <li>
                <Link to="/omladinska-skola" className="hover:text-white transition-colors">
                  Omladinska škola
                </Link>
              </li>
              <li>
                <Link to="/dokumenta" className="hover:text-white transition-colors">
                  Dokumenta
                </Link>
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
                <Link to="/super-liga" className="hover:text-white transition-colors">
                  Super liga
                </Link>
              </li>
              <li>
                <Link to="/omladinska-liga" className="hover:text-white transition-colors">
                  Omladinska
                </Link>
              </li>
              <li>
                <Link to="/kadetska-liga" className="hover:text-white transition-colors">
                  Kadetska
                </Link>
              </li>
              <li>
                <Link to="/pionirska-liga" className="hover:text-white transition-colors">
                  Pionirska
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-bold uppercase tracking-wider mb-4 border-b border-[oklch(0.28_0.045_252)] pb-2">
              Kontakt
            </h5>
            <div className="space-y-2.5 text-[oklch(0.55_0.03_252)] text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[oklch(0.69_0.095_228)] flex-shrink-0" />
                <span>Mr Radoša Milovanovića bb, Lučani</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[oklch(0.69_0.095_228)] flex-shrink-0" />
                <span>032 / 817-809</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[oklch(0.69_0.095_228)] flex-shrink-0" />
                <span>062 / 8088-628</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[oklch(0.69_0.095_228)] flex-shrink-0" />
                <span>fkmladostlucani@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* League logos */}
        <div className="border-t border-[oklch(0.26_0.04_252)] pt-8 pb-8">
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
              className="h-24 object-contain brightness-0 invert opacity-70"
            />
            <div className="w-px h-8 bg-[oklch(0.28_0.04_252)] hidden sm:block" />
            <img
              src="https://cdn.hercules.app/file_UoSZIoqaYPoUjHDaxEZ7fVeT"
              alt="mts"
              className="h-14 object-contain"
            />
            <div className="w-px h-8 bg-[oklch(0.28_0.04_252)] hidden sm:block" />
            <img
              src="https://cdn.hercules.app/file_aoV49Bnn8jun5pPK76p81e6c"
              alt="Arena Sport"
              className="h-10 object-contain brightness-0 invert opacity-70"
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[oklch(0.26_0.04_252)] pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[oklch(0.50_0.03_252)]">
          <p>
            &copy; {new Date().getFullYear()} FK Mladost Lučani. Sva prava
            zadržana.
          </p>
          <p className="mt-4 md:mt-0">
            Kreirao{" "}
            <a href="https://impulsee.cloud/" target="_blank" rel="noopener noreferrer" className="hover:text-white font-medium">
              IMPULSE
            </a>
            {" "}part of{" "}
            <a href="https://impuls-tech.rs/" target="_blank" rel="noopener noreferrer" className="hover:text-white font-medium">
              IMPULS TECH DOO
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
