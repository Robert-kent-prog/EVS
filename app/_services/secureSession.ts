import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export const SESSION_KEYS = {
  authToken: "authToken",
  accessToken: "accessToken",
  studentToken: "studentToken",
  invigilatorToken: "invigilatorToken",
  studentRefreshToken: "studentRefreshToken",
  invigilatorRefreshToken: "invigilatorRefreshToken",
  userType: "userType",
  userData: "userData",
  studentData: "studentData",
  invigilatorData: "invigilatorData",
} as const;

const TOKEN_KEYS = [
  SESSION_KEYS.authToken,
  SESSION_KEYS.accessToken,
  SESSION_KEYS.studentToken,
  SESSION_KEYS.invigilatorToken,
  SESSION_KEYS.studentRefreshToken,
  SESSION_KEYS.invigilatorRefreshToken,
] as const;

let secureStoreAvailabilityPromise: Promise<boolean> | null = null;

const isSecureStoreAvailable = async () => {
  if (!secureStoreAvailabilityPromise) {
    secureStoreAvailabilityPromise = SecureStore.isAvailableAsync().catch(
      () => false,
    );
  }

  return secureStoreAvailabilityPromise;
};

const readSecureValue = async (key: string) => {
  if (!(await isSecureStoreAvailable())) {
    return null;
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
};

const writeSecureValue = async (key: string, value: string) => {
  if (!(await isSecureStoreAvailable())) {
    await AsyncStorage.setItem(key, value);
    return;
  }

  try {
    await SecureStore.setItemAsync(key, value);
    await AsyncStorage.removeItem(key);
  } catch {
    await AsyncStorage.setItem(key, value);
  }
};

const deleteSecureValue = async (key: string) => {
  if (await isSecureStoreAvailable()) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore and continue clearing legacy storage.
    }
  }

  await AsyncStorage.removeItem(key);
};

export const getSessionToken = async (key: (typeof TOKEN_KEYS)[number]) => {
  const secureValue = await readSecureValue(key);
  if (secureValue) {
    return secureValue;
  }

  const legacyValue = await AsyncStorage.getItem(key);
  if (legacyValue) {
    await writeSecureValue(key, legacyValue);
    return legacyValue;
  }

  return null;
};

export const setSessionToken = async (
  key: (typeof TOKEN_KEYS)[number],
  token: string,
) => {
  await writeSecureValue(key, token);
};

export const removeSessionToken = async (key: (typeof TOKEN_KEYS)[number]) => {
  await deleteSecureValue(key);
};

export const getSessionUserType = async () =>
  AsyncStorage.getItem(SESSION_KEYS.userType);

const getFirstAvailableToken = async (
  keys: readonly (typeof TOKEN_KEYS)[number][],
) => {
  for (const key of keys) {
    const token = await getSessionToken(key);
    if (token) {
      return token;
    }
  }

  return null;
};

export const getStudentSessionToken = async () =>
  getFirstAvailableToken([SESSION_KEYS.studentToken]);

export const getInvigilatorSessionToken = async () =>
  getFirstAvailableToken([
    SESSION_KEYS.authToken,
    SESSION_KEYS.invigilatorToken,
    SESSION_KEYS.accessToken,
  ]);

export const getStudentRefreshToken = async () =>
  getFirstAvailableToken([SESSION_KEYS.studentRefreshToken]);

export const getInvigilatorRefreshToken = async () =>
  getFirstAvailableToken([SESSION_KEYS.invigilatorRefreshToken]);

export const getBestAvailableAccessToken = async () => {
  const userType = await getSessionUserType();

  if (userType === "student") {
    return getFirstAvailableToken([
      SESSION_KEYS.studentToken,
      SESSION_KEYS.authToken,
      SESSION_KEYS.invigilatorToken,
      SESSION_KEYS.accessToken,
    ]);
  }

  if (userType === "invigilator") {
    return getFirstAvailableToken([
      SESSION_KEYS.authToken,
      SESSION_KEYS.invigilatorToken,
      SESSION_KEYS.accessToken,
      SESSION_KEYS.studentToken,
    ]);
  }

  return getFirstAvailableToken([
    SESSION_KEYS.authToken,
    SESSION_KEYS.invigilatorToken,
    SESSION_KEYS.studentToken,
    SESSION_KEYS.accessToken,
  ]);
};

export const setStudentSessionToken = async (token: string) => {
  await Promise.all([
    removeSessionToken(SESSION_KEYS.authToken),
    removeSessionToken(SESSION_KEYS.invigilatorToken),
    removeSessionToken(SESSION_KEYS.accessToken),
    removeSessionToken(SESSION_KEYS.invigilatorRefreshToken),
  ]);
  await setSessionToken(SESSION_KEYS.studentToken, token);
};

export const setInvigilatorSessionToken = async (token: string) => {
  await Promise.all([
    removeSessionToken(SESSION_KEYS.studentToken),
    removeSessionToken(SESSION_KEYS.accessToken),
    removeSessionToken(SESSION_KEYS.studentRefreshToken),
  ]);
  await Promise.all([
    setSessionToken(SESSION_KEYS.authToken, token),
    setSessionToken(SESSION_KEYS.invigilatorToken, token),
  ]);
};

export const setStudentRefreshToken = async (token: string) => {
  await setSessionToken(SESSION_KEYS.studentRefreshToken, token);
};

export const setInvigilatorRefreshToken = async (token: string) => {
  await setSessionToken(SESSION_KEYS.invigilatorRefreshToken, token);
};

export const clearStudentSessionStorage = async () => {
  await Promise.all([
    removeSessionToken(SESSION_KEYS.studentToken),
    removeSessionToken(SESSION_KEYS.studentRefreshToken),
    AsyncStorage.multiRemove([
      SESSION_KEYS.studentData,
      SESSION_KEYS.userType,
    ]),
  ]);
};

export const clearInvigilatorSessionStorage = async () => {
  await Promise.all([
    removeSessionToken(SESSION_KEYS.authToken),
    removeSessionToken(SESSION_KEYS.invigilatorToken),
    removeSessionToken(SESSION_KEYS.accessToken),
    removeSessionToken(SESSION_KEYS.invigilatorRefreshToken),
    AsyncStorage.multiRemove([
      SESSION_KEYS.userData,
      SESSION_KEYS.invigilatorData,
      SESSION_KEYS.userType,
    ]),
  ]);
};

export const clearAllSessionStorage = async () => {
  await Promise.all([
    ...TOKEN_KEYS.map((key) => removeSessionToken(key)),
    AsyncStorage.multiRemove([
      SESSION_KEYS.userType,
      SESSION_KEYS.userData,
      SESSION_KEYS.studentData,
      SESSION_KEYS.invigilatorData,
    ]),
  ]);
};
