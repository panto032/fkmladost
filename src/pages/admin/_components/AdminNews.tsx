import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
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
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Pencil, Trash2, Plus, Eye, EyeOff, Upload, X, ImageIcon, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { format, parse } from "date-fns";
import { sr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import RichTextEditor from "./RichTextEditor.tsx";

type NewsItem = Doc<"news">;

type FormState = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  imageUrl: string;
  imageStorageId: Id<"_storage"> | undefined;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  excerpt: "",
  content: "",
  category: "Klub",
  date: "",
  imageUrl: "",
  imageStorageId: undefined,
  published: true,
};

/** Try to parse the Serbian-formatted date string back to a Date object */
function parseFormDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  try {
    return parse(dateStr, "d. MMM yyyy.", new Date(), { locale: sr });
  } catch {
    return undefined;
  }
}

export default function AdminNews() {
  const news = useQuery(api.admin.news.getAll);
  const createNews = useMutation(api.admin.news.create);
  const updateNews = useMutation(api.admin.news.update);
  const removeNews = useMutation(api.admin.news.remove);
  const generateUploadUrl = useMutation(api.news.generateUploadUrl);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImagePreview(null);
    setIsOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      category: item.category,
      date: item.date,
      imageUrl: item.imageUrl,
      imageStorageId: item.imageStorageId,
      published: item.published,
    });
    setImagePreview(item.imageUrl || null);
    setIsOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = (await result.json()) as { storageId: Id<"_storage"> };
      setForm((prev) => ({ ...prev, imageStorageId: storageId, imageUrl: "" }));
      setImagePreview(URL.createObjectURL(file));
      toast.success("Slika uspešno uploadovana");
    } catch {
      toast.error("Greška pri uploadu slike");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, imageStorageId: undefined, imageUrl: "" }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.date) {
      toast.error("Naslov i datum su obavezni");
      return;
    }
    if (!form.imageStorageId && !form.imageUrl) {
      toast.error("Morate dodati sliku (upload ili URL)");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateNews({ id: editing._id, ...form });
        toast.success("Vest je uspešno ažurirana");
      } else {
        await createNews(form);
        toast.success("Vest je uspešno kreirana");
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

  const handleDelete = async (id: NewsItem["_id"]) => {
    try {
      await removeNews({ id });
      toast.success("Vest je obrisana");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri brisanju");
      }
    }
  };

  if (news === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Vesti ({news.length})</h3>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} /> Dodaj vest
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naslov</TableHead>
              <TableHead className="hidden md:table-cell">Kategorija</TableHead>
              <TableHead className="hidden sm:table-cell">Datum</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead className="w-24 text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {item.title}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {item.category}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {item.date}
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
              {editing ? "Uredi vest" : "Nova vest"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label>Naslov</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Naslov vesti"
              />
            </div>

            {/* Category & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategorija</Label>
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  placeholder="npr. Klub, Transfer, Navijači"
                />
              </div>
              <div className="space-y-2">
                <Label>Datum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="secondary"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon size={16} className="mr-2 text-muted-foreground" />
                      {form.date || "Izaberite datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parseFormDate(form.date)}
                      onSelect={(date) => {
                        if (date) {
                          setForm({
                            ...form,
                            date: format(date, "d. MMM yyyy.", { locale: sr }),
                          });
                        }
                      }}
                      locale={sr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <Label>Slika</Label>
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-input">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                  />
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    className="border-2 border-dashed border-input rounded-lg p-6 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                        <span className="text-sm text-muted-foreground">Uploadovanje...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={24} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Kliknite da uploadujete sliku
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          JPG, PNG, WebP
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Fallback: URL input */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">ili unesite URL</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="flex gap-2">
                    <ImageIcon size={16} className="text-muted-foreground mt-2.5 flex-shrink-0" />
                    <Input
                      value={form.imageUrl}
                      onChange={(e) => {
                        setForm({ ...form, imageUrl: e.target.value, imageStorageId: undefined });
                        if (e.target.value) {
                          setImagePreview(e.target.value);
                        }
                      }}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label>Kratak opis</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) =>
                  setForm({ ...form, excerpt: e.target.value })
                }
                placeholder="Kratak opis za karticu vesti"
                rows={2}
              />
            </div>

            {/* Rich text content */}
            <div className="space-y-2">
              <Label>Sadržaj</Label>
              <RichTextEditor
                content={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder="Pišite tekst vesti ovde..."
              />
            </div>

            {/* Published toggle */}
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
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving ? "Čuvanje..." : editing ? "Sačuvaj" : "Kreiraj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
