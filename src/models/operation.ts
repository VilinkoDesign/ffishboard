export interface Operation {
  id: string;
  type: 'StartStroke' | 'AppendPoint' | 'EndStroke';
  userId: string;
  timestamp: number;
  data: any;
  tool: 'brush' | 'eraser';
}

export class StartStroke implements Operation {
  id: string;
  type: 'StartStroke' = 'StartStroke';
  userId: string;
  timestamp: number;
  tool: 'brush' | 'eraser';
  data: {
    x: number;
    y: number;
    style: {
      color: string;
      width: number;
    };
    strokeId: string;
  };

  constructor(userId: string, x: number, y: number, style: { color: string; width: number }, strokeId: string, tool: 'brush' | 'eraser') {
    this.id = crypto.randomUUID();
    this.userId = userId;
    this.timestamp = Date.now();
    this.tool = tool;
    this.data = {
      x,
      y,
      style,
      strokeId
    };
  }
}

export class AppendPoint implements Operation {
  id: string;
  type: 'AppendPoint' = 'AppendPoint';
  userId: string;
  timestamp: number;
  tool: 'brush' | 'eraser';
  data: {
    x: number;
    y: number;
    strokeId: string;
  };

  constructor(userId: string, x: number, y: number, strokeId: string, tool: 'brush' | 'eraser') {
    this.id = crypto.randomUUID();
    this.userId = userId;
    this.timestamp = Date.now();
    this.tool = tool;
    this.data = {
      x,
      y,
      strokeId
    };
  }
}

export class EndStroke implements Operation {
  id: string;
  type: 'EndStroke' = 'EndStroke';
  userId: string;
  timestamp: number;
  tool: 'brush' | 'eraser';
  data: {
    strokeId: string;
  };

  constructor(userId: string, strokeId: string, tool: 'brush' | 'eraser') {
    this.id = crypto.randomUUID();
    this.userId = userId;
    this.timestamp = Date.now();
    this.tool = tool;
    this.data = {
      strokeId
    };
  }
}