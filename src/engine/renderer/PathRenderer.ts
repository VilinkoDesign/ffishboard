import * as THREE from 'three';
import { StrokePoint } from '../types';

export class PathRenderer {
  private mesh: THREE.Mesh;
  private geometry: THREE.BufferGeometry;
  private material: THREE.MeshBasicMaterial;
  private baseWidth: number;

  constructor(color: string, width: number, isEraser: boolean = false) {
    this.baseWidth = width;

    this.geometry = new THREE.BufferGeometry();
    
    // --- 核心：着色器混合模式设置 ---
    if (isEraser) {
      // 橡皮擦模式：混合模式设为“减去 Alpha”
      this.material = new THREE.MeshBasicMaterial({
        color: 0xffffff, // 颜色不重要，重要的是 Alpha
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1.0, // 橡皮擦力度
        blending: THREE.CustomBlending,
        // 混合方程：目标像素 = 源像素(橡皮擦) [操作] 目标像素(画布)
        blendEquation: THREE.AddEquation,
        // 源因子：Zero -> 不把橡皮擦的白色画上去
        blendSrc: THREE.ZeroFactor,
        // 目标因子：OneMinusSrcAlpha -> 目标像素保留比例 = 1 - 橡皮擦Alpha
        // 也就是：橡皮擦越不透明，目标像素被扣除得越多
        blendDst: THREE.OneMinusSrcAlphaFactor,
        // 这里的设置确保 Alpha 通道也被正确“擦除”
        blendEquationAlpha: THREE.AddEquation,
        blendSrcAlpha: THREE.ZeroFactor,
        blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
        
        depthWrite: false,
        depthTest: false // 橡皮擦不需要深度测试，它直接作用于缓冲区
      });
    } else {
      // 普通画笔模式
      this.material = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(color), 
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        depthTest: true
      });
    }

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false; 
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public updateGeometry(points: StrokePoint[]): void {
    if (points.length < 2) return;

    const currentBaseWidth = this.baseWidth; 
    const sideVertices: { left: THREE.Vector3, right: THREE.Vector3 }[] = [];

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      let direction = new THREE.Vector3();

      if (i === 0) {
        direction.subVectors(points[i + 1].position, p.position).normalize();
      } else if (i === points.length - 1) {
        direction.subVectors(p.position, points[i - 1].position).normalize();
      } else {
        const dirPrev = new THREE.Vector3().subVectors(p.position, points[i - 1].position).normalize();
        const dirNext = new THREE.Vector3().subVectors(points[i + 1].position, p.position).normalize();
        direction.addVectors(dirPrev, dirNext).normalize();
      }

      const normal = new THREE.Vector3(-direction.y, direction.x, 0).normalize();
      const halfWidth = (currentBaseWidth * p.pressure) / 2;

      sideVertices.push({
        left: p.position.clone().add(normal.clone().multiplyScalar(halfWidth)),
        right: p.position.clone().sub(normal.clone().multiplyScalar(halfWidth))
      });
    }

    const triangleVertices: number[] = [];
    for (let i = 0; i < sideVertices.length - 1; i++) {
      const curr = sideVertices[i];
      const next = sideVertices[i + 1];

      triangleVertices.push(curr.left.x, curr.left.y, curr.left.z);
      triangleVertices.push(curr.right.x, curr.right.y, curr.right.z);
      triangleVertices.push(next.left.x, next.left.y, next.left.z);

      triangleVertices.push(curr.right.x, curr.right.y, curr.right.z);
      triangleVertices.push(next.right.x, next.right.y, next.right.z);
      triangleVertices.push(next.left.x, next.left.y, next.left.z);
    }

    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(triangleVertices, 3));
    this.geometry.attributes.position.needsUpdate = true;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}