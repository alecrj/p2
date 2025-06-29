// src/engines/user/ProgressionSystem.ts - ENTERPRISE PROGRESSION SYSTEM V2.0

import { EventBus } from '../core/EventBus';
import { dataManager } from '../core/DataManager';
import { errorHandler } from '../core/ErrorHandler';

/**
 * ENTERPRISE PROGRESSION SYSTEM V2.0
 * 
 * ✅ FIXED ISSUES:
 * - Proper error handling with correct parameters
 * - Complete ProgressData interface implementation
 * - Type-safe skill progress management
 * - Enhanced XP calculation and validation
 * - Professional achievement system
 * - Comprehensive milestone tracking
 */

export interface ProgressData {
  userId: string;
  xp: number;
  level: number;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  
  // Skills with proper typing
  skills: {
    drawing: SkillProgress;
    color: SkillProgress;
    composition: SkillProgress;
    perspective: SkillProgress;
    anatomy: SkillProgress;
  };
  
  // Achievements
  achievements: Achievement[];
  unlockedAchievementIds: string[];
  
  // Stats
  totalLessonsCompleted: number;
  totalPracticeTime: number; // in minutes
  totalArtworksCreated: number;
  favoriteTools: string[];
  
  // Milestones
  milestones: Milestone[];
}

export interface SkillProgress {
  level: number;
  xp: number;
  nextLevelXp: number;
  lessonsCompleted: number;
  masteryPercentage: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'social' | 'creative' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export interface Milestone {
  id: string;
  type: 'xp' | 'level' | 'lessons' | 'artworks' | 'streak' | 'skill';
  value: number;
  reachedAt: number;
  reward?: {
    type: 'xp' | 'achievement' | 'unlock';
    value: any;
  };
}

export interface XPGain {
  amount: number;
  source: 'lesson' | 'practice' | 'challenge' | 'achievement' | 'bonus';
  details?: string;
  multiplier?: number;
}

// XP Requirements per level (enterprise-grade progression curve)
const LEVEL_XP_REQUIREMENTS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  450,   // Level 4
  700,   // Level 5
  1000,  // Level 6
  1400,  // Level 7
  1900,  // Level 8
  2500,  // Level 9
  3200,  // Level 10
];

// Generate XP requirements up to level 100
for (let i = 11; i <= 100; i++) {
  const previousXP = LEVEL_XP_REQUIREMENTS[i - 1];
  const increment = Math.floor(100 * Math.pow(1.15, i / 10));
  LEVEL_XP_REQUIREMENTS.push(previousXP + increment);
}

