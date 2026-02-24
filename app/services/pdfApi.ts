// services/pdfApi.ts
import axios, { AxiosResponse } from "axios";
import * as FileSystem from "expo-file-system";

const API_URL = "http://10.66.224.8:6000/api/pdf"; // Updated base URL

// Types
export interface PDFGenerationRequest {
  data: any; // Replace with your specific data structure
}

// Base response structure
export interface BaseResponse {
  success: boolean;
  message: string;
  data: PDFReportData;
}

// The actual PDF report data
export interface PDFReportData {
  success: boolean;
  reportId: string;
  filename: string;
  downloadUrl?: string;
  fileSize: string;
  createdAt: string;
}

// For PDF generation response
export type PDFGenerationResponse = BaseResponse;

// For getReports response
export interface ReportsResponse {
  success: boolean;
  message: string;
  data: {
    reports: PDFReport[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// For individual PDF report
export interface PDFReport {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}
export class PDFApiService {
  private token: string | null = null;

  constructor(token?: string) {
    if (token) {
      this.setToken(token);
    }
  }

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }

  private getAuthHeaders() {
    if (!this.token) {
      throw new Error("Authentication token is not set");
    }
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  private getAuthHeadersForDownload() {
    if (!this.token) {
      throw new Error("Authentication token is not set");
    }
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  // Generate and save PDF on server
  async generateAttendancePDF(data: any): Promise<PDFGenerationResponse> {
    try {
      const response: AxiosResponse<PDFGenerationResponse> = await axios.post(
        `${API_URL}/generate`,
        { data },
        { headers: this.getAuthHeaders() },
      );

      return response.data;
    } catch (error: any) {
      console.error("PDF API error:", error);
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      throw error;
    }
  }

  // Download PDF from server
  async downloadPDF(reportId: string): Promise<string> {
    try {
      // Validate reportId
      if (!reportId || reportId.trim() === "" || reportId === "undefined") {
        console.error("Invalid reportId provided:", reportId);
        throw new Error("Invalid report ID");
      }

      // console.log("Attempting to download PDF with reportId:", reportId);

      const response: AxiosResponse<Blob> = await axios.get(
        `${API_URL}/download/${reportId}`,
        {
          headers: this.getAuthHeadersForDownload(),
          responseType: "blob",
        },
      );

      return new Promise<string>((resolve, reject) => {
        // Save to local storage
        const downloadsDir = FileSystem.documentDirectory + "Downloads/";
        FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true })
          .then(() => {
            const fileName = `Attendance_Report_${Date.now()}.pdf`;
            const fileUri = downloadsDir + fileName;

            // Convert blob to base64 and save
            const reader = new FileReader();
            reader.readAsDataURL(response.data);

            reader.onloadend = async () => {
              try {
                const base64data = (reader.result as string).split(",")[1];
                await FileSystem.writeAsStringAsync(fileUri, base64data, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                resolve(fileUri);
              } catch (error: any) {
                console.error("File save error:", error);
                reject(new Error("Failed to save PDF file"));
              }
            };

            reader.onerror = () => {
              reject(new Error("Failed to read PDF data"));
            };
          })
          .catch((error) => {
            console.error("Directory creation error:", error);
            reject(new Error("Failed to create downloads directory"));
          });
      });
    } catch (error: any) {
      console.error("Download error details:", {
        message: error.message,
        reportId,
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.message === "Invalid report ID") {
        throw new Error("Invalid report ID");
      }
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      if (error.response?.status === 404) {
        throw new Error("PDF report not found");
      }
      if (error.response?.status === 400) {
        throw new Error("Invalid report ID format");
      }
      throw error;
    }
  }

  // Get user's PDF reports
  async getReports(page: number = 1): Promise<ReportsResponse> {
    try {
      const response: AxiosResponse<ReportsResponse> = await axios.get(
        `${API_URL}/reports?page=${page}`,
        { headers: this.getAuthHeaders() },
      );
      return response.data;
    } catch (error: any) {
      console.error("Get reports error:", error);
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      throw error;
    }
  }

  // Optional: Delete PDF report
  async deleteReport(reportId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/reports/${reportId}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error: any) {
      console.error("Delete report error:", error);
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      throw error;
    }
  }
}

// Create a singleton instance (optional)
export const pdfApi = new PDFApiService();

// Or export the class for manual instantiation
export default PDFApiService;
