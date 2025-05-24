import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { BASE_URL } from '@env';
import { getSecureItem } from '../Components/Memory';

export async function registerForPushNotificationsAsync() {
    const accessToken = await getSecureItem('accessPatient');
    const refreshToken = await getSecureItem('refreshPatient');

  console.log("🔥 Inside `registerForPushNotificationsAsync`...");

  if (Device.isDevice) {
    console.log("📱 Running on a physical device...");

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      console.log("🔐 Requesting notification permissions...");
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('🚨 Permission for notifications was not granted.');
      return;
    }

    // Get the Expo push token
    console.log("🔍 Fetching Expo push token...");
    token = (await Notifications.getExpoPushTokenAsync()).data;

    if (!token) {
      console.log("❌ Push token is null or undefined.");
      return;
    }

    console.log('📲 Expo Push Token:', token);
    console.log("✅ Sending token to backend...");

    try {
      const response = await fetch(`${BASE_URL}/api/save-token/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, 
        },
        body: JSON.stringify({ pushToken: token }),
      });

      const responseData = await response.json();
      console.log("🛠️ Backend response:", responseData);

      if (!response.ok) {
        console.log("❌ Error saving push token:", responseData);
      }
    } catch (error) {
      console.log("❌ Network error while sending push token:", error);
    }
  } else {
    console.log('⚠️ Must use physical device for push notifications');
  }

  return token;
}