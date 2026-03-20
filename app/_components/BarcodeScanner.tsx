import { MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BarcodeScannerProps {
  onBarCodeScanned: (data: { data: string }) => void;
  isProcessing: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onBarCodeScanned,
  isProcessing,
}) => {
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4B7BE5" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialIcons name="no-photography" size={60} color="#FF6B6B" />
        <Text style={styles.permissionText}>Camera permission required</Text>
        <Text style={styles.permissionSubtext}>
          Please enable camera access to scan student exam cards
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleScan = ({ data }: { data: string }) => {
    if (!scanned && !isProcessing) {
      setScanned(true);
      onBarCodeScanned?.({ data });
    }
  };

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exam Card Verification</Text>
        <Text style={styles.subtitle}>
          Scan student barcode for verification
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          barcodeScannerSettings={{
            barcodeTypes: [
              "ean13",
              "ean8",
              "upc_a",
              "upc_e",
              "code39",
              "code128",
              "qr",
            ],
          }}
          onBarcodeScanned={scanned || isProcessing ? undefined : handleScan}
        />

        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.processingText}>Processing...</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={toggleCameraFacing}
          disabled={isProcessing}
        >
          <MaterialIcons name="flip-camera-android" size={24} color="white" />
          <Text style={styles.flipButtonText}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Scanning Instructions:</Text>
        <View style={styles.instructionItem}>
          <MaterialIcons name="check-circle" size={16} color="#4B7BE5" />
          <Text style={styles.instructionText}>
            Position barcode within the frame
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <MaterialIcons name="check-circle" size={16} color="#4B7BE5" />
          <Text style={styles.instructionText}>
            Hold steady for clear capture
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <MaterialIcons name="check-circle" size={16} color="#4B7BE5" />
          <Text style={styles.instructionText}>
            Ensure good lighting conditions
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#F8F9FA",
  },
  permissionText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  permissionSubtext: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#4B7BE5",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    marginTop: 5,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative", // Added for overlay positioning
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    pointerEvents: "none", // Allows touches to pass through to CameraView
  },
  scanArea: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 10,
    position: "relative",
  },
  processingOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  processingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  flipButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4B7BE5",
    padding: 15,
    borderRadius: 8,
    width: "60%",
  },
  flipButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  instructions: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 15,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: "#34495E",
    marginLeft: 10,
  },
});

export default BarcodeScanner;
