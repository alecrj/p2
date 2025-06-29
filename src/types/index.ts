// src/types/index.ts - ENTERPRISE UNIFIED TYPE SYSTEM V2.0

import { SkPath, SkImage } from '@shopify/react-native-skia';
import { ReactNode } from 'react';

// ========================== CORE TYPES ==========================

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  tiltX?: number;
  tiltY?: number;
  timestamp: number;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX?: boolean;
  flipY?: number;
}

export interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsb: { h: number; s: number; b: number };
  alpha: number;
}

// ========================== DRAWING TYPES - CORE EXPORTS ==========================

export type Tool = 
  | 'brush'
  | 'eraser'
  | 'smudge'
  | 'blur'
  | 'sharpen'
  | 'clone'
  | 'selection'
  | 'transform'
  | 'text'
  | 'shape'
  | 'eyedropper'
  | 'fill'
  | 'gradient'
  | 'liquify'
  | 'perspective'
  | 'reference';

export type DrawingTool = 'brush' | 'eraser' | 'move' | 'select' | 'zoom';
export type DrawingMode = 'normal' | 'reference' | 'guided' | 'timelapse';
export type BlendMode = 
  | 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' 
  | 'color-dodge' | 'color-burn' | 'darken' | 'lighten';

export type BrushCategory = 
  | 'pencil' | 'ink' | 'paint' | 'watercolor' | 'airbrush' | 'marker' | 'texture' | 'eraser';

export interface BrushSettings {
  size: number;
  minSize: number;
  maxSize: number;
  opacity: number;
  flow: number;
  hardness: number;
  spacing: number;
  smoothing: number;
  pressureSensitivity?: number;
  tiltSensitivity?: number;
  velocitySensitivity?: number;
  jitter?: number;
  scatter?: number;
  textureScale?: number;
  textureDepth?: number;
  wetness?: number;
  mixing?: number;
  falloff?: number;
  rotation?: number;
  graininess?: number;
}

export interface Brush {
  id: string;
  name: string;
  category: BrushCategory;
  icon: string;
  settings: BrushSettings;
  pressureCurve: number[];
  tiltSupport: boolean;
  velocitySupport: boolean;
  blendMode?: BlendMode;
  customizable: boolean;
  textureId?: string;
  isEraser?: boolean;
  size?: number;
  opacity?: number;
  hardness?: number;
  texture?: string;
  pressureSensitive?: boolean;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  brushId: string;
  size: number;
  opacity: number;
  blendMode: BlendMode;
  smoothing: number;
  path?: SkPath;
}

export interface Layer {
  id: string;
  name: string;
  type: 'raster' | 'vector' | 'group' | 'text';
  strokes: Stroke[];
  opacity: number;
  blendMode: BlendMode | string;
  visible: boolean;
  locked: boolean;
  data: any;
  order: number;
}

export interface DrawingStats {
  totalStrokes: number;
  totalTime: number;
  layersUsed: number;
  colorsUsed: number;
  brushesUsed: number;
  undoCount: number;
  redoCount: number;
}

export interface CanvasSettings {
  pressureSensitivity: boolean | number;
  tiltSensitivity: boolean | number;
  velocitySensitivity: boolean | number;
  palmRejection: boolean;
  quickMenuEnabled?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  smoothing?: number;
  predictiveStroke?: boolean;
  snapToShapes?: boolean;
  gridEnabled?: boolean;
  gridSize?: number;
  symmetryEnabled?: boolean;
  symmetryType?: string;
  referenceEnabled?: boolean;
  streamlineAmount?: number;
  quickShapeEnabled?: boolean;
}

export interface HistoryEntry {
  id: string;
  action: string;
  timestamp: number;
  data: any;
}

export interface DrawingState {
  currentTool: DrawingTool;
  currentColor: Color;
  currentBrush: Brush | null;
  brushSize: number;
  opacity: number;
  layers: Layer[];
  activeLayerId: string;
  strokes: Stroke[];
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  pan: { x: number; y: number };
  rotation: number;
  gridVisible: boolean;
  gridSize: number;
  referenceImage: string | null;
  referenceOpacity: number;
  drawingMode: DrawingMode;
  history: HistoryEntry[];
  historyIndex: number;
  stats: DrawingStats;
  settings: CanvasSettings;
  recentColors: string[];
  customBrushes: Brush[];
  savedPalettes: Color[][];
}

// ========================== INITIALIZATION TYPES ==========================

