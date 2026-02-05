import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Add to your existing imports
import { storeAttendanceRecord } from "./services/database";

// Define your student interface based on your API response
interface Student {
  studentId: string;
  fullName: string;
  academicYear: string;
  faculty: string;
  yearOfStudy: string;
  department: string;
  registeredCourses: {
    courseCode: string;
    courseName: string;
    isVerified: boolean;
  }[];
  isEligible: boolean;
  examCardNo?: string; // Optional field
}

interface Course {
  courseCode: string;
  courseName: string;
  isVerified: boolean;
}

export default function VerificationResult() {
  const { student, error, unitCode, unitName } = useLocalSearchParams();
  const router = useRouter();
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [parsedStudent, setParsedStudent] = useState<Student | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [displayMessage, setDisplayMessage] = useState("");

  // Parse student data and filter courses
  useEffect(() => {
    if (typeof student === "string") {
      try {
        const studentData = JSON.parse(student) as Student;
        setParsedStudent(studentData);
        setIsSuccess(true);

        // Filter courses by unit code if provided
        if (
          unitCode &&
          typeof unitCode === "string" &&
          unitCode.trim() !== ""
        ) {
          const filtered = studentData.registeredCourses.filter(
            (course) => course.courseCode === unitCode,
          );
          setFilteredCourses(filtered);
        } else {
          setFilteredCourses(studentData.registeredCourses);
        }

        setDisplayMessage("");
      } catch (e) {
        setParsedStudent(null);
        setIsSuccess(false);
        console.error("Failed to parse student data:", e);
      }
    } else if (typeof error === "string") {
      setIsSuccess(false);
      setParsedStudent(null);

      // Set error message based on error type
      if (error.includes("404")) {
        setDisplayMessage(
          "Student not found. Please try using the Registration Number instead.",
        );
      } else if (error.includes("500")) {
        setDisplayMessage("Server error. Please try again later.");
      } else if (error.includes("No response")) {
        setDisplayMessage("Network error. Please check your connection.");
      } else {
        setDisplayMessage(error);
      }
    }
  }, [student, error, unitCode]);

  // Update the storeVerification useEffect to include unit info
  useEffect(() => {
    const storeVerification = async () => {
      if (isSuccess && parsedStudent) {
        try {
          // Ensure we have all required data for the record
          const studentData = {
            ...parsedStudent,
            examCardNo: parsedStudent.examCardNo || parsedStudent.studentId,
            verifiedUnit: unitCode || "", // Add verified unit
            unitName: unitName || "", // Add unit name
          };

          await storeAttendanceRecord(studentData, "exam_card");
          console.log("Attendance recorded successfully with unit:", unitCode);
        } catch (err) {
          console.error("Failed to store attendance:", err);
        }
      }
    };

    storeVerification();
  }, [isSuccess, parsedStudent, unitCode, unitName]);

  const handleManualVerification = () => {
    router.push("/manual-verification");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={isSuccess ? ["#6E3BFF", "#8D5EF2"] : ["#F44336", "#FF5252"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.avatar}>
            {isSuccess ? (
              <MaterialIcons name="check" size={40} color="white" />
            ) : (
              <MaterialIcons name="error" size={40} color="white" />
            )}
          </View>
          <Text style={styles.studentName}>
            {isSuccess ? "Verification Successful" : "Verification Failed"}
          </Text>
          {isSuccess && parsedStudent && (
            <>
              <Text style={styles.headerId}>ID: {parsedStudent.studentId}</Text>
              {unitCode && (
                <View style={styles.headerUnitBadge}>
                  <MaterialIcons
                    name="class"
                    size={14}
                    color="rgba(255,255,255,0.9)"
                  />
                  <Text style={styles.headerUnitText}>Unit: {unitCode}</Text>
                </View>
              )}
            </>
          )}
        </LinearGradient>

        {/* Main Content */}
        <View style={styles.content}>
          {isSuccess && parsedStudent ? (
            <>
              {/* Basic Info Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="info" size={20} color="#6E3BFF" />
                  <Text style={styles.cardTitle}>Student Information</Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons name="person" size={18} color="#666" />
                  <Text style={styles.infoLabel}>Full Name:</Text>
                  <Text style={styles.infoValue}>{parsedStudent.fullName}</Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons name="school" size={18} color="#666" />
                  <Text style={styles.infoLabel}>Faculty:</Text>
                  <Text style={styles.infoValue}>{parsedStudent.faculty}</Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons name="class" size={18} color="#666" />
                  <Text style={styles.infoLabel}>Department:</Text>
                  <Text style={styles.infoValue}>
                    {parsedStudent.department}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons name="calendar-today" size={18} color="#666" />
                  <Text style={styles.infoLabel}>Academic Year:</Text>
                  <Text style={styles.infoValue}>
                    {parsedStudent.academicYear}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons name="school" size={18} color="#666" />
                  <Text style={styles.infoLabel}>Year Of Study:</Text>
                  <Text style={styles.infoValue}>
                    {parsedStudent.yearOfStudy}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons
                    name={parsedStudent.isEligible ? "check-circle" : "cancel"}
                    size={18}
                    color={parsedStudent.isEligible ? "#4CAF50" : "#F44336"}
                  />
                  <Text style={styles.infoLabel}>Status:</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      parsedStudent.isEligible
                        ? styles.eligible
                        : styles.notEligible,
                    ]}
                  >
                    {parsedStudent.isEligible ? "Eligible" : "Not Eligible"}
                  </Text>
                </View>
              </View>

              {/* Courses Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="menu-book" size={20} color="#6E3BFF" />
                  <Text style={styles.cardTitle}>
                    {unitCode ? `Unit: ${unitCode}` : "Registered Units"}
                  </Text>
                  <Text style={styles.courseCount}>
                    {filteredCourses.length} {unitCode ? "Unit" : "Units"}
                  </Text>
                </View>

                {unitCode && (
                  <View style={styles.unitInfoBadge}>
                    <MaterialIcons name="class" size={16} color="#6E3BFF" />
                    <Text style={styles.unitInfoText}>
                      Showing only: {unitCode} - {unitName || unitCode}
                    </Text>
                  </View>
                )}

                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course: Course) => (
                    <View key={course.courseCode} style={styles.courseItem}>
                      <View style={styles.courseCodeContainer}>
                        <Text style={styles.courseCode}>
                          {course.courseCode}
                        </Text>
                      </View>
                      <View style={styles.courseDetails}>
                        <Text style={styles.courseName}>
                          {course.courseName}
                        </Text>
                        <View
                          style={[
                            styles.verificationBadge,
                            course.isVerified
                              ? styles.verified
                              : styles.notVerified,
                          ]}
                        >
                          <MaterialIcons
                            name={course.isVerified ? "verified" : "cancel"}
                            size={14}
                            color={course.isVerified ? "#4CAF50" : "#F44336"}
                          />
                          <Text style={styles.verificationText}>
                            {course.isVerified ? "Verified" : "Not Registered"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.noCoursesContainer}>
                    <MaterialIcons
                      name="error-outline"
                      size={40}
                      color="#ccc"
                    />
                    <Text style={styles.noCoursesText}>
                      {unitCode
                        ? `No courses found for unit ${unitCode}`
                        : "No registered courses"}
                    </Text>
                    {unitCode && (
                      <Text style={styles.noCoursesSubtext}>
                        This student is not registered for {unitCode}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.errorCard}>
              <Text style={styles.errorMessage}>{displayMessage}</Text>

              {/* Only show manual verification option for "not found" errors */}
              {(displayMessage.includes("not found") ||
                displayMessage.includes("try using")) && (
                <TouchableOpacity
                  style={styles.manualVerifyButton}
                  onPress={handleManualVerification}
                >
                  <MaterialIcons name="search" size={20} color="white" />
                  <Text style={styles.manualVerifyButtonText}>
                    Verify using Registration Number
                  </Text>
                </TouchableOpacity>
              )}

              {/* Show different options for other errors */}
              {displayMessage.includes("Network error") && (
                <TouchableOpacity
                  style={styles.manualVerifyButton}
                  onPress={() => router.replace("/(tabs)/scan")}
                >
                  <MaterialIcons name="refresh" size={20} color="white" />
                  <Text style={styles.manualVerifyButtonText}>Try Again</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      {/* Floating Action Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => router.replace("/(tabs)/scan")}
        >
          <MaterialIcons name="qr-code-scanner" size={24} color="white" />
          <Text style={styles.floatingButtonText}>
            {isSuccess ? "Scan Another Student" : "Scan Again"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
    position: "relative", // Needed for absolute positioning of floating button
  },
  scrollView: {
    flex: 1,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    left: 20,
    elevation: 5,
    backgroundColor: "transparent",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  floatingButton: {
    backgroundColor: "#6E3BFF",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  header: {
    padding: 24,
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
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
  studentName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
    textAlign: "center",
  },
  headerId: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 5,
  },
  headerUnitBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginTop: 5,
  },
  headerUnitText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginLeft: 5,
    fontWeight: "500",
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
  errorCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
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
  unitInfoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0E7FF",
    padding: 8,
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: "center",
  },
  unitInfoText: {
    color: "#6E3BFF",
    fontWeight: "500",
    marginLeft: 5,
    fontSize: 14,
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
  errorMessage: {
    color: "#F44336",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  noCoursesContainer: {
    alignItems: "center",
    padding: 30,
  },
  noCoursesText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  noCoursesSubtext: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    fontStyle: "italic",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: "#E0E0E0",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
  manualVerifyButton: {
    backgroundColor: "#6E3BFF",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  manualVerifyButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
});
