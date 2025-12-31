import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: '',
    username: '',
    phone: '',
    color: '',
    isLoggedIn: false
  }),
  
  actions: {
    setUserInfo(userId: string, username: string, phone: string, color: string) {
      this.userId = userId;
      this.username = username;
      this.phone = phone;
      this.color = color;
      this.isLoggedIn = true;
      // 保存到本地存储
      localStorage.setItem('userInfo', JSON.stringify({
        userId,
        username,
        phone,
        color
      }));
    },
    
    async login(phone: string, password: string): Promise<boolean> {
      try {
        // 模拟登录请求，实际项目中应该调用真实的API
        
        // 测试账号支持
        const testAccounts = [
          { phone: '13800138000', password: '123456', userId: 'test-user-001', username: '测试用户1', color: '#FF5733' },
          { phone: '13800138001', password: '123456', userId: 'test-user-002', username: '测试用户2', color: '#33FF57' }
        ];
        
        // 检查是否为测试账号
        const testAccount = testAccounts.find(account => account.phone === phone && account.password === password);
        
        if (testAccount) {
          // 使用测试账号信息
          this.setUserInfo(testAccount.userId, testAccount.username, testAccount.phone, testAccount.color);
          return true;
        }
        
        // 模拟普通登录成功
        const userId = crypto.randomUUID();
        const username = `用户${Math.floor(Math.random() * 10000)}`;
        const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        
        this.setUserInfo(userId, username, phone, color);
        return true;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },
    
    async register(username: string, phone: string, password: string): Promise<boolean> {
      try {
        // 模拟注册请求，实际项目中应该调用真实的API

        
        // 模拟注册成功
        return true;
      } catch (error) {
        console.error('Register error:', error);
        return false;
      }
    },
    
    logout() {
      this.userId = '';
      this.username = '';
      this.phone = '';
      this.color = '';
      this.isLoggedIn = false;
      // 清除本地存储
      localStorage.removeItem('userInfo');
    },
    
    loadUserFromStorage() {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          this.setUserInfo(parsed.userId, parsed.username, parsed.phone, parsed.color);
        } catch (error) {
          console.error('Error loading user from storage:', error);
          this.logout();
        }
      }
    }
  }
});