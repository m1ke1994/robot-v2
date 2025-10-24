<script setup>
import { RouterView } from 'vue-router'
import HeaderApp from './components/HeaderApp.vue'

</script>

<template>
  <div class="relative flex min-h-screen flex-col">
    <div class="app-background pointer-events-none absolute inset-0 -z-10"></div>

    <HeaderApp />

    <main class="flex w-full grow flex-col text-slate-100">
      <RouterView />
    </main>

 

    <footer class="border-t border-white/10 bg-black/60 backdrop-blur">
      <div class="mx-auto max-w-5xl px-6 py-4 text-sm text-slate-300">
        Built with Vue 3, Vite, Tailwind CSS, Vue Router, and Pinia.
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-background {
  background:
    radial-gradient(140% 120% at 20% 0%, rgba(148, 163, 184, 0.24), transparent 55%),
    radial-gradient(110% 110% at 80% 20%, rgba(59, 130, 246, 0.18), transparent 60%),
    linear-gradient(180deg, rgba(2, 6, 23, 0.1) 0%, rgba(2, 6, 23, 0.8) 55%, #020617 100%);
}
</style>
