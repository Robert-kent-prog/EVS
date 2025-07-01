import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  userId: string;
  userName: string;
  staffNo: string;
  role: "Invigilator" | "admin";
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: Omit<User, "token">) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  verifyToken: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userData = await AsyncStorage.getItem("userData");

        if (token && userData) {
          const isValid = await verifyToken(token);
          if (isValid) {
            setUser({ ...JSON.parse(userData), token });
          } else {
            await logout();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Verify token with backend
  const verifyToken = async (token?: string): Promise<boolean> => {
    const tokenToVerify = token || user?.token;
    if (!tokenToVerify) return false;

    try {
      const response = await fetch(
        "http://192.168.0.108:6000/api/verify-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenToVerify}`,
          },
        }
      );
      return response.ok;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  };

  // Login function
  const login = async (token: string, userData: Omit<User, "token">) => {
    try {
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      setUser({ ...userData, token });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verifyToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
