import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ExamCardDisplay from "../components/ExamCardDisplay";
import { useStudentAuth } from "../context/StudentAuthContext";
import api from "../services/api";
import {
  downloadExamCardFile,
  openExamCardInSystemViewer,
  shareExamCardFile,
} from "../services/examCardFile";
import { ExamCard } from "../types";

export default function ExamCardsScreen() {
  const { student } = useStudentAuth();
  const [examCards, setExamCards] = useState<ExamCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<ExamCard | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const loadExamCards = useCallback(async () => {
    if (!student) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const cards = await api.getStudentExamCards(student.studentId);
      setExamCards(cards);
    } catch (error) {
      console.error("Failed to load exam cards:", error);
      Alert.alert("Error", "Failed to load exam cards. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [student]);

  useEffect(() => {
    loadExamCards();
  }, [loadExamCards]);

  const handleDownload = async (examCard: ExamCard) => {
    try {
      const fileUri = await downloadExamCardFile(examCard.cardId, examCard.serialNumber);
      Alert.alert("Download Complete", `Saved to: ${fileUri}`, [
        { text: "Close", style: "cancel" },
        {
          text: "Open",
          onPress: async () => {
            try {
              await openExamCardInSystemViewer(fileUri);
            } catch {
              Alert.alert("Error", "Could not open PDF in system viewer");
            }
          },
        },
      ]);
    } catch (error: any) {
      console.error("Download error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to download exam card. PDF may not be generated yet.",
      );
    }
  };

  const handleShare = async (examCard: ExamCard) => {
    try {
      await shareExamCardFile(examCard.cardId, examCard.serialNumber);
    } catch {
      Alert.alert("Error", "Failed to share exam card PDF");
    }
  };

  const handlePreview = (examCard: ExamCard) => {
    setPreviewCard(examCard);
    setShowPreview(true);
  };

  const confirmDelete = (examCard: ExamCard) => {
    Alert.alert(
      "Delete Exam Card",
      `Delete exam card ${examCard.serialNumber}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!student) return;

            try {
              setDeletingCardId(examCard.cardId);
              await api.deleteExamCard(examCard.cardId, student.studentId);
              setExamCards((prev) => prev.filter((card) => card.cardId !== examCard.cardId));
              Alert.alert("Deleted", "Exam card deleted successfully.");
            } catch (error: any) {
              console.error("Delete error:", error);
              Alert.alert(
                "Error",
                error?.response?.data?.message || error?.message || "Failed to delete exam card.",
              );
            } finally {
              setDeletingCardId(null);
            }
          },
        },
      ],
    );
  };

  const getStatus = (card: ExamCard) => {
    const now = new Date();
    const expiry = new Date(card.expiryDate);
    if (!card.isValid) return "Invalid";
    if (expiry < now) return "Expired";
    return "Active";
  };

  const renderExamCard = ({ item }: { item: ExamCard }) => {
    const status = getStatus(item);
    const isDeleting = deletingCardId === item.cardId;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.serialNumber}>{item.serialNumber}</Text>
            <Text style={styles.subText}>
              Generated: {new Date(item.generationDate).toLocaleDateString()}
            </Text>
            <Text style={styles.subText}>
              Expires: {new Date(item.expiryDate).toLocaleDateString()}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              status === "Active"
                ? styles.statusActive
                : status === "Expired"
                  ? styles.statusExpired
                  : styles.statusInvalid,
            ]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Semester {item.semester}</Text>
          <Text style={styles.metaText}>{item.courses?.length || 0} Units</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDownload(item)}>
            <MaterialIcons name="file-download" size={18} color="#1e88e5" />
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)}>
            <MaterialIcons name="share" size={18} color="#2e7d32" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handlePreview(item)}>
            <MaterialIcons name="visibility" size={18} color="#6a1b9a" />
            <Text style={styles.actionText}>Preview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => confirmDelete(item)}
            disabled={isDeleting}
          >
            <MaterialIcons name="delete-outline" size={18} color="#c62828" />
            <Text style={styles.actionText}>{isDeleting ? "Deleting" : "Delete"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading exam cards...</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="error-outline" size={64} color="#bdc3c7" />
        <Text style={styles.emptyStateTitle}>Not Logged In</Text>
        <Text style={styles.emptyStateText}>Please log in to view your exam cards.</Text>
      </View>
    );
  }

  if (examCards.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="card-membership" size={64} color="#bdc3c7" />
        <Text style={styles.emptyStateTitle}>No Exam Cards</Text>
        <Text style={styles.emptyStateText}>
          No exam cards available yet. Generate one from the Dashboard after meeting all
          eligibility requirements.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Exam Cards</Text>
        <Text style={styles.headerSubtitle}>Download, share, or delete your cards</Text>
      </View>

      <FlatList
        data={examCards}
        renderItem={renderExamCard}
        keyExtractor={(item) => item.cardId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadExamCards} />
        }
      />

      <Modal
        visible={showPreview}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Exam Card Preview</Text>
              <TouchableOpacity
                onPress={() => setShowPreview(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {previewCard && student && (
                <ExamCardDisplay
                  examCard={previewCard}
                  student={student}
                  onDownload={() => handleDownload(previewCard)}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7780",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  serialNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2d3d",
  },
  subText: {
    marginTop: 4,
    fontSize: 12,
    color: "#5f6b76",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusActive: {
    backgroundColor: "#e8f5e9",
  },
  statusExpired: {
    backgroundColor: "#fff3e0",
  },
  statusInvalid: {
    backgroundColor: "#ffebee",
  },
  metaRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    fontSize: 13,
    color: "#455a64",
  },
  actionsRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eef2f5",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 13,
    color: "#2c3e50",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f5",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#f5f6fa",
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
