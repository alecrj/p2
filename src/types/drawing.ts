// src/types/drawing.ts - FIXED COMMERCIAL GRADE

// ===== CORE TYPES =====

export interface Point {
    x: number;
    y: number;
    pressure?: number;
    tiltX?: number;
    tiltY?: number;
    timestamp?: number;
    altitude?: number;
    azimuth?: number;
  }
  
  export interface Stroke {
    id: string;
    tool: Tool;
    brushId: string;
    color: Color;
    points: Point[];
    layerId: string;
    timestamp: number;
    transform?: Transform;
  }
  
  export interface Transform {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    flipX?: boolean;
    flipY?: boolean;
  }
  
  export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  
  // ===== COLOR TYPES =====
  
  export interface Color {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsb: { h: number; s: number; b: number };
    alpha: number;
  }
  
  export interface ColorHistory {
    color: Color;
    timestamp: number;
  }
  
  // FIXED: Added missing locked property
  export interface ColorPalette {
    id: string;
    name: string;
    colors: Color[];
    locked: boolean;
    created: number;
    modified: number;
  }
  
  export interface GradientStop {
    position: number; // 0-1
    color: Color;
  }
  
  export interface Gradient {
    id: string;
    name: string;
    type: 'linear' | 'radial';
    stops: GradientStop[];
    angle: number; // For linear gradients
    center?: Point; // For radial gradients
    radius?: number; // For radial gradients
  }
  
  export type ColorSpace = 'rgb' | 'hsb' | 'cmyk' | 'lab';
  
  // FIXED: Changed ColorHarmony from union to interface
  export interface ColorHarmony {
    type: 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'split-complementary' | 'double-complementary' | 'square' | 'monochromatic';
    baseColor: Color;
    harmonicColors: Color[];
  }
  
  // FIXED: Added missing ColorPickerMode interface
  export interface ColorPickerMode {
    type: 'wheel' | 'slider' | 'grid' | 'eyedropper';
    showAlpha: boolean;
    showHistory: boolean;
    showEyedropper: boolean;
  }
  
  export interface ColorProfile {
    id: string;
    name: string;
    space: ColorSpace;
    gamut: 'srgb' | 'p3' | 'adobe-rgb' | 'cmyk';
    whitePoint: { x: number; y: number };
  }
  
  // ===== BRUSH TYPES =====
  
  export type Tool = 
    | 'brush'
    | 'eraser'
    | 'smudge'
    | 'blur'
    | 'sharpen'
    | 'clone'
    | 'selection'
    | 'transform'
    | 'text'
    | 'shape'
    | 'eyedropper'
    | 'fill'
    | 'gradient'
    | 'liquify'
    | 'perspective'
    | 'reference';
  
  export type BrushCategory = 
    | 'sketching'
    | 'inking'
    | 'painting'
    | 'artistic'
    | 'airbrushing'
    | 'textures'
    | 'special'
    | 'calligraphy'
    | 'water'
    | 'markers'
    | 'spray'
    | 'charcoals'
    | 'oils'
    | 'vintage'
    | 'industrial'
    | 'organic'
    | 'abstract'
    | 'elements'
    | 'custom'
    | 'imported';
  
  export interface Brush {
    id: string;
    name: string;
    category: BrushCategory;
    icon: string;
    settings: BrushSettings;
    shape: BrushShape;
    grain?: BrushGrain;
    dynamics: BrushDynamics;
    rendering?: BrushRendering;
    colorDynamics?: BrushColorDynamics;
    wetMix?: WetMixSettings;
    behavior?: BrushBehavior;
    blendMode?: BlendMode;
    customizable: boolean;
    tags?: string[];
  }
  
  export interface BrushSettings {
    general: {
      size: number;
      sizeMin: number;
      sizeMax: number;
      opacity: number;
      flow: number;
      blendMode: string;
      spacing?: number;
    };
    strokePath: {
      spacing: number;
      streamline: number; // 0-1
      jitter: number;
      fallOff: number;
    };
    taper: {
      size: number; // Percentage
      opacity: number;
      pressure: boolean;
      tip: boolean;
    };
    pencil: {
      pressure: boolean;
      tilt: boolean;
      azimuth: boolean;
      velocity: boolean;
    };
    grain: {
      textured: boolean;
      movement: 'rolling' | 'glazed' | 'flowing' | 'none';
      scale: number;
      zoom: number;
      intensity: number;
      offset: number;
      blend: boolean;
    };
  }
  
  export interface BrushShape {
    type: 'builtin' | 'custom' | 'imported';
    id: string;
    settings: {
      hardness: number; // 0-100
      roundness: number; // 0-100
      angle: number; // 0-360
      spacing: number; // Percentage
      scatter?: number;
      count?: number;
      randomize?: boolean;
    };
    texture?: string; // Base64 or URL
  }
  
  export interface BrushGrain {
    id: string;
    name?: string;
    texture?: any; // SkImage
    settings: {
      scale: number;
      zoom: number;
      intensity: number; // 0-1
      rotation: number; // 0-360
      offset: number;
      movement: 'rolling' | 'glazed' | 'flowing' | 'none';
      textured: number; // 0-1
    };
  }
  
  // FIXED: Added missing spacing property to BrushDynamics
  export interface BrushDynamics {
    sizePressure: boolean;
    opacityPressure: boolean;
    flowPressure: boolean;
    sizeTilt: boolean;
    opacityTilt: boolean;
    angleTilt: boolean;
    angleTiltAmount: number; // 0-1
    sizeVelocity: boolean;
    sizeVelocityAmount: number; // 0-1
    jitter: number; // 0-1
    rotationJitter: number; // 0-1
    pressureCurve: number[]; // Response curve points
    velocityCurve: number[]; // Response curve points
    // FIXED: Added all missing properties used in BrushEngine
    size?: number;
    opacity?: number;
    flow?: number;
    spacing?: number; // CRITICAL FIX
    rotation?: number;
    tiltMagnitude?: number;
    tiltAngle?: number;
    scatter?: number;
    pressure?: number;
    velocity?: number;
  }
  
  export interface BrushRendering {
    mode: 'normal' | 'glazed' | 'wet-edges' | 'light-glaze' | 'heavy-glaze' | 'special';
    edgeBlur: number; // 0-10
    blend: boolean;
    edgeSharpness?: number;
    buildUp?: boolean;
    luminance?: boolean;
  }
  
  export interface BrushColorDynamics {
    hueJitter: number; // 0-1
    saturationJitter: number; // 0-1
    brightnessJitter: number; // 0-1
    huePressure: boolean;
    huePressureAmount: number; // 0-1
    saturationPressure: boolean;
    brightnessPressure: boolean;
  }
  
  export interface WetMixSettings {
    dilution: number; // 0-1
    charge: number; // 0-1
    attack: number; // 0-1
    length: number; // 0-1
    pull: number; // 0-1
    grade: number; // 0-1
    wetJitter: number; // 0-1
    mix: number; // 0-1
  }
  
  export interface BrushBehavior {
    accumulated: boolean;
    colorized: boolean;
    usePreviousColor: boolean;
    paintOverTransparency: boolean;
    orientToScreen: boolean;
    preserveTransparency: boolean;
  }
  
  export interface BrushPreset {
    id: string;
    brushId: string;
    name: string;
    thumbnail?: string;
    settings: Partial<BrushSettings>;
    color?: Color;
    size?: number;
    opacity?: number;
  }
  
  // ===== LAYER TYPES =====
  
  export type LayerType = 
    | 'raster'
    | 'vector'
    | 'text'
    | 'adjustment'
    | 'reference'
    | 'group';
  
  export type BlendMode = 
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'soft-light'
    | 'hard-light'
    | 'color-dodge'
    | 'color-burn'
    | 'darken'
    | 'lighten'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity'
    | 'clear'
    | 'source'
    | 'destination'
    | 'source-over'
    | 'destination-over'
    | 'source-in'
    | 'destination-in'
    | 'source-out'
    | 'destination-out'
    | 'source-atop'
    | 'destination-atop'
    | 'xor'
    | 'plus'
    | 'modulate';
  
  export interface Layer {
    id: string;
    name: string;
    type: LayerType;
    visible: boolean;
    opacity: number; // 0-1
    blendMode: BlendMode;
    locked: boolean;
    clippingMask: boolean;
    maskLayerId: string | null;
    groupId: string | null;
    strokes: Stroke[];
    transform: LayerTransform;
    effects: LayerEffect[];
    referenceImage?: string; // For reference layers
    thumbnail?: string;
  }
  
  export interface LayerTransform {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    flipX: boolean;
    flipY: boolean;
    skewX?: number;
    skewY?: number;
  }
  
  export interface LayerGroup {
    id: string;
    name: string;
    layerIds: string[];
    expanded: boolean;
    visible: boolean;
    opacity: number;
    blendMode: BlendMode;
  }
  
  export interface ClippingMask {
    baseLayerId: string;
    maskLayerIds: string[];
  }
  
  export interface LayerEffect {
    id: string;
    type: 'blur' | 'noise' | 'chromatic-aberration' | 'halftone' | 'glitch' | 'perspective' | 'liquify';
    enabled: boolean;
    settings: Record<string, any>;
  }
  
  // ===== CANVAS TYPES =====
  
  export interface CanvasState {
    width: number;
    height: number;
    backgroundColor: Color;
    transform: Transform;
    gridVisible: boolean;
    guidesVisible: boolean;
    symmetryEnabled: boolean;
    referenceEnabled: boolean;
  }
  
  export interface CanvasSettings {
    pressureSensitivity: number; // 0-1
    tiltSensitivity: number; // 0-1
    velocitySensitivity: number; // 0-1
    smoothing: number; // 0-1
    predictiveStroke: boolean;
    palmRejection: boolean;
    snapToShapes: boolean;
    gridEnabled: boolean;
    gridSize: number;
    symmetryEnabled: boolean;
    symmetryType: 'vertical' | 'horizontal' | 'quadrant' | 'radial';
    referenceEnabled: boolean;
    quickShapeEnabled: boolean;
    streamlineAmount: number; // 0-1
  }
  
  // ===== GESTURE TYPES =====
  
  export type GestureType = 
    | 'none'
    | 'draw'
    | 'pan'
    | 'pinch'
    | 'rotate'
    | 'tap'
    | 'double-tap'
    | 'long-press'
    | 'swipe'
    | 'quick-menu'
    | 'eyedropper';
  
  export type GestureState = 
    | 'possible'
    | 'began'
    | 'changed'
    | 'ended'
    | 'cancelled'
    | 'failed';
  
  export interface GestureConfig {
    panThreshold: number;
    pinchThreshold: number;
    rotationThreshold: number;
    tapDuration: number;
    doubleTapDuration: number;
    longPressDuration: number;
    priorityOrder: GestureType[];
    enableQuickMenu: boolean;
    enableTwoFingerTap: boolean;
    enableThreeFingerSwipe: boolean;
    enableFourFingerTap: boolean;
  }
  
  // ===== SELECTION TYPES =====
  
  export interface Selection {
    id: string;
    type: 'rectangle' | 'ellipse' | 'lasso' | 'polygonal' | 'magnetic' | 'quick';
    path: Point[];
    bounds: Bounds;
    feather: number;
    antiAlias: boolean;
    mode: 'new' | 'add' | 'subtract' | 'intersect';
  }
  
  // ===== DOCUMENT TYPES =====
  
  export interface Document {
    id: string;
    name: string;
    width: number;
    height: number;
    dpi: number;
    colorProfile: string;
    created: number;
    modified: number;
    thumbnail?: string;
    layers: Layer[];
    layerOrder: string[];
    currentLayerId: string | null;
    settings: CanvasSettings;
  }
  
  // ===== EXPORT TYPES =====
  
  export interface ExportSettings {
    format: 'png' | 'jpeg' | 'psd' | 'procreate' | 'pdf' | 'tiff';
    quality: number; // 0-100
    scale: number; // Export scale multiplier
    colorProfile: string;
    includeBackground: boolean;
    includeLayers: boolean;
    includeMetadata: boolean;
  }
  
  // ===== REFERENCE TYPES =====
  
  export interface ReferenceImage {
    id: string;
    source: string; // URL or base64
    bounds: Bounds;
    opacity: number;
    locked: boolean;
    aspectRatio: number;
  }
  
  // ===== SYMMETRY TYPES =====
  
  export interface SymmetryGuide {
    type: 'vertical' | 'horizontal' | 'quadrant' | 'radial';
    center: Point;
    angle: number; // For radial
    segments: number; // For radial
    visible: boolean;
    color: Color;
  }
  
  // ===== TEXT TYPES =====
  
  export interface TextLayer extends Layer {
    text: string;
    font: {
      family: string;
      size: number;
      weight: number;
      style: 'normal' | 'italic' | 'oblique';
    };
    alignment: 'left' | 'center' | 'right' | 'justify';
    lineHeight: number;
    letterSpacing: number;
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textPath?: Point[];
  }
  
  // ===== SHAPE TYPES =====
  
  export interface Shape {
    id: string;
    type: 'rectangle' | 'ellipse' | 'line' | 'polygon' | 'star' | 'custom';
    points: Point[];
    fill: Color | Gradient | null;
    stroke: {
      color: Color;
      width: number;
      dashArray?: number[];
      lineCap: 'butt' | 'round' | 'square';
      lineJoin: 'miter' | 'round' | 'bevel';
    } | null;
    cornerRadius?: number;
    sides?: number; // For polygons
    innerRadius?: number; // For stars
  }
  
  // ===== USER TYPES - FIXED: Added missing SkillLevel =====
  
  export type SkillLevel = 'beginner' | 'some-experience' | 'intermediate' | 'advanced';