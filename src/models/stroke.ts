export interface Stroke {
  id: string;
  userId: string;
  points: Array<{ x: number; y: number }>;
  style: {
    color: string;
    width: number;
  };
  tool: 'brush' | 'eraser';
  createdAt: number;
  updatedAt: number;
}