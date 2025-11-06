import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";

import { login, register } from "../services/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    userName: string,
    staffNo: string,
    password: string,
    email?: string,
    role?: "Invigilator" // Match the exact type
  ) => {
    setLoading(true);
    try {
      // Always use "Invigilator" as the role
      await register(userName, staffNo, email || "", password, "Invigilator");

      try {
        const { token, user } = await login(staffNo, password);

        await authLogin(token, {
          userId: user._id,
          userName: user.userName,
          staffNo: user.staffNo,
          role: "Invigilator", // Hardcoded to ensure type safety
          email: user.email || "", // Ensure email is always present
        });

        router.replace("/(tabs)/home");
      } catch (loginError) {
        console.error("Auto-login error:", loginError);
        Alert.alert(
          "Registration Successful",
          "Please login with your credentials",
          [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      type="register"
      onSubmit={handleRegister}
      loading={loading}
      onNavigateToLogin={() => router.replace("/(auth)/login")}
      // No need to pass onForgotPassword for register screen
    />
  );
}
