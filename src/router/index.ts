import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import './types';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, allowedRoles: ['Admin'] },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        redirect: '/admin/users',
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
      },
      {
        path: 'groups',
        name: 'AdminGroups',
        component: () => import('@/views/admin/Groups.vue'),
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/Orders.vue'),
      },
      {
        path: 'revenue',
        name: 'AdminRevenue',
        component: () => import('@/views/admin/Revenue.vue'),
      },
    ],
  },
  {
    path: '/sales',
    component: () => import('@/views/sales/SalesLayout.vue'),
    meta: { requiresAuth: true, allowedRoles: ['SalesPerson'] },
    children: [
      {
        path: '',
        name: 'SalesDashboard',
        redirect: '/sales/orders',
      },
      {
        path: 'orders',
        name: 'SalesOrders',
        component: () => import('@/views/sales/Orders.vue'),
      },
      {
        path: 'orders/create',
        name: 'CreateOrder',
        component: () => import('@/views/sales/CreateOrder.vue'),
      },
      {
        path: 'profile',
        name: 'ChangePassword',
        component: () => import('@/views/sales/ChangePassword.vue'),
      },
    ],
  },
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  
  // Load user from storage if not already loaded
  if (!authStore.user && localStorage.getItem('user')) {
    authStore.loadUserFromStorage();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const userType = authStore.user?.userType;

  // If route requires auth and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login';
  }

  // If user is authenticated and trying to access login page
  if (to.path === '/login' && isAuthenticated) {
    return userType === 'Admin' ? '/admin' : '/sales';
  }

  // Check role-based access
  if (to.meta.allowedRoles && isAuthenticated) {
    const allowedRoles = to.meta.allowedRoles as string[];
    if (!allowedRoles.includes(userType || '')) {
      // Redirect to appropriate dashboard based on user type
      return userType === 'Admin' ? '/admin' : '/sales';
    }
  }

  // If accessing root path and authenticated, redirect to appropriate dashboard
  if (to.path === '/' && isAuthenticated) {
    return userType === 'Admin' ? '/admin' : '/sales';
  }

  return true;
});

export default router;
