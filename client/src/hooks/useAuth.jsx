/* eslint-disable react-refresh/only-export-components */
// client/src/hooks/useAuth.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem("hms_user");
    return s ? JSON.parse(s) : null;
  });

  useEffect(() => {
    // keep user in sync with localStorage
    const handler = () => {
      const s = localStorage.getItem("hms_user");
      setUser(s ? JSON.parse(s) : null);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const login = (token, userObj) => {
    localStorage.setItem("hms_token", token);
    localStorage.setItem("hms_user", JSON.stringify(userObj));
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  return useContext(AuthContext);
}
