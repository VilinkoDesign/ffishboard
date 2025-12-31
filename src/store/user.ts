import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: '',
    username: '',
    color: ''
  }),
  
  actions: {
    setUserInfo(userId: string, username: string, color: string) {
      this.userId = userId;
      this.username = username;
      this.color = color;
    }
  }
});