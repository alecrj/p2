// src/engines/user/ProfileSystem.ts - ENTERPRISE GRADE PROFILE SYSTEM

import { EventBus } from '../core/EventBus';
import { dataManager } from '../core/DataManager';
import { errorHandler } from '../core/ErrorHandler';
import { UserProfile } from '../../types';

/**
 * PROFESSIONAL PROFILE MANAGEMENT SYSTEM
 * 
 * Enterprise features:
 * - User profile CRUD operations
 * - Avatar management
 * - Privacy settings
 * - Social connections
 * - Achievement showcase
 * - Portfolio integration
 * - XP and progression tracking
 * - Comprehensive user statistics
 */

export interface ProfileUpdate {
  displayName?: string;
  bio?: string;
  avatar?: string;
  skillLevel?: UserProfile['skillLevel'];
  isPrivate?: boolean;
  showProgress?: boolean;
  showArtwork?: boolean;
  preferences?: Partial<UserProfile['preferences']>;
  // FIXED: Added learningGoals to ProfileUpdate interface
  learningGoals?: string[];
}

export interface UserStatUpdate {
  totalArtworks?: number;
  totalLessons?: number;
  currentStreak?: number;
  longestStreak?: number;
  totalAchievements?: number;
  totalDrawingTime?: number;
}

class ProfileSystem {
  private static instance: ProfileSystem;
  private eventBus: EventBus;
  private currentProfile: UserProfile | null = null;
  private profileCache: Map<string, UserProfile> = new Map();
  
  private constructor() {
    this.eventBus = EventBus.getInstance();
  }
  
  public static getInstance(): ProfileSystem {
    if (!ProfileSystem.instance) {
      ProfileSystem.instance = new ProfileSystem();
    }
    return ProfileSystem.instance;
  }
  
  // =================== PROFILE MANAGEMENT ===================
  
