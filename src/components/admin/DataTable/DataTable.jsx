import { useState, useMemo, useEffect } from "react";
import {
  Eye, Pencil, Trash2, X, Save, Search, Plus,
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown,
  AlertTriangle, Loader2, Inbox, CheckCircle2, XCircle,
} from "lucide-react";
import "./DataTable.css";

/**
 * DataTable — reusable table with search, sort, pagination, row actions, and CREATE.
 *
 * ── Create (new) ─────────────────────────────────────────────────────────────
 *   Add these 3 props to show a "+ New" button that opens a create modal:
 *
 *   creatable        {bool}     — shows the button in the table header
 *   createLabel      {string}   — button text + modal title (default "New Record")
 *   onCreateSave     {function} — (formData, { onSuccess, onError }) => void
 *
 *   Column options that control the create form:
 *     hideInCreate: true      — skip this field in the create form
 *     editType: "readonly"    — also skipped automatically (can't create readonly)
 *     createDefault: value    — pre-fill this field with a default value
 *
 *   Inside onCreateSave:
 *     call onSuccess()                      → closes modal + shows "created" toast
 *     call onError({ field: ["msg"] })      → shows validation errors under each field
 *
 * ── Example usage ─────────────────────────────────────────────────────────────
 *   const handleCreate = async (formData, { onSuccess, onError }) => {
 *     try {
 *       await api.post("/admin/users", formData);
 *       fetch();        // refetch the table
 *       onSuccess();    // close modal + toast
 *     } catch (err) {
 *       if (err.response?.status === 422) {
 *         onError(err.response.data.errors); // show validation errors
 *       }
 *     }
 *   };
 *
 *   <DataTable
 *     creatable
 *     createLabel="New User"
 *     onCreateSave={handleCreate}
 *     ...rest of props
 *   />
 */

/* ─────────────────────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────────────────────── */
function useModal() {
  const [state, setState] = useState({
    open: false, exiting: false, data: null, type: null,
  });
  const open  = (type, data) => setState({ open: true, exiting: false, data, type });
  const close = () => {
    setState((s) => ({ ...s, exiting: true }));
    setTimeout(() => setState({ open: false, exiting: false, data: null, type: null }), 200);
  };
  return { ...state, open, close };
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  };
  return { toasts, show };
}

