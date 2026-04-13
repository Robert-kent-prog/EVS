import Constants from "expo-constants";

const API_PROTOCOL = "http";
const API_PORT = "6000";
const MANUAL_API_HOST = "";

const readExpoHost = (): string | null => {
  const constantsAny = Constants as any;
  const hostUri =
    constantsAny.expoConfig?.hostUri ||
    constantsAny.manifest2?.extra?.expoClient?.hostUri ||
    null;

  if (!hostUri || typeof hostUri !== "string") {
    return null;
  }

  const [host] = hostUri.split(":");
  return host || null;
};

const resolveApiHost = (): string => {
  if (MANUAL_API_HOST.trim()) {
    return MANUAL_API_HOST.trim();
  }

  const detectedHost = readExpoHost();
  if (detectedHost) {
    return detectedHost;
  }

  return "127.0.0.1";
};

export const API_BASE_URL = `${API_PROTOCOL}://${resolveApiHost()}:${API_PORT}/api`;

export const buildApiUrl = (path = ""): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
