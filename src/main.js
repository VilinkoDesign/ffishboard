import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

// 创建Pinia实例
const pinia = createPinia()

// 创建Vue应用
const app = createApp(App)

// 使用Pinia
app.use(pinia)

// 挂载应用
app.mount('#app')