import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'Admin' | 'SalesPerson';
  isSuperAdmin: boolean;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.userType === 'Admin');
  const isSalesPerson = computed(() => user.value?.userType === 'SalesPerson');

  async function login(credentials: { email: string; password: string }): Promise<boolean> {
    loading.value = true;
    error.value = null;

    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        
        user.value = {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          userType: data.user.userType,
          isSuperAdmin: data.user.isSuperAdmin,
        };
        token.value = data.token;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(user.value));
        
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        error.value = errorData.message || 'Login failed';
        return false;
      }
    } catch (err) {
      error.value = 'Network error. Please try again.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  function loadUserFromStorage() {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser);
        token.value = storedToken;
      } catch {
        logout();
      }
    }
  }

  async function fetchCurrentUser(): Promise<boolean> {
    if (!token.value) return false;

    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        user.value = {
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          userType: data.userType,
          isSuperAdmin: data.isSuperAdmin,
        };
        localStorage.setItem('user', JSON.stringify(user.value));
        return true;
      } else {
        logout();
        return false;
      }
    } catch {
      logout();
      return false;
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isSalesPerson,
    login,
    logout,
    loadUserFromStorage,
    fetchCurrentUser,
  };
});
