import axios from "axios";
import { buildApiUrl } from "../config/api";

const API_URL = buildApiUrl("/student");

interface VerificationResponse {
  studentId: string;
  fullName: string;
  academicYear: string;
  faculty: string;
  yearofStudy: string;
  department: string;
  registeredCourses: {
    courseCode: string;
    courseName: string;
    isVerified: boolean;
  }[];
  isEligible: boolean;
}

export const verifyByExamCard = async (
  examCardNo: string,
  token: string,
  unitCode?: string, // Add optional unit code parameter
): Promise<VerificationResponse> => {
  const response = await axios.post(
    `${API_URL}/verify`,
    {
      examCardNo,
      unitCode, // Include unit code in request body
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

export const verifyByStudentId = async (
  studentId: string,
  token: string,
  unitCode?: string, // Add optional unit code parameter
): Promise<VerificationResponse> => {
  const response = await axios.post(
    `${API_URL}/verify`,
    {
      studentId,
      unitCode, // Include unit code in request body
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};
