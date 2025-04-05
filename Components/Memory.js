import * as SecureStore from 'expo-secure-store';

export const getSecureItem = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error retrieving ${key} from SecureStore:`, error);
    return null;
  }
};

export const saveSecureItem = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY, 
    });
  } catch (error) {
    console.error(`Error saving ${key} to SecureStore:`, error);
  }
};

export const deleteSecureItem = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error deleting ${key} from SecureStore:`, error);
  }
};