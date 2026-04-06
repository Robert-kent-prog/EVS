import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance } from "axios";
import { API_BASE_URL } from "../_config/api";
import {
  SESSION_KEYS,
  clearAllSessionStorage,
  clearInvigilatorSessionStorage,
  clearStudentSessionStorage,
  getBestAvailableAccessToken,
  getInvigilatorRefreshToken,
  getInvigilatorSessionToken,
  getStudentRefreshToken,
  getStudentSessionToken,
  setInvigilatorRefreshToken,
  setInvigilatorSessionToken,
  setStudentRefreshToken,
  setStudentSessionToken,
} from "./secureSession";
import {
  AttendanceOverview,
  AttendanceTimetablePayload,
  EligibilityStatus,
  ExamCard,
  Invigilator,
  InvigilatorAuthResponse,
  LecturerEvaluationRecord,
  LecturerEvaluationPayload,
  LecturerEvaluationStatus,
  Student,
  StudentAuthResponse,
} from "../_types";

class ApiService {
  private api: AxiosInstance;
  private studentApi: AxiosInstance;
  private invigilatorApi: AxiosInstance;
  private refreshRequest: Promise<string | null> | null = null;

  constructor() {
    // Main API instance
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Student-specific API instance
    this.studentApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Invigilator-specific API instance
    this.invigilatorApi = axios.create({
      baseURL: API_BASE_URL,
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
    return API_BASE_URL;
  }

  private setupInterceptors(instance: AxiosInstance) {
    instance.interceptors.request.use(async (config) => {
      const token = await getBestAvailableAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.attachUnauthorizedResponseHandler(instance);
  }

  private setupStudentInterceptors() {
    this.studentApi.interceptors.request.use(async (config) => {
      const token = await getStudentSessionToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.attachUnauthorizedResponseHandler(this.studentApi, "student");
  }

  private setupInvigilatorInterceptors() {
    this.invigilatorApi.interceptors.request.use(async (config) => {
      const token = await getInvigilatorSessionToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.attachUnauthorizedResponseHandler(this.invigilatorApi, "invigilator");
  }

  private attachUnauthorizedResponseHandler(
    instance: AxiosInstance,
    userTypeHint?: "student" | "invigilator",
  ) {
    instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const statusCode = error.response?.status;
        const originalRequest = error.config as any;
        const requestUrl = String(originalRequest?.url || "");

        if (
          !statusCode ||
          ![401, 403].includes(statusCode) ||
          !originalRequest ||
          originalRequest._retry ||
          requestUrl.includes("/auth/login") ||
          requestUrl.includes("/auth/student/login") ||
          requestUrl.includes("/auth/refresh") ||
          requestUrl.includes("/auth/logout") ||
          requestUrl.includes("/verify-token")
        ) {
          if (
            requestUrl.includes("/auth/refresh") &&
            statusCode !== undefined &&
            [401, 403].includes(statusCode)
          ) {
            await clearAllSessionStorage();
          }
          return Promise.reject(error);
        }

        originalRequest._retry = true;
        const refreshedAccessToken = await this.refreshCurrentSession(userTypeHint);

        if (!refreshedAccessToken) {
          await clearAllSessionStorage();
          return Promise.reject(error);
        }

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;
        return instance(originalRequest);
      },
    );
  }

  private async performRefresh(userType: "student" | "invigilator") {
    const refreshToken =
      userType === "student"
        ? await getStudentRefreshToken()
        : await getInvigilatorRefreshToken();

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await this.api.post("/auth/refresh", { refreshToken });
      const data = response.data;
      const accessToken = data.accessToken || data.data?.accessToken;
      const nextRefreshToken = data.refreshToken || data.data?.refreshToken;

      if (!accessToken || !nextRefreshToken) {
        return null;
      }

      if (userType === "student") {
        await setStudentSessionToken(accessToken);
        await setStudentRefreshToken(nextRefreshToken);
      } else {
        await setInvigilatorSessionToken(accessToken);
        await setInvigilatorRefreshToken(nextRefreshToken);
      }

      return accessToken;
    } catch (error) {
      return null;
    }
  }

  async refreshCurrentSession(
    userTypeHint?: "student" | "invigilator",
  ): Promise<string | null> {
    const storedUserType = await AsyncStorage.getItem(SESSION_KEYS.userType);
    const userType =
      userTypeHint ||
      (storedUserType === "student" || storedUserType === "invigilator"
        ? storedUserType
        : null);

    if (!userType) {
      return null;
    }

    if (!this.refreshRequest) {
      this.refreshRequest = this.performRefresh(userType).finally(() => {
        this.refreshRequest = null;
      });
    }

    return this.refreshRequest;
  }

  async verifyStoredSession(
    userTypeHint?: "student" | "invigilator",
  ): Promise<boolean> {
    const accessToken =
      userTypeHint === "student"
        ? await getStudentSessionToken()
        : userTypeHint === "invigilator"
          ? await getInvigilatorSessionToken()
          : await getBestAvailableAccessToken();

    if (!accessToken) {
      return false;
    }

    try {
      const response = await this.api.post("/verify-token", null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.status === 200;
    } catch {
      const refreshedAccessToken = await this.refreshCurrentSession(userTypeHint);
      return Boolean(refreshedAccessToken);
    }
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

  async studentPut<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<{ data: T }> {
    return this.studentApi.put(url, data, config);
  }

  async studentDelete<T = any>(
    url: string,
    config?: any,
  ): Promise<{ data: T }> {
    return this.studentApi.delete(url, config);
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
        const refreshToken =
          data.refreshToken || data.data?.refreshToken || null;
        const student = data.user || data.student || data.data?.student;

        if (token && refreshToken) {
          await setStudentSessionToken(token);
          await setStudentRefreshToken(refreshToken);
          await AsyncStorage.multiRemove([
            SESSION_KEYS.userData,
            SESSION_KEYS.invigilatorData,
          ]);
          await AsyncStorage.multiSet([
            [SESSION_KEYS.userType, "student"],
            [SESSION_KEYS.studentData, JSON.stringify(student)],
          ]);
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
    const response = await this.studentGet(`/student/${studentId}`);
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
        const refreshToken =
          data.refreshToken || data.data?.refreshToken || null;
        const invigilator = data.user || data.invigilator || data.data?.user;

        if (token && refreshToken) {
          await setInvigilatorSessionToken(token);
          await setInvigilatorRefreshToken(refreshToken);
          await AsyncStorage.removeItem(SESSION_KEYS.studentData);
          await AsyncStorage.multiSet([
            [SESSION_KEYS.userType, "invigilator"],
            [SESSION_KEYS.invigilatorData, JSON.stringify(invigilator)],
            [SESSION_KEYS.userData, JSON.stringify(invigilator)],
          ]);
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
    const type = userType || (await AsyncStorage.getItem(SESSION_KEYS.userType));
    const refreshToken =
      type === "student"
        ? await getStudentRefreshToken()
        : await getInvigilatorRefreshToken();

    try {
      if (refreshToken) {
        await this.api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Remote logout error:", error);
    }

    if (type === "student") {
      await clearStudentSessionStorage();
    } else {
      await clearInvigilatorSessionStorage();
    }
  }

  async logoutAll(): Promise<void> {
    await clearAllSessionStorage();
  }

  // --- Exam Card System ---

  async checkEligibility(studentId: string): Promise<EligibilityStatus> {
    try {
      const response = await this.studentGet(`/exam-cards/eligibility/${studentId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error checking eligibility:", error);
      throw error;
    }
  }

  async generateExamCard(studentId: string): Promise<ExamCard> {
    try {
      const response = await this.studentPost("/exam-cards/generate", { studentId });
      return response.data.data || response.data.examCard || response.data;
    } catch (error) {
      console.error("Error generating exam card:", error);
      throw error;
    }
  }

  async getStudentExamCards(studentId: string): Promise<ExamCard[]> {
    try {
      const response = await this.studentGet(`/exam-cards/student/${studentId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching student exam cards:", error);
      throw error;
    }
  }

  async getCurrentExamCard(studentId: string): Promise<ExamCard | null> {
    try {
      const response = await this.studentGet(`/exam-cards/current/${studentId}`);
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

  async deleteExamCard(cardId: string, _studentId: string): Promise<void> {
    try {
      await this.studentDelete(`/exam-cards/${cardId}`);
    } catch (error) {
      console.error("Error deleting exam card:", error);
      throw error;
    }
  }

  async submitLecturerEvaluation(
    payload: LecturerEvaluationPayload,
  ): Promise<{ success: boolean; message: string; data?: LecturerEvaluationStatus }> {
    const response = await this.studentPost("/student/evaluations", payload);
    return response.data;
  }

  async getLecturerEvaluationStatus(
    studentId: string,
  ): Promise<LecturerEvaluationStatus> {
    const response = await this.studentGet(
      `/student/${studentId}/lecturer-evaluation-status`,
    );
    return response.data.data || response.data;
  }

  async getStudentLecturerEvaluations(): Promise<{
    evaluations: LecturerEvaluationRecord[];
    requiredUnitCodes: string[];
    missingUnitCodes: string[];
    requiredUnits: number;
    completedUnits: number;
    completed: boolean;
    hasRegisteredUnits: boolean;
    feesCleared: boolean;
    feeBalance: number;
  }> {
    const response = await this.studentGet("/student/evaluations");
    return response.data.data || response.data;
  }

  async getAttendanceOverview(): Promise<AttendanceOverview> {
    const response = await this.studentGet("/student/attendance/overview");
    return response.data.data || response.data;
  }

  async updateAttendanceTimetable(
    payload: AttendanceTimetablePayload,
  ): Promise<{
    timetableConfig: { semesterStartDate: string; semesterWeeks: number };
    weeklyTimetable: AttendanceTimetablePayload["timetable"];
    metrics: AttendanceOverview["metrics"];
  }> {
    const response = await this.studentPut("/student/attendance/timetable", payload);
    return response.data.data || response.data;
  }

  async signClassAttendance(payload: {
    unitCode: string;
    startTime: string;
  }): Promise<{
    signature: {
      classDate: string;
      unitCode: string;
      courseName: string;
      startTime: string;
      endTime: string;
      signedAt: string;
      weekIndex: number;
    };
    metrics: AttendanceOverview["metrics"];
  }> {
    const response = await this.studentPost("/student/attendance/sign", payload);
    return response.data.data || response.data;
  }
}

// Create and export a singleton instance as default export
const api = new ApiService();
export default api;

// Also export named exports for specific use cases
export { ApiService };
