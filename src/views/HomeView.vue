<script setup lang="ts">
import { onMounted, ref } from 'vue';
import SplineScene from '../components/ui/SplineScene.vue';
import AboutIKB from '../components/AboutIKB.vue';

const heroHeading = 'Технологии, которые соединяют идею и железо';
const isHeadingVisible = ref(false);

onMounted(() => {
  const prefersReduced =
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  if (prefersReduced) {
    isHeadingVisible.value = true;
    return;
  }

  requestAnimationFrame(() => {
    isHeadingVisible.value = true;
  });
});
</script>

<template>
  <section class="Hero">
  <div class="relative flex min-h-[110vh] w-full items-center justify-center overflow-hidden pt-32 pb-20 text-white sm:min-h-screen md:min-h-[120vh] md:pt-40 md:pb-24">
 <div class="absolute inset-0">
      <SplineScene
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
        class="h-full w-full"
      />
    </div>

    <div
      class="pointer-events-none relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 text-center sm:px-8 md:gap-10 lg:max-w-6xl lg:px-16"
    >
      <span class="ikb-highlight text-lg font-semibold uppercase tracking-[0.35em]">
        Инновационно-конструкторское бюро
      </span>

      <h1 class="text-4xl font-bold leading-tight md:text-6xl" :aria-label="heroHeading">
        <span class="ikb-heading-text" :class="{ 'is-visible': isHeadingVisible }">
          {{ heroHeading }}
        </span>
      </h1>

      <p class="text-base text-slate-200 md:text-lg">
        Мы создаём цифровых и физических роботов для команд, которые стремятся одновременно
        впечатлять аудиторию и избавляться от рутины. В наших проектах дизайн, инженерия и
        искусственный интеллект работают вместе, чтобы идеи быстрее становились реальными
        продуктами.
      </p>

      <div class="pointer-events-auto">
        <a href="#contact" class="ikb-button">
          Связаться с нами
        </a>
      </div>

      <div class="flex flex-wrap justify-center gap-3 text-sm text-slate-300 md:text-base">
        <span class="ikb-chip">Встраиваемые системы</span>
        <span class="ikb-chip">R&D и прототипирование</span>
        <span class="ikb-chip">Индустриальный дизайн</span>
        <span class="ikb-chip">Искусственный интеллект</span>
      </div>
    </div>
  </div>
   
  </section>
  <section class="about">
    <AboutIKB />
  </section>
</template>

<style scoped>

.Hero {
  position: relative;
  background: radial-gradient(140% 140% at 50% -20%, rgba(148, 163, 184, 0.1), transparent 60%),
    linear-gradient(180deg, rgba(2, 6, 23, 0.15) 0%, rgba(2, 6, 23, 0.85) 65%, #020617 100%);
}

.Hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(75% 75% at 50% 80%, rgba(15, 23, 42, 0.5), transparent 80%);
}

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
  content: '';
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: -0.35rem;
  height: 2px;
  background: radial-gradient(
    40% 120% at 50% 50%,
    rgba(99, 102, 241, 0.55),
    rgba(99, 102, 241, 0)
  );
  filter: blur(0.5px);
}

.ikb-heading-text {
  display: inline-block;
  opacity: 0;
  transform: translateX(-24px);
  transition: opacity 0.75s ease, transform 0.75s ease;
}

.ikb-heading-text.is-visible {
  opacity: 1;
  transform: translateX(0);
}

.ikb-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 2.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  font-weight: 600;
  text-decoration: none;
  font-family: 'Gill Sans', 'Segoe UI', sans-serif;
  color: #0f172a;
  background: linear-gradient(90deg, #5eead4, #60a5fa, #a78bfa, #5eead4);
  background-size: 300% 100%;
  box-shadow: 0 20px 45px -25px rgba(94, 234, 212, 0.65);
  animation: ikb-shimmer 6s linear infinite;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-position 0.3s;
  isolation: isolate;
}

.ikb-button::after {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.08);
  pointer-events: none;
}

.ikb-button:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 30px 60px -30px rgba(96, 165, 250, 0.75);
}

.ikb-button:focus-visible {
  outline: 2px solid rgba(148, 163, 184, 0.35);
  outline-offset: 3px;
}

.ikb-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(148, 163, 184, 0.08));
  backdrop-filter: blur(14px);
  color: rgba(241, 245, 249, 0.9);
  text-shadow: 0 1px 12px rgba(15, 23, 42, 0.35);
  letter-spacing: 0.02em;
}

@media (prefers-reduced-motion: reduce) {
  .ikb-highlight {
    animation: none;
  }

  .ikb-heading-text {
    transition: none;
    opacity: 1;
    transform: none;
  }

  .ikb-button {
    animation: none;
  }
}

@keyframes ikb-shimmer {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 300% 50%;
  }
}


.about {
  position: relative;
}
</style>
