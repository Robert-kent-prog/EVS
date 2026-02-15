/* eslint-disable import/no-named-as-default-member */
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "http://10.145.89.8:6000/api";

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    userName: string;
    staffNo: string;
    role: string;
    email: string;
  };
}

interface RegisterResponse {
  user: {
    _id: string;
    userName: string;
    staffNo: string;
    role: string;
    email: string;
  };
  message?: string;
}

export const register = async (
  userName: string,
  staffNo: string,
  email: string,
  password: string,
  role: string = "Invigilator", // Make role optional with default
): Promise<RegisterResponse["user"]> => {
  try {
    const response = await axios.post(`${API_URL}/users`, {
      userName,
      staffNo,
      email,
      password,
      role,
    });

    if (!response.data.user?._id) {
      throw new Error("Registration failed - invalid response format");
    }

    return response.data.user;
  } catch (error) {
    console.error("Registration error details:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Registration failed",
      );
    }
    throw error;
  }
};

export const login = async (
  staffNo: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      staffNo,
      password,
    });

    // console.log("Full API response:", response.data); // Debug log

    if (!response.data.accessToken || !response.data.user?._id) {
      throw new Error("Login failed - invalid response format");
    }

    return {
      token: response.data.accessToken,
      user: {
        _id: response.data.user._id,
        userName: response.data.user.userName,
        staffNo: response.data.user.staffNo,
        role: response.data.user.role,
        email: response.data.user.email, // Make sure this is included
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${API_URL}/verify-token`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.status === 200;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
};

export const forgotPassword = async (staffNo: string) => {
  const response = await axios.post(`${API_URL}/auth/forgot-password`, {
    staffNo,
  });
  return response.data;
};

// Add these to your auth service
export const updateProfile = async (
  userId: string,
  data: {
    userName: string;
    email: string;
    staffNo: string;
  },
) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, data, {
      headers: {
        Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

export const deleteAccount = async (userId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Delete account error:", error);
    throw error;
  }
};
