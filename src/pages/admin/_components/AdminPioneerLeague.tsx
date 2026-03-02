import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pioneerLeagueApi, adminCrudApi, type LeagueStanding, type LeagueMatch } from "@/lib/api.ts";
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
import { Pencil, Trash2, Plus, Trophy, Calendar } from "lucide-react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Sub-tab selector                                                   */
/* ------------------------------------------------------------------ */

type SubTab = "standings" | "matches";

export default function AdminPioneerLeague() {
  const [subTab, setSubTab] = useState<SubTab>("standings");

  return (
    <div>
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

const EMPTY_STANDING = {
  position: 1, club: "", played: 0, won: 0, drawn: 0, lost: 0,
  goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0, isHighlighted: false,
};

function StandingsAdmin() {
  const qc = useQueryClient();

  const { data: standings, isLoading } = useQuery({
    queryKey: ["pioneerStandings"],
    queryFn: () => pioneerLeagueApi.getStandings(),
  });

  const create = useMutation({
    mutationFn: (data: typeof EMPTY_STANDING) => adminCrudApi.createPioneerStanding(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pioneerStandings"] });
      toast.success("Dodat");
      setIsOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Greška pri čuvanju"),
  });

  const update = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & typeof EMPTY_STANDING) =>
      adminCrudApi.updatePioneerStanding(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pioneerStandings"] });
      toast.success("Ažurirano");
      setIsOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Greška pri čuvanju"),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminCrudApi.deletePioneerStanding(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pioneerStandings"] });
      toast.success("Obrisano");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Greška"),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<LeagueStanding | null>(null);
  const [form, setForm] = useState(EMPTY_STANDING);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_STANDING, position: (standings?.length ?? 0) + 1 });
    setIsOpen(true);
  };

  const openEdit = (item: LeagueStanding) => {
    setEditing(item);
    setForm({
      position: item.position, club: item.club, played: item.played,
      won: item.won, drawn: item.drawn, lost: item.lost,
      goalsFor: item.goalsFor, goalsAgainst: item.goalsAgainst,
      goalDiff: item.goalDiff, points: item.points, isHighlighted: item.isHighlighted,
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.club) { toast.error("Ime kluba je obavezno"); return; }
    if (editing) {
      update.mutate({ id: editing.id, ...form });
    } else {
      create.mutate(form);
    }
  };

  const saving = create.isPending || update.isPending;

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;
  }

  const list = standings ?? [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Tabela Pionirske Lige ({list.length} klubova)</h3>
        <Button onClick={openCreate} size="sm"><Plus size={16} /> Dodaj</Button>
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
            {list.map((item) => (
              <TableRow key={item.id} className={item.isHighlighted ? "bg-accent/10" : ""}>
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
                    <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove.mutate(item.id)}><Trash2 size={14} /></Button>
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
              <div className="space-y-2"><Label>Klub</Label><Input value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} placeholder="Mladost" /></div>
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

const EMPTY_MATCH = {
  round: 1, date: "", home: "", away: "",
  score: "" as string | undefined, city: "" as string | undefined, isHome: false,
};

function MatchesAdmin() {
  const qc = useQueryClient();

  const { data: matches, isLoading } = useQuery({
    queryKey: ["pioneerMatches"],
    queryFn: () => pioneerLeagueApi.getMatches(),
  });

  const createMatch = useMutation({
    mutationFn: (data: typeof EMPTY_MATCH) => adminCrudApi.createPioneerMatch(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pioneerMatches"] });
      toast.success("Dodato");
      setIsOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Greška pri čuvanju"),
  });

  const updateMatch = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & typeof EMPTY_MATCH) =>
      adminCrudApi.updatePioneerMatch(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pioneerMatches"] });
      toast.success("Ažurirano");
      setIsOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Greška pri čuvanju"),
  });

  const removeMatch = useMutation({
    mutationFn: (id: number) => adminCrudApi.deletePioneerMatch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pioneerMatches"] });
      toast.success("Obrisano");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Greška"),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<LeagueMatch | null>(null);
  const [form, setForm] = useState(EMPTY_MATCH);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_MATCH }); setIsOpen(true); };
  const openEdit = (item: LeagueMatch) => {
    setEditing(item);
    setForm({
      round: item.round, date: item.date, home: item.home, away: item.away,
      score: item.score ?? "", city: item.city ?? "", isHome: item.isHome,
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.home || !form.away) { toast.error("Timovi su obavezni"); return; }
    const payload = {
      round: form.round, date: form.date, home: form.home, away: form.away,
      score: form.score || undefined, city: form.city || undefined, isHome: form.isHome,
    };
    if (editing) {
      updateMatch.mutate({ id: editing.id, ...payload });
    } else {
      createMatch.mutate(payload);
    }
  };

  const saving = createMatch.isPending || updateMatch.isPending;

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;
  }

  const list = matches ?? [];

  // Group by round
  const rounds = Array.from(new Set(list.map((m) => m.round))).sort((a, b) => a - b);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Sve utakmice ({list.length})</h3>
        <Button onClick={openCreate} size="sm"><Plus size={16} /> Dodaj</Button>
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
            {rounds.flatMap((round) =>
              list.filter((m) => m.round === round).map((item) => {
                const isMladost = item.home.includes("Mladost") || item.away.includes("Mladost");
                return (
                  <TableRow key={item.id} className={isMladost ? "bg-accent/10" : ""}>
                    <TableCell className="font-bold text-muted-foreground">{item.round}</TableCell>
                    <TableCell className="text-sm">{item.date || "—"}</TableCell>
                    <TableCell className={`font-medium ${item.home.includes("Mladost") ? "text-accent font-bold" : ""}`}>{item.home}</TableCell>
                    <TableCell className={`font-medium ${item.away.includes("Mladost") ? "text-accent font-bold" : ""}`}>{item.away}</TableCell>
                    <TableCell className="font-bold">{item.score || "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{item.city || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)}><Pencil size={14} /></Button>
                        <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => removeMatch.mutate(item.id)}><Trash2 size={14} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
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
              <div className="space-y-2"><Label>Domaćin</Label><Input value={form.home} onChange={(e) => setForm({ ...form, home: e.target.value })} /></div>
              <div className="space-y-2"><Label>Gost</Label><Input value={form.away} onChange={(e) => setForm({ ...form, away: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Rezultat</Label><Input value={form.score ?? ""} onChange={(e) => setForm({ ...form, score: e.target.value })} placeholder="2:1" /></div>
              <div className="space-y-2"><Label>Grad</Label><Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
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
