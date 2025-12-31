import { WebSocketMessageType, WebSocketMessage, JoinRoomRequest } from './types';
import { Operation } from '../models/operation';

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private heartbeatInterval: number | null = null;
  private heartbeatDelay: number = 30000;
  private eventHandlers: Map<WebSocketMessageType, Array<(data: any) => void>> = new Map();
  private isConnected: boolean = false;

  constructor() {
    this.initEventHandlers();
  }

  private initEventHandlers(): void {
    // 初始化事件处理器映射
    Object.values(WebSocketMessageType).forEach(type => {
      this.eventHandlers.set(type, []);
    });
  }

  public connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Set a timeout for the connection attempt
      const connectionTimeout = setTimeout(() => {
        console.warn('WebSocket connection timed out, proceeding with fallback');
        resolve(false); // Resolve with false instead of rejecting
      }, 3000);

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = () => {
          clearTimeout(connectionTimeout);
          console.log('WebSocket disconnected');
          this.isConnected = false;
          this.stopHeartbeat();
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        clearTimeout(connectionTimeout);
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      const handlers = this.eventHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => handler(message.data));
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnect failed:', error);
      });
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)); // 指数退避
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.sendPing();
    }, this.heartbeatDelay);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private sendPing(): void {
    this.send({
      type: WebSocketMessageType.PING,
      data: { timestamp: Date.now() }
    });
  }

  public send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected, cannot send message');
    }
  }

  public joinRoom(request: JoinRoomRequest): void {
    this.send({
      type: WebSocketMessageType.JOIN_ROOM,
      data: request
    });
  }

  public sendOperation(operation: Operation): void {
    try {
      this.send({
        type: WebSocketMessageType.OPERATION,
        data: operation
      });
    } catch (error) {
      console.error('WebSocketService: sendOperation failed:', error);
      // 发送失败时不阻止本地绘制
    }
  }

  public on(type: WebSocketMessageType, handler: (data: any) => void): void {
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.push(handler);
    }
  }

  public off(type: WebSocketMessageType, handler: (data: any) => void): void {
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  public disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// 导出单例实例
export const websocketService = new WebSocketService();