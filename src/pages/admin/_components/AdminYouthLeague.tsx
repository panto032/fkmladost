import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Pencil, Trash2, Plus, Trophy, Calendar, Target, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

/* ------------------------------------------------------------------ */
/*  Static seed data (parsed from fss.rs / srpskistadioni.in.rs)       */
/*  Used for the "Sinhronizuj" button — populates DB in one click      */
/* ------------------------------------------------------------------ */

const SEED_STANDINGS = [
  { position: 1, club: "Crvena Zvezda", played: 18, won: 14, drawn: 4, lost: 0, goalsFor: 61, goalsAgainst: 15, goalDiff: 46, points: 46, isHighlighted: false },
  { position: 2, club: "IMT Novi Beograd", played: 18, won: 10, drawn: 5, lost: 3, goalsFor: 34, goalsAgainst: 22, goalDiff: 12, points: 35, isHighlighted: false },
  { position: 3, club: "TSC", played: 18, won: 10, drawn: 3, lost: 5, goalsFor: 35, goalsAgainst: 29, goalDiff: 6, points: 33, isHighlighted: false },
  { position: 4, club: "Spartak ZV", played: 18, won: 11, drawn: 0, lost: 7, goalsFor: 34, goalsAgainst: 28, goalDiff: 6, points: 33, isHighlighted: false },
  { position: 5, club: "Vojvodina", played: 18, won: 9, drawn: 3, lost: 6, goalsFor: 34, goalsAgainst: 25, goalDiff: 9, points: 30, isHighlighted: false },
  { position: 6, club: "Čukarički", played: 18, won: 8, drawn: 5, lost: 5, goalsFor: 37, goalsAgainst: 29, goalDiff: 8, points: 29, isHighlighted: false },
  { position: 7, club: "Mladost Lučani", played: 18, won: 7, drawn: 7, lost: 4, goalsFor: 40, goalsAgainst: 21, goalDiff: 19, points: 28, isHighlighted: true },
  { position: 8, club: "Partizan", played: 18, won: 7, drawn: 7, lost: 4, goalsFor: 33, goalsAgainst: 35, goalDiff: -2, points: 28, isHighlighted: false },
  { position: 9, club: "Voždovac", played: 18, won: 7, drawn: 4, lost: 7, goalsFor: 27, goalsAgainst: 29, goalDiff: -2, points: 25, isHighlighted: false },
  { position: 10, club: "Ušće Novi Beograd", played: 18, won: 7, drawn: 4, lost: 7, goalsFor: 34, goalsAgainst: 42, goalDiff: -8, points: 25, isHighlighted: false },
  { position: 11, club: "Novi Pazar", played: 18, won: 7, drawn: 3, lost: 8, goalsFor: 34, goalsAgainst: 40, goalDiff: -6, points: 24, isHighlighted: false },
  { position: 12, club: "OFK Beograd", played: 18, won: 6, drawn: 5, lost: 7, goalsFor: 37, goalsAgainst: 35, goalDiff: 2, points: 23, isHighlighted: false },
  { position: 13, club: "OFK Vršac", played: 18, won: 4, drawn: 5, lost: 9, goalsFor: 17, goalsAgainst: 29, goalDiff: -12, points: 17, isHighlighted: false },
  { position: 14, club: "Grafičar Bg", played: 18, won: 3, drawn: 3, lost: 12, goalsFor: 21, goalsAgainst: 38, goalDiff: -17, points: 12, isHighlighted: false },
  { position: 15, club: "Napredak Kruševac", played: 18, won: 2, drawn: 2, lost: 14, goalsFor: 23, goalsAgainst: 51, goalDiff: -28, points: 8, isHighlighted: false },
  { position: 16, club: "Borac 1926 Čačak", played: 18, won: 0, drawn: 4, lost: 14, goalsFor: 16, goalsAgainst: 49, goalDiff: -33, points: 4, isHighlighted: false },
];

