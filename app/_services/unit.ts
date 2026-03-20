import AsyncStorage from "@react-native-async-storage/async-storage";

const UNIT_STORAGE_KEY = "selectedUnit";

export interface Unit {
  code: string;
  name: string;
}

export const getStoredUnit = async (): Promise<Unit | null> => {
  try {
    const unitJson = await AsyncStorage.getItem(UNIT_STORAGE_KEY);
    if (unitJson) {
      return JSON.parse(unitJson);
    }
    return null;
  } catch (error) {
    console.error("Error getting stored unit:", error);
    return null;
  }
};

export const setStoredUnit = async (unit: Unit | null): Promise<void> => {
  try {
    if (unit) {
      await AsyncStorage.setItem(UNIT_STORAGE_KEY, JSON.stringify(unit));
    } else {
      await AsyncStorage.removeItem(UNIT_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error setting stored unit:", error);
  }
};

export const clearStoredUnit = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(UNIT_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing stored unit:", error);
  }
};
