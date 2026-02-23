import { ApiResponse, EligibilityStatus, ExamCard } from "../types";
import api from "./api";

// Use EligibilityStatus from types instead of redeclaring
export const checkEligibility = async (
  studentId: string,
): Promise<EligibilityStatus> => {
  try {
    const response = await api.get<ApiResponse<EligibilityStatus>>(
      `/students/${studentId}/eligibility`,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error checking eligibility:", error);
    throw error;
  }
};

export const generateExamCard = async (
  studentId: string,
): Promise<ExamCard> => {
  try {
    // Get current semester and academic year
    const semester = await getCurrentSemester();
    const academicYear = await getCurrentAcademicYear();
    const examPeriod = await getCurrentExamPeriod();

    // Generate serial number with semester info
    const serialNumber = await generateSerialNumber(
      studentId,
      semester,
      academicYear,
    );

    // Generate barcode data including semester
    const barcodeData = JSON.stringify({
      studentId,
      serialNumber,
      semester,
      academicYear,
      examPeriod,
      timestamp: new Date().toISOString(),
    });

    // Create exam card
    const response = await api.post<ApiResponse<ExamCard>>(
      "/exam-cards/generate",
      {
        studentId,
        serialNumber,
        barcodeData,
        academicYear,
        semester, // Now this matches the ExamCard interface
        examPeriod,
      },
    );

    const examCard = response.data.data;

    // Generate PDF
    const pdfUrl = await generateExamCardPDF(examCard);

    // Update exam card with PDF URL
    const updatedExamCard = { ...examCard, pdfUrl };

    // Save PDF URL
    await api.patch(`/exam-cards/${examCard.cardId}`, { pdfUrl });

    return updatedExamCard;
  } catch (error) {
    console.error("Error generating exam card:", error);
    throw error;
  }
};

const generateSerialNumber = async (
  studentId: string,
  semester: number,
  academicYear: string,
): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  // Format: EXM-YYYYMMDD-S{1/2}-{studentId}-{random}
  return `EXM-${year}${month}${day}-S${semester}-${studentId.slice(-6)}-${random}`;
};

const getCurrentAcademicYear = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (month >= 9) {
    return `${year}/${year + 1}`;
  } else {
    return `${year - 1}/${year}`;
  }
};

const getCurrentSemester = async (): Promise<number> => {
  const month = new Date().getMonth() + 1;
  // Academic year: Semester 1 (Sept-Feb), Semester 2 (March-August)
  return month >= 9 || month <= 2 ? 1 : 2;
};

const getCurrentExamPeriod = async (): Promise<string> => {
  const now = new Date();
  const month = now.getMonth() + 1;

  if (month >= 11 || month <= 1) {
    return "End of Year";
  } else if (month >= 5 && month <= 7) {
    return "Mid Year";
  } else {
    return "Supplementary";
  }
};

const generateExamCardPDF = async (examCard: ExamCard): Promise<string> => {
  try {
    const response = await api.post<ApiResponse<{ pdfUrl: string }>>(
      "/pdf/generate-exam-card",
      {
        examCard,
      },
    );
    return response.data.data.pdfUrl;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

export const getStudentExamCards = async (
  studentId: string,
): Promise<ExamCard[]> => {
  try {
    const response = await api.get<ApiResponse<ExamCard[]>>(
      `/students/${studentId}/exam-cards`,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching exam cards:", error);
    throw error;
  }
};

export const downloadExamCardPDF = async (
  examCardId: string,
): Promise<string> => {
  try {
    const response = await api.get<ApiResponse<{ downloadUrl: string }>>(
      `/exam-cards/${examCardId}/download`,
    );
    return response.data.data.downloadUrl;
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw error;
  }
};

// Additional helper function to verify exam card
// Additional helper function to verify exam card
export const verifyExamCard = async (
  cardId: string,
  barcodeData: string,
): Promise<{ isValid: boolean; examCard?: ExamCard; message: string }> => {
  try {
    const response = await api.post<
      ApiResponse<{ isValid: boolean; examCard: ExamCard }>
    >("/exam-cards/verify", {
      cardId,
      barcodeData,
    });

    const data = response.data.data;

    // Add the message property
    return {
      isValid: data.isValid,
      examCard: data.examCard,
      message: data.isValid
        ? "Exam card is valid"
        : "Exam card is invalid or expired",
    };
  } catch (error) {
    console.error("Error verifying exam card:", error);
    throw error;
  }
};

// Function to validate if exam card is still valid (not expired)
export const isExamCardValid = (examCard: ExamCard): boolean => {
  const expiryDate = new Date(examCard.expiryDate);
  const now = new Date();
  return examCard.isValid && expiryDate > now;
};
