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
import { Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

type StandingItem = Doc<"standings">;

const EMPTY_FORM = {
  position: 1,
  team: "",
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalDifference: "0",
  points: 0,
  isHighlighted: false,
};

export default function AdminStandings() {
  const standings = useQuery(api.admin.standings.getAll);
  const createStanding = useMutation(api.admin.standings.create);
  const updateStanding = useMutation(api.admin.standings.update);
  const removeStanding = useMutation(api.admin.standings.remove);
  const scrapeStandings = useAction(api.sync.scrapeFromWeb.scrapeStandings);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<StandingItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, position: (standings?.length ?? 0) + 1 });
    setIsOpen(true);
  };

  const openEdit = (item: StandingItem) => {
    setEditing(item);
    setForm({
      position: item.position,
      team: item.team,
      played: item.played,
      wins: item.wins,
      draws: item.draws,
      losses: item.losses,
      goalDifference: item.goalDifference,
      points: item.points,
      isHighlighted: item.isHighlighted,
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.team) {
      toast.error("Ime tima je obavezno");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateStanding({ id: editing._id, ...form });
        toast.success("Tabela je uspešno ažurirana");
      } else {
        await createStanding(form);
        toast.success("Tim je dodat u tabelu");
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

  const handleDelete = async (id: StandingItem["_id"]) => {
    try {
      await removeStanding({ id });
      toast.success("Tim je obrisan iz tabele");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri brisanju");
      }
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await scrapeStandings();
      toast.success(
        `Sinhronizacija uspešna! Učitano ${result.standings} timova sa superliga.rs`,
      );
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(`Greška pri sinhronizaciji: ${message}`);
      } else {
        toast.error("Greška pri sinhronizaciji sa superliga.rs");
      }
    } finally {
      setSyncing(false);
    }
  };

  if (standings === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* ── Sync banner ── */}
      <div className="bg-[oklch(0.22_0.06_250)] text-white rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-sm">SuperLiga.rs Sinhronizacija</h4>
          <p className="text-[oklch(0.65_0.04_250)] text-xs mt-0.5">
            Povuci najnovije podatke za tabelu direktno sa zvaničnog sajta superliga.rs
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleSync}
          disabled={syncing}
          className="bg-[oklch(0.55_0.18_250)] hover:bg-[oklch(0.50_0.18_250)] text-white shrink-0"
        >
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Sinhronizujem..." : "Sinhronizuj sada"}
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">
          Tabela Superlige ({standings.length} timova)
        </h3>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} /> Dodaj tim
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Tim</TableHead>
              <TableHead className="hidden sm:table-cell">Odig</TableHead>
              <TableHead className="hidden sm:table-cell">P</TableHead>
              <TableHead className="hidden md:table-cell">N</TableHead>
              <TableHead className="hidden md:table-cell">I</TableHead>
              <TableHead>Bod</TableHead>
              <TableHead className="w-24 text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((item) => (
              <TableRow
                key={item._id}
                className={
                  item.isHighlighted ? "bg-accent/10" : ""
                }
              >
                <TableCell className="font-bold text-muted-foreground">
                  {item.position}.
                </TableCell>
                <TableCell
                  className={`font-medium ${item.isHighlighted ? "text-accent font-bold" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {item.logoUrl && (
                      <img
                        src={item.logoUrl}
                        alt={item.team}
                        className="w-5 h-5 object-contain"
                      />
                    )}
                    {item.team}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {item.played}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {item.wins}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {item.draws}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {item.losses}
                </TableCell>
                <TableCell className="font-bold">{item.points}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item._id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Uredi tim" : "Dodaj tim"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pozicija</Label>
                <Input
                  type="number"
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: Number(e.target.value) })
                  }
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Tim</Label>
                <Input
                  value={form.team}
                  onChange={(e) => setForm({ ...form, team: e.target.value })}
                  placeholder="FK Mladost"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label>Odigrano</Label>
                <Input
                  type="number"
                  value={form.played}
                  onChange={(e) =>
                    setForm({ ...form, played: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Pobede</Label>
                <Input
                  type="number"
                  value={form.wins}
                  onChange={(e) =>
                    setForm({ ...form, wins: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Nerešeno</Label>
                <Input
                  type="number"
                  value={form.draws}
                  onChange={(e) =>
                    setForm({ ...form, draws: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Porazi</Label>
                <Input
                  type="number"
                  value={form.losses}
                  onChange={(e) =>
                    setForm({ ...form, losses: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gol razlika</Label>
                <Input
                  value={form.goalDifference}
                  onChange={(e) =>
                    setForm({ ...form, goalDifference: e.target.value })
                  }
                  placeholder="+5"
                />
              </div>
              <div className="space-y-2">
                <Label>Bodovi</Label>
                <Input
                  type="number"
                  value={form.points}
                  onChange={(e) =>
                    setForm({ ...form, points: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isHighlighted}
                onCheckedChange={(checked) =>
                  setForm({ ...form, isHighlighted: checked })
                }
              />
              <Label>Istakni (FK Mladost)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Otkaži
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Čuvanje..." : editing ? "Sačuvaj" : "Kreiraj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
