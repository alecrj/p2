// app/(tabs)/challenges.tsx - COMPLETE COMMERCIAL REPLACEMENT

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { Challenge, ChallengeSubmission } from '../../src/types';
import { challengeSystem } from '../../src/engines/community/ChallengeSystem';

export default function ChallengesTab() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const challengeData = await challengeSystem.getActiveChallenges();
      setChallenges(challengeData);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };

  const handleChallengeSelect = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const renderChallengeCard = (challenge: Challenge) => {
    // ✅ FIXED: Safe property access with optional chaining and defaults
    const submissionsCount = challenge.submissions?.length || 0;
    const featuredSubmissions = challenge.submissions?.filter(sub => sub.featured)?.slice(0, 2) || [];
    const challengeTheme = challenge.theme || 'General';
    const challengeType = challenge.type || 'daily';
    const participants = challenge.participants || 0;
    const status = challenge.status || 'active';

    return (
      <TouchableOpacity
        key={challenge.id}
        style={styles.challengeCard}
        onPress={() => handleChallengeSelect(challenge)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <Text style={styles.challengeDescription}>
          {challenge.description}
        </Text>

        <View style={styles.challengeStats}>
          <Text style={styles.statText}>
            📊 {submissionsCount} submissions
          </Text>
          <Text style={styles.statText}>
            👥 {participants} participants
          </Text>
        </View>

        {/* ✅ FIXED: Safe rendering of featured submissions */}
        {featuredSubmissions.length > 0 && (
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>⭐ Featured Submissions</Text>
            <View style={styles.featuredGrid}>
              {featuredSubmissions.map((submission) => (
                <View key={submission.id} style={styles.submissionThumb}>
                  <View style={styles.thumbImagePlaceholder}>
                    <Text style={styles.thumbImageText}>🎨</Text>
                  </View>
                  <Text style={styles.thumbVotes}>
                    ❤️ {submission.votes || 0}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.tagContainer}>
          {/* ✅ FIXED: Safe tag creation with proper filtering */}
          {[challengeTheme, challengeType].filter(Boolean).map((tag, index) => (
            <View key={`${tag}-${index}`} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>
            🏆 {challenge.rewards?.xp || 0} XP
          </Text>
          <Text style={styles.footerText}>
            ⏰ {getRemainingTime(challenge.endDate)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderChallengeDetail = () => {
    if (!selectedChallenge) return null;

    // ✅ FIXED: Safe property access throughout
    const submissions = selectedChallenge.submissions || [];
    const rewards = selectedChallenge.rewards || { xp: 0, achievements: [] };
    const rules = selectedChallenge.rules || [];

    return (
      <ScrollView 
        style={styles.detailContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.detailHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedChallenge(null)}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.detailTitle}>{selectedChallenge.title}</Text>
        </View>

        <Text style={styles.detailDescription}>
          {selectedChallenge.description}
        </Text>

        {selectedChallenge.prompt && (
          <View style={styles.promptSection}>
            <Text style={styles.sectionTitle}>🎯 Challenge Prompt</Text>
            <Text style={styles.promptText}>{selectedChallenge.prompt}</Text>
          </View>
        )}

        {rules.length > 0 && (
          <View style={styles.rulesSection}>
            <Text style={styles.sectionTitle}>📋 Rules</Text>
            {rules.map((rule, index) => (
              <Text key={index} style={styles.ruleText}>• {rule}</Text>
            ))}
          </View>
        )}

        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>🏆 Rewards</Text>
          <Text style={styles.rewardText}>
            💎 {rewards.xp} XP
          </Text>
          {rewards.achievements && rewards.achievements.length > 0 && (
            <Text style={styles.rewardText}>
              🎖️ {rewards.achievements.join(', ')}
            </Text>
          )}
        </View>

        <View style={styles.submissionsSection}>
          <Text style={styles.sectionTitle}>
            🎨 Submissions ({submissions.length})
          </Text>
          {submissions.length > 0 ? (
            submissions.map((submission) => (
              <View key={submission.id} style={styles.submissionCard}>
                <Text style={styles.submissionUser}>
                  👤 User {submission.userId.slice(-6)}
                </Text>
                <Text style={styles.submissionVotes}>
                  ❤️ {submission.votes || 0} votes
                </Text>
                {submission.featured && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noSubmissionsText}>
              No submissions yet. Be the first! 🚀
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.participateButton}>
          <Text style={styles.participateButtonText}>
            🎨 Join Challenge
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'upcoming': return '#FF9800';
      case 'completed': return '#9E9E9E';
      default: return '#2196F3';
    }
  };

  const getRemainingTime = (endDate: number): string => {
    const now = Date.now();
    const remaining = endDate - now;
    
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Ending soon';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {selectedChallenge ? renderChallengeDetail() : (
        <ScrollView 
          style={styles.challengesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🏆 Daily Challenges</Text>
            <Text style={styles.headerSubtitle}>
              Show your skills and earn rewards!
            </Text>
          </View>
          
          {challenges.length > 0 ? (
            challenges.map(renderChallengeCard)
          ) : (
            <View style={styles.emptyChallenges}>
              <Text style={styles.emptyText}>
                🎯 No active challenges right now
              </Text>
              <Text style={styles.emptySubtext}>
                Check back soon for new challenges!
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  challengesList: {
    flex: 1,
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  challengeDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  featuredSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  featuredGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  submissionThumb: {
    alignItems: 'center',
  },
  thumbImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbImageText: {
    fontSize: 24,
  },
  thumbVotes: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  emptyChallenges: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // Detail view styles
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  detailDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    padding: 20,
  },
  promptSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  promptText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  rulesSection: {
    padding: 20,
  },
  ruleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  rewardsSection: {
    padding: 20,
    backgroundColor: '#fff8e1',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  rewardText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  submissionsSection: {
    padding: 20,
  },
  submissionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  submissionUser: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  submissionVotes: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  featuredBadge: {
    marginLeft: 12,
    backgroundColor: '#ffd54f',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featuredBadgeText: {
    fontSize: 10,
    color: '#f57f17',
    fontWeight: '600',
  },
  noSubmissionsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  participateButton: {
    backgroundColor: '#2196F3',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  participateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});