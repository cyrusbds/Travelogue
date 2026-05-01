import { createContext, useContext, useState } from "react";
import { saveAuth, getStoredUser, logout as clearAuth } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [pendingInvite, setPendingInvite] = useState(null);

  const loginUser = async (token, userData) => {
    saveAuth(token, userData);
    setUser(userData);

    // Check for a saved invite token (set by JoinPage when user wasn't logged in)
    const inviteToken = localStorage.getItem("pending_invite_token");
    const inviteTrip = localStorage.getItem("pending_invite_trip");

    if (inviteToken) {
      try {
        const { apiJoinTrip } = await import("../api/invites");
        const result = await apiJoinTrip(inviteToken, null);
        const tripData = inviteTrip ? JSON.parse(inviteTrip) : null;

        setPendingInvite({
          tripId: result.tripId,
          tripName: tripData?.name || "Trip",
          tripDest: tripData?.dest || "",
          tripDate: tripData?.startDate || null,
        });
      } catch (err) {
        console.warn("Auto-join failed:", err.message);
      } finally {
        localStorage.removeItem("pending_invite_token");
        localStorage.removeItem("pending_invite_trip");
      }
    }
  };

  const clearPendingInvite = () => setPendingInvite(null);

  const logout = () => {
    clearAuth();
    setUser(null);
    setPendingInvite(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loginUser, logout, pendingInvite, clearPendingInvite }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
