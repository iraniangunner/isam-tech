import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  MessagesSquare,
  MailOpen,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import DataTable from "../../../components/admin/DataTable/DataTable";
import { useDataTable } from "../../../hooks/useDataTable";
import api from "../../../api/axios";
import "./Messages.css";

// ── Sub-components ────────────────────────────────────────────────────────────

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
      <a
        className="sender-cell__email sender-cell__email--link"
        href={`mailto:${email}`}
        onClick={(e) => e.stopPropagation()}
      >
        {email}
      </a>
    </div>
  </div>
);

// ── Column definitions ────────────────────────────────────────────────────────

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
    hideInView: true,
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
  {
    key: "message",
    header: "Message",
    hideInTable: true,
    fullWidth: true,
  },
];

// ── Page component ────────────────────────────────────────────────────────────

const Messages = () => {
  // ── Stats (separate endpoint — always reflects full dataset) ───────────────
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0 });

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/admin/contact/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ── Table ──────────────────────────────────────────────────────────────────
  const {
    state,
    inputValue,
    setInputValue,
    fetch,
    handleView,
    handleDelete,
    onPageChange,
  } = useDataTable({
    endpoint: "/admin/contact",
    dataKey: "messages",

    // Mark message as read when viewed, then refresh stats
    onView: async (row, { dispatch, state }) => {
      if (row.status === "read") return;
      try {
        await api.get(`/admin/contact/${row.id}`);
        dispatch({
          type: "SUCCESS",
          payload: {
            ...state,
            messages: state.messages.map((m) =>
              m.id === row.id ? { ...m, status: "read" } : m,
            ),
          },
        });
        fetchStats(); // update stat cards after status change
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    },
    onDelete: async (row, { fetch, page, set, state }) => {
      try {
        await api.delete(`/admin/contact/${row.id}`);
        const rows = state.messages ?? [];
        const nextPage = rows.length === 1 && page > 1 ? page - 1 : page;
        set({ page: nextPage });
        if (nextPage === page)
          fetch({ page, search: "", sortBy: "", sortDir: "desc" });
        fetchStats(); // ← refresh stat cards
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    },
  });

  const responseRate = stats.total
    ? `${Math.round((stats.read / stats.total) * 100)}%`
    : "—";

  return (
    <>
      <header className="topbar">
        <div className="topbar__left">
          <h1 className="topbar__title">Contact Messages</h1>
          <p className="topbar__subtitle">
            {stats.total} message{stats.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          className="topbar__refresh"
          onClick={() => {
            fetch();
            fetchStats();
          }}
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </header>

      <main className="content">
        <div className="stats-grid">
          <StatCard
            label="Total"
            value={stats.total}
            icon={<Mail size={20} />}
            accent="blue"
          />
          <StatCard
            label="New"
            value={stats.new}
            icon={<MessagesSquare size={20} />}
            accent="amber"
          />
          <StatCard
            label="Read"
            value={stats.read}
            icon={<MailOpen size={20} />}
            accent="green"
          />
          <StatCard
            label="Response Rate"
            value={responseRate}
            icon={<TrendingUp size={20} />}
            accent="purple"
          />
        </div>

        <DataTable
          title="All Messages"
          icon={<Mail size={15} />}
          columns={MESSAGE_COLUMNS}
          data={state.messages}
          loading={state.loading}
          searchable
          serverSearch
          searchValue={inputValue}
          onSearch={(q) => setInputValue(q)}
          emptyMessage="No messages yet"
          rowKey="id"
          rowLabelKey="name"
          rowActions={["view", "delete"]}
          onView={handleView}
          onDelete={handleDelete}
          serverPagination
          currentPage={state.currentPage}
          lastPage={state.lastPage}
          total={state.total}
          perPage={state.perPage}
          onPageChange={onPageChange}
        />
      </main>
    </>
  );
};

export default Messages;
