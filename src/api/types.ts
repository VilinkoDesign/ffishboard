import { Operation } from '../models/operation';

// WebSocket消息类型
export enum WebSocketMessageType {
  // 客户端发送
  JOIN_ROOM = 'join_room',
  OPERATION = 'operation',
  PING = 'ping',
  
  // 服务端发送
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  REMOTE_OPERATION = 'remote_operation',
  PONG = 'pong'
}

// WebSocket消息结构
export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
}

// 加入房间请求数据
export interface JoinRoomRequest {
  roomId: string;
  userId: string;
  username: string;
}

// 用户信息
export interface UserInfo {
  userId: string;
  username: string;
  color: string;
}

// HTTP API响应结构
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 房间信息
export interface RoomInfo {
  roomId: string;
  name: string;
  users: UserInfo[];
}

// 历史操作响应
export interface HistoryOperationsResponse {
  operations: Operation[];
  total: number;
}