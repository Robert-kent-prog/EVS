import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";
import { Linking, Platform } from "react-native";
import api from "./api";
import { downloadExamCardPDF } from "./examCard";

const STUDENT_TOKEN_KEY = "studentToken";
const ACCESS_TOKEN_KEY = "accessToken";

const getAbsoluteUrl = (url: string): string => {
  return url.startsWith("http")
    ? url
    : `${api.getBaseUrl().replace("/api", "")}${url}`;
};

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token =
    (await AsyncStorage.getItem(STUDENT_TOKEN_KEY)) ||
    (await AsyncStorage.getItem(ACCESS_TOKEN_KEY));

  if (!token) {
    throw new Error("You are not authenticated. Please log in again.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const downloadExamCardFile = async (
  examCardId: string,
  serialNumber?: string,
): Promise<string> => {
  const rawUrl = await downloadExamCardPDF(examCardId);
  if (!rawUrl) {
    throw new Error("PDF URL is unavailable for this exam card.");
  }

  const absoluteUrl = getAbsoluteUrl(rawUrl);
  const headers = await getAuthHeaders();
  const suffix = serialNumber || examCardId;
  const destination = `${FileSystem.documentDirectory}exam_card_${suffix}.pdf`;

  const result = await FileSystem.downloadAsync(absoluteUrl, destination, {
    headers,
  });

  if (result.status !== 200) {
    throw new Error(`Download failed with status ${result.status}`);
  }

  return result.uri;
};

export const shareExamCardFile = async (
  examCardId: string,
  serialNumber?: string,
): Promise<void> => {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device.");
  }

  const uri = await downloadExamCardFile(examCardId, serialNumber);
  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: "Share Exam Card",
    UTI: "com.adobe.pdf",
  });
};

export const openExamCardInSystemViewer = async (fileUri: string): Promise<void> => {
  if (Platform.OS === "android") {
    const contentUri = await FileSystem.getContentUriAsync(fileUri);
    await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
      data: contentUri,
      flags: 1,
      type: "application/pdf",
    });
    return;
  }

  await Linking.openURL(fileUri);
};
