import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext"; // For invigilator
import { useStudentAuth } from "../context/StudentAuthContext"; // For student
import api from "../services/api"; // Use your API service, not reset

type UserRole = "Invigilator" | "Student";

export default function LoginScreen() {
  const router = useRouter();
  const { login: invigilatorAuthLogin } = useAuth();
  const { login: studentAuthLogin } = useStudentAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (
    userName: string,
    identifier: string,
    password: string,
    email?: string,
    role: UserRole = "Invigilator",
  ) => {
    setLoading(true);
    setError(null);

    try {
      if (role === "Invigilator") {
        // ✅ Call your actual API login endpoint first
        const response = await api.invigilatorLogin(identifier, password);

        // Then pass token and user data to your auth context
        await invigilatorAuthLogin(response.token, {
          userId: response.user._id,
          userName: response.user.userName,
          staffNo: response.user.staffNo,
          role: "Invigilator",
          email: response.user.email || "",
        });

        router.replace("/(tabs)/home");
      } else {
        // Student Login
        await studentAuthLogin(identifier, password);
        router.replace("/(student-tabs)/dashboard");
      }
    } catch (error) {
      let errorMessage = "An unknown error occurred";

      if (error instanceof Error) {
        if (error.message.includes("status code 500")) {
          errorMessage = "Server error. Please try again later.";
        } else if (
          error.message.includes("validation failed") ||
          error.message.includes("Invalid credentials") ||
          error.message.includes("401")
        ) {
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

  const handleForgotPassword = async (identifier: string) => {
    try {
      // await api.forgotPassword(identifier);
      Alert.alert(
        "Reset Link Sent",
        "Please check your email for password reset instructions",
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send reset link. Please try again later.",
      );
    }
  };

  return (
    <AuthForm
      type="login"
      onSubmit={handleLogin}
      loading={loading}
      error={error}
      onNavigateToRegister={() => router.push("/(auth)/register")}
      onForgotPassword={handleForgotPassword}
      defaultRole="Invigilator"
    />
  );
}
