import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCrudApi, adminNewsApi, apiBaseUrl, type MediaItem } from "@/lib/api.ts";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Pencil,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Upload,
  ImageIcon,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";

const DEFAULT_CATEGORIES = [
  "Utakmice",
  "Treninzi",
  "Proslava",
  "Istorija",
  "Stadion",
  "Navijači",
  "Omladinska škola",
  "Ostalo",
];

type MediaType = "image" | "video";

type FormState = {
  type: MediaType;
  title: string;
  description: string;
  category: string;
  fileName: string | null;
  imagePreviewUrl: string | null;
  youtubeUrl: string;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  type: "image",
  title: "",
  description: "",
  category: "Ostalo",
  fileName: null,
  imagePreviewUrl: null,
  youtubeUrl: "",
  published: true,
};

/** Extract YouTube video ID from various URL formats */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function AdminMedia() {
  const qc = useQueryClient();
  const { data: media, isLoading } = useQuery({
    queryKey: ["admin", "media"],
    queryFn: () => adminCrudApi.getMedia(),
  });
  const createMutation = useMutation({
    mutationFn: (data: Partial<MediaItem>) => adminCrudApi.createMedia(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "media"] }); setIsOpen(false); toast.success("Stavka dodata"); },
    onError: () => toast.error("Greška pri čuvanju"),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MediaItem> }) => adminCrudApi.updateMedia(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "media"] }); setIsOpen(false); toast.success("Stavka ažurirana"); },
    onError: () => toast.error("Greška pri čuvanju"),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminCrudApi.deleteMedia(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "media"] }); toast.success("Stavka obrisana"); },
    onError: () => toast.error("Greška pri brisanju"),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | MediaType>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saving = createMutation.isPending || updateMutation.isPending;

  const openCreate = (type: MediaType) => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, type });
    setIsOpen(true);
  };

  const openEdit = (item: MediaItem) => {
    setEditingId(item.id);
    setForm({
      type: item.type,
      title: item.title,
      description: item.description ?? "",
      category: item.category,
      fileName: item.fileName ?? null,
      imagePreviewUrl: item.fileName ? `${apiBaseUrl}/uploads/${item.fileName}` : null,
      youtubeUrl: item.youtubeUrl ?? "",
      published: item.published,
    });
    setIsOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Izaberite sliku (JPG, PNG, WebP...)");
      return;
    }

    setUploading(true);
    try {
      const result = await adminNewsApi.uploadImage(file);
      const previewUrl = URL.createObjectURL(file);
      setForm((prev) => ({
        ...prev,
        fileName: result.fileName,
        imagePreviewUrl: previewUrl,
      }));
      toast.success("Slika otpremljena");
    } catch {
      toast.error("Greška pri otpremanju slike");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Unesite naziv");
      return;
    }
    if (form.type === "image" && !form.fileName) {
      toast.error("Otpremite sliku");
      return;
    }
    if (form.type === "video") {
      if (!form.youtubeUrl.trim()) {
        toast.error("Unesite YouTube link");
        return;
      }
      const videoId = extractYouTubeId(form.youtubeUrl.trim());
      if (!videoId) {
        toast.error("Nevažeći YouTube link");
        return;
      }
    }

    const youtubeVideoId =
      form.type === "video"
        ? extractYouTubeId(form.youtubeUrl.trim()) ?? undefined
        : undefined;

    const payload: Partial<MediaItem> = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      fileName: form.type === "image" ? (form.fileName ?? undefined) : undefined,
      youtubeUrl: form.type === "video" ? form.youtubeUrl.trim() || undefined : undefined,
      youtubeVideoId,
      published: form.published,
      sortOrder: 0,
    };

    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const allMedia = media ?? [];
  const filtered = filterType === "all" ? allMedia : allMedia.filter((m) => m.type === filterType);
  const imageCount = allMedia.filter((m) => m.type === "image").length;
  const videoCount = allMedia.filter((m) => m.type === "video").length;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => setFilterType("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              filterType === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            Sve ({allMedia.length})
          </button>
          <button
            onClick={() => setFilterType("image")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              filterType === "image"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            Slike ({imageCount})
          </button>
          <button
            onClick={() => setFilterType("video")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              filterType === "video"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            Video ({videoCount})
          </button>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openCreate("image")} className="gap-2" size="sm">
            <ImageIcon size={14} />
            Dodaj sliku
          </Button>
          <Button onClick={() => openCreate("video")} className="gap-2" size="sm">
            <Video size={14} />
            Dodaj video
          </Button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ImageIcon size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nema multimedije</p>
          <p className="text-sm mt-1">
            Dodajte slike ili video klipove koristeći dugmad iznad.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const imageUrl = item.fileName ? `${apiBaseUrl}/uploads/${item.fileName}` : null;
            return (
              <div
                key={item.id}
                className="group relative rounded-xl overflow-hidden border bg-card aspect-square"
              >
                {/* Thumbnail */}
                {item.type === "image" && imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : item.type === "video" && item.youtubeVideoId ? (
                  <img
                    src={`https://img.youtube.com/vi/${item.youtubeVideoId}/mqdefault.jpg`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    {item.type === "image" ? (
                      <ImageIcon size={32} className="text-muted-foreground" />
                    ) : (
                      <Video size={32} className="text-muted-foreground" />
                    )}
                  </div>
                )}

                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                      item.type === "image"
                        ? "bg-blue-500/80 text-white"
                        : "bg-red-500/80 text-white"
                    )}
                  >
                    {item.type === "image" ? "Slika" : "Video"}
                  </span>
                </div>

                {/* Published badge */}
                {!item.published && (
                  <div className="absolute top-2 right-2">
                    <EyeOff size={14} className="text-white drop-shadow-lg" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-white text-xs font-semibold truncate">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-white/70 text-[10px] truncate mt-0.5">
                      {item.description}
                    </p>
                  )}
                  <p className="text-white/50 text-[10px] mt-0.5">{item.category}</p>

                  <div className="flex gap-1 mt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 px-2 text-xs"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil size={12} className="mr-1" />
                      Izmeni
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-xs"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null
                ? `Izmeni ${form.type === "image" ? "sliku" : "video"}`
                : `Dodaj ${form.type === "image" ? "sliku" : "video"}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-2">
              <Label>Naziv *</Label>
              <Input
                placeholder={
                  form.type === "image"
                    ? "npr. Utakmica protiv Crvene zvezde 2024"
                    : "npr. Golovi sezone 2023/24"
                }
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Opis / komentar</Label>
              <Textarea
                placeholder="Opis slike ili videa koji će se prikazati u galeriji..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Category */}
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
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image upload */}
            {form.type === "image" && (
              <div className="space-y-2">
                <Label>Slika *</Label>
                {form.imagePreviewUrl || form.fileName ? (
                  <div className="relative rounded-xl overflow-hidden border">
                    {form.imagePreviewUrl && (
                      <img
                        src={form.imagePreviewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <Upload size={14} />
                      </button>
                      <button
                        onClick={() =>
                          setForm({
                            ...form,
                            fileName: null,
                            imagePreviewUrl: null,
                          })
                        }
                        className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload
                      size={24}
                      className="mx-auto mb-2 text-muted-foreground"
                    />
                    <p className="text-sm text-muted-foreground">
                      {uploading
                        ? "Otpremanje..."
                        : "Kliknite za otpremanje slike"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, WebP
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </div>
            )}

            {/* YouTube URL */}
            {form.type === "video" && (
              <div className="space-y-2">
                <Label>YouTube link *</Label>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.youtubeUrl}
                  onChange={(e) =>
                    setForm({ ...form, youtubeUrl: e.target.value })
                  }
                />
                {form.youtubeUrl && extractYouTubeId(form.youtubeUrl) && (
                  <div className="rounded-xl overflow-hidden border mt-2">
                    <img
                      src={`https://img.youtube.com/vi/${extractYouTubeId(form.youtubeUrl)}/mqdefault.jpg`}
                      alt="YouTube thumbnail"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Published */}
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
              {saving
                ? "Čuvanje..."
                : editingId !== null
                  ? "Sačuvaj"
                  : "Dodaj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
