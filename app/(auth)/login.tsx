import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (
    userName: string, // Not used in login but required by AuthForm
    staffNo: string,
    password: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { token, user } = await login(staffNo, password);

      // Ensure all required fields are present
      if (
        !token ||
        !user?._id ||
        !user.userName ||
        !user.staffNo ||
        !user.role
      ) {
        throw new Error("Invalid login response from server");
      }

      await authLogin(token, {
        userId: user._id, // Using _id from MongoDB
        userName: user.userName,
        staffNo: user.staffNo,
        role: user.role as "Invigilator" | "admin", // Type assertion
      });

      // Clear navigation stack and go to home
      router.replace("/(tabs)/home");
    } catch (error) {
      // console.error("Login error details:", error);

      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setError(errorMessage);
      Alert.alert("Login Failed", errorMessage, [
        { text: "OK", onPress: () => setError(null) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      type="login"
      onSubmit={handleLogin}
      loading={loading}
      error={error}
      onNavigateToRegister={() => router.push("/(auth)/register")}
    />
  );
}
