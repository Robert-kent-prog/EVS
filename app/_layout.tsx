import { Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthLayout />
      </AuthProvider>
    </QueryClientProvider>
  );
}
