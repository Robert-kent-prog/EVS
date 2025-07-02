import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "./context/AuthContext";
import { verifyStudent } from "./services/verification";

export default function ManualVerification() {
  const [regNumber, setRegNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const handleVerify = async () => {
    if (!regNumber.trim()) {
      setError("Please enter a registration number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await verifyStudent(regNumber.trim(), user?.token || "");
      router.push({
        pathname: "/verification-result",
        params: { student: JSON.stringify(result) },
      });
    } catch (err: any) {
      let errorMessage = "Verification failed";

      if (err.response) {
        errorMessage = err.response.data.error || "Student not found";
      } else if (err.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Manual Verification</Text>
        <Text style={styles.subtitle}>Enter student registration number</Text>

        <View style={styles.inputContainer}>
          <MaterialIcons name="credit-card" size={24} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="e.g., STU20250001"
            value={regNumber}
            onChangeText={setRegNumber}
            autoCapitalize="characters"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.button}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Verifying..." : "Verify Student"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Keep the same styles as before
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#6E3BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  error: {
    color: "#F44336",
    textAlign: "center",
    marginBottom: 15,
  },
});
