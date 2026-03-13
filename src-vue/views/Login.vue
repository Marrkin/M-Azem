<template>
  <div class="login">
    <div class="glass-card login-card">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username:</label>
          <input
            type="text"
            id="username"
            v-model="credentials.username"
            class="glass-input"
            placeholder="Usuario"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input
            type="password"
            id="password"
            v-model="credentials.password"
            class="glass-input"
            placeholder="Senha"
            required
          />
        </div>

        <button type="submit" class="glass-btn glass-btn-primary" :disabled="loading">
          <span v-if="loading">Logging in...</span>
          <span v-else>Login</span>
        </button>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      loading: false,
      error: null
    };
  },
  mounted() {
    if (localStorage.getItem('token')) {
      this.$router.push('/');
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.credentials)
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          window.dispatchEvent(new CustomEvent('login-success'));

          this.$router.push('/');
        } else {
          this.error = data.error || 'Login failed';
        }
      } catch (error) {
        this.error = 'Network error. Please try again.';
        console.error('Login error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login {
  padding: 4rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.login-card {
  max-width: 400px;
  width: 100%;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.glass-input {
  width: 100%;
}

.alert {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .login {
    padding: 2rem 1rem;
  }

  .login-card {
    padding: 1.5rem;
  }
}
</style>
