import { useState, useRef, useEffect } from "react";
import "./Sidebar.css";

const Sidebar = ({
  navItems = [],
  activeId,
  onNavChange,
  brand = { name: "AdminKit", mark: "A" },
  user = { name: "Admin", role: "Administrator" },
  onLogout,
  open = true,
  onToggle,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) setMenuOpen(false);
  }, [open]);

  return (
    <aside
      className={`sidebar ${open ? "sidebar--open" : "sidebar--collapsed"}`}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="sidebar__header">
        {open ? (
          <>
            <div className="sidebar__brand-mark">{brand.mark}</div>
            <span className="sidebar__brand-name">{brand.name}</span>
            <button
              className="sidebar__toggle"
              onClick={onToggle}
              title="Collapse"
            >
              <span />
              <span />
              <span />
            </button>
          </>
        ) : (
          <button
            className="sidebar__toggle sidebar__toggle--centered"
            onClick={onToggle}
            title="Expand"
          >
            <span />
            <span />
            <span />
          </button>
        )}
      </div>

      {/* ── Nav ────────────────────────────────────────────── */}
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${
              activeId === item.id ? "sidebar__nav-item--active" : ""
            }`}
            onClick={() => onNavChange?.(item.id)}
            title={!open ? item.label : undefined}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            {open && <span className="sidebar__nav-label">{item.label}</span>}
            {open && item.badge > 0 && (
              <span className="sidebar__nav-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="sidebar__footer" ref={menuRef}>
        {/* COLLAPSED: avatar triggers a right-flyout popover */}
        {!open && menuOpen && (
          <div className="sidebar__menu">
            <div className="sidebar__menu-header">
              <div className="sidebar__menu-avatar">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="sidebar__menu-name">{user.name}</div>
                <div className="sidebar__menu-role">{user.role}</div>
              </div>
            </div>
            <div className="sidebar__menu-divider" />
            <button
              className="sidebar__menu-item sidebar__menu-item--danger"
              onClick={() => {
                setMenuOpen(false);
                onLogout?.();
              }}
            >
              <span className="sidebar__menu-item-icon">⎋</span>
              Sign out
            </button>
          </div>
        )}

        {/* OPEN: user chip + sign out button, no popover */}
        {open ? (
          <>
            <div className="sidebar__user-chip">
              <div className="sidebar__user-avatar">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="sidebar__user-info">
                <div className="sidebar__user-name">{user.name}</div>
                <div className="sidebar__user-role">{user.role}</div>
              </div>
            </div>
            <button className="sidebar__logout-btn" onClick={onLogout}>
              Sign out
            </button>
          </>
        ) : (
          /* COLLAPSED: just the avatar as trigger */
          <button
            className={`sidebar__user-chip sidebar__user-chip--btn ${
              menuOpen ? "sidebar__user-chip--active" : ""
            }`}
            onClick={() => setMenuOpen((v) => !v)}
            title={user.name}
          >
            <div className="sidebar__user-avatar">
              {user.name?.[0]?.toUpperCase()}
            </div>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
