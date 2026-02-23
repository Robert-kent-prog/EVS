import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Barcode from "react-native-barcode-svg";
import { shareExamCardFile } from "../services/examCardFile";
import { ExamCard, Student } from "../types";

interface ExamCardDisplayProps {
  examCard: ExamCard;
  onDownload: () => void;
  student: Student; // Add student prop
}

const ExamCardDisplay: React.FC<ExamCardDisplayProps> = ({
  examCard,
  onDownload,
  student, // Add student prop to access details
}) => {
  const handleShare = async () => {
    try {
      await shareExamCardFile(examCard.cardId, examCard.serialNumber);
    } catch {
      Alert.alert("Error", "Failed to share exam card PDF");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Exam Card</Text>

      <View style={styles.card}>
        <View style={styles.headerSection}>
            <Image 
                source={require('../../assets/school_logo.jpeg')} 
                style={styles.logo}
                contentFit="contain"
            />
            <View style={styles.schoolInfo}>
                <Text style={styles.universityName}>SOUTH EASTERN KENYA UNIVERSITY</Text>
                <Text style={styles.cardTitle}>EXAMINATION CARD</Text>
                <Text style={styles.cardSerial}>Serial: {examCard.serialNumber}</Text>
            </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.studentDetailsContainer}>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{student.fullName}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reg. No:</Text>
                <Text style={styles.detailValue}>{student.studentId}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Program:</Text>
                <Text style={styles.detailValue}>{student.department}</Text>
            </View>
            <View style={styles.twoColumnRow}>
                <View style={styles.halfColumn}>
                    <Text style={styles.detailLabel}>Academic Year:</Text>
                    <Text style={styles.detailValue}>{student.academicYear}</Text>
                </View>
                <View style={styles.halfColumn}>
                    <Text style={styles.detailLabel}>Year of Study:</Text>
                    <Text style={styles.detailValue}>{student.yearOfStudy}</Text>
                </View>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Session:</Text>
                <Text style={styles.detailValue}>Semester {student.semester || examCard.semester}</Text>
            </View>
        </View>


        <View style={styles.barcodeSection}>
          <Barcode 
            value={(examCard.barcodeData || examCard.serialNumber || "UNKNOWN").toString()} 
            format="CODE128"
            singleBarWidth={2}
            height={60}
            lineColor="#000000"
            backgroundColor="#ffffff"
          />
          <Text style={styles.barcodeText}>{examCard.barcodeData || examCard.serialNumber}</Text>
        </View>


        {/* Removed old card details section in favor of new layout above */ }


        {examCard.courses && examCard.courses.length > 0 && (
          <View style={styles.unitsSection}>
            <Text style={styles.unitsTitle}>REGISTERED UNITS</Text>
            <View style={styles.unitsTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.columnHeader, { flex: 0.4 }]}>CODE</Text>
                <Text style={[styles.columnHeader, { flex: 1 }]}>UNIT NAME</Text>
              </View>
              {examCard.courses.map((course, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.unitCode, { flex: 0.4 }]}>{course.courseCode}</Text>
                  <Text style={[styles.unitName, { flex: 1 }]} numberOfLines={1}>{course.courseName}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
          <MaterialIcons name="download" size={20} color="white" />
          <Text style={styles.actionButtonText}>Download PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
        >
          <MaterialIcons name="share" size={20} color="white" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  schoolInfo: {
    alignItems: 'center',
  },
  universityName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 5,
  },
  separator: {
    height: 2,
    backgroundColor: '#0066cc',
    marginBottom: 20,
    width: '100%',
  },
  studentDetailsContainer: {
    marginBottom: 20,
  },
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  halfColumn: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  cardSerial: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  barcodeSection: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 20,
  },
  barcodeText: {
    marginTop: 10,
    fontSize: 12,
    color: "#333",
    letterSpacing: 2,
  },
  cardDetails: {
    marginTop: 15,
  },
  unitsSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 15,
  },
  unitsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0066cc",
    marginBottom: 10,
    letterSpacing: 1,
  },
  unitsTable: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f3f5",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#495057",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  unitCode: {
    fontSize: 12,
    fontWeight: "600",
    color: "#212529",
  },
  unitName: {
    fontSize: 12,
    color: "#495057",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0066cc",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  shareButton: {
    backgroundColor: "#4CAF50",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default ExamCardDisplay;
