import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(Router)
// 注意：routes不允许有多余空格
const router = new Router({
  routes: [
    // 注意{}里边是需要空格的，不然会报错
    // 访问根路径，自动重定向访问到login登录页面
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  /* to 将要访问的路径
  from 代表从哪个路径跳转而来
  next 是一个函数，表示放行
  next() 放行  next('/login) 强制跳转到登录页 */
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
