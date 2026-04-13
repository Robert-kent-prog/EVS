// app/_types/index.ts
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
  attendanceTracking?: {
    semesterStartDate?: string | null;
    semesterWeeks?: number;
    weeklyTimetable?: AttendanceTimetableEntry[];
    attendanceSignatures?: AttendanceSignature[];
  };
  lecturerEvaluations?: {
    completed: boolean;
    lastSubmittedAt?: string;
    requiredUnits?: number;
    completedUnits?: number;
    evaluatedUnitCodes?: string[];
  };
}

export interface AttendanceTimetableEntry {
  unitCode: string;
  courseName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface AttendanceSignature {
  unitCode: string;
  courseName: string;
  dayOfWeek: number;
  classDate: string;
  startTime: string;
  endTime: string;
  signedAt: string;
  weekIndex: number;
}

export interface AttendanceMetrics {
  hasTimetable: boolean;
  semesterStartDate: string | null;
  semesterWeeks: number;
  elapsedWeeks: number;
  expectedClosedSessions: number;
  attendedSessions: number;
  totalScheduledSessions: number;
  attendancePercentage: number;
}

export interface AttendanceTodayClass extends AttendanceTimetableEntry {
  classDate: string;
  status: "pending" | "sign_open" | "signed" | "missed_locked" | "out_of_semester";
  canSign: boolean;
  weekIndex: number;
  graceEndsAt: string;
}

export interface AttendanceTableWeekColumn {
  weekIndex: number;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface AttendanceTableCell {
  weekIndex: number;
  classDate: string;
  status: "signed" | "missed" | "sign_open" | "locked";
  mark: string;
  canSign: boolean;
  windowEndsAt: string;
}

export interface AttendanceTableRow {
  rowKey: string;
  unitCode: string;
  courseName: string;
  dayOfWeek: number;
  dayLabel: string;
  classTime: string;
  startTime: string;
  endTime: string;
  weekCells: AttendanceTableCell[];
}

export interface AttendanceOverview {
  timetableConfig: {
    semesterStartDate: string | null;
    semesterWeeks: number;
  };
  weeklyTimetable: AttendanceTimetableEntry[];
  metrics: AttendanceMetrics;
  todayClasses: AttendanceTodayClass[];
  attendanceTable: {
    weekColumns: AttendanceTableWeekColumn[];
    rows: AttendanceTableRow[];
    currentWeekIndex: number;
    currentDate: string;
    semesterWeeks: number;
  };
  semester: {
    academicYear: string;
    semesterWeeks: number;
    semesterStartDate: string | null;
    currentWeekIndex: number;
    currentDate: string;
  };
  studentDisplay: {
    fullName: string;
    studentId: string;
  };
  registeredUnits: {
    courseCode: string;
    courseName: string;
    isVerified: boolean;
  }[];
  hasRegisteredUnits: boolean;
  feesCleared: boolean;
  feeBalance: number;
}

export interface AttendanceTimetablePayload {
  semesterStartDate: string;
  semesterWeeks: number;
  timetable: AttendanceTimetableEntry[];
}

export interface AttendanceSignPayload {
  unitCode: string;
  startTime: string;
  classDate?: string;
  weekIndex?: number;
}

export interface LecturerEvaluationPayload {
  degreeProgramme: string;
  yearOfStudy: "One" | "Two" | "Three" | "Four" | "Other";
  currentSemester: string;
  unitCode: string;
  unitTitle: string;
  lecturerName: string;
  courseOutlineGiven: boolean;
  cat1Administered: boolean;
  cat2Administered: boolean;
  cat1Returned: boolean;
  cat2Returned: boolean;
  lecturerAttendedAllLectures: boolean;
  unitRelevantToDegree: boolean;
  lecturerCoveredAllTopics: boolean;
}

export interface LecturerEvaluationRecord extends LecturerEvaluationPayload {
  _id: string;
  unitCode: string;
  unitTitle: string;
  lecturerName: string;
  academicYear: string;
  submittedAt: string;
  updatedAt?: string;
}

export interface LecturerEvaluationStatus {
  completed: boolean;
  requiredUnits: number;
  completedUnits: number;
  hasRegisteredUnits: boolean;
  feesCleared: boolean;
  feeBalance: number;
  requiredUnitCodes: string[];
  missingUnitCodes: string[];
  lastSubmittedAt: string | null;
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
  refreshToken?: string;
  user: Invigilator;
}

export interface StudentAuthResponse {
  token: string;
  refreshToken?: string;
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
  completedEvaluationUnits?: number;
  requiredEvaluationUnits?: number;
  message?: string;
}
// app/_types/index.ts

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
  updateStudent: (payload: Partial<Student>) => Promise<void>;
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
