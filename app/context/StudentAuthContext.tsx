// app/context/StudentAuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import api from "../services/api";
import {
    EligibilityStatus,
    ExamCard,
    Student,
    StudentAuthAction,
    StudentAuthContextType,
    StudentAuthState,
} from "../types";

const STUDENT_TOKEN_KEY = "studentToken";
const STUDENT_DATA_KEY = "studentData";

// Initial state
const initialState: StudentAuthState = {
  student: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  token: null,
};

// Create context
const StudentAuthContext = createContext<StudentAuthContextType | undefined>(
  undefined,
);

// Reducer
const studentAuthReducer = (
  state: StudentAuthState,
  action: StudentAuthAction,
): StudentAuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        student: action.payload.student,
        token: action.payload.token,
        error: null,
      };

    case "LOGIN_FAILURE":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        student: null,
        token: null,
        error: action.payload,
      };

    case "LOGOUT":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        student: null,
        token: null,
        error: null,
      };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "UPDATE_STUDENT":
      return {
        ...state,
        student: state.student ? { ...state.student, ...action.payload } : null,
      };

    default:
      return state;
  }
};

// Provider component
export const StudentAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(studentAuthReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const token = await AsyncStorage.getItem(STUDENT_TOKEN_KEY);
        const studentData = await AsyncStorage.getItem(STUDENT_DATA_KEY);

        if (token && studentData) {
          const student = JSON.parse(studentData);
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { student, token },
          });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.error("Error loading stored data:", error);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadStoredData();
  }, []);

  // Auth methods
  const login = async (registrationNumber: string, password: string) => {
    try {
      dispatch({ type: "LOGIN_START" });

      const response = await api.studentLogin(registrationNumber, password);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          student: response.student,
          token: response.token,
        },
      });

      await AsyncStorage.setItem(STUDENT_TOKEN_KEY, response.token);
      await AsyncStorage.setItem(
        STUDENT_DATA_KEY,
        JSON.stringify(response.student),
      );
    } catch (error) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error instanceof Error ? error.message : "Login failed",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([STUDENT_TOKEN_KEY, STUDENT_DATA_KEY]);
      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Logout error:", error);
      dispatch({ type: "LOGOUT" });
    }
  };

  const forgotPassword = async (registrationNumber: string) => {
    try {
      await api.studentForgotPassword(registrationNumber);
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await api.studentResetPassword(token, newPassword);
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  const checkEligibility = async (
    studentId: string,
  ): Promise<EligibilityStatus> => {
    return await api.checkEligibility(studentId);
  };

  const generateExamCard = async (studentId: string): Promise<ExamCard> => {
    return await api.generateExamCard(studentId);
  };

  const getCurrentExamCard = async (
    studentId: string,
  ): Promise<ExamCard | null> => {
    try {
      return await api.getCurrentExamCard(studentId);
    } catch (error) {
      console.error("Error getting current exam card:", error);
      return null;
    }
  };

  const getStudentExamCards = async (
    studentId: string,
  ): Promise<ExamCard[]> => {
    return await api.getStudentExamCards(studentId);
  };

  const getStudentProfile = async (studentId: string): Promise<Student> => {
    return await api.getStudentProfile(studentId);
  };

  const contextValue: StudentAuthContextType = {
    student: state.student,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    token: state.token,
    login,
    logout,
    forgotPassword,
    resetPassword,
    checkEligibility,
    generateExamCard,
    getCurrentExamCard,
    getStudentExamCards,
    getStudentProfile,
  };
  
  return (
    <StudentAuthContext.Provider value={contextValue}>
      {children}
    </StudentAuthContext.Provider>
  );
};

// Custom hook
export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (context === undefined) {
    throw new Error("useStudentAuth must be used within a StudentAuthProvider");
  }
  return context;
};
