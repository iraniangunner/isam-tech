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
import { usePageTracking } from "./hooks/usePageTracking";

const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const DataPrivacy = lazy(() => import("./pages/DataPrivacy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard/Dashboard"));
const Messages = lazy(() => import("./pages/admin/Messages/Messages"));
const DashboardHome = lazy(() =>
  import("./pages/admin/Dashboard/DashboardHome")
);
const Analytics = lazy(() => import("./pages/admin/Analytics/Analytics"));

function App() {
  usePageTracking();
  const { language } = useLanguage();

  return (
    <div className="app">
      <ScrollToTop />
      <a href="#main-content" className="skip-link">
        {language === "fa" ? "رفتن به محتوای اصلی" : "Skip to main content"}
      </a>

      <Routes>
        {/* ── Auth — no Navbar/Footer ──────────────────────────────────── */}
        <Route path="/login" element={<Login />} />

        {/* ── Admin — Dashboard is the sidebar shell, all pages nest inside ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Suspense fallback={null}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        >
          {/* /admin → redirect to /admin/dashboard */}
          {/* <Route index element={<Navigate to="dashboard" replace />} /> */}

          {/* /admin/dashboard — home/overview page */}
          <Route
            path="dashboard"
            element={
              <Suspense fallback={null}>
                <DashboardHome />
              </Suspense>
            }
          />

          {/* /admin/messages */}
          <Route
            path="messages"
            element={
              <Suspense fallback={null}>
                <Messages />
              </Suspense>
            }
          />
          <Route
            path="analytics"
            element={
              <Suspense fallback={null}>
                <Analytics />
              </Suspense>
            }
          />

          {/* Uncomment as you build each page:
          <Route path="analytics" element={<Suspense fallback={null}><Analytics /></Suspense>} />
          <Route path="users"     element={<Suspense fallback={null}><Users /></Suspense>}     />
          <Route path="settings"  element={<Suspense fallback={null}><Settings /></Suspense>}  />
          */}
        </Route>

        {/* ── Public routes — with Navbar/Footer ──────────────────────── */}
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
