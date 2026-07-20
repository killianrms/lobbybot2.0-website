import { Routes, Route } from "react-router-dom";

import PublicLayout from "@/layouts/PublicLayout";
import PremiumLayout from "@/layouts/PremiumLayout";
import AdminLayout from "@/layouts/AdminLayout";

import Home from "@/pages/public/Home";
import Commands from "@/pages/public/Commands";
import Terms from "@/pages/public/Terms";
import Privacy from "@/pages/public/Privacy";
import Premium from "@/pages/premium/Premium";
import Admin from "@/pages/admin/Admin";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/i18n/LanguageContext";

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Routes>
          {/* Panel public — accessible sans authentification */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/commands" element={<Commands />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Route>

          {/* Panel premium — authentification "premium" requise (Phase 2/5) */}
          <Route element={<PremiumLayout />}>
            <Route path="/premium" element={<Premium />} />
          </Route>

          {/* Panel admin — authentification "admin" + VPN requis (Phase 2/3/6) */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
        <Toaster />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
