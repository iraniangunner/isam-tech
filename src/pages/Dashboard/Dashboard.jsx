import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
// import "./Dashboard.css";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get("/admin/contact");
      setMessages(response.data.data.data || []);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          🛡️ <span>Admin Panel</span>
        </div>
        <div className="nav-right">
          <span className="nav-user">
            Welcome, <strong>{user?.name}</strong>
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="dashboard-content">
        <h1 className="dashboard-title">Contact Messages</h1>
        <p className="dashboard-subtitle">
          All messages submitted through the contact form
        </p>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Messages</div>
            <div className="stat-value">{messages.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Unread</div>
            <div className="stat-value">
              {messages.filter((m) => m.status === "unread").length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Read</div>
            <div className="stat-value">
              {messages.filter((m) => m.status === "read").length}
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="messages-card">
          <div className="messages-card-header">📬 All Messages</div>

          {loading ? (
            <div className="table-loading">
              <div className="spinner"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: "48px" }}>📭</div>
              <p>No messages yet</p>
            </div>
          ) : (
            <table className="messages-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.id}>
                    <td>
                      <div className="message-name">{message.name}</div>
                      <div className="message-email">{message.email}</div>
                    </td>
                    <td>
                      <div className="message-text">{message.message}</div>
                    </td>
                    <td>
                      <span className={`status-badge status-${message.status}`}>
                        {message.status}
                      </span>
                    </td>
                    <td>
                      <div className="message-date">
                        {formatDate(message.created_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
