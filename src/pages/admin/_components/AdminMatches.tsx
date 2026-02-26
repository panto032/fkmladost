import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
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

type MatchItem = Doc<"matches">;

const EMPTY_FORM = {
  type: "next" as "next" | "last",
  home: "",
  away: "",
  homeLogoUrl: "",
  awayLogoUrl: "",
  homeScore: undefined as number | undefined,
  awayScore: undefined as number | undefined,
  date: "",
  time: "",
  stadium: "",
  competition: "Superliga Srbije",
  status: undefined as string | undefined,
};

export default function AdminMatches() {
  const matches = useQuery(api.admin.matches.getAll);
  const createMatch = useMutation(api.admin.matches.create);
  const updateMatch = useMutation(api.admin.matches.update);
  const removeMatch = useMutation(api.admin.matches.remove);
  const scrapeMatches = useAction(api.sync.scrapeFromWeb.scrapeMatches);
  const scrapeRoundPreview = useAction(api.sync.scrapeFromWeb.scrapeRoundPreview);
  const scrapeAnalytics = useAction(api.sync.scrapeFromWeb.scrapeMatchAnalytics);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<MatchItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncingRound, setSyncingRound] = useState(false);
  const [syncingAnalytics, setSyncingAnalytics] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsOpen(true);
  };

  const openEdit = (item: MatchItem) => {
    setEditing(item);
    setForm({
      type: item.type,
      home: item.home,
      away: item.away,
      homeLogoUrl: item.homeLogoUrl,
      awayLogoUrl: item.awayLogoUrl,
      homeScore: item.homeScore,
      awayScore: item.awayScore,
      date: item.date,
      time: item.time,
      stadium: item.stadium,
      competition: item.competition,
      status: item.status,
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.home || !form.away || !form.date) {
      toast.error("Domaćin, gost i datum su obavezni");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateMatch({ id: editing._id, ...form });
        toast.success("Meč je uspešno ažuriran");
      } else {
        await createMatch(form);
        toast.success("Meč je uspešno kreiran");
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

  const handleDelete = async (id: MatchItem["_id"]) => {
    try {
      await removeMatch({ id });
      toast.success("Meč je obrisan");
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
      const result = await scrapeMatches();
      toast.success(
        `Sinhronizacija uspešna! Učitano ${result.matches} meč(eva) sa superliga.rs`,
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

  const handleSyncRound = async () => {
    setSyncingRound(true);
    try {
      const result = await scrapeRoundPreview();
      toast.success(
        `Najava kola sinhronizovana! Kolo ${result.roundNumber}, učitano ${result.matches} utakmica.`,
      );
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(`Greška: ${message}`);
      } else {
        toast.error("Greška pri sinhronizaciji najave kola");
      }
    } finally {
      setSyncingRound(false);
    }
  };

  const handleSyncAnalytics = async () => {
    setSyncingAnalytics(true);
    try {
      await scrapeAnalytics();
      toast.success(
        "Analitika rivala sinhronizovana! H2H, statistika i forma su učitani.",
      );
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(`Greška: ${message}`);
      } else {
        toast.error("Greška pri sinhronizaciji analitike");
      }
    } finally {
      setSyncingAnalytics(false);
    }
  };

  if (matches === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* ── Sync banner ── */}
      <div className="bg-[oklch(0.22_0.06_250)] text-white rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-sm">SuperLiga.rs Sinhronizacija</h4>
          <p className="text-[oklch(0.65_0.04_250)] text-xs mt-0.5">
            Povuci podatke o prethodnoj i sledećoj utakmici FK Mladost sa superliga.rs (sa logom)
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

      {/* ── Najava kola sync banner ── */}
      <div className="bg-[oklch(0.18_0.04_252)] text-white rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-[oklch(0.30_0.05_252)]">
        <div>
          <h4 className="font-bold text-sm">Najava Kola</h4>
          <p className="text-[oklch(0.65_0.04_250)] text-xs mt-0.5">
            Povuci sve utakmice narednog kola sa superliga.rs (sudije, TV prenos, delegat...)
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleSyncRound}
          disabled={syncingRound}
          className="bg-[oklch(0.69_0.095_228)] hover:bg-[oklch(0.63_0.095_228)] text-white shrink-0"
        >
          <RefreshCw size={14} className={syncingRound ? "animate-spin" : ""} />
          {syncingRound ? "Sinhronizujem..." : "Sinhronizuj najavu kola"}
        </Button>
      </div>

      {/* ── Analitika rivala sync banner ── */}
      <div className="bg-[oklch(0.18_0.04_252)] text-white rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-[oklch(0.30_0.05_252)]">
        <div>
          <h4 className="font-bold text-sm">Analitika Rivala</h4>
          <p className="text-[oklch(0.65_0.04_250)] text-xs mt-0.5">
            Povuci H2H, statistiku sezone i formu timova sa izveštaja utakmice Mladosti na superliga.rs
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleSyncAnalytics}
          disabled={syncingAnalytics}
          className="bg-[oklch(0.77_0.10_225)] hover:bg-[oklch(0.70_0.10_225)] text-[oklch(0.16_0.04_252)] shrink-0"
        >
          <RefreshCw size={14} className={syncingAnalytics ? "animate-spin" : ""} />
          {syncingAnalytics ? "Sinhronizujem..." : "Sinhronizuj analitiku"}
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Mečevi ({matches.length})</h3>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} /> Dodaj meč
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tip</TableHead>
              <TableHead>Domaćin</TableHead>
              <TableHead>Gost</TableHead>
              <TableHead className="hidden sm:table-cell">Rezultat</TableHead>
              <TableHead className="hidden md:table-cell">Datum</TableHead>
              <TableHead className="w-24 text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                      item.type === "next"
                        ? "bg-accent/20 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.type === "next" ? "Najava" : "Odigran"}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{item.home}</TableCell>
                <TableCell className="font-medium">{item.away}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {item.homeScore !== undefined && item.awayScore !== undefined
                    ? `${item.homeScore} : ${item.awayScore}`
                    : "-"}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {item.date}
                </TableCell>
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
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Uredi meč" : "Novi meč"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tip meča</Label>
              <Select
                value={form.type}
                onValueChange={(val) =>
                  setForm({ ...form, type: val as "next" | "last" })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next">Najava (sledeći meč)</SelectItem>
                  <SelectItem value="last">Odigran (poslednji meč)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Domaćin</Label>
                <Input
                  value={form.home}
                  onChange={(e) => setForm({ ...form, home: e.target.value })}
                  placeholder="FK Mladost"
                />
              </div>
              <div className="space-y-2">
                <Label>Gost</Label>
                <Input
                  value={form.away}
                  onChange={(e) => setForm({ ...form, away: e.target.value })}
                  placeholder="Vojvodina"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Logo domaćina (URL)</Label>
                <Input
                  value={form.homeLogoUrl}
                  onChange={(e) =>
                    setForm({ ...form, homeLogoUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Logo gosta (URL)</Label>
                <Input
                  value={form.awayLogoUrl}
                  onChange={(e) =>
                    setForm({ ...form, awayLogoUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
            {form.type === "last" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Golovi domaćina</Label>
                  <Input
                    type="number"
                    value={form.homeScore ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        homeScore: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Golovi gosta</Label>
                  <Input
                    type="number"
                    value={form.awayScore ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        awayScore: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum</Label>
                <Input
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  placeholder="01. mart 2026."
                />
              </div>
              <div className="space-y-2">
                <Label>Vreme</Label>
                <Input
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="17:00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stadion</Label>
                <Input
                  value={form.stadium}
                  onChange={(e) =>
                    setForm({ ...form, stadium: e.target.value })
                  }
                  placeholder="Stadion Mladosti, Lučani"
                />
              </div>
              <div className="space-y-2">
                <Label>Takmičenje</Label>
                <Input
                  value={form.competition}
                  onChange={(e) =>
                    setForm({ ...form, competition: e.target.value })
                  }
                  placeholder="Superliga Srbije"
                />
              </div>
            </div>
            {form.type === "last" && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Input
                  value={form.status ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value || undefined,
                    })
                  }
                  placeholder="Završeno"
                />
              </div>
            )}
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
