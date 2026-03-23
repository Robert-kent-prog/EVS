import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EligibilityCard from "../_components/EligibilityCard";
import { useStudentAuth } from "../_context/StudentAuthContext";
import api from "../_services/api";
import { studentTheme } from "../_theme/studentTheme";
import { EligibilityStatus } from "../_types";

export default function StudentDashboard() {
  const { student, logout } = useStudentAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  useFocusEffect(
    useCallback(() => {
      loadEligibility();
    }, [loadEligibility]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEligibility();
    setRefreshing(false);
  }, [loadEligibility]);

  const handleGenerateExamCard = async () => {
    if (!student) return;

    if (!eligibility?.isEligible) {
      Alert.alert("Not Eligible", eligibility?.message || "Requirements not met.");
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

  const handleOpenEvaluation = () => {
    router.push("/(student-tabs)/lecturer-evaluations");
  };

  const handleOpenProfile = () => {
    router.push("../student-profile");
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
      <StatusBar
        barStyle="light-content"
        backgroundColor={studentTheme.colors.statusBar}
      />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.studentName}>
              {student.fullName}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleOpenProfile} style={styles.profileButton}>
              <MaterialIcons
                name="person"
                size={22}
                color={studentTheme.colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <MaterialIcons
                name="logout"
                size={22}
                color={studentTheme.colors.danger}
              />
            </TouchableOpacity>
          </View>
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
        contentContainerStyle={{
          paddingBottom: insets.bottom + 90,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Eligibility Status */}
        <EligibilityCard
          eligibility={eligibility}
          onGenerate={handleGenerateExamCard}
          loading={loading}
          disabled={!(eligibility?.isEligible ?? false)}
        />

        {eligibility && !eligibility.hasRegisteredUnits && (
          <View style={styles.evaluationCard}>
            <View style={styles.evaluationHeader}>
              <MaterialIcons name="info" size={20} color="#D35400" />
              <Text style={styles.evaluationTitle}>Unit Registration Needed</Text>
            </View>
            <Text style={styles.evaluationDescription}>
              You do not have registered units yet. Register units first, then
              evaluate all lecturers.
            </Text>
          </View>
        )}

        {eligibility &&
          eligibility.hasRegisteredUnits &&
          !eligibility.evaluationsComplete && (
          <View style={styles.evaluationCard}>
            <View style={styles.evaluationHeader}>
              <MaterialIcons
                name="rate-review"
                size={20}
                color={studentTheme.colors.primary}
              />
              <Text style={styles.evaluationTitle}>Lecturer Evaluation</Text>
            </View>
            <Text style={styles.evaluationDescription}>
              Complete the lecturer evaluation form before generating your exam
              card.
            </Text>
            <TouchableOpacity
              style={styles.evaluationButton}
              onPress={handleOpenEvaluation}
            >
              <MaterialIcons name="open-in-new" size={18} color="#fff" />
              <Text style={styles.evaluationButtonText}>Evaluate Lecturer</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: studentTheme.colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: studentTheme.colors.surface,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: studentTheme.colors.border,
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
    borderRadius: 10,
    backgroundColor: "#FFEDEE",
  },
  profileButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: studentTheme.colors.primarySoft,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  evaluationCard: {
    marginTop: 16,
    backgroundColor: studentTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CFE6D9",
    padding: 16,
  },
  evaluationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  evaluationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
  },
  evaluationDescription: {
    fontSize: 13,
    color: "#5F6C7B",
    marginBottom: 12,
  },
  evaluationButton: {
    backgroundColor: studentTheme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  evaluationButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: studentTheme.colors.surface,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: studentTheme.colors.border,
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
    color: studentTheme.colors.primary,
  },
});
