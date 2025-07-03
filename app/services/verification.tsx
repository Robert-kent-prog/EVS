import axios from "axios";

const API_URL = "http://192.168.100.25:6000/api/student";

interface VerificationResponse {
  studentId: string;
  fullName: string;
  academicYear: string;
  faculty: string;
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
  token: string
): Promise<VerificationResponse> => {
  const response = await axios.post(
    `${API_URL}/verify`,
    { examCardNo },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const verifyByStudentId = async (
  studentId: string,
  token: string
): Promise<VerificationResponse> => {
  const response = await axios.post(
    `${API_URL}/verify`,
    { studentId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
