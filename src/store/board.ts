import { defineStore } from 'pinia';
import { Operation } from '../models/operation';
import { Stroke } from '../models/stroke';

export const useBoardStore = defineStore('board', {
  state: () => ({
    // 房间信息
    roomId: '',
    boardId: '',
    users: [] as Array<{ userId: string; username: string; color: string }>,
    
    // 工具设置
    currentTool: 'brush' as 'brush' | 'eraser',
    
    // 画笔设置
    currentColor: '#000000',
    currentBrushWidth: 5,
    
    // 操作队列（用于回放和渲染）
    operations: [] as Operation[],
    
    // 当前绘制的笔触（用于本地实时渲染）
    activeStrokes: new Map<string, Stroke>(),
    
    // 已完成的笔触
    completedStrokes: new Map<string, Stroke>(),
    
    // Canvas尺寸
    canvasWidth: 0,
    canvasHeight: 0
  }),
  
  getters: {
    allStrokes: (state) => {
      // 确保返回所有笔触，包括活跃的和已完成的
      const active = Array.from(state.activeStrokes.values());
      const completed = Array.from(state.completedStrokes.values());
      return [...active, ...completed];
    }
  },
  
  actions: {
    setRoomInfo(roomId: string, boardId: string) {
      this.roomId = roomId;
      this.boardId = boardId;
    },
    
    setCanvasSize(width: number, height: number) {
      this.canvasWidth = width;
      this.canvasHeight = height;
    },
    
    setCurrentColor(color: string) {
      this.currentColor = color;
    },
    
    setCurrentBrushWidth(width: number) {
      this.currentBrushWidth = width;
    },
    
    setCurrentTool(tool: 'brush' | 'eraser') {
      this.currentTool = tool;
    },
    
    addOperation(operation: Operation) {
      this.operations.push(operation);
      this.applyOperation(operation);
    },
    
    applyOperation(operation: Operation) {
      const { type, data, userId, tool } = operation;
      
      switch (type) {
        case 'StartStroke': {
          const stroke: Stroke = {
            id: data.strokeId,
            userId,
            points: [{ x: data.x, y: data.y }],
            style: data.style,
            tool,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          // 创建新的Map对象，确保Vue能检测到变化
          this.activeStrokes = new Map(this.activeStrokes);
          this.activeStrokes.set(data.strokeId, stroke);
          break;
        }
        
        case 'AppendPoint': {
          const stroke = this.activeStrokes.get(data.strokeId);
          if (stroke) {
            // 克隆points数组，确保Vue能检测到变化
            stroke.points = [...stroke.points, { x: data.x, y: data.y }];
            stroke.updatedAt = Date.now();
            // 更新Map确保变化被检测到
            this.activeStrokes = new Map(this.activeStrokes);
          }
          break;
        }
        
        case 'EndStroke': {
          const stroke = this.activeStrokes.get(data.strokeId);
          if (stroke) {
            // 创建新的Map对象，确保Vue能检测到变化
            this.activeStrokes = new Map(this.activeStrokes);
            this.completedStrokes = new Map(this.completedStrokes);
            
            this.activeStrokes.delete(data.strokeId);
            this.completedStrokes.set(data.strokeId, stroke);
          }
          break;
        }
      }
    },
    
    addUser(user: { userId: string; username: string; color: string }) {
      this.users.push(user);
    },
    
    removeUser(userId: string) {
      this.users = this.users.filter(user => user.userId !== userId);
    },
    
    // 清除当前用户的所有笔触
    clearUserStrokes(userId: string) {
      // 清除活跃笔触
      for (const [strokeId, stroke] of this.activeStrokes) {
        if (stroke.userId === userId) {
          this.activeStrokes.delete(strokeId);
        }
      }
      
      // 清除已完成笔触
      for (const [strokeId, stroke] of this.completedStrokes) {
        if (stroke.userId === userId) {
          this.completedStrokes.delete(strokeId);
        }
      }
      
      // 可以选择清除相关操作记录，这里暂时不处理
      // this.operations = this.operations.filter(op => op.userId !== userId);
    }
  }
});