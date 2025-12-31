<template>
  <div class="app-container">
    <!-- Room Join Modal -->
    <div v-if="showRoomModal" class="modal-overlay">
      <div class="modal-content">
        <h2>加入房间</h2>
        <div class="input-group">
          <label for="roomId">Room ID</label>
          <input
            id="roomId"
            v-model="roomIdInput"
            type="text"
            placeholder="请输入房间号"
            @keyup.enter="handleJoinRoom"
            autocomplete="off"
          />
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div class="modal-actions">
          <button @click="handleJoinRoom" class="join-button">加入房间</button>
        </div>
      </div>
    </div>

    <!-- Main App Content -->
    <Toolbar v-if="!showRoomModal" />
    <div v-if="!showRoomModal" class="canvas-wrapper">
      <CanvasBoard />
    </div>
    <RoomInfo v-if="!showRoomModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from './store/user';
import { useBoardStore } from './store/board';
import { websocketService } from './api/websocket';
import Toolbar from './components/Toolbar.vue';
import CanvasBoard from './components/CanvasBoard.vue';
import RoomInfo from './components/RoomInfo.vue';

const userStore = useUserStore();
const boardStore = useBoardStore();

// Modal state
const showRoomModal = ref(false); // 默认不显示房间加入弹窗
const roomIdInput = ref('');
const errorMessage = ref('');

// 暴露showRoomModal给子组件
const openRoomModal = () => {
  showRoomModal.value = true;
};

// 向window对象暴露函数，以便子组件调用
(window as any)._openRoomModal = openRoomModal;

onMounted(() => {
  // 初始化用户信息（实际项目中应该从登录系统获取）
  const userId = crypto.randomUUID();
  const username = `用户${Math.floor(Math.random() * 1000)}`;
  const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  
  userStore.setUserInfo(userId, username, color);
  // 确保默认工具是画笔
  boardStore.setCurrentTool('brush');
  
  // 添加全局事件监听器，禁止文本复制、剪切和粘贴
  const handleCopy = (e: ClipboardEvent) => {
    // 检查事件目标是否为输入元素或文本域
    const target = e.target as HTMLElement;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
    }
  };
  
  const handleCut = (e: ClipboardEvent) => {
    // 检查事件目标是否为输入元素或文本域
    const target = e.target as HTMLElement;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
    }
  };
  
  const handlePaste = (e: ClipboardEvent) => {
    // 检查事件目标是否为输入元素或文本域
    const target = e.target as HTMLElement;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
    }
  };
  
  // 监听右键菜单，禁止复制选项
  const handleContextMenu = (e: MouseEvent) => {
    // 检查事件目标是否为输入元素或文本域
    const target = e.target as HTMLElement;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
    }
  };
  
  // 添加事件监听器
  document.addEventListener('copy', handleCopy);
  document.addEventListener('cut', handleCut);
  document.addEventListener('paste', handlePaste);
  document.addEventListener('contextmenu', handleContextMenu);
  
  // 移除事件监听器的清理函数
  const cleanup = () => {
    document.removeEventListener('copy', handleCopy);
    document.removeEventListener('cut', handleCut);
    document.removeEventListener('paste', handlePaste);
    document.removeEventListener('contextmenu', handleContextMenu);
    // 清理全局函数
    delete (window as any)._openRoomModal;
  };
  
  // 组件卸载时清理事件监听器
  onUnmounted(cleanup);
});

// Check if room exists (simulated for now)
const checkRoomExists = async (roomId: string): Promise<boolean> => {
  // Simulated check - in real app, this would be a WebSocket or HTTP request
  // For demo purposes, we'll return true for any room ID
  return true;
};

const handleJoinRoom = async () => {
  let roomId = roomIdInput.value.trim();
  let userId = userStore.userId;
  let username = userStore.username;
  
  // Reset error message
  errorMessage.value = '';
  
  // Check if input is empty
  if (!roomId) {
    errorMessage.value = '请输入房间号';
    return;
  }
  
  // Special case: vilinko-test-room
  const isTestRoom = roomId === 'vilinko-test-room';
  if (isTestRoom) {
    roomId = '1';
    userId = 'admin-user-123';
    username = 'admin';
    // Update user store for admin
    userStore.setUserInfo(userId, username, '#ff0000');
  }
  
  try {
    // Check if room exists (simulated)
    const roomExists = await checkRoomExists(roomId);
    
    if (!roomExists) {
      errorMessage.value = '房间未找到';
      return;
    }
    
    // Set room info
    boardStore.setRoomInfo(roomId, `board-${roomId}`);
    
    try {
      // Connect WebSocket and join room
      await websocketService.connect();
      
      websocketService.joinRoom({
        roomId,
        userId,
        username
      });
    } catch (wsError) {
      // For test room, allow entry even if WebSocket fails
      if (!isTestRoom) {
        console.error('WebSocket connection failed:', wsError);
        errorMessage.value = 'WebSocket连接失败，但已进入房间';
        // Don't return - continue to enter room
      } else {
        console.log('Test room entered without WebSocket connection');
      }
    }
    
    // Hide modal - always hide for test room, even if WebSocket fails
    showRoomModal.value = false;
  } catch (error) {
    console.error('Failed to join room:', error);
    errorMessage.value = '加入房间失败，请稍后重试';
  }
};
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  /* 禁止文本选择 */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 禁止输入框之外的文本选择 */
body {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 允许输入框内的文本选择 */
input, textarea {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f5f5f5;
  overflow: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: visible;
  position: relative;
}

/* Canvas包装器，使用绝对定位占据整个屏幕 */
.canvas-wrapper {
  position: absolute;
  top: 0;
  left: -100px;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  width: calc(100% + 100px);
  height: 100%;
  overflow: visible;
}

/* 确保html和body没有默认边距 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  background-color: white;
  color: black;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.error-message {
  color: #f44336;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.join-button {
  background-color: #5279FB;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.join-button:hover {
  background-color: #3a59d1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(82, 121, 251, 0.3);
}

.join-button:active {
  transform: translateY(0);
}
</style>