  public async loadCurrentProfile(): Promise<UserProfile | null> {
    try {
      const profile = await dataManager.getUserProfile();
      if (profile) {
        // Ensure profile has all required properties
        const completeProfile = this.ensureCompleteProfile(profile);
        this.currentProfile = completeProfile;
        this.profileCache.set(completeProfile.id, completeProfile);
        this.eventBus.emit('profile:loaded', completeProfile);
      }
      return this.currentProfile;
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to load user profile',
        'medium',
        { error: error as Error }
      ));
      return null;
    }
  }

  // FIXED: Add missing getCurrentUser method
  public getCurrentUser(): UserProfile | null {
    return this.currentProfile;
  }
  
  public async createProfile(data: {
    username: string;
    displayName: string;
    email?: string;
    skillLevel: UserProfile['skillLevel'];
    learningGoals?: string[]; // FIXED: Added learningGoals parameter
  }): Promise<UserProfile> {
    try {
      const profile: UserProfile = {
        id: this.generateUserId(),
        username: data.username.toLowerCase(),
        displayName: data.displayName,
        email: data.email,
        skillLevel: data.skillLevel,
        joinedAt: Date.now(),
        lastActiveAt: Date.now(),
        
        // Social
        followers: 0,
        following: 0,
        
        // Privacy
        isPrivate: false,
        showProgress: true,
        showArtwork: true,
        
        // Learning Goals - FIXED: Use provided goals or empty array
        learningGoals: data.learningGoals || [],
        
        // Statistics - Complete stats object
        stats: {
          totalDrawingTime: 0,
          totalLessonsCompleted: 0,
          totalArtworksCreated: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalArtworks: 0,
          totalLessons: 0,
          totalAchievements: 0,
        },
        
        // Achievements
        featuredAchievements: [],
        
        // Preferences - Complete preferences object
        preferences: {
          theme: 'auto' as const,
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          emailNotifications: true,
          pushNotifications: true,
          notifications: true,
          privacy: 'public' as const,
        },
      };
      
      await dataManager.saveUserProfile(profile);
      this.currentProfile = profile;
      this.profileCache.set(profile.id, profile);
      
      this.eventBus.emit('profile:created', profile);
      return profile;
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to create user profile',
        'high',
        { error: error as Error, data }
      ));
      throw error;
    }
  }
  
  public async updateProfile(updates: ProfileUpdate): Promise<UserProfile> {
    if (!this.currentProfile) {
      throw new Error('No profile loaded');
    }
    
    try {
      const updatedProfile: UserProfile = {
        ...this.currentProfile,
        ...updates,
        lastActiveAt: Date.now(),
        preferences: {
          ...this.currentProfile.preferences,
          ...updates.preferences,
        },
        // FIXED: Handle learningGoals update properly
        learningGoals: updates.learningGoals !== undefined ? updates.learningGoals : this.currentProfile.learningGoals,
      };
      
      await dataManager.saveUserProfile(updatedProfile);
      this.currentProfile = updatedProfile;
      this.profileCache.set(updatedProfile.id, updatedProfile);
      
      this.eventBus.emit('profile:updated', {
        profile: updatedProfile,
        changes: updates,
      });
      
      return updatedProfile;
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to update user profile',
        'medium',
        { error: error as Error, updates }
      ));
      throw error;
    }
  }
  
  public async getProfile(userId: string): Promise<UserProfile | null> {
    // Check cache first
    if (this.profileCache.has(userId)) {
      return this.profileCache.get(userId)!;
    }
    
    try {
      // In production, this would fetch from API
      const profile = await dataManager.get<UserProfile>(`profile_${userId}`);
      if (profile) {
        const completeProfile = this.ensureCompleteProfile(profile);
        this.profileCache.set(userId, completeProfile);
        return completeProfile;
      }
      return null;
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to fetch user profile',
        'low',
        { error: error as Error, userId }
      ));
      return null;
    }
  }

  // =================== XP AND PROGRESSION ===================

  // FIXED: Add missing addXP method
  public async addXP(amount: number, source?: string): Promise<void> {
    if (!this.currentProfile) {
      throw new Error('No profile loaded');
    }

    try {
      // This would typically be handled by ProgressionSystem,
      // but we provide a simple implementation here for API compatibility
      this.eventBus.emit('user:xp_request', {
        userId: this.currentProfile.id,
        amount,
        source: source || 'profile_system',
      });
      
      console.log(`XP awarded: ${amount} (${source || 'profile_system'})`);
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to add XP',
        'medium',
        { error: error as Error, amount, source }
      ));
    }
  }
  
  // =================== AVATAR MANAGEMENT ===================
  
  public async updateAvatar(imageUri: string): Promise<string> {
    if (!this.currentProfile) {
      throw new Error('No profile loaded');
    }
    
    try {
      // In production, this would upload to CDN
      const avatarUrl = await this.uploadAvatar(imageUri);
      
      await this.updateProfile({ avatar: avatarUrl });
      
      this.eventBus.emit('profile:avatar_updated', {
        userId: this.currentProfile.id,
        avatarUrl,
      });
      
      return avatarUrl;
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to update avatar',
        'medium',
        { error: error as Error }
      ));
      throw error;
    }
  }
  
  private async uploadAvatar(imageUri: string): Promise<string> {
    // Mock upload - in production, use CDN
    return `https://api.pikaso.app/avatars/${Date.now()}.jpg`;
  }
  
  // =================== SOCIAL FEATURES ===================
  
  public async followUser(userId: string): Promise<void> {
    if (!this.currentProfile) {
      throw new Error('No profile loaded');
    }
    
    try {
      // Update following count
      const updatedProfile = {
        ...this.currentProfile,
        following: this.currentProfile.following + 1,
      };
      
      await dataManager.saveUserProfile(updatedProfile);
      this.currentProfile = updatedProfile;
      
      // In production, update backend
      this.eventBus.emit('social:followed', {
        followerId: this.currentProfile.id,
        followedId: userId,
      });
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'COMMUNITY_ERROR',
        'Failed to follow user',
        'medium',
        { error: error as Error, userId }
      ));
      throw error;
    }
  }
  
  public async unfollowUser(userId: string): Promise<void> {
    if (!this.currentProfile) {
      throw new Error('No profile loaded');
    }
    
    try {
      // Update following count
      const updatedProfile = {
        ...this.currentProfile,
        following: Math.max(0, this.currentProfile.following - 1),
      };
      
      await dataManager.saveUserProfile(updatedProfile);
      this.currentProfile = updatedProfile;
      
      // In production, update backend
      this.eventBus.emit('social:unfollowed', {
        followerId: this.currentProfile.id,
        unfollowedId: userId,
      });
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'COMMUNITY_ERROR',
        'Failed to unfollow user',
        'medium',
        { error: error as Error, userId }
      ));
      throw error;
    }
  }
  
  // =================== STATS MANAGEMENT ===================
  
  public async updateStats(statsUpdate: UserStatUpdate): Promise<void> {
    if (!this.currentProfile) {
      throw new Error('No profile loaded');
    }
    
    try {
      const updatedProfile = {
        ...this.currentProfile,
        stats: {
          ...this.currentProfile.stats,
          // Update both old and new stat properties for compatibility
          totalArtworks: statsUpdate.totalArtworks ?? this.currentProfile.stats.totalArtworks,
          totalLessons: statsUpdate.totalLessons ?? this.currentProfile.stats.totalLessons,
          currentStreak: statsUpdate.currentStreak ?? this.currentProfile.stats.currentStreak,
          longestStreak: Math.max(
            this.currentProfile.stats.longestStreak,
            statsUpdate.longestStreak ?? this.currentProfile.stats.longestStreak,
            statsUpdate.currentStreak ?? this.currentProfile.stats.currentStreak
          ),
          totalAchievements: statsUpdate.totalAchievements ?? this.currentProfile.stats.totalAchievements,
          totalDrawingTime: statsUpdate.totalDrawingTime ?? this.currentProfile.stats.totalDrawingTime,
          // Keep compatibility with old property names
          totalArtworksCreated: statsUpdate.totalArtworks ?? this.currentProfile.stats.totalArtworksCreated,
          totalLessonsCompleted: statsUpdate.totalLessons ?? this.currentProfile.stats.totalLessonsCompleted,
        },
      };
      
      await dataManager.saveUserProfile(updatedProfile);
      this.currentProfile = updatedProfile;
      
      this.eventBus.emit('profile:stats_updated', {
        userId: this.currentProfile.id,
        stats: statsUpdate,
      });
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to update profile stats',
        'low',
        { error: error as Error, stats: statsUpdate }
      ));
    }
  }

  // =================== LEARNING GOALS ===================

  public async updateLearningGoals(goals: string[]): Promise<void> {
    if (!this.currentProfile) {
      throw new Error('No profile loaded');
    }

    try {
      await this.updateProfile({ 
        learningGoals: goals 
      });
      
      this.eventBus.emit('profile:learning_goals_updated', {
        userId: this.currentProfile.id,
        goals,
      });
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to update learning goals',
        'low',
        { error: error as Error, goals }
      ));
    }
  }
  
  // =================== UTILITIES ===================
  
  public isLoggedIn(): boolean {
    return !!this.currentProfile;
  }
  
  public async logout(): Promise<void> {
    this.currentProfile = null;
    this.profileCache.clear();
    
    await dataManager.remove('current_user_id');
    
    this.eventBus.emit('profile:logged_out');
  }
  
  private generateUserId(): string {
    return `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  public async deleteProfile(): Promise<void> {
    if (!this.currentProfile) {
      throw new Error('No profile loaded');
    }
    
    try {
      await dataManager.remove(`profile_${this.currentProfile.id}`);
      await dataManager.remove('current_user_id');
      
      const profileId = this.currentProfile.id;
      this.currentProfile = null;
      this.profileCache.clear();
      
      this.eventBus.emit('profile:deleted', { profileId });
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to delete profile',
        'high',
        { error: error as Error }
      ));
      throw error;
    }
  }

  // =================== PRIVATE HELPERS ===================

  /**
   * Ensures a profile object has all required properties with proper defaults
   */
  private ensureCompleteProfile(profile: Partial<UserProfile>): UserProfile {
    return {
      id: profile.id || '',
      username: profile.username || '',
      displayName: profile.displayName || '',
      email: profile.email,
      avatar: profile.avatar,
      bio: profile.bio,
      skillLevel: profile.skillLevel || 'beginner',
      joinedAt: profile.joinedAt || Date.now(),
      lastActiveAt: profile.lastActiveAt || Date.now(),
      
      // Social
      followers: profile.followers || 0,
      following: profile.following || 0,
      isFollowing: profile.isFollowing,
      
      // Privacy
      isPrivate: profile.isPrivate || false,
      showProgress: profile.showProgress !== false, // default true
      showArtwork: profile.showArtwork !== false,   // default true
      
      // Learning Goals
      learningGoals: profile.learningGoals || [],
      
      // Statistics
      stats: {
        totalDrawingTime: 0,
        totalLessonsCompleted: 0,
        totalArtworksCreated: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalArtworks: 0,
        totalLessons: 0,
        totalAchievements: 0,
        ...profile.stats,
      },
      
      // Achievements
      featuredAchievements: profile.featuredAchievements || [],
      
      // Preferences
      preferences: {
        theme: 'auto' as const,
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        emailNotifications: true,
        pushNotifications: true,
        notifications: true,
        privacy: 'public' as const,
        ...profile.preferences,
      },
    };
  }
}

export const profileSystem = ProfileSystem.getInstance();
export { ProfileSystem }; // Export both instance and class
export default profileSystem;