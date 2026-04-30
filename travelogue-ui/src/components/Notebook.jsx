import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import { fetchMessages, deleteMessage as apiDeleteMessage } from "../api/chat";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Notebook.css";
import TripMap from "./TripMap";

/* ─── SVG ICONS ───────────────────────────────────────────── */
const Icon = {
  back: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  share: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  close: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  plus: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  settings: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrowRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  send: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  attach: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
  sunrise: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>,
  ocean: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12c2-4 6-4 8 0s6 4 8 0"/><path d="M2 17c2-4 6-4 8 0s6 4 8 0"/><path d="M2 7c2-4 6-4 8 0s6 4 8 0"/></svg>,
  mountain: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3L1 21h22L15 3z"/><path d="M12 8l-3 7h6l-3-7z" fill="currentColor" opacity="0.3"/></svg>,
  temple: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20M6 20V10M18 20V10M12 20V4M4 10h16M9 4h6"/></svg>,
  backpack: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2h6a2 2 0 0 1 2 2v1H7V4a2 2 0 0 1 2-2z"/><path d="M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M9 12h6M12 9v6"/></svg>,
  plane: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 22-7z"/></svg>,
  desert: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18c3-6 5-6 6-6 1.5 0 2 2 3 2s2-2 3.5-2c1 0 3 2 5.5 6"/><circle cx="18" cy="6" r="3"/><line x1="18" y1="1" x2="18" y2="3"/><line x1="23" y1="6" x2="21" y2="6"/></svg>,
  camera: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  map: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  vote: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>,
  budget: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  packing: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  itinerary: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  sharePanel: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  explore: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  food: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  stay: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  transport: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 22-7z"/></svg>,
  wallet: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/><circle cx="17" cy="13" r="1.5" fill="currentColor"/></svg>,
  receipt: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 0 0-2-2z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></svg>,
  dollar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  pin: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  whatsapp: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  mail: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  image: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  link: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  zoom: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  crosshair: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>,
};

