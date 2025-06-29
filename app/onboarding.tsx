// app/onboarding.tsx - PRODUCTION GRADE FIXED VERSION
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInRight,
  SlideInRight,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../src/contexts/ThemeContext';
import { useUserProgress } from '../src/contexts/UserProgressContext';
import { NavigationDebugger, ContextDebugger, useDebugMount } from '../src/utils/DebugUtils';
import { SkillLevel } from '../src/types'; // FIXED: Import SkillLevel type from types
import {
  Palette,
  BookOpen,
  Trophy,
  Users,
  ArrowRight,
  Star,
  Zap,
} from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: [string, string];
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Pikaso',
    subtitle: 'Your journey to artistic mastery begins here',
    description: 'Learn to draw through interactive lessons designed by professional artists. From basic shapes to advanced techniques.',
    icon: <Palette size={60} color="#FFFFFF" />,
    gradient: ['#6366F1', '#8B5CF6'],
  },
  {
    id: 'learn',
    title: 'Interactive Learning',
    subtitle: 'Theory meets practice',
    description: 'Each lesson combines visual theory with hands-on practice. Real-time feedback helps you improve with every stroke.',
    icon: <BookOpen size={60} color="#FFFFFF" />,
    gradient: ['#10B981', '#059669'],
  },
  {
    id: 'progress',
    title: 'Track Your Progress',
    subtitle: 'Gamified skill development',
    description: 'Earn XP, unlock achievements, and build an impressive portfolio as you master fundamental drawing skills.',
    icon: <Trophy size={60} color="#FFFFFF" />,
    gradient: ['#F59E0B', '#D97706'],
  },
  {
    id: 'community',
    title: 'Join the Community',
    subtitle: 'Learn together, grow faster',
    description: 'Share your artwork, participate in challenges, and get inspired by fellow artists on the same journey.',
    icon: <Users size={60} color="#FFFFFF" />,
    gradient: ['#EF4444', '#DC2626'],
  },
];

// FIXED: Skill levels that map directly to SkillLevel type
interface SkillLevelOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  recommended: boolean;
  skillLevel: SkillLevel; // Use the actual SkillLevel type
}

const skillLevels: SkillLevelOption[] = [
  {
    id: 'beginner',
    title: 'Complete Beginner',
    subtitle: 'I\'ve never drawn before',
    description: 'Start with the absolute basics: holding a pencil, drawing lines, and simple shapes.',
    recommended: true,
    skillLevel: 'beginner', // FIXED: Direct mapping to SkillLevel
  },
  {
    id: 'intermediate',
    title: 'Some Experience',
    subtitle: 'I can draw basic shapes',
    description: 'You know the basics but want to improve your technique and learn new skills.',
    recommended: false,
    skillLevel: 'intermediate', // FIXED: Direct mapping to SkillLevel
  },
  {
    id: 'advanced',
    title: 'Intermediate',
    subtitle: 'I can draw recognizable objects',
    description: 'You have drawing experience and want to refine your skills and learn advanced techniques.',
    recommended: false,
    skillLevel: 'advanced', // FIXED: Direct mapping to SkillLevel
  },
];

