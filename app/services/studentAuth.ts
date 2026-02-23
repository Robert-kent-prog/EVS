import { Student } from "../types";
import api from "./api"; // Now this will work with default export

interface StudentLoginResponse {
  token: string;
  student: Student;
}

export const studentLogin = async (
  registrationNumber: string,
  password: string,
): Promise<StudentLoginResponse> => {
  try {
    const response = await api.studentLogin(registrationNumber, password);
    return response;
  } catch (error) {
    console.error("Student login error:", error);
    throw error;
  }
};

export const studentForgotPassword = async (
  registrationNumber: string,
): Promise<void> => {
  try {
    await api.studentForgotPassword(registrationNumber);
  } catch (error) {
    console.error("Student forgot password error:", error);
    throw error;
  }
};

export const checkEligibility = async (studentId: string) => {
  try {
    return await api.checkEligibility(studentId);
  } catch (error) {
    console.error("Check eligibility error:", error);
    throw error;
  }
};

export const generateExamCard = async (studentId: string) => {
  try {
    return await api.generateExamCard(studentId);
  } catch (error) {
    console.error("Generate exam card error:", error);
    throw error;
  }
};

export const getStudentExamCards = async (studentId: string) => {
  try {
    return await api.getStudentExamCards(studentId);
  } catch (error) {
    console.error("Get student exam cards error:", error);
    throw error;
  }
};

export const getStudentProfile = async (studentId: string) => {
  try {
    return await api.getStudentProfile(studentId);
  } catch (error) {
    console.error("Get student profile error:", error);
    throw error;
  }
};

export const studentLogout = async (): Promise<void> => {
  try {
    await api.logout("student");
  } catch (error) {
    console.error("Student logout error:", error);
    throw error;
  }
};
