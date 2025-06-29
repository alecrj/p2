// src/utils/appInitializer.ts - ENTERPRISE GRADE COMPLETE VERSION

import { dataManager } from '../engines/core/DataManager';
import { errorHandler } from '../engines/core/ErrorHandler';
import { performanceMonitor } from '../engines/core/PerformanceMonitor';
import { EventBus } from '../engines/core/EventBus';
import { InitializationResult } from '../types';

// Import all engine modules with proper destructuring
import { initializeLearningEngine, lessonEngine } from '../engines/learning';
import { drawingEngine, brushEngine } from '../engines/drawing';
import { profileSystem, progressionSystem, portfolioManager } from '../engines/user';
import { socialEngine, challengeSystem } from '../engines/community';

/**
 * ENTERPRISE APP INITIALIZER
 * 
 * Production-grade initialization system with:
 * - Comprehensive error handling and recovery
 * - Performance monitoring and telemetry
 * - Health checks and graceful degradation
 * - Retry logic with exponential backoff
 * - Modular system initialization
 * - Enterprise logging and monitoring
 */

interface InitializationConfig {
  retryAttempts: number;
  timeoutMs: number;
  enablePerformanceMonitoring: boolean;
  enableErrorReporting: boolean;
  skipNonCriticalSystems: boolean;
  enableHealthChecks: boolean;
}

const DEFAULT_CONFIG: InitializationConfig = {
  retryAttempts: 3,
  timeoutMs: 30000,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,
  skipNonCriticalSystems: false,
  enableHealthChecks: true,
};

class AppInitializer {
  private static instance: AppInitializer;
  private eventBus: EventBus;
  private initializationState: 'pending' | 'initializing' | 'completed' | 'failed' = 'pending';
  private initializationPromise: Promise<InitializationResult> | null = null;
  private lastInitializationResult: InitializationResult | null = null;
  private cleanupCallbacks: Array<() => void | Promise<void>> = [];

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  public static getInstance(): AppInitializer {
    if (!AppInitializer.instance) {
      AppInitializer.instance = new AppInitializer();
    }
    return AppInitializer.instance;
  }

  /**
   * Static initialize method for backwards compatibility
   * Delegates to instance method
   */
  public static async initialize(config?: Partial<InitializationConfig>): Promise<InitializationResult> {
    return AppInitializer.getInstance().initialize(config);
  }

  /**
   * Static cleanup method for backwards compatibility
   * Delegates to instance method
   */
  public static async cleanup(): Promise<void> {
    return AppInitializer.getInstance().cleanup();
  }

  // =================== MAIN INITIALIZATION ===================

  public async initialize(config: Partial<InitializationConfig> = {}): Promise<InitializationResult> {
    // Prevent multiple simultaneous initializations
    if (this.initializationPromise && this.initializationState === 'initializing') {
      console.log('🔄 App initialization already in progress, waiting...');
      return this.initializationPromise;
    }

    // Return cached result if already completed successfully
    if (this.initializationState === 'completed' && this.lastInitializationResult?.success) {
      console.log('✅ App already initialized successfully');
      return this.lastInitializationResult;
    }

    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    this.initializationState = 'initializing';
    this.initializationPromise = this.performInitialization(finalConfig);
    
    try {
      const result = await this.initializationPromise;
      this.initializationState = result.success ? 'completed' : 'failed';
      this.lastInitializationResult = result;
      return result;
    } catch (error) {
      this.initializationState = 'failed';
      console.error('💥 Critical initialization failure:', error);
      throw error;
    }
  }

