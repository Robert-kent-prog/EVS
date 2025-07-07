/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/auth";
import api from "../services/reset"; // Make sure this path is correct

export default function LoginScreen() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (
    userName: string,
    staffNo: string,
    password: string
  ) => {
    setLoading(true);
    setError(null);

    // const response = await login(staffNo, password);
    // console.log("Service response:", response); // Debug log

    try {
      const { token, user } = await login(staffNo, password);

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
        userId: user._id,
        userName: user.userName,
        staffNo: user.staffNo,
        role: "Invigilator", // Hardcoded value
        email: user.email || "", // Ensure email is always present
      });

      router.replace("/(tabs)/home");
    } catch (error) {
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        if (error.message.includes("status code 500")) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.message.includes("validation failed")) {
          errorMessage = "Invalid login credentials.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      Alert.alert("Login Failed", errorMessage, [
        { text: "OK", onPress: () => setError(null) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (staffNo: string) => {
    try {
      await api.forgotPassword(staffNo);
      Alert.alert(
        "Reset Link Sent",
        "Please check your email for password reset instructions"
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send reset link. Please try again later."
      );
    }
  };

  return (
    <AuthForm
      type="login"
      onSubmit={handleLogin}
      loading={loading}
      onNavigateToRegister={() => router.push("/register")} // Use router.push
      onForgotPassword={handleForgotPassword}
    />
  );
}
