import { useQuery } from "@tanstack/react-query";
import { documentsApi, apiBaseUrl } from "@/lib/api.ts";
import Header from "@/pages/home/_components/Header.tsx";
import Footer from "@/pages/home/_components/Footer.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  FileText,
  Download,
  FileIcon,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Map common MIME types to user-friendly labels */
function fileTypeLabel(fileType: string): string {
  if (fileType.includes("pdf")) return "PDF";
  if (fileType.includes("word") || fileType.includes("doc")) return "DOC";
  if (fileType.includes("sheet") || fileType.includes("xls")) return "XLS";
  if (fileType.includes("presentation") || fileType.includes("ppt")) return "PPT";
  if (fileType.includes("image")) return "Slika";
  if (fileType.includes("zip") || fileType.includes("rar")) return "Arhiva";
  return "Fajl";
}

export default function DokumentaPage() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => documentsApi.get(),
  });

  // Group documents by category
  const grouped = documents
    ? documents.reduce<Record<string, typeof documents>>((acc, doc) => {
        const key = doc.category;
        if (!acc[key]) acc[key] = [];
        acc[key].push(doc);
        return acc;
      }, {})
    : null;

  const categories = grouped ? Object.keys(grouped).sort() : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-20">
        <div className="bg-gradient-to-br from-[oklch(0.22_0.06_250)] via-[oklch(0.18_0.05_252)] to-[oklch(0.14_0.03_252)] text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium mb-6">
              <FileText size={16} />
              Dokumenta
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-balance">
              Dokumenta kluba
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              Sva važna dokumenta FK Mladost Lučani na jednom mestu.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : (documents ?? []).length === 0 ? (
            <div className="text-center py-20">
              <FolderOpen
                size={48}
                className="mx-auto mb-4 text-muted-foreground/40"
              />
              <p className="text-lg font-semibold text-foreground">
                Nema dokumenata
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Dokumenta kluba će uskoro biti dostupna.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {categories.map((category) => (
                <div key={category}>
                  {/* Category heading */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-[oklch(0.69_0.095_228)] rounded-full" />
                    <h2 className="text-xl font-bold uppercase tracking-wide text-foreground">
                      {category}
                    </h2>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {grouped![category].length}
                    </span>
                  </div>

                  {/* Documents list */}
                  <div className="space-y-3">
                    {grouped![category].map((doc) => (
                      <div
                        key={doc.id}
                        className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all"
                      >
                        {/* File icon */}
                        <div className="w-12 h-12 rounded-lg bg-[oklch(0.69_0.095_228)]/10 flex items-center justify-center flex-shrink-0">
                          <FileIcon
                            size={22}
                            className="text-[oklch(0.69_0.095_228)]"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {doc.title}
                          </h3>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                              {doc.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="bg-muted px-2 py-0.5 rounded">
                              {fileTypeLabel(doc.fileType)}
                            </span>
                            <span>{formatFileSize(doc.fileSize)}</span>
                          </div>
                        </div>

                        {/* Download */}
                        {doc.fileName && (
                          <a
                            href={`${apiBaseUrl}/uploads/${doc.fileName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              className="gap-2 opacity-80 group-hover:opacity-100 transition-opacity"
                            >
                              <Download size={14} />
                              <span className="hidden sm:inline">Preuzmi</span>
                            </Button>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
