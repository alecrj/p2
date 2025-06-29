import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MusicTrack {
  id: string;
  name: string;
  file: any; // require() import or URL
  mood: 'focus' | 'creative' | 'energetic' | 'calm' | 'theory' | 'practice';
  duration?: number;
}

interface MusicSettings {
  enabled: boolean;
  volume: number;
  autoPlay: boolean;
  fadeInOut: boolean;
}

/**
 * COMMERCIAL GRADE MUSIC MANAGER
 * 
 * EASY TO USE:
 * 1. Add MP3 files to assets/music/
 * 2. Add tracks to the tracks array below
 * 3. Call musicManager.startLessonMusic('theory') in lessons
 * 
 * FEATURES:
 * - Automatic music selection by lesson type
 * - Fade in/out effects
 * - Volume control
 * - Background music during lessons
 * - Easy to add new tracks
 */
export class LessonMusicManager {
  private static instance: LessonMusicManager;
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private currentTrack: MusicTrack | null = null;
  private settings: MusicSettings = {
    enabled: true,
    volume: 0.3,
    autoPlay: true,
    fadeInOut: true,
  };

  // 🎵 ADD YOUR MUSIC TRACKS HERE 🎵
  // Just add MP3 files to assets/music/ and list them here
  private tracks: MusicTrack[] = [
    // THEORY LESSON MUSIC - Calm and focused
    {
      id: 'calm-theory-1',
      name: 'Peaceful Learning',
      file: require('../../assets/music/calm-theory.mp3'), // Add this file
      mood: 'theory',
      duration: 180,
    },
    {
      id: 'calm-theory-2', 
      name: 'Focused Study',
      file: require('../../assets/music/calm-theory.mp3'), // Add this file
      mood: 'theory',
      duration: 200,
    },

    // PRACTICE LESSON MUSIC - Energetic and motivating
    {
      id: 'energetic-practice-1',
      name: 'Creative Energy',
      file: require('../../assets/music/calm-theory.mp3'), // Add this file
      mood: 'practice',
      duration: 150,
    },
    {
      id: 'energetic-practice-2',
      name: 'Artistic Flow',
      file: require('../../assets/music/calm-theory.mp3'), // Add this file
      mood: 'practice',
      duration: 180,
    },

    // DRAWING LESSON MUSIC - Creative and inspiring
    {
      id: 'creative-drawing-1',
      name: 'Drawing Inspiration',
      file: require('../../assets/music/calm-theory.mp3'), // Add this file
      mood: 'creative',
      duration: 240,
    },
    {
      id: 'creative-drawing-2',
      name: 'Artistic Mind',
      file: require('../../assets/music/calm-theory.mp3'), // Add this file
      mood: 'creative',
      duration: 220,
    },

    // GENERAL FOCUS MUSIC
    {
      id: 'focus-1',
      name: 'Deep Focus',
      file: require('../../assets/music/calm-theory.mp3'), // Add this file
      mood: 'focus',
      duration: 300,
    },
  ];

  private constructor() {
    this.initialize();
  }

  public static getInstance(): LessonMusicManager {
    if (!LessonMusicManager.instance) {
      LessonMusicManager.instance = new LessonMusicManager();
    }
    return LessonMusicManager.instance;
  }

  // =================== INITIALIZATION ===================

  private async initialize() {
    try {
      await this.setupAudio();
      await this.loadSettings();
      console.log('🎵 Music Manager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize music manager:', error);
    }
  }

