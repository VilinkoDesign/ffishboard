import { Renderer } from '../types';
import { Stroke } from '../../models/stroke';

export class PathRenderer implements Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(stroke: Stroke): void {
    if (!stroke) return;

    // 即使只有一个点，也绘制一个圆形，提供即时反馈
    if (stroke.points.length < 2) {
      this.ctx.save();
      
      if (stroke.tool === 'eraser') {
        this.ctx.globalCompositeOperation = 'destination-out';
      } else {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = stroke.style.color;
      }
      
      const { x, y } = stroke.points[0];
      const radius = stroke.style.width / 2;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.restore();
      return;
    }

    this.ctx.save();
    
    // 直接设置复合模式，避免不必要的重置
    if (stroke.tool === 'eraser') {
      // 橡皮工具：使用destination-out模式擦除内容
      this.ctx.globalCompositeOperation = 'destination-out';
    } else {
      // 画笔工具：正常绘制
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = stroke.style.color;
    }
    
    this.ctx.lineWidth = stroke.style.width;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // 开始绘制路径
    this.ctx.beginPath();
    this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    // 绘制所有点
    for (let i = 1; i < stroke.points.length; i++) {
      this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    
    // 描边
    this.ctx.stroke();
    
    // 恢复默认设置
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.restore();
  }
}