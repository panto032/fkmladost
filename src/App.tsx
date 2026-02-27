import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import AdminPage from "./pages/admin/page.tsx";
import PrviTimPage from "./pages/prvi-tim/page.tsx";
import VestiPage from "./pages/vesti/page.tsx";
import NewsDetailPage from "./pages/vesti/detail/page.tsx";
import OmladinskaSkola from "./pages/omladinska-skola/page.tsx";
import IstorijaKluba from "./pages/istorija-kluba/page.tsx";
import StadionPage from "./pages/stadion/page.tsx";
import NajavaKolaPage from "./pages/najava-kola/page.tsx";
import AnalitikaRivalaPage from "./pages/analitika-rivala/page.tsx";
import OmladinskaLigaPage from "./pages/omladinska-liga/page.tsx";
import KadetskaLigaPage from "./pages/kadetska-liga/page.tsx";
import PionirskaLigaPage from "./pages/pionirska-liga/page.tsx";
import SuperLigaPage from "./pages/super-liga/page.tsx";
import StrucniStabPage from "./pages/strucni-stab/page.tsx";
import KontaktPage from "./pages/kontakt/page.tsx";
import DokumentaPage from "./pages/dokumenta/page.tsx";
import MultimedijaPage from "./pages/multimedija/page.tsx";
import NotFound from "./pages/NotFound.tsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <DefaultProviders>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/prvi-tim" element={<PrviTimPage />} />
          <Route path="/vesti" element={<VestiPage />} />
          <Route path="/vesti/:id" element={<NewsDetailPage />} />
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
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}
