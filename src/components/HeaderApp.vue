<!-- src/components/HeaderApp.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue"
import { RouterLink, useRoute } from "vue-router"

type Item = { label: string; to: string }
const items: Item[] = [
  { label: "Главная", to: "/" },
  { label: "Решения и проекты", to: "/projects" },
  { label: "О нас", to: "/about" },
  { label: "Сертификаты", to: "/certs" },
  { label: "Контакты", to: "/contacts" },
]

const isOpen = ref(false)
const route = useRoute()

/* iOS-safe lock */
let scrollY = 0
const lockBodyScroll = () => {
  scrollY = window.scrollY || 0
  const b = document.body
  b.style.position = "fixed"
  b.style.top = `-${scrollY}px`
  b.style.left = "0"; b.style.right = "0"; b.style.width = "100%"
}
const unlockBodyScroll = () => {
  const b = document.body
  b.style.position = ""; b.style.top = ""; b.style.left = ""; b.style.right = ""; b.style.width = ""
  window.scrollTo(0, scrollY)
}

const toggle = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    lockBodyScroll()
    await nextTick()
    document.querySelector<HTMLAnchorElement>("#mobile-menu a, #mobile-menu button")?.focus()
  } else {
    unlockBodyScroll()
    await nextTick()
    document.getElementById("burger-btn")?.focus()
  }
}
const close = async () => {
  if (!isOpen.value) return
  isOpen.value = false
  unlockBodyScroll()
  await nextTick()
  document.getElementById("burger-btn")?.focus()
}

const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
watch(() => route.fullPath, () => close())

onMounted(() => window.addEventListener("keydown", onKey))
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey)
  unlockBodyScroll()
})

const isActive = (to: string) =>
  route.path === to || (to !== "/" && route.path.startsWith(to))
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-md supports-[backdrop-filter]:bg-black/30"
    role="banner"
  >
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:h-20">
      <!-- Лево: логотип + название (название только на десктопе) -->
      <RouterLink to="/" class="group flex items-center gap-3 min-w-0">
        <img src="/logo.svg" alt="Логотип" class="h-8 w-8 shrink-0 transition-transform group-hover:scale-105" />
        <span class="hidden lg:block truncate text-base font-semibold tracking-wide text-[#0c1332]">
          ИКБ
        </span>
      </RouterLink>

      <!-- Центр: меню (≥ lg) -->
      <nav class="hidden lg:flex items-center gap-1" aria-label="Главное меню">
        <RouterLink
          v-for="it in items" :key="it.to" :to="it.to"
          class="rounded-md px-3 py-2 text-sm font-medium transition"
          :class="isActive(it.to) ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'"
        >
          {{ it.label }}
        </RouterLink>
      </nav>

      <!-- Право: CTA (≥ lg) -->
      <div class="hidden lg:block">
        <a href="#callback"
           class="inline-flex items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/20 hover:text-white transition">
          Обратный звонок
        </a>
      </div>

      <!-- Бургер (моб/планшет) -->
      <button
        id="burger-btn"
        class="lg:hidden relative h-10 w-10 rounded-md border border-white/10 hover:border-white/20 transition focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
        :aria-expanded="isOpen ? 'true' : 'false'"
        aria-controls="mobile-menu"
        aria-label="Открыть меню"
        @click="toggle"
      >
        <span class="absolute left-1/2 top-1/2 block h-0.5 w-6 -translate-x-1/2 -translate-y-[8px] bg-white transition [transform-origin:center]"
              :class="isOpen ? 'rotate-45 translate-y-0' : ''" />
        <span class="absolute left-1/2 top-1/2 block h-0.5 w-6 -translate-x-1/2 bg-white transition"
              :class="isOpen ? 'opacity-0' : ''" />
        <span class="absolute left-1/2 top-1/2 block h-0.5 w-6 -translate-x-1/2 translate-y-[8px] bg-white transition [transform-origin:center]"
              :class="isOpen ? '-rotate-45 translate-y-0' : ''" />
      </button>
    </div>

    <!-- Телепортируем оверлей и панель в body, чтобы никакие transform у родителей не ломали fixed -->
    <teleport to="body">
      <!-- Оверлей -->
      <transition name="fade">
        <div
          v-show="isOpen"
          class="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
          @click="close"
        />
      </transition>

      <!-- Выезжающее меню -->
      <transition name="slide">
        <aside
          v-show="isOpen"
          id="mobile-menu"
          class="fixed inset-y-0 right-0 z-[1000] w-[92vw] max-w-sm overflow-y-auto border-l border-white/10
                 bg-[#060A19]/95 shadow-2xl backdrop-blur-xl focus:outline-none
                 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] px-6"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          @click.stop
        >
          <!-- Шапка панели -->
          <div class="mb-6 flex items-center justify-between">
            <RouterLink to="/" class="flex items-center gap-3" @click="close">
              <img src="/logo.svg" alt="Логотип" class="h-8 w-8" />
              <span class="text-sm font-semibold text-white/90">ИКБ</span>
            </RouterLink>
            <button
              class="rounded-md border border-white/10 p-2 hover:bg-white/5 transition focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              aria-label="Закрыть меню"
              @click="close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Ссылки -->
          <nav class="flex flex-col gap-2" aria-label="Мобильное меню">
            <RouterLink
              v-for="it in items" :key="it.to" :to="it.to" @click="close"
              class="rounded-lg px-4 py-3 text-base font-medium transition"
              :class="isActive(it.to) ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white hover:bg-white/5'"
            >
              {{ it.label }}
            </RouterLink>
          </nav>

          <!-- CTA -->
          <div class="mt-8 border-t border-white/10 pt-6">
            <a href="#callback" @click="close"
               class="flex w-full items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-base font-semibold text-cyan-200 transition hover:bg-cyan-400/20 hover:text-white">
              Обратный звонок
            </a>
          </div>

          <!-- Декор -->
          <div class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
               style="background: radial-gradient(60% 60% at 50% 50%, rgba(34,211,238,0.14), transparent)" />
        </aside>
      </transition>
    </teleport>
  </header>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .fade-enter-active, .fade-leave-active { transition: opacity 200ms ease; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
  .slide-enter-active, .slide-leave-active { transition: transform 260ms cubic-bezier(.2,.8,.2,1); }
  .slide-enter-from, .slide-leave-to { transform: translateX(100%); }
}
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active, .fade-leave-active, .slide-enter-active, .slide-leave-active { transition: none; }
}
</style>
