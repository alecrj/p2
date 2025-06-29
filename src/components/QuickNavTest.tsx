import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

// Minimal navigation test component - add to any screen to test navigation
export function QuickNavTest() {
  const router = useRouter();

  const testRoutes = [
    { label: 'Home', path: '/(tabs)', color: '#6366F1' },
    { label: 'Draw', path: '/(tabs)/draw', color: '#EC4899' },
    { label: 'Learn', path: '/(tabs)/learn', color: '#10B981' },
    { label: 'Gallery', path: '/(tabs)/gallery', color: '#F59E0B' },
    { label: 'Profile', path: '/(tabs)/profile', color: '#8B5CF6' },
    { label: 'Settings', path: '/settings', color: '#6B7280' },
    { label: 'Onboarding', path: '/onboarding', color: '#3B82F6' },
  ];

  const navigate = (path: string, label: string) => {
    try {
      console.log(`🧭 QuickNav: Navigating to ${label} (${path})`);
      router.push(path as any);
    } catch (error) {
      console.error(`❌ QuickNav: Failed to navigate to ${label}:`, error);
      Alert.alert('Navigation Error', `Failed to navigate to ${label}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Navigation Test</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {testRoutes.map((route) => (
          <Pressable
            key={route.path}
            style={[styles.button, { backgroundColor: route.color }]}
            onPress={() => navigate(route.path, route.label)}
          >
            <Text style={styles.buttonText}>{route.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// Usage: Import and add <QuickNavTest /> to any screen to test navigation

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});