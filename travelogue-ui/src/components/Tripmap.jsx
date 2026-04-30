/**
 * TripMap.jsx — Vanilla Leaflet with click-to-pin
 * ------------------------------------------------
 * - Click anywhere on the map to drop a pin
 * - Reverse geocodes the clicked location automatically
 * - Popup form appears to confirm name, day, category
 * - Saves to MongoDB via apiAddPin
 * - "Pin Location" button still works for manual entry
 *
 * Place at: travelogue-ui/src/components/TripMap.jsx
 * Requires: npm install leaflet (no react-leaflet)
 */

import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiAddPin, apiDeletePin } from "../api/trips";

// ── Fix Leaflet default marker icons broken by Vite ──────────────────────────
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl:     markerShadow,
});

// ── Category colours matching Notebook.css ───────────────────────────────────
const CAT_COLOR = {
  explore:   "#3A7CA5",
  food:      "#C8A03A",
  stay:      "#5C7A5E",
  transport: "#C8623A",
};
const CAT_LABEL = {
  explore: "Explore", food: "Food", stay: "Stay", transport: "Transport",
};

// ── Custom SVG pin marker ─────────────────────────────────────────────────────
function makePinIcon(category, isActive = false) {
  const color = CAT_COLOR[category] || CAT_COLOR.explore;
  const size  = isActive ? 38 : 30;
  const ring  = isActive
    ? `<circle cx="15" cy="15" r="14" fill="none" stroke="${color}" stroke-width="2" opacity="0.35"/>`
    : "";
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 30 30">
      ${ring}
      <circle cx="15" cy="12" r="9" fill="${color}" opacity="0.18"/>
      <circle cx="15" cy="12" r="6" fill="${color}"/>
      <circle cx="15" cy="12" r="2.5" fill="white" opacity="0.9"/>
      <line x1="15" y1="18" x2="15" y2="26" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    className:   "",
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size - 2],
    popupAnchor: [0, -(size - 4)],
  });
}

