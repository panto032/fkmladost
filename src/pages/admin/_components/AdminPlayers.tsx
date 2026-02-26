import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
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
import { Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

type PlayerItem = Doc<"players">;

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
  const players = useQuery(api.admin.players.getAll);
  const createPlayer = useMutation(api.admin.players.create);
  const updatePlayer = useMutation(api.admin.players.update);
  const removePlayer = useMutation(api.admin.players.remove);
  const scrapePlayers = useAction(api.sync.scrapeFromWeb.scrapePlayers);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<PlayerItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await scrapePlayers();
      toast.success(
        `Sinhronizacija završena: ${result.players} igrača učitano sa superliga.rs`,
      );
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri sinhronizaciji igrača");
      }
    } finally {
      setSyncing(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sortOrder: (players?.length ?? 0) + 1 });
    setIsOpen(true);
  };

  const openEdit = (item: PlayerItem) => {
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

  const handleSave = async () => {
    if (!form.name || !form.imageUrl) {
      toast.error("Ime i slika su obavezni");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updatePlayer({ id: editing._id, ...form });
        toast.success("Igrač je uspešno ažuriran");
      } else {
        await createPlayer(form);
        toast.success("Igrač je uspešno dodat");
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

  const handleDelete = async (id: PlayerItem["_id"]) => {
    try {
      await removePlayer({ id });
      toast.success("Igrač je obrisan");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri brisanju");
      }
    }
  };

  if (players === undefined) {
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
      {/* Sync banner */}
      <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 mb-6 dark:border-blue-900 dark:bg-blue-950/40">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          Sinhronizuj igrače sa <span className="font-semibold">superliga.rs</span> — ažurira broj dresa, poziciju i sliku.
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Učitavanje..." : "Sinhronizuj"}
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Igrači ({players.length})</h3>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} /> Dodaj igrača
        </Button>
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
            {players.map((item) => (
              <TableRow key={item._id} className={!item.isActive ? "opacity-50" : ""}>
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
    </div>
  );
}
