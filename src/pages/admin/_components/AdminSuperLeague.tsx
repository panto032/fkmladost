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
import { Pencil, Trash2, Plus, Trophy, Calendar, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

/* ------------------------------------------------------------------ */
/*  Static seed data (parsed from superliga.rs)                       */
/*  Used for the "Sinhronizuj" button — populates DB in one click      */
/* ------------------------------------------------------------------ */

const SEED_STANDINGS = [
  { position: 1, club: "Crvena zvezda", played: 24, won: 18, drawn: 3, lost: 3, goalsFor: 72, goalsAgainst: 19, goalDiff: 53, points: 57, isHighlighted: false },
  { position: 2, club: "Partizan", played: 24, won: 17, drawn: 2, lost: 5, goalsFor: 55, goalsAgainst: 30, goalDiff: 25, points: 53, isHighlighted: false },
  { position: 3, club: "Vojvodina", played: 24, won: 15, drawn: 4, lost: 5, goalsFor: 44, goalsAgainst: 24, goalDiff: 20, points: 49, isHighlighted: false },
  { position: 4, club: "Novi Pazar", played: 24, won: 11, drawn: 6, lost: 7, goalsFor: 31, goalsAgainst: 31, goalDiff: 0, points: 39, isHighlighted: false },
  { position: 5, club: "Železničar", played: 24, won: 11, drawn: 5, lost: 8, goalsFor: 29, goalsAgainst: 26, goalDiff: 3, points: 38, isHighlighted: false },
  { position: 6, club: "Radnik", played: 24, won: 9, drawn: 5, lost: 10, goalsFor: 30, goalsAgainst: 29, goalDiff: 1, points: 32, isHighlighted: false },
  { position: 7, club: "Radnički 1923", played: 24, won: 8, drawn: 8, lost: 8, goalsFor: 31, goalsAgainst: 33, goalDiff: -2, points: 32, isHighlighted: false },
  { position: 8, club: "Čukarički", played: 24, won: 8, drawn: 7, lost: 9, goalsFor: 35, goalsAgainst: 38, goalDiff: -3, points: 31, isHighlighted: false },
  { position: 9, club: "OFK Beograd", played: 24, won: 8, drawn: 6, lost: 10, goalsFor: 30, goalsAgainst: 32, goalDiff: -2, points: 30, isHighlighted: false },
  { position: 10, club: "Radnički Niš", played: 24, won: 8, drawn: 5, lost: 11, goalsFor: 30, goalsAgainst: 31, goalDiff: -1, points: 29, isHighlighted: false },
  { position: 11, club: "TSC", played: 24, won: 7, drawn: 8, lost: 9, goalsFor: 22, goalsAgainst: 27, goalDiff: -5, points: 29, isHighlighted: false },
  { position: 12, club: "IMT", played: 24, won: 8, drawn: 4, lost: 12, goalsFor: 27, goalsAgainst: 43, goalDiff: -16, points: 28, isHighlighted: false },
  { position: 13, club: "Mladost", played: 24, won: 6, drawn: 9, lost: 9, goalsFor: 18, goalsAgainst: 34, goalDiff: -16, points: 27, isHighlighted: true },
  { position: 14, club: "Javor Matis", played: 24, won: 6, drawn: 8, lost: 10, goalsFor: 24, goalsAgainst: 34, goalDiff: -10, points: 26, isHighlighted: false },
  { position: 15, club: "Spartak ŽK", played: 24, won: 3, drawn: 8, lost: 13, goalsFor: 27, goalsAgainst: 45, goalDiff: -18, points: 17, isHighlighted: false },
  { position: 16, club: "Napredak", played: 24, won: 2, drawn: 6, lost: 16, goalsFor: 21, goalsAgainst: 50, goalDiff: -29, points: 12, isHighlighted: false },
];

const SEED_MATCHES: Array<{
  round: number;
  date: string;
  home: string;
  away: string;
  score?: string;
  city?: string;
  isHome: boolean;
}> = [
  { round: 1, date: "20.07.2025", home: "Mladost", away: "IMT", score: "1:1", city: "Lučani", isHome: true },
  { round: 2, date: "26.07.2025", home: "Radnički Niš", away: "Mladost", score: "3:1", city: "Niš", isHome: false },
  { round: 3, date: "02.08.2025", home: "Mladost", away: "Radnik", score: "1:0", city: "Lučani", isHome: true },
  { round: 4, date: "09.08.2025", home: "Spartak ŽK", away: "Mladost", score: "1:1", city: "Subotica", isHome: false },
  { round: 5, date: "15.08.2025", home: "Mladost", away: "Crvena zvezda", score: "1:4", city: "Lučani", isHome: true },
  { round: 6, date: "23.08.2025", home: "OFK Beograd", away: "Mladost", score: "1:1", city: "Stara Pazova", isHome: false },
  { round: 7, date: "30.08.2025", home: "Mladost", away: "Vojvodina", score: "0:0", city: "Lučani", isHome: true },
  { round: 8, date: "13.09.2025", home: "Mladost", away: "Napredak", score: "1:1", city: "Lučani", isHome: true },
  { round: 9, date: "20.09.2025", home: "Partizan", away: "Mladost", score: "3:0", city: "Beograd", isHome: false },
  { round: 10, date: "24.09.2025", home: "Novi Pazar", away: "Mladost", score: "0:0", city: "Novi Pazar", isHome: false },
  { round: 11, date: "27.09.2025", home: "Mladost", away: "TSC", score: "1:0", city: "Lučani", isHome: true },
  { round: 12, date: "04.10.2025", home: "Železničar", away: "Mladost", score: "2:0", city: "Pančevo", isHome: false },
  { round: 13, date: "18.10.2025", home: "Mladost", away: "Radnički 1923", score: "0:0", city: "Lučani", isHome: true },
  { round: 14, date: "25.10.2025", home: "Čukarički", away: "Mladost", score: "2:1", city: "Pančevo", isHome: false },
  { round: 15, date: "01.11.2025", home: "Mladost", away: "Javor Matis", score: "0:2", city: "Lučani", isHome: true },
  { round: 16, date: "08.11.2025", home: "IMT", away: "Mladost", score: "3:1", city: "Loznica", isHome: false },
  { round: 17, date: "22.11.2025", home: "Mladost", away: "Radnički Niš", score: "0:0", city: "Lučani", isHome: true },
  { round: 18, date: "29.11.2025", home: "Radnik", away: "Mladost", score: "2:0", city: "Surdulica", isHome: false },
  { round: 19, date: "06.12.2025", home: "Mladost", away: "Spartak ŽK", score: "0:0", city: "Lučani", isHome: true },
  { round: 20, date: "14.12.2025", home: "Mladost", away: "Spartak ŽK", score: "0:0", city: "Lučani", isHome: true },
  { round: 21, date: "20.12.2025", home: "Crvena zvezda", away: "Mladost", score: "4:0", city: "Beograd", isHome: false },
  { round: 22, date: "15.02.2026", home: "Mladost", away: "OFK Beograd", city: "Lučani", isHome: true },
  { round: 23, date: "22.02.2026", home: "Vojvodina", away: "Mladost", city: "Novi Sad", isHome: false },
  { round: 24, date: "01.03.2026", home: "Napredak", away: "Mladost", city: "Kruševac", isHome: false },
];

/* ------------------------------------------------------------------ */
/*  Sub-tab selector                                                   */
/* ------------------------------------------------------------------ */

type SubTab = "standings" | "matches";

export default function AdminSuperLeague() {
  const [subTab, setSubTab] = useState<SubTab>("standings");
  const seedMutation = useMutation(api.admin.superLeague.seedSuperLeague);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await seedMutation({
        standings: SEED_STANDINGS,
        matches: SEED_MATCHES,
      });
      toast.success(
        `Uspešno učitano: ${result.standings} klubova, ${result.matches} utakmica`,
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
          Povuci podatke sa <span className="font-semibold">superliga.rs</span> — tabela i utakmice Mladosti u Super ligi.
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
    </div>
  );
}

/* ================================================================== */
/*  Standings Admin                                                    */
/* ================================================================== */

type StandingDoc = Doc<"superLeagueStandings">;

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
  const standings = useQuery(api.admin.superLeague.getStandings);
  const create = useMutation(api.admin.superLeague.createStanding);
  const update = useMutation(api.admin.superLeague.updateStanding);
  const remove = useMutation(api.admin.superLeague.removeStanding);

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
        <h3 className="text-lg font-bold">Tabela Super Lige ({standings.length} klubova)</h3>
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
              <div className="space-y-2"><Label>Klub</Label><Input value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} placeholder="FK Mladost" /></div>
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

