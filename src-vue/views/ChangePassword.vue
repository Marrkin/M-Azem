<template>
  <div class="change-password">
    <div v-if="notification.message" :class="['alert', 'alert-' + notification.type]">
      {{ notification.message }}
    </div>

    <div class="glass-card">
      <h2>Alterar Senha</h2>
      <form @submit.prevent="changePassword">
        <div class="form-group" style="margin-bottom:1.5rem;">
          <label>Senha Atual</label>
          <input
            v-model="form.currentPassword"
            type="password"
            required
            placeholder="Digite sua senha atual"
            class="glass-input"
          >
        </div>
        <div class="form-group" style="margin-bottom:1.5rem;">
          <label>Nova Senha</label>
          <input
            v-model="form.newPassword"
            type="password"
            required
            minlength="6"
            placeholder="Digite sua nova senha (mínimo 6 caracteres)"
            class="glass-input"
          >
        </div>
        <div class="form-group" style="margin-bottom:1.5rem;">
          <label>Confirmar Nova Senha</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            minlength="6"
            placeholder="Confirme sua nova senha"
            class="glass-input"
          >
        </div>

        <div class="form-actions">
          <button type="submit" class="glass-btn glass-btn-primary" :disabled="isLoading">
            {{ isLoading ? 'Alterando...' : 'Alterar Senha' }}
          </button>
          <router-link to="/" class="glass-btn">
           Voltar
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'ChangePassword',
  setup() {
    const router = useRouter()
    const isLoading = ref(false)
    const notification = ref({ message: '', type: '' })

    const form = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const showNotification = (msg, type = 'success') => {
      notification.value = { message: msg, type }
      setTimeout(() => notification.value = { message: '', type: '' }, 3000)
    }

    const changePassword = async () => {
      if (form.value.newPassword !== form.value.confirmPassword) {
        showNotification('As senhas não coincidem', 'error')
        return
      }

      if (form.value.newPassword.length < 6) {
        showNotification('A nova senha deve ter pelo menos 6 caracteres', 'error')
        return
      }

      isLoading.value = true

      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/user/password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: form.value.currentPassword,
            newPassword: form.value.newPassword
          })
        })

        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Erro ao alterar senha')

        showNotification('Senha alterada com sucesso!')

        form.value = { currentPassword: '', newPassword: '', confirmPassword: '' }

        setTimeout(() => {
          router.push('/')
        }, 1500)

      } catch (e) {
        showNotification(e.message, 'error')
      } finally {
        isLoading.value = false
      }
    }

    return {
      form,
      isLoading,
      notification,
      changePassword
    }
  }
}
</script>

<style scoped>
.change-password {
  padding: 2rem 0;
  max-width: 500px;
  margin: 0 auto;
}

.form-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
}
</style>