// ── Temporary "drop" marker (shown while form is open) ───────────────────────
function makeTempIcon() {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="12" r="9" fill="rgba(200,98,58,0.2)"/>
      <circle cx="15" cy="12" r="6" fill="#C8623A" opacity="0.7"/>
      <circle cx="15" cy="12" r="2.5" fill="white" opacity="0.8"/>
      <line x1="15" y1="18" x2="15" y2="26" stroke="#C8623A" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
      <animateTransform attributeName="transform" type="translate" values="0,-4;0,0" dur="0.25s" fill="freeze"/>
    </svg>`,
    className:   "",
    iconSize:    [30, 30],
    iconAnchor:  [15, 28],
    popupAnchor: [0, -26],
  });
}

// ── Nominatim reverse geocoder ────────────────────────────────────────────────
async function reverseGeocode(lat, lng) {
  try {
    const url  = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res  = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (data?.display_name) {
      // Return a short readable name: first 2 parts of display_name
      const parts = data.display_name.split(",");
      const short = parts.slice(0, 2).join(",").trim();
      return { name: short, full: data.display_name };
    }
  } catch (_) {}
  return null;
}

// ── Nominatim forward geocoder (for manual search) ───────────────────────────
async function geocode(query) {
  try {
    const url  = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res  = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (data?.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (_) {}
  return null;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const MI = {
  pin:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  plus:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  close:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  trash:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  route:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h3M3 6h3M3 18h3M9 6h6a3 3 0 0 1 0 6H9v6h6a3 3 0 0 0 0-6"/></svg>,
  locate: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>,
  check:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  map:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  cursor: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l14 9-7 1-4 7z"/></svg>,
};

const DAY_OPTIONS = Array.from({ length: 10 }, (_, i) => `Day ${i + 1}`);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function TripMap({ trip, toast }) {
  const mapRef       = useRef(null);   // DOM node
  const leafletRef   = useRef(null);   // L.Map instance
  const markersRef   = useRef({});     // pinId → L.Marker
  const routeRef     = useRef(null);   // L.Polyline
  const tempMarkerRef = useRef(null);  // temporary click marker

  const [pins,       setPins]       = useState(trip?.pins || []);
  const [activePin,  setActivePin]  = useState(null);
  const [showRoute,  setShowRoute]  = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(null);

  // ── Click-to-pin modal state ─────────────────────────────────────────────
  const [clickModal,  setClickModal]  = useState(false);  // click-on-map modal
  const [manualModal, setManualModal] = useState(false);  // "Pin Location" button modal
  const [pendingCoords, setPendingCoords] = useState(null); // {lat, lng} from map click
  const [reverseLoading, setReverseLoading] = useState(false);

  // Shared form state used by both modals
  const [form, setForm] = useState({ name: "", desc: "", day: "Day 1", category: "explore" });

  // Manual modal geocoding
  const [geocoding,  setGeocoding]  = useState(false);
  const [geoResult,  setGeoResult]  = useState(null);
  const debounceRef  = useRef(null);

  const tripId = trip?._id;

  useEffect(() => { if (trip?.pins) setPins(trip.pins); }, [trip?.pins]);

  // ── Init Leaflet map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    const firstPin = (trip?.pins || []).find(p => p.lat && p.lng);
    const center   = firstPin ? [firstPin.lat, firstPin.lng] : [25.0, 25.0];
    const zoom     = firstPin ? 8 : 2;

    const map = L.map(mapRef.current, { center, zoom, zoomControl: false });

    L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
      { attribution: '© <a href="https://stadiamaps.com/">Stadia Maps</a>', maxZoom: 20 }
    ).addTo(map);

    // ── CLICK TO PIN ────────────────────────────────────────────────────────
    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;

      // Drop a temporary marker immediately so user gets feedback
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }
      const tempMarker = L.marker([lat, lng], { icon: makeTempIcon() }).addTo(map);
      tempMarkerRef.current = tempMarker;

      // Reset form with coordinates
      setForm({ name: "", desc: "", day: "Day 1", category: "explore" });
      setPendingCoords({ lat, lng });
      setClickModal(true);

      // Reverse geocode in background — pre-fill name
      setReverseLoading(true);
      const result = await reverseGeocode(lat, lng);
      if (result) {
        setForm(f => ({ ...f, name: f.name || result.name }));
      }
      setReverseLoading(false);
    });

    leafletRef.current = map;

    return () => {
      map.remove();
      leafletRef.current = null;
      markersRef.current = {};
      routeRef.current   = null;
      tempMarkerRef.current = null;
    };
  }, []); // eslint-disable-line

  // ── Sync markers ─────────────────────────────────────────────────────────
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;

    const currentIds = new Set(pins.map(p => p._id));

    // Remove stale markers
    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add/update markers
    pins.forEach(pin => {
      if (!pin.lat || !pin.lng) return;
      const isActive = pin._id === activePin;

      if (markersRef.current[pin._id]) {
        markersRef.current[pin._id].setIcon(makePinIcon(pin.category, isActive));
      } else {
        const color  = CAT_COLOR[pin.category] || CAT_COLOR.explore;
        const marker = L.marker([pin.lat, pin.lng], { icon: makePinIcon(pin.category, isActive) }).addTo(map);

        marker.bindPopup(`
          <div style="font-family:'DM Sans',sans-serif;background:#1E1410;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px 14px;min-width:170px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:${pin.desc ? "6px" : "0"}">
              <div style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0"></div>
              <strong style="font-size:0.88rem;color:rgba(255,255,255,0.88)">${pin.name}</strong>
            </div>
            ${pin.desc ? `<p style="font-size:0.75rem;color:rgba(255,255,255,0.45);margin:0;line-height:1.5">${pin.desc}</p>` : ""}
            <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
              <span style="font-size:0.62rem;padding:2px 9px;border-radius:50px;font-weight:700;background:${color}22;color:${color}">${CAT_LABEL[pin.category] || "Explore"}</span>
              ${pin.day ? `<span style="font-size:0.62rem;padding:2px 9px;border-radius:50px;background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.4);font-weight:600">${pin.day}</span>` : ""}
              ${pin.lat ? `<span style="font-size:0.6rem;padding:2px 9px;border-radius:50px;background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.2);font-family:monospace">${pin.lat.toFixed(3)}, ${pin.lng.toFixed(3)}</span>` : ""}
            </div>
          </div>
        `, { className: "tm-popup" });

        marker.on("click", () => setActivePin(pin._id));
        markersRef.current[pin._id] = marker;
      }
    });

    // Route polyline
    if (routeRef.current) { routeRef.current.remove(); routeRef.current = null; }
    if (showRoute) {
      const pts = pins.filter(p => p.lat && p.lng).map(p => [p.lat, p.lng]);
      if (pts.length > 1) {
        routeRef.current = L.polyline(pts, {
          color: "rgba(200,98,58,0.55)", weight: 2.5, dashArray: "8 5",
        }).addTo(map);
      }
    }
  }, [pins, activePin, showRoute]);

  // ── Fly to active pin ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!activePin || !leafletRef.current) return;
    const pin = pins.find(p => p._id === activePin);
    if (pin?.lat && pin?.lng) leafletRef.current.flyTo([pin.lat, pin.lng], 14, { duration: 1.2 });
  }, [activePin]);

  // ── Remove temp marker when click modal closes ────────────────────────────
  useEffect(() => {
    if (!clickModal && tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }
  }, [clickModal]);

  // ── Save pin (used by both modals) ────────────────────────────────────────
  async function savePin(lat, lng) {
    if (!form.name.trim()) { toast("Please enter a place name"); return; }
    if (!tripId) { toast("No trip loaded"); return; }

    setSaving(true);
    try {
      const updated = await apiAddPin(tripId, {
        name:     form.name.trim(),
        desc:     form.desc.trim(),
        day:      form.day,
        category: form.category,
        lat:      lat ?? null,
        lng:      lng ?? null,
      });

      // Controller returns the full populated trip
      const newPins = updated.pins ?? updated;
      setPins(Array.isArray(newPins) ? newPins : pins);

      toast(lat ? `📍 ${form.name.trim()} pinned!` : `${form.name.trim()} saved (no coordinates)`);
      setForm({ name: "", desc: "", day: "Day 1", category: "explore" });
      setGeoResult(null);
      setClickModal(false);
      setManualModal(false);
      setPendingCoords(null);
    } catch (err) {
      toast(err.message || "Failed to save pin");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete pin ────────────────────────────────────────────────────────────
  async function handleDelete(pinId, e) {
    e.stopPropagation();
    if (!tripId) return;
    setDeleting(pinId);
    try {
      const updated = await apiDeletePin(tripId, pinId);
      const newPins = updated.pins ?? updated;
      setPins(Array.isArray(newPins) ? newPins : pins.filter(p => p._id !== pinId));
      if (activePin === pinId) setActivePin(null);
      toast("Pin removed");
    } catch (err) {
      toast(err.message || "Failed to delete pin");
    } finally {
      setDeleting(null);
    }
  }

  // ── Manual modal: geocode debounce ────────────────────────────────────────
  function handleNameChange(val) {
    setForm(f => ({ ...f, name: val }));
    setGeoResult(null);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 3) return;
    debounceRef.current = setTimeout(async () => {
      setGeocoding(true);
      const result = await geocode(val);
      if (result) setGeoResult(result);
      setGeocoding(false);
    }, 800);
  }

  // ── Shared form fields JSX ────────────────────────────────────────────────
  function FormFields({ showNameGeocoder = false }) {
    return (
      <>
        <div className="nb-form-group">
          <label className="nb-form-label">Place Name</label>
          <div style={{ position: "relative" }}>
            <input
              className="nb-form-input"
              placeholder="e.g. Aït Benhaddou, Morocco"
              value={form.name}
              onChange={e => showNameGeocoder ? handleNameChange(e.target.value) : setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
              style={{ paddingRight: showNameGeocoder ? 36 : undefined }}
            />
            {showNameGeocoder && (
              <span style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                color: geocoding ? "var(--muted)" : geoResult ? "var(--green-light)" : "transparent",
                display: "flex",
              }}>
                {geocoding
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "tm-spin 0.9s linear infinite", transformOrigin: "center" }}><path d="M12 2a10 10 0 1 0 10 10"/></svg>
                  : geoResult ? MI.check : null}
              </span>
            )}
          </div>
          {showNameGeocoder && geoResult && !geocoding && (
            <div style={{ marginTop: 6, padding: "8px 12px", background: "rgba(92,122,94,0.1)", border: "1px solid rgba(92,122,94,0.25)", borderRadius: 8, fontSize: "0.72rem", color: "var(--green-light)", display: "flex", alignItems: "flex-start", gap: 6 }}>
              {MI.check} Coordinates found — will pin on map
            </div>
          )}
        </div>

        <div className="nb-form-group">
          <label className="nb-form-label">Description (optional)</label>
          <textarea
            className="nb-form-textarea"
            placeholder="Why is this place on the trip?"
            value={form.desc}
            onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
            style={{ minHeight: 70 }}
          />
        </div>

        <div className="nb-form-row-2">
          <div className="nb-form-group">
            <label className="nb-form-label">Trip Day</label>
            <select className="nb-form-select" value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}>
              {DAY_OPTIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="nb-form-group">
            <label className="nb-form-label">Category</label>
            <select className="nb-form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="explore">Explore</option>
              <option value="food">Food</option>
              <option value="stay">Stay</option>
              <option value="transport">Transport</option>
            </select>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="nb-content-area">

        {/* TOPBAR */}
        <div className="nb-panel-topbar">
          <div>
            <div className="nb-panel-title" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {MI.map} Interactive Map
            </div>
            <div className="nb-panel-subtitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {pins.length} location{pins.length !== 1 ? "s" : ""} pinned
              {pins.filter(p => p.lat && p.lng).length > 1 ? ` · route through ${pins.filter(p => p.lat && p.lng).length} stops` : ""}
              <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 50, border: "1px solid rgba(255,255,255,0.07)" }}>
                {MI.cursor} click map to pin
              </span>
            </div>
          </div>
          <div className="nb-panel-actions">
            <button
              className="nb-action-btn nb-action-ghost"
              onClick={() => setShowRoute(r => !r)}
              style={showRoute ? { color: "var(--terracotta-light)", borderColor: "rgba(200,98,58,0.4)" } : {}}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                {MI.route} {showRoute ? "Hide Route" : "Show Route"}
              </span>
            </button>
            <button className="nb-action-btn nb-action-primary" onClick={() => { setForm({ name: "", desc: "", day: "Day 1", category: "explore" }); setGeoResult(null); setManualModal(true); }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                {MI.pin} Pin Location
              </span>
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="nb-panel-body" style={{ padding: 0, overflow: "hidden" }}>
          <div className="nb-map-layout" style={{ height: "100%" }}>

            {/* MAP */}
            <div style={{ position: "relative", overflow: "hidden" }}>
              <div ref={mapRef} style={{ height: "100%", width: "100%", cursor: "crosshair" }} />

              {/* Zoom controls */}
              <div className="nb-map-controls" style={{ zIndex: 800 }}>
                <button className="nb-map-ctrl" onClick={() => leafletRef.current?.zoomIn()}>+</button>
                <button className="nb-map-ctrl" onClick={() => leafletRef.current?.zoomOut()}>−</button>
                <button className="nb-map-ctrl" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={() => { const p = pins.find(x => x.lat && x.lng); if (p) leafletRef.current?.flyTo([p.lat, p.lng], 8); }}
                  title="Centre on first pin"
                >{MI.locate}</button>
              </div>

              {/* Empty state hint */}
              {pins.filter(p => p.lat && p.lng).length === 0 && (
                <div className="nb-map-empty" style={{ zIndex: 700, pointerEvents: "none" }}>
                  <div style={{ fontSize: "2.5rem", opacity: 0.12, display: "flex" }}>{MI.map}</div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.15)", fontWeight: 600 }}>Click anywhere on the map to pin a location</div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.1)" }}>or use the "Pin Location" button above</div>
                </div>
              )}
            </div>

            {/* PIN SIDEBAR */}
            <div style={{ overflowY: "auto", padding: "20px 20px 32px" }}>
              <div className="nb-map-pins-header">PINNED LOCATIONS</div>

              {pins.length === 0 ? (
                <div className="nb-map-pins-empty">
                  <div style={{ fontSize: "1.5rem", marginBottom: 8, opacity: 0.3, display: "flex", alignItems: "center", justifyContent: "center" }}>{MI.pin}</div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.2)" }}>Click the map to add your first pin</div>
                </div>
              ) : pins.map((pin, idx) => (
                <div
                  key={pin._id || idx}
                  className="nb-map-loc-card"
                  onClick={() => setActivePin(pin._id)}
                  style={activePin === pin._id ? { borderColor: CAT_COLOR[pin.category] || "var(--terracotta)", background: `${CAT_COLOR[pin.category] || CAT_COLOR.explore}10` } : {}}
                >
                  <div className="nb-mlc-header">
                    <div className="nb-mlc-color" style={{ background: CAT_COLOR[pin.category] || CAT_COLOR.explore }} />
                    <div className="nb-mlc-name">{pin.name}</div>
                    <div className="nb-mlc-day" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {pin.day}
                      <button
                        onClick={e => handleDelete(pin._id, e)}
                        disabled={deleting === pin._id}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", padding: "2px 4px", borderRadius: 4, display: "flex", alignItems: "center" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#FF5F57"}
                        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
                      >{MI.trash}</button>
                    </div>
                  </div>
                  {pin.desc && <div className="nb-mlc-desc">{pin.desc}</div>}
                  {pin.lat && pin.lng
                    ? <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", marginTop: 6, fontFamily: "monospace" }}>{pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}</div>
                    : <div style={{ fontSize: "0.62rem", color: "rgba(200,160,58,0.55)", marginTop: 6 }}>⚠ No coordinates</div>
                  }
                  <div className="nb-mlc-tags">
                    <span className={`nb-tag tag-${pin.category || "explore"}`} style={{ marginTop: 4 }}>
                      {CAT_LABEL[pin.category] || "Explore"}
                    </span>
                  </div>
                </div>
              ))}

              <button className="nb-add-activity-btn" onClick={() => { setForm({ name: "", desc: "", day: "Day 1", category: "explore" }); setManualModal(true); }} style={{ marginTop: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{MI.plus} Add another location</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CLICK-TO-PIN MODAL ═══════════════════════════════════════════════ */}
      {clickModal && (
        <div className="nb-modal-overlay" onClick={e => e.target === e.currentTarget && setClickModal(false)}>
          <div className="nb-modal-box">
            <button className="nb-modal-close" onClick={() => setClickModal(false)}>{MI.close}</button>
            <div className="nb-modal-title">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{MI.pin} Pin this location</span>
            </div>
            <div className="nb-modal-subtitle">
              {pendingCoords
                ? <>Coordinates: <span style={{ fontFamily: "monospace", color: "var(--terracotta-light)" }}>{pendingCoords.lat.toFixed(5)}, {pendingCoords.lng.toFixed(5)}</span></>
                : "Confirm the details for this pin."
              }
            </div>

            {/* Reverse geocode loading indicator */}
            {reverseLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: "0.75rem", color: "var(--muted)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "tm-spin 0.9s linear infinite", transformOrigin: "center" }}><path d="M12 2a10 10 0 1 0 10 10"/></svg>
                Looking up location name…
              </div>
            )}

            <FormFields showNameGeocoder={false} />

            <div className="nb-modal-footer">
              <button className="nb-modal-btn nb-modal-btn-ghost" onClick={() => setClickModal(false)}>Cancel</button>
              <button
                className="nb-modal-btn nb-modal-btn-primary"
                onClick={() => savePin(pendingCoords?.lat, pendingCoords?.lng)}
                disabled={saving}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <span style={{ display: "flex" }}>{MI.pin}</span>
                {saving ? "Saving…" : "Save Pin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MANUAL PIN MODAL (Pin Location button) ═══════════════════════════ */}
      {manualModal && (
        <div className="nb-modal-overlay" onClick={e => e.target === e.currentTarget && setManualModal(false)}>
          <div className="nb-modal-box">
            <button className="nb-modal-close" onClick={() => setManualModal(false)}>{MI.close}</button>
            <div className="nb-modal-title">Pin a Location</div>
            <div className="nb-modal-subtitle">Type a place name — coordinates found automatically.</div>

            <FormFields showNameGeocoder={true} />

            <div className="nb-modal-footer">
              <button className="nb-modal-btn nb-modal-btn-ghost" onClick={() => { setManualModal(false); setGeoResult(null); }}>Cancel</button>
              <button
                className="nb-modal-btn nb-modal-btn-primary"
                onClick={() => savePin(geoResult?.lat ?? null, geoResult?.lng ?? null)}
                disabled={saving}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <span style={{ display: "flex" }}>{MI.pin}</span>
                {saving ? "Saving…" : "Pin Location"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes tm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-control-attribution { font-size: 0.55rem !important; background: rgba(0,0,0,0.5) !important; color: rgba(255,255,255,0.3) !important; }
        .leaflet-control-attribution a { color: rgba(255,255,255,0.3) !important; }
      `}</style>
    </>
  );
}