/* ─────────────────────────────────────────────────────────────────────────────
   BACKDROP
───────────────────────────────────────────────────────────────────────────── */
function Backdrop({ exiting, onClose, children }) {
  const handleMouseDown = (e) => { if (e.target === e.currentTarget) onClose(); };
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div className={`dt-backdrop${exiting ? " dt-backdrop--exit" : ""}`} onMouseDown={handleMouseDown}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   EDIT FIELD — shared by Edit modal AND Create modal
───────────────────────────────────────────────────────────────────────────── */
function EditField({ col, value, onChange, prefix = "edit" }) {
  const id   = `${prefix}-${col.key}`;
  const base = { id, value: value ?? "", onChange };

  if (col.editType === "readonly") {
    return <div className="dt-field-readonly">{value != null ? String(value) : "—"}</div>;
  }
  if (col.editType === "textarea") {
    return <textarea {...base} rows={4} placeholder={`Enter ${col.header.toLowerCase()}…`} />;
  }
  if (col.editType === "select") {
    return (
      <select {...base}>
        <option value="">— select —</option>
        {(col.editOptions ?? []).map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label ?? opt.value}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      {...base}
      type={["date", "email", "number", "password"].includes(col.editType) ? col.editType : "text"}
      placeholder={`Enter ${col.header.toLowerCase()}…`}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MODAL: VIEW
───────────────────────────────────────────────────────────────────────────── */
function ViewModal({ row, columns, onClose, exiting }) {
  const fields = columns.filter((c) => c.key !== "__actions" && !c.hideInView);
  return (
    <Backdrop exiting={exiting} onClose={onClose}>
      <div className="dt-modal">
        <div className="dt-modal__header">
          <div className="dt-modal__title-row">
            <div className="dt-modal__badge dt-modal__badge--view"><Eye size={15} /></div>
            <span className="dt-modal__title">Row Details</span>
          </div>
          <button className="dt-modal__close" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>
        <div className="dt-modal__body">
          <div className="dt-view-grid">
            {fields.map((col) => (
              <div className={`dt-view-field${col.fullWidth ? " dt-view-field--full" : ""}`} key={col.key}>
                <span className="dt-view-field__label">{col.header}</span>
                <span className="dt-view-field__value">
                  {col.render ? col.render(row[col.key], row) : row[col.key] != null ? String(row[col.key]) : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="dt-modal__footer">
          <button className="dt-btn dt-btn--ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MODAL: EDIT
   Column config:
     editType    — "text"|"textarea"|"select"|"date"|"email"|"number"|"password"|"readonly"
     editOptions — [{ value, label }]  required when editType="select"
     hideInEdit  — true → field is excluded from edit form
     fullWidth   — true → field spans full width in the 2-col grid
───────────────────────────────────────────────────────────────────────────── */
function EditModal({ row, columns, onClose, onSave, exiting }) {
  const editableCols = columns.filter((c) => c.key !== "__actions" && !c.hideInEdit);
  const [form, setForm] = useState(() =>
    Object.fromEntries(editableCols.map((c) => [c.key, row[c.key] ?? ""]))
  );
  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Backdrop exiting={exiting} onClose={onClose}>
      <div className="dt-modal">
        <div className="dt-modal__header">
          <div className="dt-modal__title-row">
            <div className="dt-modal__badge dt-modal__badge--edit"><Pencil size={15} /></div>
            <span className="dt-modal__title">Edit Row</span>
          </div>
          <button className="dt-modal__close" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>
        <div className="dt-modal__body">
          <div className="dt-edit-form">
            {editableCols.map((col) => (
              <div className={`dt-field${col.fullWidth ? " dt-field--full" : ""}`} key={col.key}>
                <label htmlFor={`edit-${col.key}`}>{col.header}</label>
                <EditField col={col} value={form[col.key]} onChange={handleChange(col.key)} prefix="edit" />
              </div>
            ))}
          </div>
        </div>
        <div className="dt-modal__footer">
          <button className="dt-btn dt-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="dt-btn dt-btn--primary" onClick={() => onSave(form)}>
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MODAL: CREATE
   Column config (same as edit, plus):
     hideInCreate:  true   → skip this field in the create form
     createDefault: value  → pre-fill this field with a value
   editType: "readonly" is always skipped in create automatically.

   onCreateSave(formData, { onSuccess, onError })
     onSuccess()                      → close modal + show toast
     onError({ field: ["message"] })  → show validation errors under fields
───────────────────────────────────────────────────────────────────────────── */
function CreateModal({ columns, onClose, onCreateSave, createLabel, exiting }) {
  const creatableCols = columns.filter(
    (c) => c.key !== "__actions" && !c.hideInCreate && c.editType !== "readonly"
  );
  const [form, setForm]     = useState(() =>
    Object.fromEntries(creatableCols.map((c) => [c.key, c.createDefault ?? ""]))
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined })); // clear field error on change
  };

  const handleSubmit = () => {
    setSaving(true);
    setErrors({});
    onCreateSave(form, {
      onSuccess: () => { setSaving(false); onClose(); },
      onError:   (errs) => { setSaving(false); setErrors(errs ?? {}); },
    });
  };

  return (
    <Backdrop exiting={exiting} onClose={onClose}>
      <div className="dt-modal">
        <div className="dt-modal__header">
          <div className="dt-modal__title-row">
            <div className="dt-modal__badge dt-modal__badge--create"><Plus size={15} /></div>
            <span className="dt-modal__title">{createLabel ?? "New Record"}</span>
          </div>
          <button className="dt-modal__close" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>
        <div className="dt-modal__body">
          <div className="dt-edit-form">
            {creatableCols.map((col) => (
              <div className={`dt-field${col.fullWidth ? " dt-field--full" : ""}`} key={col.key}>
                <label htmlFor={`create-${col.key}`}>{col.header}</label>
                <EditField col={col} value={form[col.key]} onChange={handleChange(col.key)} prefix="create" />
                {errors[col.key] && <p className="dt-field-error">{errors[col.key][0]}</p>}
              </div>
            ))}
          </div>
        </div>
        <div className="dt-modal__footer">
          <button className="dt-btn dt-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="dt-btn dt-btn--create" onClick={handleSubmit} disabled={saving}>
            <Plus size={14} />
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MODAL: DELETE CONFIRM
───────────────────────────────────────────────────────────────────────────── */
function DeleteModal({ row, labelKey, onClose, onConfirm, exiting }) {
  return (
    <Backdrop exiting={exiting} onClose={onClose}>
      <div className="dt-modal">
        <div className="dt-modal__header">
          <div className="dt-modal__title-row">
            <div className="dt-modal__badge dt-modal__badge--delete"><Trash2 size={15} /></div>
            <span className="dt-modal__title">Confirm Delete</span>
          </div>
          <button className="dt-modal__close" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>
        <div className="dt-modal__body">
          <div className="dt-delete-warning">
            <div className="dt-delete-warning__icon"><AlertTriangle size={44} strokeWidth={1.5} /></div>
            <p className="dt-delete-warning__title">Delete this record?</p>
            {row[labelKey] != null && (
              <div className="dt-delete-warning__chip">{String(row[labelKey])}</div>
            )}
            <p className="dt-delete-warning__sub">
              This action cannot be undone. The record will be permanently removed.
            </p>
          </div>
        </div>
        <div className="dt-modal__footer">
          <button className="dt-btn dt-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="dt-btn dt-btn--danger" onClick={onConfirm}>
            <Trash2 size={14} /> Yes, Delete
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const DataTable = ({
  columns = [],
  data: initialData = [],
  loading = false,
  title = "Table",
  icon,
  searchable = true,
  searchKeys = [],
  emptyMessage = "No data found",
  actions,
  rowKey = "id",
  // Server-side pagination
  serverPagination = false,
  currentPage: serverPage = 1,
  lastPage = 1,
  total,
  perPage = 20,
  onPageChange,
  // Row action callbacks
  onView,
  onEdit,
  onDelete,
  // Which action buttons to show
  rowActions = ["view", "edit", "delete"],
  // Key whose value appears in the delete confirm chip
  rowLabelKey,
  // Server-side search
  serverSearch = false,
  searchValue,
  onSearch,
  // ── Create ──────────────────────────────────────────────────────────────────
  creatable    = false,        // show "+ New" button in table header
  createLabel  = "New Record", // button text + modal title
  onCreateSave,                // (formData, { onSuccess, onError }) => void
}) => {
  const [data, setData]             = useState(initialData);
  const [localSearch, setLocalSearch] = useState("");
  const search    = serverSearch ? (searchValue ?? "") : localSearch;
  const [sortKey, setSortKey]       = useState(null);
  const [sortDir, setSortDir]       = useState("asc");
  const [clientPage, setClientPage] = useState(1);

  const modal = useModal();
  const { toasts, show: showToast } = useToast();
  const CLIENT_PAGE_SIZE = 10;

  useEffect(() => setData(initialData), [initialData]);

  const labelKey =
    rowLabelKey ??
    columns.find((c) => c.key !== "id" && c.key !== rowKey)?.key ??
    rowKey;

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (serverSearch) return data;
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      (searchKeys.length ? searchKeys : columns.map((c) => c.key)).some((k) =>
        String(row[k] ?? "").toLowerCase().includes(q)
      )
    );
  }, [data, search, searchKeys, columns, serverSearch]);

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const cmp = String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const isServer     = serverPagination;
  const activePage   = isServer ? serverPage : Math.min(clientPage, Math.max(1, Math.ceil(sorted.length / CLIENT_PAGE_SIZE)));
  const totalPages   = isServer ? lastPage   : Math.max(1, Math.ceil(sorted.length / CLIENT_PAGE_SIZE));
  const displayRows  = isServer ? sorted     : sorted.slice((activePage - 1) * CLIENT_PAGE_SIZE, activePage * CLIENT_PAGE_SIZE);
  const displayTotal = isServer ? (total ?? data.length) : sorted.length;
  const pageSize     = isServer ? perPage : CLIENT_PAGE_SIZE;
  const fromRow      = (activePage - 1) * pageSize + 1;
  const toRow        = Math.min(activePage * pageSize, displayTotal);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    if (isServer) onPageChange?.(page);
    else setClientPage(page);
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    if (!isServer) setClientPage(1);
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    if (serverSearch) onSearch?.(q);
    else { setLocalSearch(q); if (!isServer) setClientPage(1); }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - activePage) <= 1)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  // ── Modal handlers ────────────────────────────────────────────────────────
  const handleView   = (row) => { onView?.(row); modal.open("view", row); };
  const handleEdit   = (row) => { onEdit?.(row); modal.open("edit", row); };
  const handleDelete = (row) => modal.open("delete", row);

  const handleSaveEdit = (formData) => {
    setData((prev) => prev.map((r) => r[rowKey] === modal.data[rowKey] ? { ...r, ...formData } : r));
    onEdit?.(formData);
    modal.close();
    showToast("Record updated successfully");
  };

  const handleConfirmDelete = () => {
    const label = String(modal.data[labelKey] ?? modal.data[rowKey]);
    setData((prev) => prev.filter((r) => r[rowKey] !== modal.data[rowKey]));
    onDelete?.(modal.data);
    modal.close();
    showToast(`"${label}" deleted`, "danger");
  };

  const handleCreateSave = (formData, { onSuccess, onError }) => {
    if (!onCreateSave) return;
    onCreateSave(formData, {
      onSuccess: () => { onSuccess(); showToast("Record created successfully"); },
      onError,
    });
  };

  // allColumns = everything including hideInTable cols (used by modals)
  // tableColumns = only what renders in the table
  const allColumns = [
    ...columns,
    {
      key: "__actions",
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="dt-td--actions">
          {rowActions.includes("view")   && <button className="dt-action-btn dt-action-btn--view"   title="View details" onClick={() => handleView(row)}><Eye size={14} /></button>}
          {rowActions.includes("edit")   && <button className="dt-action-btn dt-action-btn--edit"   title="Edit"         onClick={() => handleEdit(row)}><Pencil size={14} /></button>}
          {rowActions.includes("delete") && <button className="dt-action-btn dt-action-btn--delete" title="Delete"       onClick={() => handleDelete(row)}><Trash2 size={14} /></button>}
        </div>
      ),
    },
  ];
  const tableColumns = allColumns.filter((c) => !c.hideInTable);

  return (
    <>
      <div className="dt-card">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="dt-card__header">
          <div className="dt-card__title">
            {icon && <span className="dt-card__icon">{icon}</span>}
            {title}
            <span className="dt-card__count">{displayTotal}</span>
          </div>
          <div className="dt-card__controls">
            {searchable && (
              <div className="dt-search">
                <Search size={14} className="dt-search__icon" />
                <input
                  className="dt-search__input"
                  type="search"
                  placeholder="Search…"
                  value={search}
                  onChange={handleSearch}
                />
              </div>
            )}
            {actions && <div className="dt-card__actions">{actions}</div>}
            {/* ── "+ New" button — only rendered when creatable=true ── */}
            {creatable && (
              <button className="dt-create-btn" onClick={() => modal.open("create", null)}>
                <Plus size={14} />
                {createLabel}
              </button>
            )}
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="dt-state"><Loader2 size={28} className="dt-spinner-icon" /><p>Loading…</p></div>
        ) : displayRows.length === 0 ? (
          <div className="dt-state"><Inbox size={44} strokeWidth={1.2} className="dt-empty-icon" /><p>{search ? `No results for "${search}"` : emptyMessage}</p></div>
        ) : (
          <>
            <div className="dt-scroll">
              <table className="dt-table">
                <thead>
                  <tr>
                    <th className="dt-th dt-th--num">#</th>
                    {tableColumns.map((col) => (
                      <th
                        key={col.key}
                        className={`dt-th${col.key !== "__actions" ? " dt-th--sortable" : ""}${sortKey === col.key ? " dt-th--sorted" : ""}`}
                        style={{ width: col.width, textAlign: col.align ?? "left" }}
                        onClick={() => col.key !== "__actions" && handleSort(col.key)}
                      >
                        <span className="dt-th__inner">
                          {col.header}
                          {col.key !== "__actions" && (
                            <span className="dt-sort-icon">
                              {sortKey === col.key ? (sortDir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />) : <ArrowUpDown size={11} />}
                            </span>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row, i) => (
                    <tr key={row[rowKey] ?? i} className="dt-row">
                      <td className="dt-td dt-td--num">{fromRow + i}</td>
                      {tableColumns.map((col) => (
                        <td key={col.key} className="dt-td" style={{ textAlign: col.align ?? "left" }}>
                          {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="dt-pagination">
                <span className="dt-pagination__info">Showing {fromRow}–{toRow} of {displayTotal}</span>
                <div className="dt-pagination__pages">
                  <button className="dt-page-btn" onClick={() => goToPage(activePage - 1)} disabled={activePage === 1}><ChevronLeft size={15} /></button>
                  {pageNumbers.map((p, i) =>
                    p === "…" ? <span key={`e${i}`} className="dt-page-ellipsis">…</span> : (
                      <button key={p} className={`dt-page-btn${activePage === p ? " dt-page-btn--active" : ""}`} onClick={() => goToPage(p)}>{p}</button>
                    )
                  )}
                  <button className="dt-page-btn" onClick={() => goToPage(activePage + 1)} disabled={activePage === totalPages}><ChevronRight size={15} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {modal.open && modal.type === "view"   && <ViewModal   row={modal.data} columns={allColumns} onClose={modal.close} exiting={modal.exiting} />}
      {modal.open && modal.type === "edit"   && <EditModal   row={modal.data} columns={allColumns} onClose={modal.close} onSave={handleSaveEdit} exiting={modal.exiting} />}
      {modal.open && modal.type === "delete" && <DeleteModal row={modal.data} labelKey={labelKey}  onClose={modal.close} onConfirm={handleConfirmDelete} exiting={modal.exiting} />}
      {modal.open && modal.type === "create" && (
        <CreateModal
          columns={allColumns}
          onClose={modal.close}
          onCreateSave={handleCreateSave}
          createLabel={createLabel}
          exiting={modal.exiting}
        />
      )}

      {/* ── Toasts ──────────────────────────────────────────────────────────── */}
      <div className="dt-toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`dt-toast dt-toast--${t.type}`}>
            {t.type === "success" ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
};

export default DataTable;