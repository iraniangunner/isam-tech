import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Mail,
  User,
  BarChart2,
  Settings,
} from "lucide-react";
import Sidebar from "../../../components/admin/Sidebar/Sidebar";
import "./Dashboard.css";

const NAV_ITEMS = [
  { id: "dashboard",  icon: <BarChart2 size={16} />, label: "Dashboard", path: "/admin/dashboard" },
  { id: "messages",   icon: <Mail size={16} />,      label: "Messages",  path: "/admin/messages"  },
  { id: "users",      icon: <User size={16} />,      label: "Users",     path: "/admin/users"     },
  { id: "analytics",  icon: <BarChart2 size={16} />, label: "Analytics", path: "/admin/analytics" },
  { id: "settings",   icon: <Settings size={16} />,  label: "Settings",  path: "/admin/settings"  },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Highlight the correct nav item based on current URL
  const activeNav =
    NAV_ITEMS.find((item) => location.pathname.startsWith(item.path))?.id ??
    "messages";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={`admin-shell ${sidebarOpen ? "admin-shell--open" : ""}`}>
      <Sidebar
        navItems={NAV_ITEMS}
        activeId={activeNav}
        onNavChange={(id) => {
          const item = NAV_ITEMS.find((n) => n.id === id);
          if (item) navigate(item.path);
        }}
        brand={{ name: "AdminKit", mark: "A" }}
        user={{ name: user?.name, role: "Administrator" }}
        onLogout={handleLogout}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      <div className="main-area">
        {/* Each child route (Messages, Analytics, etc.) renders here */}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;