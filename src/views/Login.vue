<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

async function handleLogin() {
  errorMessage.value = '';
  
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter email and password';
    return;
  }

  const success = await authStore.login({
    email: email.value,
    password: password.value,
  });

  if (success) {
    const redirectPath = authStore.isAdmin ? '/admin' : '/sales';
    router.push(redirectPath);
  } else {
    errorMessage.value = authStore.error || 'Login failed';
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-section">
        <div class="logo-placeholder">
          <span class="logo-text">VH</span>
        </div>
        <h1>Vision Hub</h1>
        <p class="tagline">Sales & Order Management Platform</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? 'Logging in...' : 'Login' }}
        </button>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 420px;
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-placeholder {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
}

.logo-text {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 2px;
}

h1 {
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.tagline {
  color: #718096;
  font-size: 0.875rem;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #5568d3;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #e53e3e;
  margin-top: 1rem;
  text-align: center;
}
</style>
