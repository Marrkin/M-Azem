<template>
  <div class="asset-form">
    <div v-if="notification.message" :class="['alert', 'alert-' + notification.type]">
      {{ notification.message }}
    </div>

    <div class="glass-card">
      <h2>{{ isEditing ? 'Editar Ativo' : 'Novo Ativo' }}</h2>
      <form @submit.prevent="saveAsset">
        <div class="form-grid">
          <div class="form-group">
            <label>Identificação Patrimonial</label>
            <input
              v-model="displayedAssetNumber"
              required
              placeholder="Ex: PAT-001 ou SEM PLAQUETA"
              class="glass-input"
            >
          </div>
          <div class="form-group">
            <label>Nome do Ativo</label>
            <input
              v-model="form.name"
              required
              placeholder="Ex: Notebook Dell"
              class="glass-input"
            >
          </div>
          <div class="form-group">
            <label>Quantidade</label>
            <input
              type="number"
              v-model="form.quantity"
              required
              min="1"
              class="glass-input"
            >
          </div>
          <div class="form-group">
            <label>Local</label>
            <input
              v-model="form.location"
              placeholder="Ex: Sala TI"
              class="glass-input"
            >
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 2rem;">
          <label>Descrição</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Descrição opcional do ativo..."
            class="glass-textarea"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="glass-btn glass-btn-primary">
            {{ isEditing ? 'Atualizar Ativo' : 'Salvar Ativo' }}
          </button>
          <router-link to="/assets" class="glass-btn">
           Cancelar
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'AssetForm',
  props: ['id'],
  setup(props) {
    const isEditing = ref(false)
    const notification = ref({ message: '', type: '' })
    const route = useRoute()
    const router = useRouter()
    const form = ref({
      id: null,
      asset_number: '',
      name: '',
      quantity: 1,
      location: '',
      description: ''
    })

    const showNotification = (msg, type = 'success') => {
      notification.value = { message: msg, type }
      setTimeout(() => notification.value = { message: '', type: '' }, 3000)
    }

    const displayedAssetNumber = computed({
      get: () => {
        const assetNumber = form.value.asset_number || ''
        if (assetNumber.startsWith('SEM PLAQUETA_')) {
          return 'SEM PLAQUETA'
        }
        return assetNumber
      },
      set: (value) => {
        form.value.asset_number = value
      }
    })

    const saveAsset = async () => {
      const url = isEditing.value
        ? `/api/assets/${form.value.id}`
        : '/api/assets'

      const method = isEditing.value ? 'PUT' : 'POST'

      const saveData = { ...form.value }

      try {
        const token = localStorage.getItem('token')
        const res = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(saveData)
        })

        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Erro ao salvar ativo')

        showNotification(
          isEditing.value ? 'Ativo atualizado com sucesso!' : 'Ativo criado com sucesso!'
        )

        setTimeout(() => {
          router.push('/assets')
        }, 1500)
      } catch (e) {
        showNotification(e.message, 'error')
      }
    }

    const resetForm = () => {
      form.value = { id: null, asset_number: '', name: '', quantity: 1, location: '', description: '' }
      isEditing.value = false
    }

    onMounted(() => {
      if (props.id) {
        isEditing.value = true
        const token = localStorage.getItem('token')
        fetch(`/api/assets/${props.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(asset => {
            form.value = { ...asset }
          })
          .catch(e => {
            showNotification('Erro ao carregar ativo', 'error')
          })
      }
    })

    return {
      form,
      isEditing,
      notification,
      displayedAssetNumber,
      saveAsset,
      resetForm
    }
  }
}
</script>

<style scoped>
.asset-form {
  padding: 2rem 0;
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
