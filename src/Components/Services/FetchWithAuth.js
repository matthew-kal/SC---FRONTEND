import React, { useContext, Alert } from 'react';
import { getSecureItem, clearTokens, saveSecureItem } from './Memory';
import { TokenContext } from './TokenContext';
import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '../../Navigation/NavRef';
import { BASE_URL } from './apiConfig'; 

const refreshAccessToken = async (refreshToken) => {
  console.log('[refreshAccessToken] Function called.');
  console.log(`[refreshAccessToken] Received refreshToken: ${refreshToken ? 'YES' : 'NO (null/undefined)'}`);
  
  try {
    const refreshUrl = `${BASE_URL}/api/token/refresh/`;
    console.log(`[refreshAccessToken] Refresh URL formed: ${refreshUrl}`);

    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    console.log(`[refreshAccessToken] Refresh token response status: ${response.status}`);
    if (!response.ok) {
      console.error(`[refreshAccessToken] Refresh token request failed with status: ${response.status}`);
      const errorText = await response.text();
      console.error(`[refreshAccessToken] Refresh token error response body: ${errorText}`);
      return null;
    }
    const data = await response.json();
    console.log('[refreshAccessToken] Refresh token response data received.');
    return data; 
  } catch (err) {
    console.error('[FetchWithAuth] Refresh token request failed:', err);
    return null;
  }
};

const rawFetch = (endpoint, token, options = {}) => {
  console.log('[rawFetch] Function called.');
  console.log(`[rawFetch] Received endpoint: ${endpoint}`);
  console.log(`[rawFetch] Token provided: ${token ? 'YES' : 'NO (null/undefined)'}`);

  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log(`[rawFetch] Full URL formed: ${fullUrl}`);

  return fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
};


export const useFetchWithAuth = () => {
  const { userType, setUserType } = useContext(TokenContext);

  const fetchWithAuth = async (endpoint, options = {}) => {
    console.log(`[fetchWithAuth] API call initiated for endpoint: ${endpoint}`);
    console.log(`[fetchWithAuth] Options provided: ${JSON.stringify(options)}`);
    
    const accessKey = userType === 'nurse' ? 'accessNurse' : 'accessPatient';
    const refreshKey = userType === 'nurse' ? 'refreshNurse' : 'refreshPatient';
    console.log(`[fetchWithAuth] Using accessKey: ${accessKey}, refreshKey: ${refreshKey}`);

    let accessToken = await getSecureItem(accessKey);
    const refreshToken = await getSecureItem(refreshKey);
    console.log(`[fetchWithAuth] Retrieved accessToken: ${accessToken ? 'YES' : 'NO (null/undefined)'}`);
    console.log(`[fetchWithAuth] Retrieved refreshToken: ${refreshToken ? 'YES' : 'NO (null/undefined)'}`);

    if (!accessToken || !refreshToken) {
      console.warn('[fetchWithAuth] No authentication tokens found. Forcing logout.');
      await clearTokens();
      setUserType('');
      navigationRef.current?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
      throw new Error('No authentication tokens found.');
    }

    let response = await rawFetch(endpoint, accessToken, options);
    console.log(`[fetchWithAuth] Initial rawFetch response status: ${response.status}`);

    if (response.status === 401) {
      console.log('[fetchWithAuth] Access token expired (401). Attempting refresh…');
      const tokenData = await refreshAccessToken(refreshToken);
      if (!tokenData || !tokenData.access) {
        console.error('[fetchWithAuth] Failed to refresh access token. Forcing logout.');
        await clearTokens();
        setUserType('');
        Alert.alert('Session expired.', 'Please log in again.');
        if (navigationRef.current) {
          navigationRef.current.dispatch(
          CommonActions.reset({ index:0, routes:[{name:'Login'}] })
            );
          }
        throw new Error('Session expired.');
      }
      console.log('[fetchWithAuth] Access token refreshed successfully. Retrying original request.');
      await saveSecureItem(accessKey, tokenData.access);
      if (tokenData.refresh) {
        await saveSecureItem(refreshKey, tokenData.refresh);
        console.log('[fetchWithAuth] Updated refresh token due to rotation');
      }
      response = await rawFetch(endpoint, tokenData.access, options);
      console.log(`[fetchWithAuth] Retried rawFetch response status: ${response.status}`);
    }

    return response;
  };


  const getJSON = async (endpoint, options = {}) => {
    console.log(`[getJSON] Fetching JSON for endpoint: ${endpoint}`);
    const res = await fetchWithAuth(endpoint, options);
    console.log(`[getJSON] fetchWithAuth returned. Response status: ${res.status}, ok: ${res.ok}`);

    const data = await res.json();
    console.log(`[getJSON] Parsed JSON data (first 5000 chars): ${JSON.stringify(data).substring(0,5000)}...`);

    if (!res.ok) {
      console.error(`[getJSON] Request failed. Status: ${res.status}. Details:`, data);
      const err = new Error(data?.detail || 'Request failed');
      err.status = res.status;
      err.body = data;
      throw err;
    }
    console.log(`[getJSON] Request successful for endpoint: ${endpoint}`);
    return data;
  };

  return { fetchWithAuth, getJSON };
};