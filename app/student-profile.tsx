import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStudentAuth } from "./context/StudentAuthContext";

export default function StudentProfilePage() {
  const router = useRouter();
  const { student } = useStudentAuth();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8FB" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color="#1F2D3D" />
        </TouchableOpacity>
        <Text style={styles.title}>Student Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {student?.fullName?.charAt(0)?.toUpperCase() || "S"}
            </Text>
          </View>
          <Text style={styles.name}>{student?.fullName || "Student"}</Text>
          <Text style={styles.regNo}>{student?.studentId || "N/A"}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <InfoRow label="Email" value={student?.email || "Not provided"} icon="email" />
          <InfoRow label="Department" value={student?.department || "N/A"} icon="school" />
          <InfoRow
            label="Year of Study"
            value={student?.yearOfStudy ? `Year ${student.yearOfStudy}` : "N/A"}
            icon="class"
          />
          <InfoRow
            label="Academic Year"
            value={student?.academicYear || "N/A"}
            icon="event"
          />
        </View>

        <View style={styles.noteCard}>
          <MaterialIcons name="lock" size={18} color="#0B5FA5" />
          <Text style={styles.noteText}>
            Profile details are read-only for students.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={18} color="#64748B" />
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2F6",
  },
  title: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B5FA5",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  name: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  regNo: {
    marginTop: 4,
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingVertical: 10,
  },
  infoTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  infoValue: {
    marginTop: 2,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  noteCard: {
    backgroundColor: "#EAF3FF",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7DFFF",
  },
  noteText: {
    marginLeft: 8,
    color: "#0F3D72",
    fontSize: 13,
    fontWeight: "600",
  },
});

