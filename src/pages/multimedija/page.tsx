import { useState, useCallback, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import Header from "@/pages/home/_components/Header.tsx";
import Footer from "@/pages/home/_components/Footer.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  ImageIcon,
  Video,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";

type TabType = "slike" | "video";

/** Shared lightbox item — works for both images and videos */
type LightboxItem = {
  _id: string;
  title: string;
  description?: string;
  category: string;
  type: "image" | "video";
  imageUrl?: string | null;
  youtubeVideoId?: string;
};

export default function MultimedijaPage() {
  const images = useQuery(api.media.getPublishedImages);
  const videos = useQuery(api.media.getPublishedVideos);
  const categories = useQuery(api.media.getCategories);

  const [activeTab, setActiveTab] = useState<TabType>("slike");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter by category
  const filteredImages =
    images && selectedCategory !== "all"
      ? images.filter((img) => img.category === selectedCategory)
      : images;

  const filteredVideos =
    videos && selectedCategory !== "all"
      ? videos.filter((vid) => vid.category === selectedCategory)
      : videos;

  // Categories for current tab
  const tabCategories = categories
    ? activeTab === "slike"
      ? categories.filter((c) => images?.some((i) => i.category === c))
      : categories.filter((c) => videos?.some((v) => v.category === c))
    : [];

  // Build lightbox items based on active tab
  const lightboxItems: LightboxItem[] =
    activeTab === "slike"
      ? (filteredImages ?? []).map((img) => ({
          _id: img._id,
          title: img.title,
          description: img.description,
          category: img.category,
          type: "image" as const,
          imageUrl: img.imageUrl,
        }))
      : (filteredVideos ?? []).map((vid) => ({
          _id: vid._id,
          title: vid.title,
          description: vid.description,
          category: vid.category,
          type: "video" as const,
          youtubeVideoId: vid.youtubeVideoId,
        }));

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev !== null && prev < lightboxItems.length - 1 ? prev + 1 : 0,
    );
  }, [lightboxIndex, lightboxItems.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : lightboxItems.length - 1,
    );
  }, [lightboxIndex, lightboxItems.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, goNext, goPrev]);

  const isLoading =
    images === undefined || videos === undefined || categories === undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-20">
        <div className="bg-gradient-to-br from-[oklch(0.22_0.06_250)] via-[oklch(0.18_0.05_252)] to-[oklch(0.14_0.03_252)] text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium mb-6">
              <Camera size={16} />
              Multimedija
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-balance">
              Galerija
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              Fotografije i video snimci iz istorije i sadašnjosti FK Mladost
              Lučani — od osnivanja 1952. godine do danas.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs + Filters + Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              onClick={() => {
                setActiveTab("slike");
                setSelectedCategory("all");
                setLightboxIndex(null);
              }}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all",
                activeTab === "slike"
                  ? "bg-[oklch(0.69_0.095_228)] text-white shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              <ImageIcon size={18} />
              Slike
              {images && (
                <span className="ml-1 text-xs opacity-70">
                  ({images.length})
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("video");
                setSelectedCategory("all");
                setLightboxIndex(null);
              }}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all",
                activeTab === "video"
                  ? "bg-[oklch(0.69_0.095_228)] text-white shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              <Video size={18} />
              Video
              {videos && (
                <span className="ml-1 text-xs opacity-70">
                  ({videos.length})
                </span>
              )}
            </button>
          </div>

          {/* Category filter */}
          {tabCategories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-semibold transition-all border",
                  selectedCategory === "all"
                    ? "bg-[oklch(0.69_0.095_228)] text-white border-[oklch(0.69_0.095_228)] shadow-lg shadow-[oklch(0.69_0.095_228)]/20"
                    : "bg-card text-muted-foreground border-border hover:border-[oklch(0.69_0.095_228)]/50 hover:text-foreground",
                )}
              >
                Sve
                {activeTab === "slike" && images && (
                  <span className="ml-1.5 opacity-70">({images.length})</span>
                )}
                {activeTab === "video" && videos && (
                  <span className="ml-1.5 opacity-70">({videos.length})</span>
                )}
              </button>
              {tabCategories.map((cat) => {
                const count =
                  activeTab === "slike"
                    ? images?.filter((i) => i.category === cat).length ?? 0
                    : videos?.filter((v) => v.category === cat).length ?? 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-semibold transition-all border",
                      selectedCategory === cat
                        ? "bg-[oklch(0.69_0.095_228)] text-white border-[oklch(0.69_0.095_228)] shadow-lg shadow-[oklch(0.69_0.095_228)]/20"
                        : "bg-card text-muted-foreground border-border hover:border-[oklch(0.69_0.095_228)]/50 hover:text-foreground",
                    )}
                  >
                    {cat}
                    <span className="ml-1.5 opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : activeTab === "slike" ? (
            <ImageGrid
              images={filteredImages ?? []}
              onOpen={openLightbox}
            />
          ) : (
            <VideoGrid
              videos={filteredVideos ?? []}
              onOpen={openLightbox}
            />
          )}
        </div>
      </section>

      {/* Unified Lightbox for images & videos */}
      {lightboxIndex !== null && lightboxItems[lightboxIndex] && (
        <MediaLightbox
          items={lightboxItems}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={goNext}
          onPrev={goPrev}
        />
      )}

      <Footer />
    </div>
  );
}

