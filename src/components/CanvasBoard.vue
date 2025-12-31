<template>
  <div class="canvas-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useBoardStore } from '../store/board';
import { CanvasEngine } from '../engine/CanvasEngine';
import { OperationController } from '../controllers/OperationController';
import { InputController } from '../controllers/InputController';
import { websocketService } from '../api/websocket';
import { WebSocketMessageType } from '../api/types';
import { Operation } from '../models/operation';

const boardStore = useBoardStore();
const canvasRef = ref<HTMLCanvasElement | null>(null);

let canvasEngine: CanvasEngine | null = null;
let operationController: OperationController | null = null;
let inputController: InputController | null = null;

// Canvas尺寸，全屏显示
const canvasWidth = ref(window.innerWidth);
const canvasHeight = ref(window.innerHeight);

// 监听所有笔触变化，更新Canvas
watch(
  () => boardStore.allStrokes,
  (newStrokes) => {
    if (canvasEngine) {
      canvasEngine.updateStrokes(newStrokes);
    }
  },
  { deep: true }
);

// 处理窗口大小变化
const handleResize = () => {
  if (!canvasRef.value) return;
  
  // 直接使用扩展后的容器尺寸，不依赖父容器的clientWidth
  const actualWidth = window.innerWidth + 100; // 增加100px宽度
  const actualHeight = window.innerHeight;
  
  // 更新canvas尺寸
  canvasWidth.value = actualWidth;
  canvasHeight.value = actualHeight;
  
  // 确保更新canvas的实际尺寸
  canvasRef.value.width = actualWidth;
  canvasRef.value.height = actualHeight;
  
  if (canvasEngine) {
    canvasEngine.resize(actualWidth, actualHeight);
  }
  
  // 更新store中的Canvas尺寸
  boardStore.setCanvasSize(actualWidth, actualHeight);
};

// 处理远程操作
const handleRemoteOperation = (operation: Operation) => {
  if (operationController) {
    operationController.processRemoteOperation(operation);
  }
};

onMounted(() => {
  if (!canvasRef.value) return;
  
  // 更新canvas尺寸以匹配父容器
  handleResize();
  
  // 初始化CanvasEngine
  canvasEngine = new CanvasEngine(canvasRef.value);
  
  // 初始化OperationController
  operationController = new OperationController();
  
  // 初始化InputController
  inputController = new InputController(canvasRef.value, operationController);
  
  // 监听远程操作
  websocketService.on(WebSocketMessageType.REMOTE_OPERATION, handleRemoteOperation);
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
  
  // 添加ResizeObserver监听父容器尺寸变化
  const resizeObserver = new ResizeObserver(() => {
    handleResize();
  });
  
  if (canvasRef.value.parentElement) {
    resizeObserver.observe(canvasRef.value.parentElement);
    // 保存ResizeObserver实例以便清理
    (window as any).canvasResizeObserver = resizeObserver;
  }
});

onUnmounted(() => {
  // 清理资源
  if (inputController) {
    inputController.destroy();
  }
  
  if (canvasEngine) {
    canvasEngine.destroy();
  }
  
  // 移除事件监听器
  websocketService.off(WebSocketMessageType.REMOTE_OPERATION, handleRemoteOperation);
  window.removeEventListener('resize', handleResize);
  
  // 清理ResizeObserver
  const resizeObserver = (window as any).canvasResizeObserver;
  if (resizeObserver) {
    resizeObserver.disconnect();
    delete (window as any).canvasResizeObserver;
  }
});
</script>

<style scoped>
.canvas-container {
  width: calc(100% + 100px);
  height: 100%;
  background-color: #ffffff;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: -100px;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  display: block;
  box-sizing: border-box;
  z-index: 1;
}

canvas {
  display: block;
  cursor: crosshair;
  background-color: #ffffff;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  touch-action: none;
  pointer-events: all;
}
</style>