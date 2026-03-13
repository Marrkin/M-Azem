<template>
  <div class="user-management">
    <div class="glass-card">
      <h2>Gerenciamento de Usuários</h2>

      <div v-if="currentUser && currentUser.role !== 'admin'" class="alert alert-error">
        Acesso negado. Apenas administradores podem gerenciar usuários.
      </div>

      <div v-else>
        <div class="table-actions">
          <router-link to="/users/new" class="glass-btn glass-btn-primary">
            Adicionar Usuário
          </router-link>
        </div>

        <div class="table-wrapper">
          <table class="glass-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Data de Criação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.role }}</td>
                <td>{{ formatDate(user.created_at) }}</td>
                <td class="table-actions">
                  <button
                    @click="confirmDelete(user)"
                    class="glass-btn glass-btn-danger"
                    :disabled="user.username === currentUser.username"
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="users.length === 0" class="no-data">
          Nenhum usuário encontrado.
        </div>
      </div>

      <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
        <div class="modal-content glass-card" @click.stop>
          <h3>Confirmar Exclusão</h3>
          <p>Tem certeza que deseja excluir o usuário "{{ userToDelete?.username }}"?</p>
          <p class="alert alert-error" style="margin-top: 1rem;">Esta ação não pode ser desfeita.</p>

          <div class="modal-actions">
            <button @click="cancelDelete" class="glass-btn">Cancelar</button>
            <button @click="deleteUser" class="glass-btn glass-btn-danger">
              <span v-if="deleteLoading">Excluindo...</span>
              <span v-else>Excluir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserManagement',
  data() {
    return {
      users: [],
      currentUser: null,
      loading: false,
      showDeleteModal: false,
      userToDelete: null,
      deleteLoading: false
    };
  },
  async mounted() {
    await this.loadCurrentUser();
    if (this.currentUser && this.currentUser.role === 'admin') {
      await this.loadUsers();
    }
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

    async loadUsers() {
      this.loading = true;
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          this.users = await response.json();
        } else {
          console.error('Error loading users');
        }
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        this.loading = false;
      }
    },

    confirmDelete(user) {
      this.userToDelete = user;
      this.showDeleteModal = true;
    },

    cancelDelete() {
      this.showDeleteModal = false;
      this.userToDelete = null;
      this.deleteLoading = false;
    },

    async deleteUser() {
      if (!this.userToDelete) return;

      this.deleteLoading = true;
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`/api/users/${this.userToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          await this.loadUsers();
          this.cancelDelete();
        } else {
          console.error('Error deleting user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      } finally {
        this.deleteLoading = false;
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('pt-BR');
    }
  }
};
</script>

<style scoped>
.user-management {
  padding: 2rem 0;
}

.table-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.table-actions button {
  margin: 0;
  width: auto;
  font-size: 1rem;
  padding: 0.5rem;
  min-width: auto;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  max-width: 500px;
  width: 90%;
  padding: 2rem;
}

.modal-content h3 {
  margin-top: 0;
  color: rgba(255, 255, 255, 0.95);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .modal-content {
    padding: 1.5rem;
  }

  .table-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .table-actions button {
    width: 100%;
  }
}
</style>