  private async setupAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to setup audio:', error);
    }
  }

  private async loadSettings() {
    try {
      const saved = await AsyncStorage.getItem('@pikaso_music_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load music settings:', error);
    }
  }

  private async saveSettings() {
    try {
      await AsyncStorage.setItem('@pikaso_music_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save music settings:', error);
    }
  }

  // =================== MAIN API ===================

  /**
   * 🚀 START MUSIC FOR LESSON TYPE
   * Call this in your lesson components
   */
  public async startLessonMusic(lessonType: 'theory' | 'practice' | 'drawing' | 'assessment' | 'guided'): Promise<void> {
    if (!this.settings.enabled || !this.settings.autoPlay) {
      console.log('🔇 Music disabled or autoplay off');
      return;
    }

    try {
      // Map lesson types to music moods
      let mood: MusicTrack['mood'];
      switch (lessonType) {
        case 'theory':
          mood = 'theory';
          break;
        case 'practice':
          mood = 'practice';
          break;
        case 'drawing':
        case 'guided':
          mood = 'creative';
          break;
        case 'assessment':
          mood = 'focus';
          break;
        default:
          mood = 'focus';
      }

      const track = this.getRandomTrackByMood(mood);
      if (track) {
        await this.playTrack(track);
        console.log(`🎵 Started ${track.name} for ${lessonType} lesson`);
      } else {
        console.log(`🎵 No tracks available for mood: ${mood}`);
      }
    } catch (error) {
      console.error('❌ Failed to start lesson music:', error);
    }
  }

  /**
   * 🎵 PLAY SPECIFIC TRACK
   */
  public async playTrack(track: MusicTrack): Promise<void> {
    try {
      // Stop current track if playing
      await this.stop();

      console.log(`🎵 Loading track: ${track.name}`);

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(track.file, {
        shouldPlay: true,
        isLooping: true,
        volume: this.settings.fadeInOut ? 0 : this.settings.volume,
      });

      this.sound = sound;
      this.currentTrack = track;
      this.isPlaying = true;

      // Fade in if enabled
      if (this.settings.fadeInOut) {
        await this.fadeIn();
      }

      console.log(`✅ Playing: ${track.name}`);
    } catch (error) {
      console.error(`❌ Failed to play track ${track.id}:`, error);
    }
  }

  /**
   * ⏹️ STOP MUSIC
   */
  public async stop(): Promise<void> {
    try {
      if (this.sound && this.isPlaying) {
        console.log('🔇 Stopping music...');
        
        if (this.settings.fadeInOut) {
          await this.fadeOut();
        }
        
        await this.sound.unloadAsync();
        this.sound = null;
        this.currentTrack = null;
        this.isPlaying = false;
        
        console.log('✅ Music stopped');
      }
    } catch (error) {
      console.error('❌ Failed to stop music:', error);
    }
  }

  /**
   * ⏸️ PAUSE MUSIC
   */
  public async pause(): Promise<void> {
    try {
      if (this.sound && this.isPlaying) {
        await this.sound.pauseAsync();
        this.isPlaying = false;
        console.log('⏸️ Music paused');
      }
    } catch (error) {
      console.error('❌ Failed to pause music:', error);
    }
  }

  /**
   * ▶️ RESUME MUSIC
   */
  public async resume(): Promise<void> {
    try {
      if (this.sound && !this.isPlaying) {
        await this.sound.playAsync();
        this.isPlaying = true;
        console.log('▶️ Music resumed');
      }
    } catch (error) {
      console.error('❌ Failed to resume music:', error);
    }
  }

  // =================== SETTINGS CONTROL ===================

  /**
   * 🔊 SET VOLUME (0.0 to 1.0)
   */
  public async setVolume(volume: number): Promise<void> {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    
    if (this.sound) {
      await this.sound.setVolumeAsync(this.settings.volume);
    }
    
    await this.saveSettings();
    console.log(`🔊 Volume set to ${Math.round(this.settings.volume * 100)}%`);
  }

  /**
   * 🎵 ENABLE/DISABLE MUSIC
   */
  public async setEnabled(enabled: boolean): Promise<void> {
    this.settings.enabled = enabled;
    
    if (!enabled && this.isPlaying) {
      await this.stop();
    }
    
    await this.saveSettings();
    console.log(`🎵 Music ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * 🔄 SET AUTOPLAY
   */
  public async setAutoPlay(autoPlay: boolean): Promise<void> {
    this.settings.autoPlay = autoPlay;
    await this.saveSettings();
    console.log(`🔄 Autoplay ${autoPlay ? 'enabled' : 'disabled'}`);
  }

  /**
   * 🌊 SET FADE IN/OUT
   */
  public async setFadeInOut(fadeInOut: boolean): Promise<void> {
    this.settings.fadeInOut = fadeInOut;
    await this.saveSettings();
    console.log(`🌊 Fade effects ${fadeInOut ? 'enabled' : 'disabled'}`);
  }

  // =================== GETTERS ===================

  public getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  public getSettings(): MusicSettings {
    return { ...this.settings };
  }

  public getAllTracks(): MusicTrack[] {
    return [...this.tracks];
  }

  public getTracksByMood(mood: MusicTrack['mood']): MusicTrack[] {
    return this.tracks.filter(track => track.mood === mood);
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  // =================== TRACK MANAGEMENT ===================

  /**
   * ➕ ADD NEW TRACK EASILY
   * Use this to add new music tracks
   */
  public addTrack(track: MusicTrack): void {
    const existingIndex = this.tracks.findIndex(t => t.id === track.id);
    if (existingIndex >= 0) {
      this.tracks[existingIndex] = track;
      console.log(`🔄 Updated track: ${track.name}`);
    } else {
      this.tracks.push(track);
      console.log(`➕ Added new track: ${track.name}`);
    }
  }

  /**
   * ➖ REMOVE TRACK
   */
  public removeTrack(trackId: string): void {
    const index = this.tracks.findIndex(t => t.id === trackId);
    if (index >= 0) {
      this.tracks.splice(index, 1);
      console.log(`➖ Removed track: ${trackId}`);
    }
  }

  // =================== PRIVATE HELPERS ===================

  private getRandomTrackByMood(mood: MusicTrack['mood']): MusicTrack | null {
    let moodTracks = this.getTracksByMood(mood);
    
    // Fallback to similar moods if exact mood not found
    if (moodTracks.length === 0) {
      console.log(`🎵 No tracks for ${mood}, trying fallbacks...`);
      
      switch (mood) {
        case 'theory':
          moodTracks = this.getTracksByMood('calm').concat(this.getTracksByMood('focus'));
          break;
        case 'practice':
          moodTracks = this.getTracksByMood('energetic').concat(this.getTracksByMood('creative'));
          break;
        case 'creative':
          moodTracks = this.getTracksByMood('practice').concat(this.getTracksByMood('focus'));
          break;
        default:
          moodTracks = this.tracks; // Use any track
      }
    }
    
    if (moodTracks.length === 0) {
      console.log('🎵 No tracks available at all');
      return null;
    }
    
    // Don't repeat the same track
    const availableTracks = moodTracks.filter(track => 
      !this.currentTrack || track.id !== this.currentTrack.id
    );
    
    const tracksToChooseFrom = availableTracks.length > 0 ? availableTracks : moodTracks;
    return tracksToChooseFrom[Math.floor(Math.random() * tracksToChooseFrom.length)];
  }

  private async fadeIn(duration: number = 2000): Promise<void> {
    if (!this.sound) return;
    
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = this.settings.volume / steps;
    
    for (let i = 0; i <= steps; i++) {
      try {
        await this.sound.setVolumeAsync(volumeStep * i);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      } catch (error) {
        console.error('Fade in error:', error);
        break;
      }
    }
  }

  private async fadeOut(duration: number = 1000): Promise<void> {
    if (!this.sound) return;
    
    const steps = 10;
    const stepDuration = duration / steps;
    const volumeStep = this.settings.volume / steps;
    
    for (let i = steps; i >= 0; i--) {
      try {
        await this.sound.setVolumeAsync(volumeStep * i);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      } catch (error) {
        console.error('Fade out error:', error);
        break;
      }
    }
  }

  /**
   * 🧹 CLEANUP
   */
  public async cleanup(): Promise<void> {
    await this.stop();
    console.log('🧹 Music manager cleaned up');
  }
}

// Export singleton instance
export const musicManager = LessonMusicManager.getInstance();

// =================== USAGE EXAMPLES ===================

/*
🚀 HOW TO USE IN YOUR LESSON COMPONENTS:

1. Import the music manager:
   import { musicManager } from '../engines/LessonMusicManager';

2. Start music when lesson begins:
   useEffect(() => {
     musicManager.startLessonMusic('theory'); // or 'practice', 'drawing'
     return () => musicManager.stop();
   }, []);

3. Control music in settings:
   await musicManager.setVolume(0.5); // 50% volume
   await musicManager.setEnabled(false); // Disable music

4. Add new tracks easily:
   musicManager.addTrack({
     id: 'my-new-song',
     name: 'Inspiring Creativity',
     file: require('./assets/music/my-new-song.mp3'),
     mood: 'creative',
     duration: 180,
   });

5. Control playback:
   await musicManager.pause();
   await musicManager.resume();
   await musicManager.stop();
*/