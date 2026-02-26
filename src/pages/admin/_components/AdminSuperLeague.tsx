import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
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
/*  Sub-tab selector                                                   */
/* ------------------------------------------------------------------ */

type SubTab = "standings" | "matches";

export default function AdminSuperLeague() {
  const [subTab, setSubTab] = useState<SubTab>("standings");
  const scrapeStandings = useAction(api.sync.scrapeSuperLeague.scrapeSuperLeagueStandings);
  const scrapeMatches = useAction(api.sync.scrapeSuperLeague.scrapeSuperLeagueMatches);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const [standingsResult, matchesResult] = await Promise.all([
        scrapeStandings(),
        scrapeMatches(),
      ]);
      toast.success(
        `Uspešno sa superliga.rs: ${standingsResult.count} klubova, ${matchesResult.count} utakmica`,
      );
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri sinhronizaciji sa superliga.rs");
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
