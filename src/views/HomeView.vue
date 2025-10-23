<script setup>
import SplineScene from '@/components/ui/SplineScene.vue';
</script>

<template>
  <section
    class="relative flex min-h-screen w-full items-center justify-center overflow-hidden text-white"
  >
    <div class="absolute inset-0">
      <SplineScene
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
        class-name="h-full w-full"
      />
    </div>

    <div
      class="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center md:gap-8"
    >
      <span class="text-sm font-semibold uppercase tracking-[0.35em] text-teal-300/70">
        Future Robotics Lab
      </span>
      <h1 class="text-4xl font-bold leading-tight md:text-6xl">
        Intelligent Robots for Immersive Experiences
      </h1>
      <p class="text-base text-slate-200 md:text-lg">
        Мы создаём цифровых роботов, которые помогают брендам общаться с аудиторией и оживляют любые
        презентации. Наши решения сочетают 3D-дизайн, интерактивность и искусственный интеллект.
      </p>
      <div class="flex flex-wrap justify-center gap-3 text-sm text-slate-300 md:text-base">
        <span class="rounded-full border border-white/20 px-4 py-2 backdrop-blur">
          Виртуальные ассистенты
        </span>
        <span class="rounded-full border border-white/20 px-4 py-2 backdrop-blur">
          Интерактивные презентации
        </span>
        <span class="rounded-full border border-white/20 px-4 py-2 backdrop-blur">
          3D-брендинг
        </span>
      </div>
    </div>
  </section>
</template>
