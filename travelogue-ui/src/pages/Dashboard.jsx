import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { apiGetTrips, apiCreateTrip, apiDeleteTrip } from "../api/trips";
import "./Dashboard.css";

// ─── SVG Icons ────────────────────────────────────────────────────────
const Icons = {
  back: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  billing: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  plane: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13"/>
      <path d="M22 2L15 22l-4-9-9-4 22-7z"/>
    </svg>
  ),
  map: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  ),
  clock: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  plus: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  wallet: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
      <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
      <circle cx="17" cy="13" r="1.5" fill="currentColor"/>
    </svg>
  ),
  receipt: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 0 0-2-2z"/>
      <line x1="8" y1="9" x2="16" y2="9"/>
      <line x1="8" y1="13" x2="14" y2="13"/>
    </svg>
  ),
  wave: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M7 11.5C7 9 9 7 11.5 7S16 9 16 11.5c0 2-1.5 3.5-3.5 4.5"/>
      <path d="M5 18c1-1 2-1.5 3-1.5s2 .5 3 1.5 2 1.5 3 1.5"/>
    </svg>
  ),
  sparkle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  invite: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  calendar: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  chevLeft: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  chevRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  close: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  lock: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  trash: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  arrowRight: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  mountain: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3L1 21h22L15 3z"/>
      <path d="M12 8l-3 7h6l-3-7z" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  ocean: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M2 12c2-4 6-4 8 0s6 4 8 0"/>
      <path d="M2 17c2-4 6-4 8 0s6 4 8 0"/>
      <path d="M2 7c2-4 6-4 8 0s6 4 8 0"/>
    </svg>
  ),
  temple: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20M6 20V10M18 20V10M12 20V4M4 10h16M9 4h6"/>
    </svg>
  ),
  backpack: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2h6a2 2 0 0 1 2 2v1H7V4a2 2 0 0 1 2-2z"/>
      <path d="M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>
      <path d="M9 12h6M12 9v6"/>
    </svg>
  ),
  sunrise: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 18a5 5 0 0 0-10 0"/>
      <line x1="12" y1="2" x2="12" y2="9"/>
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
      <line x1="1" y1="18" x2="3" y2="18"/>
      <line x1="21" y1="18" x2="23" y2="18"/>
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
      <line x1="23" y1="22" x2="1" y2="22"/>
      <polyline points="8 6 12 2 16 6"/>
    </svg>
  ),
  desert: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18c3-6 5-6 6-6 1.5 0 2 2 3 2s2-2 3.5-2c1 0 3 2 5.5 6"/>
      <circle cx="18" cy="6" r="3"/>
      <line x1="18" y1="1" x2="18" y2="3"/>
      <line x1="23" y1="6" x2="21" y2="6"/>
    </svg>
  ),
  city: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l4-4 4 4 4-4 4 4v12H3z"/>
      <path d="M9 22V12h6v10"/>
    </svg>
  ),
  camera: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  shield: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  alertCircle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  zap: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
};

// ─── Helpers ──────────────────────────────────────────────────────────
function getBillingStatus(user) {
  const now      = new Date();
  const trialEnd = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
  const daysLeft = trialEnd
    ? Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))
    : null;

  if (user?.plan === "premium" && user?.subscriptionStatus === "active")
    return { type: "premium", nextBillingDate: user?.nextBillingDate || null };
  if (user?.plan === "trial")
    return { type: "trial", daysLeft: Math.max(0, daysLeft ?? 14) };
  if (user?.subscriptionStatus === "expired")  return { type: "expired" };
  if (user?.subscriptionStatus === "cancelled") return { type: "cancelled" };
  return { type: "free" };
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function tripDuration(start, end) {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  const days = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? `${days} day${days !== 1 ? "s" : ""}` : null;
}

// ─── Vibe options ─────────────────────────────────────────────────────
const VIBES = [
  { id: "sunrise",  label: "Sunrise",  icon: "sunrise"  },
  { id: "ocean",    label: "Ocean",    icon: "ocean"    },
  { id: "mountain", label: "Mountain", icon: "mountain" },
  { id: "temple",   label: "Temple",   icon: "temple"   },
  { id: "backpack", label: "Backpack", icon: "backpack" },
  { id: "plane",    label: "Journey",  icon: "plane"    },
  { id: "desert",   label: "Desert",   icon: "desert"   },
  { id: "camera",   label: "Explorer", icon: "camera"   },
];

