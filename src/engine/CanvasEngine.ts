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
    
    // 遍历所有笔触
    for (const stroke of this.strokes) {
      // 确保笔触存在且有至少一个点
      if (!stroke || !stroke.points || stroke.points.length === 0) continue;
      
      // 设置画笔样式
      this.ctx.lineWidth = stroke.style.width;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = stroke.style.color;
      this.ctx.fillStyle = stroke.style.color;
      
      // 保存当前上下文状态
      this.ctx.save();
      
      // 设置复合模式
      if (stroke.tool === 'eraser') {
        // 橡皮擦：使用destination-out复合模式，直接擦除画布内容
        this.ctx.globalCompositeOperation = 'destination-out';
      } else {
        // 画笔：使用source-over复合模式，正常绘制
        this.ctx.globalCompositeOperation = 'source-over';
      }
      
      // 绘制路径
      if (stroke.points.length === 1) {
        // 单点绘制
        const { x, y } = stroke.points[0];
        const radius = stroke.style.width / 2;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // 多点绘制
        this.ctx.beginPath();
        this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        
        for (let i = 1; i < stroke.points.length; i++) {
          this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        
        this.ctx.stroke();
      }
      
      // 恢复上下文状态
      this.ctx.restore();
    }
  }

  public updateStrokes(strokes: Stroke[]): void {
    this.strokes = strokes;
    // 所有操作都立即渲染，确保实时反馈
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