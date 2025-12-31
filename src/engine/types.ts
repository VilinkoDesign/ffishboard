
export interface Renderer {
  render(data: any): void;
}

export interface CanvasEngineOptions {
  width: number;
  height: number;
}