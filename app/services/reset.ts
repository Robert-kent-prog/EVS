// services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://10.6.81.43:6000/api",
});

export default {
  forgotPassword: async (staffNo: string) => {
    const response = await api.post("/auth/forgot-password", { staffNo });
    return response.data;
  },
};