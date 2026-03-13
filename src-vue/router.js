import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import AssetList from './views/AssetList.vue'
import AssetForm from './views/AssetForm.vue'
import Login from './views/Login.vue'
import UserManagement from './views/UserManagement.vue'
import UserForm from './views/UserForm.vue'
import ChangePassword from './views/ChangePassword.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: ChangePassword,
    meta: { requiresAuth: true }
  },
  {
    path: '/assets',
    name: 'AssetList',
    component: AssetList,
    meta: { requiresAuth: true }
  },
  {
    path: '/assets/new',
    name: 'AssetCreate',
    component: AssetForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/assets/:id/edit',
    name: 'AssetEdit',
    component: AssetForm,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/users/new',
    name: 'UserCreate',
    component: UserForm,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login');
      return;
    }

    if (to.matched.some(record => record.meta.requiresAdmin)) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role !== 'admin') {
        next('/');
        return;
      }
    }
  }

  if (to.matched.some(record => record.meta.guest)) {
    if (isAuthenticated) {
      next('/');
      return;
    }
  }

  next();
});

export default router
