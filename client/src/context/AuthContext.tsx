import React, { createContext, useContext, useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  role: string;
  exp?: number; // Token expiry time (optional)
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeAndValidateToken = (token: string): User | null => {
  
  try {
    const decoded: User = jwtDecode<User>(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.warn("Token has expired");
      return null;
    }
    return decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate=useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedUser = decodeAndValidateToken(token);
      if (decodedUser) {
        console.log("Valid token found, setting user:", decodedUser);
        setUser(decodedUser);
      } else {
        console.warn("Invalid or expired token found in localStorage");
        localStorage.removeItem("authToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    const decodedUser = decodeAndValidateToken(token);
    if (decodedUser) {
      console.log("Token decoded successfully:", decodedUser);
      localStorage.setItem("authToken", token);
      setUser(decodedUser);
    } else {
      console.warn("Invalid or expired token provided during login");
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/login"); // Redirect to login page
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
