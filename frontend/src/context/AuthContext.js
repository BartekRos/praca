import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
if (savedUser) {
  try {
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);
  } catch (error) {
    console.error("Błąd parsowania użytkownika z localStorage:", error);
    localStorage.removeItem("user");
  }
}

  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
