import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Pencil, Trash2, Plus, ImageIcon, Info } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

type PartnerItem = Doc<"partners">;

const EMPTY_FORM = {
  name: "",
  level: "",
  logoUrl: undefined as string | undefined,
  sortOrder: 1,
};

export default function AdminPartners() {
  const partners = useQuery(api.admin.partners.getAll);
  const createPartner = useMutation(api.admin.partners.create);
  const updatePartner = useMutation(api.admin.partners.update);
  const removePartner = useMutation(api.admin.partners.remove);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sortOrder: (partners?.length ?? 0) + 1 });
    setIsOpen(true);
  };

  const openEdit = (item: PartnerItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      level: item.level,
      logoUrl: item.logoUrl,
      sortOrder: item.sortOrder,
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.level) {
      toast.error("Ime i nivo su obavezni");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updatePartner({ id: editing._id, ...form });
        toast.success("Partner je uspešno ažuriran");
      } else {
        await createPartner(form);
        toast.success("Partner je uspešno kreiran");
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

  const handleDelete = async (id: PartnerItem["_id"]) => {
    try {
      await removePartner({ id });
      toast.success("Partner je obrisan");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri brisanju");
      }
    }
  };

  if (partners === undefined) {
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Partneri ({partners.length})</h3>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} /> Dodaj partnera
        </Button>
      </div>

      {/* Recommended image size hint */}
      <div className="flex items-start gap-2 bg-muted/50 border border-border rounded-lg px-4 py-3 mb-6 text-sm text-muted-foreground">
        <Info size={16} className="mt-0.5 flex-shrink-0 text-[oklch(0.55_0.18_250)]" />
        <div>
          <strong className="text-foreground">Preporučena dimenzija logoa:</strong>{" "}
          PNG sa providnom pozadinom, širina <strong>300–600px</strong>, visina <strong>120–200px</strong> (horizontalan format).
          Logo se prikazuje na svetloj pozadini u sekciji "Prijatelji Kluba i Sponzori" na početnoj stranici.
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead className="w-20">Logo</TableHead>
              <TableHead>Ime</TableHead>
              <TableHead>Nivo</TableHead>
              <TableHead className="w-24 text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="text-muted-foreground">
                  {item.sortOrder}
                </TableCell>
                <TableCell>
                  {item.logoUrl ? (
                    <img
                      src={item.logoUrl}
                      alt={item.name}
                      className="h-8 max-w-[60px] object-contain"
                    />
                  ) : (
                    <div className="h-8 w-12 bg-muted rounded flex items-center justify-center">
                      <ImageIcon size={14} className="text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.level}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Uredi partnera" : "Novi partner"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ime partnera</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Metalac"
              />
            </div>
            <div className="space-y-2">
              <Label>Nivo</Label>
              <Input
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                placeholder="npr. Generalni Sponzor, Zlatni Partner"
              />
            </div>
            <div className="space-y-2">
              <Label>Logo (URL)</Label>
              <Input
                value={form.logoUrl ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    logoUrl: e.target.value || undefined,
                  })
                }
                placeholder="https://cdn.hercules.app/file_..."
              />
              <p className="text-xs text-muted-foreground">
                Preporučeno: PNG, providna pozadina, 300-600 x 120-200px
              </p>
              {/* Logo preview */}
              {form.logoUrl && (
                <div className="border border-border rounded-lg p-4 bg-card flex items-center justify-center">
                  <img
                    src={form.logoUrl}
                    alt="Pregled logoa"
                    className="max-h-16 max-w-full object-contain"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Redosled prikaza</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
                min={1}
              />
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
