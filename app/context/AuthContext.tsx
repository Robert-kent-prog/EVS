import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  userId: string;
  userName: string;
  staffNo: string;
  role: "Invigilator";
  token: string;
  email: string; // Changed from optional to required
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
        const userDataString = await AsyncStorage.getItem("userData");

        if (token && userDataString) {
          const userData = JSON.parse(userDataString);
          // Ensure all required fields exist
          if (
            userData.userId &&
            userData.userName &&
            userData.staffNo &&
            userData.role
          ) {
            const isValid = await verifyToken(token);
            if (isValid) {
              setUser({
                userId: userData.userId,
                userName: userData.userName,
                staffNo: userData.staffNo,
                role: userData.role,
                email: userData.email || "", // Provide fallback if email is missing
                token,
              });
            } else {
              await logout();
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Verify token with backend
  const verifyToken = async (token?: string): Promise<boolean> => {
    const tokenToVerify = token || user?.token;
    if (!tokenToVerify) return false;

    try {
      const response = await fetch("http://10.6.81.43:6000/api/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenToVerify}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  };

  // Updated login function
  const login = async (token: string, userData: Omit<User, "token">) => {
    // console.log("Login data received:", { token, userData }); // Add this line
    try {
      // Ensure all required fields are present
      const completeUserData = {
        userId: userData.userId,
        userName: userData.userName,
        staffNo: userData.staffNo,
        role: userData.role,
        email: userData.email || "", // Handle potential missing email
      };

      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(completeUserData));
      setUser({ ...completeUserData, token });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function remains the same
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
