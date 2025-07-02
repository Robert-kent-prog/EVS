import axios from "axios";

const API_URL = "http://192.168.0.108:6000/api/student";

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

export const verifyStudent = async (
  code: string,
  token: string
): Promise<VerificationResponse> => {
  const response = await axios.post(
    `${API_URL}/verify`,
    { examCardNo: code }, // Request body
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
