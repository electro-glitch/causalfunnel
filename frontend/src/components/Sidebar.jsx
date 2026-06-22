import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">📊</div>
        <span className="sidebar-brand-text">Analytics</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <span className="sidebar-link-icon">👥</span>
          Sessions
        </NavLink>
        <NavLink
          to="/heatmap"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <span className="sidebar-link-icon">🔥</span>
          Heatmap
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer-text">
          <span className="status-dot live"></span>
          Live tracking enabled
        </p>
      </div>
    </aside>
  );
}