/* ─── HELPERS ─────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function getVibeIcon(vibe) {
  const map = {
    sunrise: Icon.sunrise, ocean: Icon.ocean, mountain: Icon.mountain,
    temple: Icon.temple, backpack: Icon.backpack, plane: Icon.plane,
    desert: Icon.desert, camera: Icon.camera,
  };
  return map[vibe] || Icon.sunrise;
}

/* ─── TOAST ───────────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg) => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 2800);
  }, []);
  return { toasts, show };
}

function ToastContainer({ toasts }) {
  return (
    <div className="nb-toast-container">
      {toasts.map(t => <div key={t.id} className="nb-toast">{t.msg}</div>)}
    </div>
  );
}

/* ─── MODAL ───────────────────────────────────────────────── */
function Modal({ open, onClose, title, subtitle, children, footer }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="nb-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="nb-modal-box">
        <button className="nb-modal-close" onClick={onClose}>{Icon.close}</button>
        <div className="nb-modal-title">{title}</div>
        {subtitle && <div className="nb-modal-subtitle">{subtitle}</div>}
        {children}
        {footer && <div className="nb-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ─── PANEL SHELL ─────────────────────────────────────────── */
function PanelShell({ title, subtitle, actions, children }) {
  return (
    <div className="nb-content-area">
      <div className="nb-panel-topbar">
        <div>
          <div className="nb-panel-title">{title}</div>
          {subtitle && <div className="nb-panel-subtitle">{subtitle}</div>}
        </div>
        {actions && <div className="nb-panel-actions">{actions}</div>}
      </div>
      <div className="nb-panel-body">{children}</div>
    </div>
  );
}

/* ─── ITINERARY PANEL ─────────────────────────────────────── */
function ItineraryPanel({ toast, trip }) {
  const { user } = useAuth();
  const [items, setItems]         = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem]   = useState(null); // null = create, obj = edit
  const [expandedId, setExpandedId] = useState(null);

  const EMPTY_FORM = {
    title: "", description: "", date: "", startTime: "",
    endTime: "", location: "", category: "explore", notes: "", color: "",
  };
  const [form, setForm] = useState(EMPTY_FORM);

  // Drag state (lightweight, no library dependency)
  const dragItem  = useRef(null);
  const dragOver  = useRef(null);

  const tripId = trip?._id;

  /* ── Load items ─────────────────────────────────────────── */
  useEffect(() => {
    if (!tripId) { setIsLoading(false); return; }
    import("../api/itinerary").then(({ apiGetItinerary }) => {
      apiGetItinerary(tripId)
        .then(({ items }) => setItems(items))
        .catch(() => toast("Failed to load itinerary"))
        .finally(() => setIsLoading(false));
    });
  }, [tripId]);

  /* ── Socket.IO real-time sync ───────────────────────────── */
 useEffect(() => {
  if (!tripId) return;

  const socket = io(
    import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000",
    { auth: { token: localStorage.getItem("travelogue_token") || "" } }
  );

  socket.emit("chat:join", { tripId });

  socket.on("itineraryCreated", ({ item }) => {
    setItems((p) => {
      if (p.some((i) => i._id === item._id)) return p;
      return [...p, item].sort((a, b) =>
        new Date(a.date) - new Date(b.date) || a.orderIndex - b.orderIndex
      );
    });
  });
  socket.on("itineraryUpdated", ({ item }) => {
    setItems((p) => p.map((i) => (i._id === item._id ? item : i)));
  });
  socket.on("itineraryDeleted", ({ itemId }) => {
    setItems((p) => p.filter((i) => i._id !== itemId));
  });
  socket.on("itineraryReordered", ({ items: updated }) => {
    setItems(updated);
  });

  return () => socket.disconnect();
}, [tripId]);

  /* ── Group items by date ────────────────────────────────── */
  const grouped = useMemo(() => {
    const map = {};
    [...items]
      .sort((a, b) => new Date(a.date) - new Date(b.date) || a.orderIndex - b.orderIndex)
      .forEach((item) => {
        const key = new Date(item.date).toISOString().slice(0, 10);
        if (!map[key]) map[key] = [];
        map[key].push(item);
      });
    return map;
  }, [items]);

  const sortedDays = Object.keys(grouped).sort();

  /* ── Trip date range for date picker min/max ────────────── */
  const minDate = trip?.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : "";
  const maxDate = trip?.endDate   ? new Date(trip.endDate).toISOString().slice(0, 10)   : "";

  /* ── Open modal for create ──────────────────────────────── */
  function openCreate() {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, date: minDate || "" });
    setModalOpen(true);
  }

  /* ── Open modal for edit ────────────────────────────────── */
  function openEdit(item, e) {
    e.stopPropagation();
    setEditItem(item);
    setForm({
      title:       item.title,
      description: item.description || "",
      date:        new Date(item.date).toISOString().slice(0, 10),
      startTime:   item.startTime || "",
      endTime:     item.endTime   || "",
      location:    item.location  || "",
      category:    item.category  || "explore",
      notes:       item.notes     || "",
      color:       item.color     || "",
    });
    setModalOpen(true);
  }

  /* ── Save (create or update) ────────────────────────────── */
  async function handleSave() {
    if (!form.title.trim()) { toast("Please enter a title"); return; }
    if (!form.date)         { toast("Please select a date"); return; }

    try {
      const { apiCreateItem, apiUpdateItem } = await import("../api/itinerary");

      if (editItem) {
        const { item } = await apiUpdateItem(tripId, editItem._id, form);
        setItems((p) => p.map((i) => (i._id === item._id ? item : i)));
        toast("Activity updated!");
      } else {
        const { item } = await apiCreateItem(tripId, form);
        setItems((p) => [...p, item]);
        toast(`${item.title} added!`);
      }
      setModalOpen(false);
    } catch (err) {
      toast(err.message || "Failed to save activity");
    }
  }

  /* ── Delete ─────────────────────────────────────────────── */
  async function handleDelete(item, e) {
    e.stopPropagation();
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      const { apiDeleteItem } = await import("../api/itinerary");
      await apiDeleteItem(tripId, item._id);
      setItems((p) => p.filter((i) => i._id !== item._id));
      toast("Activity deleted");
    } catch (err) {
      toast(err.message || "Failed to delete");
    }
  }

  /* ── Drag-and-drop (same day reorder) ───────────────────── */
  function onDragStart(e, item) {
    dragItem.current = item;
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragEnter(e, item) {
    e.preventDefault();
    dragOver.current = item;
  }
  async function onDrop(e, targetDateKey) {
    e.preventDefault();
    if (!dragItem.current) return;

    const src   = dragItem.current;
    const tgt   = dragOver.current;
    dragItem.current  = null;
    dragOver.current  = null;

    // Optimistically reorder local state
    setItems((prev) => {
      const rest = prev.filter((i) => i._id !== src._id);
      // Move to new date if dropped on a different day header
      const movedItem = { ...src, date: targetDateKey || src.date };

      if (!tgt || tgt._id === src._id) return [...rest, movedItem];

      const tgtIdx = rest.findIndex((i) => i._id === tgt._id);
      const updated = [...rest];
      updated.splice(tgtIdx, 0, movedItem);
      return updated.map((item, idx) => ({ ...item, orderIndex: idx }));
    });

    // Persist reorder
    try {
      const { apiReorderItems } = await import("../api/itinerary");
      const dayKey = targetDateKey || new Date(src.date).toISOString().slice(0, 10);
      const dayItems = grouped[dayKey] || [];

      // Build updates array with new orderIndex
      const updates = dayItems
        .filter((i) => i._id !== src._id)
        .map((i, idx) => ({ id: i._id, date: dayKey, orderIndex: idx + 1 }));

      // Insert dragged item at position of drag target
      const tgtIdx = tgt ? dayItems.findIndex((i) => i._id === tgt._id) : dayItems.length;
      updates.splice(tgtIdx, 0, { id: src._id, date: dayKey, orderIndex: tgtIdx });

      await apiReorderItems(tripId, updates);
    } catch {
      // Silently fail — UI already shows optimistic order
    }
  }

  /* ── Category config ────────────────────────────────────── */
  const catColor = {
    explore:   "var(--ocean)",
    food:      "#C8A03A",
    stay:      "var(--green)",
    transport: "var(--terracotta)",
    other:     "rgba(255,255,255,0.4)",
  };
  const catBg = {
    explore:   "rgba(58,124,165,0.18)",
    food:      "rgba(200,160,58,0.18)",
    stay:      "rgba(92,122,94,0.18)",
    transport: "rgba(200,98,58,0.18)",
    other:     "rgba(255,255,255,0.06)",
  };
  const catIcon = {
    explore:   Icon.explore,
    food:      Icon.food,
    stay:      Icon.stay,
    transport: Icon.transport,
    other:     Icon.itinerary,
  };

  /* ── Day header label ───────────────────────────────────── */
  function dayLabel(dateKey, idx) {
    const d = new Date(dateKey + "T12:00:00");
    const formatted = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    return { num: `Day ${idx + 1}`, date: formatted };
  }

  const hasItems = items.length > 0;

  return (
    <PanelShell
      title={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{Icon.itinerary} Trip Itinerary</span>}
      subtitle={hasItems ? `${items.length} activit${items.length === 1 ? "y" : "ies"} planned` : "Start planning your days"}
      actions={
        <>
          <button className="nb-action-btn nb-action-primary" onClick={openCreate}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icon.plus} Add Activity</span>
          </button>
        </>
      }
    >
      {isLoading && (
        <div style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>
          Loading itinerary…
        </div>
      )}

      {!isLoading && !hasItems && (
        <div className="nb-empty">
          <div className="nb-empty-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{Icon.itinerary}</div>
          <div className="nb-empty-title">No activities yet</div>
          <p className="nb-empty-desc">
            Start building your itinerary — add flights, hotels, meals, or anything you have planned.
          </p>
          <button className="nb-empty-cta" onClick={openCreate}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icon.plus} Add First Activity</span>
          </button>
        </div>
      )}

      {!isLoading && hasItems && (
        <div>
          {sortedDays.map((dayKey, idx) => {
            const { num, date } = dayLabel(dayKey, idx);
            return (
              <div
                key={dayKey}
                className="nb-day-block"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, dayKey)}
              >
                {/* Day header */}
                <div className="nb-day-header">
                  <div className="nb-day-label">{num}</div>
                  <div className="nb-day-line" />
                  <div className="nb-day-date">{date}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginLeft: 8 }}>
                    {grouped[dayKey].length} item{grouped[dayKey].length !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Activity rows */}
                {grouped[dayKey].map((item) => {
                  const cat      = item.category || "explore";
                  const isOpen   = expandedId === item._id;
                  const timeLabel = item.startTime
                    ? item.endTime ? `${item.startTime} – ${item.endTime}` : item.startTime
                    : "—";

                  return (
                    <div
                      key={item._id}
                      className="nb-itin-row"
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                      onDragEnter={(e) => onDragEnter(e, item)}
                      onClick={() => setExpandedId(isOpen ? null : item._id)}
                      style={{ cursor: "grab", userSelect: "none" }}
                    >
                      {/* Time */}
                      <div className="nb-itin-time" style={{ minWidth: 72 }}>{timeLabel}</div>

                      {/* Color node */}
                      <div
                        className="nb-itin-node"
                        style={{
                          borderColor:  item.color || catColor[cat],
                          background:   catBg[cat],
                        }}
                      />

                      {/* Details */}
                      <div className="nb-itin-details" style={{ flex: 1 }}>
                        <div className="nb-itin-name" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          {catIcon[cat]} {item.title}
                        </div>
                        {item.location && (
                          <div className="nb-itin-loc" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            {Icon.pin} {item.location}
                          </div>
                        )}

                        {/* Expanded detail */}
                        {isOpen && (
                          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                            {item.description && (
                              <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginBottom: 4 }}>
                                {item.description}
                              </div>
                            )}
                            {item.notes && (
                              <div className="nb-itin-note" style={{ marginTop: 4 }}>
                                📝 {item.notes}
                              </div>
                            )}
                            <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 6 }}>
                              Added by {item.createdBy?.name || "member"}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tag + actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <span className={`nb-tag tag-${cat}`}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>

                        {/* Edit */}
                        <button
                          className="nb-action-btn nb-action-ghost"
                          style={{ padding: "4px 8px", fontSize: "0.7rem" }}
                          onClick={(e) => openEdit(item, e)}
                          title="Edit"
                        >
                          {Icon.settings}
                        </button>

                        {/* Delete */}
                        <button
                          className="nb-action-btn nb-action-ghost"
                          style={{ padding: "4px 8px", fontSize: "0.7rem", color: "#FF5F57" }}
                          onClick={(e) => handleDelete(item, e)}
                          title="Delete"
                        >
                          {Icon.close}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          <button className="nb-add-activity-btn" onClick={openCreate}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icon.plus} Add another activity</span>
          </button>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Activity" : "Add Activity"}
        subtitle={editItem ? "Update this activity's details." : "Add an event, place, or plan to the itinerary."}
        footer={
          <>
            <button className="nb-modal-btn nb-modal-btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="nb-modal-btn nb-modal-btn-primary" onClick={handleSave}>
              {editItem ? "Save Changes" : "Add to Itinerary"}
            </button>
          </>
        }
      >
        {/* Title */}
        <div className="nb-form-group">
          <label className="nb-form-label">Activity Title *</label>
          <input
            className="nb-form-input"
            placeholder="e.g. Visit Majorelle Garden"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
        </div>

        {/* Date + Category */}
        <div className="nb-form-row-2">
          <div className="nb-form-group">
            <label className="nb-form-label">Date *</label>
            <input
              className="nb-form-input"
              type="date"
              min={minDate}
              max={maxDate}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div className="nb-form-group">
            <label className="nb-form-label">Category</label>
            <select
              className="nb-form-select"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              <option value="explore">Explore</option>
              <option value="food">Food</option>
              <option value="stay">Stay</option>
              <option value="transport">Transport</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Start / End time */}
        <div className="nb-form-row-2">
          <div className="nb-form-group">
            <label className="nb-form-label">Start Time</label>
            <input
              className="nb-form-input"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            />
          </div>
          <div className="nb-form-group">
            <label className="nb-form-label">End Time</label>
            <input
              className="nb-form-input"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            />
          </div>
        </div>

        {/* Location */}
        <div className="nb-form-group">
          <label className="nb-form-label">Location</label>
          <input
            className="nb-form-input"
            placeholder="Place name or address"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
        </div>

        {/* Description */}
        <div className="nb-form-group">
          <label className="nb-form-label">Description</label>
          <textarea
            className="nb-form-textarea"
            placeholder="What's happening here?"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
          />
        </div>

        {/* Notes */}
        <div className="nb-form-group">
          <label className="nb-form-label">Notes (optional)</label>
          <textarea
            className="nb-form-textarea"
            placeholder="Booking refs, tips, reminders…"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2}
          />
        </div>
      </Modal>
    </PanelShell>
  );
}

