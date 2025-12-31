import { Renderer } from '../types';
import { Stroke } from '../../models/stroke';

export class PathRenderer implements Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(stroke: Stroke): void {
    if (!stroke) return;

    this.ctx.save();
    
    // 只设置画笔样式，不设置复合模式
    // 复合模式由CanvasEngine的render方法设置
    this.ctx.lineWidth = stroke.style.width;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // 设置颜色
    this.ctx.strokeStyle = stroke.tool === 'eraser' ? '#000000' : stroke.style.color;
    this.ctx.fillStyle = stroke.tool === 'eraser' ? '#000000' : stroke.style.color;
    
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
    
    // 恢复默认设置
    this.ctx.restore();
  }
}