<template>
  <div class="user-form">
    <div class="glass-card">
      <h2>{{ isEditing ? 'Editar Usuário' : 'Adicionar Usuário' }}</h2>

      <div v-if="currentUser && currentUser.role !== 'admin'" class="alert alert-error">
        Acesso negado. Apenas administradores podem gerenciar usuários.
      </div>

      <div v-else>
        <form @submit.prevent="handleSubmit" class="form-grid">
          <div class="form-group">
            <label for="username">Username:</label>
            <input
              type="text"
              id="username"
              v-model="user.username"
              class="glass-input"
              placeholder="Digite o username"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password:</label>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="user.password"
              class="glass-input"
              :placeholder="isEditing ? 'Deixe vazio para manter a senha atual' : 'Digite a senha'"
              :required="!isEditing"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="password-toggle"
              title="Mostrar/Ocultar senha"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>

          <div class="form-group">
            <label for="role">Role:</label>
            <select
              id="role"
              v-model="user.role"
              class="glass-input"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="cancel"
              class="glass-btn"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="glass-btn glass-btn-primary"
              :disabled="loading"
            >
              <span v-if="loading">{{ isEditing ? 'Atualizando...' : 'Criando...' }}</span>
              <span v-else>{{ isEditing ? 'Atualizar' : 'Criar' }}</span>
            </button>
          </div>

          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>

          <div v-if="success" class="alert alert-success">
            {{ success }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserForm',
  data() {
    return {
      user: {
        username: '',
        password: '',
        role: 'user'
      },
      currentUser: null,
      loading: false,
      error: null,
      success: null,
      showPassword: false,
      isEditing: false
    };
  },
  async mounted() {
    await this.loadCurrentUser();
  },
  methods: {
    async loadCurrentUser() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.$router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          this.currentUser = await response.json();
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.$router.push('/login');
        }
      } catch (error) {
        console.error('Error loading current user:', error);
        this.$router.push('/login');
      }
    },

    async handleSubmit() {
      this.loading = true;
      this.error = null;
      this.success = null;

      const token = localStorage.getItem('token');

      try {
        let response;
        const body = {
          username: this.user.username,
          role: this.user.role
        };

        if (this.user.password.trim()) {
          body.password = this.user.password;
        }

        if (this.isEditing) {
          const userId = this.$route.params.id;
          response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
          });
        } else {
          response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
          });
        }

        const data = await response.json();

        if (response.ok) {
          this.success = this.isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!';
          setTimeout(() => {
            this.$router.push('/users');
          }, 2000);
        } else {
          this.error = data.error || 'Erro ao salvar usuário';
        }
      } catch (error) {
        this.error = 'Erro de rede. Tente novamente.';
        console.error('Error saving user:', error);
      } finally {
        this.loading = false;
      }
    },

    cancel() {
      this.$router.push('/users');
    }
  }
};
</script>

<style scoped>
.user-form {
  padding: 2rem 0;
}

.form-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 1rem;
}

.form-group {
  position: relative;
}

.glass-input[type="password"],
.glass-input[type="text"] {
  padding-right: 3rem;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
