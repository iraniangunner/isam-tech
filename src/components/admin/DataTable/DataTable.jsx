import { useState, useMemo } from "react";
import "./DataTable.css";

/**
 * DataTable — reusable table with search, sort, and pagination.
 *
 * CLIENT-SIDE mode (default):
 *   <DataTable data={rows} columns={cols} />
 *
 * SERVER-SIDE pagination mode:
 *   <DataTable
 *     data={rows}           ← current page rows from API
 *     columns={cols}
 *     serverPagination
 *     currentPage={1}
 *     lastPage={5}
 *     total={98}
 *     perPage={20}
 *     onPageChange={(page) => fetchData(page)}
 *   />
 *
 * Column definition:
 *   { key, header, width?, align?, render?: (value, row) => ReactNode }
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  title = "Table",
  icon = "◈",
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
}) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [clientPage, setClientPage] = useState(1);

  const CLIENT_PAGE_SIZE = 10;

  // ── Filter (client-side only) ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      (searchKeys.length ? searchKeys : columns.map((c) => c.key)).some((k) =>
        String(row[k] ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [data, search, searchKeys, columns]);

  // ── Sort (client-side only) ────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const cmp = String(a[sortKey] ?? "").localeCompare(
        String(b[sortKey] ?? ""),
        undefined,
        { numeric: true }
      );
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const isServer = serverPagination;
  const activePage = isServer
    ? serverPage
    : Math.min(
        clientPage,
        Math.max(1, Math.ceil(sorted.length / CLIENT_PAGE_SIZE))
      );
  const totalPages = isServer
    ? lastPage
    : Math.max(1, Math.ceil(sorted.length / CLIENT_PAGE_SIZE));
  const displayRows = isServer
    ? sorted
    : sorted.slice(
        (activePage - 1) * CLIENT_PAGE_SIZE,
        activePage * CLIENT_PAGE_SIZE
      );
  const displayTotal = isServer ? total ?? data.length : sorted.length;
  const pageSize = isServer ? perPage : CLIENT_PAGE_SIZE;
  const fromRow = (activePage - 1) * pageSize + 1;
  const toRow = Math.min(activePage * pageSize, displayTotal);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    if (isServer) onPageChange?.(page);
    else setClientPage(page);
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    if (!isServer) setClientPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (!isServer) setClientPage(1);
  };

  // ── Page number list with ellipsis ─────────────────────────────────────────
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - activePage) <= 1)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="dt-card">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="dt-card__header">
        <div className="dt-card__title">
          <span className="dt-card__icon">{icon}</span>
          {title}
          <span className="dt-card__count">{displayTotal}</span>
        </div>
        <div className="dt-card__controls">
          {searchable && (
            <div className="dt-search">
              <span className="dt-search__icon">⌕</span>
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
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="dt-state">
          <div className="dt-spinner" />
          <p>Loading…</p>
        </div>
      ) : displayRows.length === 0 ? (
        <div className="dt-state">
          <div className="dt-empty-icon">📭</div>
          <p>{search ? `No results for "${search}"` : emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="dt-scroll">
            <table className="dt-table">
              <thead>
                <tr>
                  <th className="dt-th dt-th--num">#</th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`dt-th dt-th--sortable ${
                        sortKey === col.key ? "dt-th--sorted" : ""
                      }`}
                      style={{
                        width: col.width,
                        textAlign: col.align ?? "left",
                      }}
                      onClick={() => handleSort(col.key)}
                    >
                      <span className="dt-th__inner">
                        {col.header}
                        <span className="dt-sort-icon">
                          {sortKey === col.key
                            ? sortDir === "asc"
                              ? " ↑"
                              : " ↓"
                            : " ↕"}
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, i) => (
                  <tr key={row[rowKey] ?? i} className="dt-row">
                    <td className="dt-td dt-td--num">{fromRow + i}</td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="dt-td"
                        style={{ textAlign: col.align ?? "left" }}
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ────────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="dt-pagination">
              <span className="dt-pagination__info">
                Showing {fromRow}–{toRow} of {displayTotal}
              </span>
              <div className="dt-pagination__pages">
                <button
                  className="dt-page-btn"
                  onClick={() => goToPage(activePage - 1)}
                  disabled={activePage === 1}
                >
                  ‹
                </button>
                {pageNumbers.map((p, i) =>
                  p === "…" ? (
                    <span key={`e${i}`} className="dt-page-ellipsis">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      className={`dt-page-btn ${
                        activePage === p ? "dt-page-btn--active" : ""
                      }`}
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  className="dt-page-btn"
                  onClick={() => goToPage(activePage + 1)}
                  disabled={activePage === totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DataTable;
