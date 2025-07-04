import axios from "axios";

const API_URL = "https://192.168.100.25:6000/api/history";

interface VerificationLog {
  _id: string;
  studentId: string;
  invigilatorId: string;
  verificationMethod: string;
  status: string;
  timestamp: string;
  remarks?: string;
}

export const getVerificationHistory = async (
  token: string
): Promise<VerificationLog[]> => {
  const response = await axios.get(`${API_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
