import * as THREE from 'three';

export interface StrokePoint {
  position: THREE.Vector3;
  pressure: number;
}

export interface BrushOptions {
  color: string;
  width: number;
  isEraser?: boolean;
}

export interface CanvasEngineOptions {
  backgroundColor?: number | string;
  backgroundImage?: string; // 新增：支持背景图，验证橡皮擦不会擦除背景
}