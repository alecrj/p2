// src/engines/drawing/DrawingEngine.ts
// ENTERPRISE DRAWING ENGINE V1.1

import { Skia, SkPath, SkPaint, BlendMode } from '@shopify/react-native-skia';
import { Point, Stroke, DrawingState, BrushSettings } from './types';

export class DrawingEngine {
  private static instance: DrawingEngine;
  private state: DrawingState;
  private history: DrawingState[] = [];
  private historyIndex = -1;
  private strokeIdCounter = 0;

  private constructor() {
    this.state = {
      strokes: [],
      currentStroke: null,
      color: '#000000',
      brushSize: 4,
      opacity: 1,
      isDrawing: false,
    };
  }

  /**
   * Singleton accessor
   */
  static getInstance(): DrawingEngine {
    if (!DrawingEngine.instance) {
      DrawingEngine.instance = new DrawingEngine();
    }
    return DrawingEngine.instance;
  }

  /**
   * Async initialization hook
   */
  public async initialize(): Promise<boolean> {
    // Place any async setup or resource loading here
    console.log('🚀 DrawingEngine initialized');
    return true;
  }

  // === Drawing Operations ===
  
  /** Begin a new stroke */
  startStroke(point: Point, settings: BrushSettings): void {
    const stroke: Stroke = {
      id: `stroke_${++this.strokeIdCounter}`,
      points: [point],
      color: settings.color,
      size: settings.size,
      opacity: settings.opacity,
      blendMode: 'normal',
    };

    this.state.currentStroke = stroke;
    this.state.isDrawing = true;
  }

  /** Add a point to current stroke */
  addPoint(point: Point): void {
    if (!this.state.currentStroke || !this.state.isDrawing) return;
    const smoothedPoint = this.smoothPoint(point, this.state.currentStroke.points);
    this.state.currentStroke.points.push(smoothedPoint);
  }

  /** Complete the current stroke */
  endStroke(): Stroke | null {
    if (!this.state.currentStroke) return null;

    const completedStroke = this.state.currentStroke;
    completedStroke.path = this.createPath(completedStroke.points);
    completedStroke.paint = this.createPaint(completedStroke);

    this.state.strokes.push(completedStroke);
    this.saveToHistory();

    this.state.currentStroke = null;
    this.state.isDrawing = false;

    return completedStroke;
  }

  // === History Management ===
  undo(): boolean {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = this.deepClone(this.history[this.historyIndex]);
      return true;
    }
    return false;
  }

  redo(): boolean {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = this.deepClone(this.history[this.historyIndex]);
      return true;
    }
    return false;
  }

  // === Path Creation ===
  private createPath(points: Point[]): SkPath {
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
  }

  private createPaint(stroke: Stroke): SkPaint {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(stroke.color));
    paint.setAlphaf(stroke.opacity);
    paint.setStyle(1);
    paint.setStrokeWidth(stroke.size);
    paint.setStrokeCap(1);
    paint.setStrokeJoin(1);
    paint.setAntiAlias(true);
    const blendModes: Record<string, BlendMode> = {
      'normal': BlendMode.SrcOver,
      'multiply': BlendMode.Multiply,
      'screen': BlendMode.Screen,
    };
    paint.setBlendMode(blendModes[stroke.blendMode] || BlendMode.SrcOver);
    return paint;
  }

  // === Utilities ===
  private smoothPoint(point: Point, previous: Point[]): Point {
    if (!previous.length) return point;
    const last = previous[previous.length - 1];
    const f = 0.3;
    return { x: last.x + (point.x - last.x) * f, y: last.y + (point.y - last.y) * f, pressure: point.pressure, timestamp: point.timestamp };
  }

  private saveToHistory(): void {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(this.deepClone(this.state));
    this.historyIndex++;
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  // === Public Getters ===
  getState(): DrawingState {
    return this.state;
  }

  getCurrentStroke(): Stroke | null {
    return this.state.currentStroke;
  }

  getAllStrokes(): Stroke[] {
    return this.state.strokes;
  }

  /** Clear all strokes */
  clear(): void {
    this.state.strokes = [];
    this.state.currentStroke = null;
    this.saveToHistory();
  }
}
