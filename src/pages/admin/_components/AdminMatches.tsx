import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCrudApi, adminScrapeApi, type Match } from "@/lib/api.ts";
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
  const qc = useQueryClient();

  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: () => adminCrudApi.getMatches(),
  });

  const createMatch = useMutation({
    mutationFn: (data: typeof EMPTY_FORM) => adminCrudApi.createMatch(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Meč je uspešno kreiran");
      setIsOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Greška"),
  });

  const updateMatch = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & typeof EMPTY_FORM) =>
      adminCrudApi.updateMatch(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Meč je uspešno ažuriran");
      setIsOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Greška"),
  });

  const removeMatch = useMutation({
    mutationFn: (id: number) => adminCrudApi.deleteMatch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Meč je obrisan");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Greška"),
  });

  const scrapeMatchesMutation = useMutation({
    mutationFn: () => adminScrapeApi.scrapeMatches(),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      toast.success(
        `Sinhronizacija uspešna! Učitano ${result.matches} meč(eva) sa superliga.rs`,
      );
    },
    onError: (err) =>
      toast.error(
        `Greška pri sinhronizaciji: ${err instanceof Error ? err.message : "Greška pri sinhronizaciji sa superliga.rs"}`,
      ),
  });

  const scrapeRoundMutation = useMutation({
    mutationFn: () => adminScrapeApi.scrapeRoundPreview(),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      toast.success(
        `Najava kola sinhronizovana! Kolo ${result.roundNumber}, učitano ${result.matches} utakmica.`,
      );
    },
    onError: (err) =>
      toast.error(`Greška: ${err instanceof Error ? err.message : "Greška pri sinhronizaciji najave kola"}`),
  });

  const scrapeAnalyticsMutation = useMutation({
    mutationFn: () => adminScrapeApi.scrapeMatchAnalytics(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      toast.success(
        "Analitika rivala sinhronizovana! H2H, statistika i forma su učitani.",
      );
    },
    onError: (err) =>
      toast.error(`Greška: ${err instanceof Error ? err.message : "Greška pri sinhronizaciji analitike"}`),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsOpen(true);
  };

  const openEdit = (item: Match) => {
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

  const handleSave = () => {
    if (!form.home || !form.away || !form.date) {
      toast.error("Domaćin, gost i datum su obavezni");
      return;
    }
    if (editing) {
      updateMatch.mutate({ id: editing.id, ...form });
    } else {
      createMatch.mutate(form);
    }
  };

  const saving = createMatch.isPending || updateMatch.isPending;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  const matchList = matches ?? [];

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
          onClick={() => scrapeMatchesMutation.mutate()}
          disabled={scrapeMatchesMutation.isPending}
          className="bg-[oklch(0.55_0.18_250)] hover:bg-[oklch(0.50_0.18_250)] text-white shrink-0"
        >
          <RefreshCw size={14} className={scrapeMatchesMutation.isPending ? "animate-spin" : ""} />
          {scrapeMatchesMutation.isPending ? "Sinhronizujem..." : "Sinhronizuj sada"}
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
          onClick={() => scrapeRoundMutation.mutate()}
          disabled={scrapeRoundMutation.isPending}
          className="bg-[oklch(0.69_0.095_228)] hover:bg-[oklch(0.63_0.095_228)] text-white shrink-0"
        >
          <RefreshCw size={14} className={scrapeRoundMutation.isPending ? "animate-spin" : ""} />
          {scrapeRoundMutation.isPending ? "Sinhronizujem..." : "Sinhronizuj najavu kola"}
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
          onClick={() => scrapeAnalyticsMutation.mutate()}
          disabled={scrapeAnalyticsMutation.isPending}
          className="bg-[oklch(0.77_0.10_225)] hover:bg-[oklch(0.70_0.10_225)] text-[oklch(0.16_0.04_252)] shrink-0"
        >
          <RefreshCw size={14} className={scrapeAnalyticsMutation.isPending ? "animate-spin" : ""} />
          {scrapeAnalyticsMutation.isPending ? "Sinhronizujem..." : "Sinhronizuj analitiku"}
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Mečevi ({matchList.length})</h3>
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
            {matchList.map((item) => (
              <TableRow key={item.id}>
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
                      onClick={() => removeMatch.mutate(item.id)}
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
