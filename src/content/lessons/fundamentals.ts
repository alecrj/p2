// src/content/lessons/fundamentals.ts - ENTERPRISE LESSON SYSTEM V2.0

import { Lesson, LessonType, LessonContent, PracticeContent } from '../../types';

/**
 * ENTERPRISE LESSON SYSTEM V2.0
 * 
 * ✅ FIXED ISSUES:
 * - Proper type compliance with all interfaces
 * - Consistent content structure across all lessons
 * - Enhanced validation rules and feedback
 * - Professional XP distribution and progression
 * - Complete practice content with proper step definitions
 * - Duolingo-level engagement and flow
 */

export const fundamentalLessons: Lesson[] = [
  // LESSON 1: Theory Quiz - Drawing Fundamentals
  {
    id: 'lesson-intro-theory',
    title: 'Drawing Fundamentals Quiz',
    description: 'Test your understanding of basic drawing principles and techniques',
    type: 'theory' as LessonType,
    skillTree: 'drawing-fundamentals',
    order: 1,
    estimatedTime: 5,
    difficulty: 1,
    prerequisites: [],
    
    content: [
      {
        id: 'shoulder-technique',
        type: 'multiple_choice',
        question: 'Which technique produces the straightest, most controlled lines?',
        options: [
          'Drawing from the wrist with small movements',
          'Drawing from the shoulder with fluid motion',
          'Drawing with fingertips for precision',
          'Drawing very slowly and carefully'
        ],
        correctAnswer: 1,
        explanation: 'Professional artists draw from their shoulder for long, controlled lines. The shoulder provides stability and smooth movement, while wrist movement creates shaky, uncontrolled strokes.',
        hint: 'Think about which joint gives you the most range and stability.',
        xp: 15,
      },
      {
        id: 'wrist-control',
        type: 'true_false',
        question: 'You should keep your wrist locked when drawing straight lines.',
        correctAnswer: true,
        explanation: 'Locking your wrist prevents wobbly lines and gives you better control. Let your shoulder and arm do the work.',
        hint: 'Think about stability and control.',
        xp: 10,
      },
      {
        id: 'circle-method',
        type: 'multiple_choice',
        question: 'What\'s the best way to draw a perfect circle freehand?',
        options: [
          'Draw very slowly and carefully',
          'Use your elbow as a pivot point',
          'Start with a square outline first',
          'Draw many small overlapping curves'
        ],
        correctAnswer: 1,
        explanation: 'Using your elbow as a pivot creates natural circular motion. This technique produces smoother, more consistent circles than other methods.',
        hint: 'Think about creating a natural pivoting motion.',
        xp: 15,
      }
    ],
    
    objectives: [
      {
        id: 'theory-1',
        description: 'Understand proper drawing technique fundamentals',
        completed: false,
        required: true,
      }
    ],
    
    theoryContent: {
      segments: [
        {
          id: 'theory-intro',
          type: 'text',
          content: 'Every masterpiece starts with mastering the fundamentals. Today, you\'ll learn the professional techniques that separate amateur from expert artists.',
          duration: 30,
          order: 1,
        }
      ],
      totalDuration: 120,
      objectives: [
        {
          id: 'learn-fundamentals',
          description: 'Master shoulder vs wrist movement techniques',
          type: 'primary',
          completed: false,
          required: true,
        },
      ],
    },
    
    practiceContent: {
      steps: [
        {
          id: 'practice-theory',
          type: 'theory',
          instruction: 'Apply the fundamentals you\'ve learned in practical exercises',
          demonstration: 'Review proper hand positioning and movement techniques',
          validation: {
            type: 'completion',
            threshold: 1.0,
          },
          hints: ['Remember: shoulder movement for long lines, wrist locked for control'],
          xpReward: 20,
          order: 1,
        }
      ],
      timeLimit: 300,
      requiredAccuracy: 0.8,
      objectives: [
        {
          id: 'apply-fundamentals',
          description: 'Apply drawing fundamentals in practice',
          completed: false,
          required: true,
        }
      ],
    },
    
    rewards: {
      xp: 40,
      achievements: ['theory_master', 'fundamentals_learned'],
      unlocks: ['lesson-line-practice'],
    },
    
    status: 'available',
    progress: 0,
    attempts: 0,
    timeSpent: 0,
    tags: ['theory', 'fundamentals', 'basics'],
  },

  // LESSON 2: Line Practice - Master Control
  {
    id: 'lesson-line-practice',
    title: 'Line Control Practice',
    description: 'Master drawing straight lines and basic shapes with professional control',
    type: 'practice' as LessonType,
    skillTree: 'drawing-fundamentals',
    order: 2,
    estimatedTime: 8,
    difficulty: 1,
    prerequisites: ['lesson-intro-theory'],
    
    content: [
      {
        id: 'horizontal-lines',
        type: 'drawing_exercise',
        instruction: 'Draw 5 straight horizontal lines using shoulder movement',
        hint: 'Use your shoulder, keep your wrist locked. Focus on smooth, fluid motion.',
        validation: {
          type: 'line_count',
          target: 5,
          threshold: 0.8,
        },
        timeLimit: 90,
        xp: 20,
      },
      {
        id: 'vertical-lines',
        type: 'drawing_exercise',
        instruction: 'Draw 5 straight vertical lines with consistent spacing',
        hint: 'Keep them parallel and evenly spaced. Maintain steady shoulder movement.',
        validation: {
          type: 'line_count',
          target: 5,
          threshold: 0.8,
        },
        timeLimit: 90,
        xp: 20,
      },
      {
        id: 'circle-practice',
        type: 'drawing_exercise',
        instruction: 'Draw 3 circles using elbow pivot technique',
        hint: 'Use your elbow as a pivot point. Don\'t worry about perfection - focus on smooth motion.',
        validation: {
          type: 'shape_accuracy',
          target: 'circle',
          tolerance: 0.6,
          threshold: 0.6,
        },
        timeLimit: 120,
        xp: 25,
      }
    ],
    
    objectives: [
      {
        id: 'lines-master',
        description: 'Draw controlled straight lines consistently',
        completed: false,
        required: true,
      },
      {
        id: 'circles-basic',
        description: 'Create smooth circular shapes using proper technique',
        completed: false,
        required: true,
      }
    ],
    
    practiceContent: {
      steps: [
        {
          id: 'practice-horizontal',
          type: 'drawing',
          instruction: 'Draw 5 horizontal lines across your canvas. Focus on keeping them straight and parallel.',
          demonstration: 'Use shoulder movement, not wrist. Keep consistent pressure.',
          validation: {
            type: 'stroke-count',
            params: { min: 5, max: 10 },
            threshold: 0.8,
          },
          hints: ['Move from your shoulder, not your wrist!', 'Keep steady pressure on the pencil'],
          xpReward: 15,
          order: 1,
        },
        {
          id: 'practice-vertical',
          type: 'drawing',
          instruction: 'Draw 5 vertical lines with consistent spacing between them.',
          demonstration: 'Maintain shoulder control for vertical movement.',
          validation: {
            type: 'stroke-alignment',
            params: { orientation: 'vertical', count: 5 },
            threshold: 0.7,
          },
          hints: ['Maintain consistent spacing', 'Use the same shoulder technique'],
          xpReward: 15,
          order: 2,
        },
        {
          id: 'practice-circles',
          type: 'drawing',
          instruction: 'Draw 3 circles using your elbow as a pivot point.',
          demonstration: 'Smooth, continuous motion creates better circles.',
          validation: {
            type: 'shape-recognition',
            params: { targetShape: 'circle', count: 3 },
            threshold: 0.6,
          },
          hints: ['Use elbow pivot technique', 'Don\'t lift your pencil during the circle'],
          xpReward: 20,
          order: 3,
        }
      ],
      timeLimit: 480,
      requiredAccuracy: 0.7,
      objectives: [
        {
          id: 'master-lines',
          description: 'Master basic line control techniques',
          completed: false,
          required: true,
        }
      ],
    },
    
    rewards: {
      xp: 65,
      achievements: ['line_master', 'shape_beginner'],
      unlocks: ['lesson-color-theory'],
    },
    
    status: 'locked',
    progress: 0,
    attempts: 0,
    timeSpent: 0,
    tags: ['practice', 'lines', 'shapes', 'fundamentals'],
  },

  // LESSON 3: Color Theory Fundamentals
  {
    id: 'lesson-color-theory',
    title: 'Color Theory Basics',
    description: 'Learn about primary colors, complementary relationships, and color harmony',
    type: 'theory' as LessonType,
    skillTree: 'drawing-fundamentals',
    order: 3,
    estimatedTime: 6,
    difficulty: 1,
    prerequisites: ['lesson-line-practice'],
    
    content: [
      {
        id: 'primary-colors',
        type: 'multiple_choice',
        question: 'What are the three primary colors in traditional color theory?',
        options: [
          'Red, Green, Blue (RGB)',
          'Red, Yellow, Blue (RYB)',
          'Yellow, Orange, Red',
          'Blue, Purple, Green'
        ],
        correctAnswer: 1,
        explanation: 'Red, Yellow, and Blue are the traditional primary colors - they cannot be created by mixing other colors. These form the foundation of color theory.',
        hint: 'Think about the colors that cannot be mixed from others.',
        xp: 15,
      },
      {
        id: 'complementary-red',
        type: 'color_match',
        question: 'Select the complementary color to red:',
        options: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
        correctAnswer: 1, // Green
        explanation: 'Green is directly opposite red on the color wheel, making them complementary colors. Complementary colors create strong contrast.',
        hint: 'Look for the color opposite red on a color wheel.',
        xp: 20,
      },
      {
        id: 'warm-colors',
        type: 'multiple_choice',
        question: 'Which colors are considered "warm" colors?',
        options: [
          'Blues and greens',
          'Reds, oranges, and yellows',
          'Purples and violets',
          'Black, white, and grays'
        ],
        correctAnswer: 1,
        explanation: 'Warm colors (reds, oranges, yellows) remind us of fire and sunlight. They tend to advance in compositions and feel energetic.',
        hint: 'Think about the colors of fire and sunshine.',
        xp: 15,
      }
    ],
    
    objectives: [
      {
        id: 'color-fundamentals',
        description: 'Understand primary colors and color relationships',
        completed: false,
        required: true,
      }
    ],
    
    theoryContent: {
      segments: [
        {
          id: 'color-intro',
          type: 'text',
          content: 'Color is one of the most powerful tools in an artist\'s toolkit. Understanding color theory will help you create more compelling and harmonious artwork.',
          duration: 45,
          order: 1,
        }
      ],
      totalDuration: 180,
      objectives: [
        {
          id: 'learn-color-wheel',
          description: 'Master color wheel basics and relationships',
          type: 'primary',
          completed: false,
          required: true,
        },
      ],
    },
    
    practiceContent: {
      steps: [
        {
          id: 'practice-color-wheel',
          type: 'theory',
          instruction: 'Identify color relationships using the color wheel principles you\'ve learned.',
          demonstration: 'Practice identifying complementary and analogous color pairs.',
          validation: {
            type: 'color-knowledge',
            threshold: 0.8,
          },
          hints: ['Remember: opposites on the color wheel are complementary'],
          xpReward: 25,
          order: 1,
        }
      ],
      timeLimit: 360,
      requiredAccuracy: 0.8,
      objectives: [
        {
          id: 'apply-color-theory',
          description: 'Apply color theory knowledge in practice',
          completed: false,
          required: true,
        }
      ],
    },
    
    rewards: {
      xp: 50,
      achievements: ['color_theorist', 'knowledge_seeker'],
      unlocks: ['lesson-apple-construction'],
    },
    
    status: 'locked',
    progress: 0,
    attempts: 0,
    timeSpent: 0,
    tags: ['theory', 'color', 'fundamentals'],
  },

  // LESSON 4: Guided Apple Drawing
  {
    id: 'lesson-apple-construction',
    title: 'Draw an Apple Step-by-Step',
    description: 'Learn construction drawing by creating a realistic apple using basic shapes',
    type: 'practice' as LessonType,
    skillTree: 'drawing-fundamentals',
    order: 4,
    estimatedTime: 12,
    difficulty: 2,
    prerequisites: ['lesson-color-theory'],
    
    content: [
      {
        id: 'apple-circle',
        type: 'guided_step',
        instruction: 'Start with a circle for the apple body',
        hint: 'Make it slightly wider than tall - apples aren\'t perfect circles',
        validation: {
          type: 'shape_accuracy',
          target: 'circle',
          tolerance: 0.7,
          threshold: 0.7,
        },
        xp: 20,
      },
      {
        id: 'apple-indent',
        type: 'guided_step',
        instruction: 'Add a small indent at the top center',
        hint: 'This is where the stem connects to the apple - make it subtle',
        validation: {
          type: 'curve_detection',
          params: { area: 'top_center' },
          threshold: 0.6,
        },
        xp: 25,
      },
      {
        id: 'apple-stem',
        type: 'guided_step',
        instruction: 'Draw a small stem extending from the indent',
        hint: 'Just a short cylinder or rectangle - keep it simple',
        validation: {
          type: 'shape_accuracy',
          target: 'rectangle',
          tolerance: 0.5,
          threshold: 0.5,
        },
        xp: 30,
      }
    ],
    
    objectives: [
      {
        id: 'construction-drawing',
        description: 'Apply construction drawing principles to create recognizable objects',
        completed: false,
        required: true,
      }
    ],
    
    practiceContent: {
      steps: [
        {
          id: 'apple-base-shape',
          type: 'drawing',
          instruction: 'Let\'s draw an apple! Start with a circle for the main body.',
          demonstration: 'Use the circle technique you learned earlier.',
          validation: {
            type: 'shape-accuracy',
            params: { targetShape: 'circle', threshold: 0.6 },
            threshold: 0.7,
          },
          hints: ['Make it slightly wider than tall', 'Use elbow pivot for smooth circles'],
          xpReward: 20,
          order: 1,
        },
        {
          id: 'apple-details',
          type: 'drawing',
          instruction: 'Add the characteristic apple indent at the top.',
          demonstration: 'Create a small curved indent where the stem would attach.',
          validation: {
            type: 'detail-recognition',
            params: { feature: 'indent', location: 'top' },
            threshold: 0.6,
          },
          hints: ['Small curved line at the top center', 'Don\'t make it too deep'],
          xpReward: 25,
          order: 2,
        },
        {
          id: 'apple-stem',
          type: 'drawing',
          instruction: 'Complete your apple by adding a simple stem.',
          demonstration: 'Draw a small rectangle or cylinder extending upward.',
          validation: {
            type: 'completion-check',
            params: { hasAllElements: true },
            threshold: 0.8,
          },
          hints: ['Keep the stem simple and small', 'Extend upward from the indent'],
          xpReward: 30,
          order: 3,
        }
      ],
      timeLimit: 720,
      requiredAccuracy: 0.7,
      objectives: [
        {
          id: 'complete-apple',
          description: 'Successfully construct a recognizable apple drawing',
          completed: false,
          required: true,
        }
      ],
    },
    
    rewards: {
      xp: 75,
      achievements: ['constructor', 'apple_artist', 'shape_master'],
      unlocks: ['lesson-perspective-basics'],
    },
    
    status: 'locked',
    progress: 0,
    attempts: 0,
    timeSpent: 0,
    tags: ['guided', 'construction', 'objects', 'shapes'],
  },

  // LESSON 5: Perspective Fundamentals
  {
    id: 'lesson-perspective-basics',
    title: 'Perspective Fundamentals',
    description: 'Master the basics of 1-point perspective to create depth in your drawings',
    type: 'theory' as LessonType,
    skillTree: 'drawing-fundamentals',
    order: 5,
    estimatedTime: 7,
    difficulty: 2,
    prerequisites: ['lesson-apple-construction'],
    
    content: [
      {
        id: 'perspective-definition',
        type: 'multiple_choice',
        question: 'What is perspective in drawing?',
        options: [
          'Making things look realistic with shading',
          'Creating the illusion of depth and distance on a flat surface',
          'Drawing from different viewing angles',
          'Using light and shadow effectively'
        ],
        correctAnswer: 1,
        explanation: 'Perspective is the technique of representing 3D objects on a 2D surface to create the illusion of depth and distance. It\'s fundamental to realistic drawing.',
        hint: 'Think about how things appear to get smaller as they move away from you.',
        xp: 15,
      },
      {
        id: 'horizon-line',
        type: 'true_false',
        question: 'The horizon line is always at your eye level.',
        correctAnswer: true,
        explanation: 'The horizon line represents your eye level and changes as you look up or down. It\'s the foundation of perspective drawing.',
        hint: 'Think about where the horizon appears when you look straight ahead.',
        xp: 12,
      },
      {
        id: 'vanishing-point',
        type: 'multiple_choice',
        question: 'In 1-point perspective, parallel lines appear to converge at:',
        options: [
          'The center of the horizon line',
          'A single vanishing point on the horizon',
          'Multiple points around the drawing',
          'The edges of the paper'
        ],
        correctAnswer: 1,
        explanation: 'All parallel lines going away from you converge at a single vanishing point in 1-point perspective. This creates the illusion of depth.',
        hint: 'Think about railroad tracks disappearing into the distance.',
        xp: 18,
      }
    ],
    
    objectives: [
      {
        id: 'perspective-basics',
        description: 'Understand fundamental perspective concepts',
        completed: false,
        required: true,
      }
    ],
    
    theoryContent: {
      segments: [
        {
          id: 'perspective-intro',
          type: 'text',
          content: 'Perspective is the magic that makes flat drawings come alive with depth. Master these basics and watch your art gain incredible three-dimensional quality!',
          duration: 60,
          order: 1,
        }
      ],
      totalDuration: 210,
      objectives: [
        {
          id: 'learn-perspective-theory',
          description: 'Master perspective fundamentals and terminology',
          type: 'primary',
          completed: false,
          required: true,
        },
      ],
    },
    
    practiceContent: {
      steps: [
        {
          id: 'perspective-understanding',
          type: 'theory',
          instruction: 'Apply perspective concepts to understand how depth is created in drawings.',
          demonstration: 'Review horizon lines, vanishing points, and convergence.',
          validation: {
            type: 'concept-understanding',
            threshold: 0.8,
          },
          hints: ['Remember: eye level = horizon line', 'Parallel lines converge at vanishing points'],
          xpReward: 25,
          order: 1,
        }
      ],
      timeLimit: 420,
      requiredAccuracy: 0.8,
      objectives: [
        {
          id: 'apply-perspective-theory',
          description: 'Demonstrate understanding of perspective principles',
          completed: false,
          required: true,
        }
      ],
    },
    
    rewards: {
      xp: 45,
      achievements: ['perspective_master', 'depth_creator'],
      unlocks: ['lesson-cube-perspective'],
    },
    
    status: 'locked',
    progress: 0,
    attempts: 0,
    timeSpent: 0,
    tags: ['theory', 'perspective', 'advanced', 'depth'],
  },

  // LESSON 6: Cube in Perspective Practice
  {
    id: 'lesson-cube-perspective',
    title: 'Draw a Cube in Perspective',
    description: 'Apply perspective principles to draw a realistic three-dimensional cube',
    type: 'practice' as LessonType,
    skillTree: 'drawing-fundamentals',
    order: 6,
    estimatedTime: 10,
    difficulty: 2,
    prerequisites: ['lesson-perspective-basics'],
    
    content: [
      {
        id: 'horizon-line-setup',
        type: 'guided_step',
        instruction: 'Draw a horizontal line across your canvas (horizon line)',
        hint: 'Keep it straight and level - this represents your eye level',
        validation: {
          type: 'line_count',
          target: 1,
          threshold: 0.8,
        },
        xp: 15,
      },
      {
        id: 'vanishing-point-mark',
        type: 'guided_step',
        instruction: 'Mark a point on the horizon line (vanishing point)',
        hint: 'This is where all depth lines will meet - place it anywhere on the line',
        validation: {
          type: 'point_placement',
          target: 'horizon_line',
          threshold: 0.7,
        },
        xp: 20,
      },
      {
        id: 'front-face-square',
        type: 'guided_step',
        instruction: 'Draw a square for the front face of the cube',
        hint: 'Make it a perfect square, not a rectangle. This will be the face closest to you.',
        validation: {
          type: 'shape_accuracy',
          target: 'square',
          tolerance: 0.8,
          threshold: 0.7,
        },
        xp: 25,
      },
      {
        id: 'depth-lines-connect',
        type: 'guided_step',
        instruction: 'Draw lines from the back corners to the vanishing point',
        hint: 'These perspective lines create the illusion of depth',
        validation: {
          type: 'perspective_lines',
          target: 'vanishing_point',
          tolerance: 0.15,
          threshold: 0.6,
        },
        xp: 30,
      }
    ],
    
    objectives: [
      {
        id: 'cube-perspective-drawing',
        description: 'Successfully draw a cube in 1-point perspective',
        completed: false,
        required: true,
      }
    ],
    
    practiceContent: {
      steps: [
        {
          id: 'setup-perspective',
          type: 'drawing',
          instruction: 'Set up your perspective foundation with horizon line and vanishing point.',
          demonstration: 'Create the framework for perspective drawing.',
          validation: {
            type: 'perspective-setup',
            params: { hasHorizonLine: true, hasVanishingPoint: true },
            threshold: 0.8,
          },
          hints: ['Draw horizon line first', 'Mark vanishing point on the line'],
          xpReward: 20,
          order: 1,
        },
        {
          id: 'draw-front-face',
          type: 'drawing',
          instruction: 'Draw the front square face of your cube.',
          demonstration: 'Create a perfect square that will serve as the front face.',
          validation: {
            type: 'shape-accuracy',
            params: { targetShape: 'square', accuracy: 0.7 },
            threshold: 0.7,
          },
          hints: ['Make it a true square', 'This face should look flat and straight-on'],
          xpReward: 25,
          order: 2,
        },
        {
          id: 'complete-cube',
          type: 'drawing',
          instruction: 'Complete the cube by connecting corners to the vanishing point.',
          demonstration: 'Add perspective lines to create the 3D effect.',
          validation: {
            type: 'perspective-completion',
            params: { isComplete3D: true },
            threshold: 0.6,
          },
          hints: ['Connect back corners to vanishing point', 'Add the back face to complete the cube'],
          xpReward: 35,
          order: 3,
        }
      ],
      timeLimit: 600,
      requiredAccuracy: 0.6,
      objectives: [
        {
          id: 'master-cube-perspective',
          description: 'Create a convincing 3D cube using perspective principles',
          completed: false,
          required: true,
        }
      ],
    },
    
    rewards: {
      xp: 90,
      achievements: ['perspective_artist', 'cube_master', 'depth_wizard'],
      unlocks: [], // End of fundamentals track
    },
    
    status: 'locked',
    progress: 0,
    attempts: 0,
    timeSpent: 0,
    tags: ['practice', 'perspective', 'construction', 'advanced', '3d'],
  },
];

