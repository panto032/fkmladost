import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCrudApi, adminScrapeApi, type Player } from "@/lib/api.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Pencil, Trash2, Plus, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const POSITIONS = ["Golman", "Odbrana", "Vezni red", "Napad"];

const EMPTY_FORM = {
  name: "",
  number: 1,
  position: "Odbrana",
  imageUrl: "",
  nationality: undefined as string | undefined,
  birthDate: undefined as string | undefined,
  sortOrder: 1,
  isActive: true,
};

export default function AdminPlayers() {
  const qc = useQueryClient();

  const { data: players, isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: () => adminCrudApi.getPlayers(),
  });

  const createPlayer = useMutation({
    mutationFn: (data: typeof EMPTY_FORM) => adminCrudApi.createPlayer(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["players"] });
      toast.success("Igrač je uspešno dodat");
      setIsOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Greška"),
  });

  const updatePlayer = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & typeof EMPTY_FORM) =>
      adminCrudApi.updatePlayer(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["players"] });
      toast.success("Igrač je uspešno ažuriran");
      setIsOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Greška"),
  });

  const removePlayer = useMutation({
    mutationFn: (id: number) => adminCrudApi.deletePlayer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["players"] });
      toast.success("Igrač je obrisan");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Greška"),
  });

  const removeAllPlayers = useMutation({
    mutationFn: () => adminCrudApi.deleteAllPlayers(),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["players"] });
      toast.success(`Obrisano ${result.deleted} igrača`);
      setShowDeleteAll(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Greška"),
  });

  const scrapePlayers = useMutation({
    mutationFn: () => adminScrapeApi.scrapePlayers(),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["players"] });
      toast.success(
        `Sinhronizacija završena: ${result.players} igrača učitano sa superliga.rs`,
      );
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Greška pri sinhronizaciji igrača"),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showDeleteAll, setShowDeleteAll] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sortOrder: (players?.length ?? 0) + 1 });
    setIsOpen(true);
  };

  const openEdit = (item: Player) => {
    setEditing(item);
    setForm({
      name: item.name,
      number: item.number,
      position: item.position,
      imageUrl: item.imageUrl,
      nationality: item.nationality,
      birthDate: item.birthDate,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.imageUrl) {
      toast.error("Ime i slika su obavezni");
      return;
    }
    if (editing) {
      updatePlayer.mutate({ id: editing.id, ...form });
    } else {
      createPlayer.mutate(form);
    }
  };

  const saving = createPlayer.isPending || updatePlayer.isPending;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  const playerList = players ?? [];

  return (
    <div>
      {/* Sync banner */}
      <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 mb-6 dark:border-blue-900 dark:bg-blue-950/40">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          Sinhronizuj igrače sa <span className="font-semibold">superliga.rs</span> — ažurira broj dresa, poziciju i sliku.
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => scrapePlayers.mutate()}
          disabled={scrapePlayers.isPending}
        >
          <RefreshCw size={14} className={scrapePlayers.isPending ? "animate-spin" : ""} />
          {scrapePlayers.isPending ? "Učitavanje..." : "Sinhronizuj"}
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Igrači ({playerList.length})</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteAll(true)}
            disabled={playerList.length === 0}
          >
            <Trash2 size={14} /> Obriši sve
          </Button>
          <Button onClick={openCreate} size="sm">
            <Plus size={16} /> Dodaj igrača
          </Button>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead className="w-16">Br.</TableHead>
              <TableHead>Ime i prezime</TableHead>
              <TableHead>Pozicija</TableHead>
              <TableHead className="w-20">Aktivan</TableHead>
              <TableHead className="w-24 text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playerList.map((item) => (
              <TableRow key={item.id} className={!item.isActive ? "opacity-50" : ""}>
                <TableCell className="text-muted-foreground">{item.sortOrder}</TableCell>
                <TableCell className="font-bold text-[oklch(0.55_0.18_250)]">{item.number}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{item.position}</TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {item.isActive ? "Da" : "Ne"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)}>
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removePlayer.mutate(item.id)}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Uredi igrača" : "Novi igrač"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ime i prezime</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Saša Stamenković"
                />
              </div>
              <div className="space-y-2">
                <Label>Broj dresa</Label>
                <Input
                  type="number"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: Number(e.target.value) })}
                  min={1}
                  max={99}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pozicija</Label>
              <Select value={form.position} onValueChange={(val) => setForm({ ...form, position: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberi poziciju" />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Slika (URL)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-20 h-20 rounded-lg object-cover mt-2"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nacionalnost (opciono)</Label>
                <Input
                  value={form.nationality ?? ""}
                  onChange={(e) => setForm({ ...form, nationality: e.target.value || undefined })}
                  placeholder="Srbija"
                />
              </div>
              <div className="space-y-2">
                <Label>Datum rođenja (opciono)</Label>
                <Input
                  value={form.birthDate ?? ""}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value || undefined })}
                  placeholder="15.03.1998."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Redosled prikaza</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  min={1}
                />
              </div>
              <div className="flex items-center gap-3 pt-7">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
                <Label>Aktivan igrač</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Otkaži</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Čuvanje..." : editing ? "Sačuvaj" : "Dodaj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete all confirmation dialog */}
      <Dialog open={showDeleteAll} onOpenChange={setShowDeleteAll}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={20} /> Obriši sve igrače?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Ovo će obrisati <span className="font-bold">{playerList.length}</span> igrača iz baze.
            Posle toga možeš kliknuti "Sinhronizuj" da učitaš aktuelni roster sa superliga.rs.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteAll(false)}>Otkaži</Button>
            <Button variant="destructive" onClick={() => removeAllPlayers.mutate()} disabled={removeAllPlayers.isPending}>
              {removeAllPlayers.isPending ? "Brisanje..." : "Da, obriši sve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
