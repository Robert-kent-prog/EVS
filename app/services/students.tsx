import axios from "axios";

const API_URL = "https://10.66.224.8:6000/api/students";

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
