import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import VerificationCard from "../components/VerificationCard";
import { useAuth } from "../context/AuthContext";
import ProfileMenu from "../profile/ProfileMenu";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <LinearGradient
      colors={["#F8F9FF", "#EFF1FF"]}
      style={styles.gradientContainer}
    >
      <StatusBar style="dark" />
      <View style={styles.container}>
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
            colors={["#6E3BFF", "#8D5EF2"]}
          />
          <VerificationCard
            title="Reports Generation"
            description="View attendance reports and statistics"
            icon="qrcode"
            route="../reports"
            colors={["#6E3BFF", "#8D5EF2"]}
          />

          <VerificationCard
            title="Students Record"
            description="Student attendance records and history"
            icon="qrcode"
            route="../screens/studentDashboard"
            colors={["#6E3BFF", "#8D5EF2"]}
          />
          {/* 
          <VerificationCard
            title="Verification History"
            description="View your recent verification activities"
            icon="history"
            route="./history"
            colors={["#4CAF50", "#66BB6A"]}
          /> */}

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialIcons name="verified" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>52</Text>
              <Text style={styles.statLabel}>Verified Today</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="error" size={24} color="#F44336" />
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Issues</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <MaterialIcons name="logout" size={20} color="#F44336" />
          <Text style={styles.logoutText}>Logout</Text>
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
    paddingTop: 50,
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
    color: "#6E3BFF",
    backgroundColor: "#F0E7FF",
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
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.2)",
  },
  logoutText: {
    color: "#F44336",
    fontWeight: "600",
    marginLeft: 8,
  },
});
