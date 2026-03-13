<template>
  <div class="home">
    <div class="glass-card hero-card">
      <h1>Bem-vindo ao Sistema de Controle de Patrimônio da FFRAMO</h1>
      <p class="hero-text">
        Gerencie seus ativos de forma eficiente com nosso sistema moderno e intuitivo.
        Adicione, edite e rastreie todos os seus itens patrimoniais com facilidade.
      </p>
      <div class="hero-actions">
        <router-link to="/assets/new" class="glass-btn glass-btn-primary">
          Adicionar Primeiro Item
        </router-link>
        <router-link to="/assets" class="glass-btn">
          Ver Todos os Ativos
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home {
  padding: 2rem 0;
}

.hero-card {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
}

.hero-card h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.95);
}

.hero-text {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.8;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  text-align: center;
  padding: 2rem 1.5rem;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.95);
}

.feature-card p {
  opacity: 0.8;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .hero-card h1 {
    font-size: 2rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
