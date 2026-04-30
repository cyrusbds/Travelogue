import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGetTrip } from "../api/trips";  // ← single trip fetch
import Notebook from "../components/Notebook";

export default function NotebookPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [trip,    setTrip]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetTrip(id)                          // ← fetch just this trip
      .then(data => {
        // apiGetTrip returns the trip object directly
        const found = data.trip ?? data;
        if (!found) navigate("/dashboard");
        else setTrip(found);
      })
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#18100A",
      color: "rgba(255,255,255,0.4)",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 14,
    }}>
      Loading notebook…
    </div>
  );

  if (!trip) return null;

  return <Notebook trip={trip} />;
}