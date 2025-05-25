import React, { useContext } from 'react';
import { getSecureItem, clearTokens, saveSecureItem } from './Memory';
import { TokenContext } from './TokenContext';
import { BASE_URL } from '@env';
import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '../App';

const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.access;
  } catch (err) {
    console.error('[FetchWithAuth] Refresh token request failed:', err);
    return null;
  }
};

const rawFetch = (endpoint, token, options = {}) =>
  fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });


export const useFetchWithAuth = () => {
  const { userType, setUserType } = useContext(TokenContext);

  const fetchWithAuth = async (endpoint, options = {}) => {
    // Determine token storage keys based on userType
    const accessKey = userType === 'nurse' ? 'accessNurse' : 'accessPatient';
    const refreshKey = userType === 'nurse' ? 'refreshNurse' : 'refreshPatient';

    let accessToken = await getSecureItem(accessKey);
    const refreshToken = await getSecureItem(refreshKey);

    // No tokens → force logout
    if (!accessToken || !refreshToken) {
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

    if (response.status === 401) {
      console.log('[FetchWithAuth] Access token expired. Attempting refresh…');
      const newAccess = await refreshAccessToken(refreshToken);
      if (!newAccess) {
        await clearTokens();
        setUserType('');
        if (navigationRef.current) {
          navigationRef.current.dispatch(
          CommonActions.reset({ index:0, routes:[{name:'Login'}] })
            );
          }
        throw new Error('Session expired.');
      }
      // Persist refreshed access token under correct key
      await saveSecureItem(accessKey, newAccess);
      response = await rawFetch(endpoint, newAccess, options);
    }

    return response;
  };


  const getJSON = async (endpoint, options = {}) => {
    const res = await fetchWithAuth(endpoint, options);
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data?.detail || 'Request failed');
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  };

  return { fetchWithAuth, getJSON };
};