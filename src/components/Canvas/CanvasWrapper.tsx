// src/components/CanvasWrapper.tsx
import React from 'react';
import { Platform, View } from 'react-native';

export const CanvasWrapper = ({ children, ...props }: any) => {
  if (Platform.OS === 'web') {
    return <div {...props}>{children}</div>;
  }
  return <View {...props}>{children}</View>;
};