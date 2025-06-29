// src/engines/drawing/DrawingCanvas.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  Platform,
} from 'react-native';
import {
  Canvas,
  useCanvasRef,
  Path,
  Group,
  Skia,
} from '@shopify/react-native-skia';
import { GestureHandlerRootView, TapGestureHandler, State } from 'react-native-gesture-handler';
import { DrawingEngine } from './DrawingEngine';
import { BrushSettings, Point, Stroke } from './types';
import { BrushSystem } from './BrushSystem';

interface DrawingCanvasProps {
  style?: any;
  onDrawingChange?: (strokes: Stroke[]) => void;
  brushSettings?: Partial<BrushSettings>;
  width?: number;
  height?: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  style,
  onDrawingChange,
  brushSettings: propBrushSettings,
  width: propWidth,
  height: propHeight,
}) => {
  const canvasRef = useCanvasRef();
  const engine = DrawingEngine.getInstance();
  const brushSystem = BrushSystem.getInstance();
  
  const [dimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return {
      width: propWidth || width,
      height: propHeight || height - 200,
    };
  });

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentPath, setCurrentPath] = useState<any>(null);
  const [brushSettings, setBrushSettings] = useState<BrushSettings>({
    tool: 'brush',
    size: 4,
    opacity: 1,
    color: '#000000',
    pressureSensitivity: 0.8,
    smoothing: 0.5,
    ...propBrushSettings,
  });

  // Gesture tracking
  const lastTapTime = useRef(0);
  const tapCount = useRef(0);

  // === Touch Handling ===
  
  const extractPointFromEvent = useCallback((event: GestureResponderEvent): Point => {
    const touch = event.nativeEvent;
    
    // Apple Pencil detection on iOS
    let pressure = 0.5;
    if (Platform.OS === 'ios' && 'force' in touch) {
      pressure = Math.max(0, Math.min(1, (touch as any).force));
    }
    
    return {
      x: touch.locationX,
      y: touch.locationY,
      pressure,
      timestamp: Date.now(),
    };
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (evt) => {
      const point = extractPointFromEvent(evt);
      engine.startStroke(point, brushSettings);
      
      // Start rendering current stroke
      const currentStroke = engine.getCurrentStroke();
      if (currentStroke) {
        const path = Skia.Path.Make();
        path.moveTo(point.x, point.y);
        setCurrentPath(path);
      }
    },
    
    onPanResponderMove: (evt) => {
      const point = extractPointFromEvent(evt);
      engine.addPoint(point);
      
      // Update current path - use a workaround to access the path creation
      const currentStroke = engine.getCurrentStroke();
      if (currentStroke && currentStroke.points.length > 1) {
        const path = createPathFromPoints(currentStroke.points);
        setCurrentPath(path);
      }
    },
    
    onPanResponderRelease: () => {
      const completedStroke = engine.endStroke();
      if (completedStroke) {
        setStrokes(engine.getAllStrokes());
        onDrawingChange?.(engine.getAllStrokes());
      }
      setCurrentPath(null);
    },
  });

  // Helper function to create path from points
  const createPathFromPoints = (points: Point[]) => {
    const path = Skia.Path.Make();
    
    if (points.length === 0) return path;
    
    if (points.length === 1) {
      path.addCircle(points[0].x, points[0].y, 2);
      return path;
    }
    
    path.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      path.quadTo(points[i].x, points[i].y, xc, yc);
    }
    
    const last = points[points.length - 1];
    path.lineTo(last.x, last.y);
    
    return path;
  };

  // === Gesture Handling ===
  
  const handleTap = useCallback((event: any) => {
    if (event.nativeEvent.state === State.END) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime.current;
      
      if (timeSinceLastTap < 300) {
        tapCount.current++;
      } else {
        tapCount.current = 1;
      }
      
      lastTapTime.current = now;
      
      // Handle gestures
      setTimeout(() => {
        if (tapCount.current === 2) {
          // Double tap - Undo
          if (engine.undo()) {
            setStrokes(engine.getAllStrokes());
            onDrawingChange?.(engine.getAllStrokes());
          }
        } else if (tapCount.current === 3) {
          // Triple tap - Redo
          if (engine.redo()) {
            setStrokes(engine.getAllStrokes());
            onDrawingChange?.(engine.getAllStrokes());
          }
        }
        tapCount.current = 0;
      }, 300);
    }
  }, [engine, onDrawingChange]);

  // === Rendering ===
  
  const renderStroke = useCallback((stroke: Stroke) => {
    if (!stroke.path || !stroke.paint) return null;
    
    return (
      <Path
        key={stroke.id}
        path={stroke.path}
        paint={stroke.paint}
      />
    );
  }, []);

  const currentPaint = React.useMemo(() => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(brushSettings.color));
    paint.setAlphaf(brushSettings.opacity);
    paint.setStyle(1); // Stroke
    paint.setStrokeWidth(brushSettings.size);
    paint.setStrokeCap(1); // Round
    paint.setStrokeJoin(1); // Round
    paint.setAntiAlias(true);
    return paint;
  }, [brushSettings]);

  return (
    <GestureHandlerRootView style={[styles.container, style]}>
      <TapGestureHandler onHandlerStateChange={handleTap}>
        <View style={dimensions}>
          <View {...panResponder.panHandlers} style={StyleSheet.absoluteFillObject}>
            <Canvas ref={canvasRef} style={StyleSheet.absoluteFillObject}>
              <Group>
                {/* Render completed strokes */}
                {strokes.map(renderStroke)}
                
                {/* Render current stroke */}
                {currentPath && (
                  <Path
                    path={currentPath}
                    paint={currentPaint}
                  />
                )}
              </Group>
            </Canvas>
          </View>
        </View>
      </TapGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});