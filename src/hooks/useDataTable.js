import { useEffect, useCallback, useReducer, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";

// ── URL params hook ───────────────────────────────────────────────────────────
function useTableParams() {
  const [params, setParams] = useSearchParams();

  const page    = parseInt(params.get("page") ?? "1", 10);
  const search  = params.get("search") ?? "";
  const sortBy  = params.get("sort") ?? "";
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

// ── Reducer ───────────────────────────────────────────────────────────────────
function makeInitialState(dataKey) {
  return {
    loading: true,
    [dataKey]: [],
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  };
}

function reducer(s, action) {
  switch (action.type) {
    case "LOADING": return { ...s, loading: true };
    case "SUCCESS": return { ...s, loading: false, ...action.payload };
    case "ERROR":   return { ...s, loading: false };
    default:        return s;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   useDataTable — generic server-side table hook

   @param {object} options
   @param {string}   options.endpoint   — API endpoint, e.g. "/admin/users"
   @param {string}   options.dataKey    — key to store rows under in state, e.g. "users"
   @param {function} [options.onView]   — (row, { dispatch, state, fetch }) => void
   @param {function} [options.onEdit]   — (row, { dispatch, state, fetch }) => void
   @param {function} [options.onDelete] — (row, { dispatch, state, fetch, page, set }) => void

   Returns:
     state          — { loading, [dataKey], currentPage, lastPage, total, perPage }
     inputValue     — controlled search input value
     setInputValue  — update search input
     fetch          — manually trigger a refetch (e.g. after create)
     handleView
     handleEdit
     handleDelete
     onPageChange   — (page) => void

   ── How to use create ────────────────────────────────────────────────────────
   The hook does NOT handle create — that's intentional.
   Create is handled directly in your page component via onCreateSave on DataTable.

   Pattern:
     const { fetch, ...rest } = useDataTable({ endpoint, dataKey });

     const handleCreate = async (formData, { onSuccess, onError }) => {
       try {
         await api.post("/admin/users", formData);
         fetch();       // ← refetch table so new row appears
         onSuccess();   // ← close modal + show "created" toast
       } catch (err) {
         if (err.response?.status === 422) {
           onError(err.response.data.errors); // ← show errors under fields
         }
       }
     };

     <DataTable
       creatable
       createLabel="New User"
       onCreateSave={handleCreate}
       ...rest props
     />
───────────────────────────────────────────────────────────────────────────── */
export function useDataTable({ endpoint, dataKey, onView, onEdit, onDelete }) {
  const { page, search: searchParam, sortBy, sortDir, set } = useTableParams();

  const [inputValue, setInputValue] = useState(searchParam);
  const debouncedSearch = useDebounce(inputValue, 400);

  // Sync debounced search → URL
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    set({ search: debouncedSearch });
  }, [debouncedSearch]); // eslint-disable-line

  const search = searchParam;
  const [state, dispatch] = useReducer(reducer, makeInitialState(dataKey));

  // Stable fetch via ref — prevents double-fetch on simultaneous param changes
  const paramsRef = useRef({ page, search, sortBy, sortDir });
  useEffect(() => { paramsRef.current = { page, search, sortBy, sortDir }; });

  const fetch = useCallback(async () => {
    const { page, search, sortBy, sortDir } = paramsRef.current;
    dispatch({ type: "LOADING" });
    try {
      const res = await api.get(endpoint, {
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
          [dataKey]: p.data ?? [],
          currentPage: p.current_page ?? 1,
          lastPage:    p.last_page    ?? 1,
          total:       p.total        ?? 0,
          perPage:     p.per_page     ?? 20,
        },
      });
    } catch (err) {
      console.error(`[useDataTable] Failed to fetch ${endpoint}:`, err);
      dispatch({ type: "ERROR" });
    }
  }, [endpoint, dataKey]);

  useEffect(() => {
    fetch();
  }, [page, search, sortBy, sortDir]); // eslint-disable-line

  // ── Default handlers (can be overridden via options) ──────────────────────
  const handleView = useCallback(
    async (row) => { await onView?.(row, { dispatch, state, fetch }); },
    [onView, state, fetch]
  );

  const handleEdit = useCallback(
    async (row) => { await onEdit?.(row, { dispatch, state, fetch }); },
    [onEdit, state, fetch]
  );

  const handleDelete = useCallback(
    async (row) => {
      if (onDelete) {
        await onDelete(row, { dispatch, state, fetch, page, set });
      } else {
        // Default: DELETE /:id then refetch
        try {
          await api.delete(`${endpoint}/${row.id}`);
          const rows     = state[dataKey] ?? [];
          const nextPage = rows.length === 1 && page > 1 ? page - 1 : page;
          set({ page: nextPage });
          if (nextPage === page) fetch();
        } catch (err) {
          console.error(`[useDataTable] Failed to delete:`, err);
        }
      }
    },
    [onDelete, state, page, set, fetch, endpoint, dataKey]
  );

  return {
    state,
    inputValue,
    setInputValue,
    fetch,
    handleView,
    handleEdit,
    handleDelete,
    onPageChange: (p) => set({ page: p }),
  };
}