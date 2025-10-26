<script setup lang="ts">
const partners = [
  "Компания «Ф-Байт»",
  "ООО «Электронные технологии»",
  "ОАО «Автодизель (ЯМЗ)»",
  "АО НПЦ «Элвис»",
]
</script>

<template>
  <section class="relative w-full overflow-hidden bg-transparent py-8">
    <!-- затемнение по краям -->
    <div
      class="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#060A19] via-transparent to-[#060A19]"
    ></div>

    <!-- обёртка -->
    <div class="relative flex w-max animate-marquee whitespace-nowrap">
      <!-- первая копия -->
      <span
        v-for="(name, i) in partners"
        :key="`first-${i}`"
        class="mx-12 text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400"
      >
        {{ name }}
      </span>

      <!-- дублированная копия -->
      <span
        v-for="(name, i) in partners"
        :key="`second-${i}`"
        class="mx-12 text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400"
      >
        {{ name }}
      </span>
    </div>
  </section>
</template>

<style scoped>
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-marquee {
  display: inline-flex;
  animation: marquee 25s linear infinite;
}

@media (prefers-reduced-motion: no-preference) {
  .animate-marquee {
    will-change: transform;
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate-marquee {
    animation: none;
  }
}
</style>
