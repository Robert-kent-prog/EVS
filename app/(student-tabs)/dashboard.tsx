import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EligibilityCard from "../components/EligibilityCard";
import { useStudentAuth } from "../context/StudentAuthContext";
import api from "../services/api";
import { EligibilityStatus } from "../types";
import { checkExamCardEligibility } from "../utils/eligibility";

export default function StudentDashboard() {
  const { student, logout } = useStudentAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityStatus | null>(null);
  const [loading, setLoading] = useState(false);


  const loadEligibility = useCallback(async () => {
    if (student) {
      try {
        const result = await api.checkEligibility(student.studentId);
        setEligibility(result);
      } catch (error) {
        console.error("Error checking eligibility:", error);
      }
    }
  }, [student]);

  useEffect(() => {
    loadEligibility();
  }, [loadEligibility]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEligibility();
    setRefreshing(false);
  }, [loadEligibility]);

  const handleGenerateExamCard = async () => {
    if (!student) return;

    // Double check eligibility before generating
    const { isEligible, reasons } = checkExamCardEligibility(student);

    if (!isEligible) {
      Alert.alert(
        "Not Eligible",
        `You cannot generate an exam card yet:\n\n${reasons.map(r => `• ${r}`).join('\n')}`
      );
      return;
    }

    setLoading(true);
    try {
      await api.generateExamCard(student.studentId);
      Alert.alert(
        "Success",
        "Exam card generated successfully. Open the Exam Cards tab to download, share, or delete it.",
      );
      await loadEligibility();
    } catch (err) {
      const error = err as Error;
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

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

  if (!student) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.studentName}>
              {student.fullName}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.infoText}>
            <MaterialIcons name="school" size={16} /> Reg:{" "}
            {student.studentId}
          </Text>
          <Text style={styles.infoText}>
            <MaterialIcons name="account-balance" size={16} />{" "}
            {student.department || 'N/A'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Eligibility Status */}
        <EligibilityCard
          eligibility={eligibility}
          onGenerate={handleGenerateExamCard}
          loading={loading}
          disabled={!checkExamCardEligibility(student).isEligible}
        />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  greeting: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  studentName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  logoutButton: {
    padding: 10,
  },
  studentInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoText: {
    fontSize: 14,
    color: "#34495e",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: "#7f8c8d",
  },
  tabLabelActive: {
    color: "#27ae60",
  },
});
