import { useEffect, useState, useCallback } from "react";
import api from "../../../api/axios";
import {
  Mail,
  MessagesSquare,
  MailOpen,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import DataTable from "../../../components/admin/DataTable/DataTable";
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
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage]       = useState(1);
  const [total, setTotal]             = useState(0);
  const [perPage, setPerPage]         = useState(20);

  const fetchMessages = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res     = await api.get(`/admin/contact?page=${page}`);
      const payload = res.data?.data ?? res.data;
      const rows    = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];

      setMessages(rows);
      setCurrentPage(payload?.current_page ?? 1);
      setLastPage(payload?.last_page       ?? 1);
      setTotal(payload?.total              ?? rows.length);
      setPerPage(payload?.per_page         ?? 20);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(1); }, [fetchMessages]);

  // Eye click → GET /admin/contact/:id → backend marks as read automatically
  const handleViewMessage = useCallback(async (row) => {
    if (row.status === "read") return;
    try {
      await api.get(`/admin/contact/${row.id}`);
      setMessages((prev) =>
        prev.map((m) => (m.id === row.id ? { ...m, status: "read" } : m))
      );
    } catch (err) {
      console.error("Failed to fetch message:", err);
    }
  }, []);

  // Trash click → confirmed in modal → DELETE /admin/contact/:id
  const handleDeleteMessage = useCallback(async (row) => {
    try {
      await api.delete(`/admin/contact/${row.id}`);
      const pageToLoad =
        messages.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      fetchMessages(pageToLoad);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  }, [messages.length, currentPage, fetchMessages]);

  const newMsgs = messages.filter((m) => m.status === "new").length;
  const read    = messages.filter((m) => m.status === "read").length;

  return (
    <>
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
          <StatCard label="Total"   value={total}   icon={<Mail size={20} />}           accent="blue"   />
          <StatCard label="New"     value={newMsgs} icon={<MessagesSquare size={20} />} accent="amber"  />
          <StatCard label="Read"    value={read}    icon={<MailOpen size={20} />}        accent="green"  />
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
          onView={handleViewMessage}
          onDelete={handleDeleteMessage}
          serverPagination
          currentPage={currentPage}
          lastPage={lastPage}
          total={total}
          perPage={perPage}
          onPageChange={(page) => fetchMessages(page)}
        />
      </main>
    </>
  );
};

export default Messages;