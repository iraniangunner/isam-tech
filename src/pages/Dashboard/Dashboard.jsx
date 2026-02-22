import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

import {
  Mail,
  User,
  BarChart2,
  Settings,
  RefreshCw,
  MessagesSquare,
  MailOpen,
  TrendingUp,
} from "lucide-react";

import Sidebar from "../../components/admin/Sidebar/Sidebar";
import DataTable from "../../components/admin/DataTable/DataTable";
import "./Dashboard.css";

const NAV_ITEMS = [
  { id: "messages", icon: <Mail size={16} />, label: "Messages" },
  { id: "users", icon: <User size={16} />, label: "Users" },
  { id: "analytics", icon: <BarChart2 size={16} />, label: "Analytics" },
  { id: "settings", icon: <Settings size={16} />, label: "Settings" },
];

const StatCard = ({ label, value, icon, accent }) => (
  <div className={`stat-card accent-${accent}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-body">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className={`status-badge status-badge--${status}`}>
    <span className="status-badge__dot" />
    {status}
  </span>
);

const SenderCell = ({ name, email }) => (
  <div className="sender-cell">
    <div className="sender-cell__avatar">{name?.[0]?.toUpperCase()}</div>
    <div>
      <div className="sender-cell__name">{name}</div>
      <div className="sender-cell__email">{email}</div>
    </div>
  </div>
);

const MESSAGE_COLUMNS = [
  {
    key: "name",
    header: "Sender",
    render: (_, row) => <SenderCell name={row.name} email={row.email} />,
  },
  {
    key: "subject",
    header: "Subject",
    render: (v) => <span className="msg-preview">{v ?? "—"}</span>,
  },
  {
    key: "status",
    header: "Status",
    width: "120px",
    hideInView: true, // ← hidden from view modal
    render: (v) => <StatusBadge status={v} />,
  },
  {
    key: "created_at",
    header: "Date",
    width: "130px",
    render: (v) =>
      new Date(v).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
];

// ─────────────────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("messages");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(20);

  const fetchMessages = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/contact?page=${page}`);

      const payload = res.data?.data ?? res.data;
      const rows = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      setMessages(rows);
      setCurrentPage(payload?.current_page ?? 1);
      setLastPage(payload?.last_page ?? 1);
      setTotal(payload?.total ?? rows.length);
      setPerPage(payload?.per_page ?? 20);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages(1);
  }, [fetchMessages]);

  // Called after DataTable confirms deletion — sync with the server
  const handleDeleteMessage = useCallback(
    async (row) => {
      try {
        await api.delete(`/admin/contact/${row.id}`);
        const pageToLoad =
          messages.length === 1 && currentPage > 1
            ? currentPage - 1
            : currentPage;
        fetchMessages(pageToLoad);
      } catch (err) {
        console.error("Failed to delete message:", err);
      }
    },
    [messages.length, currentPage, fetchMessages],
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const newMsgs = messages.filter((m) => m.status === "new").length;
  const read = messages.filter((m) => m.status === "read").length;

  const navItemsWithBadges = NAV_ITEMS.map((item) =>
    item.id === "messages" ? { ...item, badge: newMsgs } : item,
  );

  return (
    <div className={`admin-shell ${sidebarOpen ? "admin-shell--open" : ""}`}>
      <Sidebar
        navItems={navItemsWithBadges}
        activeId={activeNav}
        onNavChange={setActiveNav}
        brand={{ name: "AdminKit", mark: "A" }}
        user={{ name: user?.name, role: "Administrator" }}
        onLogout={handleLogout}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      <div className="main-area">
        <header className="topbar">
          <div className="topbar__left">
            <h1 className="topbar__title">Contact Messages</h1>
            <p className="topbar__subtitle">
              {total} message{total !== 1 ? "s" : ""} total
            </p>
          </div>
          <button
            className="topbar__refresh"
            onClick={() => fetchMessages(currentPage)}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </header>

        <main className="content">
          <div className="stats-grid">
            <StatCard
              label="Total"
              value={total}
              icon={<Mail size={20} />}
              accent="blue"
            />
            <StatCard
              label="New"
              value={newMsgs}
              icon={<MessagesSquare size={20} />}
              accent="amber"
            />
            <StatCard
              label="Read"
              value={read}
              icon={<MailOpen size={20} />}
              accent="green"
            />
            <StatCard
              label="Response Rate"
              value={total ? `${Math.round((read / total) * 100)}%` : "—"}
              icon={<TrendingUp size={20} />}
              accent="purple"
            />
          </div>

          <DataTable
            title="All Messages"
            icon={<Mail size={15} />}
            columns={MESSAGE_COLUMNS}
            data={messages}
            loading={loading}
            searchable
            searchKeys={["name", "email", "subject"]}
            emptyMessage="No messages yet"
            rowKey="id"
            rowLabelKey="name"
            rowActions={["view", "delete"]}
            onDelete={handleDeleteMessage}
            serverPagination
            currentPage={currentPage}
            lastPage={lastPage}
            total={total}
            perPage={perPage}
            onPageChange={(page) => fetchMessages(page)}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
