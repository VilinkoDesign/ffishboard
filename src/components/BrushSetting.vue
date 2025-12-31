<template>
  <div class="brush-setting">
    <div class="brush-width-value">{{ modelValue }}px</div>
    <input 
      type="range" 
      class="brush-width-slider"
      orient="vertical"
      :min="minWidth"
      :max="maxWidth"
      :step="step"
      :value="modelValue"
      @input="handleSliderChange"
    />
  </div>
</template>

<script setup lang="ts">
// Props
const props = defineProps<{
  modelValue: number;
  minWidth?: number;
  maxWidth?: number;
  step?: number;
}>();

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: number];
  'change': [value: number];
}>();

// 默认值
const minWidth = props.minWidth || 1;
const maxWidth = props.maxWidth || 50;
const step = props.step || 1;

// 处理滑块变化
const handleSliderChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const value = parseInt(target.value, 10);
  emit('update:modelValue', value);
  emit('change', value);
};
</script>

<style scoped>
.brush-setting {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  height: 150px;
  padding: 10px;
}

.brush-width-slider {
  width: 6px;
  height: 100px;
  -webkit-appearance: slider-vertical;
  appearance: slider-vertical;
  background: #ddd;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.brush-width-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #2196f3;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.brush-width-slider::-webkit-slider-thumb:hover {
  background: #1976d2;
  transform: scale(1.2);
}

.brush-width-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #2196f3;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.brush-width-slider::-moz-range-thumb:hover {
  background: #1976d2;
  transform: scale(1.2);
}

.brush-width-value {
  min-width: 40px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  order: 1;
}
</style>