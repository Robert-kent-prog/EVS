import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HistoryItemProps {
  item: {
    _id: string;
    studentId: string;
    status: string;
    timestamp: string;
    verificationMethod: string;
    studentName?: string;
    exam?: string;
  };
}

export default function HistoryItem({ item }: HistoryItemProps) {
  return (
    <Link href={`../student-details?id=${item.studentId}`} asChild>
      <TouchableOpacity style={styles.container} activeOpacity={0.8}>
        {/* Verification Method Indicator */}
        <LinearGradient
          colors={
            item.verificationMethod === "barcode"
              ? ["#6E3BFF", "#8D5EF2"]
              : ["#FF6B6B", "#FF8E8E"]
          }
          style={styles.methodIndicator}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <MaterialIcons
            name={
              item.verificationMethod === "barcode" ? "qr-code" : "fingerprint"
            }
            size={20}
            color="white"
          />
        </LinearGradient>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.details}>
            <Text style={styles.studentId}>{item.studentId}</Text>
            {item.studentName && (
              <Text style={styles.studentName}>{item.studentName}</Text>
            )}
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={14} color="#888" />
              <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleString([], {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            {item.exam && (
              <Text style={styles.examText} numberOfLines={1}>
                Exam: {item.exam}
              </Text>
            )}
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.status,
              item.status === "success" ? styles.success : styles.failed,
            ]}
          >
            <MaterialIcons
              name={item.status === "success" ? "check-circle" : "error"}
              size={16}
              color={item.status === "success" ? "#4CAF50" : "#F44336"}
            />
            <Text style={styles.statusText}>
              {item.status === "success" ? "Verified" : "Failed"}
            </Text>
          </View>
        </View>

        {/* Chevron for navigation */}
        <MaterialIcons
          name="chevron-right"
          size={24}
          color="#DDD"
          style={styles.chevron}
        />
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  methodIndicator: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  details: {
    flex: 1,
  },
  studentId: {
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  studentName: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  timestamp: {
    color: "#888",
    fontSize: 12,
    marginLeft: 4,
  },
  examText: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 10,
  },
  success: {
    backgroundColor: "#E8F5E9",
  },
  failed: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  chevron: {
    marginLeft: 8,
  },
});
