import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiValidateInvite, apiJoinTrip } from "../api/invites";
import { useAuth } from "../context/AuthContext";

export default function JoinPage() {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [tripInfo,  setTripInfo]  = useState(null);
  const [status,    setStatus]    = useState("loading"); // loading | preview | joining | error
  const [errorMsg,  setErrorMsg]  = useState("");
  const [nickname,  setNickname]  = useState("");

  useEffect(() => {
    apiValidateInvite(token)
      .then(data => { setTripInfo(data); setStatus("preview"); })
      .catch(err  => { setErrorMsg(err.message); setStatus("error"); });
  }, [token]);

  async function handleJoin() {
    setStatus("joining");
    try {
      const result = await apiJoinTrip(token, !user ? nickname : null);
      navigate(`/notebook/${result.tripId}`);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  const styles = {
    root: { minHeight: "100vh", background: "#18100A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 20 },
    card: { background: "#1E1410", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 420, textAlign: "center" },
    logo: { fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#C8623A", marginBottom: 28 },
    emoji: { fontSize: "3rem", marginBottom: 12 },
    title: { fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "rgba(255,255,255,0.88)", fontWeight: 700, marginBottom: 6 },
    meta: { fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginBottom: 24 },
    badge: { display: "inline-block", fontSize: "0.65rem", fontWeight: 700, padding: "3px 12px", borderRadius: 50, background: "rgba(40,200,64,0.12)", color: "#28C840", border: "1px solid rgba(40,200,64,0.2)", marginBottom: 24 },
    input: { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "rgba(255,255,255,0.88)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", outline: "none", marginBottom: 14, boxSizing: "border-box" },
    btn: { width: "100%", padding: "12px 0", borderRadius: 10, background: "#C8623A", color: "white", border: "none", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" },
    error: { color: "#FF5F57", fontSize: "0.82rem", marginTop: 12 },
    muted: { fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", marginTop: 16 },
  };

  if (status === "loading") return (
    <div style={styles.root}>
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Validating invite…</div>
    </div>
  );

  if (status === "error") return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.logo}>Travel<em style={{ fontStyle: "italic", color: "#3A7CA5" }}>ogue</em></div>
        <div style={{ fontSize: "2rem", marginBottom: 12 }}>🚫</div>
        <div style={styles.title}>Invalid Invite</div>
        <div style={styles.error}>{errorMsg}</div>
        <button style={{ ...styles.btn, marginTop: 20 }} onClick={() => navigate("/")}>Go Home</button>
      </div>
    </div>
  );

  const trip = tripInfo?.trip;

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.logo}>Travel<em style={{ fontStyle: "italic", color: "#3A7CA5" }}>ogue</em></div>
        <div style={styles.emoji}>{trip?.emoji || "✈️"}</div>
        <div style={styles.title}>{trip?.name}</div>
        <div style={styles.meta}>
          {trip?.dest && `${trip.dest} · `}
          {trip?.startDate && new Date(trip.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </div>
        <div style={styles.badge}>You're invited to join this trip</div>

        {/* Guest nickname input — only if not logged in and guest access allowed */}
        {!user && tripInfo?.guestAccess && (
          <input
            style={styles.input}
            placeholder="Enter your nickname…"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
          />
        )}

        {!user && !tripInfo?.guestAccess && (
          <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
            You need an account to join this trip.{" "}
            <span style={{ color: "#C8623A", cursor: "pointer" }} onClick={() => navigate("/")}>Sign up free →</span>
          </div>
        )}

        <button
          style={{ ...styles.btn, opacity: (!user && !tripInfo?.guestAccess) ? 0.4 : 1 }}
          disabled={!user && !tripInfo?.guestAccess}
          onClick={handleJoin}
        >
          {status === "joining" ? "Joining…" : user ? "Join Trip" : "Join as Guest"}
        </button>

        {user && (
          <div style={styles.muted}>Joining as <strong style={{ color: "rgba(255,255,255,0.5)" }}>{user.name}</strong></div>
        )}
      </div>
    </div>
  );
}