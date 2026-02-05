import { MaterialIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Alert,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ForgotPasswordModal from "./ForgotPasswordModal";

interface AuthFormProps {
  type: "login" | "register";
  onSubmit: (
    userName: string,
    staffNo: string,
    password: string,
    email?: string,
    role?: "Invigilator" // Changed to specific literal type
  ) => Promise<void>;
  loading: boolean;
  error?: string | null;
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
  onForgotPassword?: (staffNo: string) => Promise<void>;
}

export default function AuthForm({
  type,
  onSubmit,
  loading,
  onNavigateToLogin,
  onNavigateToRegister,
  onForgotPassword,
}: AuthFormProps) {
  const [userName, setUserName] = useState("");
  const [staffNo, setStaffNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const staffNoInput = useRef<TextInput>(null);
  const passwordInput = useRef<TextInput>(null);
  const emailInput = useRef<TextInput>(null);

  // Add this function to validate fields
  const validateFields = () => {
    if (type === "register") {
      return (
        userName.trim() !== "" &&
        staffNo.trim() !== "" &&
        password.trim() !== "" &&
        email.trim() !== ""
      );
    } else {
      return staffNo.trim() !== "" && password.trim() !== "";
    }
  };

  // Update the handleSubmit to check fields
  const handleSubmit = () => {
    Keyboard.dismiss();

    if (!validateFields()) {
      Alert.alert("Missing Information", "Please fill in all required fields", [
        { text: "OK" },
      ]);
      return;
    }

    if (type === "register") {
      onSubmit(userName, staffNo, password, email, "Invigilator");
    } else {
      onSubmit("", staffNo, password);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = async (staffNo: string) => {
    try {
      if (!onForgotPassword) {
        throw new Error("Forgot password functionality not available");
      }
      await onForgotPassword(staffNo);
      setShowForgotPasswordModal(false);
    } catch (error) {
      console.error("Forgot password error:", error);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/seku.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable style={styles.outerArea} onPress={Keyboard.dismiss}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {type === "login" ? "Welcome Back!" : "Create Account"}
              </Text>
              <Text style={styles.subtitle}>
                {type === "login"
                  ? "Sign in to continue"
                  : "Fill in your details to register"}
              </Text>
            </View>
            {type === "register" && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#000000"
                value={userName}
                onChangeText={setUserName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => staffNoInput.current?.focus()}
              />
            )}
            <TextInput
              ref={staffNoInput}
              style={styles.input}
              placeholder="Staff Number"
              placeholderTextColor="#000000"
              value={staffNo}
              onChangeText={setStaffNo}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() =>
                type === "register"
                  ? emailInput.current?.focus()
                  : passwordInput.current?.focus()
              }
            />
            {type === "register" && (
              <TextInput
                ref={emailInput}
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#000000"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordInput.current?.focus()}
              />
            )}
       
            <View style={styles.passwordContainer}>
              <TextInput
                ref={passwordInput}
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#000000"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={togglePasswordVisibility}
              >
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={24}
                  color="#000000"
                />
              </TouchableOpacity>
            </View>
            {type === "register" && (
              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Role:</Text>
                <View style={[styles.roleButton, styles.roleButtonActive]}>
                  <Text
                    style={[styles.roleButtonText, styles.roleButtonTextActive]}
                  >
                    Invigilator
                  </Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                (loading || !validateFields()) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || !validateFields()}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? "Please Wait..."
                  : type === "login"
                    ? "Sign In"
                    : "Sign Up"}
              </Text>
            </TouchableOpacity>
            {type === "login" && onForgotPassword && (
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => setShowForgotPasswordModal(true)}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {type === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </Text>
              <TouchableOpacity
                onPress={
                  type === "login" ? onNavigateToRegister : onNavigateToLogin
                }
              >
                <Text style={styles.footerLink}>
                  {type === "login" ? "Sign Up" : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {onForgotPassword && (
        <ForgotPasswordModal
          visible={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
          onSubmit={handleForgotPassword}
          loading={loading}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0)", // Increased transparency
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  outerArea: {
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,20)", // More opaque for better readability
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 16,
    color: "#555", // Darker for better contrast
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "rgba(255,255,255,0.8)", // Semi-transparent white
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    fontWeight: "bold",
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 15,
  },
  passwordInput: {
    paddingRight: 50,
  },
  toggleButton: {
    position: "absolute",
    right: 15,
    top: 13,
    padding: 5,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 5,
  },
  roleLabel: {
    marginRight: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff", // Darker for better contrast
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
  },
  roleButtonActive: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  roleButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#3498db",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    backgroundColor: "rgba(255,255,255,30)", // Semi-transparent background
    padding: 10,
    borderRadius: 10,
  },
  footerText: {
    color: "#000000", // Darker for better contrast
    fontSize: 15,
    fontWeight: "500",
  },
  footerLink: {
    color: "#3498db",
    fontWeight: "800",
    fontSize: 15,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    padding: 5,
    backgroundColor: "rgba(255,255,255,30)", // Semi-transparent background
    borderRadius: 5,
  },
  forgotPasswordText: {
    color: "#3498db",
    fontSize: 14,
    fontWeight: "700",
  },
});