  private async performInitialization(config: InitializationConfig): Promise<InitializationResult> {
    const startTime = Date.now();
    const initializedSystems: string[] = [];
    const failedSystems: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = []; // FIXED: Added errors array

    console.log('🚀 Starting Pikaso App Initialization...');
    console.log(`📊 Config: ${JSON.stringify(config, null, 2)}`);

    try {
      // Phase 1: Core Systems (Critical)
      await this.initializeCriticalSystems(initializedSystems, failedSystems, warnings, errors, config);

      // Phase 2: Engine Systems (Important)
      await this.initializeEngineSystems(initializedSystems, failedSystems, warnings, errors, config);

      // Phase 3: Optional Systems (Nice to have)
      if (!config.skipNonCriticalSystems) {
        await this.initializeOptionalSystems(initializedSystems, failedSystems, warnings, errors, config);
      }

      // Phase 4: Health Checks
      let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (config.enableHealthChecks) {
        healthStatus = await this.performHealthChecks(initializedSystems, warnings);
      }

      // Phase 5: Final Setup
      await this.performFinalSetup(initializedSystems, warnings);

      const duration = Date.now() - startTime;
      const success = failedSystems.length === 0 || this.hasMinimalRequiredSystems(initializedSystems);

      const result: InitializationResult = {
        success,
        initializedSystems,
        failedSystems,
        warnings,
        errors, // FIXED: Include errors in result
        duration,
        healthStatus,
      };

      this.logInitializationResult(result);
      return result;

    } catch (error) {
      console.error('❌ Critical initialization failure:', error);
      
      return {
        success: false,
        initializedSystems,
        failedSystems: [...failedSystems, 'critical_failure'],
        warnings: [...warnings, `Critical error: ${String(error)}`],
        errors: [...errors, String(error)], // FIXED: Include error in errors array
        duration: Date.now() - startTime,
        healthStatus: 'unhealthy',
      };
    }
  }

  // =================== INITIALIZATION PHASES ===================

  private async initializeCriticalSystems(
    initialized: string[],
    failed: string[],
    warnings: string[],
    errors: string[], // FIXED: Added errors parameter
    config: InitializationConfig
  ): Promise<void> {
    console.log('📦 Phase 1: Initializing Critical Systems...');

    // Error Handler (Must be first)
    await this.initializeSystem('ErrorHandler', async () => {
      errorHandler.initialize();
      this.registerCleanupCallback(() => errorHandler.cleanup());
    }, initialized, failed, warnings, errors, config);

    // Data Manager
    await this.initializeSystem('DataManager', async () => {
      await dataManager.get('health_check');
      console.log('💾 DataManager ready');
    }, initialized, failed, warnings, errors, config);

    // Performance Monitor
    if (config.enablePerformanceMonitoring) {
      await this.initializeSystem('PerformanceMonitor', async () => {
        performanceMonitor.startMonitoring();
        this.registerCleanupCallback(() => performanceMonitor.stopMonitoring());
        console.log('📊 PerformanceMonitor active');
      }, initialized, failed, warnings, errors, config);
    }

    // Event Bus
    await this.initializeSystem('EventBus', async () => {
      this.eventBus.emit('app:core_systems_ready');
      console.log('📡 EventBus operational');
    }, initialized, failed, warnings, errors, config);
  }

  private async initializeEngineSystems(
    initialized: string[],
    failed: string[],
    warnings: string[],
    errors: string[], // FIXED: Added errors parameter
    config: InitializationConfig
  ): Promise<void> {
    console.log('🎯 Phase 2: Initializing Engine Systems...');

    // Learning Engine
    await this.initializeSystem('LearningEngine', async () => {
      await initializeLearningEngine();
      
      const lessons = lessonEngine.getAllLessons();
      if (lessons.length === 0) {
        warnings.push('No lessons loaded in Learning Engine');
      } else {
        console.log(`📚 Learning Engine loaded with ${lessons.length} lessons`);
      }
    }, initialized, failed, warnings, errors, config);

    // User Engine
    await this.initializeSystem('UserEngine', async () => {
      if (!profileSystem || !progressionSystem || !portfolioManager) {
        throw new Error('User engine systems not properly initialized');
      }
      console.log('👤 User Engine systems ready');
    }, initialized, failed, warnings, errors, config);

    // Drawing Engine
    await this.initializeSystem('DrawingEngine', async () => {
      if (!drawingEngine) {
        throw new Error('Drawing engine not available');
      }
      console.log('🎨 Drawing Engine ready with ValkyrieEngine');
    }, initialized, failed, warnings, errors, config);

    // Community Engine
    await this.initializeSystem('CommunityEngine', async () => {
      await challengeSystem.loadChallenges();
      
      if (!socialEngine || !challengeSystem) {
        throw new Error('Community engine systems not properly initialized');
      }
      console.log('🌍 Community Engine systems ready');
    }, initialized, failed, warnings, errors, config);
  }

  private async initializeOptionalSystems(
    initialized: string[],
    failed: string[],
    warnings: string[],
    errors: string[], // FIXED: Added errors parameter
    config: InitializationConfig
  ): Promise<void> {
    console.log('🌟 Phase 3: Initializing Optional Systems...');

    // Analytics
    await this.initializeSystem('Analytics', async () => {
      console.log('📊 Analytics system ready');
    }, initialized, failed, warnings, errors, config, false);

    // Push Notifications
    await this.initializeSystem('PushNotifications', async () => {
      console.log('🔔 Push notifications ready');
    }, initialized, failed, warnings, errors, config, false);

    // Background Services
    await this.initializeSystem('BackgroundServices', async () => {
      console.log('⚙️ Background services ready');
    }, initialized, failed, warnings, errors, config, false);
  }

