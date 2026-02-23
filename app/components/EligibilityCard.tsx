import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EligibilityStatus } from "../types";

interface EligibilityCardProps {
  eligibility: EligibilityStatus | null;
  onGenerate: () => void;
  loading: boolean;
  disabled?: boolean;
}

const getStatusColor = (status: boolean) => (status ? "#4CAF50" : "#F44336");
const getStatusIcon = (status: boolean) =>
  status ? "check-circle" : "cancel";

const EligibilityCard: React.FC<EligibilityCardProps> = ({
  eligibility,
  onGenerate,
  loading,
  disabled,
}) => {
  if (!eligibility) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Eligibility Status</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#27ae60" />
          <Text style={styles.loadingText}>Loading eligibility status...</Text>
        </View>
      </View>
    );
  }

  const specifications =
    eligibility.specifications ||
    [
      {
        key: "attendance",
        title: "Attendance",
        requirement: `At least ${eligibility.requiredAttendance || 70}% attendance recorded by lecturers`,
        met: eligibility.attendanceMet,
      },
      {
        key: "evaluations",
        title: "Lecturer Evaluations",
        requirement: "Complete lecturer evaluations via Google Forms",
        met: eligibility.evaluationsComplete,
      },
      {
        key: "fees",
        title: "Fee Clearance",
        requirement: "Fee balance must be KES 0",
        met: eligibility.feesCleared,
      },
      {
        key: "units",
        title: "Registered Units",
        requirement: "Units must be registered after fee clearance",
        met: eligibility.hasRegisteredUnits,
      },
    ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eligibility Status</Text>

      <View style={styles.specContainer}>
        <Text style={styles.specTitle}>Eligibility Specifications</Text>
        {specifications.map((spec) => (
          <View key={spec.key} style={styles.specRow}>
            <MaterialIcons
              name={getStatusIcon(spec.met)}
              size={18}
              color={getStatusColor(spec.met)}
            />
            <View style={styles.specTextWrap}>
              <Text style={styles.specLabel}>{spec.title}</Text>
              <Text style={styles.specRequirement}>{spec.requirement}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.metricsContainer}>
        <Text style={styles.metricText}>Attendance: {eligibility.attendance}%</Text>
        <Text style={styles.metricText}>
          Fee Balance: KES {eligibility.feeBalance.toLocaleString()}
        </Text>
        <Text style={styles.metricText}>
          Exam Card Validity: {eligibility.validityDays || 21} days from generation
        </Text>
      </View>

      <View style={styles.finalStatus}>
        <Text style={styles.finalStatusText}>Overall:</Text>
        <View
          style={[
            styles.eligibilityBadge,
            { backgroundColor: eligibility.isEligible ? "#E8F5E9" : "#FFEBEE" },
          ]}
        >
          <Text
            style={[
              styles.eligibilityText,
              { color: eligibility.isEligible ? "#2E7D32" : "#C62828" },
            ]}
          >
            {eligibility.isEligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
          </Text>
        </View>
      </View>

      {!!eligibility.message && (
        <View style={styles.messagesContainer}>
          <View style={styles.messageItem}>
            <MaterialIcons name="info-outline" size={16} color="#FF9800" />
            <Text style={styles.messageText}>{eligibility.message}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.generateButton,
          (loading || disabled || !eligibility.isEligible) &&
            styles.generateButtonDisabled,
        ]}
        onPress={onGenerate}
        disabled={loading || disabled || !eligibility.isEligible}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <MaterialIcons name="card-membership" size={20} color="#fff" />
            <Text style={styles.generateButtonText}>Generate Exam Card</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 14,
  },
  specContainer: {
    backgroundColor: "#f8fafb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6ecef",
    padding: 12,
  },
  specTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
  },
  specRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#edf1f4",
  },
  specTextWrap: {
    flex: 1,
  },
  specLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2d3d",
  },
  specRequirement: {
    marginTop: 2,
    fontSize: 13,
    color: "#5e6b76",
    lineHeight: 18,
  },
  metricsContainer: {
    marginTop: 12,
    gap: 4,
  },
  metricText: {
    fontSize: 14,
    color: "#34495e",
  },
  finalStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e9eef2",
  },
  finalStatusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },
  eligibilityBadge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  eligibilityText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  messagesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: "#FF8F00",
    lineHeight: 18,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: "#7f8c8d",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#27ae60",
    padding: 15,
    borderRadius: 10,
    marginTop: 14,
    gap: 10,
  },
  generateButtonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EligibilityCard;