const SEED_MATCHES = [
  { round: 1, date: "09.08.2025", home: "Mladost L", away: "OFK Beograd", score: "2:1", isHome: true },
  { round: 2, date: "16.08.2025", home: "TSC", away: "Mladost L", score: "3:2", isHome: false },
  { round: 3, date: "23.08.2025", home: "Mladost L", away: "Grafičar", score: "3:0", isHome: true },
  { round: 4, date: "27.08.2025", home: "OFK Vršac", away: "Mladost L", score: "0:0", isHome: false },
  { round: 5, date: "31.08.2025", home: "Mladost L", away: "Spartak", score: "6:1", isHome: true },
  { round: 6, date: "13.09.2025", home: "IMT", away: "Mladost L", score: "1:1", isHome: false },
  { round: 7, date: "20.09.2025", home: "Mladost L", away: "Novi Pazar", score: "4:0", isHome: true },
  { round: 8, date: "27.09.2025", home: "Partizan", away: "Mladost L", score: "1:0", isHome: false },
  { round: 9, date: "04.10.2025", home: "Mladost L", away: "Borac 1926", score: "8:1", isHome: true },
  { round: 10, date: "18.10.2025", home: "Mladost L", away: "Crvena Zvezda", score: "1:1", isHome: true },
  { round: 11, date: "22.10.2025", home: "Napredak", away: "Mladost L", score: "2:5", isHome: false },
  { round: 12, date: "26.10.2025", home: "Mladost L", away: "Vojvodina", score: "0:0", isHome: true },
  { round: 13, date: "02.11.2025", home: "Čukarički", away: "Mladost L", score: "2:2", isHome: false },
  { round: 14, date: "05.11.2025", home: "Mladost L", away: "Ušće", score: "1:0", isHome: true },
  { round: 15, date: "22.11.2025", home: "Voždovac", away: "Mladost L", score: "1:0", isHome: false },
  { round: 16, date: "29.11.2025", home: "OFK Beograd", away: "Mladost L", score: "2:2", isHome: false },
  { round: 17, date: "06.12.2025", home: "Mladost L", away: "TSC", score: "3:3", isHome: true },
  { round: 18, date: "21.02.2026", home: "Grafičar", away: "Mladost L", score: "2:0", isHome: false },
  { round: 19, date: "01.03.2026", home: "Mladost L", away: "OFK Vršac", city: "Lučani", isHome: true },
  { round: 20, date: "07.03.2026", home: "Spartak", away: "Mladost L", city: "Subotica", isHome: false },
  { round: 21, date: "14.03.2026", home: "Mladost L", away: "IMT", city: "Lučani", isHome: true },
  { round: 22, date: "21.03.2026", home: "Novi Pazar", away: "Mladost L", city: "Novi Pazar", isHome: false },
  { round: 23, date: "04.04.2026", home: "Mladost L", away: "Partizan", city: "Lučani", isHome: true },
  { round: 24, date: "09.04.2026", home: "Borac 1926", away: "Mladost L", city: "Čačak", isHome: false },
  { round: 25, date: "18.04.2026", home: "Crvena Zvezda", away: "Mladost L", city: "Beograd", isHome: false },
  { round: 26, date: "25.04.2026", home: "Mladost L", away: "Napredak", city: "Lučani", isHome: true },
  { round: 27, date: "02.05.2026", home: "Vojvodina", away: "Mladost L", city: "Novi Sad", isHome: false },
  { round: 28, date: "09.05.2026", home: "Mladost L", away: "Čukarički", city: "Lučani", isHome: true },
  { round: 29, date: "16.05.2026", home: "Ušće", away: "Mladost L", city: "Novi Beograd", isHome: false },
  { round: 30, date: "23.05.2026", home: "Mladost L", away: "Voždovac", city: "Lučani", isHome: true },
];

const SEED_SCORERS = [
  { rank: 1, name: "Ahmed Oriyjomi Lebi", club: "IMT", goals: "16 (4)", isHighlighted: false },
  { rank: 2, name: "Adam Musa", club: "Mladost L", goals: "15", isHighlighted: true },
  { rank: 3, name: "Srđan Borovina", club: "Vojvodina", goals: "13 (2)", isHighlighted: false },
  { rank: 4, name: "Mateo Maravić", club: "Čukarički", goals: "13 (3)", isHighlighted: false },
  { rank: 5, name: "Dušan Radović", club: "Partizan", goals: "11", isHighlighted: false },
  { rank: 6, name: "Martins Idowu", club: "Ušće", goals: "11 (3)", isHighlighted: false },
  { rank: 7, name: "Matej Gaštarov", club: "C. Zvezda", goals: "9 (2)", isHighlighted: false },
  { rank: 8, name: "Jovan Popović", club: "Novi Pazar", goals: "9 (4)", isHighlighted: false },
  { rank: 9, name: "James Daniel Wisdom", club: "Spartak", goals: "8", isHighlighted: false },
  { rank: 10, name: "Lazar Peranović", club: "Vojvodina", goals: "8", isHighlighted: false },
  { rank: 11, name: "Uroš Đorđević", club: "C. Zvezda", goals: "8", isHighlighted: false },
  { rank: 12, name: "Đorđe Krivokapić", club: "Grafičar", goals: "8", isHighlighted: false },
  { rank: 13, name: "Jovan Mrvaljević", club: "OFK Beograd", goals: "8 (1)", isHighlighted: false },
  { rank: 14, name: "Davorin Tošić", club: "C. Zvezda", goals: "8 (3)", isHighlighted: false },
];

