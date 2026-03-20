import axios from "axios";
import { buildApiUrl } from "../_config/api";

const API_URL = buildApiUrl("/students");

interface StudentDetails {
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

export const getStudentDetails = async (
  id: string,
  token: string,
): Promise<StudentDetails> => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
