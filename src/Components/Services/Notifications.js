import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants'; 
import { getSecureItem } from './Memory';

const BASE_URL =  'https://api.surgicalm.com' //'http://192.168.1.72:80'

export async function registerForPushNotificationsAsync() {
  console.log("🔥 [START] Entering `registerForPushNotificationsAsync` function...");

  // Fetch tokens immediately to log their presence
  const accessToken = await getSecureItem('accessPatient');
  const refreshToken = await getSecureItem('refreshPatient'); // refreshToken is fetched but not used in this function, consider if needed.
  console.log(`[Token Check] accessToken: ${accessToken ? 'PRESENT' : 'MISSING'}`);
  console.log(`[Token Check] refreshToken: ${refreshToken ? 'PRESENT' : 'MISSING'} (Note: not used in this function's logic)`);

  if (!accessToken) {
    console.warn("🚫 [Auth] Access token is missing. Cannot register for push notifications without authentication.");
    // Depending on your app's flow, you might want to force re-login here or return early.
    return;
  }

  if (Device.isDevice) {
    console.log("📱 [Device Check] Running on a physical device. Proceeding with permissions and token fetching.");

    // --- Step 1: Check and Request Permissions ---
    console.log("🔐 [Permissions] Checking existing notification permissions...");
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    console.log(`[Permissions] Existing status: '${existingStatus}'.`);

    if (existingStatus !== 'granted') {
      console.log("🔐 [Permissions] Existing status is not 'granted'. Requesting permissions now...");
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log(`[Permissions] Request result status: '${finalStatus}'.`);
      } catch (permissionError) {
        console.error("❌ [Permissions] Error requesting permissions:", permissionError);
        console.error("❌ [Permissions] Permission request failed. Cannot proceed.");
        return; // Exit if permission request itself fails
      }
    }

    if (finalStatus !== 'granted') {
      console.error('🚨 [Permissions] Final permission for notifications was not granted. Aborting registration.');
      return; // Exit if permissions are not granted
    }
    console.log("✅ [Permissions] Notification permissions granted.");

    // --- Step 2: Get Project ID ---
    console.log("⚙️ [Project ID] Attempting to retrieve Expo Project ID...");
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    if (!projectId) {
      console.error("❌ [Project ID] Project ID not found. Ensure app.json has `expo.extra.eas.projectId` or `eas.projectId`.");
      console.error("❌ [Project ID] Cannot fetch Expo push token without Project ID. Aborting registration.");
      return; // Exit if projectId is missing
    }
    console.log(`🔍 [Project ID] Successfully retrieved Project ID: '${projectId}'.`);

    // --- Step 3: Fetch Expo Push Token ---
    console.log(`📲 [Token Fetch] Attempting to fetch Expo push token for project: '${projectId}'...`);
    let tokenData = null;
    try {
      tokenData = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      console.log(`📲 [Token Fetch] Raw token data received: ${tokenData ? 'PRESENT' : 'MISSING'}.`);
    } catch (tokenError) {
      console.error("❌ [Token Fetch] Error fetching Expo push token:", tokenError);
      console.error("❌ [Token Fetch] Failed to fetch Expo push token. Aborting registration.");
      return; // Exit if token fetching fails
    }

    if (!tokenData) {
      console.error("❌ [Token Fetch] Expo Push Token is null or undefined after fetching. Aborting registration.");
      return; // Exit if token is empty
    }
    console.log('✅ [Token Fetch] Expo Push Token successfully fetched:', tokenData);

    // --- Step 4: Send Token to Backend ---
    console.log("🚀 [Backend Send] Attempting to send token to backend API...");
    const backendApiUrl = `${BASE_URL}/users/api/save-token/`;
    console.log(`[Backend Send] Backend API URL: ${backendApiUrl}`);
    console.log(`[Backend Send] Sending pushToken: ${tokenData} to backend.`);

    try {
      const response = await fetch(backendApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ pushToken: tokenData }),
      });

      const responseText = await response.text(); 
      let responseData = {};
      try {
        responseData = JSON.parse(responseText); 
        console.log("🛠️ [Backend Send] Parsed JSON backend response:", responseData);
      } catch (jsonParseError) {
        console.warn("⚠️ [Backend Send] Backend response was not valid JSON. Raw text response:", responseText);
        responseData = { detail: "Invalid JSON response from backend", raw: responseText };
      }
      
      console.log(`[Backend Send] Backend HTTP Status: ${response.status} (OK: ${response.ok})`);

      if (!response.ok) {
        console.error("❌ [Backend Send] Backend reported an error (response not OK). Details:", responseData);
        console.error(`[Backend Send] Full response object for error:`, response);
        // You might throw an error here or handle it based on your app's needs
      } else {
        console.log("✅ [Backend Send] Push token successfully sent and saved on backend.");
      }
    } catch (networkError) {
      console.error("❌ [Backend Send] Network error while sending push token to backend:", networkError);
      console.error("❌ [Backend Send] This could be due to: CORS, DNS, server down, or invalid BASE_URL.");
    }
  } else {
    console.warn('⚠️ [Device Check] Not running on a physical device. Push notifications are not supported in simulators/emulators.');
    console.warn('⚠️ [Device Check] Aborting registration as `Device.isDevice` is false.');
  }

  console.log("🔥 [END] Exiting `registerForPushNotificationsAsync` function.");
}