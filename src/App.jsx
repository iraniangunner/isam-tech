import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CookieConsent from "./components/common/CookieConsent";
import ScrollToTop from "./components/common/ScrollToTop";
import Home from "./pages/Home";
import { useLanguage } from "./hooks/useTranslation";
import { LEGACY_REDIRECTS, ROUTES, getPath } from "./utils/routes";
import ProtectedRoute from "./components/ProtectedRoute";

const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const DataPrivacy = lazy(() => import("./pages/DataPrivacy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));

function App() {
  const { language } = useLanguage();

  return (
    <div className="app">
      <ScrollToTop />
      <a href="#main-content" className="skip-link">
        {language === "fa" ? "رفتن به محتوای اصلی" : "Skip to main content"}
      </a>

      <Routes>
        {/* Auth routes — no Navbar/Footer */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Public routes — with Navbar/Footer */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <main id="main-content">
                <Suspense fallback={null}>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <Navigate to={getPath(language, "home")} replace />
                      }
                    />

                    <Route path={ROUTES.fa.home} element={<Home />} />
                    <Route path={ROUTES.en.home} element={<Home />} />

                    <Route path={ROUTES.fa.about} element={<About />} />
                    <Route path={ROUTES.en.about} element={<About />} />

                    <Route path={ROUTES.fa.services} element={<Services />} />
                    <Route path={ROUTES.en.services} element={<Services />} />

                    <Route path={ROUTES.fa.contact} element={<Contact />} />
                    <Route path={ROUTES.en.contact} element={<Contact />} />

                    <Route
                      path={ROUTES.fa.privacyPolicy}
                      element={<PrivacyPolicy />}
                    />
                    <Route
                      path={ROUTES.en.privacyPolicy}
                      element={<PrivacyPolicy />}
                    />

                    <Route
                      path={ROUTES.fa.dataPrivacy}
                      element={<DataPrivacy />}
                    />
                    <Route
                      path={ROUTES.en.dataPrivacy}
                      element={<DataPrivacy />}
                    />

                    {LEGACY_REDIRECTS.map((redirect) => (
                      <Route
                        key={redirect.from}
                        path={redirect.from}
                        element={<Navigate to={redirect.to} replace />}
                      />
                    ))}

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <CookieConsent />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
