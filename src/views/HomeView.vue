<!-- src/pages/HomeIKB.vue -->
<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useActiveSectionStore } from '../stores/activeSection'

const SplineScene = defineAsyncComponent(() => import('../components/ui/SplineScene.vue'))
const ProjectsIKB = defineAsyncComponent(() => import('../components/ProjectsIKB.vue'))
const AboutIKB = defineAsyncComponent(() => import('../components/AboutIKB.vue'))
const Certificates = defineAsyncComponent(() => import('../components/Certificates.vue'))
const PartnersMarquee = defineAsyncComponent(() => import('../components/PartnersMarquee.vue'))
const ScrollFramesCanvas = defineAsyncComponent(() => import('../components/ScrollFramesCanvas.vue'))

const heroHeading = 'Проектируем роботизированные комплексы для промышленности'
const heroChips = ['Роботизированные линии', 'R&D и прототипы', 'Цифровые двойники', 'Индустрия 4.0']

/** refs на секции */
const heroSection = ref<HTMLElement | null>(null)
const aboutSection = ref<HTMLElement | null>(null)
const projectsSection = ref<HTMLElement | null>(null)
const certSection = ref<HTMLElement | null>(null)
const framesSection = ref<HTMLElement | null>(null)

/** реактивные флаги видимости */
const isHeadingVisible = ref(false)
const heroActive = ref(false)
const aboutActive = ref(false)
const projectsActive = ref(false)
const certsActive = ref(false)
const framesActive = ref(false)
const prefersReducedMotion = ref(false)
const isMobileDevice = ref(false)

/** состояние */
const activeSectionStore = useActiveSectionStore()

type VisibilityState = { state: typeof heroActive; once: boolean }

let observer: IntersectionObserver | null = null
let observedTargets: WeakMap<Element, VisibilityState> = new WeakMap()
let pointerQuery: MediaQueryList | null = null
let motionQuery: MediaQueryList | null = null
let scrollRaf = 0

/** отслеживание секций */
const observeSection = (el: HTMLElement | null, state: typeof heroActive, once = true) => {
  if (!el || !observer) return
  observedTargets.set(el, { state, once })
  observer.observe(el)
}

const setupObserver = () => {
  observer?.disconnect()
  observedTargets = new WeakMap()

  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    heroActive.value = true
    aboutActive.value = true
    projectsActive.value = true
    certsActive.value = true
    framesActive.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const meta = observedTargets.get(entry.target)
        if (!meta) continue
        if (entry.isIntersecting) {
          meta.state.value = true
          if (meta.once) {
            observer?.unobserve(entry.target)
            observedTargets.delete(entry.target)
          }
        }
      }
    },
    // Чуть раньше «включаем» секцию и чуть позже «выключаем»
    { threshold: 0.25, rootMargin: '0px 0px -15% 0px' },
  )

  observeSection(heroSection.value, heroActive)
  observeSection(aboutSection.value, aboutActive)
  observeSection(projectsSection.value, projectsActive)
  observeSection(certSection.value, certsActive)
  observeSection(framesSection.value, framesActive)
}

/** профили ввода (мышь/тач) */
const applyPointerProfile = () => {
  const pointerBasedMatch = pointerQuery?.matches ?? false
  isMobileDevice.value = pointerBasedMatch || window.innerWidth <= 768
  scheduleActiveSectionUpdate()
}

/** доступность: предпочитаем меньше движения */
const applyMotionPreference = (matches: boolean) => {
  prefersReducedMotion.value = matches
  if (matches) {
    observer?.disconnect()
    observer = null
    observedTargets = new WeakMap()
    heroActive.value = true
    aboutActive.value = true
    projectsActive.value = true
    certsActive.value = true
    // Кадровую анимацию оставляем выключенной при reduce motion
    framesActive.value = false
    isHeadingVisible.value = true
  }
  scheduleActiveSectionUpdate()
}

