import { Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { QueryClient, QueryClientProvider } from "react-query";
import { DatabaseProvider } from "./components/DatabaseProvider";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { StudentAuthProvider } from "./context/StudentAuthContext";

const queryClient = new QueryClient();

function AuthLayout() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StudentAuthProvider>
            <AuthLayout />
          </StudentAuthProvider>
        </AuthProvider>
      </QueryClientProvider>
    </DatabaseProvider>
  );
}
