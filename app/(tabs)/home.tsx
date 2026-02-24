import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VerificationCard from "../components/VerificationCard";
import { useAuth } from "../context/AuthContext";
import ProfileMenu from "../profile/ProfileMenu";
import { getAttendanceStatistics } from "../services/database";
import { invigilatorTheme } from "../theme/invigilatorTheme";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [todayVerified, setTodayVerified] = useState(0);
  const [todayIssues, setTodayIssues] = useState(0);

  const loadStats = useCallback(async () => {
    try {
      const stats = await getAttendanceStatistics();
      setTodayVerified(stats.todaysEligible || 0);
      setTodayIssues(stats.todaysIssues || 0);
    } catch {
      setTodayVerified(0);
      setTodayIssues(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats]),
  );

  return (
    <LinearGradient
      colors={["#F8F9FF", "#EFF1FF"]}
      style={styles.gradientContainer}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.userName}</Text>
            <Text style={styles.userRole}>{user?.role}</Text>
          </View>
          <View style={styles.avatar}>
            <ProfileMenu />
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <VerificationCard
            title="Scan Student Code"
            description="Verify student exam eligibility by scanning their barcode/QR code"
            icon="qrcode" // Correct MaterialIcons name
            route="./scan"
            colors={["#0066cc", "#1a7be6"]}
          />
          <VerificationCard
            title="Reports Generation"
            description="View attendance reports and statistics"
            icon="qrcode"
            route="../reports"
            colors={["#0066cc", "#1a7be6"]}
          />

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialIcons name="verified" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>{todayVerified}</Text>
              <Text style={styles.statLabel}>Verified Today</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="error" size={24} color="#F44336" />
              <Text style={styles.statNumber}>{todayIssues}</Text>
              <Text style={styles.statLabel}>Issues</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <MaterialIcons name="logout" size={20} color="#F44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: "#666",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    marginTop: 5,
  },
  userRole: {
    fontSize: 14,
    color: invigilatorTheme.colors.primary,
    backgroundColor: invigilatorTheme.colors.primarySoft,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 5,
    fontWeight: "600",
  },
  avatar: {
    marginLeft: 15,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 5,
    color: "#2C3E50",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "rgba(198, 40, 40, 0.08)",
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(198, 40, 40, 0.2)",
  },
  logoutText: {
    color: "#F44336",
    fontWeight: "600",
    marginLeft: 8,
  },
});
