import axios from "axios";

const API_URL = "https://192.168.100.25:6000/api/verification";

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
  const response = await axios.get(`${API_URL}/verify/${code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
