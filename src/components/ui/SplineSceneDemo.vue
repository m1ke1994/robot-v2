<script setup>
import SplineScene from './SplineScene.vue';
</script>

<template>
  <section
    class="relative flex h-[500px] w-full overflow-hidden rounded-xl border border-white/10 bg-transparent backdrop-blur-sm"
  >
    <div class="flex flex-1 flex-col justify-center gap-4 p-8">
      <h1
        class="text-4xl font-semibold tracking-tight text-white md:text-5xl"
      >
        Interactive 3D
      </h1>
      <p class="max-w-lg text-base text-slate-300">
        Bring your UI to life with beautiful 3D scenes. Create immersive
        experiences that capture attention and enhance your design without
        adding any distracting lighting effects.
      </p>
    </div>
    <div class="relative flex flex-1 items-center justify-center">
      <SplineScene
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
        class-name="h-full w-full"
      />
    </div>
  </section>
</template>
