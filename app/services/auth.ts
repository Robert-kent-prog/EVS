/* eslint-disable import/no-named-as-default-member */
import axios from 'axios';

const API_URL = 'http://192.168.0.108:6000/api';

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    userName: string;
    staffNo: string;
    role: 'Invigilator' | 'admin';
  };
}

interface RegisterResponse {
  user: {
    _id: string;
    userName: string;
    staffNo: string;
    role: 'Invigilator' | 'admin';
  };
  message?: string;
}

export const register = async (
  userName: string,
  staffNo: string,
  password: string,
  role: 'Invigilator' | 'admin' = 'Invigilator'
): Promise<RegisterResponse['user']> => { // Only return the user part
  try {
    const response = await axios.post(`${API_URL}/users`, {
      userName,
      staffNo,
      password,
      role
    });

    console.log('Full registration response:', response.data); // Debug log

    if (!response.data.user?._id) {
      throw new Error('Registration failed - invalid response format');
    }

    return response.data.user; // Return only the user object
  } catch (error) {
    console.error('Registration error details:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
    throw error;
  }
};

export const login = async (
  staffNo: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      staffNo,
      password
    });

    if (!response.data.accessToken || !response.data.user?._id) {
      throw new Error('Login failed - invalid response format');
    }

    return {
      token: response.data.accessToken,  // Now matches backend property name
      user: {
        _id: response.data.user._id,
        userName: response.data.user.userName,
        staffNo: response.data.user.staffNo,
        role: response.data.user.role
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
    throw new Error('Login failed');
  }
};

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${API_URL}/verify-token`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};