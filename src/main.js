import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { useBoardStore } from './store/board'

// 创建Pinia实例
const pinia = createPinia()

// 创建Vue应用
const app = createApp(App)

// 使用Pinia
app.use(pinia)

// 挂载应用
app.mount('#app')

// 将boardStore暴露到window对象上，供InputController使用
window._boardStore = useBoardStore()