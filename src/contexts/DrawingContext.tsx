// src/contexts/DrawingContext.tsx - ENTERPRISE DRAWING CONTEXT - FINAL FIXED

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';
import {
  // FIXED: Import types from main types index
  Tool,
  DrawingTool,
  Color,
  Transform,
  Brush,
  Layer,
  DrawingState,
  CanvasSettings,
  HistoryEntry,
  DrawingStats,
  Point,
  Stroke,
} from '../types';
import { drawingEngine } from '../engines/drawing';
import { EventBus } from '../engines/core/EventBus';
import { errorHandler } from '../engines/core/ErrorHandler';

// FIXED: Drawing Context Interface using DrawingTool for consistency
export interface DrawingContextType {
  // Drawing State
  drawingState: DrawingState;
  isDrawing: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Tools & Settings - FIXED: Use DrawingTool instead of Tool
  currentTool: DrawingTool;
  currentColor: Color;
  currentBrush: Brush | null;
  brushSize: number;
  opacity: number;
  layers: Layer[];
  activeLayerId: string;
  canvasSettings: CanvasSettings;

  // Canvas Operations
  startStroke: (point: Point) => void;
  addStrokePoint: (point: Point) => void;
  endStroke: () => void;
  clearCanvas: () => void;
  undo: () => boolean;
  redo: () => boolean;

  // Tool Management - FIXED: Use DrawingTool
  setTool: (tool: DrawingTool) => void;
  setBrush: (brush: Brush) => void;
  setBrushSize: (size: number) => void;
  setOpacity: (opacity: number) => void;
  setColor: (color: Color) => void;

  // Layer Management
  addLayer: (name?: string) => Layer;
  deleteLayer: (layerId: string) => void;
  setActiveLayer: (layerId: string) => void;
  duplicateLayer: (layerId: string) => Layer;
  mergeDown: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  setLayerVisibility: (layerId: string, visible: boolean) => void;

  // Canvas Settings
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  setCanvasSize: (width: number, height: number) => void;
  setPressureSensitivity: (enabled: boolean) => void;
  setSmoothing: (amount: number) => void;

  // File Operations
  saveDrawing: (title?: string) => Promise<string>;
  loadDrawing: (drawingId: string) => Promise<void>;
  exportImage: (format: 'png' | 'jpeg', quality?: number) => Promise<string>;

  // Utilities
  getCanvasStats: () => DrawingStats;
  getCurrentStroke: () => Stroke | null;
  hasUnsavedChanges: () => boolean;
  resetToDefaults: () => void;
}

// Default values
const createDefaultColor = (): Color => ({
  hex: '#000000',
  rgb: { r: 0, g: 0, b: 0 },
  hsb: { h: 0, s: 0, b: 0 },
  alpha: 1,
});

const createDefaultBrush = (): Brush => ({
  id: 'default',
  name: 'Default Brush',
  category: 'pencil',
  icon: '✏️',
  settings: {
    size: 10,
    minSize: 1,
    maxSize: 100,
    opacity: 1,
    flow: 1,
    hardness: 1,
    spacing: 0.1,
    smoothing: 0.5,
    pressureSensitivity: 0.8,
  },
  pressureCurve: [0, 0.5, 1],
  tiltSupport: true,
  velocitySupport: false,
  customizable: true,
});

const createDefaultCanvasSettings = (): CanvasSettings => ({
  pressureSensitivity: true,
  tiltSensitivity: true,
  velocitySensitivity: false,
  palmRejection: true,
  quickMenuEnabled: true,
  autoSave: true,
  autoSaveInterval: 60000,
  smoothing: 0.5,
  predictiveStroke: true,
  snapToShapes: false,
  gridEnabled: false,
  gridSize: 20,
  symmetryEnabled: false,
  symmetryType: 'vertical',
  referenceEnabled: false,
  streamlineAmount: 0.5,
  quickShapeEnabled: true,
});

