import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NAV_LINKS = [
  { label: "Početna", href: "/", active: true },
  { label: "Vesti", href: "#vesti" },
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
    // Page navigation
    navigate(href);
  };

  return (
    <header className="bg-[oklch(0.50_0.12_240)] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              src="https://cdn.hercules.app/file_axTcoMfvHwfbwT3EXxUl4neg"
              alt="FK Mladost Lučani grb"
              className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-[oklch(0.69_0.095_228)]"
            />
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider leading-none">
                FK Mladost
              </h1>
              <span className="text-[oklch(0.69_0.07_228)] text-xs tracking-widest uppercase">
                Lučani 1952
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex space-x-8 items-center">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href, link.label)}
                className={`font-medium transition-colors border-b-2 py-2 ${
                  link.active
                    ? "text-white border-[oklch(0.69_0.095_228)]"
                    : "text-[oklch(0.70_0.04_228)] hover:text-white border-transparent hover:border-[oklch(0.69_0.095_228)]"
                }`}
              >
                {link.label}
              </button>
            ))}
            <Link
              to="/admin"
              className="text-yellow-300 hover:text-yellow-100 font-medium transition-colors border-b-2 border-transparent hover:border-yellow-300 py-2"
            >
              Admin
            </Link>
          </nav>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[oklch(0.70_0.04_228)] hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[oklch(0.45_0.11_242)] border-t border-white/15">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href, link.label)}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
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
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-yellow-300 hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
