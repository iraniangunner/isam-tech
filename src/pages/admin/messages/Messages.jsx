import { useEffect, useCallback, useReducer, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

// ── Custom hook: all state lives in the URL ───────────────────────────────────
function useMessageParams() {
  const [params, setParams] = useSearchParams();

  const page = parseInt(params.get("page") ?? "1", 10);
  const search = params.get("search") ?? "";
  const sortBy = params.get("sort") ?? "";
  const sortDir = params.get("dir") ?? "desc";

  const set = (updates) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === "" || v == null) next.delete(k);
        else next.set(k, String(v));
      });
      if ("search" in updates || "sort" in updates) next.set("page", "1");
      return next;
    });

  return { page, search, sortBy, sortDir, set };
}

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
// ── Reducer (defined outside component to avoid hoisting issues) ─────────────

const initialState = {
  loading: true,
  messages: [],
  currentPage: 1,
  lastPage: 1,
  total: 0,
  perPage: 20,
};

function reducer(s, action) {
  switch (action.type) {
    case "LOADING":
      return { ...s, loading: true };
    case "SUCCESS":
      return { ...s, loading: false, ...action.payload };
    case "ERROR":
      return { ...s, loading: false };
    default:
      return s;
  }
}

// ── Page component ────────────────────────────────────────────────────────────

const Messages = () => {
  const {
    page,
    search: searchParam,
    sortBy,
    sortDir,
    set,
  } = useMessageParams();

  // Local input state — debounced before hitting the URL/API
  const [inputValue, setInputValue] = useState(searchParam);
  const debouncedSearch = useDebounce(inputValue, 400);

  // Sync debounced value → URL (triggers fetch via useEffect on fetchMessages)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    set({ search: debouncedSearch });
  }, [debouncedSearch]); // eslint-disable-line

  // Use URL param as the actual search value sent to API
  const search = searchParam;

  // Server state
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  // Keep latest params in a ref so fetchMessages never changes reference,
  // preventing double-fetch when search+page both update in the same set() call.
  const paramsRef = useRef({ page, search, sortBy, sortDir });
  useEffect(() => {
    paramsRef.current = { page, search, sortBy, sortDir };
  });

  const fetchMessages = useCallback(async () => {
    const { page, search, sortBy, sortDir } = paramsRef.current;
    dispatch({ type: "LOADING" });
    try {
      const res = await api.get("/admin/contact", {
        params: {
          page,
          ...(search && { search }),
          ...(sortBy && { sort_by: sortBy, sort_dir: sortDir }),
        },
      });
      const p = res.data;
      dispatch({
        type: "SUCCESS",
        payload: {
          messages: p.data ?? [],
          currentPage: p.current_page ?? 1,
          lastPage: p.last_page ?? 1,
          total: p.total ?? 0,
          perPage: p.per_page ?? 20,
        },
      });
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      dispatch({ type: "ERROR" });
    }
  }, []); // stable reference — never recreated

  // Re-fetch whenever URL params change
  useEffect(() => {
    fetchMessages();
  }, [page, search, sortBy, sortDir]); // eslint-disable-line

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleViewMessage = useCallback(
    async (row) => {
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
    [state],
  );

  const handleDeleteMessage = useCallback(
    async (row) => {
      try {
        await api.delete(`/admin/contact/${row.id}`);
        // If last row on page > 1, go back
        const nextPage =
          state.messages.length === 1 && page > 1 ? page - 1 : page;
        set({ page: nextPage });
        // fetchMessages will auto-run via useEffect on page change
        if (nextPage === page) fetchMessages();
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    },
    [state.messages.length, page, set, fetchMessages],
  );

  const newMsgs = state.messages.filter((m) => m.status === "new").length;
  const read = state.messages.filter((m) => m.status === "read").length;

  return (
    <>
      <header className="topbar">
        <div className="topbar__left">
          <h1 className="topbar__title">Contact Messages</h1>
          <p className="topbar__subtitle">
            {state.total} message{state.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          className="topbar__refresh"
          onClick={fetchMessages}
          title="Refresh"
        >
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
          // Server-side search — DataTable fires onSearch instead of filtering locally
          searchable
          serverSearch
          searchValue={inputValue} // instant — shows what user is typing right now
          onSearch={(q) => setInputValue(q)}
          emptyMessage="No messages yet"
          rowKey="id"
          rowLabelKey="name"
          rowActions={["view", "delete"]}
          onView={handleViewMessage}
          onDelete={handleDeleteMessage}
          // Server-side pagination
          serverPagination
          currentPage={state.currentPage}
          lastPage={state.lastPage}
          total={state.total}
          perPage={state.perPage}
          onPageChange={(p) => set({ page: p })}
        />
      </main>
    </>
  );
};

export default Messages;
