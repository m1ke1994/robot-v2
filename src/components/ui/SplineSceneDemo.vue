<script setup>
import SplineScene from './SplineScene.vue';
</script>

<template>
  <section
    class="relative flex h-[500px] w-full overflow-hidden rounded-xl border border-white/10 bg-transparent backdrop-blur-sm"
  >
  
    <div class="relative flex flex-1 items-center justify-center">
      <SplineScene
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
        class-name="h-full w-full"
      />
    </div>
  </section>
</template>
