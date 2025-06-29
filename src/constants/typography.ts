import { TextStyle } from 'react-native';

/**
 * Typography system for consistent text styling
 * FIXED: Uses proper React Native TextStyle fontWeight values
 */

export interface TypographyVariant {
  fontSize: number;
  fontWeight: TextStyle['fontWeight'];
  lineHeight?: number;
  letterSpacing?: number;
}

export const typography: Record<string, TypographyVariant> = {
  h1: {
    fontSize: 32,
    fontWeight: '700', // FIXED: Use proper React Native fontWeight
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600', // FIXED: Use proper React Native fontWeight
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600', // FIXED: Use proper React Native fontWeight
    lineHeight: 28,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 18,
    fontWeight: '500', // FIXED: Use proper React Native fontWeight
    lineHeight: 24,
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  button: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
};

// Helper function to create text styles
export const createTextStyle = (variant: keyof typeof typography): TextStyle => {
  return typography[variant];
};

// Common text style combinations
export const textStyles = {
  title: typography.h2,
  subtitle: typography.h4,
  body: typography.body,
  label: typography.bodySmall,
  caption: typography.caption,
  button: typography.button,
};

export default typography;