const onPointerChange = () => applyPointerProfile()
const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
  const wasReduced = prefersReducedMotion.value
  applyMotionPreference(event.matches)
  if (wasReduced && !event.matches) {
    requestAnimationFrame(() => {
      setupObserver()
    })
  }
}

/** инициализация */
onMounted(async () => {
  activeSectionStore.setSection('Hero')

  // Медиа-запросы
  pointerQuery = window.matchMedia?.('(pointer: coarse)') ?? null
  motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null

  applyPointerProfile()
  if (pointerQuery) {
    if ('addEventListener' in pointerQuery) pointerQuery.addEventListener('change', onPointerChange)
    else if ('addListener' in pointerQuery) pointerQuery.addListener(onPointerChange)
  }

  window.addEventListener('resize', applyPointerProfile, { passive: true })
  window.addEventListener('scroll', scheduleActiveSectionUpdate, { passive: true })
  window.addEventListener('resize', scheduleActiveSectionUpdate, { passive: true })

  applyMotionPreference(motionQuery?.matches ?? false)
  if (motionQuery) {
    if ('addEventListener' in motionQuery) motionQuery.addEventListener('change', onMotionPreferenceChange)
    else if ('addListener' in motionQuery) motionQuery.addListener(onMotionPreferenceChange)
  }

  await nextTick()
  scheduleActiveSectionUpdate()

  if (prefersReducedMotion.value) return
  setupObserver()
})

/** очистка */
onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  observedTargets = new WeakMap()

  if (pointerQuery) {
    if ('removeEventListener' in pointerQuery) pointerQuery.removeEventListener('change', onPointerChange)
    else if ('removeListener' in pointerQuery) pointerQuery.removeListener(onPointerChange)
  }
  window.removeEventListener('scroll', scheduleActiveSectionUpdate)
  window.removeEventListener('resize', scheduleActiveSectionUpdate)
  window.removeEventListener('resize', applyPointerProfile)

  if (motionQuery) {
    if ('removeEventListener' in motionQuery) motionQuery.removeEventListener('change', onMotionPreferenceChange)
    else if ('removeListener' in motionQuery) motionQuery.removeListener(onMotionPreferenceChange)
  }

  if (scrollRaf) {
    window.cancelAnimationFrame(scrollRaf)
    scrollRaf = 0
  }

  activeSectionStore.reset()
  motionQuery = null
  pointerQuery = null
})

/** анимация заголовка */
watch(heroActive, (active) => {
  if (active || prefersReducedMotion.value) {
    requestAnimationFrame(() => {
      isHeadingVisible.value = true
    })
  }
})

/** вычислимые флаги отрисовки тяжёлых частей */
const shouldRenderSpline = computed(() => heroActive.value && !prefersReducedMotion.value && !isMobileDevice.value)
const shouldRenderFrames = computed(() => framesActive.value && !prefersReducedMotion.value)
const marqueeActive = computed(() => heroActive.value)

/** определение активной секции (для навигации/подсветки) */
const sectionsForNavigation = [
  { id: 'Hero', ref: heroSection },
  { id: 'about', ref: aboutSection },
  { id: 'projects', ref: projectsSection },
  { id: 'cert', ref: certSection },
  { id: 'frames', ref: framesSection },
] as const

const updateActiveSection = () => {
  if (typeof window === 'undefined') return
  const scrollPosition = window.scrollY + window.innerHeight * 0.35
  let currentId = 'Hero'

  for (let i = sectionsForNavigation.length - 1; i >= 0; i -= 1) {
    const descriptor = sectionsForNavigation[i]
    const el = descriptor.ref.value
    if (!el) continue
    const top = el.offsetTop
    if (scrollPosition >= top) {
      currentId = descriptor.id
      break
    }
  }
  activeSectionStore.setSection(currentId)
}

const scheduleActiveSectionUpdate = () => {
  if (scrollRaf) return
  scrollRaf = window.requestAnimationFrame(() => {
    scrollRaf = 0
    updateActiveSection()
  })
}
</script>

