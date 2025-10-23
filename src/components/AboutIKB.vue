<!-- src/components/AboutIKB.vue -->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue"

const visible = ref(false)

const onScroll = () => {
  const el = document.getElementById("about-ikb")
  if (!el) return
  const rect = el.getBoundingClientRect()
  if (rect.top < window.innerHeight * 0.7) {
    visible.value = true
    window.removeEventListener("scroll", onScroll)
  }
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true })
  requestAnimationFrame(onScroll)
})
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll))
</script>

<template>
  <section
    id="about-ikb"
    class="relative overflow-hidden bg-transparent backdrop-blur-sm"
    :class="visible ? 'animate-in opacity-100 translate-x-0' : 'opacity-0 translate-x-6'"
  >
    <!-- лёгкие неоновые подсветки -->
    <div
      class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
      style="background: radial-gradient(60% 60% at 50% 50%, rgba(34,211,238,0.18), transparent)"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full blur-3xl"
      style="background: radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.15), transparent)"
    ></div>

    <div class="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-12 md:gap-12 md:py-24">
      <!-- Левая часть: текст -->
      <div class="md:col-span-7">
        <span class="inline-block text-xs font-semibold tracking-[0.28em] text-cyan-300/80 uppercase">
          Инновационное Конструкторское Бюро
        </span>

        <h2 class="mt-3 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
          Интеллектуальные системы и инженерия, которые
          <span class="bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
            работают в реальном мире
          </span>
        </h2>

        <p class="mt-5 text-base leading-7 text-neutral-300 md:text-lg md:leading-8">
          Мы создаём микроконтроллерные устройства нового поколения: надёжные, безопасные и умные.
          Команда инженеров-электронщиков, программистов и конструкторов превращает идеи в реальные
          устройства — от прототипа до рабочей модели. Конфиденциальность и безопасность встроены
          в процесс: NDA, архитектурный аудит и контроль поставок.
        </p>

        <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="glass-card">
            <div class="text-sm font-semibold text-white">Инновационность</div>
            <p class="mt-1 text-sm text-neutral-300">R&amp;D, быстрые итерации, доказуемая инженерия.</p>
          </div>
          <div class="glass-card">
            <div class="text-sm font-semibold text-white">Конфиденциальность</div>
            <p class="mt-1 text-sm text-neutral-300">NDA, compartmentalization, приватность заказчика.</p>
          </div>
          <div class="glass-card">
            <div class="text-sm font-semibold text-white">Безопасность</div>
            <p class="mt-1 text-sm text-neutral-300">Аудит, отказоустойчивость, стресс-тесты и QA.</p>
          </div>
        </div>

        <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="feature">
            <h3>Встраиваемые системы</h3>
            <p>MCU/RTOS, драйверы, периферия, управление питанием, boot и обновления.</p>
          </div>
          <div class="feature">
            <h3>Прототипирование</h3>
            <p>Схемотехника, PCB, bring-up, лабораторные испытания и метрология.</p>
          </div>
          <div class="feature">
            <h3>Алгоритмы и ПО</h3>
            <p>Сигнальная обработка, телеметрия, прошивки, интеграция с API.</p>
          </div>
          <div class="feature">
            <h3>Инжиниринг под NDA</h3>
            <p>Архитектурный аудит, threat-modeling, документация, пилоты.</p>
          </div>
        </div>

        <div class="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div class="stat">
            <span class="stat-num">2008→</span>
            <span class="stat-label">опыт ядра команды</span>
          </div>
          <div class="stat">
            <span class="stat-num">R&amp;D</span>
            <span class="stat-label">циклы ≤ 4 недели</span>
          </div>
          <a
            href="#contact"
            class="group inline-flex items-center gap-2 rounded-full border border-cyan-400/60 px-5 py-2 text-sm font-medium text-cyan-200 transition-all hover:border-cyan-300 hover:bg-cyan-400/10 hover:shadow-[0_0_24px_rgba(34,211,238,0.25)]"
          >
            Связаться с ИКБ
            <svg class="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Правая визуальная часть -->
      <div class="md:col-span-5">
        <div class="visual">
          <div class="visual-header">
            <span class="dot" />
            <span class="dot" />
            <span class="dot" />
            <span class="title">IKB • Systems</span>
          </div>

          <div class="visual-body">
            <ul class="grid grid-cols-2 gap-3 text-sm">
              <li class="chip">MCU / RTOS</li>
              <li class="chip">Boot &amp; OTA</li>
              <li class="chip">DSP / Sensors</li>
              <li class="chip">PCB &amp; EMC</li>
              <li class="chip">Secure Chain</li>
              <li class="chip">Telemetry</li>
            </ul>

            <div class="divider" />

            <p class="text-sm text-neutral-300">
              Архитектура — не слайд в презентации, а контракт на надёжность.
              Мы проверяем гипотезы на столе и в поле, собирая метрики, которые важны: стабильность,
              энергопрофиль, помехоустойчивость. Так рождаются системы, которым доверяют.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.glass-card {
  @apply rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm;
}

.feature {
  @apply rounded-2xl p-5 border bg-white/5 backdrop-blur-sm;
  border-color: rgba(255,255,255,0.06);
}

.stat { @apply flex flex-col; }
.stat-num { @apply text-2xl font-semibold leading-none text-white; }
.stat-label { @apply mt-1 text-xs text-neutral-400; }

.visual {
  @apply overflow-hidden rounded-3xl border border-white/10 backdrop-blur-md;
  background: rgba(255,255,255,0.03);
}
.visual-header {
  @apply flex items-center gap-2 border-b border-white/10 px-4 py-3;
}
.visual-header .dot {
  @apply inline-block h-2 w-2 rounded-full;
  background: linear-gradient(to right, #22d3ee, #6366f1);
}
.visual-header .title { @apply ml-2 text-xs font-medium text-neutral-200; }
.visual-body { @apply p-5; }

.chip {
  @apply rounded-full border px-3 py-1 text-neutral-200 border-white/10 bg-white/5;
}

.divider {
  @apply my-5 h-px w-full;
  background: linear-gradient(90deg, transparent, rgba(148,163,184,0.35), transparent);
}

@keyframes slidefade {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-in {
  animation: slidefade 700ms cubic-bezier(.2,.75,.25,1) 40ms both;
  will-change: transform, opacity;
}
</style>
