// src/components/Canvas.tsx - FIXED ALL IMPORT AND EXPORT ISSUES
import React, { useRef, useImperativeHandle, forwardRef, useCallback, useEffect, useState } from 'react';
import { View, Text, PanResponder, Dimensions, GestureResponderEvent } from 'react-native';
import { Canvas, Group, Path, useCanvasRef } from '@shopify/react-native-skia';
// ✅ CRITICAL FIX: Correct import path
import { skiaDrawingEngine, Point, Stroke, Layer } from '../engines/drawing/DrawingEngine';
import * as Haptics from 'expo-haptics';

interface SkiaCanvasProps {
  width: number;
  height: number;
  onStrokeStart?: (stroke: Stroke) => void;
  onStrokeUpdate?: (stroke: Stroke) => void;
  onStrokeEnd?: (stroke: Stroke) => void;
  onReady?: () => void;
}

export interface SkiaCanvasRef {
  clear: () => void;
  undo: () => void;
  redo: () => void;
  getCurrentStroke: () => Stroke | null;
  getStats: () => any;
  exportAsPNG: () => Promise<string | null>;
  getStrokes?: () => Stroke[]; // Added for compatibility
}

/**
 * PROFESSIONAL SKIA CANVAS COMPONENT - FIXED ALL ISSUES
 * 
 * ✅ CRITICAL FIXES:
 * - Fixed import paths to use relative imports
 * - Added proper force handling with null safety
 * - Fixed stroke parameter types
 * - Added backward compatibility methods
 * - Proper event subscription cleanup
 */
