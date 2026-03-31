<template>
  <header class="glass-header" v-if="!$route.path.includes('/login')">
    <nav class="nav">
      <router-link to="/" class="logo">
        📦 MTECH - Sistema de Controle de Patrimônio
      </router-link>
      <div class="nav-links" v-if="isLoggedIn">
        <router-link to="/" class="nav-link">Início</router-link>
        <router-link to="/assets" class="nav-link">Ver Ativos</router-link>
        <router-link to="/assets/new" class="nav-link glass-btn glass-btn-primary">
          Novo Ativo
        </router-link>
        <router-link v-if="currentUser && currentUser.role === 'admin'" to="/users" class="nav-link">
          Gerenciar Usuários
        </router-link>
      </div>
      <div class="header-actions">
        <div v-if="!isLoggedIn" class="auth-links">
          <router-link to="/login" class="nav-link glass-btn">Login</router-link>
        </div>
        <div v-else class="user-info" v-if="currentUser">
          <span class="user-greeting">
            Olá, {{ currentUser.username }}! | Função: <span class="user-role">{{ currentUser.role }}</span>
          </span>
          <router-link to="/change-password" class="change-password-link">
            Alterar Senha
          </router-link>
          <button @click="logout" class="logout-btn glass-btn glass-btn-danger">
            Sair
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      storageTrigger: 0
    };
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token');
    },
    currentUser() {
      this.storageTrigger;

      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (error) {
          console.error('Error parsing user data:', error);
          return null;
        }
      }
      return null;
    }
  },
  mounted() {
    window.addEventListener('storage', this.handleStorageChange);
    window.addEventListener('login-success', this.handleLoginSuccess);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('login-success', this.handleLoginSuccess);
  },
  methods: {
    handleStorageChange(event) {
      if (event.key === 'user' || event.key === 'token') {
        this.storageTrigger += 1;
      }
    },

    handleLoginSuccess() {
      this.storageTrigger += 1;
    },

    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.storageTrigger += 1;
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.glass-header {
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.15);
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-greeting {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  white-space: nowrap;
}

.user-role {
  text-transform: uppercase;
  color: rgba(238, 191, 0);
  font-weight: 600;
}

.logout-btn {
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
}

.change-password-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.change-password-link:hover {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-links {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .nav-link {
    width: 100%;
    text-align: center;
  }

  .user-info {
    margin-top: 0.5rem;
  }
}
</style>