<template>
  <!-- HERO -->
  <section ref="heroSection" class="Hero page-section" id="Hero">
    <div class="relative flex min-h-[100vh] w-full items-center justify-center overflow-hidden pt-20 pb-12 text-white sm:min-h-screen md:min-h-[110vh] md:pt-28 md:pb-16">
      <!-- фон / сцена -->
      <div class="absolute inset-0">
        <Suspense v-if="shouldRenderSpline">
          <template #default>
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              class="h-full w-full"
            />
          </template>
          <template #fallback>
            <div class="hero-gradient"></div>
          </template>
        </Suspense>
        <div v-else class="hero-gradient"></div>
      </div>

      <!-- контент -->
      <div class="pointer-events-none relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 text-center sm:px-8 md:gap-10 lg:max-w-6xl lg:px-16">
        <span class="ikb-highlight text-lg font-semibold uppercase tracking-[0.35em]">
          Инженерное конструкторское бюро
        </span>

        <h1 class="text-4xl font-bold leading-tight md:text-6xl" :aria-label="heroHeading">
          <span class="ikb-heading-text" :class="{ 'is-visible': isHeadingVisible }">
            {{ heroHeading }}
          </span>
        </h1>

        <p class="text-base text-slate-200 md:text-lg">
          Мы объединяем инженеров-конструкторов, разработчиков электроники и ПО, чтобы ускорять цифровую трансформацию производства.
          Проектируем роботизированные комплексы, испытательные стенды и системы управления «под ключ» — от ТЗ и 3D-модели до пуско-наладки и сопровождения.
          Работаем в формате R&amp;D и быстро выводим прототипы в серию.
        </p>

        <div class="pointer-events-auto">
          <a href="#contact" class="ikb-button">Связаться с нами</a>
        </div>

        <div class="flex flex-wrap justify-center gap-3 text-sm text-slate-300 md:text-base">
          <span v-for="chip in heroChips" :key="chip" class="ikb-chip">{{ chip }}</span>
        </div>
      </div>

      <!-- партнёры под героем -->
      <div class="hero-marquee" v-if="marqueeActive">
        <Suspense>
          <template #default>
            <PartnersMarquee />
          </template>
          <template #fallback>
            <div class="marquee-fallback"></div>
          </template>
        </Suspense>
      </div>
      <div v-else class="hero-marquee">
        <div class="marquee-fallback"></div>
      </div>
    </div>
  </section>

  <!-- ABOUT -->
  <section ref="aboutSection" class="about page-section" id="about">
    <template v-if="aboutActive">
      <div class="partners">
        <Suspense>
          <template #default>
            <PartnersMarquee />
          </template>
          <template #fallback>
            <div class="marquee-fallback"></div>
          </template>
        </Suspense>
      </div>
      <Suspense>
        <template #default>
          <AboutIKB />
        </template>
        <template #fallback>
          <div class="section-skeleton"></div>
        </template>
      </Suspense>
    </template>
    <template v-else>
      <div class="partners">
        <div class="marquee-fallback"></div>
      </div>
      <div class="section-skeleton"></div>
    </template>
  </section>

  <!-- CERTIFICATES -->
  <section ref="certSection" class="cert page-section" id="cert">
    <Suspense v-if="certsActive">
      <template #default>
        <Certificates />
      </template>
      <template #fallback>
        <div class="section-skeleton"></div>
      </template>
    </Suspense>
    <div v-else class="section-skeleton"></div>
  </section>

  <!-- PROJECTS -->
  <section ref="projectsSection" class="page-section" id="projects">
    <Suspense v-if="projectsActive">
      <template #default>
        <ProjectsIKB />
      </template>
      <template #fallback>
        <div class="section-skeleton"></div>
      </template>
    </Suspense>
    <div v-else class="section-skeleton"></div>
  </section>

  <!-- FRAMES (скролл-кадры) -->
  <section ref="framesSection" class="frames page-section" id="frames">
    <template v-if="shouldRenderFrames">
      <Suspense>
        <template #default>
          <ScrollFramesCanvas
            basePath="/frames"
            :frameCount="204"
            basename="frame_"
            ext="webp"
            :durationVH="400"
            :startFrame="1"
            :eagerPreload="24"
            :lerp="0.15"
          />
        </template>
        <template #fallback>
          <div class="frames-skeleton"></div>
        </template>
      </Suspense>
    </template>

    <div v-else-if="prefersReducedMotion" class="frames-fallback">
      <p>Анимация отключена в соответствии с настройкой «Предпочитать уменьшенное движение» на вашем устройстве.</p>
      <p class="frames-fallback-note">По запросу отправим деморолик и статичные кадры — ничего не пропустите.</p>
    </div>

    <div v-else class="frames-skeleton"></div>
  </section>
