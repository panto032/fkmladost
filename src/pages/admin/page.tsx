import { useState } from "react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import {
  Newspaper,
  Trophy,
  Handshake,
  TableProperties,
  ArrowLeft,
  LogOut,
  Users,
  FileText,
  GraduationCap,
  Shield,
  Baby,
  Zap,
  MessageSquare,
  ChevronRight,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils.ts";
import AdminNews from "./_components/AdminNews.tsx";
import AdminMatches from "./_components/AdminMatches.tsx";
import AdminPartners from "./_components/AdminPartners.tsx";
import AdminStandings from "./_components/AdminStandings.tsx";
import AdminPlayers from "./_components/AdminPlayers.tsx";
import AdminPages from "./_components/AdminPages.tsx";
import AdminYouthLeague from "./_components/AdminYouthLeague.tsx";
import AdminCadetLeague from "./_components/AdminCadetLeague.tsx";
import AdminPioneerLeague from "./_components/AdminPioneerLeague.tsx";
import AdminSuperLeague from "./_components/AdminSuperLeague.tsx";
import AdminContactMessages from "./_components/AdminContactMessages.tsx";
import AdminSettings from "./_components/AdminSettings.tsx";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Sajt",
    items: [
      { id: "news", label: "Vesti", icon: <Newspaper size={18} /> },
      { id: "pages", label: "Stranice", icon: <FileText size={18} /> },
      { id: "partners", label: "Partneri", icon: <Handshake size={18} /> },
    ],
  },
  {
    title: "Tim",
    items: [
      { id: "players", label: "Igrači", icon: <Users size={18} /> },
      { id: "matches", label: "Mečevi", icon: <Trophy size={18} /> },
      { id: "standings", label: "Tabela", icon: <TableProperties size={18} /> },
    ],
  },
  {
    title: "Lige",
    items: [
      { id: "superleague", label: "Super Liga", icon: <Zap size={18} /> },
      { id: "youth", label: "Omladinska", icon: <GraduationCap size={18} /> },
      { id: "cadet", label: "Kadetska", icon: <Shield size={18} /> },
      { id: "pioneer", label: "Pionirska", icon: <Baby size={18} /> },
    ],
  },
  {
    title: "Komunikacija",
    items: [
      {
        id: "messages",
        label: "Poruke",
        icon: <MessageSquare size={18} />,
      },
    ],
  },
  {
    title: "Podešavanja",
    items: [
      {
        id: "settings",
        label: "Tim",
        icon: <Settings size={18} />,
      },
    ],
  },
];

const CONTENT_MAP: Record<string, React.ReactNode> = {
  news: <AdminNews />,
  players: <AdminPlayers />,
  matches: <AdminMatches />,
  partners: <AdminPartners />,
  standings: <AdminStandings />,
  pages: <AdminPages />,
  youth: <AdminYouthLeague />,
  cadet: <AdminCadetLeague />,
  pioneer: <AdminPioneerLeague />,
  superleague: <AdminSuperLeague />,
  messages: <AdminContactMessages />,
  settings: <AdminSettings />,
};

