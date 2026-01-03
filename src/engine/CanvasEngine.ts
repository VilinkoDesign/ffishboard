import * as THREE from 'three';
import { PathRenderer } from './renderer/PathRenderer';
import { StrokePoint, CanvasEngineOptions, BrushOptions } from './types';

export class CanvasEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private frameId: number | null = null;
  
  // --- 场景架构 ---
  // 1. 墨水层：只包含笔画，背景全透明
  private inkScene: THREE.Scene;
  private inkRenderTarget: THREE.WebGLRenderTarget;
  
  // 2. 显示层：包含背景图 + 墨水层的纹理平面
  private displayScene: THREE.Scene;
  private displayCamera: THREE.OrthographicCamera; // 显示层用正交相机最方便
  private displayPlane: THREE.Mesh | null = null;

  // 通用相机（用于计算笔画坐标）
  private camera: THREE.PerspectiveCamera;
  
  // 状态管理
  private isDrawing = false;
  private currentStrokeData: StrokePoint[] = [];
  private currentPathRenderer: PathRenderer | null = null;
  private globalZOrder = 0;

  constructor(container: HTMLElement, options?: CanvasEngineOptions) {
    this.container = container;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- 初始化渲染器 ---
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, // 注意：FBO的抗锯齿需要额外配置，这里仅对主屏幕有效
      alpha: true,
      preserveDrawingBuffer: true 
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = false; // 关键：我们要手动控制渲染顺序
    container.appendChild(this.renderer.domElement);

    // --- 1. 初始化墨水层 ---
    this.inkScene = new THREE.Scene();
    this.inkScene.background = null; // 必须透明，否则没法擦除透明度

    // 创建 FBO (离屏缓冲区)
    this.inkRenderTarget = new THREE.WebGLRenderTarget(width * window.devicePixelRatio, height * window.devicePixelRatio, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      stencilBuffer: false, // 不需要
      depthBuffer: false // 2D 绘图可以关掉深度缓冲以避免 Z-fighting，或者开启并合理管理
    });

    // 主相机 (用于绘图计算)
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 10;

    // --- 2. 初始化显示层 ---
    this.displayScene = new THREE.Scene();
    this.displayScene.background = new THREE.Color(options?.backgroundColor || 0xf5f5f5);
    
    // 如果有背景图，这里加载
    if (options?.backgroundImage) {
        new THREE.TextureLoader().load(options.backgroundImage, (texture) => {
            this.displayScene.background = texture;
        });
    }

    // 显示层使用正交相机，确保纹理铺满屏幕
    this.displayCamera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0, 10);
    this.displayCamera.position.z = 1;

    // 创建一个平面，贴上墨水层的纹理
    const planeGeometry = new THREE.PlaneGeometry(width, height);
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: this.inkRenderTarget.texture, // 绑定 FBO 纹理
      transparent: true,
      side: THREE.DoubleSide
    });
    this.displayPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.displayScene.add(this.displayPlane);

    // --- 3. 启动 ---
    this.animate();
  }

  // 坐标转换 (保持不变，依然基于 PerspectiveCamera)
  private getMouseInWorld(clientX: number, clientY: number): THREE.Vector3 {
    const rect = this.container.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    const x = (localX / rect.width) * 2 - 1;
    const y = -(localY / rect.height) * 2 + 1;

    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(this.camera);
    
    const dir = vector.sub(this.camera.position).normalize();
    const distance = -this.camera.position.z / dir.z;
    const pos = this.camera.position.clone().add(dir.multiplyScalar(distance));
    
    pos.z = this.globalZOrder;
    return pos;
  }

  public startDrawing(clientX: number, clientY: number, pressure: number, options: BrushOptions): void {
    this.isDrawing = true;
    this.globalZOrder += 0.0001; // 微小的 Z 增量
    
    const pos = this.getMouseInWorld(clientX, clientY);
    const press = pressure > 0 ? pressure : 0.5;
    this.currentStrokeData = [{ position: pos, pressure: press }];
    
    const isEraser = !!options.isEraser;
    
    // 橡皮擦不需要变色，它在 FBO 里就是“透明算子”
    const color = isEraser ? '#ffffff' : options.color;
    // 橡皮擦稍微大一点体验更好
    const width = isEraser ? options.width * 1.5 : options.width;

    this.currentPathRenderer = new PathRenderer(color, width, isEraser);
    
    // 关键：将笔触添加到墨水层 (inkScene)，而不是显示层
    this.inkScene.add(this.currentPathRenderer.getMesh());
  }

  public moveDrawing(clientX: number, clientY: number, pressure: number): number {
    if (!this.isDrawing || !this.currentPathRenderer) return 0;

    const newPos = this.getMouseInWorld(clientX, clientY);
    const lastPress = this.currentStrokeData.length > 0 
      ? this.currentStrokeData[this.currentStrokeData.length - 1].pressure 
      : 0.5;
    const newPress = pressure > 0 ? pressure : lastPress;

    if (this.currentStrokeData.length > 0) {
      if (newPos.distanceTo(this.currentStrokeData[this.currentStrokeData.length - 1].position) < 0.01) return newPress;
    }

    this.currentStrokeData.push({ position: newPos, pressure: newPress });
    this.currentPathRenderer.updateGeometry(this.currentStrokeData);

    return newPress;
  }

  public stopDrawing(): void {
    this.isDrawing = false;
    this.currentPathRenderer = null;
    this.currentStrokeData = [];
  }

  public resize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    // 更新透视相机
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // 更新正交相机
    this.displayCamera.left = -width / 2;
    this.displayCamera.right = width / 2;
    this.displayCamera.top = height / 2;
    this.displayCamera.bottom = -height / 2;
    this.displayCamera.updateProjectionMatrix();
    
    // 更新渲染器和 FBO
    this.renderer.setSize(width, height);
    this.inkRenderTarget.setSize(width * window.devicePixelRatio, height * window.devicePixelRatio);
    
    // 更新显示平面
    if (this.displayPlane) {
        this.displayPlane.geometry.dispose();
        this.displayPlane.geometry = new THREE.PlaneGeometry(width, height);
    }
  }

  private animate = () => {
    this.frameId = requestAnimationFrame(this.animate);

    // --- 第1步：渲染墨水层到 FBO ---
    this.renderer.setRenderTarget(this.inkRenderTarget);
    // 注意：这里不能每帧 clear，否则笔迹就没了。
    // 但是 Three.js 的 render 默认会 clear。
    // 我们的架构是：所有笔划 Mesh 都在 inkScene 里，每一帧都全部重绘一遍。
    // 这对于几千个笔划没问题，上万后需要优化（但这是最稳健的擦除实现）。
    this.renderer.clear(); 
    this.renderer.render(this.inkScene, this.camera);

    // --- 第2步：渲染最终场景到屏幕 ---
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.displayScene, this.displayCamera);
  };

  public destroy(): void {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.renderer.dispose();
    this.inkRenderTarget.dispose();
    this.inkScene.clear();
    this.displayScene.clear();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}