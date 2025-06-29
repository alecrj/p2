// src/engines/drawing/BrushSystem.ts
import { DrawingTool, BrushSettings } from './types';

interface BrushPreset {
  id: string;
  name: string;
  tool: DrawingTool;
  size: number;
  opacity: number;
  pressureSensitivity: number;
  smoothing: number;
}

export class BrushSystem {
  private static instance: BrushSystem;
  private currentBrush: BrushPreset;
  private brushes: Map<string, BrushPreset>;

  private constructor() {
    this.brushes = new Map();
    this.initializeDefaultBrushes();
    this.currentBrush = this.brushes.get('pencil')!;
  }

  static getInstance(): BrushSystem {
    if (!BrushSystem.instance) {
      BrushSystem.instance = new BrushSystem();
    }
    return BrushSystem.instance;
  }

  private initializeDefaultBrushes(): void {
    const defaultBrushes: BrushPreset[] = [
      {
        id: 'pencil',
        name: 'Pencil',
        tool: 'pencil',
        size: 2,
        opacity: 0.9,
        pressureSensitivity: 0.9,
        smoothing: 0.3,
      },
      {
        id: 'pen',
        name: 'Technical Pen',
        tool: 'pen',
        size: 3,
        opacity: 1,
        pressureSensitivity: 0.3,
        smoothing: 0.5,
      },
      {
        id: 'brush',
        name: 'Paint Brush',
        tool: 'brush',
        size: 8,
        opacity: 0.8,
        pressureSensitivity: 0.8,
        smoothing: 0.7,
      },
      {
        id: 'eraser',
        name: 'Eraser',
        tool: 'eraser',
        size: 15,
        opacity: 1,
        pressureSensitivity: 0.5,
        smoothing: 0.4,
      },
    ];

    defaultBrushes.forEach(brush => {
      this.brushes.set(brush.id, brush);
    });
  }

  getCurrentBrush(): BrushPreset {
    return this.currentBrush;
  }

  selectBrush(brushId: string): void {
    const brush = this.brushes.get(brushId);
    if (brush) {
      this.currentBrush = brush;
    }
  }

  getAllBrushes(): BrushPreset[] {
    return Array.from(this.brushes.values());
  }

  updateBrushSettings(settings: Partial<BrushSettings>): BrushSettings {
    const current = this.currentBrush;
    return {
      tool: current.tool,
      size: settings.size ?? current.size,
      opacity: settings.opacity ?? current.opacity,
      color: settings.color ?? '#000000',
      pressureSensitivity: settings.pressureSensitivity ?? current.pressureSensitivity,
      smoothing: settings.smoothing ?? current.smoothing,
    };
  }
}