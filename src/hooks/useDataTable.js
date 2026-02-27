import { useEffect, useCallback, useReducer, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";

// ── URL params hook ───────────────────────────────────────────────────────────
function useTableParams() {
  const [params, setParams] = useSearchParams();

  const page = parseInt(params.get("page") ?? "1", 10);
  const search = params.get("search") ?? "";
  const sortBy = params.get("sort") ?? "";
  const sortDir = params.get("dir") ?? "desc";

  const set = useCallback(
    (updates) =>
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([k, v]) => {
          if (v === "" || v == null) next.delete(k);
          else next.set(k, String(v));
        });
        if ("search" in updates || "sort" in updates) next.set("page", "1");
        return next;
      }),
    [setParams],
  );

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

export function useDataTable({ endpoint, dataKey, onView, onEdit, onDelete }) {
  const { page, search: searchParam, sortBy, sortDir, set } = useTableParams();

  const [inputValue, setInputValue] = useState(searchParam);
  const debouncedSearch = useDebounce(inputValue, 400);

  // Keep a stable ref to `set` so the debounce effect never has a stale closure
  const setRef = useRef(set);
  useEffect(() => {
    setRef.current = set;
  });

  useEffect(() => {
    if (debouncedSearch === searchParam) return; // already in sync, do nothing
    setRef.current({ search: debouncedSearch });
  }, [debouncedSearch, searchParam]);

  const search = searchParam;
  const [state, dispatch] = useReducer(reducer, makeInitialState(dataKey));

  // fetch receives params directly — no more reliance on a ref that may lag behind
  const fetch = useCallback(
    async ({ page, search, sortBy, sortDir } = {}) => {
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
            [dataKey]: p.submissions?.data ?? p.data ?? [],
            currentPage: p.submissions?.current_page ?? p.current_page ?? 1,
            lastPage: p.submissions?.last_page ?? p.last_page ?? 1,
            total: p.submissions?.total ?? p.total ?? 0,
            perPage: p.submissions?.per_page ?? p.per_page ?? 20,
            stats: p.stats ?? null,
          },
        });
      } catch (err) {
        console.error(`[useDataTable] Failed to fetch ${endpoint}:`, err);
        dispatch({ type: "ERROR" });
      }
    },
    [endpoint, dataKey],
  );

  // Re-fetch whenever any URL param changes, passing them directly into fetch
  useEffect(() => {
    fetch({ page, search, sortBy, sortDir });
  }, [page, search, sortBy, sortDir, fetch]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleView = useCallback(
    async (row) => {
      await onView?.(row, { dispatch, state, fetch });
    },
    [onView, state, fetch],
  );

  const handleEdit = useCallback(
    async (row) => {
      await onEdit?.(row, { dispatch, state, fetch });
    },
    [onEdit, state, fetch],
  );

  const handleDelete = useCallback(
    async (row) => {
      if (onDelete) {
        await onDelete(row, { dispatch, state, fetch, page, set });
      } else {
        try {
          await api.delete(`${endpoint}/${row.id}`);
          const rows = state[dataKey] ?? [];
          const nextPage = rows.length === 1 && page > 1 ? page - 1 : page;
          set({ page: nextPage });
          if (nextPage === page) fetch({ page, search, sortBy, sortDir });
        } catch (err) {
          console.error(`[useDataTable] Failed to delete:`, err);
        }
      }
    },
    [
      onDelete,
      state,
      page,
      search,
      sortBy,
      sortDir,
      set,
      fetch,
      endpoint,
      dataKey,
    ],
  );

  return {
    state,
    inputValue,
    setInputValue,
    fetch: () => fetch({ page, search, sortBy, sortDir }), // public API stays zero-arg
    handleView,
    handleEdit,
    handleDelete,
    onPageChange: (p) => set({ page: p }),
  };
}
