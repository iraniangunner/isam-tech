import { useAuth } from "../../../context/AuthContext";
import { Mail, MessagesSquare, BarChart2, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./DashboardHome.css";

const QUICK_LINKS = [
  {
    icon: <Mail size={22} />,
    label: "Messages",
    sub: "View contact submissions",
    path: "/admin/messages",
    accent: "blue",
  },
  {
    icon: <MessagesSquare size={22} />,
    label: "Analytics",
    sub: "Charts & performance",
    path: "/admin/analytics",
    accent: "purple",
  },
  {
    icon: <Settings size={22} />,
    label: "Settings",
    sub: "Configure your admin",
    path: "/admin/settings",
    accent: "amber",
  },
];

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <header className="topbar">
        <div className="topbar__left">
          <h1 className="topbar__title">Dashboard</h1>
          <p className="topbar__subtitle">Welcome back</p>
        </div>
      </header>

      <main className="content">
        <div className="dh-hero">
          <div className="dh-hero__greeting">{greeting} 👋</div>
          <h2 className="dh-hero__name">{user?.name ?? "Admin"}</h2>
          <p className="dh-hero__sub">
            Here's what's happening in your admin panel.
          </p>
        </div>

        <div className="dh-links">
          {QUICK_LINKS.map((item) => (
            <button
              key={item.label}
              className={`dh-link accent-${item.accent}`}
              onClick={() => navigate(item.path)}
            >
              <div className="dh-link__icon">{item.icon}</div>
              <div>
                <div className="dh-link__label">{item.label}</div>
                <div className="dh-link__sub">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </>
  );
};

export default DashboardHome;
