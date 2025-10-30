"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
  exp?: number;
}

interface User {
  id: string;
  email: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // ✅ Login => décoder et stocker en mémoire
  const login = (token: string) => {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      const newUser: User = {
        id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || "",
        email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "",
        role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "User",
        token,
      };
      setUser(newUser);
    } catch (error) {
      console.error("Erreur de décodage du token :", error);
    }
  };

  // ✅ Déconnexion => tout vider
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user ,login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};
