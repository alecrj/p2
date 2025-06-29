// app/(tabs)/gallery.tsx - COMPLETE COMMERCIAL REPLACEMENT WITH FIX

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Artwork } from '../../src/types';
import { portfolioManager } from '../../src/engines/user/PortfolioManager';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2; // 2 columns with padding

export default function GalleryTab() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filter, setFilter] = useState<'all' | 'liked' | 'recent'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadArtworks();
  }, [filter]);

  const loadArtworks = async () => {
    try {
      setLoading(true);
      const portfolio = await portfolioManager.getUserPortfolio();
      let filteredArtworks = portfolio?.artworks || [];

      switch (filter) {
        case 'liked':
          filteredArtworks = filteredArtworks.filter(artwork => {
            const hasLikes = artwork.stats?.likes && artwork.stats.likes > 0;
            return hasLikes;
          });
          break;
        case 'recent':
          filteredArtworks = filteredArtworks
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 20);
          break;
        default:
          break;
      }

      setArtworks(filteredArtworks);
    } catch (error) {
      console.error('Failed to load artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadArtworks();
    setRefreshing(false);
  };

  const handleArtworkPress = async (artwork: Artwork) => {
    try {
      await portfolioManager.incrementArtworkViews(artwork.id);
      console.log('Opening artwork:', artwork.title);
    } catch (error) {
      console.error('Failed to open artwork:', error);
    }
  };

  const handleLikePress = async (artwork: Artwork) => {
    try {
      // ✅ FIXED: likeArtwork now uses smart user context detection
      // No need to pass userId - it will automatically use current user
      await portfolioManager.likeArtwork(artwork.id);
      loadArtworks();
    } catch (error) {
      console.error('Failed to like artwork:', error);
    }
  };

  const renderArtworkCard = ({ item: artwork }: { item: Artwork }) => {
    const likesCount = artwork.stats?.likes || 0;
    const viewsCount = artwork.stats?.views || 0;
    const commentsCount = artwork.stats?.comments || 0;
    const sharesCount = artwork.stats?.shares || 0;
    const drawingTime = artwork.metadata?.drawingTime || 0;
    const strokeCount = artwork.metadata?.strokeCount || 0;
    const layersUsed = artwork.metadata?.layersUsed || 1;
    const brushesUsed = artwork.metadata?.brushesUsed || [];

    return (
      <TouchableOpacity 
        style={[styles.artworkCard, { width: cardWidth }]}
        onPress={() => handleArtworkPress(artwork)}
      >
        <View style={styles.artworkImageContainer}>
          {artwork.imageUrl || artwork.thumbnailUrl ? (
            <Image 
              source={{ uri: artwork.imageUrl || artwork.thumbnailUrl }}
              style={styles.artworkImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🎨</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.likeButton}
            onPress={() => handleLikePress(artwork)}
          >
            <Text style={[styles.likeIcon, { color: likesCount > 0 ? '#ff4757' : '#ccc' }]}>♥</Text>
          </TouchableOpacity>

          {artwork.featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>⭐</Text>
            </View>
          )}
        </View>

        <View style={styles.artworkInfo}>
          <Text style={styles.artworkTitle} numberOfLines={1}>{artwork.title}</Text>
          <View style={styles.artworkStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{likesCount}</Text>
              <Text style={styles.statLabel}>likes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{viewsCount}</Text>
              <Text style={styles.statLabel}>views</Text>
            </View>
            {commentsCount > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{commentsCount}</Text>
                <Text style={styles.statLabel}>comments</Text>
              </View>
            )}
          </View>
          {drawingTime > 0 && (
            <Text style={styles.artworkMeta}>⏱️ {Math.round(drawingTime / 60000)}min • 🎨 {strokeCount} strokes</Text>
          )}
          {layersUsed > 1 && (
            <Text style={styles.artworkMeta}>📐 {layersUsed} layers</Text>
          )}
          {artwork.tags && artwork.tags.length > 0 && (
            <View style={styles.tagContainer}>
              {artwork.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
              {artwork.tags.length > 2 && (
                <Text style={styles.moreTagsText}>+{artwork.tags.length - 2}</Text>
              )}
            </View>
          )}
          <Text style={styles.creationDate}>{new Date(artwork.createdAt).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filterType: 'all' | 'liked' | 'recent', label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterType && styles.activeFilter]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[styles.filterText, filter === filterType && styles.activeFilterText]}>
        {icon} {label}
      </Text>
    </TouchableOpacity>
  );

  const getArtworkMetrics = () => {
    const totalLikes = artworks.reduce((sum, artwork) => sum + (artwork.stats?.likes || 0), 0);
    const totalViews = artworks.reduce((sum, artwork) => sum + (artwork.stats?.views || 0), 0);
    const totalTime = artworks.reduce((sum, artwork) => sum + (artwork.metadata?.drawingTime || 0), 0);
    return {
      totalArtworks: artworks.length,
      totalLikes,
      totalViews,
      totalHours: Math.round(totalTime / 3600000),
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading gallery...</Text>
      </SafeAreaView>
    );
  }

  const metrics = getArtworkMetrics();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎨 Gallery</Text>
        <Text style={styles.headerSubtitle}>Your creative journey</Text>
        {artworks.length > 0 && (
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{metrics.totalArtworks}</Text>
              <Text style={styles.metricLabel}>artworks</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{metrics.totalLikes}</Text>
              <Text style={styles.metricLabel}>likes</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{metrics.totalViews}</Text>
              <Text style={styles.metricLabel}>views</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{metrics.totalHours}</Text>
              <Text style={styles.metricLabel}>hours</Text>
            </View>
          </View>
        )}
        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'All', '🎨')}
          {renderFilterButton('recent', 'Recent', '🕒')}
          {renderFilterButton('liked', 'Liked', '❤️')}
        </View>
      </View>
      <FlatList
        data={artworks}
        renderItem={renderArtworkCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.galleryGrid}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{filter === 'liked' ? '💔' : '🎨'}</Text>
            <Text style={styles.emptyText}>
              {filter === 'liked' 
                ? 'No liked artworks yet'
                : filter === 'recent'
                ? 'No recent artworks'
                : 'No artworks in your gallery yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {filter === 'liked'
                ? 'Like some artworks to see them here!'
                : 'Create your first artwork to get started!'}
            </Text>
            {filter !== 'liked' && (
              <TouchableOpacity style={styles.createButton}>
                <Text style={styles.createButtonText}>✨ Create Artwork</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// Styles remain unchanged in your original snippet
// You can paste your existing styles block below this


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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    flex: 1,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  galleryGrid: {
    padding: 16,
  },
  artworkCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  artworkImageContainer: {
    position: 'relative',
  },
  artworkImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  placeholderImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  likeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  likeIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#ffd54f',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featuredText: {
    fontSize: 12,
  },
  artworkInfo: {
    padding: 16,
  },
  artworkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  artworkStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  artworkMeta: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#1976d2',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  creationDate: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});