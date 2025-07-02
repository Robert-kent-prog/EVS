import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios"; // Make sure to import axios
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BarcodeScanner from "../components/BarcodeScanner";
import { useAuth } from "../context/AuthContext";
import { verifyByExamCard } from "../services/verification";

export default function ScanScreen() {
  const [scanning, setScanning] = useState(false); // Changed to false initially
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (loading || !scanning) return; // Added !scanning check

    setScanning(false); // Stop scanning after detection
    setLoading(true);

    try {
      Alert.alert("Barcode Scanned", `Student ID: ${data}`, [
        {
          text: "Cancel",
          onPress: () => {
            setLoading(false);
            setScanning(true); // Restart scanning if canceled
          },
          style: "cancel",
        },
        {
          text: "Verify",
          onPress: async () => {
            try {
              const result = await verifyByExamCard(data, user?.token || "");
              router.push({
                pathname: "/verification-result",
                params: { student: JSON.stringify(result) },
              });
            } catch (error) {
              let errorMessage = "An unknown error occurred";

              // eslint-disable-next-line import/no-named-as-default-member
              if (axios.isAxiosError(error)) {
                if (error.response) {
                  errorMessage = `Server error: ${error.response.status}`;
                } else if (error.request) {
                  errorMessage =
                    "No response from server. Please check your connection.";
                } else {
                  errorMessage = error.message;
                }
              } else {
                errorMessage = (error as any).message; // Changed to 'any' to avoid type error
              }

              router.push({
                pathname: "/verification-result",
                params: { error: errorMessage },
              });

              setLoading(false);
            }
          },
        },
      ]);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert("Error", "Failed to process verification");
      setLoading(false);
      setScanning(true); // Restart scanning on error
    }
  };

  return (
    <View style={styles.container}>
      {scanning ? (
        <BarcodeScanner onBarCodeScanned={handleBarCodeScanned} />
      ) : (
        <View style={styles.placeholder}>
          {loading ? (
            <ActivityIndicator size="large" color="#0066cc" />
          ) : (
            <>
              <MaterialIcons
                name="qr-code-scanner"
                size={120}
                color="#0066cc"
                style={styles.icon}
              />
              <Text style={styles.placeholderText}>
                Press Start Scanning Button to begin
              </Text>
            </>
          )}
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.button,
            scanning ? styles.stopButton : styles.startButton,
          ]}
          onPress={() => setScanning(!scanning)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {scanning ? "Stop Scanning" : "Start Scanning"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  icon: {
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  controls: {
    padding: 20,
    backgroundColor: "white",
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#0066cc",
  },
  stopButton: {
    backgroundColor: "#cc3300",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