// ─── Custom Calendar ──────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function CalendarPicker({ value, onChange, minDate, label }) {
  const [open,      setOpen]      = useState(false);
  const [flipUp,    setFlipUp]    = useState(false);
  const [viewYear,  setViewYear]  = useState(() => {
    const d = value ? new Date(value + "T00:00:00") : new Date();
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = value ? new Date(value + "T00:00:00") : new Date();
    return d.getMonth();
  });
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const today = new Date(); today.setHours(0,0,0,0);
  const min   = minDate ? new Date(minDate + "T00:00:00") : null;

  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function firstDay(y, m)    { return new Date(y, m, 1).getDay(); }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }
  function selectDay(day) {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  }
  function isSelected(day) {
    if (!value) return false;
    const sel = new Date(value + "T00:00:00");
    return sel.getFullYear() === viewYear && sel.getMonth() === viewMonth && sel.getDate() === day;
  }
  function isDisabled(day) {
    const d = new Date(viewYear, viewMonth, day);
    return min ? d < min : false;
  }

  const displayVal = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";

  const total    = daysInMonth(viewYear, viewMonth);
  const startDay = firstDay(viewYear, viewMonth);
  const cells    = Array(startDay).fill(null).concat(Array.from({ length: total }, (_, i) => i + 1));

  return (
    <div className="cal-wrap" ref={ref}>
      <label className="db-fl">{label}</label>
      <button
        type="button"
        className={`cal-trigger ${open ? "cal-trigger--open" : ""}`}
        onClick={() => {
          if (!open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setFlipUp(rect.bottom + 340 > window.innerHeight);
          }
          setOpen(o => !o);
        }}
      >
        <span className="cal-icon">{Icons.calendar}</span>
        <span className="cal-val">{displayVal || <span className="cal-placeholder">Select date</span>}</span>
        <span className="cal-chevron" style={{ transform: open ? "rotate(180deg)" : "none" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>
      {open && (
        <div className={`cal-popup${flipUp ? " cal-popup--up" : ""}`}>
          <div className="cal-header">
            <button type="button" className="cal-nav" onClick={prevMonth}>{Icons.chevLeft}</button>
            <div className="cal-month-label">{MONTHS[viewMonth]} <span>{viewYear}</span></div>
            <button type="button" className="cal-nav" onClick={nextMonth}>{Icons.chevRight}</button>
          </div>
          <div className="cal-grid cal-daynames">
            {DAYS.map(d => <div key={d} className="cal-dayname">{d}</div>)}
          </div>
          <div className="cal-grid cal-cells">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const sel = isSelected(day);
              const dis = isDisabled(day);
              const tod = new Date(viewYear, viewMonth, day).toDateString() === today.toDateString();
              return (
                <button
                  key={day}
                  type="button"
                  disabled={dis}
                  className={`cal-day ${sel ? "cal-day--sel" : ""} ${tod && !sel ? "cal-day--today" : ""} ${dis ? "cal-day--dis" : ""}`}
                  onClick={() => !dis && selectDay(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {value && (
            <div className="cal-footer">
              <button type="button" className="cal-clear" onClick={() => { onChange(""); setOpen(false); }}>
                Clear date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────
function DeleteModal({ trip, onClose, onConfirm, loading }) {
  return (
    <div className="db-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="db-modal" style={{ maxWidth: 380 }}>
        <div className="db-modal-top">
          <div>
            <h2>Delete trip?</h2>
            <p>This cannot be undone</p>
          </div>
          <button className="db-modal-x" onClick={onClose}>{Icons.close}</button>
        </div>
        <div className="db-modal-body">
          <p style={{ fontSize: "0.88rem", color: "var(--text-light)", lineHeight: 1.7, marginBottom: 20 }}>
            Are you sure you want to delete <strong style={{ color: "var(--warm-dark)" }}>{trip.name}</strong>?
            All activities, expenses, votes, and messages will be permanently removed.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              className="db-btn-main"
              style={{ background: "#C44", borderColor: "#C44" }}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Deleting…" : "Yes, delete trip"}
            </button>
            <button className="db-btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Upsell Modal ─────────────────────────────────────────────────────
function UpsellModal({ onClose, onUpgrade }) {
  const perks = [
    "Unlimited trips — no cap, ever",
    "Live budget splitter & settlements",
    "Anonymous group voting",
    "Clean PDF export (no watermark)",
    "Priority support",
  ];
  return (
    <div className="db-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="db-modal" style={{ maxWidth: 440 }}>
        <div className="db-modal-top">
          <div>
            <h2>You've hit the Free limit</h2>
            <p>Upgrade to keep planning more trips</p>
          </div>
          <button className="db-modal-x" onClick={onClose}>{Icons.close}</button>
        </div>
        <div className="db-modal-body">
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg,#F5D4C4,#EDE0C4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#C8623A", margin: "0 auto 20px",
          }}>
            {Icons.lock}
          </div>
          <p style={{ textAlign: "center", fontSize: "0.88rem", color: "var(--text-light)", lineHeight: 1.7, marginBottom: 24 }}>
            The <strong style={{ color: "var(--warm-dark)" }}>Free plan</strong> includes{" "}
            <strong style={{ color: "var(--warm-dark)" }}>1 active trip</strong>. Upgrade to{" "}
            <strong style={{ color: "var(--terracotta)" }}>Premium</strong> to unlock everything.
          </p>
          <div style={{
            background: "var(--sand-light)", borderRadius: 14,
            padding: "16px 20px", marginBottom: 24,
            border: "1px solid var(--sand)",
          }}>
            {perks.map(p => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: "var(--green-pale)", color: "var(--green)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {Icons.check}
                </div>
                <span style={{ fontSize: "0.84rem", color: "var(--text)" }}>{p}</span>
              </div>
            ))}
          </div>
          <div style={{
            background: "linear-gradient(135deg,var(--warm-dark),#3D2210)",
            borderRadius: 14, padding: "16px 20px", marginBottom: 20,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                Premium Plan
              </div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 700, color: "white", lineHeight: 1 }}>
                14.99 <span style={{ fontSize: "0.9rem", fontWeight: 400 }}>AED/mo</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                14-day free trial · cancel any time
              </div>
            </div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, padding: "4px 12px", borderRadius: 50, background: "rgba(200,98,58,0.3)", color: "#E07A52", border: "1px solid rgba(200,98,58,0.4)" }}>
              Most Popular
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="db-btn-main" onClick={onUpgrade}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {Icons.sparkle} Start Free 14-Day Trial
              </span>
            </button>
            <button className="db-btn-ghost" onClick={onClose}>Maybe later</button>
          </div>
          <p style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--text-light)", marginTop: 12 }}>
            No card charged until trial ends · Cancel any time
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── New Trip Modal ───────────────────────────────────────────────────
function NewTripModal({ onClose, onCreated }) {
  const [name,    setName]    = useState("");
  const [vibe,    setVibe]    = useState("sunrise");
  const [start,   setStart]   = useState("");
  const [end,     setEnd]     = useState("");
  const [dest,    setDest]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleCreate() {
    if (!name.trim()) { setError("Trip name is required."); return; }
    setError("");
    setLoading(true);
    try {
      await onCreated({ name: name.trim(), vibe, start, end, dest });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create trip.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="db-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="db-modal">
        <div className="db-modal-top">
          <div>
            <h2>Plan a New Trip</h2>
            <p>Create your notebook and invite your group</p>
          </div>
          <button className="db-modal-x" onClick={onClose}>{Icons.close}</button>
        </div>
        <div className="db-modal-body">
          <div className="db-field">
            <label className="db-fl">Trip name</label>
            <input
              className="db-fi"
              type="text"
              placeholder="e.g. Thailand Adventure"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            {error && <div className="db-field-err">{error}</div>}
          </div>
          <div className="db-field">
            <label className="db-fl">Vibe</label>
            <div className="db-vibe-row">
              {VIBES.map(v => (
                <button
                  key={v.id}
                  type="button"
                  className={`db-vibe-btn ${vibe === v.id ? "db-vibe-btn--sel" : ""}`}
                  onClick={() => setVibe(v.id)}
                  title={v.label}
                >
                  {Icons[v.icon]}
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="db-dr">
            <CalendarPicker label="Start date" value={start} onChange={setStart} />
            <CalendarPicker label="End date"   value={end}   onChange={setEnd} minDate={start || undefined} />
          </div>
          <div className="db-field">
            <label className="db-fl">Destination</label>
            <input
              className="db-fi"
              type="text"
              placeholder="e.g. Bangkok, Thailand"
              value={dest}
              onChange={e => setDest(e.target.value)}
            />
          </div>
        </div>
        <div className="db-modal-foot">
          <button className="db-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="db-btn-main" onClick={handleCreate} disabled={loading}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {Icons.plane} {loading ? "Creating…" : "Create & Share Link"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Billing Sheet ────────────────────────────────────────────────────
function BillingSheet({ onClose, user, onUpgrade }) {
  const billing = getBillingStatus(user);

  const statusConfig = {
    premium:   { color: "#5C7A5E", bg: "linear-gradient(135deg,#D4E8D4,#EDE0C4)", label: "Premium · Active",                                          icon: Icons.shield },
    trial:     { color: "#C8623A", bg: "linear-gradient(135deg,#F5D4C4,#EDE0C4)", label: `Trial · ${billing.daysLeft} day${billing.daysLeft !== 1 ? "s" : ""} left`, icon: Icons.zap },
    expired:   { color: "#C44",    bg: "linear-gradient(135deg,#fde8e8,#fdf0e0)", label: "Trial Expired",                                              icon: Icons.alertCircle },
    cancelled: { color: "#999",    bg: "#f5f0e8",                                 label: "Cancelled",                                                   icon: Icons.alertCircle },
    free:      { color: "#888",    bg: "#f5f0e8",                                 label: "Free Plan",                                                   icon: Icons.lock },
  };
  const cfg = statusConfig[billing.type] || statusConfig.free;

  return (
    <>
      <div className="db-sheet-bg" onClick={onClose} />
      <div className="db-sheet">
        <div className="db-sh-handle" />
        <div className="db-sh-head">
          <div className="db-sh-title">Billing & Plan</div>
          <button className="db-sh-close" onClick={onClose}>{Icons.close}</button>
        </div>
        <div className="db-sh-body">
          <div style={{ background: cfg.bg, borderRadius: 14, padding: "18px 20px", marginBottom: 20, border: `1.5px solid ${cfg.color}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ color: cfg.color, display: "flex" }}>{cfg.icon}</span>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: cfg.color }}>{cfg.label}</span>
            </div>
            {billing.type === "premium" && (
              <div style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>
                Next billing date: <strong style={{ color: "var(--text)" }}>{formatDate(billing.nextBillingDate)}</strong>
              </div>
            )}
            {billing.type === "trial" && (
              <>
                <div style={{ fontSize: "0.78rem", color: "var(--text-light)", marginBottom: 10 }}>
                  Trial ends <strong style={{ color: "var(--text)" }}>{formatDate(user?.trialEndsAt)}</strong> · then 14.99 AED/mo
                </div>
                <div style={{ background: "rgba(0,0,0,0.08)", borderRadius: 99, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.max(5, ((14 - billing.daysLeft) / 14) * 100)}%`, background: "#C8623A", borderRadius: 99, transition: "width 0.4s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-light)", marginTop: 4 }}>
                  <span>Day 1</span>
                  <span>{billing.daysLeft} day{billing.daysLeft !== 1 ? "s" : ""} remaining</span>
                  <span>Day 14</span>
                </div>
              </>
            )}
            {billing.type === "expired"   && <div style={{ fontSize: "0.78rem", color: "#C44",               marginTop: 4 }}>Your trial has ended. Upgrade to regain full access.</div>}
            {billing.type === "cancelled" && <div style={{ fontSize: "0.78rem", color: "var(--text-light)", marginTop: 4 }}>Your subscription was cancelled. Reactivate any time.</div>}
            {billing.type === "free"      && <div style={{ fontSize: "0.78rem", color: "var(--text-light)", marginTop: 4 }}>1 active trip included. Upgrade for unlimited trips.</div>}
          </div>

          {billing.type !== "premium" && (
            <div style={{ background: "linear-gradient(135deg,var(--warm-dark),#3D2210)", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
                {billing.type === "expired" || billing.type === "cancelled" ? "Reactivate" : "Premium Plan"}
              </div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 700, color: "white", lineHeight: 1, marginBottom: 4 }}>
                14.99 <span style={{ fontSize: "0.85rem", fontWeight: 400 }}>AED/mo</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
                {billing.type === "trial" ? "Card charged when trial ends" : "14-day free trial · cancel any time"}
              </div>
              <button className="db-btn-main" style={{ width: "100%" }} onClick={onUpgrade}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {Icons.sparkle}{" "}
                  {billing.type === "expired" || billing.type === "cancelled" ? "Reactivate Premium" : billing.type === "trial" ? "Keep Premium After Trial" : "Upgrade to Premium"}
                </span>
              </button>
            </div>
          )}

          {billing.type === "premium" && (
            <div style={{ background: "var(--sand-light)", borderRadius: 14, padding: "16px 20px", marginBottom: 20, border: "1px solid var(--sand)" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-light)", marginBottom: 12 }}>Your Plan Includes</div>
              {["Unlimited trips", "Live budget splitter", "Anonymous group voting", "Clean PDF export", "Priority support"].map(p => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--green-pale)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Icons.check}</div>
                  <span style={{ fontSize: "0.82rem", color: "var(--text)" }}>{p}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 8 }}>
            {billing.type === "premium" && <a href="#" style={{ fontSize: "0.75rem", color: "#C44", textDecoration: "none" }} onClick={e => e.preventDefault()}>Cancel subscription</a>}
            {billing.type === "trial"   && <a href="#" style={{ fontSize: "0.75rem", color: "var(--text-light)", textDecoration: "none" }} onClick={e => e.preventDefault()}>Cancel trial</a>}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Settings Sheet ───────────────────────────────────────────────────
function SettingsSheet({ onClose, user, isPremium }) {
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName,  setLastName]  = useState(user?.name?.split(" ").slice(1).join(" ") || "");
  const [email,     setEmail]     = useState(user?.email || "");
  const [notifs,    setNotifs]    = useState({ activity: true, votes: true, settlement: true, marketing: false });

  return (
    <>
      <div className="db-sheet-bg" onClick={onClose} />
      <div className="db-sheet">
        <div className="db-sh-handle" />
        <div className="db-sh-head">
          <div className="db-sh-title">Account Settings</div>
          <button className="db-sh-close" onClick={onClose}>{Icons.close}</button>
        </div>
        <div className="db-sh-body">
          <div style={{ marginBottom: 18 }}>
            <label className="db-fl">First name</label>
            <input className="db-si" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <label className="db-fl" style={{ marginTop: 10 }}>Last name</label>
            <input className="db-si" type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
            <label className="db-fl" style={{ marginTop: 10 }}>Email</label>
            <input className="db-si" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="db-notif-label">Notifications</div>
          {[
            { key: "activity",   label: "Trip activity",        sub: "Edits and updates from group members" },
            { key: "votes",      label: "New votes & invites",  sub: "Polls and trip invitations" },
            { key: "settlement", label: "Settlement reminders", sub: "Nudges to settle up after trips" },
            { key: "marketing",  label: "Marketing emails",     sub: "Tips and travel inspiration" },
          ].map(n => (
            <div key={n.key} className="db-sr">
              <div className="db-sr-l">
                <div className="db-sr-label">{n.label}</div>
                <div className="db-sr-sub">{n.sub}</div>
              </div>
              <button className={`db-tog${notifs[n.key] ? " on" : ""}`} onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))} />
            </div>
          ))}
          {!isPremium && (
            <div className="db-up-card">
              <div className="db-up-t">
                <div className="db-up-title"><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{Icons.sparkle} Upgrade to Premium</span></div>
                <div className="db-up-sub">Unlimited trips, budget splitter &amp; more</div>
              </div>
              <button className="db-up-btn">14.99 AED/mo</button>
            </div>
          )}
          <button className="db-save-btn" onClick={onClose}>Save Changes</button>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <a href="#" style={{ fontSize: "0.73rem", color: "#C44", textDecoration: "none" }} onClick={e => e.preventDefault()}>Delete account</a>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────
function Toast({ msg }) {
  return <div className={`db-toast${msg ? " show" : ""}`}>{msg}</div>;
}

// ─── Trip Card ────────────────────────────────────────────────────────
const TRIP_COLORS = {
  Planning:  { border: "#5C7A5E", bg: "linear-gradient(135deg,#D4E8D4,#EDE0C4)", statusClass: "s-pl" },
  Active:    { border: "#C8623A", bg: "linear-gradient(135deg,#F5D4C4,#EDE0C4)", statusClass: "s-ac" },
  Upcoming:  { border: "#3A7CA5", bg: "linear-gradient(135deg,#C4DCF0,#D4E8D4)", statusClass: "s-up" },
  Completed: { border: "#b0a090", bg: "#F5EDD8",                                  statusClass: "s-pa" },
};

function TripCard({ trip, onDelete, onToast }) {
  const navigate   = useNavigate();
  const colors     = TRIP_COLORS[trip.status] || TRIP_COLORS.Planning;
  const vibeIcon   = VIBES.find(v => v.id === trip.vibe)?.icon || "plane";
  const duration   = tripDuration(trip.startDate, trip.endDate);

  const dates = trip.startDate && trip.endDate
    ? `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`
    : "Dates TBD";

  function handleOpen(e) {
    // don't navigate if delete button was clicked
    if (e.target.closest(".db-trip-delete")) return;
    navigate(`/notebook/${trip._id}`);
  }

  function handleDelete(e) {
    e.stopPropagation();
    onDelete(trip);
  }

  return (
    <div
      className="db-trip-card"
      style={{ "--card-accent": colors.border }}
      onClick={handleOpen}
    >
      <div className="db-trip-emoji" style={{ background: colors.bg }}>
        {Icons[vibeIcon] || Icons.plane}
      </div>

      <div className="db-trip-main">
        <div className="db-trip-name">{trip.name}</div>
        <div className="db-trip-meta">
          {dates}
          {duration && <><span className="db-dot" />{duration}</>}
          {trip.dest && <><span className="db-dot" />{trip.dest}</>}
        </div>
      </div>

      <div className="db-trip-right">
        <span className={`db-status ${colors.statusClass}`}>{trip.status || "Planning"}</span>
        <div className="db-open-hint">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            Open notebook {Icons.arrowRight}
          </span>
        </div>
        <button
          className="db-trip-delete"
          title="Delete trip"
          onClick={handleDelete}
        >
          {Icons.trash}
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const [trips,       setTrips]       = useState([]);
  const [invites,     setInvites]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [ddOpen,      setDdOpen]      = useState(false);
  const [modal,       setModal]       = useState(false);
  const [upsell,      setUpsell]      = useState(false);
  const [settings,    setSettings]    = useState(false);
  const [billing,     setBilling]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // trip to confirm-delete
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast,       setToast]       = useState("");

  const ddRef    = useRef(null);
  const toastRef = useRef(null);

  const billingStatus = getBillingStatus(user);

  // ── Load trips ───────────────────────────────────────────────────
  useEffect(() => {
    apiGetTrips()
      .then(data => setTrips(data.trips))
      .catch(err => console.error("Failed to load trips:", err))
      .finally(() => setLoading(false));
  }, []);

  // ── Auto-open new trip modal from URL param ───────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("new") === "1" && !loading) {
      tryOpenNewTrip();
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [loading]);

  // ── Close dropdown on outside click ──────────────────────────────
  useEffect(() => {
    const handler = e => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────
  function isPremiumUser() {
    return billingStatus.type === "premium" || billingStatus.type === "trial";
  }

  function tryOpenNewTrip() {
    const atLimit = !isPremiumUser() && trips.length >= 1;
    if (atLimit) setUpsell(true);
    else setModal(true);
  }

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(""), 2800);
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  function handleAccept(id, name) {
    setInvites(p => p.filter(i => i.id !== id));
    showToast(`Joined ${name}!`);
  }

  function handleDecline(id) {
    setInvites(p => p.filter(i => i.id !== id));
    showToast("Invite declined");
  }

  async function handleCreated(trip) {
    const data = await apiCreateTrip({
      name:      trip.name,
      vibe:      trip.vibe,
      dest:      trip.dest,
      startDate: trip.start,
      endDate:   trip.end,
    });
    setTrips(p => [data.trip, ...p]);
    showToast(`"${trip.name}" created!`);
    // ── Navigate straight into the new notebook ──
    navigate(`/notebook/${data.trip._id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiDeleteTrip(deleteTarget._id);
      setTrips(p => p.filter(t => t._id !== deleteTarget._id));
      showToast(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || "Failed to delete trip");
    } finally {
      setDeleteLoading(false);
    }
  }

  const firstName = user?.name?.split(" ")[0] || "Traveller";

  const planLabel = {
    premium:   "Premium",
    trial:     `Trial · ${billingStatus.daysLeft}d left`,
    expired:   "Trial Expired",
    cancelled: "Cancelled",
    free:      "Free Plan",
  }[billingStatus.type] || "Free Plan";

  return (
    <div className="db-root">

      {/* ── Nav ── */}
      <nav className="db-nav">
        <div className="db-logo">
          <img src="/travellogo.png" alt="" style={{ height: 38, width: 38, borderRadius: 9, objectFit: "cover" }} />
          <span className="db-logo-text">Travel<span>ogue</span></span>
        </div>

        <div className="db-nav-right">
          <button className="db-nav-ghost" onClick={() => navigate("/")}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              {Icons.back} Back to site
            </span>
          </button>

          <div className="db-user-dd" ref={ddRef}>
            <div className="db-user-trigger" onClick={() => setDdOpen(o => !o)}>
              <div>
                <div className="db-av-name">{user?.name || "Traveller"}</div>
                <div className="db-av-plan">{planLabel}</div>
              </div>
              <div className="db-av">{firstName.charAt(0).toUpperCase()}</div>
            </div>

            {ddOpen && (
              <div className="db-dropdown">
                <div className="db-dd-head">
                  <div className="db-dd-name">{user?.name}</div>
                  <div className="db-dd-plan">{user?.email} · {planLabel}</div>
                </div>

                {billingStatus.type === "trial" && billingStatus.daysLeft <= 3 && (
                  <div style={{ margin: "6px 12px 2px", padding: "8px 10px", borderRadius: 8, background: "#FDF0E8", border: "1px solid rgba(200,98,58,0.2)", fontSize: "0.74rem", color: "#C8623A", display: "flex", alignItems: "center", gap: 6 }}>
                    {Icons.alertCircle} Trial ends in {billingStatus.daysLeft} day{billingStatus.daysLeft !== 1 ? "s" : ""}
                  </div>
                )}

                {billingStatus.type === "expired" && (
                  <div style={{ margin: "6px 12px 2px", padding: "8px 10px", borderRadius: 8, background: "#fde8e8", border: "1px solid rgba(200,50,50,0.2)", fontSize: "0.74rem", color: "#C44", display: "flex", alignItems: "center", gap: 6 }}>
                    {Icons.alertCircle} Trial expired — upgrade to continue
                  </div>
                )}

                <div className="db-dd-item" onClick={() => { setSettings(true); setDdOpen(false); }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{Icons.settings} Settings</span>
                </div>
                <div className="db-dd-item" onClick={() => { setBilling(true); setDdOpen(false); }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{Icons.billing} Billing</span>
                </div>
                <div className="db-dd-sep" />
                <div className="db-dd-item danger" onClick={handleLogout}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{Icons.logout} Log Out</span>
                </div>
              </div>
            )}
          </div>

          <button className="db-new-btn" onClick={tryOpenNewTrip}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {Icons.plus} New Trip
            </span>
          </button>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="db-container">

        {/* Greeting */}
        <div className="db-greeting">
          <div className="db-greeting-pill">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {Icons.wave} Welcome back
            </span>
          </div>
          <h1>Your trips,<br /><em>all in one place.</em></h1>
          {trips.length > 0
            ? <p>{trips.length} trip{trips.length > 1 ? "s" : ""} planned · Let's keep exploring!</p>
            : <p>You haven't planned any trips yet — start your first adventure!</p>
          }
        </div>

        {/* Trial ending soon banner */}
        {billingStatus.type === "trial" && billingStatus.daysLeft <= 3 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "linear-gradient(135deg,#FDF0E8,#FBF6EC)", border: "1.5px solid rgba(200,98,58,0.25)", borderRadius: 14, padding: "14px 20px", marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ color: "#C8623A", display: "flex" }}>{Icons.alertCircle}</div>
              <div>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--warm-dark)" }}>Your trial ends in {billingStatus.daysLeft} day{billingStatus.daysLeft !== 1 ? "s" : ""}</div>
                <div style={{ fontSize: "0.76rem", color: "var(--text-light)", marginTop: 2 }}>You'll be charged 14.99 AED/mo automatically — or cancel before it ends</div>
              </div>
            </div>
            <button className="db-btn-main" style={{ padding: "8px 18px", fontSize: "0.82rem", flexShrink: 0 }} onClick={() => setBilling(true)}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{Icons.billing} Manage Billing</span>
            </button>
          </div>
        )}

        {/* Trial expired banner */}
        {billingStatus.type === "expired" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "linear-gradient(135deg,#fde8e8,#fdf0e0)", border: "1.5px solid rgba(200,50,50,0.2)", borderRadius: 14, padding: "14px 20px", marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ color: "#C44", display: "flex" }}>{Icons.alertCircle}</div>
              <div>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#991111" }}>Your free trial has ended</div>
                <div style={{ fontSize: "0.76rem", color: "var(--text-light)", marginTop: 2 }}>Upgrade to Premium to continue planning unlimited trips</div>
              </div>
            </div>
            <button className="db-btn-main" style={{ padding: "8px 18px", fontSize: "0.82rem", flexShrink: 0, background: "#C44" }} onClick={() => navigate("/#pricing")}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{Icons.sparkle} Upgrade Now</span>
            </button>
          </div>
        )}

        {/* Free plan limit banner */}
        {billingStatus.type === "free" && trips.length >= 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "linear-gradient(135deg,#FDF0E8,#FBF6EC)", border: "1.5px solid rgba(200,98,58,0.2)", borderRadius: 14, padding: "14px 20px", marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ color: "#C8623A", display: "flex" }}>{Icons.lock}</div>
              <div>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--warm-dark)" }}>Free plan: 1 trip limit reached</div>
                <div style={{ fontSize: "0.76rem", color: "var(--text-light)", marginTop: 2 }}>Upgrade to Premium for unlimited trips and all features</div>
              </div>
            </div>
            <button className="db-btn-main" style={{ padding: "8px 18px", fontSize: "0.82rem", flexShrink: 0 }} onClick={() => navigate("/#pricing")}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{Icons.sparkle} Upgrade — 14.99 AED/mo</span>
            </button>
          </div>
        )}

        {/* Pending Invites */}
        <div className="db-section">
          <div className="db-section-label">
            Pending Invites
            {invites.length > 0 && <span className="db-inv-count">{invites.length}</span>}
          </div>
          {invites.length === 0 && <div className="db-empty-banner">No invitations yet.</div>}
          {invites.map(inv => (
            <div key={inv.id} className="db-invite-banner">
              <div className="db-invite-icon">{Icons.invite}</div>
              <div className="db-invite-text">
                <div className="db-invite-title">{inv.name}</div>
                <div className="db-invite-sub">{inv.inviter} invited you · {inv.dates} · {inv.members} members</div>
              </div>
              <div className="db-invite-btns">
                <button className="db-btn-acc" onClick={() => handleAccept(inv.id, inv.name)}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icons.check} Accept</span>
                </button>
                <button className="db-btn-dec" onClick={() => handleDecline(inv.id)}>Decline</button>
              </div>
            </div>
          ))}
        </div>

        {/* My Trips */}
        <div className="db-section" style={{ marginTop: 30 }}>
          <div className="db-section-label">My Trips</div>

          {loading && (
            <div className="db-empty-trips">
              <div className="db-empty-icon">{Icons.clock}</div>
              <div className="db-empty-title">Loading your trips…</div>
            </div>
          )}

          {!loading && trips.length === 0 && (
            <div className="db-empty-trips">
              <div className="db-empty-icon">{Icons.map}</div>
              <div className="db-empty-title">No trips yet</div>
              <div className="db-empty-sub">Plan your first adventure and invite your group</div>
              <button className="db-btn-main" style={{ marginTop: 16 }} onClick={tryOpenNewTrip}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{Icons.plane} Plan a Trip</span>
              </button>
            </div>
          )}

          {!loading && trips.length > 0 && (
            <div className="db-trip-list">
              {trips.map(trip => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  onDelete={setDeleteTarget}
                  onToast={showToast}
                />
              ))}
            </div>
          )}

          {!loading && (
            <button className="db-new-trip-btn" onClick={tryOpenNewTrip}>
              <div className="db-new-icon">{Icons.plus}</div>
              <div>
                <div className="db-new-label">Plan a new trip</div>
                <div className="db-new-sub">
                  {!isPremiumUser() && trips.length >= 1
                    ? "Upgrade to Premium to create more trips"
                    : "Create a notebook and invite your group"
                  }
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ── Modals & Sheets ── */}
      {upsell        && <UpsellModal   onClose={() => setUpsell(false)}         onUpgrade={() => { setUpsell(false); navigate("/#pricing"); }} />}
      {modal         && <NewTripModal  onClose={() => setModal(false)}          onCreated={handleCreated} />}
      {settings      && <SettingsSheet onClose={() => setSettings(false)}       user={user} isPremium={isPremiumUser()} />}
      {billing       && <BillingSheet  onClose={() => setBilling(false)}        user={user} onUpgrade={() => { setBilling(false); navigate("/#pricing"); }} />}
      {deleteTarget  && <DeleteModal   onClose={() => setDeleteTarget(null)}    trip={deleteTarget} onConfirm={handleDeleteConfirm} loading={deleteLoading} />}

      <Toast msg={toast} />
    </div>
  );
}