// =================== HELPER FUNCTIONS ===================

export function getFundamentalLessons(): Lesson[] {
  return fundamentalLessons;
}

export function getLessonById(lessonId: string): Lesson | null {
  return fundamentalLessons.find(lesson => lesson.id === lessonId) || null;
}

export function isLessonAvailable(lessonId: string, completedLessons: string[]): boolean {
  const lesson = getLessonById(lessonId);
  if (!lesson) return false;
  
  if (lesson.prerequisites.length === 0) return true;
  
  return lesson.prerequisites.every(prereq => completedLessons.includes(prereq));
}

export function getAvailableLessons(completedLessons: string[]): Lesson[] {
  return fundamentalLessons.filter(lesson => 
    isLessonAvailable(lesson.id, completedLessons)
  );
}

export function getNextAvailableLesson(completedLessons: string[]): Lesson | null {
  const availableLessons = fundamentalLessons.filter(lesson => 
    isLessonAvailable(lesson.id, completedLessons) && !completedLessons.includes(lesson.id)
  );
  
  return availableLessons.sort((a, b) => a.order - b.order)[0] || null;
}

export function calculateSkillTreeProgress(completedLessons: string[]): number {
  const totalLessons = fundamentalLessons.length;
  const completedCount = completedLessons.filter(lessonId => 
    fundamentalLessons.some(lesson => lesson.id === lessonId)
  ).length;
  
  return totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
}

