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
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="space-y-4 w-full max-w-md px-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-6 px-4">
            <div className="w-16 h-16 bg-[oklch(0.22_0.06_250)] rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xl">FKM</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
            <p className="text-muted-foreground max-w-sm">
              Morate biti prijavljeni da biste pristupili admin panelu.
            </p>
            <SignInButton />
            <Link
              to="/"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
            >
              Nazad na početnu
            </Link>
          </div>
        </div>
      </Unauthenticated>
      <Authenticated>
        <AdminDashboard />
      </Authenticated>
    </>
  );
}
