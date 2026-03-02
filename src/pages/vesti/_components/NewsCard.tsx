import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import type { NewsItem } from "@/lib/api.ts";
import { apiBaseUrl } from "@/lib/api.ts";

type NewsCardProps = {
  article: NewsItem;
  featured?: boolean;
};

function getImageSrc(article: NewsItem): string {
  if (article.imageFileName) return `${apiBaseUrl}/uploads/${article.imageFileName}`;
  return article.imageUrl;
}

export default function NewsCard({ article, featured = false }: NewsCardProps) {
  const imgSrc = getImageSrc(article);

  if (featured) {
    return (
      <Link
        to={`/vesti/${article.id}`}
        className="group block rounded-2xl overflow-hidden border border-border shadow-lg relative min-h-[340px] lg:min-h-[400px]"
      >
        <img src={imgSrc} alt={article.title} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-md">{article.category}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3 leading-tight line-clamp-2">{article.title}</h2>
          <p className="text-white/60 text-sm mt-2 line-clamp-2">{article.excerpt}</p>
          <div className="flex items-center text-white/45 text-xs mt-3"><Calendar size={12} className="mr-1.5" /> {article.date}</div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/vesti/${article.id}`} className="group block rounded-2xl overflow-hidden border border-border shadow-lg bg-card">
      <div className="relative h-48 overflow-hidden">
        <img src={imgSrc} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3">
          <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-md">{article.category}</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-card-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">{article.title}</h3>
        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center text-muted-foreground text-xs mt-3"><Calendar size={11} className="mr-1.5" /> {article.date}</div>
      </div>
    </Link>
  );
}
