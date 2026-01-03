<template>
  <div ref="canvasContainer" class="three-canvas-container" 
       @pointerdown="onPointerDown" 
       @pointermove="onPointerMove" 
       @pointerup="onPointerUp"
       @pointerleave="onPointerUp">
    <div class="status-overlay">
      <span>工具: {{ toolDisplay }}</span>
      <span>粗细: {{ boardStore.currentBrushWidth }}px</span>
      <span>颜色: <span :style="{ color: boardStore.currentColor }">●</span></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useBoardStore } from '../store/board'; // 确保路径正确
import { CanvasEngine } from '../engine/CanvasEngine';

const boardStore = useBoardStore();
const canvasContainer = ref<HTMLDivElement | null>(null);

const toolDisplay = computed(() => {
  switch (boardStore.currentTool) {
    case 'brush': return '画笔';
    case 'eraser': return '橡皮擦';
    default: return '其他';
  }
});

let engine: CanvasEngine | null = null;

const onPointerDown = (e: PointerEvent) => {
  if (!['brush', 'eraser'].includes(boardStore.currentTool) || !engine) return;
  
  (e.target as HTMLElement).setPointerCapture(e.pointerId);
  
  // --- 关键修复：单位转换 ---
  // Store 中的数值 (1-50) 映射到 Three.js 世界坐标系
  // 0.01 是基于 Camera Z=10 的经验系数，确保 1px 对应合理的屏幕宽度
  const worldWidth = boardStore.currentBrushWidth * 0.01;

  engine.startDrawing(e.clientX, e.clientY, e.pressure, {
    color: boardStore.currentColor,
    width: worldWidth,
    isEraser: boardStore.currentTool === 'eraser'
  });
};

const onPointerMove = (e: PointerEvent) => {
  if (!engine) return;
  engine.moveDrawing(e.clientX, e.clientY, e.pressure);
};

const onPointerUp = (e: PointerEvent) => {
  if (!engine) return;
  engine.stopDrawing();
  (e.target as HTMLElement).releasePointerCapture(e.pointerId);
};

const onWindowResize = () => {
  engine?.resize();
};

onMounted(() => {
  if (canvasContainer.value) {
    engine = new CanvasEngine(canvasContainer.value, { 
      backgroundColor: '#ffffff'
    });
    window.addEventListener('resize', onWindowResize);
  }
});

onUnmounted(() => {
  engine?.destroy();
  window.removeEventListener('resize', onWindowResize);
});
</script>

<style scoped>
.three-canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  touch-action: none; 
  cursor: crosshair;
  background-color: #f5f5f5;
  overflow: hidden;
}

.status-overlay {
  position: absolute;
  top: 15px;
  left: 115px; 
  pointer-events: none;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 15px;
  border-radius: 8px;
  font-family: sans-serif;
  font-size: 13px;
  color: #fff;
  display: flex;
  gap: 20px;
  backdrop-filter: blur(5px);
  z-index: 10;
}
</style>