<template>
  <div class="toolbar">
    <!-- 工具按钮 -->
    <div class="tool-buttons">
      <button 
        class="tool-button" 
        :class="{ active: currentTool === 'brush' }"
        title="自由画笔"
        @click="setTool('brush')"
      >
        <span>🖌️</span>
      </button>
      <button 
        class="tool-button" 
        :class="{ active: currentTool === 'eraser' }"
        title="橡皮（双击清屏）"
        @click="setTool('eraser')"
        @dblclick="handleEraserDoubleClick"
      >
        <span>🧹</span>
      </button>
    </div>
    
    <!-- 颜色选择器 - 只显示当前颜色 -->
    <div class="toolbar-item" v-if="currentTool === 'brush'">
      <ColorPicker 
        v-model="currentColor" 
        @change="handleColorChange"
      />
    </div>
    
    <!-- 画笔粗细 - 点击后弹出滑动条 -->
    <div class="toolbar-item">
      <div class="brush-width-indicator" @click="toggleBrushSizePopup">
        <div class="brush-preview" :style="{ width: currentBrushWidth + 'px', height: currentBrushWidth + 'px' }"></div>
      </div>
      <div class="brush-size-popup" v-if="showBrushSizePopup">
        <BrushSetting 
          v-model="currentBrushWidth" 
          @change="handleBrushWidthChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useBoardStore } from '../store/board';
import { useUserStore } from '../store/user';
import ColorPicker from './ColorPicker.vue';
import BrushSetting from './BrushSetting.vue';

const boardStore = useBoardStore();
const userStore = useUserStore();

// 使用计算属性双向绑定工具和画笔设置
const currentTool = computed({
  get: () => boardStore.currentTool,
  set: (value) => boardStore.setCurrentTool(value)
});

const currentColor = computed({
  get: () => boardStore.currentColor,
  set: (value) => boardStore.setCurrentColor(value)
});

const currentBrushWidth = computed({
  get: () => boardStore.currentBrushWidth,
  set: (value) => boardStore.setCurrentBrushWidth(value)
});

// 画笔大小弹出层状态
const showBrushSizePopup = ref(false);

const toggleBrushSizePopup = () => {
  showBrushSizePopup.value = !showBrushSizePopup.value;
};

const handleColorChange = (color: string) => {
  boardStore.setCurrentColor(color);
};

const handleBrushWidthChange = (width: number) => {
  boardStore.setCurrentBrushWidth(width);
};

const setTool = (tool: 'brush' | 'eraser') => {
  currentTool.value = tool;
};

// 处理橡皮按钮双击事件 - 清屏当前用户内容
const handleEraserDoubleClick = () => {
  boardStore.clearUserStrokes(userStore.userId);
};
</script>

<style scoped>
.toolbar {
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  backdrop-filter: blur(10px);
  width: auto;
  height: auto;
  overflow: visible;
  border: none;
}

.tool-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool-button {
  width: 50px;
  height: 50px;
  border: 2px solid #ddd;
  border-radius: 50%;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.2s ease;
  padding: 0;
  margin: 0;
}

.tool-button:hover {
  background-color: #f5f5f5;
  border-color: #999;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tool-button.active {
  background-color: #e3f2fd;
  border-color: #5279FB;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(82, 121, 251, 0.3);
}

.toolbar-item {
  position: relative;
}

.brush-width-indicator {
  width: 50px;
  height: 50px;
  border: 2px solid #ddd;
  border-radius: 50%;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
  margin: 0;
}

.brush-width-indicator:hover {
  background-color: #f5f5f5;
  border-color: #999;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.brush-preview {
  background-color: #000;
  border-radius: 50%;
}

.brush-size-popup {
  position: absolute;
  left: 65px;
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 15px;
  z-index: 1001;
  backdrop-filter: blur(10px);
  border: 1px solid #eee;
}

/* 确保颜色选择器正确显示 */
:deep(.color-picker) {
  width: 50px;
  height: 50px;
}

:deep(.color-preview) {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #ddd;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.color-preview:hover) {
  border-color: #999;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.color-options) {
  position: absolute;
  left: 65px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1001;
}
</style>