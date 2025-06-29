// Fixed src/contexts/UserProgressContext.tsx - COMPLETE FIXED VERSION
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { errorHandler } from '../engines/core/ErrorHandler';
import { EventBus } from '../engines/core/EventBus';

// Storage keys for persistence
const STORAGE_KEYS = {
  USER_PROFILE: '@pikaso_user_profile',
  USER_PROGRESS: '@pikaso_user_progress',
  USER_ACHIEVEMENTS: '@pikaso_user_achievements',
  USER_PORTFOLIO: '@pikaso_user_portfolio',
  USER_STREAKS: '@pikaso_user_streaks',
  USER_SETTINGS: '@pikaso_user_settings',
} as const;

// User profile and skill level definitions
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  id: string;
  email?: string;
  displayName: string;
  avatar?: string;
  skillLevel: SkillLevel;
  joinedDate: string;
  lastActiveDate: string;
  learningGoals?: string[]; // Added for onboarding compatibility
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    autoSave: boolean;
    hapticFeedback: boolean;
  };
}

// Progress tracking interfaces
export interface UserProgress {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  completedLessons: string[];
  skillProgress: Record<string, number>; // skill -> progress percentage
  totalDrawingTime: number; // in minutes
  artworksCreated: number;
  streakData: StreakData;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakGoal: number;
  weeklyGoal: number;
  completedThisWeek: number;
}

export interface Achievement {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  category: 'learning' | 'creation' | 'social' | 'streak' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  imageUri: string;
  createdAt: number;
  lessonId?: string;
  challengeId?: string;
  tags: string[];
  isPublic: boolean;
  likes: number;
  viewCount: number;
  stats: {
    likes: number;
    views: number;
    comments: number;
    shares: number;
  };
  metadata: {
    timeSpent: number; // in minutes
    toolsUsed: string[];
    skillsApplied: string[];
  };
  visibility: 'public' | 'private';
  featured: boolean;
}

export interface LearningStats {
  lessonsCompleted: number;
  totalStudyTime: number; // in minutes
  averageSessionLength: number;
  strongestSkills: string[];
  improvementAreas: string[];
  weeklyProgress: number[];
  monthlyProgress: number[];
}

// Legacy progress interface for backward compatibility
export interface Progress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  xpProgress: number;
  streakDays: number;
  achievements: Achievement[];
}

// Context type definition - matching component expectations
export interface UserProgressContextType {
  // User Profile (using "user" as expected by components)
  user: User | null;
  userProfile: User | null; // alias for compatibility
  updateProfile: (updates: Partial<User>) => Promise<void>;
  setSkillLevel: (level: SkillLevel) => Promise<void>;
  createUser: (userData: Partial<User> & { skillLevel: SkillLevel }) => Promise<void>;

  // Progress & XP
  userProgress: UserProgress | null;
  progress: Progress | null; // Legacy format expected by components
  addXP: (amount: number, source?: string) => Promise<void>; // Optional source for compatibility
  getCurrentLevel: () => number;
  getXPProgress: () => { current: number; required: number; percentage: number };
  
  // Legacy progress properties for backward compatibility
  level: number;
  xp: number;
  xpToNextLevel: number;
  xpProgress: number;
  streakDays: number;
  
  // Achievements
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  checkAndUnlockAchievements: (action: string, data?: any) => Promise<Achievement[]>;
  
