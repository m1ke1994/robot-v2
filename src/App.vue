<script setup>
import HeaderApp from './components/HeaderApp.vue'
import FooterApp from './components/FooterApp.vue'
import HomeView from './views/HomeView.vue'
</script>

<template>
  <div class="app-shell relative flex min-h-screen flex-col">
    <div aria-hidden="true" class="app-overlay pointer-events-none fixed inset-0 -z-20"></div>
    <div aria-hidden="true" class="app-noise pointer-events-none fixed inset-0 -z-10"></div>
    <HeaderApp />
    <main class="flex w-full grow flex-col text-slate-100">
      <HomeView />
    </main>
    <footer>
      <FooterApp />
    </footer>
  </div>
</template>
<style scoped>
.app-shell {
  position: relative;
}

.app-overlay {
  background:
    radial-gradient(120% 120% at 50% 0%, rgba(15, 23, 42, 0.4), transparent 65%),
    linear-gradient(180deg, rgba(2, 6, 23, 0) 0%, rgba(2, 6, 23, 0.76) 70%, rgba(2, 6, 23, 0.92) 100%);
  mix-blend-mode: normal;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  opacity: 0.8;
}

.app-noise {
  background-image: var(--app-noise);
  background-size: 280px 280px;
  mix-blend-mode: soft-light;
  opacity: 0.35;
}
</style>
