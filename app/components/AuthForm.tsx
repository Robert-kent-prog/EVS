import { MaterialIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Image,
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

interface AuthFormProps {
  type: "login" | "register";
  onSubmit: (
    userName: string,
    staffNo: string,
    password: string,
    role?: "Invigilator" | "admin"
  ) => Promise<void>;
  loading: boolean;
  error?: string | null;
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
}

export default function AuthForm({
  type,
  onSubmit,
  loading,
  onNavigateToLogin,
  onNavigateToRegister,
}: AuthFormProps) {
  const [userName, setUserName] = useState("");
  const [staffNo, setStaffNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [role, setRole] = useState<"Invigilator" | "admin">("Invigilator");

  const staffNoInput = useRef<TextInput>(null);
  const passwordInput = useRef<TextInput>(null);

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (type === "register") {
      onSubmit(userName, staffNo, password, role);
    } else {
      onSubmit("", staffNo, password);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.outerArea} onPress={Keyboard.dismiss}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/header_Image.png")}
              style={styles.headerImage}
              resizeMode="contain"
            />
          </View>

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
              placeholderTextColor="#999"
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
            placeholderTextColor="#999"
            value={staffNo}
            onChangeText={setStaffNo}
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordInput.current?.focus()}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              ref={passwordInput}
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              placeholderTextColor="#999"
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
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {type === "register" && (
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Role:</Text>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "Invigilator" && styles.roleButtonActive,
                ]}
                onPress={() => setRole("Invigilator")}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === "Invigilator" && styles.roleButtonTextActive,
                  ]}
                >
                  Invigilator
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "admin" && styles.roleButtonActive,
                ]}
                onPress={() => setRole("admin")}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === "admin" && styles.roleButtonTextActive,
                  ]}
                >
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  headerImage: {
    width: 200,
    height: 120,
    marginBottom: 10,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 15,
  },
  passwordInput: {
    paddingRight: 50, // Make space for the toggle button
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
    color: "#555",
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
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
    color: "#555",
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
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
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
  },
  footerText: {
    color: "#7f8c8d",
    fontSize: 15,
  },
  footerLink: {
    color: "#3498db",
    fontWeight: "600",
    fontSize: 15,
  },
});
