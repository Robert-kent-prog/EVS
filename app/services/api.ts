import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance } from "axios";
import {
  EligibilityStatus,
  ExamCard,
  Invigilator,
  InvigilatorAuthResponse,
  Student,
  StudentAuthResponse,
} from "../types";

const BASE_URL = "http://10.139.26.8:6000/api";

class ApiService {
  private api: AxiosInstance;
  private studentApi: AxiosInstance;
  private invigilatorApi: AxiosInstance;

  constructor() {
    // Main API instance
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Student-specific API instance
    this.studentApi = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Invigilator-specific API instance
    this.invigilatorApi = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Setup interceptors for all instances
    this.setupInterceptors(this.api);
    this.setupStudentInterceptors();
    this.setupInvigilatorInterceptors();
  }

  public getBaseUrl(): string {
    return BASE_URL;
  }

  private setupInterceptors(instance: AxiosInstance) {
    instance.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await AsyncStorage.multiRemove([
            "accessToken",
            "userType",
            "studentData",
            "invigilatorData",
            "studentToken",
            "invigilatorToken",
          ]);
        }
        return Promise.reject(error);
      },
    );
  }

  private setupStudentInterceptors() {
    this.studentApi.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem("studentToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  private setupInvigilatorInterceptors() {
    this.invigilatorApi.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem("invigilatorToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ============ HTTP METHODS ============
  async get<T = any>(url: string, config?: any): Promise<{ data: T }> {
    return this.api.get(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<{ data: T }> {
    return this.api.post(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<{ data: T }> {
    return this.api.put(url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<{ data: T }> {
    return this.api.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: any): Promise<{ data: T }> {
    return this.api.delete(url, config);
  }

  // Student-specific HTTP methods
  async studentGet<T = any>(url: string, config?: any): Promise<{ data: T }> {
    return this.studentApi.get(url, config);
  }

  async studentPost<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<{ data: T }> {
    return this.studentApi.post(url, data, config);
  }

  async studentPatch<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<{ data: T }> {
    return this.studentApi.patch(url, data, config);
  }

  // Invigilator-specific HTTP methods
  async invigilatorGet<T = any>(
    url: string,
    config?: any,
  ): Promise<{ data: T }> {
    return this.invigilatorApi.get(url, config);
  }

  async invigilatorPost<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<{ data: T }> {
    return this.invigilatorApi.post(url, data, config);
  }

  // ============ STUDENT AUTHENTICATION ============
  async studentLogin(
    registrationNumber: string,
    password: string,
  ): Promise<StudentAuthResponse> {
    try {
      const response = await this.post("/auth/student/login", {
        identifier: registrationNumber,
        password,
      });
      const data = response.data;

      // Backend returns { accessToken, user }
      if (data.accessToken || data.token) {
        const token = data.accessToken || data.token || data.data?.token;
        const student = data.user || data.student || data.data?.student;

        if (token) {
          await AsyncStorage.setItem("studentToken", token);
          await AsyncStorage.setItem("userType", "student");
          await AsyncStorage.setItem("studentData", JSON.stringify(student));
        }

        return {
          token,
          student,
        };
      }

      throw new Error(data.message || "Login failed");
    } catch (error: unknown) {
      console.error("Student login error:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as AxiosError;
        console.error("Response error:", {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers,
        });
      }
      throw error;
    }
  }

  async studentForgotPassword(registrationNumber: string): Promise<void> {
    try {
      await this.post("/auth/students/forgot-password", { registrationNumber });
    } catch (error) {
      console.error("Student forgot password error:", error);
      throw error;
    }
  }

  async studentResetPassword(
    token: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await this.post("/auth/students/reset-password", { token, newPassword });
    } catch (error) {
      console.error("Student reset password error:", error);
      throw error;
    }
  }

  // ============ STUDENT SERVICES ============

  async getStudentProfile(studentId: string): Promise<Student> {
    const response = await this.get(`/student/${studentId}`);
    return response.data.data || response.data;
  }

  // ============ INVIGILATOR AUTHENTICATION ============
  async invigilatorLogin(
    staffNo: string,
    password: string,
  ): Promise<InvigilatorAuthResponse> {
    try {
      const response = await this.post("/auth/login", {
        staffNo,
        password,
      });

      const data = response.data;

      // Backend returns { accessToken, user }
      if (data.accessToken || data.token) {
        const token = data.accessToken || data.token || data.data?.token;
        const invigilator = data.user || data.invigilator || data.data?.user;

        if (token) {
          await AsyncStorage.setItem("invigilatorToken", token);
          await AsyncStorage.setItem("userType", "invigilator");
          await AsyncStorage.setItem(
            "invigilatorData",
            JSON.stringify(invigilator),
          );
        }

        return {
          token,
          user: invigilator,
        };
      }

      throw new Error(data.message || "Login failed");
    } catch (error) {
      console.error("Invigilator login error:", error);
      throw error;
    }
  }

  async invigilatorRegister(
    userName: string,
    staffNo: string,
    email: string,
    password: string,
    role: string = "Invigilator",
  ): Promise<Invigilator> {
    try {
      const response = await this.post("/auth/invigilators/register", {
        userName,
        staffNo,
        email,
        password,
        role,
      });

      return response.data.data || response.data.invigilator || response.data;
    } catch (error) {
      console.error("Invigilator registration error:", error);
      throw error;
    }
  }

  async invigilatorForgotPassword(staffNo: string): Promise<void> {
    try {
      await this.post("/auth/invigilators/forgot-password", { staffNo });
    } catch (error) {
      console.error("Invigilator forgot password error:", error);
      throw error;
    }
  }

  // ============ EXAM CARD VERIFICATION ============
  async verifyExamCard(barcodeData: string): Promise<any> {
    const response = await this.invigilatorPost("/verification/verify", {
      barcodeData,
    });
    return response.data.data || response.data;
  }

  async verifyManual(registrationNumber: string): Promise<any> {
    const response = await this.invigilatorPost("/verification/manual", {
      registrationNumber,
    });
    return response.data.data || response.data;
  }

  // ============ LOGOUT ============
  async logout(userType?: string): Promise<void> {
    const type = userType || (await AsyncStorage.getItem("userType"));

    if (type === "student") {
      await AsyncStorage.multiRemove([
        "studentToken",
        "studentData",
        "userType",
      ]);
    } else {
      await AsyncStorage.multiRemove([
        "invigilatorToken",
        "invigilatorData",
        "accessToken",
        "userType",
      ]);
    }
  }

  async logoutAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      "studentToken",
      "studentData",
      "invigilatorToken",
      "invigilatorData",
      "accessToken",
      "userType",
    ]);
  }

  // --- Exam Card System ---

  async checkEligibility(studentId: string): Promise<EligibilityStatus> {
    try {
      const response = await this.get(`/exam-cards/eligibility/${studentId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error checking eligibility:", error);
      throw error;
    }
  }

  async generateExamCard(studentId: string): Promise<ExamCard> {
    try {
      const response = await this.post("/exam-cards/generate", { studentId });
      return response.data.data || response.data.examCard || response.data;
    } catch (error) {
      console.error("Error generating exam card:", error);
      throw error;
    }
  }

  async getStudentExamCards(studentId: string): Promise<ExamCard[]> {
    try {
      const response = await this.get(`/exam-cards/student/${studentId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching student exam cards:", error);
      throw error;
    }
  }

  async getCurrentExamCard(studentId: string): Promise<ExamCard | null> {
    try {
      const response = await this.get(`/exam-cards/current/${studentId}`);
      return response.data.data || response.data;
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      console.error("Error fetching current exam card:", error);
      throw error;
    }
  }

  async deleteExamCard(cardId: string, studentId: string): Promise<void> {
    try {
      await this.delete(`/exam-cards/${cardId}`, {
        data: { studentId },
      });
    } catch (error) {
      console.error("Error deleting exam card:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance as default export
const api = new ApiService();
export default api;

// Also export named exports for specific use cases
export { ApiService };
