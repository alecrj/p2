import 'react-native-gesture-handler';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { UserProgressProvider } from './src/contexts/UserProgressContext';
import { LearningProvider } from './src/contexts/LearningContext';
import { DrawingProvider } from './src/contexts/DrawingContext';
import { startupSequence } from './src/engines/core';

export default function App() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing Pikaso Core Systems...');
        const result = await startupSequence({
          environment: __DEV__ ? 'development' : 'production',
          enableAdvancedFeatures: true,
        });
        
        if (result.success) {
          console.log('✅ Pikaso initialization successful');
        } else {
          console.error('❌ Pikaso initialization failed:', result.errors);
        }
      } catch (error) {
        console.error('❌ App initialization error:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <ThemeProvider>
      <UserProgressProvider>
        <LearningProvider>
          <DrawingProvider>
            <Slot />
          </DrawingProvider>
        </LearningProvider>
      </UserProgressProvider>
    </ThemeProvider>
  );
}