export interface InitializationResult {
  success: boolean;
  initializedSystems: string[];
  failedSystems: string[];
  warnings: string[];
  errors: string[];
  duration: number;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
}

// ========================== ERROR TYPES ==========================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorCategory = 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'PERMISSION_ERROR'
  | 'STORAGE_ERROR'
  | 'INITIALIZATION_ERROR'
  | 'DRAWING_ERROR'
  | 'LEARNING_ERROR'
  | 'USER_ERROR'
  | 'COMMUNITY_ERROR'
  | 'UNKNOWN_ERROR'
  | 'STORAGE_SAVE_ERROR'
  | 'USER_INIT_ERROR'
  | 'CHALLENGE_FETCH_ERROR'
  | 'CHALLENGE_CREATE_ERROR'
  | 'USER_STATS_ERROR'
  | 'SUBMISSION_ERROR'
  | 'VOTING_ERROR'
  | 'STATS_ERROR'
  | 'SAVE_ERROR'
  | 'LOAD_ERROR'
  | 'PROGRESS_LOAD_ERROR'
  | 'LESSON_COMPLETE_ERROR'
  | 'PROGRESS_SAVE_ERROR'
  | 'ARTWORK_LIKE_ERROR'
  | 'ARTWORK_VIEW_ERROR'
  | 'PORTFOLIO_LOAD_ERROR'
  | 'PORTFOLIO_SAVE_ERROR';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorId?: string;
}

// ========================== UNIFIED APP SETTINGS ==========================

export interface AppSettings {
  [key: string]: any;
  
  version: number;
  lastUpdated: number;
  theme: 'auto' | 'light' | 'dark';
  
  notifications: {
    enabled: boolean;
    dailyReminder: boolean;
    achievementAlerts: boolean;
    challengeAlerts: boolean;
    reminderTime: string;
    lessons: boolean;
    achievements: boolean;
    social: boolean;
    challenges: boolean;
    lessonCompletions?: boolean;
    achievementUnlocks?: boolean;
    socialActivity?: boolean;
  };
  
  drawing: {
    pressureSensitivity: number;
    smoothing: number;
    autosave: boolean;
    hapticFeedback: boolean;
    defaultBrush?: string;
    palmRejection?: boolean;
    leftHanded?: boolean;
    smoothingLevel?: number;
    maxUndoHistory?: number;
    canvasResolution?: 'standard' | 'high' | 'ultra';
    antiAliasing?: boolean;
  };
  
  learning: {
    dailyGoal: number;
    reminderTime: string;
    difficulty: 'easy' | 'adaptive' | 'hard';
    skipIntroVideos?: boolean;
    autoAdvance?: boolean;
    practiceMode?: 'guided' | 'free' | 'mixed';
  };
  
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    shareArtwork: boolean;
    shareProgress: boolean;
    allowComments: boolean;
    analyticsOptIn: boolean;
    showProgress?: boolean;
    allowMessages?: boolean;
    portfolioVisibility?: 'public' | 'friends' | 'private';
  };
  
  accessibility: {
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    colorBlindSupport: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  };
  
  performance?: {
    enableGPUAcceleration: boolean;
    frameRateLimit: 30 | 60 | 120;
    memoryOptimization: 'low' | 'balanced' | 'high';
    backgroundProcessing: boolean;
  };
  
  experimental?: {
    betaFeatures: boolean;
    aiAssistance: boolean;
    cloudSync: boolean;
    collaborativeDrawing: boolean;
  };
}

// ========================== LEARNING TYPES ==========================

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'theory' | 'practice' | 'challenge' | 'guided' | 'assessment' | 'video';
export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'mastered' | 'in-progress';

export interface ValidationRule {
  type: string;
  params?: Record<string, any>;
  threshold?: number;
  criteria?: any;
  target?: any;
  tolerance?: number;
  targets?: string[];
}

// FIXED: Complete ValidationResult interface
export interface ValidationResult {
  isValid?: boolean; // Legacy support
  isCorrect?: boolean; // Current standard
  score?: number;
  feedback?: string;
  details?: Record<string, any>;
  explanation?: string;
  xpAwarded?: number;
  showHint?: boolean;
  hint?: string;
}

export interface LearningObjective {
  id: string;
  description: string;
  completed: boolean;
  required: boolean;
  type?: 'primary' | 'secondary' | 'bonus';
}

