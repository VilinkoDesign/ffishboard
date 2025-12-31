import { OperationController } from './OperationController';

export class InputController {
  private canvas: HTMLCanvasElement;
  private operationController: OperationController;
  private isDrawing: boolean = false;
  private currentStrokeId: string = '';

  constructor(canvas: HTMLCanvasElement, operationController: OperationController) {
    this.canvas = canvas;
    this.operationController = operationController;
    this.bindEvents();
  }

  private bindEvents(): void {
    // 鼠标事件
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mouseleave', this.handleMouseUp);

    // 触控事件
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
  }

  private getCoordinates(e: MouseEvent | Touch): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    
    // 计算Canvas的缩放比例：实际像素尺寸 / 显示尺寸
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    // 将客户端坐标转换为实际Canvas坐标
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  private handleMouseDown = (e: MouseEvent): void => {
    if (e.button !== 0) return; // 只处理左键
    this.startDrawing(e);
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isDrawing) return; // 只处理正在绘制的情况
    this.continueDrawing(e);
  };

  private handleMouseUp = (): void => {
    if (!this.isDrawing) return; // 只处理正在绘制的情况
    this.stopDrawing();
  };

  private handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.startDrawing(e.touches[0]);
    }
  };

  private handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    if (this.isDrawing && e.touches.length > 0) {
      this.continueDrawing(e.touches[0]);
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();
    if (this.isDrawing) {
      this.stopDrawing();
    }
  };

  private startDrawing(e: MouseEvent | Touch): void {
    this.isDrawing = true;
    const { x, y } = this.getCoordinates(e);
    // 所有工具（包括橡皮擦）都使用operationController处理
    this.currentStrokeId = this.operationController.startStroke(x, y);
  }

  private continueDrawing(e: MouseEvent | Touch): void {
    const { x, y } = this.getCoordinates(e);
    // 所有工具（包括橡皮擦）都使用operationController处理
    this.operationController.appendPoint(x, y, this.currentStrokeId);
  }

  private stopDrawing(): void {
    this.isDrawing = false;
    // 所有工具（包括橡皮擦）都使用operationController处理
    this.operationController.endStroke(this.currentStrokeId);
    this.currentStrokeId = '';
  }

  public destroy(): void {
    // 移除事件监听器
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
  }
}