const createDefaultLayer = (id: string = 'layer_1', name: string = 'Layer 1'): Layer => ({
  id,
  name,
  type: 'raster',
  strokes: [],
  opacity: 1,
  blendMode: 'normal',
  visible: true,
  locked: false,
  data: {},
  order: 0,
});

const createDefaultDrawingState = (): DrawingState => ({
  currentTool: 'brush',
  currentColor: createDefaultColor(),
  currentBrush: createDefaultBrush(),
  brushSize: 10,
  opacity: 1,
  layers: [createDefaultLayer()],
  activeLayerId: 'layer_1',
  strokes: [],
  canvasWidth: 1024,
  canvasHeight: 768,
  zoom: 1,
  pan: { x: 0, y: 0 },
  rotation: 0,
  gridVisible: false,
  gridSize: 20,
  referenceImage: null,
  referenceOpacity: 0.5,
  drawingMode: 'normal',
  history: [],
  historyIndex: 0,
  stats: {
    totalStrokes: 0,
    totalTime: 0,
    layersUsed: 1,
    colorsUsed: 1,
    brushesUsed: 1,
    undoCount: 0,
    redoCount: 0,
  },
  settings: createDefaultCanvasSettings(),
  recentColors: ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'],
  customBrushes: [],
  savedPalettes: [],
});

// Context creation
const DrawingContext = createContext<DrawingContextType | null>(null);

