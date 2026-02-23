// app/types/index.ts
export interface Student {
  _id?: string;
  studentId: string;
  fullName: string;
  email: string;
  academicYear?: string;
  faculty?: string;
  yearOfStudy?: number | string;
  department?: string;
  examCardNo?: string;
  registeredCourses?: {
    courseCode: string;
    courseName: string;
    isVerified: boolean;
  }[];
  isEligible?: boolean;
  program?: string;
  semester?: number;
  phoneNumber?: string;
  attendance?: number;
  feeBalance?: number;
  lecturerEvaluations?: {
    completed: boolean;
  };
}

export interface ExamCard {
  cardId: string;
  studentId: string;
  serialNumber: string;
  barcodeData: string;
  pdfUrl?: string;
  qrCodeUrl?: string;
  downloadUrl?: string;
  expiryDate: string;
  generationDate: string;
  isValid: boolean;
  semester: number;
  generatedAt: Date;
  courses?: {
    courseCode: string;
    courseName: string;
  }[];
}

export interface User {
  id: string;
  userName: string;
  role: "student" | "invigilator" | "admin";
  email?: string;
}
// Add these to your existing types

export interface Invigilator {
  _id: string;
  userName: string;
  staffNo: string;
  email: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InvigilatorAuthResponse {
  token: string;
  user: Invigilator;
}

export interface StudentAuthResponse {
  token: string;
  student: Student;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface EligibilityStatus {
  isEligible: boolean;
  attendanceMet: boolean;
  evaluationsComplete: boolean;
  feesCleared: boolean;
  hasRegisteredUnits: boolean;
  attendance: number;
  feeBalance: number;
  requiredAttendance?: number;
  validityDays?: number;
  specifications?: {
    key: string;
    title: string;
    requirement: string;
    met: boolean;
  }[];
  missingEvaluations?: string[];
  message?: string;
}
// app/types/index.ts

export interface StudentAuthContextType {
  student: Student | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (registrationNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (registrationNumber: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  checkEligibility: (studentId: string) => Promise<EligibilityStatus>;
  generateExamCard: (studentId: string) => Promise<ExamCard>;
  getCurrentExamCard: (studentId: string) => Promise<ExamCard | null>;
  getStudentExamCards: (studentId: string) => Promise<ExamCard[]>;
  getStudentProfile: (studentId: string) => Promise<Student>;
}

export interface InvigilatorAuthContextType {
  invigilator: Invigilator | null;
  isLoading: boolean;
  error: string | null;
  login: (staffNo: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    userName: string,
    staffNo: string,
    email: string,
    password: string,
  ) => Promise<void>;
  forgotPassword: (staffNo: string) => Promise<void>;
  verifyExamCard: (barcodeData: string) => Promise<any>;
  verifyManual: (registrationNumber: string) => Promise<any>;
}
export interface StudentAuthState {
  student: Student | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
}

export type StudentAuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { student: Student; token: string } }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "UPDATE_STUDENT"; payload: Partial<Student> };

export type InvigilatorAuthAction =
  | { type: "LOGIN_START" }
  | {
      type: "LOGIN_SUCCESS";
      payload: { invigilator: Invigilator; token: string };
    }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "UPDATE_INVIGILATOR"; payload: Partial<Invigilator> };