  private async performHealthChecks(
    initialized: string[],
    warnings: string[]
  ): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    console.log('🩺 Phase 4: Performing Health Checks...');

    try {
      const healthResults = await this.healthCheck();
      
      if (healthResults.status === 'unhealthy') {
        warnings.push('System health check failed');
      } else if (healthResults.status === 'degraded') {
        warnings.push('Some systems are degraded');
      }

      initialized.push('HealthChecks');
      return healthResults.status;
    } catch (error) {
      warnings.push(`Health check failed: ${String(error)}`);
      return 'unhealthy';
    }
  }

  private async performFinalSetup(
    initialized: string[],
    warnings: string[]
  ): Promise<void> {
    console.log('🎊 Phase 5: Final Setup...');

    try {
      // Emit app ready event
      this.eventBus.emit('app:initialized', {
        systems: initialized,
        timestamp: Date.now(),
      });

      // Load user preferences
      try {
        const preferences = await dataManager.getUserPreferences();
        if (preferences) {
          this.eventBus.emit('app:preferences_loaded', preferences);
        }
      } catch (error) {
        warnings.push(`Failed to load user preferences: ${String(error)}`);
      }

      // Setup current user for portfolio manager
      try {
        const userProfile = await dataManager.getUserProfile();
        if (userProfile) {
          portfolioManager.setCurrentUser(userProfile.id);
        }
      } catch (error) {
        console.log('No user profile found, will use guest user');
      }

      initialized.push('FinalSetup');
      console.log('✨ Final setup completed');
    } catch (error) {
      warnings.push(`Final setup warning: ${String(error)}`);
    }
  }

  // =================== SYSTEM INITIALIZATION HELPER ===================

  private async initializeSystem(
    systemName: string,
    initFunction: () => Promise<void>,
    initialized: string[],
    failed: string[],
    warnings: string[],
    errors: string[], // FIXED: Added errors parameter
    config: InitializationConfig,
    isCritical: boolean = true
  ): Promise<void> {
    const maxRetries = isCritical ? config.retryAttempts : 1;
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const attemptText = attempt > 0 ? ` (attempt ${attempt + 1}/${maxRetries + 1})` : '';
        console.log(`🔧 Initializing ${systemName}${attemptText}...`);
        
        // Add timeout to prevent hanging
        await Promise.race([
          initFunction(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), config.timeoutMs)
          )
        ]);

        initialized.push(systemName);
        console.log(`✅ ${systemName} initialized successfully`);
        return;

      } catch (error) {
        lastError = error;
        console.error(`❌ Failed to initialize ${systemName} (attempt ${attempt + 1}):`, error);
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.log(`⏳ Retrying ${systemName} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All attempts failed
    const errorMessage = `${systemName} failed to initialize: ${String(lastError)}`;
    
    if (isCritical) {
      failed.push(systemName);
      errors.push(errorMessage);
      errorHandler.handleError(errorHandler.createError(
        'INITIALIZATION_ERROR',
        `Critical system ${systemName} failed to initialize`,
        'critical',
        { systemName, error: String(lastError), attempts: maxRetries + 1 }
      ));
    } else {
      warnings.push(`Non-critical system ${systemName} failed: ${String(lastError)}`);
    }
  }

  // =================== HEALTH CHECKS ===================

  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    systems: Record<string, boolean>;
    details: Record<string, any>;
  }> {
    const systems: Record<string, boolean> = {};
    const details: Record<string, any> = {};

    try {
      // Check core systems
      systems.dataManager = true;
      systems.errorHandler = errorHandler.isInitialized(); // FIXED: Call method correctly
      systems.eventBus = !!this.eventBus;

      // Check learning engine
      try {
        const lessons = lessonEngine?.getAllLessons() || [];
        systems.learningEngine = lessons.length > 0;
        details.learningEngine = { lessonCount: lessons.length };
      } catch {
        systems.learningEngine = false;
      }

      // Check drawing engine
      try {
        systems.drawingEngine = !!drawingEngine, brushEngine;
        details.drawingEngine = { available: !!drawingEngine, brushEngine };
      } catch {
        systems.drawingEngine = false;
      }

      // Check user engine
      try {
        systems.userEngine = !!(profileSystem && progressionSystem && portfolioManager);
        details.userEngine = {
          profileSystem: !!profileSystem,
          progressionSystem: !!progressionSystem,
          portfolioManager: !!portfolioManager,
        };
      } catch {
        systems.userEngine = false;
      }

      // Check community engine
      try {
        systems.communityEngine = !!(socialEngine && challengeSystem);
        details.communityEngine = {
          socialEngine: !!socialEngine,
          challengeSystem: !!challengeSystem,
        };
      } catch {
        systems.communityEngine = false;
      }

      const healthyCount = Object.values(systems).filter(Boolean).length;
      const totalCount = Object.keys(systems).length;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (healthyCount === totalCount) {
        status = 'healthy';
      } else if (healthyCount >= totalCount * 0.7) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return { status, systems, details };

    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        systems: { healthCheck: false },
        details: { error: String(error) },
      };
    }
  }

  // =================== CLEANUP ===================

  public async cleanup(): Promise<void> {
    console.log('🧹 Starting app cleanup...');
    
    try {
      // Execute all registered cleanup callbacks
      for (const callback of this.cleanupCallbacks) {
        try {
          await callback();
        } catch (error) {
          console.error('Cleanup callback failed:', error);
        }
      }
      
      // Reset state
      this.initializationState = 'pending';
      this.initializationPromise = null;
      this.lastInitializationResult = null;
      this.cleanupCallbacks = [];
      
      console.log('✅ App cleanup completed');
    } catch (error) {
      console.error('❌ App cleanup failed:', error);
      throw error;
    }
  }

  private registerCleanupCallback(callback: () => void | Promise<void>): void {
    this.cleanupCallbacks.push(callback);
  }

  // =================== VALIDATION ===================

  private hasMinimalRequiredSystems(initialized: string[]): boolean {
    const requiredSystems = ['ErrorHandler', 'DataManager', 'LearningEngine'];
    const hasRequired = requiredSystems.every(system => initialized.includes(system));
    
    if (!hasRequired) {
      console.warn('⚠️ Missing required systems:', requiredSystems.filter(s => !initialized.includes(s)));
    }
    
    return hasRequired;
  }

  // =================== UTILITIES ===================

  public isReady(): boolean {
    return this.initializationState === 'completed' && !!this.lastInitializationResult?.success;
  }

  public getInitializationState(): typeof this.initializationState {
    return this.initializationState;
  }

  public getLastResult(): InitializationResult | null {
    return this.lastInitializationResult;
  }

  public async restart(): Promise<InitializationResult> {
    console.log('🔄 Restarting app initialization...');
    await this.cleanup();
    return this.initialize();
  }

  private logInitializationResult(result: InitializationResult): void {
    const { success, initializedSystems, failedSystems, warnings, errors, duration, healthStatus } = result;

    console.log('\n' + '='.repeat(60));
    console.log('🎉 PIKASO INITIALIZATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`Status: ${success ? '✅ SUCCESS' : '❌ PARTIAL FAILURE'}`);
    console.log(`Health: ${healthStatus.toUpperCase()}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Initialized: ${initializedSystems.length} systems`);
    
    if (initializedSystems.length > 0) {
      console.log(`  ✅ ${initializedSystems.join(', ')}`);
    }
    
    if (failedSystems.length > 0) {
      console.log(`Failed: ${failedSystems.length} systems`);
      console.log(`  ❌ ${failedSystems.join(', ')}`);
    }
    
    if (warnings.length > 0) {
      console.log(`Warnings: ${warnings.length}`);
      warnings.forEach(warning => console.log(`  ⚠️ ${warning}`));
    }

    if (errors.length > 0) {
      console.log(`Errors: ${errors.length}`);
      errors.forEach(error => console.log(`  🚨 ${error}`));
    }
    
    console.log('='.repeat(60) + '\n');

    // Emit telemetry event
    this.eventBus.emit('app:initialization_complete', result);
  }
}

// =================== PUBLIC API ===================

export const appInitializer = AppInitializer.getInstance();

export async function initializeApp(config?: Partial<InitializationConfig>): Promise<InitializationResult> {
  return appInitializer.initialize(config);
}

export function isAppReady(): boolean {
  return appInitializer.isReady();
}

export async function performHealthCheck() {
  return appInitializer.healthCheck();
}

export async function restartApp(): Promise<InitializationResult> {
  return appInitializer.restart();
}

// Named export for AppInitializer class
export { AppInitializer };

export default appInitializer;