export const SkiaCanvas = forwardRef<SkiaCanvasRef, SkiaCanvasProps>(({
  width,
  height,
  onStrokeStart,
  onStrokeUpdate,
  onStrokeEnd,
  onReady,
}, ref) => {
  // State
  const [layers, setLayers] = useState<Layer[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Refs
  const canvasRef = useCanvasRef();
  const lastPoint = useRef<Point | null>(null);
  const strokeStartTime = useRef<number>(0);

  // Initialize canvas
  useEffect(() => {
    skiaDrawingEngine.setCanvasSize(width, height);
    
    // Subscribe to engine events
    const unsubscribeStrokeStarted = skiaDrawingEngine.on('stroke:started', (data: any) => {
      setCurrentStroke(data.stroke);
      onStrokeStart?.(data.stroke);
    });
    
    const unsubscribeStrokeUpdated = skiaDrawingEngine.on('stroke:updated', (data: any) => {
      setCurrentStroke({ ...data.stroke });
      onStrokeUpdate?.(data.stroke);
    });
    
    const unsubscribeStrokeCompleted = skiaDrawingEngine.on('stroke:completed', (data: any) => {
      setLayers([...skiaDrawingEngine.getLayers()]);
      setCurrentStroke(null);
      onStrokeEnd?.(data.stroke);
    });
    
    const unsubscribeLayerChanged = skiaDrawingEngine.on('layer:created', () => {
      setLayers([...skiaDrawingEngine.getLayers()]);
    });
    
    const unsubscribeCanvasCleared = skiaDrawingEngine.on('canvas:cleared', () => {
      setLayers([...skiaDrawingEngine.getLayers()]);
      setCurrentStroke(null);
    });

    setIsReady(true);
    onReady?.();
    
    return () => {
      // Cleanup subscriptions
      unsubscribeStrokeStarted();
      unsubscribeStrokeUpdated();
      unsubscribeStrokeCompleted();
      unsubscribeLayerChanged();
      unsubscribeCanvasCleared();
    };
  }, [width, height, onReady, onStrokeStart, onStrokeUpdate, onStrokeEnd]);

  // Load initial layers
  useEffect(() => {
    if (isReady) {
      setLayers([...skiaDrawingEngine.getLayers()]);
    }
  }, [isReady]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    clear: () => {
      skiaDrawingEngine.clearCanvas();
    },
    undo: () => {
      const success = skiaDrawingEngine.undo();
      if (success) {
        setLayers([...skiaDrawingEngine.getLayers()]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return success;
    },
    redo: () => {
      const success = skiaDrawingEngine.redo();
      if (success) {
        setLayers([...skiaDrawingEngine.getLayers()]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return success;
    },
    getCurrentStroke: () => {
      return skiaDrawingEngine.getCurrentStroke();
    },
    getStats: () => {
      return skiaDrawingEngine.getCanvasStats();
    },
    exportAsPNG: () => {
      return skiaDrawingEngine.exportAsPNG();
    },
    // ✅ Added for backward compatibility
    getStrokes: () => {
      const allLayers = skiaDrawingEngine.getLayers();
      return allLayers.flatMap(layer => layer.strokes);
    },
  }));

  // =================== TOUCH HANDLING ===================

  const extractPointFromEvent = useCallback((event: GestureResponderEvent): Point => {
    const { locationX, locationY, timestamp } = event.nativeEvent;
    
    // ✅ CRITICAL FIX: Proper force handling with null safety
    let pressure = 0.5;
    if ('force' in event.nativeEvent && typeof event.nativeEvent.force === 'number' && event.nativeEvent.force > 0) {
      pressure = Math.min(event.nativeEvent.force, 1.0);
    }
    
    // Calculate velocity
    let velocity = 0;
    if (lastPoint.current) {
      const timeDiff = timestamp - lastPoint.current.timestamp;
      const distance = Math.sqrt(
        Math.pow(locationX - lastPoint.current.x, 2) + 
        Math.pow(locationY - lastPoint.current.y, 2)
      );
      velocity = timeDiff > 0 ? distance / timeDiff : 0;
    }

    return {
      x: locationX,
      y: locationY,
      pressure,
      timestamp,
      velocity,
    };
  }, []);

  const handleTouchStart = useCallback((event: GestureResponderEvent) => {
    const point = extractPointFromEvent(event);
    lastPoint.current = point;
    strokeStartTime.current = Date.now();
    
    skiaDrawingEngine.startStroke(point);
    
    // Haptic feedback for stroke start
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    console.log('🎨 Touch started:', point);
  }, [extractPointFromEvent]);

  const handleTouchMove = useCallback((event: GestureResponderEvent) => {
    const point = extractPointFromEvent(event);
    
    // Throttle points for performance
    if (lastPoint.current) {
      const distance = Math.sqrt(
        Math.pow(point.x - lastPoint.current.x, 2) + 
        Math.pow(point.y - lastPoint.current.y, 2)
      );
      
      if (distance < 2) return; // Skip points too close together
    }
    
    lastPoint.current = point;
    skiaDrawingEngine.addStrokePoint(point);
  }, [extractPointFromEvent]);

  const handleTouchEnd = useCallback(() => {
    skiaDrawingEngine.endStroke();
    lastPoint.current = null;
    
    const strokeDuration = Date.now() - strokeStartTime.current;
    console.log('✅ Touch ended, stroke duration:', strokeDuration, 'ms');
    
    // Haptic feedback for stroke end
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // =================== GESTURE RESPONDER ===================

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleTouchStart,
      onPanResponderMove: handleTouchMove,
      onPanResponderRelease: handleTouchEnd,
      onPanResponderTerminate: handleTouchEnd,
      onShouldBlockNativeResponder: () => false,
    })
  ).current;

  // =================== RENDER HELPERS ===================

  const renderLayer = useCallback((layer: Layer) => {
    if (!layer.visible || layer.strokes.length === 0) return null;

    return (
      <Group key={layer.id} opacity={layer.opacity}>
        {layer.strokes.map((stroke: Stroke) => { // ✅ FIXED: Added type annotation
          if (!stroke.path) return null;
          
          return (
            <Path
              key={stroke.id}
              path={stroke.path}
              paint={stroke.paint}
            />
          );
        })}
      </Group>
    );
  }, []);

  const renderCurrentStroke = useCallback(() => {
    if (!currentStroke || !currentStroke.path) return null;
    
    return (
      <Path
        path={currentStroke.path}
        paint={currentStroke.paint}
      />
    );
  }, [currentStroke]);

  // =================== MAIN RENDER ===================

  if (!isReady) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: '#F5F5F5',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
        }}
      >
        <View style={{ padding: 20 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#007AFF',
              opacity: 0.7,
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        width,
        height,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
      }}
      {...panResponder.panHandlers}
    >
      <Canvas
        ref={canvasRef}
        style={{ width, height }}
      >
        {/* Render all layers */}
        {layers.map(renderLayer)}
        
        {/* Render current stroke being drawn */}
        {renderCurrentStroke()}
      </Canvas>
      
      {/* Performance overlay (development only) */}
      {__DEV__ && (
        <View
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            backgroundColor: 'rgba(0,0,0,0.7)',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: 'white', fontSize: 10, fontFamily: 'monospace' }}>
            Layers: {layers.length} | Strokes: {layers.reduce((sum, layer) => sum + layer.strokes.length, 0)}
          </Text>
        </View>
      )}
    </View>
  );
});

SkiaCanvas.displayName = 'SkiaCanvas';

// ✅ CRITICAL FIX: Export as SimpleCanvas for backward compatibility
export const SimpleCanvas = SkiaCanvas;

// Export the ref type for compatibility
export type SimpleCanvasRef = SkiaCanvasRef;

// Default export for convenience
export default SkiaCanvas;