import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function VerificationResult() {
  const { student, error } = useLocalSearchParams();
  const router = useRouter();
  let parsedStudent = null;
  let isSuccess = false;

  if (typeof student === "string") {
    try {
      parsedStudent = JSON.parse(student);
      isSuccess = !!parsedStudent;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      isSuccess = false;
    }
  }

  const displayError = typeof error === "string" ? error : "Unknown error";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          isSuccess ? styles.success : styles.error,
        ]}
      >
        <MaterialIcons
          name={isSuccess ? "check-circle" : "error"}
          size={80}
          color="white"
        />
      </View>

      <Text style={styles.title}>
        {isSuccess ? "Verification Successful" : "Verification Failed"}
      </Text>

      {isSuccess && parsedStudent ? (
        <>
          <Text style={styles.studentName}>{parsedStudent.fullName}</Text>
          <Text style={styles.studentId}>ID: {parsedStudent.studentId}</Text>

          <View style={styles.details}>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Academic Year: </Text>
              {parsedStudent.academicYear}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Faculty: </Text>
              {parsedStudent.faculty}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Department: </Text>
              {parsedStudent.department}
            </Text>
          </View>

          <View style={styles.courses}>
            <Text style={styles.coursesTitle}>Registered Courses:</Text>
            {parsedStudent.registeredCourses.map((course: any) => (
              <Text key={course.courseCode} style={styles.course}>
                {course.courseCode} - {course.courseName}
              </Text>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.errorMessage}>{displayError}</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/(tabs)/scan")}
      >
        <Text style={styles.buttonText}>Scan Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  success: {
    backgroundColor: "#4CAF50",
  },
  error: {
    backgroundColor: "#F44336",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  studentName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 5,
  },
  studentId: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  details: {
    width: "100%",
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: "bold",
  },
  courses: {
    width: "100%",
    marginBottom: 20,
  },
  coursesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  course: {
    fontSize: 14,
    marginBottom: 5,
    paddingLeft: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0066cc",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
