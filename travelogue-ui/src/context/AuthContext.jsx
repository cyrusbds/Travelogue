import { createContext, useContext, useState } from "react";
import { saveAuth, getStoredUser, logout as clearAuth } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser()); // load from localStorage on start

  const loginUser = (token, userData) => {
    saveAuth(token, userData);
    setUser(userData);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);