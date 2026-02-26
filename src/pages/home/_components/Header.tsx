import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NAV_LINKS = [
  { label: "Početna", href: "/", active: true },
  { label: "Vesti", href: "/vesti" },
  { label: "Prvi Tim", href: "/prvi-tim" },
  { label: "Klub", href: "#partneri" },
  { label: "Omladinska Škola", href: "#" },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (href: string, label: string) => {
    setIsMobileMenuOpen(false);
    if (href === "#") {
      toast.info(`${label} - Uskoro dolazi!`);
      return;
    }
    if (href.startsWith("#")) {
      const el = document.getElementById(href.slice(1));
      el?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    navigate(href);
  };

  return (
    <>
      {/* Fixed header — logo + nav always visible */}
      <header className="fixed top-0 left-0 right-0 z-[60] bg-[oklch(0.22_0.045_252)] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[oklch(0.55_0.12_240)]/40 blur-xl rounded-full scale-125" />
                <img
                  src="https://cdn.hercules.app/file_HWC8LtMUYR2SOIIbHHdj7L3r"
                  alt="FK Mladost Lučani grb"
                  className="relative h-16 w-auto object-contain drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)]"
                />
              </div>
              <h1 className="hidden sm:block text-2xl font-bold uppercase tracking-wide leading-none text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]" style={{ fontFamily: "'Inter', sans-serif" }}>
                FK Mladost
              </h1>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href, link.label)}
                  className={`px-4 py-2 text-sm font-semibold transition-all duration-200 border-b-2 ${
                    link.active
                      ? "text-white border-[oklch(0.55_0.12_240)]"
                      : "text-white/70 border-transparent hover:text-white hover:border-white/30"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <Link
                to="/admin"
                className="px-4 py-2 text-sm font-semibold text-yellow-300 border-b-2 border-transparent hover:border-yellow-300/50 transition-all duration-200"
              >
                Admin
              </Link>
            </nav>

            {/* Mobile toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[oklch(0.45_0.11_242)]/95 backdrop-blur-md border-t border-white/10 px-4 py-3">
            <div className="space-y-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href, link.label)}
                  className={`block w-full text-left px-4 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                    link.active
                      ? "text-white bg-white/15"
                      : "text-white/75 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <Link
                to="/admin"
                className="block w-full text-left px-4 py-2.5 rounded-xl text-base font-semibold text-yellow-300 hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
