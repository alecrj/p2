import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  PanResponder,
  Dimensions,
  StyleSheet,
} from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

interface SimpleCanvasProps {
  width?: number;
  height?: number;
  onStrokeStart?: (stroke: StrokeData) => void;
  onStrokeUpdate?: (stroke: StrokeData) => void;
  onStrokeEnd?: (stroke: StrokeData) => void;
  onReady?: () => void;
}

interface PathData {
  d: string;
  color: string;
  strokeWidth: number;
  id: string;
}

interface StrokeData {
  id: string;
  points: Array<{ x: number; y: number; timestamp?: number }>;
  color: string;
  strokeWidth: number;
  timestamp: number;
}

/**
 * Simple SVG-based canvas that WORKS immediately
 * Perfect for theory lessons and basic drawing validation
 * No complex dependencies - just works!
 */
export const SimpleCanvas = React.forwardRef<any, SimpleCanvasProps>(
  ({ 
    width: propWidth, 
    height: propHeight, 
    onStrokeStart, 
    onStrokeUpdate, 
    onStrokeEnd,
    onReady 
  }, ref) => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const canvasWidth = propWidth || screenWidth;
    const canvasHeight = propHeight || screenHeight - 200;

    const [paths, setPaths] = useState<PathData[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('');
    const [isDrawing, setIsDrawing] = useState(false);
    
    const pathId = useRef(0);
    const currentStroke = useRef<StrokeData | null>(null);
    const currentColor = useRef('#000000');
    const currentStrokeWidth = useRef(4);

    // Initialize canvas
    React.useEffect(() => {
      console.log('✅ Simple Canvas ready');
      onReady?.();
    }, [onReady]);

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        
        // Start new path
        const newPath = `M${locationX},${locationY}`;
        setCurrentPath(newPath);
        setIsDrawing(true);
        pathId.current++;

        // Create stroke data
        currentStroke.current = {
          id: `stroke_${pathId.current}_${Date.now()}`,
          points: [{ x: locationX, y: locationY, timestamp: Date.now() }],
          color: currentColor.current,
          strokeWidth: currentStrokeWidth.current,
          timestamp: Date.now(),
        };

        onStrokeStart?.(currentStroke.current);
      },

      onPanResponderMove: (evt) => {
        if (!isDrawing) return;
        
        const { locationX, locationY } = evt.nativeEvent;
        
        // Add line to path
        setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
        
        // Update stroke data
        if (currentStroke.current) {
          currentStroke.current.points.push({ 
            x: locationX, 
            y: locationY, 
            timestamp: Date.now() 
          });
          onStrokeUpdate?.(currentStroke.current);
        }
      },

      onPanResponderRelease: () => {
        if (!isDrawing || !currentPath) return;

        // Finalize path
        const newPathData: PathData = {
          d: currentPath,
          color: currentColor.current,
          strokeWidth: currentStrokeWidth.current,
          id: `path_${pathId.current}`,
        };

        setPaths(prev => [...prev, newPathData]);
        setCurrentPath('');
        setIsDrawing(false);

        if (currentStroke.current) {
          onStrokeEnd?.(currentStroke.current);
        }
        currentStroke.current = null;
      },
    });

    // Expose methods through ref
    React.useImperativeHandle(ref, () => ({
      clear: () => {
        setPaths([]);
        setCurrentPath('');
        console.log('🗑️ Canvas cleared');
      },
      
      undo: () => {
        setPaths(prev => prev.slice(0, -1));
        console.log('↩️ Undo stroke');
      },
      
      getStrokes: () => {
        return paths.map(path => ({
          id: path.id,
          points: parseSvgPath(path.d),
          color: path.color,
          strokeWidth: path.strokeWidth,
        }));
      },
      
      setColor: (color: string) => {
        currentColor.current = color;
        console.log(`🎨 Color changed to: ${color}`);
      },
      
      setStrokeWidth: (width: number) => {
        currentStrokeWidth.current = width;
        console.log(`📏 Stroke width changed to: ${width}`);
      },
      
      // Validation helpers for lessons
      validateCircle: (threshold = 0.7) => {
        if (paths.length === 0) return false;
        const lastPath = paths[paths.length - 1];
        const points = parseSvgPath(lastPath.d);
        return calculateCircleAccuracy(points) >= threshold;
      },
      
      validateStraightLine: (threshold = 0.8) => {
        if (paths.length === 0) return false;
        const lastPath = paths[paths.length - 1];
        const points = parseSvgPath(lastPath.d);
        return calculateLineAccuracy(points) >= threshold;
      },
      
      validateLineCount: (targetCount: number, tolerance = 1) => {
        return Math.abs(paths.length - targetCount) <= tolerance;
      },
      
      validateShapeCount: (targetCount: number, shapeType: string) => {
        let shapeCount = 0;
        for (const path of paths) {
          const points = parseSvgPath(path.d);
          if (shapeType === 'circle' && calculateCircleAccuracy(points) > 0.6) {
            shapeCount++;
          } else if (shapeType === 'line' && calculateLineAccuracy(points) > 0.7) {
            shapeCount++;
          }
        }
        return shapeCount >= targetCount;
      },
      
      getPathCount: () => paths.length,
      
      getStats: () => ({
        pathCount: paths.length,
        isDrawing,
        totalPoints: paths.reduce((sum, path) => sum + parseSvgPath(path.d).length, 0),
      }),
    }), [paths, isDrawing]);

    return (
      <View 
        style={[styles.container, { width: canvasWidth, height: canvasHeight }]}
        {...panResponder.panHandlers}
      >
        <Svg width={canvasWidth} height={canvasHeight} style={styles.svg}>
          <G>
            {/* Render completed paths */}
            {paths.map((pathData) => (
              <Path
                key={pathData.id}
                d={pathData.d}
                stroke={pathData.color}
                strokeWidth={pathData.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            
            {/* Render current path being drawn */}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={currentColor.current}
                strokeWidth={currentStrokeWidth.current}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.9}
              />
            )}
          </G>
        </Svg>
      </View>
    );
  }
);