  // Portfolio
  portfolio: PortfolioItem[];
  addToPortfolio: (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => Promise<void>;
  updatePortfolioItem: (id: string, updates: Partial<PortfolioItem>) => Promise<void>;
  deletePortfolioItem: (id: string) => Promise<void>;
  
  // Streaks & Habits
  streakData: StreakData;
  recordActivity: (activityType: string) => Promise<void>;
  updateStreakGoal: (goal: number) => Promise<void>;
  getDailyGoalProgress: () => number;
  checkDailyStreak: () => Promise<void>;
  
  // Statistics & Learning
  learningStats: LearningStats;
  updateDrawingTime: (minutes: number) => Promise<void>;
  recordLessonCompletion: (lessonId: string, timeSpent: number) => Promise<void>;
  updateLearningStats: (category: string, data: any) => Promise<void>;
  
  // Settings & Preferences
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  
  // State
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  reset: () => Promise<void>;
  exportData: () => Promise<string>;
}

// Default values
const createDefaultUser = (): User => ({
  id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  displayName: 'Artist',
  skillLevel: 'beginner',
  joinedDate: new Date().toISOString(),
  lastActiveDate: new Date().toISOString(),
  preferences: {
    notifications: true,
    darkMode: false,
    autoSave: true,
    hapticFeedback: true,
  },
});

const createDefaultProgress = (): UserProgress => ({
  totalXP: 0,
  currentLevel: 1,
  xpToNextLevel: 100,
  completedLessons: [],
  skillProgress: {},
  totalDrawingTime: 0,
  artworksCreated: 0,
  streakData: {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    streakGoal: 7,
    weeklyGoal: 5,
    completedThisWeek: 0,
  },
});

const createDefaultLearningStats = (): LearningStats => ({
  lessonsCompleted: 0,
  totalStudyTime: 0,
  averageSessionLength: 0,
  strongestSkills: [],
  improvementAreas: [],
  weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  monthlyProgress: Array(30).fill(0),
});

// XP calculation constants
const XP_CONSTANTS = {
  BASE_LEVEL_XP: 100,
  LEVEL_MULTIPLIER: 1.5,
  MAX_LEVEL: 100,
} as const;

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: 'first_lesson',
    name: 'First Steps',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    progress: 0,
    maxProgress: 1,
    category: 'learning',
    rarity: 'common',
    xpReward: 50,
  },
  {
    id: 'lesson_streak_7',
    name: 'Weekly Warrior',
    title: 'Weekly Warrior',
    description: 'Complete lessons for 7 days in a row',
    icon: '🔥',
    progress: 0,
    maxProgress: 7,
    category: 'streak',
    rarity: 'rare',
    xpReward: 200,
  },
  {
    id: 'first_artwork',
    name: 'First Creation',
    title: 'First Creation',
    description: 'Create and save your first artwork',
    icon: '🎨',
    progress: 0,
    maxProgress: 1,
    category: 'creation',
    rarity: 'common',
    xpReward: 75,
  },
  {
    id: 'level_10',
    name: 'Rising Artist',
    title: 'Rising Artist',
    description: 'Reach level 10',
    icon: '⭐',
    progress: 0,
    maxProgress: 10,
    category: 'milestone',
    rarity: 'epic',
    xpReward: 500,
  },
  {
    id: 'drawing_time_60',
    name: 'Dedicated Artist',
    title: 'Dedicated Artist',
    description: 'Spend 60 minutes drawing',
    icon: '⏰',
    progress: 0,
    maxProgress: 60,
    category: 'creation',
    rarity: 'rare',
    xpReward: 300,
  },
];

// Context creation
const UserProgressContext = createContext<UserProgressContextType | null>(null);