function AdminDashboard() {
  const { user, removeUser } = useAuth();
  const [activeSection, setActiveSection] = useState("news");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeLabel =
    NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeSection)
      ?.label ?? "Vesti";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Admin header */}
      <header className="bg-[oklch(0.22_0.06_250)] text-white sticky top-0 z-50 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                className="lg:hidden text-[oklch(0.7_0.05_250)] hover:text-white p-1"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link
                to="/"
                className="flex items-center gap-2 text-[oklch(0.7_0.05_250)] hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline text-sm">Početna</span>
              </Link>
              <div className="h-5 w-px bg-[oklch(0.35_0.06_250)]" />
              <h1 className="text-sm font-bold uppercase tracking-wider">
                Admin Panel
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[oklch(0.7_0.05_250)] hidden sm:inline">
                {user?.profile.name || user?.profile.email}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="text-[oklch(0.7_0.05_250)] hover:text-white hover:bg-[oklch(0.28_0.06_250)]"
                onClick={() => removeUser()}
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "w-60 flex-shrink-0 bg-[oklch(0.16_0.035_252)] border-r border-[oklch(0.26_0.04_252)] overflow-y-auto transition-transform duration-200 flex flex-col",
            "fixed lg:static inset-y-0 left-0 z-40 top-14",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <nav className="py-4 flex flex-col h-full">
            <div className="flex-1">
              {NAV_GROUPS.map((group) => (
                <div key={group.title} className="mb-2">
                  <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[oklch(0.45_0.03_252)]">
                    {group.title}
                  </p>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                        activeSection === item.id
                          ? "bg-[oklch(0.69_0.095_228)]/15 text-[oklch(0.77_0.10_225)] border-r-2 border-[oklch(0.69_0.095_228)]"
                          : "text-[oklch(0.55_0.03_252)] hover:text-white hover:bg-[oklch(0.20_0.04_252)]"
                      )}
                    >
                      {item.icon}
                      {item.label}
                      {activeSection === item.id && (
                        <ChevronRight size={14} className="ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>


          </nav>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden top-14"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-foreground uppercase tracking-tight">
              {activeLabel}
            </h2>
          </div>
          <div className="flex-1">
            {CONTENT_MAP[activeSection]}
          </div>
          {/* Copyright */}
          <div className="text-center text-[11px] text-muted-foreground/60 py-6 mt-8 border-t border-border/30">
            <p>&copy; {new Date().getFullYear()} FK Mladost Lučani. Sva prava zadržana.</p>
            <p className="mt-1">
              Kreirao{" "}
              <a href="https://impulsee.cloud/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground font-medium transition-colors">
                IMPULSE
              </a>
              {" "}part of{" "}
              <a href="https://impuls-tech.rs/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground font-medium transition-colors">
                IMPULS TECH DOO
              </a>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <>
      <AuthLoading>
        <AdminLoginShell>
          <div className="space-y-4 w-full max-w-xs">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 mx-auto rounded" />
          </div>
        </AdminLoginShell>
      </AuthLoading>
      <Unauthenticated>
        <AdminLoginShell>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">
            Admin Panel
          </h2>
          <p className="text-[oklch(0.65_0.03_252)] text-sm max-w-xs text-center leading-relaxed">
            Prijavite se da biste pristupili upravljanju sajtom FK Mladost Lučani.
          </p>
          <SignInButton />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.55_0.03_252)] hover:text-white transition-colors mt-2"
          >
            <ArrowLeft size={14} />
            Nazad na početnu
          </Link>
        </AdminLoginShell>
      </Unauthenticated>
      <Authenticated>
        <AdminDashboard />
      </Authenticated>
    </>
  );
}

/** Shared login screen shell with branding */
function AdminLoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[oklch(0.14_0.03_252)] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      {/* Gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[oklch(0.69_0.095_228)] rounded-full blur-[180px] opacity-[0.07]" />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 bg-[oklch(0.69_0.095_228)] rounded-full blur-2xl opacity-20 scale-150" />
            <img
              src="https://cdn.hercules.app/file_O3xXQalJmikyjBgRaWY6p4A8"
              alt="FK Mladost Lučani"
              className="w-24 h-24 rounded-full object-cover relative z-10 border-2 border-[oklch(0.28_0.04_252)] shadow-2xl"
            />
          </div>

          {/* Club name */}
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-white uppercase tracking-widest">
              FK Mladost
            </h1>
            <p className="text-xs text-[oklch(0.50_0.03_252)] uppercase tracking-[0.25em] mt-1">
              Lučani
            </p>
          </div>

          {/* Divider */}
          <div className="w-12 h-px bg-[oklch(0.30_0.04_252)]" />

          {/* Dynamic content */}
          {children}
        </div>
      </div>

      {/* Copyright footer */}
      <div className="relative z-10 text-center py-6 text-[11px] text-[oklch(0.35_0.03_252)]">
        <p>&copy; {new Date().getFullYear()} FK Mladost Lučani. Sva prava zadržana.</p>
        <p className="mt-1">
          Kreirao{" "}
          <a href="https://impulsee.cloud/" target="_blank" rel="noopener noreferrer" className="hover:text-[oklch(0.55_0.03_252)] font-medium transition-colors">
            IMPULSE
          </a>
          {" "}part of{" "}
          <a href="https://impuls-tech.rs/" target="_blank" rel="noopener noreferrer" className="hover:text-[oklch(0.55_0.03_252)] font-medium transition-colors">
            IMPULS TECH DOO
          </a>
        </p>
      </div>
    </div>
  );
}