type MatchDoc = Doc<"superLeagueMatches">;

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
  const matches = useQuery(api.admin.superLeague.getMatches);
  const createMatch = useMutation(api.admin.superLeague.createMatch);
  const updateMatch = useMutation(api.admin.superLeague.updateMatch);
  const removeMatch = useMutation(api.admin.superLeague.removeMatch);

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
            {matches.map((item) => {
              const isMladost = item.home.includes("Mladost") || item.away.includes("Mladost");
              return (
                <TableRow key={item._id} className={isMladost ? "bg-accent/10" : ""}>
                  <TableCell className="font-bold text-muted-foreground">{item.round}</TableCell>
                  <TableCell className="text-sm">{item.date}</TableCell>
                  <TableCell className={`font-medium ${item.home.includes("Mladost") ? "text-accent font-bold" : ""}`}>{item.home}</TableCell>
                  <TableCell className={`font-medium ${item.away.includes("Mladost") ? "text-accent font-bold" : ""}`}>{item.away}</TableCell>
                  <TableCell className="font-bold">{item.score || "—"}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{item.city || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)}><Pencil size={14} /></Button>
                      <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item._id)}><Trash2 size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
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
              <div className="space-y-2"><Label>Domaćin</Label><Input value={form.home} onChange={(e) => setForm({ ...form, home: e.target.value })} placeholder="Mladost" /></div>
              <div className="space-y-2"><Label>Gost</Label><Input value={form.away} onChange={(e) => setForm({ ...form, away: e.target.value })} placeholder="Partizan" /></div>
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
