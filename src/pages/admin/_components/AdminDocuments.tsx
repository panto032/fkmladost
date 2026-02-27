import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Pencil, Trash2, Plus, Eye, EyeOff, Upload, FileText, FileIcon, Download } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

const CATEGORIES = [
  "Statut",
  "Pravilnik",
  "Izveštaj",
  "Ugovor",
  "Odluka",
  "Saopštenje",
  "Ostalo",
];

type FormState = {
  title: string;
  description: string;
  category: string;
  published: boolean;
  fileStorageId: Id<"_storage"> | null;
  fileName: string;
  fileType: string;
  fileSize: number;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  category: "Ostalo",
  published: true,
  fileStorageId: null,
  fileName: "",
  fileType: "",
  fileSize: 0,
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminDocuments() {
  const documents = useQuery(api.admin.documents.getAll);
  const createDoc = useMutation(api.admin.documents.create);
  const updateDoc = useMutation(api.admin.documents.update);
  const removeDoc = useMutation(api.admin.documents.remove);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"documents"> | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsOpen(true);
  };

  const openEdit = (doc: NonNullable<typeof documents>[number]) => {
    setEditingId(doc._id);
    setForm({
      title: doc.title,
      description: doc.description ?? "",
      category: doc.category,
      published: doc.published,
      fileStorageId: doc.fileStorageId,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
    });
    setIsOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      setForm((prev) => ({
        ...prev,
        fileStorageId: storageId as Id<"_storage">,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }));
      toast.success("Fajl otpremljen");
    } catch {
      toast.error("Greška pri otpremanju fajla");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Unesite naziv dokumenta");
      return;
    }
    if (!form.fileStorageId) {
      toast.error("Otpremite fajl");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateDoc({
          id: editingId,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          category: form.category,
          fileStorageId: form.fileStorageId,
          fileName: form.fileName,
          fileType: form.fileType,
          fileSize: form.fileSize,
          published: form.published,
        });
        toast.success("Dokument ažuriran");
      } else {
        await createDoc({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          category: form.category,
          fileStorageId: form.fileStorageId,
          fileName: form.fileName,
          fileType: form.fileType,
          fileSize: form.fileSize,
          published: form.published,
        });
        toast.success("Dokument dodat");
      }
      setIsOpen(false);
    } catch (err) {
      if (err instanceof ConvexError) {
        const { message } = err.data as { message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri čuvanju dokumenta");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: Id<"documents">) => {
    try {
      await removeDoc({ id });
      toast.success("Dokument obrisan");
    } catch (err) {
      if (err instanceof ConvexError) {
        const { message } = err.data as { message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri brisanju");
      }
    }
  };

  if (documents === undefined) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {documents.length} {documents.length === 1 ? "dokument" : "dokumenata"}
        </p>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} />
          Novi dokument
        </Button>
      </div>

      {/* Table */}
      {documents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nema dokumenata</p>
          <p className="text-sm mt-1">Dodajte prvi dokument klikom na dugme iznad.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Naziv</TableHead>
                <TableHead className="hidden sm:table-cell">Kategorija</TableHead>
                <TableHead className="hidden md:table-cell">Fajl</TableHead>
                <TableHead className="hidden md:table-cell">Veličina</TableHead>
                <TableHead className="w-16">Status</TableHead>
                <TableHead className="w-24 text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc, idx) => (
                <TableRow key={doc._id}>
                  <TableCell className="text-muted-foreground text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm truncate max-w-[200px]">
                        {doc.title}
                      </p>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      {doc.category}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground truncate max-w-[150px] block">
                      {doc.fileName}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {formatFileSize(doc.fileSize)}
                  </TableCell>
                  <TableCell>
                    {doc.published ? (
                      <Eye size={16} className="text-green-500" />
                    ) : (
                      <EyeOff size={16} className="text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {doc.fileUrl && (
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Download size={14} />
                          </Button>
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => openEdit(doc)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => handleDelete(doc._id)}
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
      )}

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Izmeni dokument" : "Novi dokument"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Naziv dokumenta *</Label>
              <Input
                placeholder="npr. Statut FK Mladost Lučani"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea
                placeholder="Kratki opis dokumenta..."
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Kategorija</Label>
              <Select
                value={form.category}
                onValueChange={(val) => setForm({ ...form, category: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fajl *</Label>
              {form.fileName ? (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileIcon size={20} className="text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{form.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(form.fileSize)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Otpremanje..." : "Kliknite za otpremanje fajla"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, XLS, JPG, PNG...
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.published}
                onCheckedChange={(checked) => setForm({ ...form, published: checked })}
              />
              <Label>Objavljeno</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Otkaži
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving ? "Čuvanje..." : editingId ? "Sačuvaj" : "Dodaj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