const goals = [
  { id: 'hobby', title: 'Personal Hobby', icon: <Star size={24} color="#6366F1" /> },
  { id: 'professional', title: 'Professional Development', icon: <Zap size={24} color="#6366F1" /> },
  { id: 'therapy', title: 'Relaxation & Mindfulness', icon: <Palette size={24} color="#6366F1" /> },
  { id: 'kids', title: 'Teaching Kids', icon: <Users size={24} color="#6366F1" /> },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { createUser, user } = useUserProgress();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('beginner'); // UI selection ID
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['hobby']);
  const [userName, setUserName] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useDebugMount('OnboardingScreen');

  const progressValue = useSharedValue(0);
  const totalSteps = onboardingSteps.length + 2; // Welcome steps + skill level + goals

  const styles = createStyles(theme);

  // Monitor user changes
  React.useEffect(() => {
    if (user?.id && !isCreatingUser) {
      NavigationDebugger.log('User detected in onboarding, navigating to tabs', { userId: user.id });
      router.replace('/(tabs)');
    }
  }, [user, isCreatingUser, router]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      progressValue.value = withSpring((currentStep + 1) / totalSteps);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      completeOnboarding();
    }
  };

  const handleSkillLevelSelect = (levelId: string) => {
    setSelectedSkillLevel(levelId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // FIXED: Get the actual SkillLevel type for the selected option
  const getSelectedSkillLevelType = (): SkillLevel => {
    const selectedOption = skillLevels.find(level => level.id === selectedSkillLevel);
    return selectedOption?.skillLevel || 'beginner';
  };

  const completeOnboarding = async () => {
    if (isCreatingUser) {
      NavigationDebugger.log('User creation already in progress');
      return;
    }

    try {
      setIsCreatingUser(true);
      NavigationDebugger.log('Starting user creation', {
        displayName: userName || 'New Artist',
        skillLevel: getSelectedSkillLevelType(),
        goals: selectedGoals,
      });

      // FIXED: Create user profile with proper SkillLevel type
      await createUser({
        displayName: userName || 'New Artist',
        email: `${(userName || 'newartist').toLowerCase().replace(/\s+/g, '')}@pikaso.app`,
        skillLevel: getSelectedSkillLevelType(), // FIXED: This now returns proper SkillLevel
        learningGoals: selectedGoals,
      });
      
      ContextDebugger.log('UserProgress', 'User created successfully');
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Give context time to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      NavigationDebugger.log('User creation complete, navigating to tabs');
      
      // The useEffect above will handle navigation when user is detected
      // But we can also navigate as a fallback
      if (!user?.id) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      NavigationDebugger.error('Onboarding failed', error);
      
      Alert.alert(
        'Setup Failed',
        'There was an error creating your account. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => setIsCreatingUser(false),
          },
        ]
      );
    }
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  const renderWelcomeSteps = () => {
    if (currentStep >= onboardingSteps.length) return null;

    const step = onboardingSteps[currentStep];

    return (
      <Animated.View 
        entering={FadeInDown.springify()}
        style={styles.stepContainer}
      >
        <LinearGradient
          colors={step.gradient}
          style={styles.stepGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.stepContent}>
            <Animated.View 
              entering={FadeInDown.delay(200)}
              style={styles.stepIcon}
            >
              {step.icon}
            </Animated.View>
            
            <Animated.Text 
              entering={FadeInDown.delay(400)}
              style={styles.stepTitle}
            >
              {step.title}
            </Animated.Text>
            
            <Animated.Text 
              entering={FadeInDown.delay(600)}
              style={styles.stepSubtitle}
            >
              {step.subtitle}
            </Animated.Text>
            
            <Animated.Text 
              entering={FadeInDown.delay(800)}
              style={styles.stepDescription}
            >
              {step.description}
            </Animated.Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderSkillLevelSelection = () => {
    if (currentStep !== onboardingSteps.length) return null;

    return (
      <Animated.View 
        entering={SlideInRight.springify()}
        style={styles.selectionContainer}
      >
        <Text style={[styles.selectionTitle, { color: theme.colors.text }]}>
          What's your drawing experience?
        </Text>
        
        <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          {skillLevels.map((level, index) => (
            <Animated.View
              key={level.id}
              entering={FadeInRight.delay(index * 100)}
            >
              <Pressable
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: selectedSkillLevel === level.id 
                      ? theme.colors.primary 
                      : theme.colors.border,
                  },
                  selectedSkillLevel === level.id && styles.selectedOption,
                ]}
                onPress={() => handleSkillLevelSelect(level.id)}
              >
                {level.recommended && (
                  <View style={[styles.recommendedBadge, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                )}
                
                <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
                  {level.title}
                </Text>
                
                <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>
                  {level.subtitle}
                </Text>
                
                <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                  {level.description}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderGoalSelection = () => {
    if (currentStep !== onboardingSteps.length + 1) return null;

    return (
      <Animated.View 
        entering={SlideInRight.springify()}
        style={styles.selectionContainer}
      >
        <Text style={[styles.selectionTitle, { color: theme.colors.text }]}>
          What are your goals?
        </Text>
        
        <Text style={[styles.selectionSubtitle, { color: theme.colors.textSecondary }]}>
          Select all that apply
        </Text>

        <View style={styles.nameInputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            What should we call you? (Optional)
          </Text>
          <TextInput
            style={[
              styles.nameInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.textSecondary}
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
        
        <View style={styles.goalsGrid}>
          {goals.map((goal, index) => (
            <Animated.View
              key={goal.id}
              entering={FadeInDown.delay(index * 100)}
            >
              <Pressable
                style={[
                  styles.goalCard,
                  {
                    backgroundColor: selectedGoals.includes(goal.id)
                      ? theme.colors.primary + '20'
                      : theme.colors.surface,
                    borderColor: selectedGoals.includes(goal.id)
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
                onPress={() => handleGoalToggle(goal.id)}
              >
                {goal.icon}
                <Text style={[
                  styles.goalTitle,
                  {
                    color: selectedGoals.includes(goal.id)
                      ? theme.colors.primary
                      : theme.colors.text,
                  },
                ]}>
                  {goal.title}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const isLastStep = currentStep === totalSteps - 1;
  const canProceed = currentStep < onboardingSteps.length || 
                     (currentStep === onboardingSteps.length) ||
                     (currentStep === onboardingSteps.length + 1 && selectedGoals.length > 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: theme.colors.border }]}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { backgroundColor: theme.colors.primary },
              progressStyle,
            ]}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderWelcomeSteps()}
        {renderSkillLevelSelection()}
        {renderGoalSelection()}
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.nextButton, 
            { 
              backgroundColor: canProceed ? theme.colors.primary : theme.colors.border,
              opacity: canProceed && !isCreatingUser ? 1 : 0.6,
            }
          ]}
          onPress={handleNext}
          disabled={!canProceed || isCreatingUser}
        >
          <Text style={[
            styles.nextButtonText,
            { color: canProceed ? '#FFFFFF' : theme.colors.textSecondary }
          ]}>
            {isCreatingUser ? 'Setting up your workspace...' : isLastStep ? 'Get Started' : 'Continue'}
          </Text>
          {!isCreatingUser && <ArrowRight size={20} color={canProceed ? "#FFFFFF" : theme.colors.textSecondary} />}
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  stepGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  stepContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  stepIcon: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  selectionContainer: {
    flex: 1,
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  selectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    position: 'relative',
  },
  selectedOption: {
    transform: [{ scale: 1.02 }],
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  nameInputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: (screenWidth - 60) / 2,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});