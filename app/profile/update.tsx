import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router"; // Import Expo Router
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/auth";

export default function UpdateProfileScreen() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    userName: user?.userName || "",
    email: user?.email || "",
    staffNo: user?.staffNo || "",
  });

  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!formData.userName || !formData.email || !formData.staffNo) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await updateProfile(user?.userId || "", formData);
      Alert.alert("Success", "Profile updated successfully");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#F8F9FF", "#EFF1FF"]}
      style={styles.gradientContainer}
    >
      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <AntDesign name="arrowleft" size={28} color="" />
        {/* <Text style={styles.backButtonText}>Back</Text> */}
      </Pressable>

      <View style={styles.container}>
        <Text style={styles.title}>Update Profile</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={formData.userName}
            onChangeText={(text) =>
              setFormData({ ...formData, userName: text })
            }
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Staff Number</Text>
          <TextInput
            style={styles.input}
            value={formData.staffNo}
            onChangeText={(text) => setFormData({ ...formData, staffNo: text })}
            placeholder="Enter your staff number"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Updating..." : "Update Profile"}
          </Text>
        </TouchableOpacity>
      </View>
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
  backButtonText: {
    color: "#6E3BFF",
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 30,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#444",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  button: {
    backgroundColor: "#6E3BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
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
