import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import { Newspaper, Trophy, Handshake, TableProperties, ArrowLeft, LogOut, Users, FileText, GraduationCap, Shield, Baby } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";
import AdminNews from "./_components/AdminNews.tsx";
import AdminMatches from "./_components/AdminMatches.tsx";
import AdminPartners from "./_components/AdminPartners.tsx";
import AdminStandings from "./_components/AdminStandings.tsx";
import AdminPlayers from "./_components/AdminPlayers.tsx";
import AdminPages from "./_components/AdminPages.tsx";
import AdminYouthLeague from "./_components/AdminYouthLeague.tsx";
import AdminCadetLeague from "./_components/AdminCadetLeague.tsx";
import AdminPioneerLeague from "./_components/AdminPioneerLeague.tsx";

function AdminDashboard() {
  const { user, removeUser } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="bg-[oklch(0.22_0.06_250)] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-[oklch(0.7_0.05_250)] hover:text-white transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline text-sm">Početna</span>
              </Link>
              <div className="h-6 w-px bg-[oklch(0.35_0.06_250)]" />
              <h1 className="text-lg font-bold uppercase tracking-wider">
                Admin Panel
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[oklch(0.7_0.05_250)] hidden sm:inline">
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

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-foreground uppercase tracking-tight">
            Upravljanje <span className="text-[oklch(0.55_0.18_250)]">Sadržajem</span>
          </h2>
          <p className="text-muted-foreground mt-1">
            Dodajte, uredite ili obrišite sadržaj sajta
          </p>
        </div>

        <Tabs defaultValue="news">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="news" className="gap-1.5">
              <Newspaper size={14} />
              <span className="hidden sm:inline">Vesti</span>
            </TabsTrigger>
            <TabsTrigger value="players" className="gap-1.5">
              <Users size={14} />
              <span className="hidden sm:inline">Igrači</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="gap-1.5">
              <Trophy size={14} />
              <span className="hidden sm:inline">Mečevi</span>
            </TabsTrigger>
            <TabsTrigger value="partners" className="gap-1.5">
              <Handshake size={14} />
              <span className="hidden sm:inline">Partneri</span>
            </TabsTrigger>
            <TabsTrigger value="standings" className="gap-1.5">
              <TableProperties size={14} />
              <span className="hidden sm:inline">Tabela</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-1.5">
              <FileText size={14} />
              <span className="hidden sm:inline">Stranice</span>
            </TabsTrigger>
            <TabsTrigger value="youth" className="gap-1.5">
              <GraduationCap size={14} />
              <span className="hidden sm:inline">Oml. Liga</span>
            </TabsTrigger>
            <TabsTrigger value="cadet" className="gap-1.5">
              <Shield size={14} />
              <span className="hidden sm:inline">Kad. Liga</span>
            </TabsTrigger>
            <TabsTrigger value="pioneer" className="gap-1.5">
              <Baby size={14} />
              <span className="hidden sm:inline">Pion. Liga</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news">
            <AdminNews />
          </TabsContent>
          <TabsContent value="players">
            <AdminPlayers />
          </TabsContent>
          <TabsContent value="matches">
            <AdminMatches />
          </TabsContent>
          <TabsContent value="partners">
            <AdminPartners />
          </TabsContent>
          <TabsContent value="standings">
            <AdminStandings />
          </TabsContent>
          <TabsContent value="pages">
            <AdminPages />
          </TabsContent>
          <TabsContent value="youth">
            <AdminYouthLeague />
          </TabsContent>
          <TabsContent value="cadet">
            <AdminCadetLeague />
          </TabsContent>
          <TabsContent value="pioneer">
            <AdminPioneerLeague />
          </TabsContent>
        </Tabs>
      </main>
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
            <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors mt-4">
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
