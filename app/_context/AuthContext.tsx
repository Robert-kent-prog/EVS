import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../_services/api";
import {
  SESSION_KEYS,
  getInvigilatorSessionToken,
  setInvigilatorSessionToken,
} from "../_services/secureSession";

interface User {
  userId: string;
  userName: string;
  staffNo: string;
  role: "Invigilator";
  token: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: Omit<User, "token">) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<void>; // Add this line
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  verifyToken: async () => false,
  updateUser: async () => {}, // Add this line
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Add the updateUser function
  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);

      const { token, ...userDataWithoutToken } = updatedUser;
      await AsyncStorage.setItem(
        SESSION_KEYS.userData,
        JSON.stringify(userDataWithoutToken),
      );
      await AsyncStorage.setItem(
        SESSION_KEYS.invigilatorData,
        JSON.stringify(userDataWithoutToken),
      );
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await getInvigilatorSessionToken();
        const userDataString =
          (await AsyncStorage.getItem(SESSION_KEYS.userData)) ||
          (await AsyncStorage.getItem(SESSION_KEYS.invigilatorData));

        if (token && userDataString) {
          const userData = JSON.parse(userDataString);
          if (
            userData.userId &&
            userData.userName &&
            userData.staffNo &&
            userData.role
          ) {
            const isValid = await verifyToken(token);
            if (isValid) {
              const activeToken = (await getInvigilatorSessionToken()) || token;
              setUser({
                userId: userData.userId,
                userName: userData.userName,
                staffNo: userData.staffNo,
                role: userData.role,
                email: userData.email || "",
                token: activeToken,
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
    try {
      const isValid = await api.verifyStoredSession("invigilator");
      if (isValid) {
        const refreshedToken = await getInvigilatorSessionToken();
        if (refreshedToken && user) {
          setUser({ ...user, token: refreshedToken });
        }
      }
      return isValid;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  };

  // Login function
  const login = async (token: string, userData: Omit<User, "token">) => {
    try {
      const completeUserData = {
        userId: userData.userId,
        userName: userData.userName,
        staffNo: userData.staffNo,
        role: userData.role,
        email: userData.email || "",
      };

      await setInvigilatorSessionToken(token);
      await AsyncStorage.removeItem(SESSION_KEYS.studentData);
      await AsyncStorage.multiSet([
        [SESSION_KEYS.userType, "invigilator"],
        [SESSION_KEYS.userData, JSON.stringify(completeUserData)],
        [SESSION_KEYS.invigilatorData, JSON.stringify(completeUserData)],
      ]);
      setUser({ ...completeUserData, token });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.logout("invigilator");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        verifyToken,
        updateUser, // Add this to the provider
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