export function getLessonsByDifficulty(difficulty: number): Lesson[] {
  return fundamentalLessons.filter(lesson => lesson.difficulty === difficulty);
}

export function getLessonsByType(type: LessonType): Lesson[] {
  return fundamentalLessons.filter(lesson => lesson.type === type);
}

// =================== CONTENT VALIDATION ===================

export function validateLessonContent(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  fundamentalLessons.forEach((lesson, index) => {
    // Check required properties
    if (!lesson.id) errors.push(`Lesson ${index}: Missing ID`);
    if (!lesson.title) errors.push(`Lesson ${index}: Missing title`);
    if (!lesson.content || lesson.content.length === 0) {
      errors.push(`Lesson ${lesson.id}: No content array`);
    }

    // Check objectives
    if (!lesson.objectives || lesson.objectives.length === 0) {
      warnings.push(`Lesson ${lesson.id}: No objectives defined`);
    }

    // Check practice content structure
    if (lesson.practiceContent) {
      if (!lesson.practiceContent.steps || lesson.practiceContent.steps.length === 0) {
        errors.push(`Lesson ${lesson.id}: Practice content missing steps`);
      }
    }

    // Validate prerequisites
    lesson.prerequisites.forEach(prereq => {
      if (!fundamentalLessons.some(l => l.id === prereq)) {
        errors.push(`Lesson ${lesson.id}: Invalid prerequisite ${prereq}`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// =================== ANALYTICS & INSIGHTS ===================

export function generateLessonAnalytics(completedLessons: string[]): {
  totalLessons: number;
  completedCount: number;
  completionRate: number;
  averageDifficulty: number;
  totalXpAvailable: number;
  estimatedTimeRemaining: number;
} {
  const totalLessons = fundamentalLessons.length;
  const completedCount = completedLessons.length;
  const completionRate = (completedCount / totalLessons) * 100;
  
  const averageDifficulty = fundamentalLessons.reduce((sum, lesson) => 
    sum + lesson.difficulty, 0) / totalLessons;
  
  const totalXpAvailable = fundamentalLessons.reduce((sum, lesson) => 
    sum + lesson.rewards.xp, 0);
  
  const remainingLessons = fundamentalLessons.filter(lesson => 
    !completedLessons.includes(lesson.id));
  const estimatedTimeRemaining = remainingLessons.reduce((sum, lesson) => 
    sum + lesson.estimatedTime, 0);

  return {
    totalLessons,
    completedCount,
    completionRate,
    averageDifficulty,
    totalXpAvailable,
    estimatedTimeRemaining,
  };
}

// =================== DUOLINGO-STYLE FEATURES ===================

export function generateDailyChallenge(): Lesson | null {
  const practiceLessons = fundamentalLessons.filter(lesson => lesson.type === 'practice');
  if (practiceLessons.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * practiceLessons.length);
  return practiceLessons[randomIndex];
}

export function getStreakBonus(currentStreak: number): number {
  if (currentStreak >= 30) return 2.0; // 100% bonus
  if (currentStreak >= 14) return 1.5; // 50% bonus
  if (currentStreak >= 7) return 1.25; // 25% bonus
  if (currentStreak >= 3) return 1.1; // 10% bonus
  return 1.0; // No bonus
}

export function getPersonalizedRecommendation(userStats: {
  weakAreas?: string[];
  completedLessons: string[];
  averageScore?: number;
}): Lesson | null {
  const { weakAreas = [], completedLessons } = userStats;
  
  // Find lessons for weak areas
  if (weakAreas.includes('perspective')) {
    const perspectiveLesson = getLessonById('lesson-perspective-basics');
    if (perspectiveLesson && !completedLessons.includes(perspectiveLesson.id)) {
      return perspectiveLesson;
    }
  }
  
  if (weakAreas.includes('lines')) {
    const lineLesson = getLessonById('lesson-line-practice');
    if (lineLesson && !completedLessons.includes(lineLesson.id)) {
      return lineLesson;
    }
  }
  
  // Default to next available lesson
  return getNextAvailableLesson(completedLessons);
}

// Export the default lessons array
export default fundamentalLessons;