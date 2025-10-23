<!-- src/views/HeroIKB.vue -->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue"
import SplineScene from "@/components/ui/SplineScene.vue"

const fullText =
  "Интеллектуальные системы и инженерные решения будущего"

const typedText = ref("")
const speedMs = 100
let timer: number | null = null

onMounted(() => {
  const prefersReduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches

  if (prefersReduced) {
    typedText.value = fullText
    return
  }

  let i = 0
  const tick = () => {
    typedText.value += fullText[i]
    i++
    if (i >= fullText.length && timer) {
      clearInterval(timer)
      timer = null
    }
  }
  timer = window.setInterval(tick, speedMs)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <section
    class="relative flex min-h-screen w-full items-center justify-center overflow-hidden text-white"
  >
    <!-- Фон (Spline сцена) -->
    <div class="absolute inset-0">
      <SplineScene
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
        class="h-full w-full"
      />
    </div>

    <!-- Контент поверх -->
    <div
      class="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center md:gap-8"
    >
      <span
        class="ikb-highlight text-lg font-semibold uppercase tracking-[0.35em]"
      >
        Инновационно-конструкторское бюро
      </span>

      <h1
        class="text-4xl font-bold leading-tight md:text-6xl"
        aria-label="Интеллектуальные системы и инженерные решения будущего"
      >
        <span class="ikb-type">{{ typedText }}</span>
        <span class="ikb-caret" aria-hidden="true" />
      </h1>

      <p class="text-base text-slate-200 md:text-lg">
        Мы разрабатываем микроконтроллерные устройства, цифровые прототипы и
        системы управления нового поколения. Команда ИКБ объединяет инженеров,
        программистов и конструкторов, создавая решения, где технологии
        становятся продолжением идеи.
      </p>

      <div
        class="flex flex-wrap justify-center gap-3 text-sm text-slate-300 md:text-base"
      >
        <span class="rounded-full border border-white/20 px-4 py-2 backdrop-blur"
          >Встраиваемые системы</span
        >
        <span class="rounded-full border border-white/20 px-4 py-2 backdrop-blur"
          >R&D и прототипирование</span
        >
        <span class="rounded-full border border-white/20 px-4 py-2 backdrop-blur"
          >Индустриальный дизайн</span
        >
        <span class="rounded-full border border-white/20 px-4 py-2 backdrop-blur"
          >Искусственный интеллект</span
        >
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ——— Подсветка названия ——— */
.ikb-highlight {
  background: linear-gradient(90deg, #5eead4, #60a5fa, #a78bfa, #5eead4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 0.35rem rgba(94, 234, 212, 0.35));
  background-size: 300% 100%;
  animation: ikb-shimmer 8s linear infinite;
  position: relative;
}
.ikb-highlight::after {
  content: "";
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: -0.35rem;
  height: 2px;
  background: radial-gradient(
    40% 120% at 50% 50%,
    rgba(99, 102, 241, 0.55),
    rgba(99, 102, 241, 0) 70%
  );
  filter: blur(0.5px);
}

/* ——— Печатающийся текст и курсор ——— */
.ikb-type {
  white-space: pre-wrap;
}
.ikb-caret {
  display: inline-block;
  width: 0.6ch;
  height: 1em;
  translate: 0 0.08em;
  border-right: 2px solid currentColor;
  animation: ikb-caret-blink 1s steps(1, end) infinite;
}

/* Уважение к prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .ikb-highlight {
    animation: none;
  }
  .ikb-caret {
    animation: none;
    opacity: 1;
  }
}

/* ——— Анимации ——— */
@keyframes ikb-shimmer {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 300% 50%;
  }
}
@keyframes ikb-caret-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}
</style>
