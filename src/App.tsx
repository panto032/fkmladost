import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import AdminPage from "./pages/admin/page.tsx";
import PrviTimPage from "./pages/prvi-tim/page.tsx";
import VestiPage from "./pages/vesti/page.tsx";
import NewsDetailPage from "./pages/vesti/detail/page.tsx";
import OmladinskaSkola from "./pages/omladinska-skola/page.tsx";
import NotFound from "./pages/NotFound.tsx";

export default function App() {
  return (
    <DefaultProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/prvi-tim" element={<PrviTimPage />} />
          <Route path="/vesti" element={<VestiPage />} />
          <Route path="/vesti/:id" element={<NewsDetailPage />} />
          <Route path="/omladinska-skola" element={<OmladinskaSkola />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}
