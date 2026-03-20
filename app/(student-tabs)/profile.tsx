import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../services/api";
import { AttendanceOverview, AttendanceTimetableEntry } from "../types";

const START_TIME_OPTIONS = ["07:00", "10:00", "13:00", "16:00"];
const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const formatDay = (dayOfWeek: number) =>
  DAYS.find((item) => item.value === dayOfWeek)?.label || `Day ${dayOfWeek}`;

const addThreeHours = (startTime: string) => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const resultHours = hours + 3;
  return `${resultHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const todaysDateISO = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function StudentAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const [overview, setOverview] = useState<AttendanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingTimetable, setSavingTimetable] = useState(false);
  const [signingKey, setSigningKey] = useState<string | null>(null);

  const [semesterStartDate, setSemesterStartDate] = useState(todaysDateISO());
  const [semesterWeeks, setSemesterWeeks] = useState("14");
  const [draftEntries, setDraftEntries] = useState<AttendanceTimetableEntry[]>([]);

  const [selectedUnitCode, setSelectedUnitCode] = useState("");
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedStartTime, setSelectedStartTime] = useState("07:00");

  const loadOverview = useCallback(async () => {
    try {
      const response = await api.getAttendanceOverview();
      setOverview(response);
      setSemesterStartDate(
        response.timetableConfig.semesterStartDate || todaysDateISO(),
      );
      setSemesterWeeks(String(response.timetableConfig.semesterWeeks || 14));
      setDraftEntries(response.weeklyTimetable || []);
    } catch (error: any) {
      Alert.alert(
        "Attendance Error",
        error?.response?.data?.message || "Failed to load attendance details.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOverview();
    }, [loadOverview]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOverview();
    setRefreshing(false);
  }, [loadOverview]);

  const registeredUnits = useMemo(
    () =>
      (overview?.registeredUnits || []).map((unit) => ({
        unitCode: unit.courseCode.toUpperCase(),
        courseName: unit.courseName,
      })),
    [overview?.registeredUnits],
  );

  const selectedUnitName =
    registeredUnits.find((unit) => unit.unitCode === selectedUnitCode)
      ?.courseName || "";

  const handleAddClass = () => {
    if (!selectedUnitCode) {
      Alert.alert("Missing Unit", "Select a unit first.");
      return;
    }

    const entryExists = draftEntries.some(
      (entry) =>
        entry.dayOfWeek === selectedDay && entry.startTime === selectedStartTime,
    );

    if (entryExists) {
      Alert.alert(
        "Slot Occupied",
        "A class already exists for this day and start time.",
      );
      return;
    }

    const classesOnDay = draftEntries.filter(
      (entry) => entry.dayOfWeek === selectedDay,
    );
    if (classesOnDay.length >= 4) {
      Alert.alert(
        "Daily Limit Reached",
        "You can only set up to 4 classes per day.",
      );
      return;
    }

    const newEntry: AttendanceTimetableEntry = {
      unitCode: selectedUnitCode,
      courseName: selectedUnitName || selectedUnitCode,
      dayOfWeek: selectedDay,
      startTime: selectedStartTime,
      endTime: addThreeHours(selectedStartTime),
    };

    setDraftEntries((prev) =>
      [...prev, newEntry].sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) {
          return a.dayOfWeek - b.dayOfWeek;
        }
        return a.startTime.localeCompare(b.startTime);
      }),
    );
  };

  const handleRemoveEntry = (index: number) => {
    setDraftEntries((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveTimetable = async () => {
    if (!overview?.hasRegisteredUnits) {
      Alert.alert(
        "No Units",
        "Register units first before setting attendance timetable.",
      );
      return;
    }

    if (!semesterStartDate.trim()) {
      Alert.alert("Missing Date", "Semester start date is required.");
      return;
    }

    if (draftEntries.length === 0) {
      Alert.alert("Empty Timetable", "Add at least one class to timetable.");
      return;
    }

    const parsedWeeks = Number(semesterWeeks);
    if (!Number.isInteger(parsedWeeks) || parsedWeeks < 12 || parsedWeeks > 14) {
      Alert.alert(
        "Invalid Semester Weeks",
        "Semester weeks must be a number between 12 and 14.",
      );
      return;
    }

    setSavingTimetable(true);
    try {
      await api.updateAttendanceTimetable({
        semesterStartDate: semesterStartDate.trim(),
        semesterWeeks: parsedWeeks,
        timetable: draftEntries,
      });
      Alert.alert("Saved", "Weekly timetable saved successfully.");
      await loadOverview();
    } catch (error: any) {
      Alert.alert(
        "Save Failed",
        error?.response?.data?.message || "Failed to save timetable.",
      );
    } finally {
      setSavingTimetable(false);
    }
  };

  const handleSignClass = async (unitCode: string, startTime: string) => {
    const key = `${unitCode}-${startTime}`;
    setSigningKey(key);
    try {
      await api.signClassAttendance({ unitCode, startTime });
      Alert.alert("Signed", "Attendance signed successfully.");
      await loadOverview();
    } catch (error: any) {
      Alert.alert(
        "Sign Failed",
        error?.response?.data?.message || "Unable to sign attendance now.",
      );
    } finally {
      setSigningKey(null);
    }
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
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Class Attendance</Text>
          <Text style={styles.headerSubtitle}>
            Sign attendance after each class ends. Window closes in 10 minutes.
          </Text>
          <View style={styles.metricsRow}>
            <MetricBox
              label="Attendance"
              value={`${overview?.metrics.attendancePercentage ?? 0}%`}
            />
            <MetricBox
              label="Attended"
              value={`${overview?.metrics.attendedSessions ?? 0}`}
            />
            <MetricBox
              label="Required"
              value={`${overview?.metrics.expectedClosedSessions ?? 0}`}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Classes</Text>
          {(overview?.todayClasses || []).length === 0 ? (
            <Text style={styles.emptyText}>No classes scheduled for today.</Text>
          ) : (
            (overview?.todayClasses || []).map((classItem) => {
              const key = `${classItem.unitCode}-${classItem.startTime}`;
              return (
                <View key={key} style={styles.classRow}>
                  <View style={styles.classInfo}>
                    <Text style={styles.classCode}>{classItem.unitCode}</Text>
                    <Text style={styles.className}>{classItem.courseName}</Text>
                    <Text style={styles.classTime}>
                      {classItem.startTime} - {classItem.endTime}
                    </Text>
                  </View>
                  {classItem.status === "sign_open" ? (
                    <TouchableOpacity
                      style={styles.signButton}
                      onPress={() =>
                        handleSignClass(classItem.unitCode, classItem.startTime)
                      }
                      disabled={signingKey === key}
                    >
                      <Text style={styles.signButtonText}>
                        {signingKey === key ? "Signing..." : "Sign"}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <StatusPill status={classItem.status} />
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Timetable Setup</Text>
          {!overview?.hasRegisteredUnits ? (
            <Text style={styles.emptyText}>
              No registered units found. Register units first before timetable setup.
            </Text>
          ) : (
            <>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Semester Start Date</Text>
                  <TextInput
                    value={semesterStartDate}
                    onChangeText={setSemesterStartDate}
                    placeholder="YYYY-MM-DD"
                    style={styles.input}
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.inputGroupSmall}>
                  <Text style={styles.inputLabel}>Weeks (12-14)</Text>
                  <TextInput
                    value={semesterWeeks}
                    onChangeText={setSemesterWeeks}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Select Unit</Text>
              <View style={styles.chipsWrap}>
                {registeredUnits.map((unit) => (
                  <TouchableOpacity
                    key={unit.unitCode}
                    style={[
                      styles.chip,
                      selectedUnitCode === unit.unitCode && styles.chipSelected,
                    ]}
                    onPress={() => setSelectedUnitCode(unit.unitCode)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedUnitCode === unit.unitCode && styles.chipTextSelected,
                      ]}
                    >
                      {unit.unitCode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Select Day</Text>
              <View style={styles.chipsWrap}>
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.chip,
                      selectedDay === day.value && styles.chipSelected,
                    ]}
                    onPress={() => setSelectedDay(day.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedDay === day.value && styles.chipTextSelected,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Start Time (3-hour classes)</Text>
              <View style={styles.chipsWrap}>
                {START_TIME_OPTIONS.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.chip,
                      selectedStartTime === time && styles.chipSelected,
                    ]}
                    onPress={() => setSelectedStartTime(time)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedStartTime === time && styles.chipTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.addClassButton} onPress={handleAddClass}>
                <MaterialIcons name="add" size={18} color="#fff" />
                <Text style={styles.addClassText}>Add Class Slot</Text>
              </TouchableOpacity>

              <View style={styles.timetableList}>
                {draftEntries.length === 0 ? (
                  <Text style={styles.emptyText}>No class slots added yet.</Text>
                ) : (
                  draftEntries.map((entry, idx) => (
                    <View key={`${entry.dayOfWeek}-${entry.startTime}-${entry.unitCode}`} style={styles.entryRow}>
                      <View style={styles.entryInfo}>
                        <Text style={styles.entryCode}>
                          {entry.unitCode} - {entry.courseName}
                        </Text>
                        <Text style={styles.entryMeta}>
                          {formatDay(entry.dayOfWeek)} | {entry.startTime} - {entry.endTime}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveEntry(idx)}
                      >
                        <MaterialIcons name="delete-outline" size={18} color="#B91C1C" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              <TouchableOpacity
                style={[styles.saveButton, savingTimetable && styles.disabledButton]}
                onPress={handleSaveTimetable}
                disabled={savingTimetable}
              >
                <Text style={styles.saveButtonText}>
                  {savingTimetable ? "Saving..." : "Save Weekly Timetable"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { text: string; bg: string; color: string }> = {
    pending: { text: "Pending", bg: "#E2E8F0", color: "#334155" },
    sign_open: { text: "Sign Open", bg: "#DCFCE7", color: "#15803D" },
    signed: { text: "Signed", bg: "#DBEAFE", color: "#1D4ED8" },
    missed_locked: { text: "Locked", bg: "#FEE2E2", color: "#B91C1C" },
    out_of_semester: { text: "Semester Off", bg: "#F3E8FF", color: "#7E22CE" },
  };
  const item = map[status] || map.pending;

  return (
    <View style={[styles.statusPill, { backgroundColor: item.bg }]}>
      <Text style={[styles.statusPillText, { color: item.color }]}>{item.text}</Text>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7FB",
  },
  content: {
    padding: 16,
    gap: 12,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#475569",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
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
  metricValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  metricLabel: {
    fontSize: 11,
    color: "#334155",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
  },
  classRow: {
    borderWidth: 1,
    borderColor: "#E5EAF1",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  classInfo: {
    flex: 1,
    paddingRight: 8,
  },
  classCode: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
  },
  className: {
    fontSize: 12,
    color: "#334155",
    marginTop: 2,
  },
  classTime: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  signButton: {
    backgroundColor: "#0B5FA5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  signButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  statusPill: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  inputGroup: {
    flex: 1,
  },
  inputGroupSmall: {
    width: 110,
  },
  inputLabel: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#F8FAFC",
    fontSize: 14,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#FFFFFF",
  },
  chipSelected: {
    backgroundColor: "#0B5FA5",
    borderColor: "#0B5FA5",
  },
  chipText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  addClassButton: {
    marginTop: 2,
    backgroundColor: "#8E44AD",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingVertical: 11,
  },
  addClassText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  timetableList: {
    marginTop: 12,
    marginBottom: 10,
  },
  entryRow: {
    borderWidth: 1,
    borderColor: "#E5EAF1",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  entryInfo: {
    flex: 1,
    paddingRight: 8,
  },
  entryCode: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
  },
  entryMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },
  removeButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: "#0B5FA5",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

