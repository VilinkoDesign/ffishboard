import { useBoardStore } from '../store/board';
import { useUserStore } from '../store/user';
import { websocketService } from '../api/websocket';
import { StartStroke, AppendPoint, EndStroke, Operation } from '../models/operation';

export class OperationController {
  private boardStore = useBoardStore();
  private userStore = useUserStore();

  public startStroke(x: number, y: number): string {
    const strokeId = crypto.randomUUID();
    const operation = new StartStroke(
      this.userStore.userId,
      x,
      y,
      {
        color: this.boardStore.currentColor,
        width: this.boardStore.currentBrushWidth
      },
      strokeId,
      this.boardStore.currentTool
    );

    this.processOperation(operation);
    return strokeId;
  }

  public appendPoint(x: number, y: number, strokeId: string): void {
    const operation = new AppendPoint(
      this.userStore.userId,
      x,
      y,
      strokeId,
      this.boardStore.currentTool
    );

    this.processOperation(operation);
  }

  public endStroke(strokeId: string): void {
    const operation = new EndStroke(
      this.userStore.userId,
      strokeId,
      this.boardStore.currentTool
    );

    this.processOperation(operation);
  }

  public processOperation(operation: Operation): void {
    // 本地处理
    this.boardStore.addOperation(operation);
    
    // 发送到WebSocket
    websocketService.sendOperation(operation);
  }

  public processRemoteOperation(operation: Operation): void {
    // 仅添加到操作队列，不重新发送
    this.boardStore.addOperation(operation);
  }
}