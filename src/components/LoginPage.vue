<template>
  <div class="login-container">
    <div class="login-card">
      <div class="card-header">
        <h2 class="card-title">协作画板</h2>
        <p class="card-subtitle">登录或注册开始使用</p>
      </div>
      
      <div class="slider-tabs">
        <div class="slider-container">
          <div class="slider-track">
            <div 
              class="slider" 
              :class="{ 'login-active': activeTab === 'login', 'register-active': activeTab === 'register' }"
            ></div>
          </div>
          <button 
            class="tab-button login-tab" 
            :class="{ active: activeTab === 'login' }"
            @click="activeTab = 'login'"
          >
            登录
          </button>
          <button 
            class="tab-button register-tab" 
            :class="{ active: activeTab === 'register' }"
            @click="activeTab = 'register'"
          >
            注册
          </button>
        </div>
      </div>
      
      <div class="form-container">
        <!-- 登录表单 -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="tab-form login-form">
          <div class="input-group">
            <label for="login-phone" class="input-label">手机号</label>
            <input
              id="login-phone"
              v-model="loginForm.phone"
              type="tel"
              class="input-field"
              placeholder="请输入手机号"
              required
              autocomplete="phone"
            />
            <div v-if="errors.login.phone" class="error-text">{{ errors.login.phone }}</div>
          </div>
          
          <div class="input-group">
            <label for="login-password" class="input-label">密码</label>
            <input
              id="login-password"
              v-model="loginForm.password"
              type="password"
              class="input-field"
              placeholder="请输入密码"
              required
              autocomplete="current-password"
            />
            <div v-if="errors.login.password" class="error-text">{{ errors.login.password }}</div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="submit-button" :disabled="isLoading">
              <span v-if="isLoading" class="loading-spinner"></span>
              {{ isLoading ? '登录中...' : '登录' }}
            </button>
          </div>
        </form>
        
        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister" class="tab-form register-form">
          <div class="input-group">
            <label for="register-username" class="input-label">用户名</label>
            <input
              id="register-username"
              v-model="registerForm.username"
              type="text"
              class="input-field"
              placeholder="请输入用户名"
              required
              autocomplete="username"
            />
            <div v-if="errors.register.username" class="error-text">{{ errors.register.username }}</div>
          </div>
          
          <div class="input-group">
            <label for="register-phone" class="input-label">手机号</label>
            <input
              id="register-phone"
              v-model="registerForm.phone"
              type="tel"
              class="input-field"
              placeholder="请输入手机号"
              required
              autocomplete="phone"
            />
            <div v-if="errors.register.phone" class="error-text">{{ errors.register.phone }}</div>
          </div>
          
          <div class="input-group">
            <label for="register-password" class="input-label">密码</label>
            <input
              id="register-password"
              v-model="registerForm.password"
              type="password"
              class="input-field"
              placeholder="请输入密码"
              required
              autocomplete="new-password"
            />
            <div v-if="errors.register.password" class="error-text">{{ errors.register.password }}</div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="submit-button" :disabled="isLoading">
              <span v-if="isLoading" class="loading-spinner"></span>
              {{ isLoading ? '注册中...' : '注册' }}
            </button>
          </div>
        </form>
      </div>
      
      <div class="form-footer">
        <p v-if="activeTab === 'login'" class="footer-text">
          还没有账号？
          <button @click="activeTab = 'register'" class="switch-button">立即注册</button>
        </p>
        <p v-else class="footer-text">
          已有账号？
          <button @click="activeTab = 'login'" class="switch-button">立即登录</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useUserStore } from '../store/user';

const userStore = useUserStore();

// 标签页状态
const activeTab = ref('login');
// 加载状态
const isLoading = ref(false);

// 登录表单
const loginForm = reactive({
  phone: '',
  password: ''
});

// 注册表单
const registerForm = reactive({
  username: '',
  phone: '',
  password: ''
});

// 错误信息
const errors = reactive({
  login: {
    phone: '',
    password: ''
  },
  register: {
    username: '',
    phone: '',
    password: ''
  }
});

