import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useColorScheme, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme type definitions
export interface Theme {
  name: 'light' | 'dark';
  colors: {
    // Primary colors
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    secondaryDark: string;
    secondaryLight: string;
    
    // Base colors
    background: string;
    backgroundSecondary: string; // FIXED: Added missing color
    surface: string;
    surfaceVariant: string;
    
    // Text colors
    text: string;
    textSecondary: string;
    textDisabled: string;
    
    // UI colors
    border: string;
    divider: string;
    overlay: string;
    
    // Semantic colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Drawing specific colors
    canvas: string;
    canvasGrid: string;
    brushPreview: string;
    selectionStroke: string;
    selectionFill: string;
  };
  
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  
  shadows: {
    sm: any;
    md: any;
    lg: any;
    xl: any;
  };
}

const lightTheme: Theme = {
  name: 'light',
  colors: {
    // Primary colors
    primary: '#6366F1',
    primaryDark: '#4338CA',
    primaryLight: '#818CF8',
    secondary: '#EC4899',
    secondaryDark: '#DB2777',
    secondaryLight: '#F472B6',
    
    // Base colors
    background: '#FFFFFF',
    backgroundSecondary: '#FAFBFC', // FIXED: Added professional light background variant
    surface: '#F9FAFB',
    surfaceVariant: '#F3F4F6',
    
    // Text colors
    text: '#111827',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    
    // UI colors
    border: '#E5E7EB',
    divider: '#D1D5DB',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Semantic colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Drawing specific colors
    canvas: '#FFFFFF',
    canvasGrid: 'rgba(0, 0, 0, 0.05)',
    brushPreview: 'rgba(99, 102, 241, 0.3)',
    selectionStroke: '#6366F1',
    selectionFill: 'rgba(99, 102, 241, 0.1)',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

const darkTheme: Theme = {
  name: 'dark',
  colors: {
    // Primary colors
    primary: '#818CF8',
    primaryDark: '#6366F1',
    primaryLight: '#A5B4FC',
    secondary: '#F472B6',
    secondaryDark: '#EC4899',
    secondaryLight: '#F9A8D4',
    
    // Base colors
    background: '#0F172A',
    backgroundSecondary: '#0A1628', // FIXED: Added professional dark background variant
    surface: '#1E293B',
    surfaceVariant: '#334155',
    
    // Text colors
    text: '#F9FAFB',
    textSecondary: '#94A3B8',
    textDisabled: '#64748B',
    
    // UI colors
    border: '#334155',
    divider: '#475569',
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // Semantic colors
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    
    // Drawing specific colors
    canvas: '#1E293B',
    canvasGrid: 'rgba(255, 255, 255, 0.05)',
    brushPreview: 'rgba(129, 140, 248, 0.3)',
    selectionStroke: '#818CF8',
    selectionFill: 'rgba(129, 140, 248, 0.1)',
  },
  
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

interface ThemeContextValue {
  theme: Theme;
  colors: Theme['colors'];
  spacing: Theme['spacing'];
  borderRadius: Theme['borderRadius'];
  shadows: Theme['shadows'];
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  themeMode: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>('system');
  const [theme, setTheme] = useState<Theme>(lightTheme);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update theme when mode or system theme changes
  useEffect(() => {
    updateTheme();
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedThemeMode = await AsyncStorage.getItem('@pikaso_theme_mode');
      if (savedThemeMode && ['light', 'dark', 'system'].includes(savedThemeMode)) {
        setThemeModeState(savedThemeMode as 'light' | 'dark' | 'system');
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const updateTheme = () => {
    let selectedTheme: Theme;
    
    if (themeMode === 'system') {
      selectedTheme = systemColorScheme === 'dark' ? darkTheme : lightTheme;
    } else {
      selectedTheme = themeMode === 'dark' ? darkTheme : lightTheme;
    }
    
    setTheme(selectedTheme);
  };

  const toggleTheme = async () => {
    const newMode = theme.name === 'light' ? 'dark' : 'light';
    setThemeModeState(newMode);
    
    try {
      await AsyncStorage.setItem('@pikaso_theme_mode', newMode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const setThemeMode = async (mode: 'light' | 'dark' | 'system') => {
    setThemeModeState(mode);
    
    try {
      await AsyncStorage.setItem('@pikaso_theme_mode', mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    colors: theme.colors,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    shadows: theme.shadows,
    isDark: theme.name === 'dark',
    toggleTheme,
    setThemeMode,
    themeMode,
  }), [theme, themeMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Export additional theme utilities
export const getTheme = (mode: 'light' | 'dark'): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

// Re-export for backward compatibility
export default ThemeProvider;