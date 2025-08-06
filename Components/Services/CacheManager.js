// In Components/CacheManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'assorted_'; // Use the prefix we established
const GLOBAL_TIMESTAMP_KEY = 'lastContentRefreshTimestamp';
const TTL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

const isCacheStale = async () => {
  try {
    const timestampString = await AsyncStorage.getItem(GLOBAL_TIMESTAMP_KEY);
    if (!timestampString) return true;
    const timestamp = JSON.parse(timestampString);
    return Date.now() - timestamp > TTL;
  } catch (error) {
    console.error('[CacheManager] Error checking cache staleness:', error);
    return true;
  }
};

const bustAndResetCache = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToRemove = allKeys.filter(key => key.startsWith(CACHE_PREFIX));

    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }

    await AsyncStorage.setItem(GLOBAL_TIMESTAMP_KEY, JSON.stringify(Date.now()));
    console.log('[CacheManager] Content cache busted and timer has been reset.');
  } catch (error) {
    console.error('[CacheManager] Error busting and resetting cache:', error);
  }
};

const get = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value).data : null;
  } catch (error) {
    console.error(`[CacheManager] Error getting item with key "${key}":`, error);
    return null;
  }
};

const set = async (key, value) => {
  const item = { data: value, timestamp: Date.now() };
  try {
    await AsyncStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`[CacheManager] Error setting item with key "${key}":`, error);
  }
};

export default { get, set, isCacheStale, bustAndResetCache };