export interface LessonObjective {
  id: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface LessonContent {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'color_match' | 'visual_selection' 
      | 'drawing_exercise' | 'guided_step' | 'shape_practice' | 'video_lesson' 
      | 'assessment' | 'portfolio_project';
  question?: string;
  instruction?: string;
  explanation?: string;
  hint?: string;
  xp: number;
  timeLimit?: number;
  options?: string[];
  correctAnswer?: any;
  validation?: ValidationRule;
  overlay?: {
    type: string;
    position: { x: number; y: number };
    size: number;
    opacity: number;
  };
  image?: string;
  video?: string;
  demonstration?: string;
}

export interface TheoryContent {
  segments: Array<{
    id: string;
    type: string;
    content: string;
    duration: number;
    order: number;
  }>;
  totalDuration: number;
  objectives: LearningObjective[];
}

// FIXED: PracticeContent interface with instructions
export interface PracticeContent {
  instructions?: string[]; // Support for legacy content
  steps: Array<{
    id: string;
    type: string;
    instruction: string;
    demonstration?: string;
    validation?: ValidationRule;
    hints?: string[];
    xpReward?: number;
    order: number;
  }>;
  timeLimit?: number;
  requiredAccuracy?: number;
  objectives: LearningObjective[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  skillTree: string;
  order: number;
  estimatedTime: number;
  difficulty: number;
  prerequisites: string[];
  content: LessonContent[];
  objectives: LearningObjective[];
  rewards: {
    xp: number;
    achievements?: string[];
    unlocks?: string[];
  };
  status: LessonStatus;
  progress: number;
  attempts: number;
  timeSpent: number;
  tags: string[];
  xpReward?: number;
  completedAt?: number;
  bestScore?: number;
  duration?: number;
  skillTreeId?: string;
  unlockRequirements?: string[];
  theoryContent?: TheoryContent;
  practiceContent?: PracticeContent;
}

export interface SkillTree {
  id: string;
  name: string;
  description: string;
  category: string;
  order: number;
  lessons: Lesson[];
  prerequisites: string[];
  totalXP: number;
  estimatedDuration: number;
  difficultyLevel: SkillLevel;
  progress: number;
  unlockedAt?: number;
  completedAt?: number;
  iconUrl?: string;
  completionPercentage?: number;
}

export interface LearningProgress {
  userId: string;
  currentLevel: number;
  totalXP: number;
  completedLessons: string[];
  skillTrees: SkillTreeProgress[];
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  achievements: string[];
  preferences: {
    dailyGoal: number;
    reminderTime?: string;
    difficulty: 'adaptive' | 'challenging' | 'comfortable';
  };
  dailyProgress: number;
  dailyGoal: number;
}

// FIXED: Complete SkillTreeProgress interface
export interface SkillTreeProgress {
  skillTreeId: string;
  lessonsCompleted: string[];
  completedLessons?: string[]; // Alias for compatibility
  totalXP: number;
  totalXpEarned?: number; // Alias for compatibility
  completionPercentage: number;
  lastAccessedAt: number;
  lastActivityDate?: string; // Additional property
  unlockedAt: number;
  completedAt?: number;
}

// FIXED: Complete LessonProgress interface
export interface LessonProgress {
  lessonId: string;
  userId?: string;
  contentIndex?: number;
  currentContentIndex?: number; // Current content position
  completedContent?: string[];
  score: number;
  attempts: number;
  startedAt: number | string; // Support both formats
  completedAt?: number | string;
  progress: number;
  contentProgress?: number; // Detailed progress percentage
  xpEarned?: number;
  achievements?: string[];
  timeSpent?: number; // Time in milliseconds
  completed?: boolean; // Completion status
  totalContent?: number; // Total content items
}

export interface LessonCompletionData {
  lessonId: string;
  userId?: string;
  completedAt: number;
  score: number;
  xpEarned: number;
  timeSpent: number;
  accuracy?: number;
  achievements?: string[];
  streakMaintained?: boolean;
  attempts?: Record<string, number>;
}

export type LessonStateCallback = (state: {
  progress: number;
  currentContent?: LessonContent;
  isComplete: boolean;
  score: number;
}) => void;

// FIXED: Complete LessonState interface
export interface LessonState {
  lessonId: string;
  startedAt: Date;
  theoryProgress: {
    currentSegment: number;
    completedSegments: string[];
    timeSpent: number;
  };
  practiceProgress: {
    currentStep: number;
    completedSteps: number[];
    attempts: Record<string, number>;
    hints: string[];
    timeSpent?: number; // Add missing property
  };
  overallProgress: number;
  isPaused: boolean;
  pausedAt?: Date;
  xpEarned?: number;
  achievements?: string[];
}

// ========================== USER TYPES ==========================

export interface User {
  id: string;
  email?: string;
  displayName: string;
  username?: string;
  avatar?: string;
  bio?: string;
  skillLevel: SkillLevel;
  joinedDate: string;
  lastActiveDate: string;
  learningGoals?: string[];
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    autoSave: boolean;
    hapticFeedback: boolean;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatar?: string;
  bio?: string;
  skillLevel: SkillLevel;
  joinedAt: number;
  lastActiveAt: number;
  followers: number;
  following: number;
  isFollowing?: boolean;
  isPrivate: boolean;
  showProgress: boolean;
  showArtwork: boolean;
  learningGoals: string[];
  stats: {
    totalDrawingTime: number;
    totalLessonsCompleted: number;
    totalArtworksCreated: number;
    currentStreak: number;
    longestStreak: number;
    totalArtworks: number;
    totalLessons: number;
    totalAchievements: number;
  };
  featuredAchievements: string[];
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    notifications: boolean;
    privacy: 'public' | 'friends' | 'private';
  };
}

// FIXED: Complete UserProgress interface
export interface UserProgress {
  userId: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  dailyStreak: number;
  weeklyProgress: number;
  monthlyProgress: number;
  achievements: Achievement[];
  unlockedFeatures: string[];
  skillProgress: Record<string, SkillProgress>;
  milestones: Milestone[];
  recentActivity: XPGain[];
  lastUpdated: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'social' | 'milestone' | 'streak' | 'creativity';
  requirements: {
    type: string;
    value: number;
    condition?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
  title?: string;
  iconUrl?: string;
}

// ========================== PORTFOLIO TYPES ==========================

export interface Portfolio {
  id: string;
  userId: string;
  artworks: Artwork[];
  collections: Collection[];
  stats: {
    totalArtworks: number;
    totalLikes: number;
    totalViews: number;
    followerCount: number;
    publicArtworks?: number;
    averageTimeSpent?: number;
  };
  settings: {
    publicProfile: boolean;
    showProgress: boolean;
    allowComments: boolean;
  };
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
    timeSpent: number;
    toolsUsed: string[];
    skillsApplied: string[];
  };
  visibility: 'public' | 'private';
  featured: boolean;
}

export interface PortfolioStats {
  totalArtworks: number;
  totalLikes: number;
  totalViews: number;
  publicArtworks: number;
  averageTimeSpent: number;
  followerCount: number;
}

export interface Artwork {
  id: string;
  userId: string;
  title: string;
  description?: string;
  tags: string[];
  lessonId?: string;
  skillTree?: string;
  drawingData?: DrawingState;
  thumbnail?: string;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
  stats?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  metadata?: {
    drawingTime: number;
    strokeCount: number;
    layersUsed: number;
    brushesUsed: string[];
    canvasSize: { width: number; height: number };
  };
  visibility?: 'public' | 'unlisted' | 'private';
  featured?: boolean;
  isPublic?: boolean;
  likes?: number;
  views?: number;
  comments?: Comment[];
  duration?: number;
  tools?: string[];
  layers?: Layer[];
  dimensions?: { width: number; height: number };
  challengeId?: string;
  thumbnailUrl?: string;
  fullImageUrl?: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  artworkIds: string[];
  coverImageId?: string;
  createdAt: number;
  updatedAt: number;
  visibility: 'public' | 'unlisted' | 'private';
}

// ========================== COMMUNITY TYPES ==========================

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  theme?: string;
  prompt?: string;
  rules?: string[];
  startDate: number;
  endDate: number;
  difficulty: SkillLevel;
  rewards: {
    xp: number;
    achievements: string[];
    badges?: string[];
  };
  participants: number;
  submissions?: ChallengeSubmission[];
  featured?: boolean;
  tags?: string[];
  winners?: string[];
  status?: 'upcoming' | 'active' | 'completed';
  requirements?: string[];
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  artworkId: string;
  submittedAt: number;
  votes: number;
  rank?: number;
  featured?: boolean;
  disqualified?: boolean;
  disqualificationReason?: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: number;
  likes: number;
  replies: Comment[];
  isLiked?: boolean;
  artworkId?: string;
}

