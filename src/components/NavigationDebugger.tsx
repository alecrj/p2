import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface Route {
  name: string;
  path: string;
  description: string;
  type: 'tab' | 'screen' | 'modal';
}

const routes: Route[] = [
  // Tab routes
  { name: 'Home', path: '/(tabs)', type: 'tab', description: 'Main dashboard' },
  { name: 'Draw', path: '/(tabs)/draw', type: 'tab', description: 'Drawing canvas' },
  { name: 'Learn', path: '/(tabs)/learn', type: 'tab', description: 'Skill trees and lessons' },
  { name: 'Gallery', path: '/(tabs)/gallery', type: 'tab', description: 'Community gallery' },
  { name: 'Profile', path: '/(tabs)/profile', type: 'tab', description: 'User profile' },
  
  // Screen routes
  { name: 'Onboarding', path: '/onboarding', type: 'screen', description: 'User onboarding' },
  { name: 'Settings', path: '/settings', type: 'modal', description: 'App settings' },
  { name: 'Lesson (Test)', path: '/lesson/test-lesson-1', type: 'modal', description: 'Sample lesson' },
  { name: 'Drawing (Test)', path: '/drawing/test-drawing-1', type: 'modal', description: 'Full screen drawing' },
  { name: 'User Profile (Test)', path: '/profile/test-user-1', type: 'modal', description: 'View user profile' },
];

export function NavigationDebugger({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { colors, spacing, borderRadius } = useTheme();

  const handleNavigation = (route: Route) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log(`🧭 Navigating to: ${route.path}`);
      
      switch (route.type) {
        case 'tab':
          router.push(route.path as any);
          break;
        case 'screen':
          router.push(route.path);
          break;
        case 'modal':
          router.push(route.path);
          break;
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error(`❌ Navigation error for ${route.path}:`, error);
      Alert.alert(
        'Navigation Error',
        `Failed to navigate to ${route.name}: ${error}`,
        [{ text: 'OK' }]
      );
    }
  };

  const getRouteTypeColor = (type: Route['type']) => {
    switch (type) {
      case 'tab':
        return colors.primary;
      case 'screen':
        return colors.success;
      case 'modal':
        return colors.warning;
      default:
        return colors.text;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Navigation Debugger
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Test all app routes
        </Text>
      </View>

      {/* Current Route Info */}
      <View style={[styles.currentInfo, { backgroundColor: colors.surface }]}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
          Current Segments:
        </Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>
          {segments.join(' → ') || 'Root'}
        </Text>
        
        <Text style={[styles.infoLabel, { color: colors.textSecondary, marginTop: 8 }]}>
          Navigation State:
        </Text>
        <Text style={[styles.infoValue, { color: colors.text, fontSize: 12 }]}>
          {JSON.stringify(navigationState?.key || 'Unknown', null, 2)}
        </Text>
      </View>

      {/* Route List */}
      <ScrollView style={styles.routeList} showsVerticalScrollIndicator={false}>
        {routes.map((route, index) => (
          <Pressable
            key={route.path}
            style={({ pressed }) => [
              styles.routeItem,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => handleNavigation(route)}
          >
            <View style={styles.routeContent}>
              <View style={styles.routeHeader}>
                <Text style={[styles.routeName, { color: colors.text }]}>
                  {route.name}
                </Text>
                <View
                  style={[
                    styles.routeTypeBadge,
                    { backgroundColor: getRouteTypeColor(route.type) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.routeType,
                      { color: getRouteTypeColor(route.type) },
                    ]}
                  >
                    {route.type.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.routePath, { color: colors.primary }]}>
                {route.path}
              </Text>
              
              <Text style={[styles.routeDescription, { color: colors.textSecondary }]}>
                {route.description}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Debug Actions */}
      <View style={[styles.actions, { borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={() => {
            console.log('🧭 Navigation Debug Info:', {
              segments,
              navigationState,
              router,
            });
            Alert.alert('Debug Info Logged', 'Check console for navigation details');
          }}
        >
          <Text style={styles.actionButtonText}>Log Debug Info</Text>
        </Pressable>
        
        {onClose && (
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: colors.border,
                opacity: pressed ? 0.8 : 1,
                marginLeft: spacing.sm,
              },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Close
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  currentInfo: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  routeList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  routeItem: {
    marginBottom: 12,
    padding: 16,
  },
  routeContent: {
    gap: 8,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  routeTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  routeType: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  routePath: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  routeDescription: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});