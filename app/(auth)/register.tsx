import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";
import { login, register as registerInvigilator } from "../services/auth";

type UserRole = "Invigilator" | "Student";

export default function RegisterScreen() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    userName: string,
    identifier: string,
    password: string,
    email?: string,
    role: UserRole = "Invigilator",
  ) => {
    setLoading(true);

    try {
      if (role === "Invigilator") {
        // Register Invigilator
        await registerInvigilator(
          userName,
          identifier, // staffNo
          email || "",
          password,
          "Invigilator",
        );

        // Auto-login after registration
        try {
          const { token, user } = await login(identifier, password);
          await authLogin(token, {
            userId: user._id,
            userName: user.userName,
            staffNo: user.staffNo,
            role: "Invigilator",
            email: user.email || "",
          });
          router.replace("/(tabs)/home");
        } catch (loginError) {
          console.error("Auto-login error:", loginError);
          Alert.alert(
            "Registration Successful",
            "Please login with your credentials",
            [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
          );
        }
      } else {
        // Student registration is handled by admin/backend
        // Show message that students cannot self-register
        Alert.alert(
          "Student Registration",
          "Student registration is handled by the academic office. Please contact the registrar's office for assistance.",
          [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
        );
      }
    } catch (error) {
      let errorMessage = "An unknown error occurred";

      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          errorMessage = "An account with this staff number already exists.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Registration Failed", errorMessage);
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
      defaultRole="Invigilator"
    />
  );
}
