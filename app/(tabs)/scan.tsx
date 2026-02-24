import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BarcodeScanner from "../components/BarcodeScanner";
import { useAuth } from "../context/AuthContext";
import {
  clearStoredUnit,
  getStoredUnit,
  setStoredUnit,
  Unit,
} from "../services/unit"; // Import unit services
import { verifyByExamCard } from "../services/verification";
import { invigilatorTheme } from "../theme/invigilatorTheme";

export default function ScanScreen() {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [unitName, setUnitName] = useState("");
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Load stored unit on component mount
  useEffect(() => {
    loadStoredUnit();
  }, []);

  const loadStoredUnit = async () => {
    const storedUnit = await getStoredUnit();
    if (storedUnit) {
      setCurrentUnit(storedUnit);
      setUnitCode(storedUnit.code);
      setUnitName(storedUnit.name);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (loading || !scanning) return;

    setScannedData(data);
    setShowModal(true);
    setScanning(false);
  };

  const handleUpdateUnit = async () => {
    if (!unitCode.trim() || !unitName.trim()) {
      Alert.alert("Error", "Please enter both unit code and unit name");
      return;
    }

    const newUnit: Unit = {
      code: unitCode.trim(),
      name: unitName.trim(),
    };

    await setStoredUnit(newUnit);
    setCurrentUnit(newUnit);
    setIsEditing(false);
    Alert.alert("Success", "Unit details updated successfully");
  };

  const handleClearUnit = async () => {
    await clearStoredUnit();
    setCurrentUnit(null);
    setUnitCode("");
    setUnitName("");
    setIsEditing(false);
    Alert.alert("Cleared", "Unit details have been cleared");
  };

  const handleVerify = async () => {
    setLoading(true);
    setShowModal(false);

    try {
      // Pass the current unit code to the verification service
      const result = await verifyByExamCard(
        scannedData,
        user?.token || "",
        currentUnit?.code, // Pass unit code if set
      );

      // Pass both student result and unit details to verification result page
      router.push({
        pathname: "/verification-result",
        params: {
          student: JSON.stringify(result),
          unitCode: currentUnit?.code || "",
          unitName: currentUnit?.name || "",
        },
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
        params: {
          error: errorMessage,
          unitCode: currentUnit?.code || "",
          unitName: currentUnit?.name || "",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setScanning(true);
  };

  const toggleEdit = () => {
    if (currentUnit && !isEditing) {
      setUnitCode(currentUnit.code);
      setUnitName(currentUnit.name);
    }
    setIsEditing(!isEditing);
  };

  // Function to handle start scanning
  const handleStartScanning = () => {
    if (!currentUnit) {
      Alert.alert(
        "Unit Not Set",
        "Please set a unit before starting to scan. Use the 'Edit' button to add unit details.",
        [{ text: "OK" }],
      );
      return;
    }
    setScanning(true);
  };

  // Determine if start scanning should be disabled
  const isStartScanningDisabled = !currentUnit || loading;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      {/* Unit Section */}
      <View style={styles.unitSection}>
        <View style={styles.unitHeader}>
          <Text style={styles.unitTitle}>Unit Details</Text>
          <TouchableOpacity onPress={toggleEdit}>
            <MaterialIcons
              name={isEditing ? "cancel" : "edit"}
              size={24}
              color="#0066cc"
            />
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <>
            <View style={styles.inputRow}>
              <MaterialIcons name="code" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Enter unit code (e.g., CS101)"
                value={unitCode}
                onChangeText={setUnitCode}
                editable={isEditing}
              />
            </View>
            <View style={styles.inputRow}>
              <MaterialIcons name="book" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Enter unit name"
                value={unitName}
                onChangeText={setUnitName}
                editable={isEditing}
              />
            </View>

            <View style={styles.unitButtons}>
              <TouchableOpacity
                style={[styles.unitButton, styles.updateButton]}
                onPress={handleUpdateUnit}
              >
                <MaterialIcons name="save" size={20} color="white" />
                <Text style={styles.unitButtonText}>Update Unit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.unitButton, styles.clearButton]}
                onPress={handleClearUnit}
              >
                <MaterialIcons name="clear" size={20} color="white" />
                <Text style={styles.unitButtonText}>Clear Unit</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.unitInfo}>
            <View style={styles.unitInfoRow}>
              <MaterialIcons name="code" size={20} color="#666" />
              <Text style={styles.unitInfoLabel}>Unit Code:</Text>
              <Text style={styles.unitInfoValue}>
                {currentUnit?.code || "Not set"}
              </Text>
            </View>
            <View style={styles.unitInfoRow}>
              <MaterialIcons name="book" size={20} color="#666" />
              <Text style={styles.unitInfoLabel}>Unit Name:</Text>
              <Text style={styles.unitInfoValue}>
                {currentUnit?.name || "Not set"}
              </Text>
            </View>
            {currentUnit ? (
              <Text style={styles.unitNote}>
                Currently selected unit. Students will be verified against this
                unit.
              </Text>
            ) : (
              <View style={styles.unitWarning}>
                <MaterialIcons name="warning" size={16} color="#ff9900" />
                <Text style={styles.unitWarningText}>
                  Please set a unit before scanning
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Scanner Section */}
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
                {currentUnit
                  ? "Press Start Scanning Button to begin"
                  : "Set unit details to enable scanning"}
              </Text>
              {currentUnit ? (
                <View style={styles.currentUnitBanner}>
                  <MaterialIcons name="info" size={16} color="#0066cc" />
                  <Text style={styles.currentUnitText}>
                    Scanning for: {currentUnit.code} - {currentUnit.name}
                  </Text>
                </View>
              ) : (
                <View style={styles.noUnitWarning}>
                  <MaterialIcons
                    name="error-outline"
                    size={20}
                    color="#cc3300"
                  />
                  <Text style={styles.noUnitWarningText}>
                    No unit selected. Scanning disabled.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.button,
            scanning ? styles.stopButton : styles.startButton,
            isStartScanningDisabled && styles.disabledButton,
          ]}
          onPress={scanning ? () => setScanning(false) : handleStartScanning}
          disabled={isStartScanningDisabled}
        >
          <Text style={styles.buttonText}>
            {scanning ? "Stop Scanning" : "Start Scanning"}
          </Text>
          {isStartScanningDisabled && !loading && (
            <MaterialIcons
              name="lock"
              size={16}
              color="rgba(255,255,255,0.8)"
              style={styles.lockIcon}
            />
          )}
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

            {currentUnit && (
              <View style={styles.unitBadge}>
                <MaterialIcons name="class" size={16} color="#0066cc" />
                <Text style={styles.unitBadgeText}>
                  Unit: {currentUnit.code}
                </Text>
              </View>
            )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: invigilatorTheme.colors.bg,
  },
  unitSection: {
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: invigilatorTheme.colors.border,
  },
  unitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: invigilatorTheme.colors.text,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: invigilatorTheme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  unitButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  unitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  updateButton: {
    backgroundColor: "#0066cc",
  },
  clearButton: {
    backgroundColor: "#cc3300",
  },
  unitButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
  unitInfo: {
    paddingVertical: 5,
  },
  unitInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  unitInfoLabel: {
    fontWeight: "600",
    marginLeft: 8,
    marginRight: 10,
    color: "#555",
    width: 80,
  },
  unitInfoValue: {
    flex: 1,
    color: "#333",
    fontSize: 16,
  },
  unitNote: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 10,
    padding: 8,
    backgroundColor: "#f0f8ff",
    borderRadius: 5,
  },
  unitWarning: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 8,
    backgroundColor: "#fff8e1",
    borderRadius: 5,
  },
  unitWarningText: {
    fontSize: 12,
    color: "#ff9900",
    marginLeft: 5,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef3f9",
  },
  icon: {
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  currentUnitBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f2ff",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  currentUnitText: {
    color: "#0066cc",
    marginLeft: 8,
    fontWeight: "500",
  },
  noUnitWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  noUnitWarningText: {
    color: "#cc3300",
    marginLeft: 8,
    fontWeight: "500",
  },
  controls: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: invigilatorTheme.colors.border,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  startButton: {
    backgroundColor: "#0066cc",
  },
  stopButton: {
    backgroundColor: "#cc3300",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  lockIcon: {
    marginLeft: 8,
  },
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
    marginBottom: 10,
    textAlign: "center",
  },
  unitBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e6f2ff",
    padding: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  unitBadgeText: {
    color: "#0066cc",
    fontWeight: "500",
    marginLeft: 5,
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
    backgroundColor: invigilatorTheme.colors.primary,
  },
  modalButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
