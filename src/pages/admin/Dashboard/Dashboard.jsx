import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Mail, User, BarChart2, Settings, Menu } from "lucide-react";
import Sidebar from "../../../components/admin/Sidebar/Sidebar";
import "./Dashboard.css";

const NAV_ITEMS = [
  { id: "dashboard",  icon: <BarChart2 size={16} />, label: "Dashboard", path: "/admin/dashboard" },
  // {
  //   id: "content",
  //   icon: <Mail size={16} />,
  //   label: "Content",
  //   path: "/admin/content",
  //   children: [                                           // ← dropdown
  //     { id: "messages", label: "Messages", path: "/admin/messages" },
  //     { id: "comments", label: "Comments", path: "/admin/comments" },
  //   ],
  // },
  { id: "messages",   icon: <Mail size={16} />,      label: "Messages",  path: "/admin/messages"  },
  { id: "users",      icon: <User size={16} />,      label: "Users",     path: "/admin/users"     },
  { id: "analytics",  icon: <BarChart2 size={16} />, label: "Analytics", path: "/admin/analytics" },
  { id: "settings",   icon: <Settings size={16} />,  label: "Settings",  path: "/admin/settings"  },
];

const MOBILE_BP = 768;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > MOBILE_BP);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BP);

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth <= MOBILE_BP;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const activeNav =
    NAV_ITEMS.find((item) => location.pathname.startsWith(item.path))?.id ?? "dashboard";

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const handleNavChange = (id) => {
    const item = NAV_ITEMS.find((n) => n.id === id);
    if (item) navigate(item.path);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className={`admin-shell ${sidebarOpen ? "admin-shell--open" : ""}`}>

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div className="admin-shell__backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        navItems={NAV_ITEMS}
        activeId={activeNav}
        onNavChange={handleNavChange}
        brand={{ name: "AdminKit", mark: "A" }}
        user={{ name: user?.name, role: "Administrator" }}
        onLogout={handleLogout}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      <div className="main-area">
        {/* Mobile topbar with hamburger — only visible on mobile */}
        {isMobile && (
          <div className="mobile-topbar">
            <button
              className="mobile-topbar__hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <span className="mobile-topbar__title">AdminKit</span>
          </div>
        )}

        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;