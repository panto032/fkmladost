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
import { Pencil, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import RichTextEditor from "./RichTextEditor.tsx";

type PageItem = Doc<"pages">;

type FormState = {
  slug: string;
  title: string;
  content: string;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  slug: "",
  title: "",
  content: "",
  published: true,
};

export default function AdminPages() {
  const pages = useQuery(api.admin.pages.getAll);
  const createPage = useMutation(api.admin.pages.create);
  const updatePage = useMutation(api.admin.pages.update);
  const removePage = useMutation(api.admin.pages.remove);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<PageItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsOpen(true);
  };

  const openEdit = (item: PageItem) => {
    setEditing(item);
    setForm({
      slug: item.slug,
      title: item.title,
      content: item.content,
      published: item.published,
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast.error("Naslov i slug su obavezni");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updatePage({ id: editing._id, ...form });
        toast.success("Stranica je uspešno ažurirana");
      } else {
        await createPage(form);
        toast.success("Stranica je uspešno kreirana");
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

  const handleDelete = async (id: PageItem["_id"]) => {
    try {
      await removePage({ id });
      toast.success("Stranica je obrisana");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri brisanju");
      }
    }
  };

  if (pages === undefined) {
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
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Stranice ({pages.length})</h3>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} /> Dodaj stranicu
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naslov</TableHead>
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead className="w-24 text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {item.title}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  /{item.slug}
                </TableCell>
                <TableCell>
                  {item.published ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                      <Eye size={14} /> Objavljeno
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
                      <EyeOff size={14} /> Nacrt
                    </span>
                  )}
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Uredi stranicu" : "Nova stranica"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Naslov</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Naziv stranice"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL putanja)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                        .replace(/-+/g, "-"),
                    })
                  }
                  placeholder="npr. omladinska-skola"
                  disabled={editing !== null}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sadržaj</Label>
              <RichTextEditor
                content={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder="Pišite sadržaj stranice ovde..."
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.published}
                onCheckedChange={(checked) =>
                  setForm({ ...form, published: checked })
                }
              />
              <Label>Objavljeno</Label>
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
