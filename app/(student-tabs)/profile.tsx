import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import api from "../_services/api";
import { AttendanceOverview, AttendanceTimetableEntry } from "../_types";

const START_TIME_OPTIONS = ["07:00", "10:00", "13:00", "16:00"];
const DAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
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

const formatKES = (amount: number) =>
  `KES ${Number(amount || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatWeekRange = (startDate: string, endDate: string) => {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return `${start.toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
  })} - ${end.toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
  })}`;
};

export default function StudentAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const [overview, setOverview] = useState<AttendanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingTimetable, setSavingTimetable] = useState(false);
  const [signingKey, setSigningKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(1);

  const [semesterStartDate, setSemesterStartDate] = useState(todaysDateISO());
  const [semesterWeeks, setSemesterWeeks] = useState("14");
  const [draftEntries, setDraftEntries] = useState<AttendanceTimetableEntry[]>([]);

  const [selectedUnitCode, setSelectedUnitCode] = useState("");
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedStartTime, setSelectedStartTime] = useState("07:00");

  const loadOverview = useCallback(async () => {
    try {
      setLoadError(null);
      const response = await api.getAttendanceOverview();
      setOverview(response);
      setSemesterStartDate(
        response.timetableConfig.semesterStartDate || todaysDateISO(),
      );
      setSemesterWeeks(String(response.timetableConfig.semesterWeeks || 14));
      setDraftEntries(response.weeklyTimetable || []);
      const currentWeek = response.attendanceTable?.currentWeekIndex || 1;
      setSelectedWeekIndex(currentWeek > 0 ? currentWeek : 1);
    } catch (error: any) {
      setLoadError(
        error?.response?.data?.message || "Failed to load attendance details.",
      );
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
  const feesCleared = overview?.feesCleared ?? true;
  const feeBalance = overview?.feeBalance ?? 0;
  const hasRegisteredUnits = overview?.hasRegisteredUnits ?? false;
  const canConfigureTimetable = feesCleared && hasRegisteredUnits;
  const registrationHint = !feesCleared
    ? `Attendance timetable is locked until fees are cleared. Current balance: ${formatKES(feeBalance)}.`
    : "No registered units found yet. Register units first before attendance timetable setup.";

  const weekColumns = overview?.attendanceTable?.weekColumns || [];
  const tableRows = overview?.attendanceTable?.rows || [];
  const selectedWeek =
    weekColumns.find((week) => week.weekIndex === selectedWeekIndex) || null;

  const studentName = overview?.studentDisplay?.fullName || "Student";
  const studentId = overview?.studentDisplay?.studentId || "N/A";
  const semesterWeeksValue =
    overview?.semester?.semesterWeeks || Number(semesterWeeks) || 14;

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
        "You can only set up to 4 classes per weekday.",
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
    if (!canConfigureTimetable) {
      Alert.alert("Timetable Locked", registrationHint);
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

  const handleSignClass = async (
    unitCode: string,
    startTime: string,
    cellKey: string,
  ) => {
    setSigningKey(cellKey);
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
        contentContainerStyle={[
          styles.content,
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
          <View style={styles.schoolRow}>
            <Image
              source={require("../../assets/school_logo.jpeg")}
              style={styles.schoolLogo}
            />
            <View style={styles.schoolTextWrap}>
              <Text style={styles.schoolName}>SOUTH EASTERN KENYA UNIVERSITY</Text>
              <Text style={styles.schoolSub}>Class Attendance Register</Text>
            </View>
          </View>
          <View style={styles.studentRow}>
            <Text style={styles.studentName}>{studentName}</Text>
            <Text style={styles.studentMeta}>Reg No: {studentId}</Text>
            <Text style={styles.studentMeta}>
              Academic Year: {overview?.semester?.academicYear || "N/A"}
            </Text>
            <Text style={styles.studentMeta}>Semester Weeks: {semesterWeeksValue}</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {canConfigureTimetable
              ? "Attendance is signed only after class ends and within 10 minutes. Missed sessions are marked X."
              : registrationHint}
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
              label="Closed"
              value={`${overview?.metrics.expectedClosedSessions ?? 0}`}
            />
          </View>
        </View>

        {loadError ? (
          <View style={styles.noticeCardError}>
            <MaterialIcons name="error-outline" size={18} color="#B91C1C" />
            <Text style={styles.noticeTextError}>{loadError}</Text>
          </View>
        ) : null}

        {!canConfigureTimetable ? (
          <View style={styles.noticeCard}>
            <MaterialIcons
              name={feesCleared ? "info-outline" : "lock-outline"}
              size={18}
              color={feesCleared ? "#2563EB" : "#B45309"}
            />
            <Text style={styles.noticeText}>{registrationHint}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Week Calendar</Text>
          {weekColumns.length === 0 ? (
            <Text style={styles.emptyText}>Save a timetable to generate semester weeks.</Text>
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.weekChipRow}>
                  {weekColumns.map((week) => (
                    <TouchableOpacity
                      key={week.weekIndex}
                      style={[
                        styles.weekChip,
                        week.isCurrent && styles.weekChipCurrent,
                        selectedWeekIndex === week.weekIndex && styles.weekChipSelected,
                      ]}
                      onPress={() => setSelectedWeekIndex(week.weekIndex)}
                    >
                      <Text
                        style={[
                          styles.weekChipLabel,
                          selectedWeekIndex === week.weekIndex &&
                            styles.weekChipLabelSelected,
                        ]}
                      >
                        {week.label}
                      </Text>
                      <Text
                        style={[
                          styles.weekChipDate,
                          selectedWeekIndex === week.weekIndex &&
                            styles.weekChipLabelSelected,
                        ]}
                      >
                        {formatWeekRange(week.startDate, week.endDate)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              {selectedWeek ? (
                <Text style={styles.selectedWeekText}>
                  Selected: {selectedWeek.label} ({formatWeekRange(selectedWeek.startDate, selectedWeek.endDate)})
                </Text>
              ) : null}
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Attendance Table</Text>
          {tableRows.length === 0 || weekColumns.length === 0 ? (
            <Text style={styles.emptyText}>No timetable rows available yet.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <View style={[styles.tableFirstCol, styles.tableHeaderCell]}>
                    <Text style={styles.tableHeaderText}>Unit / Time</Text>
                  </View>
                  {weekColumns.map((week) => (
                    <View
                      key={week.weekIndex}
                      style={[
                        styles.tableWeekCell,
                        styles.tableHeaderCell,
                        week.isCurrent && styles.tableCurrentCol,
                        selectedWeekIndex === week.weekIndex &&
                          styles.tableSelectedCol,
                      ]}
                    >
                      <Text style={styles.tableHeaderText}>{week.label}</Text>
                    </View>
                  ))}
                </View>

                {tableRows.map((row) => (
                  <View key={row.rowKey} style={styles.tableRow}>
                    <View style={styles.tableFirstCol}>
                      <Text style={styles.rowUnit}>{row.unitCode}</Text>
                      <Text style={styles.rowMeta}>
                        {row.dayLabel} {row.classTime}
                      </Text>
                      <Text style={styles.rowCourse}>{row.courseName}</Text>
                    </View>
                    {row.weekCells.map((cell) => {
                      const cellKey = `${row.rowKey}-${cell.weekIndex}`;
                      const displayMark = cell.status === "locked" ? "-" : cell.mark;
                      return (
                        <View
                          key={cellKey}
                          style={[
                            styles.tableWeekCell,
                            selectedWeekIndex === cell.weekIndex &&
                              styles.tableSelectedCol,
                            cell.status === "missed" && styles.tableMissedCell,
                            cell.status === "signed" && styles.tableSignedCell,
                            cell.status === "sign_open" && styles.tableOpenCell,
                          ]}
                        >
                          {cell.canSign ? (
                            <TouchableOpacity
                              style={styles.cellSignButton}
                              onPress={() =>
                                handleSignClass(row.unitCode, row.startTime, cellKey)
                              }
                              disabled={signingKey === cellKey}
                            >
                              <Text style={styles.cellSignText}>
                                {signingKey === cellKey ? "..." : "Sign"}
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <Text
                              style={[
                                styles.cellMark,
                                cell.status === "missed" && styles.cellMarkMissed,
                                cell.status === "signed" && styles.cellMarkSigned,
                              ]}
                            >
                              {displayMark}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Timetable Setup</Text>
          {!canConfigureTimetable ? (
            <Text style={styles.emptyText}>{registrationHint}</Text>
          ) : (
            <>
              <Text style={styles.helperText}>
                Weekdays only (Monday-Friday). Each class slot is 3 hours.
              </Text>
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
                    <View
                      key={`${entry.dayOfWeek}-${entry.startTime}-${entry.unitCode}`}
                      style={styles.entryRow}
                    >
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
  schoolRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  schoolLogo: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  schoolTextWrap: {
    flex: 1,
  },
  schoolName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  schoolSub: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  studentRow: {
    marginTop: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },
  studentMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#475569",
  },
  headerSubtitle: {
    marginTop: 10,
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
  helperText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
  },
  weekChipRow: {
    flexDirection: "row",
    gap: 8,
  },
  weekChip: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    minWidth: 132,
  },
  weekChipCurrent: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  weekChipSelected: {
    borderColor: "#0B5FA5",
    backgroundColor: "#0B5FA5",
  },
  weekChipLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E293B",
  },
  weekChipDate: {
    marginTop: 2,
    fontSize: 11,
    color: "#64748B",
  },
  weekChipLabelSelected: {
    color: "#FFFFFF",
  },
  selectedWeekText: {
    marginTop: 8,
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeaderRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
  },
  tableHeaderCell: {
    backgroundColor: "#F8FAFC",
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
  },
  tableFirstCol: {
    width: 190,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  tableWeekCell: {
    width: 70,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  tableCurrentCol: {
    backgroundColor: "#EEF6FF",
  },
  tableSelectedCol: {
    borderColor: "#0B5FA5",
  },
  tableMissedCell: {
    backgroundColor: "#FEF2F2",
  },
  tableSignedCell: {
    backgroundColor: "#ECFDF3",
  },
  tableOpenCell: {
    backgroundColor: "#EFF6FF",
  },
  rowUnit: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  rowMeta: {
    marginTop: 2,
    fontSize: 11,
    color: "#334155",
    fontWeight: "700",
  },
  rowCourse: {
    marginTop: 2,
    fontSize: 11,
    color: "#64748B",
  },
  cellMark: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
  },
  cellMarkMissed: {
    color: "#B91C1C",
  },
  cellMarkSigned: {
    color: "#15803D",
  },
  cellSignButton: {
    borderRadius: 8,
    backgroundColor: "#0B5FA5",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  cellSignText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
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
});
