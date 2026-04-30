import { useState, useEffect, useRef } from "react";
import { apiGetUsers, getStoredUser, logout } from "../api/auth";
import "./AdminPanel.css";

// ─── SVG Icons ───────────────────────────────────────────
const Icons = {
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Luggage: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="7" width="12" height="14" rx="2" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  Sprout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 1 1.4 4c-1.7.2-3.1 0-4.2-.7-1-.6-1.9-1.7-2.5-3.7 2.4-.4 4 0 5.3.7z" />
    </svg>
  ),
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  LogOut: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Clipboard: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  CheckCircle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

// ─── Helpers ─────────────────────────────────────────────
const avatar = (name = "", bg) => {
  const initials = name
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return { initials, bg: bg || "#C8623A" };
};

const AVATAR_COLORS = [
  "#C8623A", "#3A7CA5", "#5C7A5E", "#C8A03A",
  "#9B59B6", "#E07A52", "#5A9EC5", "#7A9E7C",
];

const roleMeta = {
  admin: { label: "Admin", bg: "rgba(200,98,58,0.12)", color: "#C8623A" },
  user: { label: "User", bg: "rgba(58,124,165,0.12)", color: "#3A7CA5" },
};

const statusMeta = (createdAt) => {
  const days = Math.floor((Date.now() - new Date(createdAt)) / 86400000);
  if (days <= 7) return { label: "New", bg: "rgba(92,122,94,0.12)", color: "#5C7A5E" };
  if (days <= 30) return { label: "Recent", bg: "rgba(58,124,165,0.12)", color: "#3A7CA5" };
  return { label: "Active", bg: "rgba(200,98,58,0.12)", color: "#C8623A" };
};

// ─── Toast ─────────────────────────────────────────────
function Toast({ msg }) {
  return (
    <div className={`toast ${msg ? "show" : ""}`}>
      <Icons.CheckCircle />
      {msg}
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = "#C8623A" }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-sub">{sub}</div>
      <div className="stat-value" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

// ─── User Row ─────────────────────────────────────────
function UserRow({ user, index, onToast, onRoleChange }) {
  const av = avatar(user.name, AVATAR_COLORS[index % AVATAR_COLORS.length]);
  const role = roleMeta[user.role] || roleMeta.user;
  const status = statusMeta(user.createdAt);

  const joined = new Date(user.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="user-row">
      <div
        className="avatar"
        style={{
          background: `linear-gradient(135deg,${av.bg},${av.bg}cc)`,
        }}
      >
        {av.initials}
      </div>

      <div className="user-info">
        <div className="user-name">{user.name}</div>
        <div className="user-email">{user.email}</div>
      </div>

      <span
        className="badge"
        style={{ background: role.bg, color: role.color }}
      >
        {role.label}
      </span>

      <span
        className="badge"
        style={{ background: status.bg, color: status.color }}
      >
        {status.label}
      </span>

      <div className="joined">{joined}</div>

      <button
        className="btn"
        onClick={() => onToast(`Copied ${user.email}`)}
      >
        <Icons.Clipboard />
        Copy email
      </button>

      <button
        className="btn"
        onClick={() => onRoleChange(user._id, user.role === "admin" ? "user" : "admin")}
      >
        <Icons.Shield />
        {user.role === "admin" ? "Demote" : "Make Admin"}
      </button>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────
export default function AdminPanel({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [ddOpen, setDdOpen] = useState(false);
  const [toast, setToast] = useState("");

  const toastTimer = useRef(null);
  const ddRef = useRef(null);
  const currentUser = getStoredUser();

  useEffect(() => {
    apiGetUsers()
      .then(data => setUsers(data.users))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) {
        setDdOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2800);
  };

  const handleLogout = () => {
    logout();
    showToast("Logged out");
    setTimeout(() => onClose?.(), 800);
  };

  const handleRoleChange = (id, newRole) => {
    // implement role change API call here
    showToast(`Role updated`);
  };

  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === "all" || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  const totalAdmins = users.filter(u => u.role === "admin").length;
  const totalUsers = users.filter(u => u.role === "user").length;

  const newThisWeek = users.filter(u => {
    const days = Math.floor((Date.now() - new Date(u.createdAt)) / 86400000);
    return days <= 7;
  }).length;

  return (
    <div className="admin-panel">

      {/* NAV */}
      <nav className="admin-nav">
        <div className="admin-logo">
          Travel<span style={{ color: "#3A7CA5", fontStyle: "italic" }}>ogue</span>
          <span className="admin-badge">ADMIN</span>
        </div>

        <div className="nav-right">
          {onClose && (
            <button className="btn" onClick={onClose}>
              <Icons.ArrowLeft />
              Back to app
            </button>
          )}

          <div className="user-dd" ref={ddRef}>
            <div onClick={() => setDdOpen(o => !o)} className="user-trigger">
              <div className="user-meta">
                <div>{currentUser?.name || "Admin"}</div>
                <div className="small">Admin</div>
              </div>

              <div className="avatar-small">
                {currentUser?.name?.[0]?.toUpperCase() || "A"}
              </div>
            </div>

            {ddOpen && (
              <div className="dropdown">
                <div className="dropdown-header">
                  <div>{currentUser?.name}</div>
                  <div className="small">{currentUser?.email}</div>
                </div>

                <div className="dropdown-item" onClick={() => showToast("Refreshing users…")}>
                  <Icons.Refresh />
                  Refresh data
                </div>

                <div className="dropdown-divider" />

                <div className="dropdown-item danger" onClick={handleLogout}>
                  <Icons.LogOut />
                  Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* BODY */}
      <div className="admin-body">

        {/* HEADER */}
        <div className="header">
          <div className="pill">
            <Icons.Shield />
            Admin Panel
          </div>

          <h1>
            Manage your <em>community</em>.
          </h1>

          <p>
            {users.length} users · {totalAdmins} admins · {newThisWeek} new this week
          </p>
        </div>

        {/* STATS */}
        <div className="stats">
          <StatCard icon={<Icons.Users />} label="Total Users" value={users.length} sub="All accounts" />
          <StatCard icon={<Icons.Shield />} label="Admins" value={totalAdmins} sub="Admin users" />
          <StatCard icon={<Icons.Luggage />} label="Users" value={totalUsers} sub="Regular users" />
          <StatCard icon={<Icons.Sprout />} label="New" value={newThisWeek} sub="Last 7 days" />
        </div>

        {/* SEARCH */}
        <div className="controls">
          <input
            className="input"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {["all", "user", "admin"].map(r => (
            <button
              key={r}
              className={`filter-btn ${roleFilter === r ? "active" : ""}`}
              onClick={() => setRoleFilter(r)}
            >
              {r}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="table">
          <div className="table-header">
            <div>Member</div>
            <div>Role</div>
            <div>Status</div>
            <div>Joined</div>
            <div />
          </div>

          {loading && <div className="center">Loading users...</div>}
          {error && <div className="error">{error}</div>}

          {!loading &&
            !error &&
            filtered.map((user, i) => (
              <UserRow
                key={user._id}
                user={user}
                index={i}
                onToast={showToast}
                onRoleChange={handleRoleChange}
              />
            ))}
        </div>

      </div>

      <Toast msg={toast} />
    </div>
  );
}