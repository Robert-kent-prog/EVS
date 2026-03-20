import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStudentAuth } from "../_context/StudentAuthContext";
import api from "../_services/api";
import { LecturerEvaluationRecord, LecturerEvaluationStatus } from "../_types";

export default function LecturerEvaluationsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { student } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<LecturerEvaluationStatus | null>(null);
  const [evaluations, setEvaluations] = useState<LecturerEvaluationRecord[]>([]);

  const loadData = useCallback(async () => {
    if (!student) {
      setLoading(false);
      return;
    }
    try {
      const [statusData, listData] = await Promise.all([
        api.getLecturerEvaluationStatus(student.studentId),
        api.getStudentLecturerEvaluations(),
      ]);

      setStatus(statusData);
      setEvaluations(
        [...(listData.evaluations || [])].sort(
          (a, b) =>
            new Date(b.updatedAt || b.submittedAt).getTime() -
            new Date(a.updatedAt || a.submittedAt).getTime(),
        ),
      );
    } catch (error) {
      console.error("Failed to load lecturer evaluations:", error);
    } finally {
      setLoading(false);
    }
  }, [student]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const unitTitleByCode = useMemo(() => {
    const map = new Map<string, string>();
    (student?.registeredCourses || []).forEach((course) => {
      map.set(course.courseCode.toUpperCase(), course.courseName);
    });
    return map;
  }, [student?.registeredCourses]);

  const missingUnits = useMemo(() => {
    return (status?.missingUnitCodes || []).map((unitCode) => ({
      code: unitCode,
      title: unitTitleByCode.get(unitCode) || "Unit Title Not Found",
    }));
  }, [status?.missingUnitCodes, unitTitleByCode]);

  const hasRegisteredUnits = status?.hasRegisteredUnits ?? false;

  const openEvaluationForm = (unitCode?: string, unitTitle?: string) => {
    router.push({
      pathname: "/(student-tabs)/lecturer-evaluation",
      params: {
        unitCode: unitCode || "",
        unitTitle: unitTitle || "",
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B5FA5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerCard}>
          <Text style={styles.title}>Lecturer Evaluations</Text>
          <Text style={styles.subtitle}>
            Evaluate each lecturer for all registered units before exam card
            generation.
          </Text>
          <View style={styles.progressRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{status?.completedUnits || 0}</Text>
              <Text style={styles.metricLabel}>Evaluated</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{status?.requiredUnits || 0}</Text>
              <Text style={styles.metricLabel}>Required</Text>
            </View>
            <View
              style={[
                styles.metricBox,
                status?.completed ? styles.metricSuccess : styles.metricPending,
              ]}
            >
              <Text style={styles.metricValue}>
                {status?.completed ? "Done" : "Pending"}
              </Text>
              <Text style={styles.metricLabel}>Status</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !hasRegisteredUnits && styles.primaryButtonDisabled,
            ]}
            onPress={() => openEvaluationForm()}
            disabled={!hasRegisteredUnits}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Add New Evaluation</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pending Units</Text>
          {!hasRegisteredUnits ? (
            <Text style={styles.emptyText}>
              No registered units found. Register units first, then evaluate all
              assigned lecturers.
            </Text>
          ) : missingUnits.length === 0 ? (
            <Text style={styles.emptyText}>
              All required unit lecturers have been evaluated.
            </Text>
          ) : (
            missingUnits.map((unit) => (
              <View key={unit.code} style={styles.pendingRow}>
                <View style={styles.pendingInfo}>
                  <Text style={styles.unitCode}>{unit.code}</Text>
                  <Text style={styles.unitTitle}>{unit.title}</Text>
                </View>
                <TouchableOpacity
                  style={styles.inlineButton}
                  onPress={() => openEvaluationForm(unit.code, unit.title)}
                >
                  <Text style={styles.inlineButtonText}>Evaluate</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Evaluated Lecturers</Text>
          {evaluations.length === 0 ? (
            <Text style={styles.emptyText}>No lecturer evaluations submitted yet.</Text>
          ) : (
            evaluations.map((item) => (
              <View key={item._id} style={styles.evaluationRow}>
                <View style={styles.evaluationMain}>
                  <Text style={styles.unitCode}>{item.unitCode}</Text>
                  <Text style={styles.unitTitle}>{item.unitTitle}</Text>
                  <Text style={styles.lecturerName}>Lecturer: {item.lecturerName}</Text>
                </View>
                <Text style={styles.dateText}>
                  {new Date(item.updatedAt || item.submittedAt).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F7FB",
  },
  contentContainer: {
    padding: 16,
    gap: 12,
  },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#475569",
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#DBE4EE",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  metricSuccess: {
    borderColor: "#22C55E",
    backgroundColor: "#ECFDF3",
  },
  metricPending: {
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBEB",
  },
  metricValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  metricLabel: {
    fontSize: 11,
    color: "#334155",
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#0B5FA5",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
  },
  pendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5EAF1",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  pendingInfo: {
    flex: 1,
    paddingRight: 8,
  },
  unitCode: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
  },
  unitTitle: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  inlineButton: {
    backgroundColor: "#8E44AD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inlineButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  evaluationRow: {
    borderWidth: 1,
    borderColor: "#E5EAF1",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  evaluationMain: {
    marginBottom: 6,
  },
  lecturerName: {
    fontSize: 12,
    color: "#334155",
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: "#64748B",
  },
});
