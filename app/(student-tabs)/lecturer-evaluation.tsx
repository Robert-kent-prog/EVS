import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStudentAuth } from "../_context/StudentAuthContext";
import api from "../_services/api";
import { studentTheme } from "../_theme/studentTheme";
import { LecturerEvaluationPayload } from "../_types";

type YearOption = "One" | "Two" | "Three" | "Four" | "Other";

type QuestionKey =
  | "courseOutlineGiven"
  | "cat1Administered"
  | "cat2Administered"
  | "cat1Returned"
  | "cat2Returned"
  | "lecturerAttendedAllLectures"
  | "unitRelevantToDegree"
  | "lecturerCoveredAllTopics";

const questionLabels: Record<QuestionKey, string> = {
  courseOutlineGiven: "Course outline was given",
  cat1Administered: "CAT 1 was administered",
  cat2Administered: "CAT 2 was administered",
  cat1Returned: "Marked CAT 1 scripts were returned",
  cat2Returned: "Marked CAT 2 scripts were returned",
  lecturerAttendedAllLectures: "Did the Lecturer attend all lectures",
  unitRelevantToDegree: "The Unit was relevant to the Degree of study",
  lecturerCoveredAllTopics:
    "Lecturer covered all topics in the course description",
};

export default function LecturerEvaluationScreen() {
  const { unitCode: unitCodeParam, unitTitle: unitTitleParam } =
    useLocalSearchParams<{
      unitCode?: string;
      unitTitle?: string;
    }>();
  const router = useRouter();
  const { student, updateStudent } = useStudentAuth();
  const [degreeProgramme, setDegreeProgramme] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState<YearOption | "">("");
  const [currentSemester, setCurrentSemester] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [answers, setAnswers] = useState<Record<QuestionKey, boolean | null>>({
    courseOutlineGiven: null,
    cat1Administered: null,
    cat2Administered: null,
    cat1Returned: null,
    cat2Returned: null,
    lecturerAttendedAllLectures: null,
    unitRelevantToDegree: null,
    lecturerCoveredAllTopics: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof unitCodeParam === "string" && unitCodeParam.trim()) {
      setUnitCode(unitCodeParam.toUpperCase());
    }
    if (typeof unitTitleParam === "string" && unitTitleParam.trim()) {
      setUnitTitle(unitTitleParam);
    }
  }, [unitCodeParam, unitTitleParam]);

  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!degreeProgramme.trim()) missing.push("Degree programme");
    if (!yearOfStudy) missing.push("Year of Study");
    if (!currentSemester.trim()) missing.push("Current semester");
    if (!unitCode.trim()) missing.push("Unit Code");
    if (!unitTitle.trim()) missing.push("Unit Title");
    if (!lecturerName.trim()) missing.push("Name of Lecturer");

    Object.entries(answers).forEach(([key, value]) => {
      if (value === null) {
        missing.push(questionLabels[key as QuestionKey]);
      }
    });

    return missing;
  }, [
    answers,
    currentSemester,
    degreeProgramme,
    lecturerName,
    unitCode,
    unitTitle,
    yearOfStudy,
  ]);

  const setAnswer = (key: QuestionKey, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!student) {
      Alert.alert("Session Error", "Please login again.");
      router.replace("/(auth)/login");
      return;
    }

    if (!student.registeredCourses || student.registeredCourses.length === 0) {
      Alert.alert(
        "No Units Registered",
        "You must register units before submitting lecturer evaluations.",
      );
      return;
    }

    if (missingFields.length > 0) {
      Alert.alert(
        "Incomplete Form",
        `All fields are mandatory. Missing:\n\n${missingFields.map((field) => `• ${field}`).join("\n")}`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload: LecturerEvaluationPayload = {
        degreeProgramme: degreeProgramme.trim(),
        yearOfStudy: yearOfStudy as YearOption,
        currentSemester: currentSemester.trim(),
        unitCode: unitCode.trim().toUpperCase(),
        unitTitle: unitTitle.trim(),
        lecturerName: lecturerName.trim(),
        courseOutlineGiven: answers.courseOutlineGiven as boolean,
        cat1Administered: answers.cat1Administered as boolean,
        cat2Administered: answers.cat2Administered as boolean,
        cat1Returned: answers.cat1Returned as boolean,
        cat2Returned: answers.cat2Returned as boolean,
        lecturerAttendedAllLectures:
          answers.lecturerAttendedAllLectures as boolean,
        unitRelevantToDegree: answers.unitRelevantToDegree as boolean,
        lecturerCoveredAllTopics:
          answers.lecturerCoveredAllTopics as boolean,
      };

      const response = await api.submitLecturerEvaluation(payload);
      const lastSubmittedAt =
        response?.data?.lastSubmittedAt || new Date().toISOString();
      await updateStudent({
        lecturerEvaluations: {
          completed: !!response?.data?.completed,
          requiredUnits: response?.data?.requiredUnits || 0,
          completedUnits: response?.data?.completedUnits || 0,
          lastSubmittedAt,
        },
      });

      Alert.alert(
        "Submitted",
        "Lecturer evaluation submitted successfully.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(student-tabs)/lecturer-evaluations"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Submission Failed",
        error?.response?.data?.message || error?.message || "Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={studentTheme.colors.statusBar}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            disabled={submitting}
          >
            <MaterialIcons
              name="arrow-back"
              size={22}
              color={studentTheme.colors.primary}
            />
          </TouchableOpacity>
          <Image
            source={require("../../assets/school_logo.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>STUDENT LECTURER EVALUATION FORM</Text>
          <Text style={styles.subtitle}>Science and Computing</Text>
          <Text style={styles.requiredNote}>All fields are mandatory (*)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part A: Student Data</Text>

          <Text style={styles.label}>Degree programme *</Text>
          <TextInput
            style={styles.input}
            value={degreeProgramme}
            onChangeText={setDegreeProgramme}
            placeholder="e.g. BSc Computer Science"
            editable={!submitting}
          />

          <Text style={styles.label}>Year of Study *</Text>
          <View style={styles.choiceRow}>
            {(["One", "Two", "Three", "Four", "Other"] as YearOption[]).map(
              (option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.choiceChip,
                    yearOfStudy === option && styles.choiceChipSelected,
                  ]}
                  onPress={() => setYearOfStudy(option)}
                  disabled={submitting}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      yearOfStudy === option && styles.choiceChipTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>

          <Text style={styles.label}>Current semester *</Text>
          <TextInput
            style={styles.input}
            value={currentSemester}
            onChangeText={setCurrentSemester}
            placeholder="e.g. Semester 1"
            editable={!submitting}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part B: Teaching Evaluation</Text>

          <Text style={styles.label}>Unit Code *</Text>
          <TextInput
            style={styles.input}
            value={unitCode}
            onChangeText={setUnitCode}
            placeholder="e.g. CS101"
            autoCapitalize="characters"
            editable={!submitting}
          />

          <Text style={styles.label}>Unit Title *</Text>
          <TextInput
            style={styles.input}
            value={unitTitle}
            onChangeText={setUnitTitle}
            placeholder="Enter unit title"
            editable={!submitting}
          />

          <Text style={styles.label}>Name of Lecturer *</Text>
          <TextInput
            style={styles.input}
            value={lecturerName}
            onChangeText={setLecturerName}
            placeholder="Enter lecturer name"
            editable={!submitting}
          />

          {(
            Object.keys(questionLabels) as QuestionKey[]
          ).map((questionKey: QuestionKey) => (
            <View key={questionKey} style={styles.questionCard}>
              <Text style={styles.questionText}>
                {questionLabels[questionKey]} *
              </Text>
              <View style={styles.choiceRow}>
                <TouchableOpacity
                  style={[
                    styles.choiceChip,
                    answers[questionKey] === true && styles.choiceChipSelected,
                  ]}
                  onPress={() => setAnswer(questionKey, true)}
                  disabled={submitting}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      answers[questionKey] === true &&
                        styles.choiceChipTextSelected,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.choiceChip,
                    answers[questionKey] === false && styles.choiceChipSelected,
                  ]}
                  onPress={() => setAnswer(questionKey, false)}
                  disabled={submitting}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      answers[questionKey] === false &&
                        styles.choiceChipTextSelected,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <MaterialIcons name="send" size={18} color="#fff" />
          <Text style={styles.submitButtonText}>
            {submitting ? "Submitting..." : "Submit Evaluation"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: studentTheme.colors.bg,
  },
  container: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: studentTheme.colors.primarySoft,
    marginBottom: 10,
  },
  logo: {
    width: 72,
    height: 72,
    alignSelf: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F2D3D",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    color: "#334155",
  },
  requiredNote: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
    color: "#B91C1C",
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: "#334155",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#F8FAFC",
  },
  questionCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#FAFCFF",
  },
  questionText: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "600",
    marginBottom: 8,
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  choiceChip: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#fff",
  },
  choiceChipSelected: {
    backgroundColor: studentTheme.colors.primary,
    borderColor: studentTheme.colors.primary,
  },
  choiceChipText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 13,
  },
  choiceChipTextSelected: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: studentTheme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