/* ─── CALENDAR PANEL ──────────────────────────────────────── */
/* ─── CALENDAR PANEL ──────────────────────────────────────── */
function CalendarPanel({ toast, trip }) {
  const [items, setItems]       = useState([]);
  const [viewMode, setViewMode] = useState("month"); // "month" | "day" | "timeline"
  const [viewDate, setViewDate] = useState(() => {
    const d = trip?.startDate ? new Date(trip.startDate) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const EMPTY_FORM = {
    title: "", description: "", date: "", startTime: "",
    endTime: "", location: "", category: "explore", notes: "", color: "",
  };
  const [form, setForm] = useState(EMPTY_FORM);

  const tripId  = trip?._id;
  const minDate = trip?.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : "";
  const maxDate = trip?.endDate   ? new Date(trip.endDate).toISOString().slice(0, 10)   : "";
  const today   = new Date().toISOString().slice(0, 10);

  /* ── Load items ─────────────────────────────────────────── */
  useEffect(() => {
    if (!tripId) return;
    import("../api/itinerary").then(({ apiGetItinerary }) => {
      apiGetItinerary(tripId)
        .then(({ items }) => setItems(items))
        .catch(() => {});
    });
  }, [tripId]);

  /* ── Derived data ───────────────────────────────────────── */
  const activeDays = useMemo(() => {
    const s = new Set();
    items.forEach(it => s.add(new Date(it.date).toISOString().slice(0, 10)));
    return s;
  }, [items]);

  const itemsByDay = useMemo(() => {
    const map = {};
    items.forEach(it => {
      const key = new Date(it.date).toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(it);
    });
    // Sort each day's items by startTime
    Object.keys(map).forEach(k => {
      map[k].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    });
    return map;
  }, [items]);

  const selectedDayItems = useMemo(() => itemsByDay[selectedDay] || [], [itemsByDay, selectedDay]);

  /* ── Conflict detection ─────────────────────────────────── */
  function detectConflicts(dayItems) {
    const conflicts = new Set();
    for (let i = 0; i < dayItems.length; i++) {
      for (let j = i + 1; j < dayItems.length; j++) {
        const a = dayItems[i], b = dayItems[j];
        if (!a.startTime || !b.startTime || !a.endTime || !b.endTime) continue;
        const aStart = a.startTime, aEnd = a.endTime;
        const bStart = b.startTime, bEnd = b.endTime;
        if (aStart < bEnd && aEnd > bStart) {
          conflicts.add(a._id);
          conflicts.add(b._id);
        }
      }
    }
    return conflicts;
  }

  /* ── Save activity ──────────────────────────────────────── */
  async function handleSave() {
    if (!form.title.trim()) { toast("Please enter a title"); return; }
    if (!form.date)         { toast("Please select a date"); return; }
    try {
      const { apiCreateItem, apiUpdateItem } = await import("../api/itinerary");
      if (editItem) {
        const { item } = await apiUpdateItem(tripId, editItem._id, form);
        setItems(p => p.map(i => i._id === item._id ? item : i));
        toast("Activity updated!");
      } else {
        const { item } = await apiCreateItem(tripId, form);
        setItems(p => [...p, item]);
        toast(`${item.title} added!`);
      }
      setModalOpen(false);
    } catch (err) { toast(err.message || "Failed to save"); }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      const { apiDeleteItem } = await import("../api/itinerary");
      await apiDeleteItem(tripId, item._id);
      setItems(p => p.filter(i => i._id !== item._id));
      toast("Activity deleted");
    } catch (err) { toast(err.message || "Failed to delete"); }
  }

  function openCreate(dateKey) {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, date: dateKey || selectedDay || minDate || "" });
    setModalOpen(true);
  }

  function openEdit(item, e) {
    e?.stopPropagation();
    setEditItem(item);
    setForm({
      title:       item.title,
      description: item.description || "",
      date:        new Date(item.date).toISOString().slice(0, 10),
      startTime:   item.startTime || "",
      endTime:     item.endTime   || "",
      location:    item.location  || "",
      category:    item.category  || "explore",
      notes:       item.notes     || "",
      color:       item.color     || "",
    });
    setModalOpen(true);
  }

  /* ── Calendar grid helpers ──────────────────────────────── */
  const { year, month } = viewDate;
  const monthName    = new Date(year, month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const firstDow     = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const cells        = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  function cellKey(n) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
  }
  function prevMonth() {
    setViewDate(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
  }
  function nextMonth() {
    setViewDate(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });
  }

  /* ── Category colors ────────────────────────────────────── */
  const catColor = {
    explore: "var(--ocean)", food: "#C8A03A",
    stay: "var(--green)", transport: "var(--terracotta)", other: "rgba(255,255,255,0.4)",
  };

  /* ── Timeline hours ─────────────────────────────────────── */
  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  function timeToMinutes(t) {
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function getTimelineItems(dayItems) {
    return dayItems.filter(it => it.startTime).map(it => {
      const start = timeToMinutes(it.startTime);
      const end   = it.endTime ? timeToMinutes(it.endTime) : start + 60;
      return { ...it, startMin: start, endMin: end, duration: end - start };
    });
  }

  /* ── Upcoming activities (next 3) ───────────────────────── */
  const upcomingItems = useMemo(() => {
    return [...items]
      .filter(it => new Date(it.date).toISOString().slice(0, 10) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date) || (a.startTime || "").localeCompare(b.startTime || ""))
      .slice(0, 3);
  }, [items, today]);

  /* ── Render: Activity card (shared) ─────────────────────── */
  function ActivityCard({ item, conflicts, compact }) {
    const cat = item.category || "explore";
    const isConflict = conflicts?.has(item._id);
    const isUpcoming = new Date(item.date).toISOString().slice(0, 10) >= today;

    return (
      <div style={{
        background: isConflict ? "rgba(255,95,87,0.08)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${isConflict ? "rgba(255,95,87,0.3)" : "rgba(255,255,255,0.07)"}`,
        borderLeft: `3px solid ${catColor[cat]}`,
        borderRadius: 10,
        padding: compact ? "8px 12px" : "10px 14px",
        marginBottom: 8,
        position: "relative",
      }}>
        {isConflict && (
          <div style={{ fontSize: "0.62rem", color: "#FF5F57", fontWeight: 700, marginBottom: 4 }}>
            ⚠ Time conflict
          </div>
        )}
        {isUpcoming && !compact && (
          <div style={{ position: "absolute", top: 8, right: 8, fontSize: "0.58rem", background: "rgba(40,200,64,0.15)", color: "#28C840", padding: "1px 6px", borderRadius: 50, fontWeight: 700 }}>
            UPCOMING
          </div>
        )}
        <div style={{ fontWeight: 600, fontSize: compact ? "0.78rem" : "0.82rem", color: "var(--text-bright)", paddingRight: 60 }}>
          {item.title}
        </div>
        {item.startTime && (
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>
            🕐 {item.startTime}{item.endTime ? ` – ${item.endTime}` : ""}
          </div>
        )}
        {item.location && (
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
            {Icon.pin} {item.location}
          </div>
        )}
        {!compact && item.description && (
          <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: 4 }}>{item.description}</div>
        )}
        {!compact && (
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button className="nb-action-btn nb-action-ghost" style={{ padding: "3px 8px", fontSize: "0.68rem" }} onClick={(e) => openEdit(item, e)}>
              {Icon.settings}
            </button>
            <button className="nb-action-btn nb-action-ghost" style={{ padding: "3px 8px", fontSize: "0.68rem", color: "#FF5F57" }} onClick={() => handleDelete(item)}>
              {Icon.close}
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── View: Month ────────────────────────────────────────── */
  function MonthView() {
    return (
      <div className="nb-calendar-layout">
        {/* Grid */}
        <div>
          <div className="nb-cal-top">
            <button className="nb-cal-nav" onClick={prevMonth}>‹</button>
            <div className="nb-cal-month-title">{monthName}</div>
            <button className="nb-cal-nav" onClick={nextMonth}>›</button>
          </div>
          <div className="nb-cal-grid">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
              <div key={d} className="nb-cal-dow">{d}</div>
            ))}
            {cells.map((n, i) => {
              if (!n) return <div key={`e${i}`} className="nb-cal-cell empty" />;
              const key    = cellKey(n);
              const hasAct = activeDays.has(key);
              const isToday= key === today;
              const isSel  = key === selectedDay;
              const dayActs= itemsByDay[key] || [];
              const conflicts = detectConflicts(dayActs);
              const hasConflict = conflicts.size > 0;

              return (
                <button
                  key={n}
                  className={`nb-cal-cell ${isToday ? "today" : hasAct ? "trip-day" : ""} ${isSel ? "selected" : ""}`}
                  onClick={() => { setSelectedDay(isSel ? null : key); }}
                  style={isSel ? { outline: "2px solid var(--terracotta)", outlineOffset: 2 } : {}}
                  title={hasConflict ? "⚠ Time conflict on this day" : ""}
                >
                  {n}
                  {hasAct && (
                    <span style={{
                      display: "block", width: 4, height: 4, borderRadius: "50%",
                      background: hasConflict ? "#FF5F57" : "var(--terracotta)",
                      margin: "1px auto 0",
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail / overview */}
        <div>
          {selectedDay ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-bright)" }}>
                  {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                </div>
                <button className="nb-action-btn nb-action-primary" style={{ padding: "4px 10px", fontSize: "0.72rem" }} onClick={() => openCreate(selectedDay)}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{Icon.plus} Add</span>
                </button>
              </div>
              {selectedDayItems.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: "0.78rem", textAlign: "center", padding: 20 }}>
                  No activities · <button style={{ color: "var(--terracotta)", background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem" }} onClick={() => openCreate(selectedDay)}>add one</button>
                </div>
              ) : (
                (() => {
                  const conflicts = detectConflicts(selectedDayItems);
                  return selectedDayItems.map(it => (
                    <ActivityCard key={it._id} item={it} conflicts={conflicts} />
                  ));
                })()
              )}
            </div>
          ) : (
            <div>
              <div className="nb-trip-progress-card">
                <div className="nb-tpc-title">Trip Overview</div>
                {[
                  { label: "Total Activities", val: items.length },
                  { label: "Days Planned",     val: activeDays.size },
                  { label: "Explore",          val: items.filter(i => i.category === "explore").length },
                  { label: "Food",             val: items.filter(i => i.category === "food").length },
                  { label: "Stay",             val: items.filter(i => i.category === "stay").length },
                  { label: "Transport",        val: items.filter(i => i.category === "transport").length },
                ].map(r => (
                  <div key={r.label} className="nb-tpc-row">
                    <div className="nb-tpc-label">{r.label}</div>
                    <div style={{ marginLeft: "auto", fontWeight: 700, color: "var(--text-bright)", fontSize: "0.82rem" }}>{r.val}</div>
                  </div>
                ))}
              </div>

              {/* Upcoming */}
              {upcomingItems.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    Upcoming
                  </div>
                  {upcomingItems.map(it => (
                    <ActivityCard key={it._id} item={it} compact />
                  ))}
                </div>
              )}

              <div style={{ marginTop: 14, fontSize: "0.72rem", color: "var(--muted)", textAlign: "center" }}>
                Tap a day to see its activities
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── View: Day ──────────────────────────────────────────── */
  function DayView() {
    const displayDay = selectedDay || today;
    const dayItems   = itemsByDay[displayDay] || [];
    const conflicts  = detectConflicts(dayItems);

    const allDays = [...activeDays].sort();
    const currentIdx = allDays.indexOf(displayDay);

    function prevDay() {
      if (currentIdx > 0) setSelectedDay(allDays[currentIdx - 1]);
    }
    function nextDay() {
      if (currentIdx < allDays.length - 1) setSelectedDay(allDays[currentIdx + 1]);
    }

    return (
      <div>
        {/* Day nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button className="nb-cal-nav" onClick={prevDay} disabled={currentIdx <= 0}>‹</button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-bright)" }}>
              {new Date(displayDay + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
              {dayItems.length} activit{dayItems.length !== 1 ? "ies" : "y"}
              {conflicts.size > 0 && <span style={{ color: "#FF5F57", marginLeft: 8 }}>⚠ {conflicts.size / 2} conflict{conflicts.size > 2 ? "s" : ""}</span>}
            </div>
          </div>
          <button className="nb-cal-nav" onClick={nextDay} disabled={currentIdx >= allDays.length - 1}>›</button>
        </div>

        {/* Jump to day */}
        <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {allDays.map((d, i) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              style={{
                padding: "4px 10px", borderRadius: 20, fontSize: "0.7rem", cursor: "pointer",
                background: d === displayDay ? "var(--terracotta)" : "rgba(255,255,255,0.06)",
                color: d === displayDay ? "#fff" : "var(--muted)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Day {i + 1}
            </button>
          ))}
        </div>

        {dayItems.length === 0 ? (
          <div className="nb-empty" style={{ padding: 30 }}>
            <div className="nb-empty-title">No activities this day</div>
            <button className="nb-empty-cta" onClick={() => openCreate(displayDay)}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icon.plus} Add Activity</span>
            </button>
          </div>
        ) : (
          <div>
            {dayItems.map(it => (
              <ActivityCard key={it._id} item={it} conflicts={conflicts} />
            ))}
            <button className="nb-add-activity-btn" onClick={() => openCreate(displayDay)}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icon.plus} Add activity to this day</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── View: Timeline ─────────────────────────────────────── */
  function TimelineView() {
    const displayDay   = selectedDay || today;
    const dayItems     = itemsByDay[displayDay] || [];
    const tlItems      = getTimelineItems(dayItems);
    const conflicts    = detectConflicts(dayItems);
    const allDays      = [...activeDays].sort();
    const HOUR_HEIGHT  = 60; // px per hour

    return (
      <div>
        {/* Day selector */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {allDays.map((d, i) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              style={{
                padding: "4px 10px", borderRadius: 20, fontSize: "0.7rem", cursor: "pointer",
                background: d === displayDay ? "var(--terracotta)" : "rgba(255,255,255,0.06)",
                color: d === displayDay ? "#fff" : "var(--muted)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Day {i + 1} · {new Date(d + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </button>
          ))}
        </div>

        <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: 12 }}>
          {new Date(displayDay + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          {conflicts.size > 0 && <span style={{ color: "#FF5F57", marginLeft: 8 }}>⚠ Time conflicts detected</span>}
        </div>

        {/* Timeline grid */}
        <div style={{ position: "relative", overflowY: "auto", maxHeight: 600 }}>
          {HOURS.map(h => (
            <div key={h} style={{
              display: "flex", alignItems: "flex-start", height: HOUR_HEIGHT,
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ width: 44, flexShrink: 0, fontSize: "0.65rem", color: "var(--muted)", paddingTop: 4, textAlign: "right", paddingRight: 8 }}>
                {String(h).padStart(2, "0")}:00
              </div>
              <div style={{ flex: 1, position: "relative", height: "100%" }}>
                {/* Current time indicator */}
                {displayDay === today && (() => {
                  const now = new Date();
                  const nowMin = now.getHours() * 60 + now.getMinutes();
                  if (Math.floor(nowMin / 60) === h) {
                    const top = ((nowMin % 60) / 60) * HOUR_HEIGHT;
                    return (
                      <div style={{
                        position: "absolute", left: 0, right: 0, top,
                        height: 2, background: "#FF5F57", zIndex: 10,
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF5F57", marginTop: -3, marginLeft: -4 }} />
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          ))}

          {/* Activity blocks */}
          <div style={{ position: "absolute", top: 0, left: 44, right: 0, bottom: 0 }}>
            {tlItems.map(it => {
              const top    = (it.startMin / 60) * HOUR_HEIGHT;
              const height = Math.max((it.duration / 60) * HOUR_HEIGHT, 24);
              const cat    = it.category || "explore";
              const isConflict = conflicts.has(it._id);

              return (
                <div
                  key={it._id}
                  onClick={(e) => openEdit(it, e)}
                  style={{
                    position: "absolute",
                    top, left: 8, right: 8, height,
                    background: isConflict ? "rgba(255,95,87,0.15)" : `${catColor[cat]}22`,
                    border: `1px solid ${isConflict ? "#FF5F57" : catColor[cat]}`,
                    borderLeft: `3px solid ${isConflict ? "#FF5F57" : catColor[cat]}`,
                    borderRadius: 6,
                    padding: "3px 8px",
                    overflow: "hidden",
                    cursor: "pointer",
                    zIndex: 5,
                  }}
                >
                  <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-bright)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {isConflict && "⚠ "}{it.title}
                  </div>
                  {height > 30 && (
                    <div style={{ fontSize: "0.62rem", color: "var(--muted)" }}>
                      {it.startTime} – {it.endTime || "?"}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Items without time */}
            {dayItems.filter(it => !it.startTime).map((it, i) => (
              <div key={it._id} style={{
                position: "absolute", top: 8 + i * 28, right: 8, width: 140,
                background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.15)",
                borderRadius: 6, padding: "3px 8px", fontSize: "0.68rem", color: "var(--muted)",
              }}>
                {it.title} · no time set
              </div>
            ))}
          </div>
        </div>

        <button className="nb-add-activity-btn" style={{ marginTop: 12 }} onClick={() => openCreate(displayDay)}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icon.plus} Add activity</span>
        </button>
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <PanelShell
      title={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{Icon.calendar} Trip Calendar</span>}
      subtitle={`${activeDays.size} day${activeDays.size !== 1 ? "s" : ""} with activities · ${items.length} total`}
      actions={
        <div style={{ display: "flex", gap: 6 }}>
          {["month", "day", "timeline"].map(v => (
            <button
              key={v}
              className={`nb-action-btn ${viewMode === v ? "nb-action-primary" : "nb-action-ghost"}`}
              style={{ padding: "5px 12px", fontSize: "0.72rem", textTransform: "capitalize" }}
              onClick={() => setViewMode(v)}
            >
              {v === "month" ? "📅 Month" : v === "day" ? "📋 Day" : "⏱ Timeline"}
            </button>
          ))}
          <button className="nb-action-btn nb-action-primary" onClick={() => openCreate(selectedDay || today)}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{Icon.plus} Add</span>
          </button>
        </div>
      }
    >
      {viewMode === "month"    && <MonthView />}
      {viewMode === "day"      && <DayView />}
      {viewMode === "timeline" && <TimelineView />}

      {/* ── Create / Edit Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Activity" : "Add Activity"}
        subtitle={editItem ? "Update this activity's details." : "Add an event, place, or plan to the itinerary."}
        footer={
          <>
            <button className="nb-modal-btn nb-modal-btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="nb-modal-btn nb-modal-btn-primary" onClick={handleSave}>
              {editItem ? "Save Changes" : "Add to Itinerary"}
            </button>
          </>
        }
      >
        <div className="nb-form-group">
          <label className="nb-form-label">Activity Title *</label>
          <input className="nb-form-input" placeholder="e.g. Visit Majorelle Garden" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
        </div>
        <div className="nb-form-row-2">
          <div className="nb-form-group">
            <label className="nb-form-label">Date *</label>
            <input className="nb-form-input" type="date" min={minDate} max={maxDate} value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="nb-form-group">
            <label className="nb-form-label">Category</label>
            <select className="nb-form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="explore">Explore</option>
              <option value="food">Food</option>
              <option value="stay">Stay</option>
              <option value="transport">Transport</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="nb-form-row-2">
          <div className="nb-form-group">
            <label className="nb-form-label">Start Time</label>
            <input className="nb-form-input" type="time" value={form.startTime}
              onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
          </div>
          <div className="nb-form-group">
            <label className="nb-form-label">End Time</label>
            <input className="nb-form-input" type="time" value={form.endTime}
              onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
          </div>
        </div>
        <div className="nb-form-group">
          <label className="nb-form-label">Location</label>
          <input className="nb-form-input" placeholder="Place name or address" value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
        </div>
        <div className="nb-form-group">
          <label className="nb-form-label">Description</label>
          <textarea className="nb-form-textarea" placeholder="What's happening here?" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
        </div>
        <div className="nb-form-group">
          <label className="nb-form-label">Notes (optional)</label>
          <textarea className="nb-form-textarea" placeholder="Booking refs, tips, reminders…" value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
        </div>
      </Modal>
    </PanelShell>
  );
}

/* ─── VOTING PANEL ────────────────────────────────────────── */
function VotingPanel({ toast, trip }) {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [voteModalPoll, setVoteModalPoll] = useState(null);
  const [picked, setPicked] = useState(null);
  const [form, setForm] = useState({ q: "", o1: "", o2: "", o3: "" });

  const tripId = trip?._id;

  // Load polls from backend
  useEffect(() => {
    if (!tripId) { setIsLoading(false); return; }
    import("../api/polls").then(({ apiGetPolls }) => {
      apiGetPolls(tripId)
        .then(({ polls }) => setPolls(polls))
        .catch(() => toast("Failed to load polls"))
        .finally(() => setIsLoading(false));
    });
  }, [tripId]);

  async function handleCreate() {
    if (!form.q.trim() || !form.o1.trim() || !form.o2.trim()) {
      toast("Fill in question and at least 2 options"); return;
    }
    const options = [form.o1, form.o2, ...(form.o3.trim() ? [form.o3] : [])];
    try {
      const { apiCreatePoll } = await import("../api/polls");
      const { poll } = await apiCreatePoll(tripId, { question: form.q.trim(), options });
      setPolls(p => [poll, ...p]);
      setForm({ q: "", o1: "", o2: "", o3: "" });
      setCreateOpen(false);
      toast("Vote created!");
    } catch (e) { toast(e.message || "Failed to create poll"); }
  }

  async function handleVote() {
    if (picked === null) { toast("Please pick an option"); return; }
    try {
      const { apiVotePoll } = await import("../api/polls");
      const { poll } = await apiVotePoll(tripId, voteModalPoll._id, [picked]);
      setPolls(p => p.map(v => v._id === poll._id ? poll : v));
      setVoteModalPoll(null); setPicked(null);
      toast("Your vote has been cast!");
    } catch (e) { toast(e.message || "Failed to cast vote"); }
  }

  const FILL_CLASSES = ["fill-terra", "fill-ocean", "fill-green", "fill-gold"];

  return (
    <PanelShell
      title={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{Icon.vote} Group Voting</span>}
      subtitle="Let the group decide together · anonymous voting"
      actions={<button className="nb-action-btn nb-action-primary" onClick={() => setCreateOpen(true)}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icon.plus} New Vote</span></button>}
    >
      {isLoading && <div style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>Loading polls…</div>}

      <div className="nb-vote-grid">
        {polls.map(v => (
          <div key={v._id} className="nb-vote-card">
            <div className="nb-vcf-header">
              <span className="nb-vcf-emoji" style={{ display: "flex" }}>{Icon.vote}</span>
              <div className="nb-vcf-q">{v.question}</div>
              <span className={`nb-vcf-status ${v.status === "active" ? "nb-vcf-open" : "nb-vcf-closed"}`}>
                {v.status.toUpperCase()}
              </span>
            </div>
            {v.options.map((o, i) => {
              const pct = v.totalVotes ? Math.round((o.voteCount / v.totalVotes) * 100) : 0;
              return (
                <div key={i} className="nb-vote-opt-row">
                  <div className="nb-vote-opt-name">{o.label}</div>
                  <div className="nb-vote-track">
                    <div className={`nb-vote-fill ${FILL_CLASSES[i % 4]}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="nb-vote-pct">{pct}%</div>
                </div>
              );
            })}
            <div className="nb-vcf-footer">
              <div className="nb-vcf-meta">
                {v.totalVotes} voted{v.hasVoted ? " · ✓ You voted" : ""}
              </div>
              {v.status === "active" && !v.hasVoted && (
                <button className="nb-vote-action" onClick={() => { setVoteModalPoll(v); setPicked(null); }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icon.vote} Vote Now</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {!isLoading && (
          <div className="nb-vote-card nb-vote-add" onClick={() => setCreateOpen(true)}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.3 }}>{Icon.plus}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--muted)", textAlign: "center" }}>Create a group vote<br /><span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>Ask your group anything</span></div>
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create a Group Vote" subtitle="Results visible to everyone."
        footer={<><button className="nb-modal-btn nb-modal-btn-ghost" onClick={() => setCreateOpen(false)}>Cancel</button><button className="nb-modal-btn nb-modal-btn-primary" onClick={handleCreate}>Create Vote</button></>}>
        <div className="nb-form-group"><label className="nb-form-label">Question</label><input className="nb-form-input" placeholder="e.g. Where to eat on Day 2?" value={form.q} onChange={e => setForm(f => ({ ...f, q: e.target.value }))} autoFocus /></div>
        <div className="nb-form-group"><label className="nb-form-label">Option 1</label><input className="nb-form-input" placeholder="First option..." value={form.o1} onChange={e => setForm(f => ({ ...f, o1: e.target.value }))} /></div>
        <div className="nb-form-group"><label className="nb-form-label">Option 2</label><input className="nb-form-input" placeholder="Second option..." value={form.o2} onChange={e => setForm(f => ({ ...f, o2: e.target.value }))} /></div>
        <div className="nb-form-group"><label className="nb-form-label">Option 3 (optional)</label><input className="nb-form-input" placeholder="Third option..." value={form.o3} onChange={e => setForm(f => ({ ...f, o3: e.target.value }))} /></div>
      </Modal>

      <Modal open={!!voteModalPoll} onClose={() => { setVoteModalPoll(null); setPicked(null); }} title={voteModalPoll?.question || ""} subtitle="Pick an option to cast your vote."
        footer={<><button className="nb-modal-btn nb-modal-btn-ghost" onClick={() => { setVoteModalPoll(null); setPicked(null); }}>Cancel</button><button className="nb-modal-btn nb-modal-btn-primary" onClick={handleVote}>Submit Vote</button></>}>
        {voteModalPoll?.options.map((o, i) => (
          <div key={i} className={`nb-vote-choice ${picked === i ? "selected" : ""}`} onClick={() => setPicked(i)}>
            <div className="nb-vote-radio" />{o.label}
          </div>
        ))}
      </Modal>
    </PanelShell>
  );
}

/* ─── PACKING PANEL ───────────────────────────────────────── */
// FIX: Removed DEFAULT_ITEMS entirely. The list now starts empty and loads
// from the backend via the checklist API. No more hardcoded names.
function PackingPanel({ toast, trip }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", who: "" });

  const tripId = trip?._id;

  // Load checklist from backend on mount
  useEffect(() => {
    if (!tripId) { setIsLoading(false); return; }
    import("../api/chat").then(({ fetchChecklist }) => {
      fetchChecklist(tripId)
        .then(({ data }) => setItems(data.items || []))
        .catch(() => toast("Failed to load packing list"))
        .finally(() => setIsLoading(false));
    });
  }, [tripId]);

  const done = items.filter(i => i.done || i.checked).length;
  const total = items.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const cats = [...new Set(items.map(i => i.category || i.cat || "Other"))];

  function toggle(idx) {
    const item = items[idx];
    const newDone = !(item.done || item.checked);

    // Optimistic update
    setItems(p => p.map((it, i) => i === idx ? { ...it, done: newDone, checked: newDone } : it));

    // Persist to backend
    if (tripId && item._id) {
      import("../api/chat").then(({ updateChecklistItem }) => {
        updateChecklistItem(tripId, item._id, { checked: newDone }).catch(() => {
          // Revert on failure
          setItems(p => p.map((it, i) => i === idx ? { ...it, done: !newDone, checked: !newDone } : it));
          toast("Failed to update item");
        });
      });
    }
  }

  function handleAdd() {
    if (!form.name.trim()) { toast("Please enter an item name"); return; }

        const newItem = {
          text: form.name,           // ← backend expects "text"
          assignedTo: form.who ? { name: form.who } : { name: "Everyone" },
          category: "other",         // ← lowercase to match schema enum
        };

    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    setItems(p => [...p, { ...newItem, _id: tempId, text: form.name, checked: false, done: false }]);
    setForm({ name: "", who: "" });
    setAddOpen(false);
    toast(`${form.name} added to packing list!`);

    // Persist to backend
    if (tripId) {
      import("../api/chat").then(({ addChecklistItem }) => {
        addChecklistItem(tripId, newItem)
          .then(({ data }) => {
            // Replace temp item with real one from DB
            setItems(p => p.map(it => it._id === tempId ? data.item : it));
          })
          .catch(() => {
            setItems(p => p.filter(it => it._id !== tempId));
            toast("Failed to add item");
          });
      });
    }
  }

  return (
    <PanelShell
      title={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{Icon.packing} Packing List</span>}
      subtitle={`${done} of ${total} items checked · synced for everyone`}
      actions={<button className="nb-action-btn nb-action-primary" onClick={() => setAddOpen(true)}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icon.plus} Add Item</span></button>}
    >
      <div className="nb-packing-layout">
        <div>
          <div className="nb-pack-progress">
            <div className="nb-ppb-label"><span>{done} / {total} items</span><span>{pct}%</span></div>
            <div className="nb-ppb-track"><div className="nb-ppb-fill" style={{ width: `${pct}%` }} /></div>
          </div>

          {isLoading && (
            <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.8rem", padding: 30 }}>
              Loading packing list…
            </div>
          )}

          {!isLoading && items.length === 0 && (
            <div className="nb-empty" style={{ padding: 30 }}>
              <div className="nb-empty-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{Icon.packing}</div>
              <div className="nb-empty-title">No items yet</div>
              <p className="nb-empty-desc">Add items to your shared packing list — everyone in the group can check them off.</p>
              <button className="nb-empty-cta" onClick={() => setAddOpen(true)}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icon.plus} Add First Item</span></button>
            </div>
          )}

          {!isLoading && cats.map(cat => (
            <div key={cat}>
              <div className="nb-pack-cat-head">{cat}</div>
              {items.map((it, i) => {
                const itemCat = it.category || it.cat || "Other";
                if (itemCat !== cat) return null;
                const isDone = it.done || it.checked;
                // assignedTo comes from DB; fall back to legacy `who` field
                const assignedLabel = 
                  (typeof it.assignedTo === 'object' ? it.assignedTo?.name : it.assignedTo) || 
                  it.who || 
                  "Unassigned";
                return (
                  <div key={it._id || i} className={`nb-pack-item ${isDone ? "done" : ""}`} onClick={() => toggle(i)}>
                    <div className="nb-pack-checkbox">{isDone && <span style={{ display: "flex" }}>{Icon.check}</span>}</div>
                    <div className="nb-pack-name">{it.text || it.name}</div>
                    <div className="nb-pack-who">{assignedLabel}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div>
          <div className="nb-packing-stat"><div className="nb-psc-num">{done}</div><div className="nb-psc-label">Items Packed</div></div>
          <div className="nb-packing-stat"><div className="nb-psc-num">{total - done}</div><div className="nb-psc-label">Items Left</div></div>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Packing Item" subtitle="Add to the shared checklist."
        footer={<><button className="nb-modal-btn nb-modal-btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button><button className="nb-modal-btn nb-modal-btn-primary" onClick={handleAdd}>Add Item</button></>}>
        <div className="nb-form-group"><label className="nb-form-label">Item Name</label><input className="nb-form-input" placeholder="e.g. First aid kit" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus /></div>
        <div className="nb-form-group"><label className="nb-form-label">Assigned To</label><input className="nb-form-input" placeholder="e.g. Everyone, or leave blank" value={form.who} onChange={e => setForm(f => ({ ...f, who: e.target.value }))} /></div>
      </Modal>
    </PanelShell>
  );
}

/* ─── CHAT PANEL ──────────────────────────────────────────── */
function ChatPanel({ toast, trip }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimer = useRef(null);
  const isTyping = useRef(false);

  const tripId = trip?._id;
  const sender = {
    userId: user?.id || user?._id || null,  // ← id first, then _id as fallback
    name: user?.name || "Guest",
    isGuest: !user,
    guestId: null,
  };

  // ── Connect socket once ───────────────────────────────────
  useEffect(() => {
    if (!tripId) return;

    const socket = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000", {
      auth: { token: localStorage.getItem("travelogue_token") || "" },
    });
    socketRef.current = socket;

    socket.emit("chat:join", { tripId, user: sender });

    // FIX: Handle tempId to swap optimistic message with real persisted one.
    // If the server echoes back our own message with a tempId, replace the
    // optimistic bubble. For messages from other users, just dedup by _id.
    socket.on("chat:message", (msg) => {
      setMessages(prev => {
        if (msg.tempId) {
          // Replace our optimistic bubble with the confirmed message
          return prev.map(m => m._id === msg.tempId ? { ...msg, optimistic: false } : m);
        }
        // Dedup by real _id for messages from other users
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("chat:typing_update", ({ users }) => setTypingUsers(users));

    socket.on("chat:message_deleted", ({ messageId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    });

    // Load message history
    fetchMessages(tripId)
      .then(({ data }) => setMessages(data.messages))
      .catch(() => toast("Failed to load messages"))
      .finally(() => setIsLoading(false));

    return () => socket.disconnect();
  }, [tripId]);

  // ── Scroll to bottom on new messages ─────────────────────
  useEffect(() => {
    if (messagesRef.current)
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, typingUsers]);

  // ── Send message ──────────────────────────────────────────
  function send() {
    if (!input.trim() || !socketRef.current) return;

    // FIX: Use tempId so the server can echo it back and we can swap
    // the optimistic bubble with the real persisted message.
    const tempId = `opt-${Date.now()}`;

    const optimistic = {
      _id: tempId,   // use tempId as _id so we can find & replace it
      sender,
      content: input.trim(),
      createdAt: new Date().toISOString(),
      optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);

    socketRef.current.emit("chat:send", {
      tripId,
      content: input.trim(),
      sender,
      tempId, // send to server so it echoes back in the response
    });
    setInput("");
    stopTyping();
  }

  // ── Typing indicators ─────────────────────────────────────
  function startTyping() {
    if (isTyping.current || !socketRef.current) return;
    isTyping.current = true;
    socketRef.current.emit("chat:typing_start", { tripId, name: sender.name });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, 2500);
  }

  function stopTyping() {
    if (!isTyping.current || !socketRef.current) return;
    isTyping.current = false;
    clearTimeout(typingTimer.current);
    socketRef.current.emit("chat:typing_stop", { tripId });
  }

  function getBubbleColor(name) {
    const colors = ["var(--terracotta)", "var(--ocean)", "var(--green)", "#C8A03A", "#9B59B6"];
    let hash = 0;
    for (let c of (name || "")) hash = c.charCodeAt(0) + hash;
    return colors[hash % colors.length];
  }

function isMine(msg) {
  if (msg.optimistic) return true;
  const myId = user?.id || user?._id;
  if (myId && msg.sender?.userId) {
    return msg.sender.userId.toString() === myId.toString();
  }
  return false;
}

  return (
    <div className="nb-content-area">
      <div className="nb-chat-wrap">
        {/* Header */}
        <div className="nb-chat-header">
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(200,98,58,0.15)", border: "1px solid rgba(200,98,58,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--terracotta)", flexShrink: 0 }}>{Icon.chat}</div>
          <div className="nb-chat-header-info">
            <div className="nb-chat-header-title">{trip?.name || "Trip"} · Group Chat</div>
            <div className="nb-chat-header-meta">Live · all members</div>
          </div>
        </div>

        {/* Messages */}
        <div className="nb-chat-messages" ref={messagesRef}>
          <div className="nb-date-divider"><span>Group Chat</span></div>

          {isLoading && (
            <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.8rem", padding: 20 }}>
              Loading messages…
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.8rem", padding: 40 }}>
              No messages yet — say hello! 👋
            </div>
          )}

          {messages.map(msg => (
            <div key={msg._id} className={`nb-msg-group ${isMine(msg) ? "mine" : "theirs"}`}>
              <div className="nb-msg-author-row">
                <div className="nb-msg-mini-av" style={{ background: getBubbleColor(msg.sender?.name) }}>
                  {msg.sender?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="nb-msg-author-name">
                  {isMine(msg) ? "You" : msg.sender?.name}
                  {msg.sender?.isGuest && <em style={{ fontSize: "0.65rem", color: "var(--muted)" }}> (guest)</em>}
                </span>
                <span className="nb-msg-timestamp">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
             <div
              className="nb-msg-bubble"
              style={
                isMine(msg)
                  ? {} // keep your existing terracotta CSS for "mine"
                  : { background: getBubbleColor(msg.sender?.name) + "33", borderLeft: `3px solid ${getBubbleColor(msg.sender?.name)}` }
              }
            >
              {msg.content}
              {msg.optimistic && <span style={{ opacity: 0.4, fontSize: "0.65rem", marginLeft: 6 }}>sending…</span>}
            </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="nb-typing">
              <div className="nb-typing-dots"><span /><span /><span /></div>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", marginLeft: 4 }}>
                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing…
              </span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="nb-chat-input-bar">
          <textarea
            className="nb-chat-input"
            placeholder="Message the group…"
            value={input}
            onChange={e => { setInput(e.target.value); if (e.target.value) startTyping(); else stopTyping(); }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
          />
          <button className="nb-send-btn" onClick={send} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {Icon.send}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── SHARE PANEL ─────────────────────────────────────────── */
function SharePanel({ toast, trip, user }) {
  const [links, setLinks]       = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm]         = useState({ role: "member", guestAccess: false, maxUses: "", expiresAt: "" });
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied]     = useState(null); // linkId that was copied

  const tripId  = trip?._id;
  const myId = user?.id || user?._id;
  const ownerId = trip?.owner?._id || trip?.owner;
  const isOwner = !!myId && !!ownerId && myId.toString() === ownerId.toString();

  useEffect(() => {
    if (!tripId || !isOwner) { setIsLoading(false); return; }
    import("../api/invites").then(({ apiGetInviteLinks }) => {
      apiGetInviteLinks(tripId)
        .then(({ links }) => setLinks(links))
        .catch(() => toast("Failed to load invite links"))
        .finally(() => setIsLoading(false));
    });
  }, [tripId]);

  async function handleGenerate() {
    setCreating(true);
    try {
      const { apiGenerateInviteLink } = await import("../api/invites");
      const { link } = await apiGenerateInviteLink(tripId, {
        role: form.role,
        guestAccess: form.guestAccess,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      });
      setLinks(p => [link, ...p]);
      setShowForm(false);
      toast("Invite link generated!");
    } catch (e) { toast(e.message || "Failed to generate link"); }
    finally { setCreating(false); }
  }

  async function handleRevoke(linkId) {
    try {
      const { apiRevokeInviteLink } = await import("../api/invites");
      await apiRevokeInviteLink(tripId, linkId);
      setLinks(p => p.filter(l => l._id !== linkId));
      toast("Link revoked");
    } catch (e) { toast(e.message); }
  }

  function handleCopy(link) {
    navigator.clipboard.writeText(link.url);
    setCopied(link._id);
    toast("Link copied!");
    setTimeout(() => setCopied(null), 2200);
  }

  function expiryLabel(link) {
    if (!link.expiresAt) return "No expiry";
    const d = new Date(link.expiresAt);
    return d < new Date() ? "Expired" : `Expires ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
  }

  return (
    <PanelShell
      title={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{Icon.sharePanel} Share & Invite</span>}
      subtitle="Generate invite links · manage who can join your trip"
      actions={isOwner && (
        <button className="nb-action-btn nb-action-primary" onClick={() => setShowForm(true)}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icon.plus} New Invite Link</span>
        </button>
      )}
    >
      {isLoading && <div style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>Loading…</div>}

      {!isLoading && !isOwner && (
        <div className="nb-empty">
          <div className="nb-empty-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{Icon.sharePanel}</div>
          <div className="nb-empty-title">Only the trip owner can manage invite links</div>
        </div>
      )}

      {!isLoading && isOwner && links.length === 0 && !showForm && (
        <div className="nb-empty">
          <div className="nb-empty-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{Icon.link}</div>
          <div className="nb-empty-title">No invite links yet</div>
          <p className="nb-empty-desc">Generate a link and share it — anyone with the link can join instantly.</p>
          <button className="nb-empty-cta" onClick={() => setShowForm(true)}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icon.plus} Generate First Link</span>
          </button>
        </div>
      )}

      {/* Links list */}
      {links.map(link => (
        <div key={link._id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ display: "flex", color: "var(--terracotta)" }}>{Icon.link}</span>
            <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.url}</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "2px 10px", borderRadius: 50, background: link.active ? "rgba(40,200,64,0.12)" : "rgba(255,95,87,0.12)", color: link.active ? "#28C840" : "#FF5F57", border: `1px solid ${link.active ? "rgba(40,200,64,0.2)" : "rgba(255,95,87,0.2)"}` }}>
              {link.active ? "ACTIVE" : "REVOKED"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: "0.7rem", color: "var(--muted)", marginBottom: 12, flexWrap: "wrap" }}>
            <span>Role: <strong style={{ color: "var(--text-dim)" }}>{link.role}</strong></span>
            <span>Uses: <strong style={{ color: "var(--text-dim)" }}>{link.currentUses}{link.maxUses ? ` / ${link.maxUses}` : ""}</strong></span>
            <span>Guest: <strong style={{ color: "var(--text-dim)" }}>{link.guestAccess ? "Yes" : "No"}</strong></span>
            <span style={{ color: new Date(link.expiresAt) < new Date() ? "#FF5F57" : "var(--muted)" }}>{expiryLabel(link)}</span>
          </div>
          {link.active && (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="nb-action-btn nb-action-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleCopy(link)}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{copied === link._id ? Icon.check : Icon.copy} {copied === link._id ? "Copied!" : "Copy Link"}</span>
              </button>
              <button className="nb-action-btn nb-action-ghost" style={{ color: "#FF5F57" }} onClick={() => handleRevoke(link._id)}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icon.close} Revoke</span>
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Create link modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Generate Invite Link" subtitle="Configure access settings for this invite."
        footer={<><button className="nb-modal-btn nb-modal-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button><button className="nb-modal-btn nb-modal-btn-primary" onClick={handleGenerate} disabled={creating}>{creating ? "Generating…" : "Generate Link"}</button></>}>
        <div className="nb-form-row-2">
          <div className="nb-form-group">
            <label className="nb-form-label">Role</label>
            <select className="nb-form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="member">Member (can edit)</option>
              <option value="viewer">Viewer (read only)</option>
            </select>
          </div>
          <div className="nb-form-group">
            <label className="nb-form-label">Max Uses</label>
            <input className="nb-form-input" type="number" placeholder="Unlimited" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} />
          </div>
        </div>
        <div className="nb-form-group">
          <label className="nb-form-label">Expiry Date</label>
          <input className="nb-form-input" type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
        </div>
        <div className="nb-form-group">
          <label className="nb-form-label">Guest Access</label>
          <select className="nb-form-select" value={form.guestAccess} onChange={e => setForm(f => ({ ...f, guestAccess: e.target.value === "true" }))}>
            <option value="false">No — requires account</option>
            <option value="true">Yes — anyone with link</option>
          </select>
        </div>
      </Modal>
    </PanelShell>
  );
}
/* ─── NAV CONFIG ──────────────────────────────────────────── */
const NAV = [
  {
    section: "Planning", items: [
      { id: "itinerary", label: "Itinerary", icon: "itinerary", live: true },
      { id: "calendar", label: "Calendar", icon: "calendar" },
      { id: "map", label: "Map", icon: "map" },
    ]
  },
  {
    section: "Group", items: [
      { id: "voting", label: "Voting", icon: "vote" },
      { id: "packing", label: "Packing", icon: "packing" },
      { id: "chat", label: "Group Chat", icon: "chat", live: true },
    ]
  },
];
const ALL_TABS = NAV.flatMap(s => s.items);

/* ─── MAIN NOTEBOOK ───────────────────────────────────────── */
export default function Notebook({ trip }) {
  const [active, setActive] = useState("itinerary");
  const navigate = useNavigate();
  const { toasts, show: toast } = useToast();
  const { user } = useAuth();

  const tripName = trip?.name || "My Trip Notebook";
  const tripDest = trip?.dest || "";
  const startDate = formatDate(trip?.startDate);
  const endDate = formatDate(trip?.endDate);
  const datesLabel = startDate && endDate ? `${startDate} – ${endDate}` : "Dates TBD";
  const vibeIcon = getVibeIcon(trip?.vibe);

 const renderPanel = () => {
  switch (active) {
    case "itinerary": return <ItineraryPanel toast={toast} trip={trip} />;  
    case "calendar":  return <CalendarPanel  toast={toast} trip={trip} />;  
    case "map":       return <TripMap        trip={trip}   toast={toast} />;
    case "voting":    return <VotingPanel    toast={toast} trip={trip} />;
    case "packing":   return <PackingPanel   toast={toast} trip={trip} />;
    case "chat":      return <ChatPanel      toast={toast} trip={trip} />;
    case "share":     return <SharePanel     toast={toast} trip={trip} user={user} />;
    default:          return <ItineraryPanel toast={toast} trip={trip} />;  
  }
};

  return (
    <div className="nb-root">
      {/* ── TOPBAR ── */}
      <header className="nb-topbar">
        {trip ? (
          <button className="nb-btn" onClick={() => navigate("/dashboard")} style={{ flexShrink: 0 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{Icon.back} Dashboard</span>
          </button>
        ) : (
          <span className="nb-logo">Travel<em>ogue</em></span>
        )}
        <div className="nb-topbar-divider" />
        <div className="nb-trip-info">
          <div className="nb-trip-emoji" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{vibeIcon}</div>
          <div>
            <div className="nb-trip-name">{tripName}</div>
            <div className="nb-trip-meta">{datesLabel}{tripDest ? ` · ${tripDest}` : ""}</div>
          </div>
        </div>
        <div className="nb-topbar-actions">
          <button className="nb-btn nb-btn-primary" onClick={() => setActive("share")}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{Icon.share} Share Trip</span>
          </button>
        </div>
      </header>

      {/* ── MOBILE TABS ── */}
      <nav className="nb-mobile-tabs">
        {ALL_TABS.map(t => (
          <button key={t.id} className={`nb-mobile-tab ${active === t.id ? "active" : ""}`} onClick={() => setActive(t.id)}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{Icon[t.icon]} {t.label}</span>
          </button>
        ))}
      </nav>

      {/* ── BODY ── */}
      <div className="nb-body">
        {/* SIDEBAR */}
        <aside className="nb-sidebar">
          <div className="nb-trip-card">
            <span className="nb-stc-emoji" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{vibeIcon}</span>
            <div className="nb-stc-name">{tripName}</div>
            <div className="nb-stc-dates">{datesLabel}</div>
            <div className="nb-stc-member-row">
            {(() => {
              const colors = ["var(--terracotta)", "var(--ocean)", "var(--green)", "#C8A03A", "#9B59B6"];
              const allMembers = (trip?.members || []).map(m => ({
                initial: typeof m === "object" ? m?.name?.charAt(0).toUpperCase() : "?"
              }));
              const display = allMembers.slice(0, 5);
              const extra = allMembers.length - 5;
              return (
                <>
                  {display.map((m, i) => (
                    <div key={i} className="nb-stc-av" style={{ background: colors[i % colors.length] }}>
                      {m.initial}
                    </div>
                  ))}
                  {extra > 0 && (
                    <div className="nb-stc-av" style={{ background: "rgba(255,255,255,0.15)" }}>
                      +{extra}
                    </div>
                  )}
                  <span className="nb-stc-member-count">
                    {allMembers.length} member{allMembers.length !== 1 ? "s" : ""}
                  </span>
                </>
              );
            })()}
          </div>
          </div>

          {NAV.map(section => (
            <div key={section.section}>
              <div className="nb-section-label">{section.section}</div>
              {section.items.map(item => (
                <button key={item.id} className={`nb-sidebar-item ${active === item.id ? "active" : ""}`} onClick={() => setActive(item.id)}>
                  <span className="nb-s-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{Icon[item.icon]}</span>
                  {item.label}
                  {item.live && <div className="nb-sidebar-live" />}
                </button>
              ))}
            </div>
          ))}

          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            <button className="nb-sidebar-item" onClick={() => setActive("share")} style={{ width: "100%" }}>
              <span className="nb-s-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{Icon.sharePanel}</span>
              Share Trip
            </button>
          </div>
        </aside>

        {/* CONTENT */}
        {renderPanel()}
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}