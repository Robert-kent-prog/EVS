// services/api.ts
import axios from "axios";
import { API_BASE_URL } from "../_config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default {
  forgotPassword: async (staffNo: string) => {
    const response = await api.post("/auth/forgot-password", { staffNo });
    return response.data;
  },
};
