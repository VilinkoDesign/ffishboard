<template>
  <div class="app-container">
    <!-- 登录页面 -->
    <LoginPage v-if="showLoginPage" />
    
    <!-- 主应用内容 -->
    <template v-else>
      <!-- Login Prompt Banner -->
      <div v-if="!userStore.isLoggedIn && showLoginBanner" class="login-banner">
        <div class="banner-content">
          <span>登录可使用协作功能，不登录将处于单机模式</span>
          <div class="banner-actions">
            <button @click="showLoginPage = true" class="login-button">去登录</button>
            <button @click="showLoginBanner = false" class="close-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

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
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useUserStore } from './store/user';
import { useBoardStore } from './store/board';
import { websocketService } from './api/websocket';
import { WebSocketMessageType, UserInfo } from './api/types';
import Toolbar from './components/Toolbar.vue';
import CanvasBoard from './components/CanvasBoard.vue';
import RoomInfo from './components/RoomInfo.vue';
import LoginPage from './components/LoginPage.vue';

const userStore = useUserStore();
const boardStore = useBoardStore();

// 显示登录页面
const showLoginPage = ref(false);
// 显示登录横幅
const showLoginBanner = ref(true);

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

// 监听用户登录状态，登录成功后隐藏登录页面
watch(
  () => userStore.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) {
      showLoginPage.value = false;
      // 每次登录生成新的随机房间号
      const randomRoomId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      // 设置房间信息
      boardStore.setRoomInfo(randomRoomId, `board-${randomRoomId}`);
    }
  }
);

onMounted(() => {
  // 从本地存储加载用户信息
  userStore.loadUserFromStorage();
  
  // 确保默认工具是画笔
  boardStore.setCurrentTool('brush');
  
  // 如果用户已登录，生成新的随机房间号
  if (userStore.isLoggedIn) {
    const randomRoomId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    // 设置房间信息
    boardStore.setRoomInfo(randomRoomId, `board-${randomRoomId}`);
  }
  
  // WebSocket消息处理
  const handleUserJoined = (user: UserInfo) => {
    // 添加用户到房间
    boardStore.addUser(user);
  };
  
  const handleUserLeft = (userId: string) => {
    // 从房间移除用户
    boardStore.removeUser(userId);
  };
  
  // 添加WebSocket事件监听
  websocketService.on(WebSocketMessageType.USER_JOINED, handleUserJoined);
  websocketService.on(WebSocketMessageType.USER_LEFT, handleUserLeft);
  
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
    // 移除WebSocket事件监听
    websocketService.off(WebSocketMessageType.USER_JOINED, handleUserJoined);
    websocketService.off(WebSocketMessageType.USER_LEFT, handleUserLeft);
    
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

// Check if room exists using WebSocket
const checkRoomExists = async (roomId: string): Promise<boolean> => {
  // 如果WebSocket未连接，先尝试连接
  if (!websocketService.getConnectionStatus()) {
    await websocketService.connect();
  }
  
  // 调用websocketService的checkRoom方法检查房间是否存在
  // 不捕获错误，让handleJoinRoom函数处理
  return await websocketService.checkRoom(roomId);
};

const handleJoinRoom = async () => {
  let inputRoomId = roomIdInput.value.trim();
  let roomId = inputRoomId;
  let userId = userStore.userId;
  let username = userStore.username;
  let userColor = userStore.color;
  
  // Reset error message
  errorMessage.value = '';
  
  // Check if input is empty
  if (!inputRoomId) {
    errorMessage.value = '请输入房间号';
    return;
  }
  
  // Special case: vilinko-test-room (case sensitive)
  const isTestRoom = inputRoomId === 'vilinko-test-room';
  if (isTestRoom) {
      roomId = '1';
      userId = 'admin-user-123';
      username = 'admin';
      userColor = '#ff0000';
      // Update user store for admin
      userStore.setUserInfo(userId, username, '13800138000', userColor);
    }
  
  try {
      // Check if room exists using WebSocket
      const roomExists = await checkRoomExists(roomId);
      
      if (!roomExists) {
        errorMessage.value = '房间未找到';
        return;
      }
      
      // 断开当前WebSocket连接，清理状态
      websocketService.disconnect();
      
      // 清理当前房间的操作和笔触数据
      boardStore.operations = [];
      boardStore.activeStrokes.clear();
      boardStore.completedStrokes.clear();
      boardStore.users = [];
      
      // Set room info，传入userId以便保存到localStorage
      boardStore.setRoomInfo(roomId, `board-${roomId}`, userStore.userId);
      
      // Connect WebSocket and join room
      await websocketService.connect();
      
      // 确保使用正确的用户信息
      const joinUserId = isTestRoom ? userId : userStore.userId;
      const joinUsername = isTestRoom ? username : userStore.username;
      
      websocketService.joinRoom({
        roomId,
        userId: joinUserId,
        username: joinUsername
      });
      
      // Hide modal only if WebSocket connection is successful
      showRoomModal.value = false;
    } catch (error) {
      console.error('Failed to join room:', error);
      // 重置房间信息，确保不进入房间
      boardStore.setRoomInfo('', '');
      // 显示错误信息
      errorMessage.value = '错误：请检查房间是否存在';
      // 不隐藏模态框，让用户可以重新输入
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

/* Login Banner Styles */
.login-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #5279FB 0%, #3B5EFF 100%);
  color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease-out;
  height: 48px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  font-size: 14px;
  width: 100%;
  max-width: 1200px;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover {
  background-color: white;
  color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
}

.close-button {
  background: transparent;
  color: white;
  border: none;
  padding: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.close-button svg {
  width: 14px;
  height: 14px;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
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
  border-radius: 12px;
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
  border-radius: 12px;
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