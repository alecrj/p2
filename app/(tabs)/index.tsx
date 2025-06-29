import React, { useEffect, useMemo, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useUserProgress } from '../../src/contexts/UserProgressContext';
import { useLearning } from '../../src/contexts/LearningContext';
import { typography } from '../../src/constants/typography';
import * as Haptics from 'expo-haptics';
import {
  Zap,
  Target,
  Clock,
  ArrowRight,
  Trophy,
  Palette,
  Users,
  TrendingUp,
  BookOpen,
  Star,
  Award,
  Calendar,
  Activity,
} from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { 
    user, 
    isLoading, 
    getDailyGoalProgress, 
    checkDailyStreak,
    progress 
  } = useUserProgress();
  const { recommendedLesson, learningProgress, insights } = useLearning();

  // FIXED: Memoize styles to prevent unnecessary recalculations
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Daily challenge state
  const [dailyChallenge, setDailyChallenge] = React.useState<any>(null);

  // Safe data access with fallbacks and memoization
  const userStats = useMemo(() => ({
    level: progress?.level || 1,
    xp: progress?.xp || 0,
    xpToNextLevel: progress?.xpToNextLevel || 100,
    streakDays: progress?.streakDays || 0,
    achievements: progress?.achievements || [],
  }), [progress]);

  const xpProgress = useMemo(() => {
    const { xp, xpToNextLevel } = userStats;
    return xpToNextLevel > 0 ? Math.min(1, xp / (xp + xpToNextLevel)) : 0;
  }, [userStats]);

  useEffect(() => {
    console.log('🏠 Home Screen: Mounted');
    
    // Check daily streak
    if (checkDailyStreak) {
      checkDailyStreak();
    }
    
    // Set daily challenge
    setDailyChallenge({
      theme: "Draw your morning coffee",
      participants: 847,
      type: 'daily',
      reward: 50,
      timeLeft: '18h 32m'
    });

    return () => {
      console.log('🏠 Home Screen: Unmounted');
    };
  }, [checkDailyStreak]);

  // FIXED: Memoize handlers to prevent unnecessary re-renders
  const handleStartLesson = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('🏠 Starting lesson navigation');
      
      if (recommendedLesson) {
        // Navigate to specific lesson
        router.push(`/lesson/${recommendedLesson.id}`);
      } else {
        // Navigate to learn tab
        router.push('/(tabs)/learn');
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  }, [recommendedLesson, router]);

  const handleStartDrawing = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('🏠 Starting drawing navigation');
      
      // Navigate to draw tab
      router.push('/(tabs)/draw');
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  }, [router]);

  const handleViewChallenge = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('🏠 Viewing challenge');
      
      // Navigate to challenges tab
      router.push('/(tabs)/challenges');
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  }, [router]);

  const handleViewGallery = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('🏠 Navigating to gallery');
      
      router.push('/(tabs)/gallery');
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  }, [router]);

  // FIXED: Safe daily goal calculation with memoization
  const dailyGoalProgress = useMemo(() => {
    try {
      return getDailyGoalProgress ? getDailyGoalProgress() : 0;
    } catch (error) {
      console.error('❌ Error calculating daily goal:', error);
      return 0;
    }
  }, [getDailyGoalProgress]);

  // FIXED: Safe achievements count with memoization
  const completedAchievements = useMemo(() => {
    try {
      return userStats.achievements.filter((a: any) => a.unlockedAt).length;
    } catch (error) {
      console.error('❌ Error counting achievements:', error);
      return 0;
    }
  }, [userStats.achievements]);

  // FIXED: Replace SVG progress with React Native compatible component
  const renderProgressBar = useCallback((progress: number) => {
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill,
              { width: `${Math.min(100, Math.max(0, progress * 100))}%` }
            ]}
          />
        </View>
      </View>
    );
  }, [styles]);

  // FIXED: Render loading state with proper error handling
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading your workspace...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Welcome Section */}
      <View style={[styles.welcomeSection, { paddingHorizontal: theme.spacing?.md || 16 }]}>
        <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>
          Welcome back,
        </Text>
        <Text style={[
          styles.userName, 
          { 
            color: theme.colors.text, 
            fontSize: typography.h2.fontSize, 
            fontWeight: typography.h2.fontWeight 
          }
        ]}>
          {user?.displayName || 'Artist'}
        </Text>
      </View>

      {/* Progress Card */}
      <View style={{ paddingHorizontal: theme.spacing?.md || 16, marginTop: theme.spacing?.md || 16 }}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark || theme.colors.primary]}
          style={[styles.progressCard, { borderRadius: theme.borderRadius?.xl || 16 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.progressHeader}>
            <View>
              <Text style={[
                styles.levelText, 
                { 
                  fontSize: typography.h3.fontSize, 
                  fontWeight: typography.h3.fontWeight 
                }
              ]}>
                Level {userStats.level}
              </Text>
              <Text style={styles.xpText}>
                {userStats.xp.toLocaleString()} / {(userStats.xpToNextLevel + userStats.xp).toLocaleString()} XP
              </Text>
            </View>
            <View style={styles.streakContainer}>
              <Zap size={24} color="#FFC107" />
              <Text style={styles.streakText}>{userStats.streakDays}</Text>
            </View>
          </View>
          
          {renderProgressBar(xpProgress)}
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Target size={20} color="white" />
              <Text style={styles.statValue}>{Math.round(dailyGoalProgress)}%</Text>
              <Text style={styles.statLabel}>Daily Goal</Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={20} color="white" />
              <Text style={styles.statValue}>
                {learningProgress?.completedLessons?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
            <View style={styles.statItem}>
              <Trophy size={20} color="white" />
              <Text style={styles.statValue}>
                {completedAchievements}
              </Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View style={[styles.section, { paddingHorizontal: theme.spacing?.md || 16 }]}>
        <Text style={[
          styles.sectionTitle, 
          { 
            color: theme.colors.text, 
            fontSize: typography.h3.fontSize, 
            fontWeight: typography.h3.fontWeight 
          }
        ]}>
          Quick Actions
        </Text>
        
        <View style={styles.actionGrid}>
          {/* Continue Learning */}
          <Pressable
            onPress={handleStartLesson}
            style={({ pressed }) => [
              styles.actionCard,
              { 
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius?.lg || 12,
                opacity: pressed ? 0.8 : 1,
              }
            ]}
          >
            <LinearGradient
              colors={[theme.colors.primary + '20', theme.colors.primary + '10']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <BookOpen size={28} color={theme.colors.primary} />
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
              Continue Learning
            </Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
              {recommendedLesson?.title || 'Start Drawing Fundamentals'}
            </Text>
            <ArrowRight 
              size={20} 
              color={theme.colors.primary} 
              style={styles.actionArrow}
            />
          </Pressable>

          {/* Free Draw */}
          <Pressable
            onPress={handleStartDrawing}
            style={({ pressed }) => [
              styles.actionCard,
              { 
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius?.lg || 12,
                opacity: pressed ? 0.8 : 1,
              }
            ]}
          >
            <LinearGradient
              colors={[theme.colors.secondary + '20', theme.colors.secondary + '10']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Palette size={28} color={theme.colors.secondary} />
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
              Free Draw
            </Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
              Practice & Create
            </Text>
            <ArrowRight 
              size={20} 
              color={theme.colors.secondary} 
              style={styles.actionArrow}
            />
          </Pressable>
        </View>
      </View>

      {/* Daily Challenge */}
      {dailyChallenge && (
        <View style={[styles.section, { paddingHorizontal: theme.spacing?.md || 16 }]}>
          <Text style={[
            styles.sectionTitle, 
            { 
              color: theme.colors.text, 
              fontSize: typography.h3.fontSize, 
              fontWeight: typography.h3.fontWeight 
            }
          ]}>
            Today's Challenge
          </Text>
          
          <Pressable
            onPress={handleViewChallenge}
            style={({ pressed }) => [
              styles.challengeCard,
              { 
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius?.lg || 12,
                opacity: pressed ? 0.8 : 1,
              }
            ]}
          >
            <LinearGradient
              colors={['#FF6B6B', '#4ECDC4']}
              style={[
                StyleSheet.absoluteFillObject,
                { borderRadius: theme.borderRadius?.lg || 12 }
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.challengeContent}>
              <Trophy size={32} color="white" />
              <View style={styles.challengeText}>
                <Text style={[
                  styles.challengeTitle, 
                  { 
                    fontSize: typography.h4.fontSize, 
                    fontWeight: typography.h4.fontWeight 
                  }
                ]}>
                  {dailyChallenge.theme}
                </Text>
                <Text style={styles.challengeDescription}>
                  {dailyChallenge.participants.toLocaleString()} artists participating
                </Text>
                {dailyChallenge.timeLeft && (
                  <Text style={styles.challengeTime}>
                    {dailyChallenge.timeLeft} left
                  </Text>
                )}
              </View>
              <ArrowRight size={24} color="white" />
            </View>
          </Pressable>
        </View>
      )}

      {/* Learning Insights */}
      {insights && insights.length > 0 && (
        <View style={[styles.section, { paddingHorizontal: theme.spacing?.md || 16 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle, 
              { 
                color: theme.colors.text, 
                fontSize: typography.h3.fontSize, 
                fontWeight: typography.h3.fontWeight 
              }
            ]}>
              Your Progress
            </Text>
            <TrendingUp size={24} color={theme.colors.primary} />
          </View>
          
          <View style={styles.insightsGrid}>
            <View style={[styles.insightCard, { backgroundColor: theme.colors.surface }]}>
              <Activity size={24} color={theme.colors.primary} />
              <Text style={[styles.insightNumber, { color: theme.colors.text }]}>
                {userStats.xp.toLocaleString()}
              </Text>
              <Text style={[styles.insightLabel, { color: theme.colors.textSecondary }]}>
                Total XP Earned
              </Text>
            </View>
            
            <View style={[styles.insightCard, { backgroundColor: theme.colors.surface }]}>
              <Star size={24} color={theme.colors.warning} />
              <Text style={[styles.insightNumber, { color: theme.colors.text }]}>
                {userStats.level}
              </Text>
              <Text style={[styles.insightLabel, { color: theme.colors.textSecondary }]}>
                Current Level
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Community Activity */}
      <View style={[styles.section, { paddingHorizontal: theme.spacing?.md || 16 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[
            styles.sectionTitle, 
            { 
              color: theme.colors.text, 
              fontSize: typography.h3.fontSize, 
              fontWeight: typography.h3.fontWeight 
            }
          ]}>
            Community Highlights
          </Text>
          <Pressable onPress={handleViewGallery}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              See All
            </Text>
          </Pressable>
        </View>
        
        <Pressable
          onPress={handleViewGallery}
          style={({ pressed }) => [
            styles.communityCard,
            { 
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius?.lg || 12,
              opacity: pressed ? 0.8 : 1,
            }
          ]}
        >
          <LinearGradient
            colors={[theme.colors.primary + '15', theme.colors.secondary + '15']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Users size={28} color={theme.colors.primary} />
          <View style={styles.communityTextContainer}>
            <Text style={[styles.communityTitle, { color: theme.colors.text }]}>
              Join the Community
            </Text>
            <Text style={[styles.communitySubtitle, { color: theme.colors.textSecondary }]}>
              Share your artwork and get inspired by 10,000+ artists
            </Text>
          </View>
          <ArrowRight size={20} color={theme.colors.primary} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  welcomeSection: {
    marginTop: 16,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '400',
  },
  userName: {
    marginTop: 4,
  },
  progressCard: {
    padding: 24,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelText: {
    color: 'white',
  },
  xpText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontSize: 14,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 16,
  },
  progressBarContainer: {
    marginTop: 20,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 120,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  actionSubtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  actionArrow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  challengeCard: {
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  challengeText: {
    flex: 1,
    marginLeft: 16,
  },
  challengeTitle: {
    color: 'white',
    fontWeight: '700',
  },
  challengeDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontSize: 14,
  },
  challengeTime: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  insightNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  insightLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  communityTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  communityTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  communitySubtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
});