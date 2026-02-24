import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "react-query";
import { invigilatorTheme } from "./theme/invigilatorTheme";

// Mock data - replace with your actual data structure
const mockStudentDetails = {
  STU20250001: {
    fullName: "John Doe",
    studentId: "STU20250001",
    academicYear: "2025/2024",
    faculty: "Science and Technology",
    department: "Computer Science",
    isEligible: false,
    registeredCourses: [
      {
        courseCode: "CS101",
        courseName: "Introduction to Programming",
        isVerified: true,
      },
      { courseCode: "CS102", courseName: "Data Structures", isVerified: true },
      { courseCode: "MATH101", courseName: "Calculus I", isVerified: false },
      {
        courseCode: "CS103",
        courseName: "Object Oriented Programming",
        isVerified: true,
      },
      { courseCode: "CS104", courseName: "Algorithms", isVerified: true },
      {
        courseCode: "ENG101",
        courseName: "Technical Writing",
        isVerified: true,
      },
    ],
  },
  STU20250002: {
    fullName: "Jane Smith",
    studentId: "STU20250002",
    academicYear: "2025/2024",
    faculty: "Science and Technology",
    department: "Information Technology",
    isEligible: false,
    registeredCourses: [
      { courseCode: "IT101", courseName: "IT Fundamentals", isVerified: true },
      {
        courseCode: "NET101",
        courseName: "Networking Basics",
        isVerified: false,
      },
      {
        courseCode: "IT102",
        courseName: "Operating Systems",
        isVerified: true,
      },
      {
        courseCode: "IT103",
        courseName: "Database Management",
        isVerified: true,
      },
      { courseCode: "WEB101", courseName: "Web Development", isVerified: true },
    ],
  },
  STU20250003: {
    fullName: "Robert Johnson",
    studentId: "STU20250003",
    academicYear: "2022/2025",
    faculty: "Engineering",
    department: "Electrical Engineering",
    isEligible: true,
    registeredCourses: [
      { courseCode: "EE101", courseName: "Circuit Theory", isVerified: true },
      { courseCode: "EE102", courseName: "Electronics", isVerified: true },
      {
        courseCode: "EE103",
        courseName: "Signals and Systems",
        isVerified: true,
      },
      {
        courseCode: "EE104",
        courseName: "Digital Electronics",
        isVerified: true,
      },
      { courseCode: "EE105", courseName: "Microprocessors", isVerified: true },
      {
        courseCode: "MATH201",
        courseName: "Advanced Calculus",
        isVerified: true,
      },
    ],
  },
  STU20250004: {
    fullName: "Emily Davis",
    studentId: "STU20250004",
    academicYear: "2025/2024",
    faculty: "Health Sciences",
    department: "Nursing",
    isEligible: true,
    registeredCourses: [
      {
        courseCode: "NUR101",
        courseName: "Anatomy and Physiology",
        isVerified: true,
      },
      {
        courseCode: "NUR102",
        courseName: "Basic Nursing Skills",
        isVerified: true,
      },
      { courseCode: "NUR103", courseName: "Patient Care", isVerified: true },
      { courseCode: "NUR104", courseName: "Emergency Care", isVerified: true },
      { courseCode: "NUR105", courseName: "Pharmacology", isVerified: true },
      { courseCode: "NUR106", courseName: "Health Ethics", isVerified: true },
      {
        courseCode: "SCI101",
        courseName: "Biology for Nurses",
        isVerified: true,
      },
    ],
  },
  STU20250005: {
    fullName: "Michael Brown",
    studentId: "STU20250005",
    academicYear: "2022/2025",
    faculty: "Business Administration",
    department: "Finance",
    isEligible: false,
    registeredCourses: [
      {
        courseCode: "FIN101",
        courseName: "Financial Accounting",
        isVerified: true,
      },
      {
        courseCode: "FIN102",
        courseName: "Corporate Finance",
        isVerified: false,
      },
      { courseCode: "ECO101", courseName: "Microeconomics", isVerified: true },
      { courseCode: "ECO102", courseName: "Macroeconomics", isVerified: true },
      {
        courseCode: "BUS101",
        courseName: "Principles of Management",
        isVerified: true,
      },
      { courseCode: "BUS102", courseName: "Marketing", isVerified: true },
      { courseCode: "STA101", courseName: "Statistics", isVerified: true },
    ],
  },
  STU20250006: {
    fullName: "Sarah Wilson",
    studentId: "STU20250006",
    academicYear: "2025/2024",
    faculty: "Humanities",
    department: "English Literature",
    isEligible: true,
    registeredCourses: [
      {
        courseCode: "ENG201",
        courseName: "Shakespearean Studies",
        isVerified: true,
      },
      { courseCode: "ENG202", courseName: "Modern Poetry", isVerified: true },
      {
        courseCode: "ENG203",
        courseName: "Creative Writing",
        isVerified: true,
      },
      {
        courseCode: "ENG204",
        courseName: "American Literature",
        isVerified: true,
      },
      {
        courseCode: "ENG205",
        courseName: "World Literature",
        isVerified: true,
      },
      {
        courseCode: "HIS101",
        courseName: "History of English Language",
        isVerified: true,
      },
      {
        courseCode: "PHI101",
        courseName: "Philosophy of Literature",
        isVerified: true,
      },
      {
        courseCode: "THE101",
        courseName: "Drama and Performance",
        isVerified: true,
      },
    ],
  },
  STU20250007: {
    fullName: "David Martinez",
    studentId: "STU20250007",
    academicYear: "2025/2024",
    faculty: "Science and Technology",
    department: "Mechanical Engineering",
    isEligible: false,
    registeredCourses: [
      { courseCode: "ME101", courseName: "Thermodynamics", isVerified: true },
      { courseCode: "ME102", courseName: "Fluid Mechanics", isVerified: true },
      {
        courseCode: "ME103",
        courseName: "Mechanics of Materials",
        isVerified: true,
      },
      {
        courseCode: "ME104",
        courseName: "Design of Machine Elements",
        isVerified: false,
      },
      { courseCode: "PHY101", courseName: "Physics I", isVerified: true },
      {
        courseCode: "MAT101",
        courseName: "Engineering Mathematics",
        isVerified: true,
      },
    ],
  },
  STU20250008: {
    fullName: "Jessica Lee",
    studentId: "STU20250008",
    academicYear: "2022/2025",
    faculty: "Law",
    department: "Criminal Law",
    isEligible: true,
    registeredCourses: [
      {
        courseCode: "LAW101",
        courseName: "Introduction to Law",
        isVerified: true,
      },
      {
        courseCode: "LAW102",
        courseName: "Constitutional Law",
        isVerified: true,
      },
      {
        courseCode: "LAW103",
        courseName: "Criminal Procedure",
        isVerified: true,
      },
      { courseCode: "LAW104", courseName: "Criminology", isVerified: true },
      {
        courseCode: "LAW105",
        courseName: "Forensic Evidence",
        isVerified: true,
      },
      { courseCode: "LAW106", courseName: "Legal Ethics", isVerified: true },
      {
        courseCode: "POL101",
        courseName: "Political Science",
        isVerified: true,
      },
    ],
  },
};

