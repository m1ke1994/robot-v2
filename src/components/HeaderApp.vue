<!-- src/components/HeaderApp.vue -->
<script setup lang="ts">
import { ref } from "vue"

const menuItems = ["Главная", "Решения и проекты", "О нас", "Сертификаты", "Контакты"]
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <header
    class="fixed top-0 left-0 z-50 w-full backdrop-blur-sm bg-white/5 border-b border-white/10"
  >
    <div
      class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:py-5"
    >
      <!-- ЛОГОТИП -->
      <div class="text-3xl font-extrabold tracking-widest select-none">
        <span
          class="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent"
        >
          IKB
        </span>
      </div>

      <!-- КНОПКА-БУРГЕР (мобильная) -->
      <button
        @click="toggleMenu"
        class="md:hidden p-2 relative z-20"
        :aria-label="isMenuOpen ? 'Закрыть меню' : 'Открыть меню'"
      >
        <div
          class="w-6 h-0.5 bg-white mb-1.5 transition-transform duration-300"
          :class="isMenuOpen ? 'rotate-45 translate-y-2' : ''"
        />
        <div
          class="w-6 h-0.5 bg-white mb-1.5 transition-opacity duration-300"
          :class="isMenuOpen ? 'opacity-0' : ''"
        />
        <div
          class="w-6 h-0.5 bg-white transition-transform duration-300"
          :class="isMenuOpen ? '-rotate-45 -translate-y-2' : ''"
        />
      </button>

      <!-- МЕНЮ -->
      <nav
        :class="[
          'absolute left-0 top-full w-full bg-black/80 backdrop-blur-sm md:static md:w-auto md:bg-transparent md:backdrop-blur-none transition-all',
          isMenuOpen ? 'block' : 'hidden md:block'
        ]"
      >
        <ul
          class="flex flex-col items-center space-y-6 py-6 md:flex-row md:space-y-0 md:space-x-8 md:py-0"
        >
          <li
            v-for="item in menuItems"
            :key="item"
          >
            <a
              href="#"
              class="relative uppercase font-semibold text-slate-200 transition-colors duration-300 hover:text-white after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-cyan-400 after:to-indigo-400 after:transition-all after:duration-300 hover:after:w-full"
              @click="closeMenu"
            >
              {{ item }}
            </a>
          </li>
        </ul>
      </nav>

      <!-- КНОПКА "СВЯЗАТЬСЯ" -->
      <div class="hidden md:block">
        <a
          href="#contact"
          class="rounded-full border border-cyan-400 px-5 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-400/10 hover:shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all duration-300"
        >
          Связаться
        </a>
      </div>
    </div>
  </header>
</template>
