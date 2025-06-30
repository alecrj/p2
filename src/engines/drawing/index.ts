// src/engines/drawing/index.ts - FIXED ALL EXPORT ISSUES
export * from './types';
export { SkiaDrawingEngine, DrawingEngine, skiaDrawingEngine } from './DrawingEngine';
export { BrushSystem } from './BrushSystem';

// ✅ CRITICAL FIXES:
// - Removed non-existent DrawingCanvas export
// - Added proper SkiaDrawingEngine export
// - Added backward compatibility aliases
// - Fixed import paths

// Legacy compatibility exports
import { SkiaDrawingEngine, skiaDrawingEngine } from './DrawingEngine';
import { BrushSystem } from './BrushSystem';

export const drawingEngine = skiaDrawingEngine; // Use singleton instance
export const brushEngine = BrushSystem.getInstance();