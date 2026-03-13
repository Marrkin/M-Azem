<template>
  <div class="asset-list">
    <div v-if="notification.message" :class="['alert', 'alert-' + notification.type]">
      {{ notification.message }}
    </div>

    <div class="glass-card">
      <h2>Lista de Ativos</h2>

      <div class="filters-section">
        <div class="filters-grid">
          <div class="form-group">
            <label>Pesquisar Nome:</label>
            <input
              v-model="filters.name"
              type="text"
              placeholder="Digite o nome do ativo..."
              class="glass-input"
              @input="applyFilters"
            >
          </div>

          <div class="form-group">
            <label>Pesquisar Patrimonial:</label>
            <input
              v-model="filters.assetNumber"
              type="text"
              placeholder="Digite o nº patrimonial..."
              class="glass-input"
              @input="applyFilters"
            >
          </div>

          <div class="form-group">
            <label>Filtrar Local:</label>
            <select
              v-model="filters.location"
              class="glass-input"
              @change="applyFilters"
            >
              <option value="">Todos os Locais</option>
              <option v-for="location in availableLocations" :key="location" :value="location">
                {{ location }}
              </option>
            </select>
          </div>

          <div class="form-group filter-actions">
            <button @click="clearFilters" class="glass-btn glass-btn-secondary">
              Limpar Filtros
            </button>
          </div>
        </div>

        <div v-if="hasActiveFilters" class="active-filters">
          <span class="filter-counter">Filtros ativos: {{ activeFilterCount }}</span>
        </div>
      </div>

      <div class="action-buttons">
        <router-link to="/assets/new" class="glass-btn glass-btn-primary">
          Adicionar Novo Ativo
        </router-link>

        <button @click="downloadExcel" class="glass-btn glass-btn-success">
          <span>📊 Baixar Excel</span>
        </button>
      </div>

      <div class="table-wrapper">
        <table class="glass-table" v-if="assets.length > 0" >
          <thead>
            <tr>
              <th>Identificação Patrimonial</th>
              <th>Nome</th>
              <th>Quantidade</th>
              <th>Local</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in assets" :key="asset.id">
              <td><strong>{{ displayAssetNumber(asset.asset_number) }}</strong></td>
              <td>{{ asset.name }}</td>
              <td>{{ asset.quantity }}</td>
              <td>{{ asset.location }}</td>
              <td>{{ asset.description }}</td>
              <td class="table-actions">
                <button class="glass-btn" @click="editAsset(asset)">Editar</button>
                <button class="glass-btn glass-btn-danger" @click="deleteAsset(asset.id)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="no-data">
          Nenhum ativo cadastrado ainda.
          <router-link to="/assets/new" class="inline-link">Adicione o primeiro aqui</router-link>.
        </div>
      </div>

      <div v-if="pagination.totalPages > 1" class="pagination">
        <button
          class="pagination-btn"
          :disabled="!pagination.hasPrev"
          @click="goToPage(pagination.currentPage - 1)"
        >
          Anterior
        </button>

        <span class="pagination-info">
          Página {{ pagination.currentPage }} de {{ pagination.totalPages }}
          ({{ pagination.totalCount }} itens)
        </span>

        <button
          class="pagination-btn"
          :disabled="!pagination.hasNext"
          @click="goToPage(pagination.currentPage + 1)"
        >
          Próximo
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AssetList',
  setup() {
    const assets = ref([])
    const pagination = ref({})
    const availableLocations = ref([])
    const notification = ref({ message: '', type: '' })
    const router = useRouter()
    const filters = ref({
      name: '',
      assetNumber: '',
      location: ''
    })

    const showNotification = (msg, type = 'success') => {
      notification.value = { message: msg, type }
      setTimeout(() => notification.value = { message: '', type: '' }, 3000)
    }

    const hasActiveFilters = computed(() => {
      return filters.value.name.trim() !== '' ||
             filters.value.assetNumber.trim() !== '' ||
             filters.value.location !== ''
    })

    const activeFilterCount = computed(() => {
      let count = 0
      if (filters.value.name.trim()) count++
      if (filters.value.assetNumber.trim()) count++
      if (filters.value.location) count++
      return count
    })

    const fetchAssets = async (page = 1) => {
      try {
        const token = localStorage.getItem('token')

        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10'
        })

        if (filters.value.name.trim()) {
          params.append('name', filters.value.name.trim())
        }
        if (filters.value.assetNumber.trim()) {
          params.append('assetNumber', filters.value.assetNumber.trim())
        }
        if (filters.value.location) {
          params.append('location', filters.value.location)
        }

        const res = await fetch(`/api/assets?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await res.json()

        if (data.assets) {
          assets.value = data.assets
          pagination.value = data.pagination
          if (data.availableLocations) {
            availableLocations.value = data.availableLocations
          } else {
            const locations = new Set()
            data.assets.forEach(asset => {
              if (asset.location) locations.add(asset.location)
            })
            availableLocations.value = Array.from(locations).sort()
          }
        } else {
          assets.value = data
          pagination.value = {}
          const locations = new Set()
          data.forEach(asset => {
            if (asset.location) locations.add(asset.location)
          })
          availableLocations.value = Array.from(locations).sort()
        }
      } catch (e) {
        showNotification('Erro ao carregar dados', 'error')
      }
    }

    const applyFilters = () => {
      fetchAssets(1)
    }

    const clearFilters = () => {
      filters.value = {
        name: '',
        assetNumber: '',
        location: ''
      }
      fetchAssets(1)
    }

    const displayAssetNumber = (assetNumber) => {
      if (!assetNumber) return '';
      if (assetNumber.startsWith('SEM PLAQUETA_')) {
        return 'SEM PLAQUETA';
      }
      return assetNumber;
    }

    const downloadExcel = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/assets/export/excel', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Erro ao baixar arquivo Excel')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = 'ativos.xlsx'
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '')
          }
        }

        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        window.URL.revokeObjectURL(url)

        showNotification('Arquivo Excel baixado com sucesso', 'success')

      } catch (error) {
        console.error('Excel download error:', error)
        showNotification('Erro ao baixar arquivo Excel', 'error')
      }
    }

    const goToPage = (page) => {
      fetchAssets(page)
    }

    const editAsset = (asset) => {
      router.push({ name: 'AssetEdit', params: { id: asset.id } })
    }

    const deleteAsset = async (id) => {
      if (!confirm('Tem certeza que deseja excluir este ativo?')) return

      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/assets/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!res.ok) throw new Error('Erro ao excluir')

        showNotification('Ativo excluído com sucesso')
        if (assets.value.length === 1 && pagination.value.currentPage > 1) {
          goToPage(pagination.value.currentPage - 1)
        } else {
          fetchAssets(pagination.value.currentPage)
        }
      } catch (e) {
        showNotification(e.message, 'error')
      }
    }

    onMounted(() => {
      fetchAssets()
    })

    return {
      assets,
      pagination,
      notification,
      filters,
      availableLocations,
      hasActiveFilters,
      activeFilterCount,
      applyFilters,
      clearFilters,
      displayAssetNumber,
      downloadExcel,
      editAsset,
      deleteAsset,
      fetchAssets,
      goToPage
    }
  }
}
</script>

<style scoped>
.asset-list {
  padding: 2rem 0;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.inline-link {
  color: rgba(34, 197, 94, 0.9);
  text-decoration: underline;
  margin-left: 0.5rem;
}

.inline-link:hover {
  opacity: 0.8;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.filters-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  align-items: end;
}

.active-filters {
  text-align: right;
}

.filter-counter {
  font-size: 0.85rem;
  color: rgba(34, 197, 94, 0.8);
  font-weight: 600;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.3);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .filter-actions {
    justify-content: center;
  }

  .active-filters {
    text-align: center;
  }

  .table-actions {
    flex-direction: column;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .glass-table {
    min-width: 800px;
  }

  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }

  .pagination-info {
    order: -1;
  }
}
</style>
