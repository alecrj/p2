import { Artwork, Comment } from '../../types';
import { EventBus } from '../core/EventBus';
import { errorHandler } from '../core/ErrorHandler';
import { dataManager } from '../core/DataManager';

// Define User type locally since it's not in the main types
interface SocialUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  following: string[];
  followers: string[];
  isVerified: boolean;
  isOnline: boolean;
  lastSeenAt: number;
}

interface FeedItem {
  id: string;
  type: 'artwork' | 'achievement' | 'challenge' | 'milestone';
  userId: string;
  content: {
    artworkId?: string;
    achievementId?: string;
    challengeId?: string;
    milestoneType?: string;
    text?: string;
  };
  timestamp: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
}

interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'achievement' | 'challenge';
  fromUserId?: string;
  relatedId?: string;
  message: string;
  read: boolean;
  createdAt: number;
}

/**
 * Social Engine - Manages social features, relationships, and community interactions
 * Handles following, feed generation, notifications, and social engagement
 */
export class SocialEngine {
  private static instance: SocialEngine;
  private eventBus: EventBus = EventBus.getInstance();
  
  // Social data storage
  private users: Map<string, SocialUser> = new Map();
  private followRelations: Map<string, Set<string>> = new Map(); // userId -> following userIds
  private artworkEngagement: Map<string, {
    likes: Set<string>;
    comments: Comment[];
    shares: Set<string>;
    views: Set<string>;
  }> = new Map();
  
  private feedCache: Map<string, FeedItem[]> = new Map();
  private notifications: Map<string, Notification[]> = new Map();
  
  // Social metrics
  private engagementMetrics: Map<string, {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    engagementRate: number;
  }> = new Map();
  
  private constructor() {
    this.loadSocialData();
    this.setupEventListeners();
  }

  public static getInstance(): SocialEngine {
    if (!SocialEngine.instance) {
      SocialEngine.instance = new SocialEngine();
    }
    return SocialEngine.instance;
  }

  // ---- PUBLIC API ----

  public followUser(followerId: string, followedId: string): boolean {
    if (followerId === followedId) return false;
    
    const followerRelations = this.followRelations.get(followerId) || new Set();
    if (followerRelations.has(followedId)) return false;
    
    followerRelations.add(followedId);
    this.followRelations.set(followerId, followerRelations);
    
    // Update user objects
    const follower = this.users.get(followerId);
    const followed = this.users.get(followedId);
    
    if (follower && followed) {
      follower.following.push(followedId);
      followed.followers.push(followerId);
      
      // Create notification
      this.createNotification(followedId, 'follow', followerId);
      
      // Update engagement metrics
      this.updateUserEngagement(followedId);
      
      this.saveSocialData();
      this.eventBus.emit('social:follow', { followerId, followedId });
      
      return true;
    }
    
    return false;
  }

  public unfollowUser(followerId: string, followedId: string): boolean {
    const followerRelations = this.followRelations.get(followerId);
    if (!followerRelations || !followerRelations.has(followedId)) return false;
    
    followerRelations.delete(followedId);
    
    // Update user objects
    const follower = this.users.get(followerId);
    const followed = this.users.get(followedId);
    
    if (follower && followed) {
      follower.following = follower.following.filter(id => id !== followedId);
      followed.followers = followed.followers.filter(id => id !== followerId);
      
      this.saveSocialData();
      this.eventBus.emit('social:unfollow', { followerId, followedId });
      
      return true;
    }
    
    return false;
  }

  public isFollowing(followerId: string, followedId: string): boolean {
    const relations = this.followRelations.get(followerId);
    return relations ? relations.has(followedId) : false;
  }

  public getFollowers(userId: string): string[] {
    const user = this.users.get(userId);
    return user ? user.followers : [];
  }

  public getFollowing(userId: string): string[] {
    const user = this.users.get(userId);
    return user ? user.following : [];
  }

