import { Renderer } from './types';
import { PathRenderer } from './renderer/PathRenderer';
import { Stroke } from '../models/stroke';

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderers: Map<string, Renderer> = new Map();
  private animationFrameId: number | null = null;
  private strokes: Stroke[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // 初始化渲染器
    this.renderers.set('path', new PathRenderer(this.ctx));
    
    // 启动渲染循环
    this.startRenderLoop();
  }

  private startRenderLoop(): void {
    const render = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  private render(): void {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 渲染所有笔触
    for (const stroke of this.strokes) {
      const renderer = this.renderers.get('path');
      if (renderer) {
        renderer.render(stroke);
      }
    }
  }

  public updateStrokes(strokes: Stroke[]): void {
    this.strokes = strokes;
    // 对于橡皮工具或需要立即反馈的操作，立即渲染
    this.render();
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}