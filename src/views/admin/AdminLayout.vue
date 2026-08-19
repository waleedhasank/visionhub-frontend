<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-section">
          <div class="logo-icon">VH</div>
          <div class="brand-info">
            <h2>Vision Hub</h2>
            <p>Admin Portal</p>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin/users" class="nav-link">
          <span>👥</span> Users
        </router-link>
        <router-link to="/admin/groups" class="nav-link">
          <span>📁</span> Groups
        </router-link>
        <router-link to="/admin/orders" class="nav-link">
          <span>📦</span> Orders
        </router-link>
        <router-link to="/admin/revenue" class="nav-link">
          <span>💰</span> Revenue
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <p>{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</p>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </aside>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: #2d3748;
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #4a5568;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.brand-info {
  flex: 1;
}

.sidebar-header h2 {
  margin: 0 0 0.25rem 0;
  color: #667eea;
  font-size: 1.25rem;
  font-weight: 700;
}

.sidebar-header p {
  margin: 0;
  font-size: 0.75rem;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #e2e8f0;
  text-decoration: none;
  transition: background 0.2s;
}

.nav-link span {
  margin-right: 0.75rem;
}

.nav-link:hover {
  background: #4a5568;
}

.nav-link.router-link-active {
  background: #667eea;
  font-weight: 600;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid #4a5568;
}

.sidebar-footer p {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
}

.logout-btn {
  width: 100%;
  padding: 0.5rem;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.logout-btn:hover {
  background: #c53030;
}

.main-content {
  flex: 1;
  background: #f7fafc;
  padding: 2rem;
  overflow-y: auto;
}
</style>
