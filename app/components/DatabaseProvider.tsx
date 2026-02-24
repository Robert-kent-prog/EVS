import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View, Text, TouchableOpacity } from "react-native";
import { initializeDatabase } from "../services/database";

interface DatabaseContextType {
  isInitialized: boolean;
  error: string | null;
  retryInitialization: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isInitialized: false,
  error: null,
  retryInitialization: async () => {},
});

export const useDatabase = () => useContext(DatabaseContext);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const initDatabase = async () => {
    try {
      setError(null);
      await initializeDatabase();
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = `Failed to initialize database: ${err}`;
      setError(errorMessage);
      console.error("Database initialization error:", err);
      setIsInitialized(false);
    }
  };

  const retryInitialization = async () => {
    setRetryCount((prev) => prev + 1);
    await initDatabase();
  };

  useEffect(() => {
    initDatabase();
  }, []);

  // Add a retry mechanism for database initialization
  useEffect(() => {
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        initDatabase();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  if (!isInitialized && !error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (error && retryCount >= 3) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <ActivityIndicator size="large" color="#ff0000" />
        <Text style={{ marginTop: 10, color: "#ff0000", textAlign: "center" }}>
          Database initialization failed. Please restart the app.
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: "#0066cc",
            borderRadius: 5,
          }}
          onPress={retryInitialization}
        >
          <Text style={{ color: "white" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider
      value={{ isInitialized, error, retryInitialization }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}