  public generateFeed(userId: string, limit: number = 20): FeedItem[] {
    // Check cache first
    const cached = this.feedCache.get(userId);
    if (cached && cached.length >= limit) {
      return cached.slice(0, limit);
    }
    
    const following = this.getFollowing(userId);
    const feedItems: FeedItem[] = [];
    
    // Collect artworks from followed users
    following.forEach(followedId => {
      const userArtworks = this.getUserArtworks(followedId);
      userArtworks
        .filter(artwork => artwork.visibility === 'public')
        .forEach(artwork => {
          const engagement = this.artworkEngagement.get(artwork.id);
          feedItems.push({
            id: `feed_artwork_${artwork.id}`,
            type: 'artwork',
            userId: followedId,
            content: { artworkId: artwork.id },
            timestamp: artwork.createdAt,
            engagement: {
              likes: engagement?.likes.size || 0,
              comments: engagement?.comments.length || 0,
              shares: engagement?.shares.size || 0,
            },
          });
        });
    });
    
    // Add user's own artworks
    const userArtworks = this.getUserArtworks(userId);
    userArtworks.forEach(artwork => {
      const engagement = this.artworkEngagement.get(artwork.id);
      feedItems.push({
        id: `feed_artwork_${artwork.id}`,
        type: 'artwork',
        userId,
        content: { artworkId: artwork.id },
        timestamp: artwork.createdAt,
        engagement: {
          likes: engagement?.likes.size || 0,
          comments: engagement?.comments.length || 0,
          shares: engagement?.shares.size || 0,
        },
      });
    });
    
    // Sort by timestamp and engagement
    feedItems.sort((a, b) => {
      // Recent items first, but boost high engagement items
      const scoreA = this.calculateFeedScore(a);
      const scoreB = this.calculateFeedScore(b);
      return scoreB - scoreA;
    });
    
    // Cache the feed
    this.feedCache.set(userId, feedItems);
    
    return feedItems.slice(0, limit);
  }

  public likeArtwork(artworkId: string, userId: string): boolean {
    const engagement = this.getOrCreateEngagement(artworkId);
    
    if (engagement.likes.has(userId)) return false;
    
    engagement.likes.add(userId);
    
    // Create notification for artwork owner
    const artwork = this.getArtwork(artworkId);
    if (artwork && artwork.userId !== userId) {
      this.createNotification(artwork.userId, 'like', userId, artworkId);
    }
    
    // Update metrics
    this.updateArtworkMetrics(artworkId);
    
    this.saveSocialData();
    this.eventBus.emit('social:like', { artworkId, userId });
    
    return true;
  }

  public unlikeArtwork(artworkId: string, userId: string): boolean {
    const engagement = this.artworkEngagement.get(artworkId);
    if (!engagement || !engagement.likes.has(userId)) return false;
    
    engagement.likes.delete(userId);
    this.updateArtworkMetrics(artworkId);
    
    this.saveSocialData();
    this.eventBus.emit('social:unlike', { artworkId, userId });
    
    return true;
  }

  public commentOnArtwork(artworkId: string, userId: string, content: string): Comment {
    const engagement = this.getOrCreateEngagement(artworkId);
    
    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      content,
      createdAt: Date.now(),
      likes: 0,
      replies: [],
      isLiked: false,
    };
    
    engagement.comments.push(comment);
    
    // Create notification for artwork owner
    const artwork = this.getArtwork(artworkId);
    if (artwork && artwork.userId !== userId) {
      this.createNotification(artwork.userId, 'comment', userId, artworkId);
    }
    
    // Update metrics
    this.updateArtworkMetrics(artworkId);
    
    this.saveSocialData();
    this.eventBus.emit('social:comment', { artworkId, userId, comment });
    