// Provider component
export function DrawingProvider({ children }: { children: ReactNode }) {
  const eventBus = EventBus.getInstance();
  
  // State
  const [drawingState, setDrawingState] = useState<DrawingState>(createDefaultDrawingState());
  const [isDrawing, setIsDrawing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Initialize drawing system
  const initializeDrawing = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize drawing engine
      const success = await drawingEngine.initialize();
      if (!success) {
        throw new Error('Failed to initialize drawing engine');
      }

      setIsInitialized(true);
      console.log('🎨 Drawing context initialized successfully');
    } catch (err) {
      const error = err as Error;
      console.error('❌ Failed to initialize drawing context:', error);
      setError(error.message);
      errorHandler.handleError(
        errorHandler.createError('DRAWING_ERROR', 'Failed to initialize drawing context', 'high', { error })
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Stroke management
  const startStroke = useCallback((point: Point) => {
    if (!isInitialized) return;

    const strokeId = `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newStroke: Stroke = {
      id: strokeId,
      points: [point],
      color: drawingState.currentColor.hex,
      brushId: drawingState.currentBrush?.id || 'default',
      size: drawingState.brushSize,
      opacity: drawingState.opacity,
      blendMode: 'normal',
      smoothing: drawingState.settings.smoothing || 0.5,
    };

    setCurrentStroke(newStroke);
    setIsDrawing(true);
    setUnsavedChanges(true);

    eventBus.emit('drawing:stroke_started', { stroke: newStroke });
  }, [drawingState, isInitialized]);

  const addStrokePoint = useCallback((point: Point) => {
    if (!isDrawing || !currentStroke) return;

    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, point],
    };

    setCurrentStroke(updatedStroke);
    eventBus.emit('drawing:stroke_updated', { stroke: updatedStroke });
  }, [isDrawing, currentStroke]);

  const endStroke = useCallback(() => {
    if (!isDrawing || !currentStroke) return;

    // Add stroke to active layer
    const activeLayer = drawingState.layers.find(layer => layer.id === drawingState.activeLayerId);
    if (activeLayer) {
      const updatedLayers = drawingState.layers.map(layer => 
        layer.id === drawingState.activeLayerId
          ? { ...layer, strokes: [...layer.strokes, currentStroke] }
          : layer
      );

      // Update drawing state
      setDrawingState(prev => ({
        ...prev,
        layers: updatedLayers,
        strokes: [...prev.strokes, currentStroke],
        stats: {
          ...prev.stats,
          totalStrokes: prev.stats.totalStrokes + 1,
        },
      }));

      // Add to history
      const historyEntry: HistoryEntry = {
        id: `history_${Date.now()}`,
        action: 'stroke_added',
        timestamp: Date.now(),
        data: { strokeId: currentStroke.id, layerId: drawingState.activeLayerId },
      };

      setDrawingState(prev => ({
        ...prev,
        history: [...prev.history.slice(0, prev.historyIndex + 1), historyEntry],
        historyIndex: prev.historyIndex + 1,
      }));
    }

    setCurrentStroke(null);
    setIsDrawing(false);

    eventBus.emit('drawing:stroke_completed', { stroke: currentStroke });
  }, [isDrawing, currentStroke, drawingState]);

  // Tool management - FIXED: Use DrawingTool
  const setTool = useCallback((tool: DrawingTool) => {
    setDrawingState(prev => ({ ...prev, currentTool: tool }));
    eventBus.emit('drawing:tool_changed', { tool });
  }, []);

  const setBrush = useCallback((brush: Brush) => {
    setDrawingState(prev => ({ ...prev, currentBrush: brush }));
    eventBus.emit('drawing:brush_changed', { brush });
  }, []);

  const setBrushSize = useCallback((size: number) => {
    setDrawingState(prev => ({ ...prev, brushSize: Math.max(1, Math.min(100, size)) }));
  }, []);

  const setOpacity = useCallback((opacity: number) => {
    setDrawingState(prev => ({ ...prev, opacity: Math.max(0, Math.min(1, opacity)) }));
  }, []);

  const setColor = useCallback((color: Color) => {
    setDrawingState(prev => ({
      ...prev,
      currentColor: color,
      recentColors: [
        color.hex,
        ...prev.recentColors.filter(c => c !== color.hex).slice(0, 9)
      ],
    }));
    eventBus.emit('drawing:color_changed', { color });
  }, []);

  // Canvas operations
  const clearCanvas = useCallback(() => {
    const clearedLayers = drawingState.layers.map(layer => ({
      ...layer,
      strokes: [],
    }));

    setDrawingState(prev => ({
      ...prev,
      layers: clearedLayers,
      strokes: [],
    }));

    setUnsavedChanges(true);
    eventBus.emit('drawing:canvas_cleared');
  }, [drawingState.layers]);

  const undo = useCallback((): boolean => {
    if (drawingState.historyIndex <= 0) return false;

    const newIndex = drawingState.historyIndex - 1;
    setDrawingState(prev => ({
      ...prev,
      historyIndex: newIndex,
      stats: { ...prev.stats, undoCount: prev.stats.undoCount + 1 },
    }));

    setUnsavedChanges(true);
    eventBus.emit('drawing:undo_performed');
    return true;
  }, [drawingState.historyIndex]);

  const redo = useCallback((): boolean => {
    if (drawingState.historyIndex >= drawingState.history.length - 1) return false;

    const newIndex = drawingState.historyIndex + 1;
    setDrawingState(prev => ({
      ...prev,
      historyIndex: newIndex,
      stats: { ...prev.stats, redoCount: prev.stats.redoCount + 1 },
    }));

    setUnsavedChanges(true);
    eventBus.emit('drawing:redo_performed');
    return true;
  }, [drawingState.historyIndex, drawingState.history.length]);

  // Layer management
  const addLayer = useCallback((name?: string): Layer => {
    const layerId = `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const layerName = name || `Layer ${drawingState.layers.length + 1}`;
    const newLayer = createDefaultLayer(layerId, layerName);
    newLayer.order = drawingState.layers.length;

    setDrawingState(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer],
      activeLayerId: layerId,
      stats: { ...prev.stats, layersUsed: prev.stats.layersUsed + 1 },
    }));

    setUnsavedChanges(true);
    eventBus.emit('drawing:layer_added', { layer: newLayer });
    return newLayer;
  }, [drawingState.layers]);

  const deleteLayer = useCallback((layerId: string) => {
    if (drawingState.layers.length <= 1) return; // Don't delete last layer

    const updatedLayers = drawingState.layers.filter(layer => layer.id !== layerId);
    const newActiveLayerId = drawingState.activeLayerId === layerId
      ? updatedLayers[0]?.id || ''
      : drawingState.activeLayerId;

    setDrawingState(prev => ({
      ...prev,
      layers: updatedLayers,
      activeLayerId: newActiveLayerId,
    }));

    setUnsavedChanges(true);
    eventBus.emit('drawing:layer_deleted', { layerId });
  }, [drawingState.layers, drawingState.activeLayerId]);

  const setActiveLayer = useCallback((layerId: string) => {
    setDrawingState(prev => ({ ...prev, activeLayerId: layerId }));
    eventBus.emit('drawing:active_layer_changed', { layerId });
  }, []);

  const duplicateLayer = useCallback((layerId: string): Layer => {
    const originalLayer = drawingState.layers.find(layer => layer.id === layerId);
    if (!originalLayer) throw new Error('Layer not found');

    const duplicatedLayer: Layer = {
      ...originalLayer,
      id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${originalLayer.name} Copy`,
      order: drawingState.layers.length,
    };

    setDrawingState(prev => ({
      ...prev,
      layers: [...prev.layers, duplicatedLayer],
      activeLayerId: duplicatedLayer.id,
    }));

    setUnsavedChanges(true);
    eventBus.emit('drawing:layer_duplicated', { originalLayer, duplicatedLayer });
    return duplicatedLayer;
  }, [drawingState.layers]);

  const mergeDown = useCallback((layerId: string) => {
    // Implementation would merge layer with the one below it
    console.log('Merge down not yet implemented for layer:', layerId);
  }, []);

  const setLayerOpacity = useCallback((layerId: string, opacity: number) => {
    const updatedLayers = drawingState.layers.map(layer =>
      layer.id === layerId ? { ...layer, opacity: Math.max(0, Math.min(1, opacity)) } : layer
    );

    setDrawingState(prev => ({ ...prev, layers: updatedLayers }));
    setUnsavedChanges(true);
  }, [drawingState.layers]);

  const setLayerVisibility = useCallback((layerId: string, visible: boolean) => {
    const updatedLayers = drawingState.layers.map(layer =>
      layer.id === layerId ? { ...layer, visible } : layer
    );

    setDrawingState(prev => ({ ...prev, layers: updatedLayers }));
    setUnsavedChanges(true);
  }, [drawingState.layers]);

  // Canvas settings
  const updateCanvasSettings = useCallback((settings: Partial<CanvasSettings>) => {
    setDrawingState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  }, []);

  const setCanvasSize = useCallback((width: number, height: number) => {
    setDrawingState(prev => ({ ...prev, canvasWidth: width, canvasHeight: height }));
    setUnsavedChanges(true);
  }, []);

  const setPressureSensitivity = useCallback((enabled: boolean) => {
    updateCanvasSettings({ pressureSensitivity: enabled });
  }, [updateCanvasSettings]);

  const setSmoothing = useCallback((amount: number) => {
    updateCanvasSettings({ smoothing: Math.max(0, Math.min(1, amount)) });
  }, [updateCanvasSettings]);

  // File operations
  const saveDrawing = useCallback(async (title?: string): Promise<string> => {
    try {
      // In production, this would save to the user's portfolio
      const drawingId = `drawing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Mock save operation
      console.log('Saving drawing:', { title, drawingId, state: drawingState });
      
      setUnsavedChanges(false);
      eventBus.emit('drawing:saved', { drawingId, title });
      
      return drawingId;
    } catch (error) {
      console.error('Failed to save drawing:', error);
      throw error;
    }
  }, [drawingState]);

  const loadDrawing = useCallback(async (drawingId: string): Promise<void> => {
    try {
      // In production, this would load from storage
      console.log('Loading drawing:', drawingId);
      
      // Mock load operation - would restore drawing state
      eventBus.emit('drawing:loaded', { drawingId });
    } catch (error) {
      console.error('Failed to load drawing:', error);
      throw error;
    }
  }, []);

  const exportImage = useCallback(async (format: 'png' | 'jpeg', quality: number = 1): Promise<string> => {
    try {
      // In production, this would export the canvas to image
      const imageUri = `mock_export_${Date.now()}.${format}`;
      console.log('Exporting image:', { format, quality, uri: imageUri });
      
      eventBus.emit('drawing:exported', { format, quality, uri: imageUri });
      return imageUri;
    } catch (error) {
      console.error('Failed to export image:', error);
      throw error;
    }
  }, []);

  // Utilities
  const getCanvasStats = useCallback((): DrawingStats => {
    return drawingState.stats;
  }, [drawingState.stats]);

  const getCurrentStroke = useCallback((): Stroke | null => {
    return currentStroke;
  }, [currentStroke]);

  const hasUnsavedChanges = useCallback((): boolean => {
    return unsavedChanges;
  }, [unsavedChanges]);

  const resetToDefaults = useCallback(() => {
    setDrawingState(createDefaultDrawingState());
    setCurrentStroke(null);
    setIsDrawing(false);
    setUnsavedChanges(false);
    eventBus.emit('drawing:reset');
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeDrawing();
  }, [initializeDrawing]);

  // Create context value
  const contextValue = useMemo<DrawingContextType>(() => ({
    // Drawing State
    drawingState,
    isDrawing,
    isInitialized,
    isLoading,
    error,

    // Current settings
    currentTool: drawingState.currentTool,
    currentColor: drawingState.currentColor,
    currentBrush: drawingState.currentBrush,
    brushSize: drawingState.brushSize,
    opacity: drawingState.opacity,
    layers: drawingState.layers,
    activeLayerId: drawingState.activeLayerId,
    canvasSettings: drawingState.settings,

    // Canvas Operations
    startStroke,
    addStrokePoint,
    endStroke,
    clearCanvas,
    undo,
    redo,

    // Tool Management
    setTool,
    setBrush,
    setBrushSize,
    setOpacity,
    setColor,

    // Layer Management
    addLayer,
    deleteLayer,
    setActiveLayer,
    duplicateLayer,
    mergeDown,
    setLayerOpacity,
    setLayerVisibility,

    // Canvas Settings
    updateCanvasSettings,
    setCanvasSize,
    setPressureSensitivity,
    setSmoothing,

    // File Operations
    saveDrawing,
    loadDrawing,
    exportImage,

    // Utilities
    getCanvasStats,
    getCurrentStroke,
    hasUnsavedChanges,
    resetToDefaults,
  }), [
    drawingState, isDrawing, isInitialized, isLoading, error,
    startStroke, addStrokePoint, endStroke, clearCanvas, undo, redo,
    setTool, setBrush, setBrushSize, setOpacity, setColor,
    addLayer, deleteLayer, setActiveLayer, duplicateLayer, mergeDown,
    setLayerOpacity, setLayerVisibility, updateCanvasSettings, setCanvasSize,
    setPressureSensitivity, setSmoothing, saveDrawing, loadDrawing, exportImage,
    getCanvasStats, getCurrentStroke, hasUnsavedChanges, resetToDefaults,
  ]);

  return (
    <DrawingContext.Provider value={contextValue}>
      {children}
    </DrawingContext.Provider>
  );
}

// Hook for using the drawing context
export function useDrawing(): DrawingContextType {
  const context = useContext(DrawingContext);
  if (!context) {
    throw new Error('useDrawing must be used within a DrawingProvider');
  }
  return context;
}

// Export the context for advanced usage
export { DrawingContext };