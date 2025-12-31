import { ApiResponse, RoomInfo, HistoryOperationsResponse } from './types';

class HttpService {
  private baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<T> = await response.json();

      if (data.code !== 0) {
        throw new Error(data.message);
      }

      return data.data;
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }

  // 创建或加入房间
  public async createOrJoinRoom(roomId?: string): Promise<RoomInfo> {
    return this.request<RoomInfo>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ roomId })
    });
  }

  // 获取房间信息
  public async getRoomInfo(roomId: string): Promise<RoomInfo> {
    return this.request<RoomInfo>(`/rooms/${roomId}`);
  }

  // 获取历史操作
  public async getHistoryOperations(boardId: string, offset: number = 0, limit: number = 100): Promise<HistoryOperationsResponse> {
    return this.request<HistoryOperationsResponse>(`/boards/${boardId}/operations?offset=${offset}&limit=${limit}`);
  }
}

// 导出单例实例
export const httpService = new HttpService();