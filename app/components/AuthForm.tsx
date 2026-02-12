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

type UserRole = "Invigilator" | "Student";

interface AuthFormProps {
  type: "login" | "register";
  onSubmit: (
    userName: string,
    identifier: string, // staffNo for invigilator, registrationNumber for student
    password: string,
    email?: string,
    role?: UserRole,
  ) => Promise<void>;
  loading: boolean;
  error?: string | null;
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
  onForgotPassword?: (identifier: string) => Promise<void>;
  defaultRole?: UserRole;
}

export default function AuthForm({
  type,
  onSubmit,
  loading,
  onNavigateToLogin,
  onNavigateToRegister,
  onForgotPassword,
  defaultRole = "Invigilator",
}: AuthFormProps) {
  const [userName, setUserName] = useState("");
  const [identifier, setIdentifier] = useState(""); // staffNo or registrationNumber
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const identifierInput = useRef<TextInput>(null);
  const passwordInput = useRef<TextInput>(null);
  const emailInput = useRef<TextInput>(null);

  const validateFields = () => {
    if (type === "register") {
      return (
        userName.trim() !== "" &&
        identifier.trim() !== "" &&
        password.trim() !== "" &&
        email.trim() !== ""
      );
    } else {
      return identifier.trim() !== "" && password.trim() !== "";
    }
  };

  const handleSubmit = () => {
    Keyboard.dismiss();

    if (!validateFields()) {
      Alert.alert("Missing Information", "Please fill in all required fields", [
        { text: "OK" },
      ]);
      return;
    }

    if (type === "register") {
      onSubmit(userName, identifier, password, email, selectedRole);
    } else {
      onSubmit("", identifier, password, undefined, selectedRole);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = async (identifier: string) => {
    try {
      if (!onForgotPassword) {
        throw new Error("Forgot password functionality not available");
      }
      await onForgotPassword(identifier);
      setShowForgotPasswordModal(false);
    } catch (error) {
      console.error("Forgot password error:", error);
    }
  };

  const getIdentifierPlaceholder = () => {
    return selectedRole === "Student" ? "Registration Number" : "Staff Number";
  };

  const getTitle = () => {
    if (type === "login") {
      return selectedRole === "Student" ? "Student Login" : "Staff Login";
    }
    return selectedRole === "Student"
      ? "Student Registration"
      : "Staff Registration";
  };

  const getSubtitle = () => {
    if (type === "login") {
      return selectedRole === "Student"
        ? "Sign in to access your exam card"
        : "Sign in to invigilator dashboard";
    }
    return selectedRole === "Student"
      ? "Register as a student"
      : "Register as an invigilator";
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
              <Text style={styles.title}>{getTitle()}</Text>
              <Text style={styles.subtitle}>{getSubtitle()}</Text>
            </View>

            {/* Role Selection - Always visible for both login and register */}
            <View style={styles.roleSection}>
              <Text style={styles.roleSectionLabel}>Login as:</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === "Invigilator" && styles.roleButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedRole("Invigilator");
                    setIdentifier("");
                  }}
                >
                  <MaterialIcons
                    name="badge"
                    size={20}
                    color={selectedRole === "Invigilator" ? "#fff" : "#7f8c8d"}
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                      selectedRole === "Invigilator" &&
                        styles.roleButtonTextActive,
                    ]}
                  >
                    Invigilator
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === "Student" && styles.roleButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedRole("Student");
                    setIdentifier("");
                  }}
                >
                  <MaterialIcons
                    name="school"
                    size={20}
                    color={selectedRole === "Student" ? "#fff" : "#7f8c8d"}
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                      selectedRole === "Student" && styles.roleButtonTextActive,
                    ]}
                  >
                    Student
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Registration fields - only show for register */}
            {type === "register" && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#666"
                  value={userName}
                  onChangeText={setUserName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => identifierInput.current?.focus()}
                />
              </>
            )}

            {/* Identifier Input (Staff No or Registration No) */}
            <TextInput
              ref={identifierInput}
              style={styles.input}
              placeholder={getIdentifierPlaceholder()}
              placeholderTextColor="#666"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize={
                selectedRole === "Student" ? "characters" : "none"
              }
              returnKeyType="next"
              onSubmitEditing={() =>
                type === "register"
                  ? emailInput.current?.focus()
                  : passwordInput.current?.focus()
              }
            />

            {/* Email - only for registration */}
            {type === "register" && (
              <TextInput
                ref={emailInput}
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordInput.current?.focus()}
              />
            )}

            {/* Password Input */}
            <View style={styles.passwordContainer}>
              <TextInput
                ref={passwordInput}
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#666"
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
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.button,
                (loading || !validateFields()) && styles.buttonDisabled,
                selectedRole === "Student" && styles.studentButton,
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

            {/* Forgot Password - Login only */}
            {type === "login" && onForgotPassword && (
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => setShowForgotPasswordModal(true)}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* Navigation between login and register */}
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
          // userType={selectedRole}
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
    backgroundColor: "rgba(0,0,0,0.6)",
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
    backgroundColor: "rgba(255,255,255,0.95)",
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
    color: "#555",
    textAlign: "center",
  },
  roleSection: {
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 15,
    borderRadius: 10,
  },
  roleSectionLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 10,
    fontWeight: "500",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  roleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    flex: 0.48,
    justifyContent: "center",
  },
  roleButtonActive: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  roleButtonText: {
    marginLeft: 8,
    color: "#7f8c8d",
    fontWeight: "600",
    fontSize: 14,
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  input: {
    height: 50,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "rgba(255,255,255,0.95)",
    fontSize: 16,
    color: "#333",
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
  button: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  studentButton: {
    backgroundColor: "#27ae60",
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
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 10,
    borderRadius: 10,
  },
  footerText: {
    color: "#2c3e50",
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
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 5,
  },
  forgotPasswordText: {
    color: "#3498db",
    fontSize: 14,
    fontWeight: "700",
  },
});
