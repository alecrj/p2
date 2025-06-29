// src/engines/drawing/index.ts
export * from './types';
export { DrawingEngine } from './DrawingEngine';
export { DrawingCanvas } from './DrawingCanvas';
export { BrushSystem } from './BrushSystem';

// Legacy compatibility exports
import { DrawingEngine } from './DrawingEngine';
import { BrushSystem } from './BrushSystem';

export const drawingEngine = DrawingEngine.getInstance();
export const brushEngine = BrushSystem.getInstance();