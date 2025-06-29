// src/engines/community/index.ts
export { SocialEngine } from './SocialEngine';
export { ChallengeSystem } from './ChallengeSystem';

import { SocialEngine } from './SocialEngine';
import { ChallengeSystem } from './ChallengeSystem';

export const socialEngine = SocialEngine.getInstance();
export const challengeSystem = ChallengeSystem.getInstance();

export async function initializeCommunityEngine(): Promise<void> {
  try {
    console.log('Community engine initialized successfully');
  } catch (error) {
    console.error('Failed to initialize community engine:', error);
    throw error;
  }
}