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

export default function MultimedijaPage() {
  const images = useQuery(api.media.getPublishedImages);
  const videos = useQuery(api.media.getPublishedVideos);
  const categories = useQuery(api.media.getCategories);

  const [activeTab, setActiveTab] = useState<TabType>("slike");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter images by category
  const filteredImages =
    images && selectedCategory !== "all"
      ? images.filter((img) => img.category === selectedCategory)
      : images;

  // Filter videos by category
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

  // Lightbox navigation
  const lightboxImages = filteredImages ?? [];

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev !== null && prev < lightboxImages.length - 1 ? prev + 1 : 0,
    );
  }, [lightboxIndex, lightboxImages.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : lightboxImages.length - 1,
    );
  }, [lightboxIndex, lightboxImages.length]);

  // Keyboard navigation for lightbox
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
          {tabCategories.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-semibold transition-all",
                  selectedCategory === "all"
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                Sve
              </button>
              {tabCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-semibold transition-all",
                    selectedCategory === cat
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {cat}
                </button>
              ))}
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
            <VideoGrid videos={filteredVideos ?? []} />
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && lightboxImages[lightboxIndex] && (
        <Lightbox
          images={lightboxImages}
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

          {/* Hover overlay with title */}
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
  youtubeUrl?: string;
};

function VideoGrid({ videos }: { videos: VideoItem[] }) {
  const [playingId, setPlayingId] = useState<string | null>(null);

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((vid) => (
        <div
          key={vid._id}
          className="rounded-xl overflow-hidden border bg-card group"
        >
          {/* Video embed or thumbnail */}
          <div className="aspect-video relative">
            {playingId === vid._id && vid.youtubeVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${vid.youtubeVideoId}?autoplay=1`}
                title={vid.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : vid.youtubeVideoId ? (
              <button
                onClick={() => setPlayingId(vid._id)}
                className="w-full h-full relative focus:outline-none"
              >
                <img
                  src={`https://img.youtube.com/vi/${vid.youtubeVideoId}/hqdefault.jpg`}
                  alt={vid.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-7 h-7 text-white ml-1"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </button>
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Video size={32} className="text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-semibold text-foreground truncate">
              {vid.title}
            </h3>
            {vid.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {vid.description}
              </p>
            )}
            <span className="inline-block mt-2 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {vid.category}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────── Lightbox ─────── */
function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  images: ImageItem[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const current = images[currentIndex];
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
            <p className="text-white/60 text-sm truncate mt-0.5">
              {current.description}
            </p>
          )}
          <span className="text-white/40 text-xs">{current.category}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-white/50 text-sm">
            {currentIndex + 1} / {images.length}
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

      {/* Image area */}
      <div
        className="flex-1 flex items-center justify-center px-4 sm:px-16 pb-6 relative min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev button */}
        {images.length > 1 && (
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

        {/* Image */}
        {current.imageUrl && (
          <img
            src={current.imageUrl}
            alt={current.title}
            className="max-w-full max-h-full object-contain rounded-lg select-none"
            draggable={false}
          />
        )}

        {/* Next button */}
        {images.length > 1 && (
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
