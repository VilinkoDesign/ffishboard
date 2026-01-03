- 202601031244
  - 迁移到基于Three,js的webgl、支持压感、提升性能

- 202601010132
  - 增加登录和注册功能
  - 增加提醒登录的横幅
  - README：添加后端 SQL 接入方法和接口调用实现方法；添加用户认证相关的功能
  - 移除 `vue-router` 模块，删除 `router.ts`
  - 修复 TypeScript 类型错误：在 `App.vue` 中调用 `userStore.setUserInfo` 函数时缺少 `phone` 参数。
  - 移除 `loadRoomInfoFromStorage` 调用。
