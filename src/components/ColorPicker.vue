<template>
  <div class="color-picker">
    <div class="color-preview" :style="{ backgroundColor: modelValue }" @click="togglePicker"></div>
    <div class="color-options" v-if="isPickerOpen">
      <div 
        v-for="color in colorOptions" 
        :key="color"
        class="color-option"
        :style="{ backgroundColor: color }"
        :class="{ active: color === modelValue }"
        @click="selectColor(color)"
      ></div>
      <input 
        type="color" 
        class="custom-color-input"
        :value="modelValue"
        @input="handleCustomColorChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

// Props
const props = defineProps<{
  modelValue: string;
}>();

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
}>();

// State
const isPickerOpen = ref(false);

// 预定义颜色选项
const colorOptions = [
  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff9900', '#9900ff', '#0099ff', '#ff0099', '#99ff00', '#00ff99'
];

// 切换颜色选择器显示
const togglePicker = () => {
  isPickerOpen.value = !isPickerOpen.value;
};

// 选择颜色
const selectColor = (color: string) => {
  emit('update:modelValue', color);
  emit('change', color);
  isPickerOpen.value = false;
};

// 处理自定义颜色变化
const handleCustomColorChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const color = target.value;
  emit('update:modelValue', color);
  emit('change', color);
};

// 监听外部modelValue变化
watch(
  () => props.modelValue,
  () => {
    // 可以在这里添加额外的逻辑
  }
);
</script>

<style scoped>
.color-picker {
  position: relative;
  display: inline-block;
  width: 100%;
}

.color-preview {
  width: 30px;
  height: 30px;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-preview:hover {
  border-color: #999;
}

.color-options {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 5px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  padding: 10px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
  width: 100%;
  min-width: 120px;
}

.color-option {
  width: 25px;
  height: 25px;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
  border-color: #666;
}

.color-option.active {
  border: 2px solid #2196f3;
  transform: scale(1.1);
}

.custom-color-input {
  grid-column: 1 / -1;
  width: 100%;
  height: 30px;
  border: none;
  cursor: pointer;
  margin-top: 5px;
}
</style>