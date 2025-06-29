import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { UserProgressProvider } from '../src/contexts/UserProgressContext';
import { LearningProvider } from '../src/contexts/LearningContext';

export default function RootLayout() {
  console.log('🐛 RootLayout with Theme + UserProgress + Learning');
  
  return (
    <ThemeProvider>
      <UserProgressProvider>
        <LearningProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </LearningProvider>
      </UserProgressProvider>
    </ThemeProvider>
  );
}
