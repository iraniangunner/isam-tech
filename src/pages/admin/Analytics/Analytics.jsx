import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, Eye, TrendingUp, Calendar, RefreshCw } from "lucide-react";
import api from "../../../api/axios";
import "./Analytics.css";

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent }) => (
  <div className={`an-stat accent-${accent}`}>
    <div className="an-stat__icon">{icon}</div>
    <div className="an-stat__body">
      <div className="an-stat__value">{value ?? "—"}</div>
      <div className="an-stat__label">{label}</div>
    </div>
  </div>
);

// ── Custom tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="an-tooltip">
      <p className="an-tooltip__label">{label}</p>
      <p className="an-tooltip__value">{payload[0].value} visits</p>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const Analytics = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async (d = days) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/analytics?days=${d}`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]); // eslint-disable-line

  const handleRange = (d) => {
    setDays(d);
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar__left">
          <h1 className="topbar__title">Analytics</h1>
          <p className="topbar__subtitle">Site visit statistics</p>
        </div>
        <div className="an-controls">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              className={`an-range-btn ${
                days === d ? "an-range-btn--active" : ""
              }`}
              onClick={() => handleRange(d)}
            >
              {d}d
            </button>
          ))}
          <button
            className="an-refresh-btn"
            onClick={() => fetchData()}
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "an-spin" : ""} />
          </button>
        </div>
      </header>

      <main className="content">
        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <div className="an-stats">
          <StatCard
            label="Total Visits"
            value={data?.summary.total.toLocaleString()}
            icon={<Eye size={20} />}
            accent="blue"
          />
          <StatCard
            label="Today"
            value={data?.summary.today.toLocaleString()}
            icon={<Calendar size={20} />}
            accent="purple"
          />
          <StatCard
            label="Unique Visitors"
            value={data?.summary.unique.toLocaleString()}
            icon={<Users size={20} />}
            accent="green"
          />
          <StatCard
            label="Avg / Day"
            value={data?.summary.avg_day}
            icon={<TrendingUp size={20} />}
            accent="amber"
          />
        </div>

        {/* ── Line chart — daily visits ────────────────────────────────────── */}
        <div className="an-card">
          <div className="an-card__header">
            <h2>Daily Visits</h2>
            <span className="an-card__sub">Last {days} days</span>
          </div>
          <div className="an-card__body">
            {loading ? (
              <div className="an-loading">Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={data?.daily_visits}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border, #e8eaed)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "var(--text-muted, #9ca3af)" }}
                    tickLine={false}
                    axisLine={false}
                    interval={days === 7 ? 0 : days === 30 ? 4 : 9}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--text-muted, #9ca3af)" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#6366f1" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Bar chart — top pages ────────────────────────────────────────── */}
        <div className="an-card">
          <div className="an-card__header">
            <h2>Top Pages</h2>
            <span className="an-card__sub">Last {days} days</span>
          </div>
          <div className="an-card__body">
            {loading ? (
              <div className="an-loading">Loading…</div>
            ) : !data?.top_pages?.length ? (
              <div className="an-loading">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={data?.top_pages}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border, #e8eaed)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "var(--text-muted, #9ca3af)" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="page"
                    tick={{ fontSize: 11, fill: "var(--text-muted, #9ca3af)" }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Analytics;
