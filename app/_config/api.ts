const API_PROTOCOL = "http";
const API_HOST = "10.115.232.8";
const API_PORT = "6000";

export const API_BASE_URL = `${API_PROTOCOL}://${API_HOST}:${API_PORT}/api`;

export const buildApiUrl = (path = ""): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