    return comment;
  }

  public shareArtwork(artworkId: string, userId: string): boolean {
    const engagement = this.getOrCreateEngagement(artworkId);
    
    if (engagement.shares.has(userId)) return false;
    
    engagement.shares.add(userId);
    this.updateArtworkMetrics(artworkId);
    
    this.saveSocialData();
    this.eventBus.emit('social:share', { artworkId, userId });
    
    return true;
  }

  public viewArtwork(artworkId: string, userId: string): void {
    const engagement = this.getOrCreateEngagement(artworkId);
    engagement.views.add(userId);
    
    this.updateArtworkMetrics(artworkId);
    this.eventBus.emit('social:view', { artworkId, userId });
  }

  public getArtworkEngagement(artworkId: string): {
    likes: number;
    comments: Comment[];
    shares: number;
    views: number;
    isLikedByUser?: boolean;
  } {
    const engagement = this.artworkEngagement.get(artworkId) || {
      likes: new Set(),
      comments: [],
      shares: new Set(),
      views: new Set(),
    };
    
    return {
      likes: engagement.likes.size,
      comments: engagement.comments,
      shares: engagement.shares.size,
      views: engagement.views.size,
    };
  }

  public getTrendingArtworks(limit: number = 10): Artwork[] {
    // Calculate trending score based on recent engagement
    const artworkScores: Map<string, number> = new Map();
    
    this.artworkEngagement.forEach((engagement, artworkId) => {
      const artwork = this.getArtwork(artworkId);
      if (artwork && artwork.visibility === 'public') {
        const ageInDays = (Date.now() - artwork.createdAt) / (1000 * 60 * 60 * 24);
        const engagementScore = engagement.likes.size + (engagement.comments.length * 2);
        
        // Time decay factor - newer content scores higher
        const timeDecay = Math.exp(-ageInDays / 7); // Half-life of 1 week
        const trendingScore = engagementScore * timeDecay;
        
        artworkScores.set(artworkId, trendingScore);
      }
    });
    
    // Sort by score and return top artworks
    const sortedArtworkIds = Array.from(artworkScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
    
    return sortedArtworkIds
      .map(id => this.getArtwork(id))
      .filter(artwork => artwork !== null) as Artwork[];
  }

  public getRecommendedArtists(userId: string, limit: number = 5): SocialUser[] {
    const following = new Set(this.getFollowing(userId));
    const recommendations: Map<string, number> = new Map();
    
    // Find artists followed by people you follow
    following.forEach(followedId => {
      const theirFollowing = this.getFollowing(followedId);
      theirFollowing.forEach(artistId => {
        if (artistId !== userId && !following.has(artistId)) {
          const score = recommendations.get(artistId) || 0;
          recommendations.set(artistId, score + 1);
        }
      });
    });
    
    // Also consider artists with high engagement
    const artistScores = new Map<string, number>();
    this.artworkEngagement.forEach((engagement, artworkId) => {
      const artwork = this.getArtwork(artworkId);
      if (artwork && artwork.userId !== userId && !following.has(artwork.userId)) {
        const current = artistScores.get(artwork.userId) || 0;
        const score = engagement.likes.size + engagement.comments.length;
        artistScores.set(artwork.userId, current + score);
      }
    });
    
    // Combine scores
    artistScores.forEach((score, artistId) => {
      const current = recommendations.get(artistId) || 0;
      recommendations.set(artistId, current + score / 10); // Weight engagement lower
    });
    
    // Sort and return top recommendations
    return Array.from(recommendations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => this.users.get(id))
      .filter(user => user !== undefined) as SocialUser[];
  }

  public getNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
    const userNotifications = this.notifications.get(userId) || [];
    
    if (unreadOnly) {
      return userNotifications.filter(n => !n.read);
    }
    
    return userNotifications;
  }

  public markNotificationAsRead(notificationId: string, userId: string): boolean {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;
    
    const notification = userNotifications.find(n => n.id === notificationId);
    if (!notification) return false;
    
    notification.read = true;
    this.saveSocialData();
    
    return true;
  }

  public markAllNotificationsAsRead(userId: string): void {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return;
    
    userNotifications.forEach(n => n.read = true);
    this.saveSocialData();
  }

  public getUserStats(userId: string): {
    followers: number;
    following: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
    engagementRate: number;
  } {
    const user = this.users.get(userId);
    if (!user) {
      return {
        followers: 0,
        following: 0,
        totalLikes: 0,
        totalComments: 0,
        totalViews: 0,
        engagementRate: 0,
      };
    }
    
    let totalLikes = 0;
    let totalComments = 0;
    let totalViews = 0;
    let totalArtworks = 0;
    
    // Calculate totals from user's artworks
    const userArtworks = this.getUserArtworks(userId);
    userArtworks.forEach(artwork => {
      const engagement = this.artworkEngagement.get(artwork.id);
      if (engagement) {
        totalLikes += engagement.likes.size;
        totalComments += engagement.comments.length;
        totalViews += engagement.views.size;
        totalArtworks++;
      }
    });
    
    const engagementRate = totalArtworks > 0 
      ? ((totalLikes + totalComments) / (totalViews || 1)) * 100
      : 0;
    
    return {
      followers: user.followers.length,
      following: user.following.length,
      totalLikes,
      totalComments,
      totalViews,
      engagementRate,
    };
  }

  public createUser(userData: Partial<SocialUser>): SocialUser {
    const user: SocialUser = {
      id: userData.id || `user_${Date.now()}`,
      username: userData.username || 'user',
      displayName: userData.displayName || userData.username || 'User',
      avatar: userData.avatar,
      bio: userData.bio,
      following: [],
      followers: [],
      isVerified: false,
      isOnline: true,
      lastSeenAt: Date.now(),
    };
    
    this.users.set(user.id, user);
    this.followRelations.set(user.id, new Set());
    this.notifications.set(user.id, []);
    
    this.saveSocialData();
    this.eventBus.emit('social:user_created', { user });
    
    return user;
  }

  public updateUserStatus(userId: string, isOnline: boolean): void {
    const user = this.users.get(userId);
    if (!user) return;
    
    user.isOnline = isOnline;
    user.lastSeenAt = Date.now();
    
    this.saveSocialData();
    this.eventBus.emit('social:user_status', { userId, isOnline });
  }

  // ---- PRIVATE METHODS ----

  private getOrCreateEngagement(artworkId: string) {
    let engagement = this.artworkEngagement.get(artworkId);
    if (!engagement) {
      engagement = {
        likes: new Set(),
        comments: [],
        shares: new Set(),
        views: new Set(),
      };
      this.artworkEngagement.set(artworkId, engagement);
    }
    return engagement;
  }

  private getUserArtworks(userId: string): Artwork[] {
    // This would typically fetch from the portfolio manager
    // For now, return empty array
    return [];
  }

  private getArtwork(artworkId: string): Artwork | null {
    // This would typically fetch from the portfolio manager
    // For now, return null
    return null;
  }

  private createNotification(
    userId: string,
    type: Notification['type'],
    fromUserId?: string,
    relatedId?: string
  ): void {
    const notifications = this.notifications.get(userId) || [];
    
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      fromUserId,
      relatedId,
      message: this.generateNotificationMessage(type, fromUserId),
      read: false,
      createdAt: Date.now(),
    };
    
    notifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.splice(100);
    }
    
    this.notifications.set(userId, notifications);
    this.eventBus.emit('social:notification', { notification });
  }

  private generateNotificationMessage(type: string, fromUserId?: string): string {
    const fromUser = fromUserId ? this.users.get(fromUserId) : null;
    const fromName = fromUser ? fromUser.displayName : 'Someone';
    
    switch (type) {
      case 'like':
        return `${fromName} liked your artwork`;
      case 'comment':
        return `${fromName} commented on your artwork`;
      case 'follow':
        return `${fromName} started following you`;
      case 'achievement':
        return 'You unlocked a new achievement!';
      case 'challenge':
        return 'New challenge available!';
      default:
        return 'You have a new notification';
    }
  }

  private calculateFeedScore(item: FeedItem): number {
    const ageInHours = (Date.now() - item.timestamp) / (1000 * 60 * 60);
    const engagementScore = 
      item.engagement.likes * 3 + 
      item.engagement.comments * 5 + 
      item.engagement.shares * 10;
    
    // Time decay - newer content scores higher
    const timeDecay = Math.exp(-ageInHours / 24); // Half-life of 24 hours
    
    return engagementScore * timeDecay + item.timestamp / 1000000;
  }

  private updateArtworkMetrics(artworkId: string): void {
    const engagement = this.artworkEngagement.get(artworkId);
    if (!engagement) return;
    
    const artwork = this.getArtwork(artworkId);
    if (!artwork) return;
    
    // Update user engagement metrics
    this.updateUserEngagement(artwork.userId);
  }

  private updateUserEngagement(userId: string): void {
    const userArtworks = this.getUserArtworks(userId);
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalViews = 0;
    
    userArtworks.forEach(artwork => {
      const engagement = this.artworkEngagement.get(artwork.id);
      if (engagement) {
        totalLikes += engagement.likes.size;
        totalComments += engagement.comments.length;
        totalShares += engagement.shares.size;
        totalViews += engagement.views.size;
      }
    });
    
    const engagementRate = totalViews > 0 
      ? ((totalLikes + totalComments + totalShares) / totalViews) * 100
      : 0;
    
    this.engagementMetrics.set(userId, {
      totalLikes,
      totalComments,
      totalShares,
      engagementRate,
    });
  }

  private setupEventListeners(): void {
    // Listen for artwork creation
    this.eventBus.on('artwork:created', ({ artwork }: { artwork: Artwork }) => {
      // Initialize engagement tracking
      this.getOrCreateEngagement(artwork.id);
      
      // Clear feed cache for followers
      const user = this.users.get(artwork.userId);
      if (user) {
        user.followers.forEach(followerId => {
          this.feedCache.delete(followerId);
        });
      }
    });
    
    // Listen for user activity
    this.eventBus.on('user:active', ({ userId }: { userId: string }) => {
      this.updateUserStatus(userId, true);
    });
    
    this.eventBus.on('user:inactive', ({ userId }: { userId: string }) => {
      this.updateUserStatus(userId, false);
    });
  }

  private async loadSocialData(): Promise<void> {
    try {
      const savedUsers = await dataManager.get<Record<string, SocialUser>>('social_users');
      if (savedUsers) {
        Object.entries(savedUsers).forEach(([id, user]) => {
          this.users.set(id, user);
        });
      }
      
      const savedRelations = await dataManager.get<Record<string, string[]>>('follow_relations');
      if (savedRelations) {
        Object.entries(savedRelations).forEach(([userId, following]) => {
          this.followRelations.set(userId, new Set(following));
        });
      }
      
      const savedEngagement = await dataManager.get<any>('artwork_engagement');
      if (savedEngagement) {
        // Convert saved data back to Maps and Sets
        Object.entries(savedEngagement).forEach(([artworkId, data]: [string, any]) => {
          this.artworkEngagement.set(artworkId, {
            likes: new Set(data.likes || []),
            comments: data.comments || [],
            shares: new Set(data.shares || []),
            views: new Set(data.views || []),
          });
        });
      }
      
      const savedNotifications = await dataManager.get<Record<string, Notification[]>>('notifications');
      if (savedNotifications) {
        Object.entries(savedNotifications).forEach(([userId, notifs]) => {
          this.notifications.set(userId, notifs);
        });
      }
    } catch (error) {
      console.error('Failed to load social data:', error);
    }
  }

  private async saveSocialData(): Promise<void> {
    try {
      // Save users
      const usersObj: Record<string, SocialUser> = {};
      this.users.forEach((user, id) => {
        usersObj[id] = user;
      });
      await dataManager.set('social_users', usersObj);
      
      // Save follow relations
      const relationsObj: Record<string, string[]> = {};
      this.followRelations.forEach((following, userId) => {
        relationsObj[userId] = Array.from(following);
      });
      await dataManager.set('follow_relations', relationsObj);
      
      // Save engagement data
      const engagementObj: Record<string, any> = {};
      this.artworkEngagement.forEach((engagement, artworkId) => {
        engagementObj[artworkId] = {
          likes: Array.from(engagement.likes),
          comments: engagement.comments,
          shares: Array.from(engagement.shares),
          views: Array.from(engagement.views),
        };
      });
      await dataManager.set('artwork_engagement', engagementObj);
      
      // Save notifications
      const notificationsObj: Record<string, Notification[]> = {};
      this.notifications.forEach((notifs, userId) => {
        notificationsObj[userId] = notifs;
      });
      await dataManager.set('notifications', notificationsObj);
    } catch (error) {
      console.error('Failed to save social data:', error);
    }
  }
}

// Export singleton instance
export const socialEngine = SocialEngine.getInstance();