export function UserProgressProvider({ children }: { children: ReactNode }) {
  const eventBus = EventBus.getInstance();
  
  // State
  const [user, setUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENT_DEFINITIONS);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [learningStats, setLearningStats] = useState<LearningStats>(createDefaultLearningStats());
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs for optimization
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate XP required for level
  const calculateXPForLevel = useCallback((level: number): number => {
    if (level <= 1) return 0;
    return Math.floor(XP_CONSTANTS.BASE_LEVEL_XP * Math.pow(XP_CONSTANTS.LEVEL_MULTIPLIER, level - 1));
  }, []);
  
  // Calculate current level from total XP
  const calculateLevelFromXP = useCallback((totalXP: number): number => {
    let level = 1;
    let requiredXP = 0;
    
    while (level < XP_CONSTANTS.MAX_LEVEL) {
      const nextLevelXP = calculateXPForLevel(level + 1);
      if (totalXP < nextLevelXP) break;
      level++;
      requiredXP = nextLevelXP;
    }
    
    return level;
  }, [calculateXPForLevel]);

  // Derived values
  const unlockedAchievements = useMemo(() => 
    achievements.filter(achievement => achievement.unlockedAt)
  , [achievements]);

  const streakData = useMemo(() => 
    userProgress?.streakData || createDefaultProgress().streakData
  , [userProgress]);

  // Legacy progress format for backward compatibility
  const progress = useMemo((): Progress | null => {
    if (!userProgress) return null;
    
    const currentLevelXP = calculateXPForLevel(userProgress.currentLevel);
    const nextLevelXP = calculateXPForLevel(userProgress.currentLevel + 1);
    const currentProgress = userProgress.totalXP - currentLevelXP;
    const requiredProgress = nextLevelXP - currentLevelXP;
    
    return {
      level: userProgress.currentLevel,
      xp: userProgress.totalXP,
      xpToNextLevel: userProgress.xpToNextLevel,
      xpProgress: requiredProgress > 0 ? currentProgress / requiredProgress : 1,
      streakDays: userProgress.streakData.currentStreak,
      achievements: unlockedAchievements,
    };
  }, [userProgress, unlockedAchievements, calculateXPForLevel]);

  // Individual legacy properties
  const level = useMemo(() => progress?.level || 1, [progress]);
  const xp = useMemo(() => progress?.xp || 0, [progress]);
  const xpToNextLevel = useMemo(() => progress?.xpToNextLevel || 100, [progress]);
  const xpProgress = useMemo(() => progress?.xpProgress || 0, [progress]);
  const streakDays = useMemo(() => progress?.streakDays || 0, [progress]);

  // FIXED: Storage operations with proper error handling
  const saveToStorage = useCallback(async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      errorHandler.handleError(
        errorHandler.createError('STORAGE_SAVE_ERROR', `Failed to save ${key}`, 'medium', { 
          error: error instanceof Error ? error.message : String(error),
          key,
          timestamp: Date.now()
        })
      );
    }
  }, []);

  const loadFromStorage = useCallback(async (key: string): Promise<any | null> => {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
      return null;
    }
  }, []);

  // Debounced save function
  const debouncedSave = useCallback((key: string, data: any) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage(key, data);
    }, 1000);
  }, [saveToStorage]);

  // FIXED: Initialize user data with proper error handling
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🚀 Initializing user progress system...');

      // Load user profile
      let userData = await loadFromStorage(STORAGE_KEYS.USER_PROFILE);
      if (userData) {
        setUser(userData);
      }

      // Load user progress
      let progressData = await loadFromStorage(STORAGE_KEYS.USER_PROGRESS);
      if (progressData) {
        setUserProgress(progressData);
      }

      // Load achievements
      const savedAchievements = await loadFromStorage(STORAGE_KEYS.USER_ACHIEVEMENTS);
      if (savedAchievements) {
        setAchievements(savedAchievements);
      }

      // Load portfolio
      const savedPortfolio = await loadFromStorage(STORAGE_KEYS.USER_PORTFOLIO);
      if (savedPortfolio) {
        setPortfolio(savedPortfolio);
      }

      // Load learning stats
      const savedLearningStats = await loadFromStorage('learning_stats');
      if (savedLearningStats) {
        setLearningStats(savedLearningStats);
      }

      setIsInitialized(true);
      console.log('✅ User progress system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize user progress:', error);
      errorHandler.handleError(
        errorHandler.createError('USER_INIT_ERROR', 'Failed to initialize user progress', 'high', {
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now()
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [loadFromStorage]);

  // Create user
  const createUser = useCallback(async (userData: Partial<User> & { skillLevel: SkillLevel, learningGoals?: string[] }) => {
    try {
      const newUser = {
        ...createDefaultUser(),
        ...userData,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        joinedDate: new Date().toISOString(),
        lastActiveDate: new Date().toISOString(),
      };

      const newProgress = createDefaultProgress();
      const newStats = createDefaultLearningStats();

      await saveToStorage(STORAGE_KEYS.USER_PROFILE, newUser);
      await saveToStorage(STORAGE_KEYS.USER_PROGRESS, newProgress);
      await saveToStorage('learning_stats', newStats);

      setUser(newUser);
      setUserProgress(newProgress);
      setLearningStats(newStats);

      eventBus.emit('user:created', { user: newUser });
      console.log('✅ User created successfully:', newUser.displayName);
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  }, [saveToStorage]);

  // Profile management
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates, lastActiveDate: new Date().toISOString() };
    setUser(updatedUser);
    debouncedSave(STORAGE_KEYS.USER_PROFILE, updatedUser);
    
    eventBus.emit('user:profile_updated', { profile: updatedUser });
  }, [user, debouncedSave]);

  const setSkillLevel = useCallback(async (skillLevel: SkillLevel) => {
    await updateProfile({ skillLevel });
    eventBus.emit('user:skill_level_changed', { level: skillLevel });
  }, [updateProfile]);

  // XP and level management
  const addXP = useCallback(async (amount: number, source: string = 'general') => {
    if (!userProgress) return;

    const newTotalXP = userProgress.totalXP + amount;
    const newLevel = calculateLevelFromXP(newTotalXP);
    const nextLevelXP = calculateXPForLevel(newLevel + 1);
    
    const updatedProgress = {
      ...userProgress,
      totalXP: newTotalXP,
      currentLevel: newLevel,
      xpToNextLevel: nextLevelXP - newTotalXP,
    };

    setUserProgress(updatedProgress);
    debouncedSave(STORAGE_KEYS.USER_PROGRESS, updatedProgress);

    // Check for level up
    if (newLevel > userProgress.currentLevel) {
      eventBus.emit('user:level_up', { oldLevel: userProgress.currentLevel, newLevel, xpGained: amount });
    }

    eventBus.emit('user:xp_gained', { amount, source, totalXP: newTotalXP });
    console.log(`🎯 XP gained: +${amount} from ${source} (Total: ${newTotalXP})`);
  }, [userProgress, calculateLevelFromXP, calculateXPForLevel, debouncedSave]);

  const getCurrentLevel = useCallback(() => {
    return userProgress?.currentLevel || 1;
  }, [userProgress]);

  const getXPProgress = useCallback(() => {
    if (!userProgress) {
      return { current: 0, required: 100, percentage: 0 };
    }

    const currentLevelXP = calculateXPForLevel(userProgress.currentLevel);
    const nextLevelXP = calculateXPForLevel(userProgress.currentLevel + 1);
    const current = userProgress.totalXP - currentLevelXP;
    const required = nextLevelXP - currentLevelXP;
    const percentage = required > 0 ? (current / required) * 100 : 100;

    return { current, required, percentage };
  }, [userProgress, calculateXPForLevel]);

  // Daily goal and streak management
  const getDailyGoalProgress = useCallback(() => {
    if (!userProgress || !learningStats) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const todayIndex = new Date().getDay();
    const todayProgress = learningStats.weeklyProgress[todayIndex] || 0;
    const dailyGoal = userProgress.streakData.weeklyGoal / 7; // Convert weekly to daily
    
    return Math.min(100, (todayProgress / Math.max(1, dailyGoal)) * 100);
  }, [userProgress, learningStats]);

  const checkDailyStreak = useCallback(async () => {
    if (!userProgress) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivityDate = userProgress.streakData.lastActivityDate?.split('T')[0];
    
    if (lastActivityDate !== today) {
      // Could update streak here if needed
      console.log('📅 Daily streak checked');
    }
  }, [userProgress]);

  // Achievement system
  const checkAndUnlockAchievements = useCallback(async (action: string, data?: any): Promise<Achievement[]> => {
    const newlyUnlocked: Achievement[] = [];

    const updatedAchievements = achievements.map(achievement => {
      if (achievement.unlockedAt) return achievement; // Already unlocked

      let shouldUpdate = false;
      let newProgress = achievement.progress;

      // Check achievement criteria
      switch (achievement.id) {
        case 'first_lesson':
          if (action === 'lesson_completed') {
            newProgress = 1;
            shouldUpdate = true;
          }
          break;
        case 'lesson_streak_7':
          if (action === 'streak_updated' && data?.streak >= 7) {
            newProgress = 7;
            shouldUpdate = true;
          }
          break;
        case 'first_artwork':
          if (action === 'artwork_created') {
            newProgress = 1;
            shouldUpdate = true;
          }
          break;
        case 'level_10':
          if (action === 'level_up' && data?.newLevel >= 10) {
            newProgress = 10;
            shouldUpdate = true;
          }
          break;
        case 'drawing_time_60':
          if (action === 'drawing_time_updated' && data?.totalMinutes >= 60) {
            newProgress = 60;
            shouldUpdate = true;
          }
          break;
      }

      if (shouldUpdate && newProgress >= achievement.maxProgress) {
        const unlockedAchievement = {
          ...achievement,
          progress: newProgress,
          unlockedAt: new Date().toISOString(),
        };
        newlyUnlocked.push(unlockedAchievement);
        return unlockedAchievement;
      } else if (shouldUpdate) {
        return { ...achievement, progress: newProgress };
      }

      return achievement;
    });

    if (newlyUnlocked.length > 0) {
      setAchievements(updatedAchievements);
      debouncedSave(STORAGE_KEYS.USER_ACHIEVEMENTS, updatedAchievements);

      // Award XP for achievements
      const totalXPReward = newlyUnlocked.reduce((sum, achievement) => sum + achievement.xpReward, 0);
      if (totalXPReward > 0) {
        await addXP(totalXPReward, 'achievement');
      }

      // Emit events
      newlyUnlocked.forEach(achievement => {
        eventBus.emit('user:achievement_unlocked', { achievement });
      });
    }

    return newlyUnlocked;
  }, [achievements, debouncedSave, addXP]);

  // Portfolio management
  const addToPortfolio = useCallback(async (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => {
    const portfolioItem: PortfolioItem = {
      ...item,
      id: `artwork_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      stats: item.stats || { likes: 0, views: 0, comments: 0, shares: 0 },
    };

    const updatedPortfolio = [...portfolio, portfolioItem];
    setPortfolio(updatedPortfolio);
    debouncedSave(STORAGE_KEYS.USER_PORTFOLIO, updatedPortfolio);

    // Update artwork count
    if (userProgress) {
      const updatedProgress = {
        ...userProgress,
        artworksCreated: userProgress.artworksCreated + 1,
      };
      setUserProgress(updatedProgress);
      debouncedSave(STORAGE_KEYS.USER_PROGRESS, updatedProgress);
    }

    // Check achievements
    await checkAndUnlockAchievements('artwork_created');
    
    eventBus.emit('user:artwork_added', { artwork: portfolioItem });
    console.log(`🎨 Added artwork to portfolio: ${portfolioItem.title}`);
  }, [portfolio, userProgress, debouncedSave, checkAndUnlockAchievements]);

  const updatePortfolioItem = useCallback(async (id: string, updates: Partial<PortfolioItem>) => {
    const updatedPortfolio = portfolio.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    setPortfolio(updatedPortfolio);
    debouncedSave(STORAGE_KEYS.USER_PORTFOLIO, updatedPortfolio);
  }, [portfolio, debouncedSave]);

  const deletePortfolioItem = useCallback(async (id: string) => {
    const updatedPortfolio = portfolio.filter(item => item.id !== id);
    setPortfolio(updatedPortfolio);
    debouncedSave(STORAGE_KEYS.USER_PORTFOLIO, updatedPortfolio);
    
    eventBus.emit('user:artwork_deleted', { artworkId: id });
  }, [portfolio, debouncedSave]);

  // Streak and activity tracking
  const recordActivity = useCallback(async (activityType: string) => {
    if (!userProgress) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivityDate = userProgress.streakData.lastActivityDate.split('T')[0];
    
    let newStreakData = { ...userProgress.streakData };

    if (lastActivityDate !== today) {
      // New day activity
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActivityDate === yesterdayStr) {
        // Continue streak
        newStreakData.currentStreak += 1;
      } else if (lastActivityDate !== '') {
        // Streak broken
        newStreakData.currentStreak = 1;
      } else {
        // First activity
        newStreakData.currentStreak = 1;
      }

      newStreakData.longestStreak = Math.max(newStreakData.longestStreak, newStreakData.currentStreak);
      newStreakData.lastActivityDate = new Date().toISOString();
      
      // Update weekly progress
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      if (new Date(lastActivityDate) < startOfWeek) {
        newStreakData.completedThisWeek = 1;
      } else {
        newStreakData.completedThisWeek += 1;
      }

      const updatedProgress = {
        ...userProgress,
        streakData: newStreakData,
      };

      setUserProgress(updatedProgress);
      debouncedSave(STORAGE_KEYS.USER_PROGRESS, updatedProgress);

      // Check achievements
      await checkAndUnlockAchievements('streak_updated', { streak: newStreakData.currentStreak });
      
      eventBus.emit('user:streak_updated', { streak: newStreakData.currentStreak });
    }
  }, [userProgress, debouncedSave, checkAndUnlockAchievements]);

  const updateStreakGoal = useCallback(async (goal: number) => {
    if (!userProgress) return;

    const updatedProgress = {
      ...userProgress,
      streakData: {
        ...userProgress.streakData,
        streakGoal: goal,
      },
    };

    setUserProgress(updatedProgress);
    debouncedSave(STORAGE_KEYS.USER_PROGRESS, updatedProgress);
  }, [userProgress, debouncedSave]);

  // Activity tracking
  const updateDrawingTime = useCallback(async (minutes: number) => {
    if (!userProgress) return;

    const updatedProgress = {
      ...userProgress,
      totalDrawingTime: userProgress.totalDrawingTime + minutes,
    };

    setUserProgress(updatedProgress);
    debouncedSave(STORAGE_KEYS.USER_PROGRESS, updatedProgress);

    // Check achievements
    await checkAndUnlockAchievements('drawing_time_updated', { totalMinutes: updatedProgress.totalDrawingTime });
    
    eventBus.emit('user:drawing_time_updated', { totalMinutes: updatedProgress.totalDrawingTime });
  }, [userProgress, debouncedSave, checkAndUnlockAchievements]);

  const recordLessonCompletion = useCallback(async (lessonId: string, timeSpent: number) => {
    if (!userProgress) return;

    const isNewLesson = !userProgress.completedLessons.includes(lessonId);
    
    if (isNewLesson) {
      const updatedProgress = {
        ...userProgress,
        completedLessons: [...userProgress.completedLessons, lessonId],
        totalDrawingTime: userProgress.totalDrawingTime + timeSpent,
      };

      setUserProgress(updatedProgress);
      debouncedSave(STORAGE_KEYS.USER_PROGRESS, updatedProgress);

      // Update learning stats
      const updatedStats = {
        ...learningStats,
        lessonsCompleted: learningStats.lessonsCompleted + 1,
        totalStudyTime: learningStats.totalStudyTime + timeSpent,
      };
      setLearningStats(updatedStats);
      debouncedSave('learning_stats', updatedStats);

      // Record daily activity
      await recordActivity('lesson_completion');
      
      // Check achievements
      await checkAndUnlockAchievements('lesson_completed');
      
      eventBus.emit('user:lesson_completed', { lessonId, timeSpent });
    }
  }, [userProgress, learningStats, debouncedSave, recordActivity, checkAndUnlockAchievements]);

  const updateLearningStats = useCallback(async (category: string, data: any) => {
    const updatedStats = {
      ...learningStats,
      ...data,
    };
    
    if (data.lessonsCompleted) {
      updatedStats.lessonsCompleted += data.lessonsCompleted;
    }
    
    if (data.totalStudyTime) {
      updatedStats.totalStudyTime += data.totalStudyTime;
    }

    setLearningStats(updatedStats);
    debouncedSave('learning_stats', updatedStats);
    
    eventBus.emit('user:learning_stats_updated', { category, data: updatedStats });
  }, [learningStats, debouncedSave]);

  // Settings
  const updatePreferences = useCallback(async (preferences: Partial<User['preferences']>) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences,
      },
    };

    setUser(updatedUser);
    debouncedSave(STORAGE_KEYS.USER_PROFILE, updatedUser);
    
    eventBus.emit('user:preferences_updated', { preferences: updatedUser.preferences });
  }, [user, debouncedSave]);

  // Utility functions
  const reset = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      await AsyncStorage.removeItem('learning_stats');
      setUser(null);
      setUserProgress(null);
      setAchievements(ACHIEVEMENT_DEFINITIONS);
      setPortfolio([]);
      setLearningStats(createDefaultLearningStats());
      eventBus.emit('user:data_reset');
    } catch (error) {
      console.error('Failed to reset user data:', error);
    }
  }, []);

  const exportData = useCallback(async (): Promise<string> => {
    const data = {
      user,
      userProgress,
      achievements,
      portfolio,
      learningStats,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }, [user, userProgress, achievements, portfolio, learningStats]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Context value
  const contextValue = useMemo<UserProgressContextType>(() => ({
    // User Profile
    user,
    userProfile: user, // alias
    updateProfile,
    setSkillLevel,
    createUser,

    // Progress & XP
    userProgress,
    progress,
    addXP,
    getCurrentLevel,
    getXPProgress,

    // Legacy progress properties
    level,
    xp,
    xpToNextLevel,
    xpProgress,
    streakDays,

    // Achievements
    achievements,
    unlockedAchievements,
    checkAndUnlockAchievements,

    // Portfolio
    portfolio,
    addToPortfolio,
    updatePortfolioItem,
    deletePortfolioItem,

    // Streaks & Habits
    streakData,
    recordActivity,
    updateStreakGoal,
    getDailyGoalProgress,
    checkDailyStreak,

    // Statistics & Learning
    learningStats,
    updateDrawingTime,
    recordLessonCompletion,
    updateLearningStats,

    // Settings & Preferences
    updatePreferences,

    // State
    isLoading,
    isInitialized,

    // Actions
    initialize,
    reset,
    exportData,
  }), [
    user, userProgress, progress, addXP, getCurrentLevel, getXPProgress,
    level, xp, xpToNextLevel, xpProgress, streakDays,
    achievements, unlockedAchievements, checkAndUnlockAchievements,
    portfolio, addToPortfolio, updatePortfolioItem, deletePortfolioItem,
    streakData, recordActivity, updateStreakGoal, getDailyGoalProgress, checkDailyStreak,
    learningStats, updateDrawingTime, recordLessonCompletion, updateLearningStats,
    updatePreferences, updateProfile, setSkillLevel, createUser,
    isLoading, isInitialized, initialize, reset, exportData,
  ]);

  return (
    <UserProgressContext.Provider value={contextValue}>
      {children}
    </UserProgressContext.Provider>
  );
}

// Hooks
export function useUserProgress(): UserProgressContextType {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return context;
}

// Alternative hook name for backward compatibility
export const useProgress = useUserProgress;

// Export additional utilities
export const XP_REQUIRED_FOR_LEVEL = (level: number): number => {
  if (level <= 1) return 0;
  return Math.floor(XP_CONSTANTS.BASE_LEVEL_XP * Math.pow(XP_CONSTANTS.LEVEL_MULTIPLIER, level - 1));
};

export const LEVEL_FROM_XP = (totalXP: number): number => {
  let level = 1;
  while (level < XP_CONSTANTS.MAX_LEVEL) {
    const nextLevelXP = XP_REQUIRED_FOR_LEVEL(level + 1);
    if (totalXP < nextLevelXP) break;
    level++;
  }
  return level;
};