</template>

<style scoped>
/* вспомогательные контейнеры */
.partners {
  width: 100%;
  position: absolute;
  z-index: 30;
  top: -50px;
}

.Hero {
  position: relative;
  padding-block: 0;
}

/* градиент-фон героя (мягкий, без резких стыков) */
.hero-gradient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(140% 140% at 50% -20%, rgba(148, 163, 184, 0.12), transparent 60%),
    linear-gradient(180deg, rgba(2, 6, 23, 0.45) 0%, rgba(2, 6, 23, 0.85) 70%, rgba(2, 6, 23, 0.95) 100%);
  opacity: 0.85;
}

/* фолбэк-плашки */
.marquee-fallback {
  width: 100%;
  height: 92px;
  border-radius: 2.75rem;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.2));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.section-skeleton,
.section-skeleton::after,
.frames-skeleton::after {
  pointer-events: none;
}

.section-skeleton {
  position: relative;
  min-height: 320px;
  border-radius: 2rem;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.48), rgba(15, 23, 42, 0.22));
  overflow: hidden;
}

.section-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.25), transparent);
  transform: translateX(-100%);
  animation: skeleton-shimmer 2.8s infinite;
}

.frames-skeleton {
  position: relative;
  min-height: 420px;
  border-radius: 2.5rem;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.25));
  overflow: hidden;
}

.frames-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(94, 234, 212, 0.18), transparent);
  transform: translateX(-100%);
  animation: skeleton-shimmer 3.2s infinite;
}

.frames-fallback {
  border-radius: 2.5rem;
  border: 1px dashed rgba(148, 163, 184, 0.35);
  background: rgba(15, 23, 42, 0.55);
  padding: clamp(2rem, 4vw, 3rem);
  text-align: center;
  color: rgba(226, 232, 240, 0.9);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.frames-fallback-note {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: rgba(148, 163, 184, 0.75);
}

@keyframes skeleton-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .section-skeleton::after,
  .frames-skeleton::after { animation: none; }
}

/* акценты */
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
  background: radial-gradient(40% 120% at 50% 50%, rgba(99, 102, 241, 0.55), rgba(99, 102, 241, 0));
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
  .ikb-highlight { animation: none; }
  .ikb-heading-text { transition: none; opacity: 1; transform: none; }
  .ikb-button { animation: none; }
}

@keyframes ikb-shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}

/* нижний маркер партнёров под героем */
.hero-marquee {
  position: absolute;
  left: 50%;
  bottom: -6.5rem;
  transform: translateX(-50%);
  width: min(92vw, 72rem);
  z-index: 5;
}

.hero-marquee :deep(section) {
  border-radius: 2.75rem;
  background: linear-gradient(135deg, rgba(8, 13, 30, 0.85), rgba(15, 23, 42, 0.45));
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow:
    0 30px 80px -45px rgba(2, 6, 23, 0.85),
    inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.hero-marquee :deep(.pointer-events-none.absolute.inset-0) {
  background: linear-gradient(90deg, rgba(2, 6, 23, 0.9), transparent 30%, transparent 70%, rgba(2, 6, 23, 0.9));
}

.about { position: relative; }
</style>
