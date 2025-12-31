<template>
  <div class="room-info">
    <div class="room-id">
      <span class="label">房间ID:</span>
      <span class="value">{{ roomId }}</span>
    </div>
    <div class="online-users">
      <span class="label">在线用户:</span>
      <div class="users-list">
        <div 
          v-for="user in users" 
          :key="user.userId"
          class="user-item"
        >
          <div 
            class="user-color-indicator" 
            :style="{ backgroundColor: user.color }"
          ></div>
          <span class="user-name">{{ user.username }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBoardStore } from '../store/board';

const boardStore = useBoardStore();

// 房间信息
const roomId = computed(() => boardStore.roomId || '未加入房间');
const users = computed(() => boardStore.users);
</script>

<style scoped>
.room-info {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.room-id,
.online-users {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  font-family: monospace;
  color: #333;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
}

.users-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  background-color: #f9f9f9;
  border-radius: 12px;
  font-size: 13px;
}

.user-color-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid #ddd;
}

.user-name {
  color: #333;
  font-weight: 500;
}
</style>