// ========================== PERFORMANCE TYPES ==========================

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  inputLatency: number;
  renderTime: number;
  timestamp: number;
}

export interface AppError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
  timestamp: Date;
  stack?: string;
  userId?: string;
}

// ========================== THEME TYPES ==========================

export interface Theme {
  name: 'light' | 'dark';
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: { fontSize: number; fontWeight: string; lineHeight: number };
    h2: { fontSize: number; fontWeight: string; lineHeight: number };
    h3: { fontSize: number; fontWeight: string; lineHeight: number };
    h4: { fontSize: number; fontWeight: string; lineHeight: number };
    body: { fontSize: number; fontWeight: string; lineHeight: number };
    caption: { fontSize: number; fontWeight: string; lineHeight: number };
  };
}

// ========================== CONTEXT TYPES ==========================

export interface ThemeContextValue {
  theme: Theme;
  colors: Theme['colors'];
  spacing: Theme['spacing'];
  borderRadius: Theme['borderRadius'];
  toggleTheme: () => void;
  isDark: boolean;
}

export interface UserProgressContextValue {
  user: UserProfile | null;
  progress: UserProgress | null;
  portfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;
  createUser: (profile: Partial<UserProfile>) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  addXP: (amount: number, source?: string) => void;
  addAchievement: (achievementId: string) => void;
  updateStreak: () => void;
  checkDailyStreak: () => void;
  updateLearningStats: (category: string, stats: Record<string, number>) => void;
  saveArtwork: (artwork: Omit<Artwork, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateArtwork: (artworkId: string, updates: Partial<Artwork>) => Promise<void>;
  deleteArtwork: (artworkId: string) => Promise<void>;
  createCollection: (collection: Omit<Collection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  getDailyGoalProgress: () => number;
  getWeeklyStats: () => any;
  getLearningInsights: () => any;
}

// FIXED: Complete LearningContextType interface
export interface LearningContextType {
  // Core lesson state
  currentLesson: Lesson | null;
  lessonState: LessonState | null;
  isLoadingLesson: boolean;
  error: string | null;
  
  // Skill trees and progression
  skillTrees: SkillTree[];
  availableLessons: Lesson[];
  unlockedLessons: string[];
  learningProgress: LearningProgress | null;
  completedLessons: string[];
  currentStreak: number;
  
  // UI-specific properties
  recommendedLesson?: Lesson | null;
  recommendedLessons?: Lesson[];
  insights?: Array<{
    id: string;
    type: 'improvement' | 'achievement' | 'suggestion';
    title: string;
    description: string;
    actionable: boolean;
  }>;
  currentSkillTree?: SkillTree | null;
  setCurrentSkillTree?: (skillTree: SkillTree | null) => void;
  
  // Core actions
  initializeLearning?: () => Promise<void>;
  startLesson: (lessonId: string | Lesson) => Promise<void>; // Support both formats
  pauseLesson: () => Promise<void>;
  resumeLesson: () => Promise<void>;
  completeLesson: (completionData?: any) => Promise<void>;
  exitLesson?: () => Promise<void>;
  updateProgress: (stepIndex: number, completed: boolean) => Promise<void>;
  addHint: (hint: string) => void;
  validateStep: (stepIndex: number, userInput: any) => Promise<boolean>;
  
  // Utility methods
  getNextLesson: () => Lesson | null;
  getRecommendedLessons?: () => Lesson[];
  getDailyProgress: () => number;
  getLearningInsights: () => any;
  refreshProgress?: () => Promise<void>;
  
  // Additional utilities
  getLesson?: (lessonId: string) => Lesson | null;
  getLessonProgress?: (lessonId: string) => number;
  checkUnlockRequirements?: (lessonId: string) => boolean;
}

// ========================== PROGRESS DATA TYPES ==========================

export interface ProgressData {
  skills: Record<string, number>;
  totalXP: number;
  level: number;
  completedLessons: string[];
  achievements: string[];
  streakDays: number;
  lastActivityDate: string;
}

export interface SkillProgress {
  skillName: string;
  xp: number;
  level: number;
  lessons: string[];
  masteryPercentage: number;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  xpRequired: number;
  achieved: boolean;
  achievedAt?: number;
}

export interface XPGain {
  amount: number;
  source: string;
  timestamp: number;
  reason?: string;
}

// ========================== UTILITY TYPES ==========================

export interface Dimensions {
  width: number;
  height: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Re-export drawing types for convenience
export * from '../types/drawing';