import axios from "axios";
import { buildApiUrl } from "../config/api";

const API_URL = buildApiUrl("/history");

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
  token: string,
): Promise<VerificationLog[]> => {
  const response = await axios.get(`${API_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
