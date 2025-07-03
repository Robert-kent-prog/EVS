import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BarcodeScanner from "../components/BarcodeScanner";
import { useAuth } from "../context/AuthContext";
import { verifyByExamCard } from "../services/verification";

export default function ScanScreen() {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (loading || !scanning) return;

    setScannedData(data);
    setShowModal(true);
    setScanning(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    setShowModal(false);

    try {
      const result = await verifyByExamCard(scannedData, user?.token || "");
      router.push({
        pathname: "/verification-result",
        params: { student: JSON.stringify(result) },
      });
    } catch (error) {
      let errorMessage = "An unknown error occurred";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = error.response.data.error || "Student not found";
        } else if (error.request) {
          errorMessage =
            "No response from server. Please check your connection.";
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = (error as any).message;
      }

      router.push({
        pathname: "/verification-result",
        params: { error: errorMessage },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setScanning(true);
  };

  return (
    <View style={styles.container}>
      {scanning ? (
        <BarcodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          isProcessing={loading}
        />
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

      {/* Verification Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Barcode Scanned</Text>
            <Text style={styles.modalText}>
              Student ExamCard : {scannedData}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.verifyButton]}
                onPress={handleVerify}
              >
                <Text style={styles.modalButtonText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Add these new styles for the modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  verifyButton: {
    backgroundColor: "#6E3BFF",
  },
  modalButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
