import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiValidateInvite, apiJoinTrip } from "../api/invites";
import { useAuth } from "../context/AuthContext";

export default function JoinPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tripInfo, setTripInfo] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    apiValidateInvite(token)
      .then((data) => {
        setTripInfo(data);

        // ── If not logged in, save token and redirect to auth ──────────────
        if (!user) {
          localStorage.setItem("pending_invite_token", token);
          localStorage.setItem(
            "pending_invite_trip",
            JSON.stringify(data.trip),
          );
          setStatus("redirecting");
          // Give user a moment to read the message before redirect
          setTimeout(() => navigate("/?auth=signup"), 1800);
        } else {
          setStatus("preview");
        }
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setStatus("error");
      });
  }, [token]);

  // ── If user is already logged in and visits the link, auto-join ──────────
  useEffect(() => {
    if (user && tripInfo && status === "preview") {
      handleJoin();
    }
  }, [user, tripInfo]);

  async function handleJoin() {
    setStatus("joining");
    try {
      const result = await apiJoinTrip(token, null);
      localStorage.removeItem("pending_invite_token");
      localStorage.removeItem("pending_invite_trip");
      navigate(`/notebook/${result.tripId}`);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  const styles = {
    root: {
      minHeight: "100vh",
      background: "#18100A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: 20,
    },
    card: {
      background: "#1E1410",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 20,
      padding: "36px 32px",
      width: "100%",
      maxWidth: 420,
      textAlign: "center",
    },
    logo: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "1.4rem",
      color: "#C8623A",
      marginBottom: 28,
    },
    emoji: { fontSize: "3rem", marginBottom: 12 },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "1.4rem",
      color: "rgba(255,255,255,0.88)",
      fontWeight: 700,
      marginBottom: 6,
    },
    meta: {
      fontSize: "0.78rem",
      color: "rgba(255,255,255,0.35)",
      marginBottom: 24,
    },
    badge: {
      display: "inline-block",
      fontSize: "0.65rem",
      fontWeight: 700,
      padding: "3px 12px",
      borderRadius: 50,
      background: "rgba(40,200,64,0.12)",
      color: "#28C840",
      border: "1px solid rgba(40,200,64,0.2)",
      marginBottom: 24,
    },
    btn: {
      width: "100%",
      padding: "12px 0",
      borderRadius: 10,
      background: "#C8623A",
      color: "white",
      border: "none",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.9rem",
      fontWeight: 700,
      cursor: "pointer",
    },
    error: { color: "#FF5F57", fontSize: "0.82rem", marginTop: 12 },
    muted: {
      fontSize: "0.72rem",
      color: "rgba(255,255,255,0.25)",
      marginTop: 16,
    },
    info: {
      fontSize: "0.82rem",
      color: "rgba(255,255,255,0.5)",
      lineHeight: 1.6,
      marginBottom: 20,
    },
  };

  const Logo = () => (
    <div style={styles.logo}>
      Travel<em style={{ fontStyle: "italic", color: "#3A7CA5" }}>ogue</em>
    </div>
  );

  if (status === "loading")
    return (
      <div style={styles.root}>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
          Validating invite…
        </div>
      </div>
    );

  if (status === "error")
    return (
      <div style={styles.root}>
        <div style={styles.card}>
          <Logo />
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>🚫</div>
          <div style={styles.title}>Invalid Invite</div>
          <div style={styles.error}>{errorMsg}</div>
          <button
            style={{ ...styles.btn, marginTop: 20 }}
            onClick={() => navigate("/")}
          >
            Go Home
          </button>
        </div>
      </div>
    );

  // ── Redirecting non-logged-in user to signup ──────────────────────────────
  if (status === "redirecting") {
    const trip = tripInfo?.trip;
    return (
      <div style={styles.root}>
        <div style={styles.card}>
          <Logo />
          <div style={styles.emoji}>{trip?.emoji || "✈️"}</div>
          <div style={styles.title}>{trip?.name}</div>
          <div style={styles.meta}>
            {trip?.dest && `${trip.dest} · `}
            {trip?.startDate &&
              new Date(trip.startDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
          </div>
          <div style={styles.badge}>You're invited!</div>
          <div style={styles.info}>
            You need a{" "}
            <strong style={{ color: "rgba(255,255,255,0.75)" }}>
              free Travelogue account
            </strong>{" "}
            to join this trip.
            <br />
            <br />
            Redirecting you to sign up — your invite will be waiting once you're
            in. ✨
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#C8623A",
                  animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>
        </div>
      </div>
    );
  }

  // ── Logged-in user — auto-joining ─────────────────────────────────────────
  if (status === "joining")
    return (
      <div style={styles.root}>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
          Joining trip…
        </div>
      </div>
    );

  // ── Preview ────────────────────────────────
  const trip = tripInfo?.trip;
  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <Logo />
        <div style={styles.emoji}>{trip?.emoji || "✈️"}</div>
        <div style={styles.title}>{trip?.name}</div>
        <div style={styles.meta}>
          {trip?.dest && `${trip.dest} · `}
          {trip?.startDate &&
            new Date(trip.startDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
        </div>
        <div style={styles.badge}>You're invited to join this trip</div>

        <button style={styles.btn} onClick={handleJoin}>
          Join Trip
        </button>

        {user && (
          <div style={styles.muted}>
            Joining as{" "}
            <strong style={{ color: "rgba(255,255,255,0.5)" }}>
              {user.name}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}
