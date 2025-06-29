import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useUserProgress } from '../../src/contexts/UserProgressContext';
import { useLearning } from '../../src/contexts/LearningContext';
import { Lesson, SkillTree } from '../../src/types';
import * as Haptics from 'expo-haptics';
import {
  BookOpen,
  Play,
  Trophy,
  Star,
  ChevronRight,
  Target,
  Zap,
  TrendingUp,
  Clock,
  Award,
  CheckCircle,
  Circle,
  Lock,
} from 'lucide-react-native';

/**
 * ENTERPRISE LEARN SCREEN V2.0
 * 
 * ✅ FIXED CRITICAL ISSUES:
 * - Bulletproof null safety for setCurrentSkillTree
 * - Type-safe skill tree operations with fallbacks
 * - Enhanced error boundaries and recovery
 * - Performance optimized rendering with memoization
 * - Comprehensive user experience with loading states
 * - Enterprise-grade error handling throughout
 */
export default function LearnScreen() {
  // FIXED: All hooks called unconditionally at the top level in the same order every time
  const { theme } = useTheme();
  const router = useRouter();
  const { user, progress, addXP } = useUserProgress();
  const { 
    currentSkillTree, 
    setCurrentSkillTree, 
    startLesson,
    skillTrees,
    availableLessons,
    recommendedLessons,
    insights,
    completedLessons,
    currentStreak,
    getLessonProgress,
  } = useLearning();

  // FIXED: All useState hooks called unconditionally
  const [selectedSkillTree, setSelectedSkillTree] = useState<SkillTree | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [expandedSkillTree, setExpandedSkillTree] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [screenMounted, setScreenMounted] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // FIXED: Memoize styles to prevent unnecessary recalculations
  const styles = useMemo(() => createStyles(theme), [theme]);

  // FIXED: useEffect hooks called unconditionally
  useEffect(() => {
    setScreenMounted(true);
    console.log('🎓 Learn Screen: Mounted');
    return () => {
      setScreenMounted(false);
      console.log('🎓 Learn Screen: Unmounted');
    };
  }, []);

  // ✅ CRITICAL FIX: Enterprise-grade null safety for setCurrentSkillTree
  useEffect(() => {
    // FIXED: Comprehensive null/undefined checks with type safety
    if (!currentSkillTree && skillTrees && Array.isArray(skillTrees) && skillTrees.length > 0) {
      try {
        // Find default tree with proper fallback strategy
        const defaultTree = skillTrees.find(tree => 
          tree && typeof tree === 'object' && tree.id === 'fundamentals'
        ) || skillTrees[0];
        
        // FIXED: Only call setCurrentSkillTree if it exists and defaultTree is valid
        if (defaultTree && typeof setCurrentSkillTree === 'function') {
          console.log(`🎓 Setting default skill tree: ${defaultTree.name || defaultTree.id}`);
          setCurrentSkillTree(defaultTree);
          setSelectedSkillTree(defaultTree);
          setExpandedSkillTree(defaultTree.id);
        } else {
          console.warn('⚠️ setCurrentSkillTree function not available or invalid default tree');
          // Enterprise fallback: Set local state without context if function unavailable
          if (defaultTree) {
            setSelectedSkillTree(defaultTree);
            setExpandedSkillTree(defaultTree.id);
          }
        }
      } catch (error) {
        console.error('❌ Error setting default skill tree:', error);
        // Enterprise pattern: Graceful degradation
        if (skillTrees.length > 0 && skillTrees[0]) {
          setSelectedSkillTree(skillTrees[0]);
          setExpandedSkillTree(skillTrees[0].id);
        }
      }
    }
  }, [skillTrees, currentSkillTree, setCurrentSkillTree]);

  // FIXED: All callback functions defined unconditionally with proper error handling
  const handleLessonStart = useCallback(async (lesson: Lesson) => {
    if (isLoadingLesson) return;

    try {
      console.log(`🎓 Starting lesson: ${lesson.title}`);
      setIsLoadingLesson(true);
      
      // Check if lesson is available with proper null safety
      const lessonProgress = getLessonProgress && typeof getLessonProgress === 'function' 
        ? getLessonProgress(lesson.id) 
        : 0;
      
      if (lessonProgress >= 100) {
        Alert.alert(
          'Lesson Completed',
          'You\'ve already completed this lesson. Would you like to review it?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Review', 
              onPress: () => {
                router.push(`/lesson/${lesson.id}`);
              }
            },
          ]
        );
        return;
      }

      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Start the lesson with proper null safety
      if (startLesson && typeof startLesson === 'function') {
        await startLesson(lesson);
      } else {
        console.warn('⚠️ startLesson function not available, proceeding to lesson anyway');
      }
      
      // Navigate to lesson
      router.push(`/lesson/${lesson.id}`);
      
    } catch (error) {
      console.error('❌ Failed to start lesson:', error);
      Alert.alert('Error', 'Failed to start lesson. Please try again.');
    } finally {
      setIsLoadingLesson(false);
    }
  }, [isLoadingLesson, getLessonProgress, startLesson, router]);

  const handleSkillTreeSelect = useCallback((skillTree: SkillTree) => {
    try {
      console.log(`🎓 Selected skill tree: ${skillTree.name || skillTree.id}`);
      setSelectedSkillTree(skillTree);
      
      // FIXED: Only call setCurrentSkillTree if function exists
      if (setCurrentSkillTree && typeof setCurrentSkillTree === 'function') {
        setCurrentSkillTree(skillTree);
      } else {
        console.warn('⚠️ setCurrentSkillTree function not available');
      }
      
      setExpandedSkillTree(skillTree.id);
      
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('❌ Error selecting skill tree:', error);
      // Fallback: still update local state
      setSelectedSkillTree(skillTree);
      setExpandedSkillTree(skillTree.id);
    }
  }, [setCurrentSkillTree]);

  const toggleSkillTreeExpansion = useCallback((treeId: string) => {
    setExpandedSkillTree(prev => prev === treeId ? null : treeId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('🎓 Refreshing learn content...');
      // Refresh data logic would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // FIXED: Replace SVG progress ring with React Native-compatible component
  const renderProgressRing = useCallback((progress: number, size: number = 60) => {
    const radius = (size - 8) / 2;
    const strokeWidth = 4;
    
    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        {/* Background circle */}
        <View
          style={{
            position: 'absolute',
            width: size - strokeWidth,
            height: size - strokeWidth,
            borderRadius: (size - strokeWidth) / 2,
            borderWidth: strokeWidth,
            borderColor: theme.colors.border,
          }}
        />
        {/* Progress circle - using a clever border trick */}
        <View
          style={{
            position: 'absolute',
            width: size - strokeWidth,
            height: size - strokeWidth,
            borderRadius: (size - strokeWidth) / 2,
            borderWidth: strokeWidth,
            borderColor: 'transparent',
            borderTopColor: theme.colors.primary,
            borderRightColor: progress > 25 ? theme.colors.primary : 'transparent',
            borderBottomColor: progress > 50 ? theme.colors.primary : 'transparent',
            borderLeftColor: progress > 75 ? theme.colors.primary : 'transparent',
            transform: [
              { rotate: '-90deg' },
            ],
          }}
        />
        {/* Progress text */}
        <Text style={[styles.progressNumber, { color: theme.colors.text }]}>
          {Math.round(progress)}%
        </Text>
      </View>
    );
  }, [theme.colors, styles.progressNumber]);

  const renderSkillTree = useCallback((skillTree: SkillTree) => {
    const isExpanded = expandedSkillTree === skillTree.id;
    const isSelected = selectedSkillTree?.id === skillTree.id;
    const progress = skillTree.progress || 0;
    
    return (
      <Animated.View 
        key={skillTree.id}
        entering={FadeInUp.delay(100)}
        style={styles.skillTreeContainer}
      >
        <Pressable
          style={[
            styles.skillTreeHeader,
            {
              backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.surface,
              borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => handleSkillTreeSelect(skillTree)}
        >
          <View style={styles.skillTreeInfo}>
            <Text style={[styles.skillTreeTitle, { color: theme.colors.text }]}>
              {skillTree.name}
            </Text>
            <Text style={[styles.skillTreeDescription, { color: theme.colors.textSecondary }]}>
              {skillTree.description}
            </Text>
            <View style={styles.skillTreeStats}>
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {skillTree.lessons?.length || 0} lessons • {skillTree.estimatedDuration || 0}h
              </Text>
            </View>
          </View>
          {renderProgressRing(progress, 50)}
        </Pressable>

        {isExpanded && skillTree.lessons && (
          <Animated.View 
            entering={FadeInDown}
            style={styles.lessonsContainer}
          >
            {skillTree.lessons
              .sort((a, b) => a.order - b.order)
              .map((lesson, index) => renderLesson(lesson, index))}
          </Animated.View>
        )}
      </Animated.View>
    );
  }, [expandedSkillTree, selectedSkillTree, handleSkillTreeSelect, renderProgressRing, styles, theme.colors]);

  const renderLesson = useCallback((lesson: Lesson, index: number) => {
    // FIXED: Safe function call with null checking
    const progress = getLessonProgress && typeof getLessonProgress === 'function' 
      ? getLessonProgress(lesson.id) 
      : 0;
    const isCompleted = progress >= 100;
    const isAvailable = lesson.prerequisites ? 
      lesson.prerequisites.every(prereq => completedLessons?.includes(prereq)) : 
      true;

    return (
      <Pressable
        key={lesson.id}
        style={[
          styles.lessonCard,
          {
            backgroundColor: isCompleted 
              ? theme.colors.success + '20' 
              : theme.colors.surface,
            borderColor: isCompleted 
              ? theme.colors.success 
              : theme.colors.border,
            opacity: isAvailable ? 1 : 0.6,
          },
        ]}
        onPress={() => isAvailable && handleLessonStart(lesson)}
        disabled={!isAvailable || isLoadingLesson}
      >
        <View style={styles.lessonHeader}>
          <View style={[styles.lessonNumber, { backgroundColor: theme.colors.primary + '20' }]}>
            {isCompleted ? (
              <CheckCircle size={16} color={theme.colors.success} />
            ) : isAvailable ? (
              <Text style={[styles.lessonNumberText, { color: theme.colors.primary }]}>
                {index + 1}
              </Text>
            ) : (
              <Lock size={16} color={theme.colors.textSecondary} />
            )}
          </View>
          <View style={styles.lessonInfo}>
            <Text style={[styles.lessonTitle, { color: theme.colors.text }]}>
              {lesson.title}
            </Text>
            <Text style={[styles.lessonDescription, { color: theme.colors.textSecondary }]}>
              {lesson.description}
            </Text>
            <View style={styles.lessonMeta}>
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                <Clock size={12} color={theme.colors.textSecondary} />
                {' '}{lesson.estimatedTime || 10}min • {lesson.rewards?.xp || 10} XP
              </Text>
            </View>
          </View>
          <View style={styles.lessonAction}>
            {isLoadingLesson ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : isCompleted ? (
              <Trophy size={24} color={theme.colors.success} />
            ) : (
              <Play size={24} color={isAvailable ? theme.colors.primary : theme.colors.textSecondary} />
            )}
          </View>
        </View>
        
        {progress > 0 && progress < 100 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressBarBg, { backgroundColor: theme.colors.border }]}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  { backgroundColor: theme.colors.primary, width: `${progress}%` },
                ]}
              />
            </View>
          </View>
        )}
      </Pressable>
    );
  }, [getLessonProgress, completedLessons, handleLessonStart, isLoadingLesson, styles, theme.colors]);

  const renderInsights = useCallback(() => {
    if (!insights || insights.length === 0) return null;

    return (
      <Animated.View 
        entering={FadeInUp.delay(200)}
        style={styles.insightsContainer}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Learning Insights
          </Text>
          <Pressable onPress={() => setShowInsights(!showInsights)}>
            <TrendingUp size={24} color={theme.colors.primary} />
          </Pressable>
        </View>

        {showInsights && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {insights.slice(0, 3).map((insight, index) => (
              <View
                key={insight.id}
                style={[
                  styles.insightCard,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <TrendingUp size={20} color={theme.colors.primary} />
                <Text style={[styles.insightTitle, { color: theme.colors.text }]}>
                  {insight.title}
                </Text>
                <Text style={[styles.insightDescription, { color: theme.colors.textSecondary }]}>
                  {insight.description}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    );
  }, [insights, showInsights, styles, theme.colors]);

  const renderRecommendations = useCallback(() => {
    if (!recommendedLessons || recommendedLessons.length === 0) return null;

    return (
      <Animated.View 
        entering={FadeInUp.delay(300)}
        style={styles.recommendationsContainer}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recommended for You
          </Text>
          <Target size={24} color={theme.colors.primary} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recommendedLessons.slice(0, 3).map((lesson) => (
            <Pressable
              key={lesson.id}
              style={[
                styles.recommendationCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
              ]}
              onPress={() => handleLessonStart(lesson)}
            >
              <Star size={20} color={theme.colors.primary} />
              <Text style={[styles.recommendationTitle, { color: theme.colors.text }]}>
                {lesson.title}
              </Text>
              <Text style={[styles.recommendationMeta, { color: theme.colors.textSecondary }]}>
                <Clock size={12} color={theme.colors.textSecondary} />
                {' '}{lesson.estimatedTime || 10}min • {lesson.rewards?.xp || 10} XP
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    );
  }, [recommendedLessons, handleLessonStart, styles, theme.colors]);

  const renderStats = useCallback(() => {
    const totalLessons = skillTrees?.reduce((sum, tree) => sum + (tree.lessons?.length || 0), 0) || 0;
    const completedCount = completedLessons?.length || 0;
    const streakDays = currentStreak || 0;
    
    return (
      <Animated.View 
        entering={FadeInUp.delay(100)}
        style={styles.statsContainer}
      >
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <BookOpen size={24} color={theme.colors.primary} />
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>{completedCount}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Completed</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Zap size={24} color={theme.colors.warning} />
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>{streakDays}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Day Streak</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Target size={24} color={theme.colors.success} />
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>{totalLessons}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Lessons</Text>
        </View>
      </Animated.View>
    );
  }, [skillTrees, completedLessons, currentStreak, styles, theme.colors]);

  // Render loading state with enterprise UX
  if (!screenMounted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading learning content...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render empty state with enterprise UX
  if (!skillTrees || skillTrees.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyContainer}>
          <BookOpen size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No Lessons Available
          </Text>
          <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
            Check back soon for new learning content!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp} style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Learn & Practice
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Master drawing through structured lessons
          </Text>
        </Animated.View>

        {renderStats()}
        {renderInsights()}
        {renderRecommendations()}

        <View style={styles.skillTreesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Skill Trees
          </Text>
          {skillTrees.map(renderSkillTree)}
        </View>

        {/* Bottom padding for safe area */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
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
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
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
  insightsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  insightCard: {
    width: 280,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8,
  },
  insightDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  recommendationCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8,
  },
  recommendationMeta: {
    fontSize: 14,
    marginTop: 4,
  },
  skillTreesSection: {
    padding: 20,
    paddingTop: 0,
  },
  skillTreeContainer: {
    marginBottom: 16,
  },
  skillTreeHeader: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  skillTreeInfo: {
    flex: 1,
    marginRight: 16,
  },
  skillTreeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  skillTreeDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  skillTreeStats: {
    flexDirection: 'row',
  },
  statText: {
    fontSize: 12,
  },
  progressNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  lessonsContainer: {
    paddingTop: 8,
  },
  lessonCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  lessonDescription: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonAction: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    marginTop: 12,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});