// =================== HELPER FUNCTIONS ===================

function parseSvgPath(pathData: string): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  const commands = pathData.split(/(?=[ML])/);
  
  commands.forEach(cmd => {
    const trimmed = cmd.trim();
    if (trimmed.startsWith('M') || trimmed.startsWith('L')) {
      const coords = trimmed.slice(1).split(',');
      if (coords.length === 2) {
        points.push({
          x: parseFloat(coords[0]),
          y: parseFloat(coords[1]),
        });
      }
    }
  });
  
  return points;
}

function calculateCircleAccuracy(points: Array<{ x: number; y: number }>): number {
  if (points.length < 10) return 0.3;
  
  // Calculate center point
  const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  
  // Calculate average radius
  const distances = points.map(p => 
    Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2))
  );
  const avgRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  
  if (avgRadius < 20) return 0.3; // Too small
  
  // Calculate variance in radius (lower = more circular)
  const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgRadius, 2), 0) / distances.length;
  const normalizedVariance = variance / (avgRadius * avgRadius);
  
  // Convert to accuracy score (0-1)
  return Math.max(0, Math.min(1, 1 - normalizedVariance * 3));
}

function calculateLineAccuracy(points: Array<{ x: number; y: number }>): number {
  if (points.length < 2) return 0;
  
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  
  // Calculate how straight the line is
  const idealDistance = Math.sqrt(
    Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
  );
  
  if (idealDistance < 30) return 0.3; // Too short
  
  // Calculate total path distance
  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistance += Math.sqrt(
      Math.pow(points[i].x - points[i-1].x, 2) + Math.pow(points[i].y - points[i-1].y, 2)
    );
  }
  
  // Straightness = ideal distance / actual distance
  const straightness = idealDistance / totalDistance;
  return Math.max(0, Math.min(1, straightness));
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  svg: {
    flex: 1,
  },
});

SimpleCanvas.displayName = 'SimpleCanvas';

export default SimpleCanvas;