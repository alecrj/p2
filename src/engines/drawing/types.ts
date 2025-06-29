// src/engines/drawing/types.ts
import { SkPath, SkPaint } from '@shopify/react-native-skia';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'screen';
  path?: SkPath;
  paint?: SkPaint;
}

export interface DrawingState {
  strokes: Stroke[];
  currentStroke: Stroke | null;
  color: string;
  brushSize: number;
  opacity: number;
  isDrawing: boolean;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface ApplePencilData {
  pressure: number;
  altitude: number;
  azimuth: number;
  tiltX: number;
  tiltY: number;
}

export type DrawingTool = 'pen' | 'pencil' | 'brush' | 'eraser';

export interface BrushSettings {
  tool: DrawingTool;
  size: number;
  opacity: number;
  color: string;
  pressureSensitivity: number;
  smoothing: number;
}