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
import { studentTheme } from "../_theme/studentTheme";
import { LecturerEvaluationRecord, LecturerEvaluationStatus } from "../_types";

const formatKES = (amount: number) =>
  `KES ${Number(amount || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

export default function LecturerEvaluationsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { student } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<LecturerEvaluationStatus | null>(null);
  const [evaluations, setEvaluations] = useState<LecturerEvaluationRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!student) {
      setLoading(false);
      return;
    }
    try {
      setLoadError(null);
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
      setLoadError("Unable to load lecturer evaluations right now.");
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
  const feesCleared = status?.feesCleared ?? true;
  const feeBalance = status?.feeBalance ?? 0;
  const canAddEvaluation = feesCleared && hasRegisteredUnits;
  const registrationHint = !feesCleared
    ? `Unit registration and evaluations are locked until fees are cleared. Current balance: ${formatKES(feeBalance)}.`
    : "No registered units found yet. Once units are registered, evaluate all assigned lecturers.";

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
        <ActivityIndicator size="large" color={studentTheme.colors.primary} />
      </View>
    );
  }

  return (
      <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: Math.max(insets.top + 8, 18),
            paddingBottom: insets.bottom + 90,
          },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerCard}>
          <Text style={styles.title}>Lecturer Evaluations</Text>
          <Text style={styles.subtitle}>
            {canAddEvaluation
              ? "Evaluate each lecturer for all registered units before exam card generation."
              : registrationHint}
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
              !canAddEvaluation && styles.primaryButtonDisabled,
            ]}
            onPress={() => openEvaluationForm()}
            disabled={!canAddEvaluation}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>
              {canAddEvaluation ? "Add New Evaluation" : "Evaluation Locked"}
            </Text>
          </TouchableOpacity>
        </View>

        {loadError ? (
          <View style={styles.noticeCardError}>
            <MaterialIcons name="error-outline" size={18} color="#B91C1C" />
            <Text style={styles.noticeTextError}>{loadError}</Text>
          </View>
        ) : null}

        {!canAddEvaluation ? (
          <View style={styles.noticeCard}>
            <MaterialIcons
              name={feesCleared ? "info-outline" : "lock-outline"}
              size={18}
              color={feesCleared ? studentTheme.colors.primary : "#B45309"}
            />
            <Text style={styles.noticeText}>{registrationHint}</Text>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pending Units</Text>
          {!canAddEvaluation ? (
            <Text style={styles.emptyText}>
              {registrationHint}
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
            <Text style={styles.emptyText}>
              {canAddEvaluation
                ? "No lecturer evaluations submitted yet."
                : "No lecturer evaluations available yet."}
            </Text>
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
    backgroundColor: studentTheme.colors.bg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentTheme.colors.bg,
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
    backgroundColor: studentTheme.colors.primary,
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
    opacity: 0.6,
  },
  noticeCard: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: "#7C2D12",
    lineHeight: 18,
  },
  noticeCardError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  noticeTextError: {
    flex: 1,
    fontSize: 12,
    color: "#B91C1C",
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
    backgroundColor: studentTheme.colors.primary,
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