class ProgressionSystem {
  private static instance: ProgressionSystem;
  private eventBus: EventBus;
  private progressData: ProgressData | null = null;
  private achievementDefinitions: Map<string, Achievement> = new Map();
  
  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.initializeAchievements();
  }
  
  public static getInstance(): ProgressionSystem {
    if (!ProgressionSystem.instance) {
      ProgressionSystem.instance = new ProgressionSystem();
    }
    return ProgressionSystem.instance;
  }
  
  // =================== INITIALIZATION ===================
  
  private initializeAchievements(): void {
    // Define all achievements
    const achievements: Achievement[] = [
      // Skill achievements
      {
        id: 'first_lesson',
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎨',
        category: 'skill',
        rarity: 'common',
      },
      {
        id: 'skill_master',
        name: 'Skill Master',
        description: 'Max out any skill category',
        icon: '🏆',
        category: 'skill',
        rarity: 'legendary',
      },
      // Social achievements
      {
        id: 'first_follower',
        name: 'Making Friends',
        description: 'Get your first follower',
        icon: '👥',
        category: 'social',
        rarity: 'common',
      },
      // Creative achievements
      {
        id: 'portfolio_starter',
        name: 'Portfolio Starter',
        description: 'Create 10 artworks',
        icon: '🖼️',
        category: 'creative',
        rarity: 'common',
      },
      // Milestone achievements
      {
        id: 'week_streak',
        name: 'Dedicated Artist',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        category: 'milestone',
        rarity: 'rare',
      },
      {
        id: 'month_streak',
        name: 'Unstoppable',
        description: 'Maintain a 30-day streak',
        icon: '💎',
        category: 'milestone',
        rarity: 'epic',
      },
    ];
    
    achievements.forEach(achievement => {
      this.achievementDefinitions.set(achievement.id, achievement);
    });
  }
  
  public async loadProgressForUser(userId: string): Promise<ProgressData> {
    try {
      let progress = await dataManager.get<ProgressData>(`progress_${userId}`);
      
      if (!progress) {
        progress = this.createInitialProgress(userId);
        await dataManager.save(`progress_${userId}`, progress);
      }
      
      this.progressData = progress;
      this.eventBus.emit('progression:loaded', progress);
      
      return progress;
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to load progression data',
        'medium',
        { 
          error: error instanceof Error ? error.message : String(error), 
          userId 
        }
      ));
      throw error;
    }
  }
  
  private createInitialProgress(userId: string): ProgressData {
    return {
      userId,
      xp: 0,
      level: 1,
      
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: new Date().toISOString().split('T')[0],
      
      skills: {
        drawing: this.createInitialSkill(),
        color: this.createInitialSkill(),
        composition: this.createInitialSkill(),
        perspective: this.createInitialSkill(),
        anatomy: this.createInitialSkill(),
      },
      
      achievements: [],
      unlockedAchievementIds: [],
      
      totalLessonsCompleted: 0,
      totalPracticeTime: 0,
      totalArtworksCreated: 0,
      favoriteTools: [],
      
      milestones: [],
    };
  }
  
  private createInitialSkill(): SkillProgress {
    return {
      level: 1,
      xp: 0,
      nextLevelXp: 100,
      lessonsCompleted: 0,
      masteryPercentage: 0,
    };
  }
  
  // =================== XP & LEVEL MANAGEMENT ===================
  
  public async addXP(gain: XPGain): Promise<void> {
    if (!this.progressData) {
      throw new Error('Progress data not loaded');
    }
    
    try {
      const totalXP = gain.amount * (gain.multiplier || 1);
      const previousLevel = this.progressData.level;
      
      this.progressData.xp += totalXP;
      
      // Check for level up
      const newLevel = this.calculateLevel(this.progressData.xp);
      if (newLevel > previousLevel) {
        this.progressData.level = newLevel;
        
        this.eventBus.emit('progression:level_up', {
          userId: this.progressData.userId,
          previousLevel,
          newLevel,
          totalXP: this.progressData.xp,
        });
        
        // Check for level milestones
        await this.checkMilestone('level', newLevel);
      }
      
      await this.saveProgress();
      
      this.eventBus.emit('progression:xp_gained', {
        ...gain,
        totalAmount: totalXP,
        currentXP: this.progressData.xp,
        currentLevel: this.progressData.level,
      });
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to add XP',
        'medium',
        { 
          error: error instanceof Error ? error.message : String(error), 
          gain 
        }
      ));
      throw error;
    }
  }
  
  private calculateLevel(xp: number): number {
    for (let i = LEVEL_XP_REQUIREMENTS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_XP_REQUIREMENTS[i]) {
        return i + 1;
      }
    }
    return 1;
  }
  
  public getXPForNextLevel(): { current: number; required: number; percentage: number } {
    if (!this.progressData) {
      return { current: 0, required: 100, percentage: 0 };
    }
    
    const currentLevel = this.progressData.level;
    const currentLevelXP = LEVEL_XP_REQUIREMENTS[currentLevel - 1] || 0;
    const nextLevelXP = LEVEL_XP_REQUIREMENTS[currentLevel] || currentLevelXP + 1000;
    
    const xpInCurrentLevel = this.progressData.xp - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;
    const percentage = (xpInCurrentLevel / xpNeededForLevel) * 100;
    
    return {
      current: xpInCurrentLevel,
      required: xpNeededForLevel,
      percentage: Math.min(100, Math.max(0, percentage)),
    };
  }
  
  // =================== SKILL MANAGEMENT ===================
  
  public async updateSkillProgress(
    skillName: keyof ProgressData['skills'],
    xpGained: number,
    lessonCompleted: boolean = false
  ): Promise<void> {
    if (!this.progressData) {
      throw new Error('Progress data not loaded');
    }
    
    try {
      const skill = this.progressData.skills[skillName];
      const previousLevel = skill.level;
      
      skill.xp += xpGained;
      if (lessonCompleted) {
        skill.lessonsCompleted++;
      }
      
      // Calculate skill level (simpler progression than overall level)
      skill.level = Math.floor(skill.xp / 100) + 1;
      skill.nextLevelXp = skill.level * 100;
      skill.masteryPercentage = Math.min(100, (skill.xp / 1000) * 100);
      
      if (skill.level > previousLevel) {
        this.eventBus.emit('progression:skill_level_up', {
          skillName,
          previousLevel,
          newLevel: skill.level,
        });
      }
      
      // Check for skill mastery
      if (skill.masteryPercentage >= 100 && !this.hasAchievement('skill_master')) {
        await this.unlockAchievement('skill_master');
      }
      
      await this.saveProgress();
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to update skill progress',
        'medium',
        { 
          error: error instanceof Error ? error.message : String(error), 
          skillName, 
          xpGained 
        }
      ));
      throw error;
    }
  }
  
  // =================== STREAK MANAGEMENT ===================
  
  public async updateStreak(): Promise<void> {
    if (!this.progressData) {
      throw new Error('Progress data not loaded');
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = new Date(this.progressData.lastActivityDate);
      const todayDate = new Date(today);
      
      const daysDiff = Math.floor(
        (todayDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysDiff === 0) {
        // Already active today
        return;
      } else if (daysDiff === 1) {
        // Consecutive day
        this.progressData.currentStreak++;
        this.progressData.longestStreak = Math.max(
          this.progressData.longestStreak,
          this.progressData.currentStreak
        );
        
        // Check streak achievements
        if (this.progressData.currentStreak === 7) {
          await this.unlockAchievement('week_streak');
        } else if (this.progressData.currentStreak === 30) {
          await this.unlockAchievement('month_streak');
        }
        
        await this.checkMilestone('streak', this.progressData.currentStreak);
        
      } else {
        // Streak broken
        if (this.progressData.currentStreak > 0) {
          this.eventBus.emit('progression:streak_broken', {
            previousStreak: this.progressData.currentStreak,
          });
        }
        this.progressData.currentStreak = 1;
      }
      
      this.progressData.lastActivityDate = today;
      await this.saveProgress();
      
      this.eventBus.emit('progression:streak_updated', {
        currentStreak: this.progressData.currentStreak,
        longestStreak: this.progressData.longestStreak,
      });
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to update streak',
        'low',
        { error: error instanceof Error ? error.message : String(error) }
      ));
    }
  }
  
  // =================== ACHIEVEMENT MANAGEMENT ===================
  
  public async unlockAchievement(achievementId: string): Promise<void> {
    if (!this.progressData) {
      throw new Error('Progress data not loaded');
    }
    
    if (this.hasAchievement(achievementId)) {
      return; // Already unlocked
    }
    
    try {
      const achievementDef = this.achievementDefinitions.get(achievementId);
      if (!achievementDef) {
        throw new Error(`Unknown achievement: ${achievementId}`);
      }
      
      const unlockedAchievement: Achievement = {
        ...achievementDef,
        unlockedAt: Date.now(),
      };
      
      this.progressData.achievements.push(unlockedAchievement);
      this.progressData.unlockedAchievementIds.push(achievementId);
      
      // Award XP for achievement
      const xpReward = this.getAchievementXPReward(achievementDef.rarity);
      await this.addXP({
        amount: xpReward,
        source: 'achievement',
        details: achievementDef.name,
      });
      
      await this.saveProgress();
      
      this.eventBus.emit('progression:achievement_unlocked', unlockedAchievement);
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to unlock achievement',
        'medium',
        { 
          error: error instanceof Error ? error.message : String(error), 
          achievementId 
        }
      ));
      throw error;
    }
  }
  
  public hasAchievement(achievementId: string): boolean {
    return this.progressData?.unlockedAchievementIds.includes(achievementId) || false;
  }
  
  private getAchievementXPReward(rarity: Achievement['rarity']): number {
    const rewards = {
      common: 50,
      rare: 100,
      epic: 250,
      legendary: 500,
    };
    return rewards[rarity];
  }
  
  // =================== MILESTONE MANAGEMENT ===================
  
  private async checkMilestone(type: Milestone['type'], value: number): Promise<void> {
    if (!this.progressData) return;
    
    // Define milestone thresholds
    const milestoneThresholds: Record<Milestone['type'], number[]> = {
      xp: [100, 500, 1000, 5000, 10000, 50000, 100000],
      level: [5, 10, 25, 50, 75, 100],
      lessons: [1, 5, 10, 25, 50, 100, 250, 500],
      artworks: [1, 5, 10, 25, 50, 100, 250, 500],
      streak: [3, 7, 14, 30, 60, 100, 365],
      skill: [5, 10, 25, 50, 100],
    };
    
    const thresholds = milestoneThresholds[type] || [];
    
    for (const threshold of thresholds) {
      if (value >= threshold) {
        const milestoneId = `${type}_${threshold}`;
        const existingMilestone = this.progressData.milestones.find(m => m.id === milestoneId);
        
        if (!existingMilestone) {
          const milestone: Milestone = {
            id: milestoneId,
            type,
            value: threshold,
            reachedAt: Date.now(),
          };
          
          this.progressData.milestones.push(milestone);
          
          this.eventBus.emit('progression:milestone_reached', milestone);
        }
      }
    }
  }
  
  // =================== STATS MANAGEMENT ===================
  
  public async recordLessonCompletion(lessonId: string, practiceTime: number): Promise<void> {
    if (!this.progressData) {
      throw new Error('Progress data not loaded');
    }
    
    try {
      this.progressData.totalLessonsCompleted++;
      this.progressData.totalPracticeTime += practiceTime;
      
      await this.updateStreak();
      await this.checkMilestone('lessons', this.progressData.totalLessonsCompleted);
      
      if (this.progressData.totalLessonsCompleted === 1) {
        await this.unlockAchievement('first_lesson');
      }
      
      await this.saveProgress();
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to record lesson completion',
        'medium',
        { 
          error: error instanceof Error ? error.message : String(error), 
          lessonId, 
          practiceTime 
        }
      ));
      throw error;
    }
  }
  
  public async recordArtworkCreation(artworkId: string): Promise<void> {
    if (!this.progressData) {
      throw new Error('Progress data not loaded');
    }
    
    try {
      this.progressData.totalArtworksCreated++;
      
      await this.checkMilestone('artworks', this.progressData.totalArtworksCreated);
      
      if (this.progressData.totalArtworksCreated === 10) {
        await this.unlockAchievement('portfolio_starter');
      }
      
      await this.saveProgress();
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to record artwork creation',
        'medium',
        { 
          error: error instanceof Error ? error.message : String(error), 
          artworkId 
        }
      ));
      throw error;
    }
  }
  
  // =================== UTILITIES ===================
  
  public getProgressData(): ProgressData | null {
    return this.progressData;
  }
  
  public getAllAchievements(): Achievement[] {
    return Array.from(this.achievementDefinitions.values());
  }
  
  public getUnlockedAchievements(): Achievement[] {
    return this.progressData?.achievements || [];
  }
  
  // FIXED: Proper error handling with complete error context
  private async saveProgress(): Promise<void> {
    if (!this.progressData) return;
    
    try {
      await dataManager.save(`progress_${this.progressData.userId}`, this.progressData);
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'STORAGE_SAVE_ERROR',
        'Failed to save progression data',
        'high',
        { 
          error: error instanceof Error ? error.message : String(error),
          userId: this.progressData.userId,
          progressDataSize: JSON.stringify(this.progressData).length
        }
      ));
      throw error;
    }
  }
  
  public async resetProgress(): Promise<void> {
    if (!this.progressData) return;
    
    try {
      const userId = this.progressData.userId;
      this.progressData = this.createInitialProgress(userId);
      await this.saveProgress();
      
      this.eventBus.emit('progression:reset', { userId });
      
    } catch (error) {
      errorHandler.handleError(errorHandler.createError(
        'USER_ERROR',
        'Failed to reset progress',
        'high',
        { error: error instanceof Error ? error.message : String(error) }
      ));
    }
  }

  // =================== ANALYTICS & INSIGHTS ===================

  public getProgressAnalytics(): {
    xpTrend: number[];
    skillDistribution: Record<string, number>;
    achievementProgress: number;
    streakAnalysis: {
      current: number;
      longest: number;
      weeklyAverage: number;
    };
  } {
    if (!this.progressData) {
      return {
        xpTrend: [],
        skillDistribution: {},
        achievementProgress: 0,
        streakAnalysis: { current: 0, longest: 0, weeklyAverage: 0 }
      };
    }

    const skillDistribution: Record<string, number> = {};
    Object.entries(this.progressData.skills).forEach(([skillName, skill]) => {
      skillDistribution[skillName] = skill.xp;
    });

    const totalAchievements = this.achievementDefinitions.size;
    const unlockedCount = this.progressData.achievements.length;
    const achievementProgress = (unlockedCount / totalAchievements) * 100;

    return {
      xpTrend: [], // Would track XP over time in production
      skillDistribution,
      achievementProgress,
      streakAnalysis: {
        current: this.progressData.currentStreak,
        longest: this.progressData.longestStreak,
        weeklyAverage: this.progressData.currentStreak / 7, // Simplified calculation
      }
    };
  }
}

// =================== EXPORTS ===================

export const progressionSystem = ProgressionSystem.getInstance();
export { ProgressionSystem };
export default progressionSystem;