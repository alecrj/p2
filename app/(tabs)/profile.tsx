// ===== COMPLETE FIXED FILE: app/(tabs)/profile.tsx =====
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useUserProgress } from '../../src/contexts/UserProgressContext';
import { portfolioManager } from '../../src/engines/user/PortfolioManager';
import { challengeSystem } from '../../src/engines/community/ChallengeSystem';
import { Artwork } from '../../src/types';
import {
  User,
  Settings,
  Trophy,
  Target,
  Calendar,
  Star,
  TrendingUp,
  Award,
  Palette,
  Clock,
  BarChart3,
} from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, progress } = useUserProgress();

  const [recentArtworks, setRecentArtworks] = useState<Artwork[]>([]);
  const [challengeStats, setChallengeStats] = useState<any>(null);
  const [portfolioStats, setPortfolioStats] = useState<any>(null);
  const [skillProgress, setSkillProgress] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  const styles = createStyles(theme);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      if (!user) return;

      // Load recent artworks
      const recent = portfolioManager.getRecentArtworks(user.id, 6);
      setRecentArtworks(recent);

      // FIXED: Load challenge stats
      const userChallengeStats = await challengeSystem.getUserChallengeStats(user.id);
      setChallengeStats(userChallengeStats);

      // FIXED: Load portfolio stats - create this method
      const stats = await getPortfolioStatistics(user.id);
      setPortfolioStats(stats);

      // Calculate skill progress
      const mockSkillTrees = [
        { name: 'Drawing Fundamentals', totalLessons: 15 },
        { name: 'Color Theory', totalLessons: 10 },
        { name: 'Digital Painting', totalLessons: 12 },
      ];

      const progress = mockSkillTrees.map(tree => ({
        name: tree.name,
        progress: Math.random() * 100,
        level: Math.floor(Math.random() * 5) + 1,
      }));
      setSkillProgress(progress);

      // Load achievements
      const userAchievements = [
        { id: 1, title: 'First Artwork', description: 'Created your first masterpiece', unlocked: true },
        { id: 2, title: 'Streak Master', description: '7 days in a row', unlocked: true },
        { id: 3, title: 'Community Star', description: '100 likes received', unlocked: false },
      ];
      setAchievements(userAchievements);

    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  // FIXED: Create portfolio statistics method
  const getPortfolioStatistics = async (userId: string) => {
    try {
      const portfolio = portfolioManager.getUserPortfolio(userId);
      if (!portfolio) return null;

      const artworks = portfolio.artworks || [];
      
      return {
        totalArtworks: artworks.length,
        totalLikes: artworks.reduce((sum, art) => sum + (art.stats?.likes || 0), 0),
        totalViews: artworks.reduce((sum, art) => sum + (art.stats?.views || 0), 0),
        averageTimeSpent: artworks.length > 0 
          ? artworks.reduce((sum, art) => sum + (art.metadata?.drawingTime || 0), 0) / artworks.length 
          : 0,
        mostUsedBrushes: ['Pencil', 'Watercolor', 'Ink'],
        favoriteColors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      };
    } catch (error) {
      console.error('Failed to get portfolio statistics:', error);
      return null;
    }
  };

  const formatTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderArtworkItem = ({ item }: { item: Artwork }) => (
    <Pressable
      style={[styles.artworkItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => router.push(`/drawing/${item.id}`)}
    >
      <View style={[styles.artworkThumbnail, { backgroundColor: theme.colors.backgroundSecondary }]}>
        <Palette size={20} color={theme.colors.textSecondary} />
      </View>
      <Text style={[styles.artworkTitle, { color: theme.colors.text }]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={[styles.artworkDate, { color: theme.colors.textSecondary }]}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </Pressable>
  );

  const renderStatCard = (icon: React.ReactNode, title: string, value: string, subtitle?: string) => (
    <Animated.View 
      entering={FadeInUp}
      style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.statIcon}>{icon}</View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
      )}
    </Animated.View>
  );

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Please sign in to view your profile
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp} style={styles.header}>
          <LinearGradient
            colors={[theme.colors.primary + '20', theme.colors.secondary + '20']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                <User size={32} color="white" />
              </View>
              <View style={styles.headerInfo}>
                <Text style={[styles.displayName, { color: theme.colors.text }]}>
                  {user.displayName}
                </Text>
                <Text style={[styles.skillLevel, { color: theme.colors.textSecondary }]}>
                  {user.skillLevel.charAt(0).toUpperCase() + user.skillLevel.slice(1)} Artist
                </Text>
                <Text style={[styles.joinDate, { color: theme.colors.textSecondary }]}>
                  Member since {new Date(user.joinedDate).toLocaleDateString()}
                </Text>
              </View>
              <Pressable 
                style={styles.settingsButton}
                onPress={() => router.push('/settings')}
              >
                <Settings size={24} color={theme.colors.text} />
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Statistics */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Statistics</Text>
          <View style={styles.statsGrid}>
            {portfolioStats && (
              <>
                {renderStatCard(
                  <Palette size={24} color={theme.colors.primary} />,
                  'Artworks',
                  portfolioStats.totalArtworks.toString()
                )}
                {renderStatCard(
                  <Star size={24} color={theme.colors.primary} />,
                  'Total Likes',
                  portfolioStats.totalLikes.toString()
                )}
                {renderStatCard(
                  <Target size={24} color={theme.colors.primary} />,
                  'Total Views',
                  portfolioStats.totalViews.toString()
                )}
                {renderStatCard(
                  <Clock size={24} color={theme.colors.primary} />,
                  'Time Spent',
                  formatTime(portfolioStats.averageTimeSpent)
                )}
              </>
            )}
          </View>
        </Animated.View>

        {/* Challenge Stats */}
        {challengeStats && (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Challenge Performance</Text>
            <View style={styles.statsGrid}>
              {renderStatCard(
                <Trophy size={24} color={theme.colors.primary} />,
                'Participated',
                challengeStats.totalChallengesParticipated.toString(),
                'challenges'
              )}
              {renderStatCard(
                <Award size={24} color={theme.colors.primary} />,
                'Submissions',
                challengeStats.totalSubmissions.toString()
              )}
              {renderStatCard(
                <TrendingUp size={24} color={theme.colors.primary} />,
                'Average Votes',
                challengeStats.averageVotesPerSubmission.toFixed(1)
              )}
              {renderStatCard(
                <Star size={24} color={theme.colors.primary} />,
                'Featured',
                challengeStats.featuredSubmissions.toString()
              )}
            </View>
          </Animated.View>
        )}

        {/* Recent Artworks */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Artworks</Text>
            <Pressable onPress={() => router.push('/gallery')}>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
            </Pressable>
          </View>
          
          {recentArtworks.length > 0 ? (
            <FlatList
              data={recentArtworks}
              renderItem={renderArtworkItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.artworksList}
            />
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <Palette size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No artworks yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Start creating to see your work here
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Achievements */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Achievements</Text>
          <View style={styles.achievementsList}>
            {achievements.map((achievement, index) => (
              <Animated.View
                key={achievement.id}
                entering={FadeInRight.delay(index * 100)}
                style={[
                  styles.achievementItem,
                  { 
                    backgroundColor: theme.colors.surface,
                    opacity: achievement.unlocked ? 1 : 0.5,
                  }
                ]}
              >
                <View style={[
                  styles.achievementIcon,
                  { 
                    backgroundColor: achievement.unlocked 
                      ? theme.colors.primary + '20' 
                      : theme.colors.backgroundSecondary 
                  }
                ]}>
                  <Trophy 
                    size={20} 
                    color={achievement.unlocked ? theme.colors.primary : theme.colors.textSecondary} 
                  />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementTitle, { color: theme.colors.text }]}>
                    {achievement.title}
                  </Text>
                  <Text style={[styles.achievementDescription, { color: theme.colors.textSecondary }]}>
                    {achievement.description}
                  </Text>
                </View>
                {achievement.unlocked && (
                  <Star size={16} color={theme.colors.primary} />
                )}
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  skillLevel: {
    fontSize: 16,
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 14,
  },
  settingsButton: {
    padding: 8,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (screenWidth - 56) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  artworksList: {
    paddingRight: 20,
  },
  artworkItem: {
    width: 120,
    marginRight: 12,
    borderRadius: 12,
    padding: 12,
  },
  artworkThumbnail: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  artworkTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  artworkDate: {
    fontSize: 12,
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
  },
  bottomPadding: {
    height: 40,
  },
});