export default function StudentDetails() {
  const { id } = useLocalSearchParams();

  const {
    data: student,
    isLoading,
    error,
  } = useQuery(
    ["studentDetails", id],
    () => {
      if (__DEV__) {
        return (
          mockStudentDetails[id as keyof typeof mockStudentDetails] || null
        );
      } else {
        return null;
      }
    },
    { enabled: !!id }
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={invigilatorTheme.colors.primary} />
      </View>
    );
  }

  if (error || !student) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : "Student details not found"}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={["#0066cc", "#1a7be6"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {student.fullName
              .split(" ")
              .map((name) => name[0])
              .join("")}
          </Text>
        </View>
        <Text style={styles.studentName}>{student.fullName}</Text>
        <Text style={styles.headerId}>ID: {student.studentId}</Text>
        </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Basic Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="info" size={20} color="#6E3BFF" />
            <Text style={styles.cardTitle}>Basic Information</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="school" size={18} color="#666" />
            <Text style={styles.infoLabel}>Faculty:</Text>
            <Text style={styles.infoValue}>{student.faculty}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="class" size={18} color="#666" />
            <Text style={styles.infoLabel}>Department:</Text>
            <Text style={styles.infoValue}>{student.department}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-today" size={18} color="#666" />
            <Text style={styles.infoLabel}>Academic Year:</Text>
            <Text style={styles.infoValue}>{student.academicYear}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons
              name={student.isEligible ? "check-circle" : "cancel"}
              size={18}
              color={student.isEligible ? "#4CAF50" : "#F44336"}
            />
            <Text style={styles.infoLabel}>Status:</Text>
            <Text
              style={[
                styles.infoValue,
                student.isEligible ? styles.eligible : styles.notEligible,
              ]}
            >
              {student.isEligible ? "Eligible" : "Not Eligible"}
              {student.isEligible ? " ✅" : " ❌"}
            </Text>
          </View>
        </View>

        {/* Courses Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="menu-book" size={20} color="#6E3BFF" />
            <Text style={styles.cardTitle}>Registered Courses</Text>
            <Text style={styles.courseCount}>
              {student.registeredCourses.length} courses
            </Text>
          </View>

          {student.registeredCourses.map((course) => (
            <View key={course.courseCode} style={styles.courseItem}>
              <View style={styles.courseCodeContainer}>
                <Text style={styles.courseCode}>{course.courseCode}</Text>
              </View>
              <View style={styles.courseDetails}>
                <Text style={styles.courseName}>{course.courseName}</Text>
                <View
                  style={[
                    styles.verificationBadge,
                    course.isVerified ? styles.verified : styles.notVerified,
                  ]}
                >
                  <MaterialIcons
                    name={course.isVerified ? "verified" : "schedule"}
                    size={14}
                    color={course.isVerified ? "#4CAF50" : "#FF9800"}
                  />
                  <Text style={styles.verificationText}>
                    {course.isVerified ? "Verified" : "Pending"}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Info Section */}
        <View style={styles.additionalInfo}>
          <Text style={styles.note}>
            <Text style={{ fontWeight: "bold" }}>Note:</Text> Students are only
            eligible to sit for exams if ALL their courses are verified.
          </Text>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FF",
  },
  header: {
    padding: 24,
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#6E3BFF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
  studentName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  headerId: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  courseCount: {
    marginLeft: "auto",
    backgroundColor: "#F0E7FF",
    color: "#6E3BFF",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: "600",
    marginLeft: 8,
    marginRight: 15,
    color: "#555",
    width: 100,
  },
  infoValue: {
    flex: 1,
    color: "#333",
  },
  courseItem: {
    flexDirection: "row",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  courseCodeContainer: {
    backgroundColor: "#F0E7FF",
    borderRadius: 8,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  courseCode: {
    fontWeight: "bold",
    color: "#6E3BFF",
    fontSize: 16,
  },
  courseDetails: {
    flex: 1,
    justifyContent: "center",
  },
  courseName: {
    color: "#333",
    marginBottom: 5,
    fontSize: 15,
  },
  verificationBadge: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verified: {
    backgroundColor: "#E8F5E9",
  },
  notVerified: {
    backgroundColor: "#FFF3E0",
  },
  verificationText: {
    fontSize: 12,
    marginLeft: 4,
    color: "#333",
  },
  eligible: {
    color: "#4CAF50",
  },
  notEligible: {
    color: "#F44336",
  },
  additionalInfo: {
    marginTop: 10,
    padding: 15,
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
  },
  note: {
    color: "#666",
    lineHeight: 20,
  },
  errorText: {
    color: "#F44336",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});
