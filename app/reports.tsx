import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "./context/AuthContext";
import {
  AttendanceRecord,
  clearAllRecords,
  getAllAttendanceRecords,
  getAttendanceStatistics,
} from "./services/database";
import { pdfApi } from "./services/pdfApi";

export default function ReportsScreen() {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadData();

    // Set token in PDF API when component mounts or user changes
    if (user?.token) {
      pdfApi.setToken(user.token);
    }
  }, [user?.token]);

  const loadData = async () => {
    try {
      const [records, stats] = await Promise.all([
        getAllAttendanceRecords(),
        getAttendanceStatistics(),
      ]);
      setAttendanceRecords(records);
      setStatistics(stats);
    } catch (error) {
      Alert.alert("Error", "Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!user?.token) {
      Alert.alert("Error", "Authentication required. Please log in again.");
      return;
    }

    setPdfLoading(true);
    try {
      // Prepare data for PDF generation
      const pdfData = {
        title: "Attendance Report",
        generatedAt: new Date().toISOString(),
        statistics: statistics || {},
        records: attendanceRecords.map((record) => ({
          studentId: record.studentId,
          fullName: record.fullName,
          status: record.status,
          academicYear: record.academicYear,
          timestamp: record.timestamp,
          verificationMethod: record.verificationMethod,
        })),
        summary: {
          totalStudents: statistics?.totalStudents || 0,
          eligibleStudents: statistics?.eligibleStudents || 0,
          todaysCount: statistics?.todaysCount || 0,
          generatedBy: "Attendance App",
        },
      };

      // Generate PDF on server
      const response = await pdfApi.generateAttendancePDF(pdfData);

      // Extract reportId from the response
      const reportId = response.data?.reportId;

      if (!reportId) {
        throw new Error("No report ID received from server");
      }

      // Show success alert with download option
      Alert.alert(
        "PDF Generated Successfully",
        `Your attendance report has been generated.\n\nReport ID: ${reportId}`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Download Now",
            onPress: () => {
              handleDownloadPDF(reportId);
            },
          },
        ],
      );
    } catch (error: any) {
      let errorMessage = "Failed to generate PDF report";

      if (error.message === "Authentication failed. Please log in again.") {
        errorMessage = "Session expired. Please log in again.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message === "No report ID received from server") {
        errorMessage = "Server did not return a valid report ID.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadPDF = async (reportId: string) => {
    if (!user?.token) {
      Alert.alert("Error", "Authentication required. Please log in again.");
      return;
    }

    // Validate reportId
    if (!reportId || reportId.trim() === "") {
      Alert.alert("Error", "Invalid report ID. Please generate a new PDF.");
      return;
    }

    setPdfLoading(true);
    try {
      await pdfApi.downloadPDF(reportId);

      Alert.alert("Success", "PDF downloaded successfully!", [
        {
          text: "OK",
        },
      ]);
    } catch (error: any) {
      let errorMessage = "Failed to download PDF";

      if (error.message === "Invalid report ID") {
        errorMessage = "Invalid report ID. Please generate a new PDF report.";
      } else if (
        error.message === "Authentication failed. Please log in again."
      ) {
        errorMessage = "Session expired. Please log in again.";
      } else if (error.message === "PDF report not found") {
        errorMessage = "PDF report not found. It may have been deleted.";
      }

      Alert.alert("Download Error", errorMessage);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExportPDF = async () => {
    // Check if there are records to export
    if (attendanceRecords.length === 0) {
      Alert.alert(
        "No Records",
        "There are no attendance records to export. Please scan some students first.",
        [{ text: "OK" }],
      );
      return;
    }

    // Show options for PDF generation/download
    Alert.alert("Export Report", "Choose an action:", [
      {
        text: "Generate New PDF",
        onPress: handleGeneratePDF,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleClearRecords = () => {
    if (attendanceRecords.length === 0) {
      Alert.alert("No Records", "There are no records to clear.");
      return;
    }

    Alert.alert(
      "Clear All Records",
      `Are you sure you want to delete all ${attendanceRecords.length} attendance records?\n\nThis action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllRecords();
              await loadData(); // Refresh data
              Alert.alert("Success", "All records have been cleared");
            } catch (error) {
              Alert.alert("Error", "Failed to clear records");
            }
          },
        },
      ],
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const renderRecord = ({
    item,
    index,
  }: {
    item: AttendanceRecord;
    index: number;
  }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.serialNumber}>{index + 1}.</Text>
        <Text style={styles.studentId}>{item.studentId}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === "eligible"
              ? styles.eligibleBadge
              : styles.ineligibleBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === "eligible" ? "Eligible" : "Not Eligible"}
          </Text>
        </View>
      </View>

      <Text style={styles.studentName}>{item.fullName}</Text>

      <View style={styles.recordDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="calendar-today" size={14} color="#666" />
          <Text style={styles.detailText}>
            Academic Year: {item.academicYear}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="schedule" size={14} color="#666" />
          <Text style={styles.detailText}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.methodBadge}>
          <MaterialIcons
            name={
              item.verificationMethod === "exam_card"
                ? "qr-code-scanner"
                : "edit"
            }
            size={12}
            color="#666"
          />
          <Text style={styles.methodText}>
            {item.verificationMethod === "exam_card"
              ? "Barcode Scan"
              : "Manual Entry"}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="history" size={60} color="#0066cc" />
        <Text style={styles.loadingText}>Loading attendance data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Statistics Header */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Attendance Summary</Text>

        {user?.userName && (
          <Text style={styles.generatedBy}>Generated by: {user.userName}</Text>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {statistics?.totalStudents || 0}
            </Text>
            <Text style={styles.statLabel}>Total Scanned</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.eligibleNumber]}>
              {statistics?.eligibleStudents || 0}
            </Text>
            <Text style={styles.statLabel}>Eligible</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.todayNumber]}>
              {statistics?.todaysCount || 0}
            </Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.exportButton,
            (!user?.token || attendanceRecords.length === 0) &&
              styles.buttonDisabled,
          ]}
          onPress={handleExportPDF}
          disabled={
            pdfLoading || !user?.token || attendanceRecords.length === 0
          }
        >
          {pdfLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <MaterialIcons name="picture-as-pdf" size={20} color="white" />
              <Text style={styles.actionButtonText}>
                {attendanceRecords.length === 0 ? "No Records" : "Export PDF"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.clearButton,
            attendanceRecords.length === 0 && styles.buttonDisabled,
          ]}
          onPress={handleClearRecords}
          disabled={attendanceRecords.length === 0}
        >
          <MaterialIcons name="delete-sweep" size={20} color="white" />
          <Text style={styles.actionButtonText}>
            {attendanceRecords.length === 0 ? "No Records" : "Clear Records"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Records List */}
      <FlatList
        data={attendanceRecords}
        renderItem={renderRecord}
        keyExtractor={(item) => `${item.id}-${item.timestamp}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={80} color="#cccccc" />
            <Text style={styles.emptyText}>No attendance records yet</Text>
            <Text style={styles.emptySubtext}>
              Scan student exam cards to start recording attendance
            </Text>
            {!user?.token && (
              <Text style={styles.authWarning}>
                Note: You need to be logged in to export PDF reports
              </Text>
            )}
          </View>
        }
        ListHeaderComponent={
          attendanceRecords.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                Recent Scans ({attendanceRecords.length} total)
              </Text>
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>#</Text>
                <Text style={styles.headerCell}>Student ID</Text>
                <Text style={styles.headerCell}>Status</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Loading overlay for PDF operations */}
      {pdfLoading && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.overlayText}>Processing PDF...</Text>
            <Text style={styles.overlaySubtext}>This may take a moment</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  statsContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statsTitle: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  generatedBy: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    fontStyle: "italic",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    color: "#333",
    fontSize: 28,
    fontWeight: "bold",
  },
  eligibleNumber: {
    color: "#2E7D32",
  },
  todayNumber: {
    color: "#ED6C02",
  },
  statLabel: {
    color: "#666",
    fontSize: 14,
    marginTop: 5,
  },
  actionContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    opacity: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  exportButton: {
    backgroundColor: "#1976D2",
  },
  clearButton: {
    backgroundColor: "#D32F2F",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 14,
  },
  listContainer: {
    padding: 15,
  },
  listHeader: {
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  headerCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  recordCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  serialNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginRight: 10,
    width: 25,
  },
  studentId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eligibleBadge: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  ineligibleBadge: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 10,
  },
  recordDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  methodBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  methodText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#999",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 10,
  },
  authWarning: {
    fontSize: 14,
    color: "#ff9800",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
  },
  overlayText: {
    marginTop: 15,
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  overlaySubtext: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
  },
});
