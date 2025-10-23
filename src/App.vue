<script setup>
import { RouterView } from 'vue-router'
import HeaderApp from './components/HeaderApp.vue'

</script>

<template>
  <div class="relative flex min-h-screen flex-col">
    <div class="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff,#000000)]"></div>

    <HeaderApp />

    <main class="mx-auto flex w-full max-w-5xl grow flex-col px-6 py-10 text-slate-100">
      <RouterView />
    </main>

 

    <footer class="border-t border-white/10 bg-black/60 backdrop-blur">
      <div class="mx-auto max-w-5xl px-6 py-4 text-sm text-slate-300">
        Built with Vue 3, Vite, Tailwind CSS, Vue Router, and Pinia.
      </div>
    </footer>
  </div>
</template>
