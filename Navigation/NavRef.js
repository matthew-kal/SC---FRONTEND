import React from 'react';
import { CommonActions } from '@react-navigation/native';

export const navigationRef = React.createRef();

export const resetToLogin = () => {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    })
  );
};