<template>
  <div id="app">
    <Header />
    <main class="main-container">
      <router-view />
    </main>
  </div>
</template>

<script>
import Header from './components/Header.vue'

export default {
  name: 'App',
  components: {
    Header
  }
}
</script>

<style>
@import './assets/styles.css';

#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #292324 0%, #ae1d20 100%);
}
</style>
