import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { deleteAccount } from "../services/auth";
import { invigilatorTheme } from "../theme/invigilatorTheme";

export default function DeleteAccountScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAccount(user?.userId || "");
              await logout();
              Alert.alert(
                "Account Deleted",
                "Your account has been successfully deleted."
              );
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <LinearGradient colors={["#F8F9FF", "#EFF1FF"]} style={styles.gradientContainer}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <StatusBar style="dark" />
      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <AntDesign name="close" size={28} color="#F44336" />
      </Pressable>

      <View style={styles.container}>
        <Text style={styles.title}>Delete Account</Text>
        <Text style={styles.warningText}>
          Warning: This will permanently delete your account and all associated
          data. This action cannot be undone.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            You will lose access to all your data and verification history.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleDelete}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Processing..." : "Delete My Account"}
          </Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 25,
    paddingTop: 60, // Increased to accommodate back button
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F44336",
    marginBottom: 20,
    textAlign: "center",
  },
  warningText: {
    color: "#F44336",
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.3)",
    marginBottom: 30,
  },
  infoText: {
    color: "#666",
    fontSize: 14,
  },
  button: {
    backgroundColor: invigilatorTheme.colors.danger,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