// 表单验证
const validateLoginForm = () => {
  let isValid = true;
  
  // 重置错误
  errors.login.phone = '';
  errors.login.password = '';
  
  // 手机号验证
  if (!loginForm.phone) {
    errors.login.phone = '请输入手机号';
    isValid = false;
  } else if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
    errors.login.phone = '请输入正确的手机号格式';
    isValid = false;
  }
  
  // 密码验证
  if (!loginForm.password) {
    errors.login.password = '请输入密码';
    isValid = false;
  } else if (loginForm.password.length < 6) {
    errors.login.password = '密码长度不能少于6位';
    isValid = false;
  }
  
  return isValid;
};

const validateRegisterForm = () => {
  let isValid = true;
  
  // 重置错误
  errors.register.username = '';
  errors.register.phone = '';
  errors.register.password = '';
  
  // 用户名验证
  if (!registerForm.username) {
    errors.register.username = '请输入用户名';
    isValid = false;
  } else if (registerForm.username.length < 2) {
    errors.register.username = '用户名长度不能少于2位';
    isValid = false;
  }
  
  // 手机号验证
  if (!registerForm.phone) {
    errors.register.phone = '请输入手机号';
    isValid = false;
  } else if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    errors.register.phone = '请输入正确的手机号格式';
    isValid = false;
  }
  
  // 密码验证
  if (!registerForm.password) {
    errors.register.password = '请输入密码';
    isValid = false;
  } else if (registerForm.password.length < 6) {
    errors.register.password = '密码长度不能少于6位';
    isValid = false;
  }
  
  return isValid;
};

// 登录处理
const handleLogin = async () => {
  if (!validateLoginForm()) return;
  
  isLoading.value = true;
  
  try {
    const success = await userStore.login(loginForm.phone, loginForm.password);
    
    if (success) {
      // 登录成功，清空表单
      loginForm.phone = '';
      loginForm.password = '';
    } else {
      // 登录失败
      errors.login.password = '手机号或密码错误';
    }
  } catch (error) {
    console.error('Login error:', error);
    errors.login.password = '登录失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};

// 注册处理
const handleRegister = async () => {
  if (!validateRegisterForm()) return;
  
  isLoading.value = true;
  
  try {
    const success = await userStore.register(
      registerForm.username,
      registerForm.phone,
      registerForm.password
    );
    
    if (success) {
      // 注册成功，切换到登录页
      activeTab.value = 'login';
      // 清空表单
      registerForm.username = '';
      registerForm.phone = '';
      registerForm.password = '';
      // 设置登录表单的手机号
      loginForm.phone = registerForm.phone;
    } else {
      // 注册失败
      errors.register.phone = '注册失败，请稍后重试';
    }
  } catch (error) {
    console.error('Register error:', error);
    errors.register.phone = '注册失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.5);
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: cardSlideIn 0.6s ease-out;
  width: 100%;
  max-width: 420px;
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.card-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #5279FB 0%, #3B5EFF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.slider-tabs {
  margin-bottom: 30px;
}

.slider-container {
  position: relative;
  display: flex;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.slider-track {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(50% - 4px);
  height: calc(100% - 4px);
  background: linear-gradient(135deg, #5279FB 0%, #3B5EFF 100%);
  border-radius: 10px;
  transition: transform 0.3s ease;
  z-index: 1;
}

.slider.login-active {
  transform: translateX(0);
}

.slider.register-active {
  transform: translateX(100%);
}

.tab-button {
  flex: 1;
  padding: 12px 0;
  background: transparent;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: black;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.tab-button.active {
  color: white;
  font-weight: 600;
}

.tab-button:hover {
  color: #5279FB;
}

.tab-button.active:hover {
  color: white;
}

.form-container {
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
  height: auto;
}

.tab-form {
  transition: all 0.3s ease;
  opacity: 1;
  transform: translateX(0);
}

.input-group {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: #fafafa;
  transition: all 0.3s ease;
  outline: none;
  color: #333;
}

.input-field:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-text {
  margin-top: 6px;
  font-size: 12px;
  color: #f44336;
  min-height: 16px;
}

.form-actions {
  margin-top: 32px;
}

.submit-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #5279FB 0%, #3B5EFF 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(82, 121, 251, 0.4);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.footer-text {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.switch-button {
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.3s ease;
}

.switch-button:hover {
  color: #5568d6;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }
  
  .login-card {
    padding: 30px 20px;
  }
  
  .card-title {
    font-size: 24px;
  }
  
  .input-field {
    padding: 12px 14px;
    font-size: 15px;
  }
  
  .submit-button {
    padding: 14px;
    font-size: 15px;
  }
}
</style>