/* ------------------------------------------------------------------ */
/*  Sub-tab selector                                                   */
/* ------------------------------------------------------------------ */

type SubTab = "standings" | "matches" | "scorers";

export default function AdminYouthLeague() {
  const [subTab, setSubTab] = useState<SubTab>("standings");
  const seedMutation = useMutation(api.admin.youthLeague.seedYouthLeague);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await seedMutation({
        standings: SEED_STANDINGS,
        matches: SEED_MATCHES,
        scorers: SEED_SCORERS,
      });
      toast.success(
        `Uspešno učitano: ${result.standings} klubova, ${result.matches} utakmica, ${result.scorers} strelaca`,
      );
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri sinhronizaciji");
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      {/* Sync banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
        <p className="text-sm text-muted-foreground">
          Povuci podatke iz <span className="font-semibold">fss.rs</span> — tabela, utakmice i strelci (posle 18. kola).
        </p>
        <Button
          size="sm"
          onClick={handleSync}
          disabled={syncing}
          className="gap-1.5 flex-shrink-0"
        >
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Učitavanje..." : "Sinhronizuj"}
        </Button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { id: "standings" as const, label: "Tabela", icon: Trophy },
          { id: "matches" as const, label: "Utakmice", icon: Calendar },
          { id: "scorers" as const, label: "Strelci", icon: Target },
        ]).map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              size="sm"
              variant={subTab === tab.id ? "default" : "ghost"}
              onClick={() => setSubTab(tab.id)}
              className="gap-1.5"
            >
              <Icon size={14} />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {subTab === "standings" && <StandingsAdmin />}
      {subTab === "matches" && <MatchesAdmin />}
      {subTab === "scorers" && <ScorersAdmin />}
    </div>
  );
}

/* ================================================================== */
/*  Standings Admin                                                    */
/* ================================================================== */

type StandingDoc = Doc<"youthStandings">;

const EMPTY_STANDING = {
  position: 1,
  club: "",
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDiff: 0,
  points: 0,
  isHighlighted: false,
};

function StandingsAdmin() {
  const standings = useQuery(api.admin.youthLeague.getStandings);
  const create = useMutation(api.admin.youthLeague.createStanding);
  const update = useMutation(api.admin.youthLeague.updateStanding);
  const remove = useMutation(api.admin.youthLeague.removeStanding);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<StandingDoc | null>(null);
  const [form, setForm] = useState(EMPTY_STANDING);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_STANDING, position: (standings?.length ?? 0) + 1 });
    setIsOpen(true);
  };

  const openEdit = (item: StandingDoc) => {
    setEditing(item);
    setForm({
      position: item.position,
      club: item.club,
      played: item.played,
      won: item.won,
      drawn: item.drawn,
      lost: item.lost,
      goalsFor: item.goalsFor,
      goalsAgainst: item.goalsAgainst,
      goalDiff: item.goalDiff,
      points: item.points,
      isHighlighted: item.isHighlighted,
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.club) { toast.error("Ime kluba je obavezno"); return; }
    setSaving(true);
    try {
      if (editing) {
        await update({ id: editing._id, ...form });
        toast.success("Tabela ažurirana");
      } else {
        await create(form);
        toast.success("Klub dodat");
      }
      setIsOpen(false);
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri čuvanju");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: StandingDoc["_id"]) => {
    try {
      await remove({ id });
      toast.success("Klub obrisan");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri brisanju");
      }
    }
  };

  if (standings === undefined) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Tabela Omladinske Lige ({standings.length} klubova)</h3>
        <Button onClick={openCreate} size="sm"><Plus size={16} /> Dodaj klub</Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Klub</TableHead>
              <TableHead className="hidden sm:table-cell">U</TableHead>
              <TableHead className="hidden sm:table-cell">P</TableHead>
              <TableHead className="hidden md:table-cell">N</TableHead>
              <TableHead className="hidden md:table-cell">I</TableHead>
              <TableHead className="hidden lg:table-cell">G+</TableHead>
              <TableHead className="hidden lg:table-cell">G-</TableHead>
              <TableHead>Bod</TableHead>
              <TableHead className="w-24 text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((item) => (
              <TableRow key={item._id} className={item.isHighlighted ? "bg-accent/10" : ""}>
                <TableCell className="font-bold text-muted-foreground">{item.position}.</TableCell>
                <TableCell className={`font-medium ${item.isHighlighted ? "text-accent font-bold" : ""}`}>{item.club}</TableCell>
                <TableCell className="hidden sm:table-cell">{item.played}</TableCell>
                <TableCell className="hidden sm:table-cell">{item.won}</TableCell>
                <TableCell className="hidden md:table-cell">{item.drawn}</TableCell>
                <TableCell className="hidden md:table-cell">{item.lost}</TableCell>
                <TableCell className="hidden lg:table-cell">{item.goalsFor}</TableCell>
                <TableCell className="hidden lg:table-cell">{item.goalsAgainst}</TableCell>
                <TableCell className="font-bold">{item.points}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)}><Pencil size={14} /></Button>
                    <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item._id)}><Trash2 size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Uredi klub" : "Dodaj klub"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Pozicija</Label><Input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} min={1} /></div>
              <div className="space-y-2"><Label>Klub</Label><Input value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} placeholder="FK Mladost Lučani" /></div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-2"><Label>Odigrano</Label><Input type="number" value={form.played} onChange={(e) => setForm({ ...form, played: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Pobede</Label><Input type="number" value={form.won} onChange={(e) => setForm({ ...form, won: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Nerešeno</Label><Input type="number" value={form.drawn} onChange={(e) => setForm({ ...form, drawn: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Porazi</Label><Input type="number" value={form.lost} onChange={(e) => setForm({ ...form, lost: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-2"><Label>Golovi +</Label><Input type="number" value={form.goalsFor} onChange={(e) => setForm({ ...form, goalsFor: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Golovi -</Label><Input type="number" value={form.goalsAgainst} onChange={(e) => setForm({ ...form, goalsAgainst: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Gol razlika</Label><Input type="number" value={form.goalDiff} onChange={(e) => setForm({ ...form, goalDiff: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Bodovi</Label><Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} /></div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isHighlighted} onCheckedChange={(checked) => setForm({ ...form, isHighlighted: checked })} />
              <Label>Istakni (Mladost)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Otkaži</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Čuvanje..." : editing ? "Sačuvaj" : "Kreiraj"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ================================================================== */
/*  Matches Admin                                                      */
/* ================================================================== */

type MatchDoc = Doc<"youthMatches">;

const EMPTY_MATCH = {
  round: 1,
  date: "",
  home: "",
  away: "",
  score: "" as string | undefined,
  city: "" as string | undefined,
  isHome: true,
};

function MatchesAdmin() {
  const matches = useQuery(api.admin.youthLeague.getMatches);
  const createMatch = useMutation(api.admin.youthLeague.createMatch);
  const updateMatch = useMutation(api.admin.youthLeague.updateMatch);
  const removeMatch = useMutation(api.admin.youthLeague.removeMatch);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<MatchDoc | null>(null);
  const [form, setForm] = useState(EMPTY_MATCH);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_MATCH, round: (matches?.length ?? 0) + 1 });
    setIsOpen(true);
  };

  const openEdit = (item: MatchDoc) => {
    setEditing(item);
    setForm({
      round: item.round,
      date: item.date,
      home: item.home,
      away: item.away,
      score: item.score ?? "",
      city: item.city ?? "",
      isHome: item.isHome,
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.home || !form.away) { toast.error("Timovi su obavezni"); return; }
    setSaving(true);
    try {
      const payload = {
        round: form.round,
        date: form.date,
        home: form.home,
        away: form.away,
        score: form.score || undefined,
        city: form.city || undefined,
        isHome: form.isHome,
      };
      if (editing) {
        await updateMatch({ id: editing._id, ...payload });
        toast.success("Utakmica ažurirana");
      } else {
        await createMatch(payload);
        toast.success("Utakmica dodata");
      }
      setIsOpen(false);
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri čuvanju");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: MatchDoc["_id"]) => {
    try {
      await removeMatch({ id });
      toast.success("Utakmica obrisana");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri brisanju");
      }
    }
  };

  if (matches === undefined) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Utakmice Mladosti ({matches.length})</h3>
        <Button onClick={openCreate} size="sm"><Plus size={16} /> Dodaj utakmicu</Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Kolo</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Domaćin</TableHead>
              <TableHead>Gost</TableHead>
              <TableHead>Rezultat</TableHead>
              <TableHead className="hidden sm:table-cell">Grad</TableHead>
              <TableHead className="w-24 text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-bold text-muted-foreground">{item.round}</TableCell>
                <TableCell className="text-sm">{item.date}</TableCell>
                <TableCell className={`font-medium ${item.isHome ? "text-accent font-bold" : ""}`}>{item.home}</TableCell>
                <TableCell className={`font-medium ${!item.isHome ? "text-accent font-bold" : ""}`}>{item.away}</TableCell>
                <TableCell className="font-bold">{item.score || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{item.city || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)}><Pencil size={14} /></Button>
                    <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item._id)}><Trash2 size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Uredi utakmicu" : "Dodaj utakmicu"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Kolo</Label><Input type="number" value={form.round} onChange={(e) => setForm({ ...form, round: Number(e.target.value) })} min={1} /></div>
              <div className="space-y-2"><Label>Datum</Label><Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="01.03.2026" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Domaćin</Label><Input value={form.home} onChange={(e) => setForm({ ...form, home: e.target.value })} placeholder="Mladost L" /></div>
              <div className="space-y-2"><Label>Gost</Label><Input value={form.away} onChange={(e) => setForm({ ...form, away: e.target.value })} placeholder="OFK Vršac" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Rezultat (prazno = najava)</Label><Input value={form.score ?? ""} onChange={(e) => setForm({ ...form, score: e.target.value })} placeholder="2:1" /></div>
              <div className="space-y-2"><Label>Grad</Label><Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Lučani" /></div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isHome} onCheckedChange={(checked) => setForm({ ...form, isHome: checked })} />
              <Label>Mladost je domaćin</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Otkaži</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Čuvanje..." : editing ? "Sačuvaj" : "Kreiraj"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ================================================================== */
/*  Scorers Admin                                                      */
/* ================================================================== */

type ScorerDoc = Doc<"youthScorers">;

const EMPTY_SCORER = {
  rank: 1,
  name: "",
  club: "",
  goals: "",
  isHighlighted: false,
};

function ScorersAdmin() {
  const scorers = useQuery(api.admin.youthLeague.getScorers);
  const createScorer = useMutation(api.admin.youthLeague.createScorer);
  const updateScorer = useMutation(api.admin.youthLeague.updateScorer);
  const removeScorer = useMutation(api.admin.youthLeague.removeScorer);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<ScorerDoc | null>(null);
  const [form, setForm] = useState(EMPTY_SCORER);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_SCORER, rank: (scorers?.length ?? 0) + 1 });
    setIsOpen(true);
  };

  const openEdit = (item: ScorerDoc) => {
    setEditing(item);
    setForm({
      rank: item.rank,
      name: item.name,
      club: item.club,
      goals: item.goals,
      isHighlighted: item.isHighlighted,
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error("Ime igrača je obavezno"); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateScorer({ id: editing._id, ...form });
        toast.success("Strelac ažuriran");
      } else {
        await createScorer(form);
        toast.success("Strelac dodat");
      }
      setIsOpen(false);
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri čuvanju");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: ScorerDoc["_id"]) => {
    try {
      await removeScorer({ id });
      toast.success("Strelac obrisan");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri brisanju");
      }
    }
  };

  if (scorers === undefined) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Lista strelaca ({scorers.length})</h3>
        <Button onClick={openCreate} size="sm"><Plus size={16} /> Dodaj strelca</Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Ime</TableHead>
              <TableHead>Klub</TableHead>
              <TableHead>Golovi</TableHead>
              <TableHead className="w-24 text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scorers.map((item) => (
              <TableRow key={item._id} className={item.isHighlighted ? "bg-accent/10" : ""}>
                <TableCell className="font-bold text-muted-foreground">{item.rank}.</TableCell>
                <TableCell className={`font-medium ${item.isHighlighted ? "text-accent font-bold" : ""}`}>{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.club}</TableCell>
                <TableCell className="font-bold">{item.goals}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)}><Pencil size={14} /></Button>
                    <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item._id)}><Trash2 size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Uredi strelca" : "Dodaj strelca"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Rang</Label><Input type="number" value={form.rank} onChange={(e) => setForm({ ...form, rank: Number(e.target.value) })} min={1} /></div>
              <div className="space-y-2"><Label>Ime</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Adam Musa" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Klub</Label><Input value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} placeholder="Mladost L" /></div>
              <div className="space-y-2"><Label>Golovi</Label><Input value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} placeholder="15 (2)" /></div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isHighlighted} onCheckedChange={(checked) => setForm({ ...form, isHighlighted: checked })} />
              <Label>Istakni (igrač Mladosti)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Otkaži</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Čuvanje..." : editing ? "Sačuvaj" : "Kreiraj"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