/* ─────── Image Grid ─────── */
type ImageItem = {
  _id: string;
  title: string;
  description?: string;
  category: string;
  imageUrl: string | null;
};

function ImageGrid({
  images,
  onOpen,
}: {
  images: ImageItem[];
  onOpen: (idx: number) => void;
}) {
  if (images.length === 0) {
    return (
      <div className="text-center py-20">
        <FolderOpen size={48} className="mx-auto mb-4 text-muted-foreground/40" />
        <p className="text-lg font-semibold">Nema slika</p>
        <p className="text-sm text-muted-foreground mt-2">
          Slike će se pojaviti čim budu dodate.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {images.map((img, idx) => (
        <button
          key={img._id}
          onClick={() => onOpen(idx)}
          className="group relative aspect-square rounded-xl overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-[oklch(0.69_0.095_228)] focus:ring-offset-2"
        >
          {img.imageUrl ? (
            <img
              src={img.imageUrl}
              alt={img.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={32} className="text-muted-foreground" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4">
            <p className="text-white text-sm font-semibold truncate">
              {img.title}
            </p>
            {img.description && (
              <p className="text-white/70 text-xs truncate mt-0.5">
                {img.description}
              </p>
            )}
            <span className="text-white/50 text-[10px] mt-1">
              {img.category}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─────── Video Grid ─────── */
type VideoItem = {
  _id: string;
  title: string;
  description?: string;
  category: string;
  youtubeVideoId?: string;
};

function VideoGrid({
  videos,
  onOpen,
}: {
  videos: VideoItem[];
  onOpen: (idx: number) => void;
}) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-20">
        <FolderOpen size={48} className="mx-auto mb-4 text-muted-foreground/40" />
        <p className="text-lg font-semibold">Nema video snimaka</p>
        <p className="text-sm text-muted-foreground mt-2">
          Video snimci će se pojaviti čim budu dodati.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {videos.map((vid, idx) => (
        <button
          key={vid._id}
          onClick={() => onOpen(idx)}
          className="group relative aspect-square rounded-xl overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-[oklch(0.69_0.095_228)] focus:ring-offset-2"
        >
          {vid.youtubeVideoId ? (
            <img
              src={`https://img.youtube.com/vi/${vid.youtubeVideoId}/hqdefault.jpg`}
              alt={vid.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video size={32} className="text-muted-foreground" />
            </div>
          )}

          {/* Play icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-white ml-0.5"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4">
            <p className="text-white text-sm font-semibold truncate">
              {vid.title}
            </p>
            {vid.description && (
              <p className="text-white/70 text-xs truncate mt-0.5">
                {vid.description}
              </p>
            )}
            <span className="text-white/50 text-[10px] mt-1">
              {vid.category}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─────── Unified Lightbox (images + videos) ─────── */
function MediaLightbox({
  items,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  items: LightboxItem[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const current = items[currentIndex];
  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-4 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-white min-w-0 flex-1 mr-4">
          <h3 className="text-lg font-bold truncate">{current.title}</h3>
          {current.description && (
            <p className="text-white/60 text-sm mt-0.5 line-clamp-2">
              {current.description}
            </p>
          )}
          <span className="text-white/40 text-xs">{current.category}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-white/50 text-sm">
            {currentIndex + 1} / {items.length}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10 h-10 w-10 p-0"
            onClick={onClose}
          >
            <X size={22} />
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div
        className="flex-1 flex items-center justify-center px-4 sm:px-16 pb-6 relative min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev button */}
        {items.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Image or YouTube embed */}
        {current.type === "image" && current.imageUrl ? (
          <img
            src={current.imageUrl}
            alt={current.title}
            className="max-w-full max-h-full object-contain rounded-lg select-none"
            draggable={false}
          />
        ) : current.type === "video" && current.youtubeVideoId ? (
          <div className="w-full max-w-5xl aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${current.youtubeVideoId}?autoplay=1&rel=0`}
              title={current.title}
              className="w-full h-full rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}

        {/* Next button */}
        {items.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
