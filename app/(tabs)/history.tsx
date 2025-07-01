import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useQuery } from "react-query";
import HistoryItem from "../components/HistoryItem";
import { useAuth } from "../context/AuthContext";

const mockVerificationHistory = [
  {
    _id: "1",
    studentId: "STU20250001",
    status: "success",
    timestamp: "2025-06-15T09:30:00Z",
    verificationMethod: "barcode",
    studentName: "John Doe",
    exam: "Final Examination 2025",
  },
  {
    _id: "2",
    studentId: "STU20250002",
    status: "failed",
    timestamp: "2025-06-15T10:15:00Z",
    verificationMethod: "barcode",
    studentName: "Jane Smith",
    exam: "Midterm Examination 2025",
  },
  {
    _id: "3",
    studentId: "STU20250003",
    status: "success",
    timestamp: "2025-06-16T11:20:00Z",
    verificationMethod: "barcode",
    studentName: "Robert Johnson",
    exam: "Final Examination 2025",
  },
  {
    _id: "4",
    studentId: "STU20250004",
    status: "success",
    timestamp: "2025-06-17T14:45:00Z",
    verificationMethod: "barcode",
    studentName: "Emily Davis",
    exam: "Practical Exam 2025",
  },
  {
    _id: "5",
    studentId: "STU20250005",
    status: "failed",
    timestamp: "2023-06-18T16:30:00Z",
    verificationMethod: "barcode",
    studentName: "Michael Wilson",
    exam: "Final Examination 2025",
  },
  {
    _id: "6",
    studentId: "STU20250006",
    status: "success",
    timestamp: "2025-06-16T11:20:00Z",
    verificationMethod: "barcode",
    studentName: "Cynthia Job",
    exam: "Final Examination 2025",
  },
  {
    _id: "7",
    studentId: "STU20250007",
    status: "success",
    timestamp: "2025-06-17T14:45:00Z",
    verificationMethod: "barcode",
    studentName: "Tariq Davis",
    exam: "Practical Exam 2025",
  },
  {
    _id: "8",
    studentId: "STU20250008",
    status: "failed",
    timestamp: "2025-06-18T16:30:00Z",
    verificationMethod: "barcode",
    studentName: "Vincent Nyamboke",
    exam: "Final Examination 2025",
  },
];

export default function HistoryScreen() {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery(
    "verificationHistory",
    async () => {
      if (__DEV__) {
        return mockVerificationHistory;
      } else {
        // This will be your actual API call later
        // const history = await getVerificationHistory(user?.token || "");
        // return history as unknown as typeof mockVerificationHistory;
        return [];
      }
    },
    { enabled: !!user?.token }
  );

  const onRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6E3BFF" />
        <Text style={styles.loadingText}>Loading verification history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={50} color="#F44336" />
        <Text style={styles.errorText}>Failed to load history</Text>
        <Text style={styles.errorSubtext}>
          Please check your connection and try again
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#F8F9FF", "#EFF1FF"]}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Verification History</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {data?.filter(
                  (item: { status: string }) => item.status === "success"
                ).length || 0}
              </Text>
              <Text style={styles.statLabel}>Successful</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {data?.filter(
                  (item: { status: string }) => item.status === "failed"
                ).length || 0}
              </Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{data?.length || 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <HistoryItem item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="history" size={50} color="#DDD" />
              <Text style={styles.emptyText}>
                No verification history found
              </Text>
              <Text style={styles.emptySubtext}>
                Verified students will appear here
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              colors={["#6E3BFF"]}
              tintColor="#6E3BFF"
            />
          }
          showsVerticalScrollIndicator={false}
        />
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
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FF",
  },
  loadingText: {
    marginTop: 15,
    color: "#666",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#F8F9FF",
  },
  errorText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#F44336",
    marginTop: 15,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
    textAlign: "center",
    marginHorizontal: 40,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#6E3BFF",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    width: "30%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6E3BFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  listContent: {
    paddingBottom: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    marginTop: 15,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#AAA",
    marginTop: 5,
  },
});
