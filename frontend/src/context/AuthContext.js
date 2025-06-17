import React, { createContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ⬇️ tu czytamy localStorage **synchronnie**,
  //    więc `user` jest ustawiony już w pierwszym renderze
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const login  = (u) => { setUser(u); localStorage.setItem("user", JSON.stringify(u)); };
  const logout = ()   => { setUser(null); localStorage.removeItem("user"); };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
