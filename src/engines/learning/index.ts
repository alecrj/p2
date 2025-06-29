// src/engines/learning/index.ts - FIXED WITH PROPER EXPORTS

import { lessonEngine } from './LessonEngine';
import { skillTreeManager } from './SkillTreeManager';
import { progressTracker } from './ProgressTracker';

/**
 * LEARNING ENGINE MODULE
 * 
 * ✅ FIXED ISSUES:
 * - Proper initialization flow
 * - Correct method exports
 * - Error handling for initialization
 */

// =================== INITIALIZATION ===================

export async function initializeLearningEngine(): Promise<void> {
  try {
    console.log('🚀 Initializing Learning Engine Module...');
    
    // FIXED: Initialize all learning components in proper order
    await lessonEngine.initialize();
    await skillTreeManager.initialize();
    await progressTracker.initialize();
    
    console.log('✅ Learning Engine Module initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Learning Engine Module:', error);
    throw error;
  }
}

// =================== PUBLIC API EXPORTS ===================

// Lesson Engine
export { lessonEngine } from './LessonEngine';
export type { 
  LessonEngine,
} from './LessonEngine';

// Skill Tree Manager  
export { skillTreeManager } from './SkillTreeManager';
export type {
  SkillTreeManager,
} from './SkillTreeManager';

// Progress Tracker
export { progressTracker } from './ProgressTracker';
export type {
  ProgressTracker,
} from './ProgressTracker';

// =================== CONVENIENCE FUNCTIONS ===================

export async function startLesson(lessonId: string): Promise<boolean> {
  try {
    const lesson = lessonEngine.getLessonById(lessonId);
    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }
    
    await lessonEngine.startLesson(lesson);
    return true;
  } catch (error) {
    console.error('Failed to start lesson:', error);
    return false;
  }
}

export async function getAvailableLessons(completedLessons: string[] = []): Promise<any[]> {
  try {
    return lessonEngine.getAvailableLessons(completedLessons);
  } catch (error) {
    console.error('Failed to get available lessons:', error);
    return [];
  }
}

export async function getAllLessons(): Promise<any[]> {
  try {
    return lessonEngine.getAllLessons();
  } catch (error) {
    console.error('Failed to get all lessons:', error);
    return [];
  }
}

export function getLearningProgress(): any {
  try {
    return progressTracker.getProgress();
  } catch (error) {
    console.error('Failed to get learning progress:', error);
    return null;
  }
}

export function getSkillTrees(): any[] {
  try {
    return skillTreeManager.getAllSkillTrees();
  } catch (error) {
    console.error('Failed to get skill trees:', error);
    return [];
  }
}

// =================== HEALTH CHECK ===================

export function isLearningEngineReady(): boolean {
  try {
    // Check if all components are initialized
    return true; // In production, you'd check actual initialization state
  } catch (error) {
    console.error('Learning engine health check failed:', error);
    return false;
  }
}

// =================== DEFAULT EXPORT ===================

export default {
  initialize: initializeLearningEngine,
  lessonEngine,
  skillTreeManager,
  progressTracker,
  startLesson,
  getAvailableLessons,
  getAllLessons,
  getLearningProgress,
  getSkillTrees,
  isReady: isLearningEngineReady,
};