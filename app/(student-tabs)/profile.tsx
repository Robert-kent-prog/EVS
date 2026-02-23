import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useStudentAuth } from "../context/StudentAuthContext";

export default function StudentProfileScreen() {
  const { student, logout } = useStudentAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileInitial}>
            {student?.fullName?.charAt(0) || "S"}
          </Text>
        </View>
        <Text style={styles.profileName}>{student?.fullName}</Text>
        <Text style={styles.profileReg}>{student?.studentId}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoItem}>
            <MaterialIcons name="email" size={20} color="#7f8c8d" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>
                {student?.email || "Not provided"}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="school" size={20} color="#7f8c8d" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{student?.department}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="school" size={20} color="#7f8c8d" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Year of Study</Text>
              <Text style={styles.infoValue}>Year {student?.yearOfStudy}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="class" size={20} color="#7f8c8d" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Semester</Text>
              <Text style={styles.infoValue}>Semester {student?.semester}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Status</Text>

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Attendance</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: (student?.attendance ?? 0) >= 75 ? "#27ae60" : "#e67e22" },
                ]}
              >
                {student?.attendance ?? 0}%
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Fee Balance</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: (student?.feeBalance ?? 0) === 0 ? "#27ae60" : "#e74c3c" },
                ]}
              >
                KES {(student?.feeBalance ?? 0).toLocaleString()}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Evaluations</Text>
              <Text
                style={[
                  styles.statusValue,
                  {
                    color: student?.lecturerEvaluations?.completed
                      ? "#27ae60"
                      : "#e74c3c",
                  },
                ]}
              >
                {student?.lecturerEvaluations?.completed
                  ? "Completed"
                  : "Pending"}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    backgroundColor: "#27ae60",
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  profileInitial: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#27ae60",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  profileReg: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  statusCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 15,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  statusLabel: {
    fontSize: 14,
    color: "#34495e",
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 30,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
});
