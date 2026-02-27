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
    // editType: "date",
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
    // editType: "textarea",
  },
];

// ── Page component ────────────────────────────────────────────────────────────

const Messages = () => {
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
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    },
  });

  // const handleCreate = async (formData, { onSuccess, onError }) => {
  //   try {
  //     await api.post("/admin/anything", formData);
  //     fetch();       // refetch table
  //     onSuccess();   // close modal + green toast
  //   } catch (err) {
  //     if (err.response?.status === 422) {
  //       onError(err.response.data.errors); // show errors under fields
  //     }
  //   }
  // };

  const newMsgs = state.stats?.new ?? 0;
  const read = state.stats?.read ?? 0;

  return (
    <>
      <header className="topbar">
        <div className="topbar__left">
          <h1 className="topbar__title">Contact Messages</h1>
          <p className="topbar__subtitle">
            {state.total} message{state.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <button className="topbar__refresh" onClick={fetch} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </header>

      <main className="content">
        <div className="stats-grid">
          <StatCard
            label="Total"
            value={state.total}
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
            value={
              state.total ? `${Math.round((read / state.total) * 100)}%` : "—"
            }
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
          // creatable
          // createLabel="New Message"
          // onCreateSave={handleCreate}
        />
      </main>
    </>
  );
};

export default Messages;
