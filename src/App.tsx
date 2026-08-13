import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { useRouteSEO } from "./lib/seo.ts";
import { DefaultProviders } from "./components/providers/default.tsx";
// Naslovna, prvi tim i super liga se ucitavaju direktno — to su stranice sa
// najvise organskog saobracaja i one koje PageSpeed meri za LCP. Ostale rute
// su lenjo ucitane da njihov kod (narocito admin panel sa Tiptap editorom)
// ne nabija pocetni JS bundle koji ove tri stranice moraju da preuzmu —
// PageSpeed je flagovao ~260kB neiskoriscenog JS-a po stranici bas zbog toga.
// Vite pri build-u automatski deli i CSS po ruti.
import Index from "./pages/Index.tsx";
import PrviTimPage from "./pages/prvi-tim/page.tsx";
import SuperLigaPage from "./pages/super-liga/page.tsx";
const AdminPage = lazy(() => import("./pages/admin/page.tsx"));
const VestiPage = lazy(() => import("./pages/vesti/page.tsx"));
const NewsDetailPage = lazy(() => import("./pages/vesti/detail/page.tsx"));
const OmladinskaSkola = lazy(() => import("./pages/omladinska-skola/page.tsx"));
const IstorijaKluba = lazy(() => import("./pages/istorija-kluba/page.tsx"));
const StadionPage = lazy(() => import("./pages/stadion/page.tsx"));
const NajavaKolaPage = lazy(() => import("./pages/najava-kola/page.tsx"));
const AnalitikaRivalaPage = lazy(() => import("./pages/analitika-rivala/page.tsx"));
const OmladinskaLigaPage = lazy(() => import("./pages/omladinska-liga/page.tsx"));
const KadetskaLigaPage = lazy(() => import("./pages/kadetska-liga/page.tsx"));
const PionirskaLigaPage = lazy(() => import("./pages/pionirska-liga/page.tsx"));
const StrucniStabPage = lazy(() => import("./pages/strucni-stab/page.tsx"));
const KontaktPage = lazy(() => import("./pages/kontakt/page.tsx"));
const DokumentaPage = lazy(() => import("./pages/dokumenta/page.tsx"));
const MultimedijaPage = lazy(() => import("./pages/multimedija/page.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

/** Minimalan fallback dok se lenjo ucitana ruta preuzima — bez ovoga bi na
 * spor internet konekciji za trenutak blesnuo prazan beo ekran. */
function PageFallback() {
  return <div className="min-h-screen bg-background" />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Održava <title> i meta tagove tačnim pri SPA navigaciji. Pri prvom učitavanju
 * iste tagove postavlja server (server/src/seo/), zbog crawlera bez JavaScripta.
 */
function RouteSEO() {
  const { pathname } = useLocation();
  useRouteSEO(pathname);
  return null;
}

export default function App() {
  return (
    <DefaultProviders>
      <BrowserRouter>
        <ScrollToTop />
        <RouteSEO />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/prvi-tim" element={<PrviTimPage />} />
            <Route path="/vesti" element={<VestiPage />} />
            {/* Param je "<id>-<slug>" (npr. 47-pobeda-u-lucanima); stari
                linkovi oblika /vesti/47 i dalje rade. */}
            <Route path="/vesti/:slug" element={<NewsDetailPage />} />
            <Route path="/omladinska-skola" element={<OmladinskaSkola />} />
            <Route path="/istorija-kluba" element={<IstorijaKluba />} />
            <Route path="/stadion" element={<StadionPage />} />
            <Route path="/najava-kola" element={<NajavaKolaPage />} />
            <Route path="/analitika-rivala" element={<AnalitikaRivalaPage />} />
            <Route path="/omladinska-liga" element={<OmladinskaLigaPage />} />
            <Route path="/kadetska-liga" element={<KadetskaLigaPage />} />
            <Route path="/pionirska-liga" element={<PionirskaLigaPage />} />
            <Route path="/super-liga" element={<SuperLigaPage />} />
            <Route path="/strucni-stab" element={<StrucniStabPage />} />
            <Route path="/kontakt" element={<KontaktPage />} />
            <Route path="/dokumenta" element={<DokumentaPage />} />
            <Route path="/multimedija" element={<MultimedijaPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </DefaultProviders>
  );
}
