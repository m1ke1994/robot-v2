<!-- src/components/PartnersMarquee.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue"

const basePartners = [
  "Компания «Ф-Байт»",
  "ООО «Электронные технологии»",
  "ОАО «Автодизель (ЯМЗ)»",
  "АО НПЦ «Элвис»",
]

// сколько раз нужно повторить базовый список внутри одного цикла
const repeat = ref(2)

const containerRef = ref<HTMLElement | null>(null)
const cycleRef = ref<HTMLElement | null>(null)

const cycleItems = computed(() => {
  // создаём массив, который повторяет базовый список repeat раз
  return Array.from({ length: repeat.value })
    .flatMap(() => basePartners)
})

let ro: ResizeObserver | null = null

const recalc = () => {
  const container = containerRef.value
  const cycle = cycleRef.value
  if (!container || !cycle) return

  // Временно выставим repeat=1, чтобы измерить "базовую" ширину одного набора
  const prev = repeat.value
  repeat.value = 1
  // Дадим браузеру дорисовать DOM перед измерением
  requestAnimationFrame(() => {
    if (!containerRef.value || !cycleRef.value) return
    const containerWidth = containerRef.value.clientWidth
    const cycleWidth = cycleRef.value.scrollWidth

    // Нужно, чтобы ширина одного цикла >= ширины контейнера.
    // Если меньше — повторяем список до достижения условия.
    let k = Math.ceil(containerWidth / Math.max(1, cycleWidth))
    // Минимум 1 повтор; добавим небольшой запас, чтобы границы были «жирнее»
    k = Math.max(1, k) + 1

    repeat.value = k

    // Вернёмся к изначальному значению, если раньше было больше
    if (prev > repeat.value) repeat.value = prev
  })
}

onMounted(() => {
  recalc()
  ro = new ResizeObserver(recalc)
  if (containerRef.value) ro.observe(containerRef.value)
})

onBeforeUnmount(() => {
  if (ro && containerRef.value) ro.unobserve(containerRef.value)
  ro = null
})
</script>

<template>
  <section
    ref="containerRef"
    class="relative w-full overflow-hidden bg-transparent py-8"
    aria-label="Компании-партнёры"
  >
    <!-- мягкое затемнение по краям -->
    <div
      class="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#060A19] via-transparent to-[#060A19]"
    />

    <!-- Вся лента: два одинаковых трека = бесконечность -->
    <div class="relative inline-flex w-max animate-marquee whitespace-nowrap will-change-transform">
      <!-- Трек №1 -->
      <div ref="cycleRef" class="flex items-center">
        <span
          v-for="(name, i) in cycleItems"
          :key="`first-${i}-${name}`"
          class="mx-12 text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400"
        >
          {{ name }}
        </span>
      </div>

      <!-- Трек №2 (идентичный) -->
      <div class="flex items-center">
        <span
          v-for="(name, i) in cycleItems"
          :key="`second-${i}-${name}`"
          class="mx-12 text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400"
        >
          {{ name }}
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 24s linear infinite;
}

/* Пауза при наведении — приятная «живость» */
:host(:hover) .animate-marquee {
  animation-play-state: paused;
}

/* Уважение к системной настройке reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-marquee {
    animation: none;
    transform: none;
  }
}
</style>
