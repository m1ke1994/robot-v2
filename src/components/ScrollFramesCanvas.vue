<!-- src/components/ScrollSprite.vue -->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from "vue"

type Props = {
  basePath: string
  frameCount: number
  digits?: number
  basename?: string
  ext?: "webp" | "jpg" | "png"
  durationVH?: number
  startFrame?: number
  endFrame?: number
  eagerPreload?: number
  lerp?: number
  /** Порог срабатывания формы (0..1), 1 — ровно в конце дорожки */
  revealThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  digits: 4,
  basename: "frame_",
  ext: "webp",
  durationVH: 300,
  startFrame: 1,
  endFrame: undefined,
  eagerPreload: 24,
  lerp: 0.15,
  revealThreshold: 0.998,
})

/** emit сабмита формы вверх */
const emit = defineEmits<{
  (e: "submit", payload: { name: string; email: string; phone: string }): void
}>()

/** canvas и контекст */
const canvasEl = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

/** DPR (ограничим до 2х для экономии) */
const dpr = Math.min(window.devicePixelRatio || 1, 2)

/** Хранилище кадров */
const bitmaps: (ImageBitmap | undefined)[] = []

/** Флаги активности анимации и формы */
const isActive = ref(false)
const formVisible = ref(false)
let formRevealedOnce = false // чтобы не пряталась обратно

/** Кадры */
const currentFrame = ref(1)
const targetFrame = ref(1)
const lastFrame = computed(() => props.endFrame ?? props.frameCount)

/** Прогресс дорожки (0..1) — используем и для формы */
const scrollProgress = ref(0)
const progressPercent = computed(() => Math.round(scrollProgress.value * 100))
const hintReady = computed(() => scrollProgress.value >= props.revealThreshold)
/** Тизер (призрачная карточка) после 70% */
const showTeaser = computed(() => scrollProgress.value >= 0.7 && !formVisible.value)

/** URL для кадра */
function frameUrl(idx: number) {
  const n = String(idx).padStart(props.digits, "0")
  return `${props.basePath.replace(/\/$/, "")}/${props.basename}${n}.${props.ext}`
}

/** Загрузка кадра */
async function loadFrame(idx: number): Promise<ImageBitmap | undefined> {
  if (bitmaps[idx]) return bitmaps[idx]
  try {
    const res = await fetch(frameUrl(idx), { cache: "force-cache" })
    if (!res.ok) return
    const blob = await res.blob()
    const bmp = await createImageBitmap(blob)
    bitmaps[idx] = bmp
    return bmp
  } catch {
    return
  }
}

/** Жадная предзагрузка старта */
async function eagerPreload() {
  const first = Math.max(props.startFrame, 1)
  const last = Math.min(lastFrame.value, first + (props.eagerPreload || 0) - 1)
  const tasks: Promise<any>[] = []
  for (let i = first; i <= last; i++) tasks.push(loadFrame(i))
  await Promise.all(tasks)
}

/** Фоновая догрузка порциями */
function lazyWarmup() {
  const idle = (window as any).requestIdleCallback as
    | ((cb: (deadline: any) => void, opts?: any) => number)
    | undefined

  const CHUNK = 16
  let cursor = (props.startFrame || 1) + (props.eagerPreload || 0)

  const tick = async () => {
    const end = Math.min(cursor + CHUNK - 1, lastFrame.value)
    const tasks: Promise<any>[] = []
    for (let i = cursor; i <= end; i++) tasks.push(loadFrame(i))
    await Promise.all(tasks)
    cursor = end + 1
    if (cursor <= lastFrame.value) {
      if (idle) idle(tick)
      else setTimeout(tick, 50)
    }
  }

  if (cursor <= lastFrame.value) {
    if (idle) idle(tick)
    else setTimeout(tick, 0)
  }
}

/** Ресайз канваса */
function resizeCanvas() {
  if (!canvasEl.value) return
  const rect = canvasEl.value.getBoundingClientRect()
  const w = Math.max(1, Math.round(rect.width))
  const h = Math.max(1, Math.round(rect.height))
  canvasEl.value.width = Math.round(w * dpr)
  canvasEl.value.height = Math.round(h * dpr)
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

/** Рисуем кадр cover */
function drawFrame(idx: number) {
  if (!ctx || !canvasEl.value) return
  const bmp = bitmaps[idx]
  if (!bmp) return

  const cw = canvasEl.value.width / dpr
  const ch = canvasEl.value.height / dpr
  const iw = bmp.width
  const ih = bmp.height

  const scale = Math.max(cw / iw, ch / ih)
  const dw = iw * scale
  const dh = ih * scale
  const dx = (cw - dw) / 2
  const dy = (ch - dh) / 2

  ctx.clearRect(0, 0, cw, ch)
  ctx.drawImage(bmp, dx, dy, dw, dh)
}

/** RAF-петля */
let rafId = 0
function loop() {
  if (!isActive.value) return
  const cf = currentFrame.value
  const tf = targetFrame.value
  const next = cf + (tf - cf) * (props.lerp ?? 0.15)
  const snapped = Math.round(next)
  if (snapped !== cf) {
    drawFrame(snapped)
    currentFrame.value = snapped
  }
  rafId = requestAnimationFrame(loop)
}

/** Прокрутка → кадр + прогресс */
const containerEl = ref<HTMLElement | null>(null)
const stickyEl = ref<HTMLElement | null>(null)

function onScroll() {
  if (!containerEl.value) return
  const rect = containerEl.value.getBoundingClientRect()
  const vh = window.innerHeight
  const total = rect.height - vh
  if (total <= 0) return

  const p = Math.min(1, Math.max(0, (vh - rect.top) / total))
  scrollProgress.value = p

  const start = props.startFrame
  const end = lastFrame.value
  const idx = Math.round(start + p * (end - start))
  targetFrame.value = Math.min(end, Math.max(start, idx))

  // Появление формы при достижении конца
  if (!formRevealedOnce && p >= props.revealThreshold) {
    if (navigator.vibrate) navigator.vibrate(10)
    formVisible.value = true
    formRevealedOnce = true
    requestAnimationFrame(() => {
      const input = document.querySelector('input[autocomplete="name"]') as HTMLInputElement | null
      input?.focus()
    })
  }
}

/** Активируем/останавливаем RAF по видимости */
let io: IntersectionObserver | null = null

onMounted(async () => {
  currentFrame.value = props.startFrame
  targetFrame.value = props.startFrame

  ctx = canvasEl.value?.getContext("2d") ?? null
  resizeCanvas()
  window.addEventListener("resize", resizeCanvas, { passive: true })
  window.addEventListener("scroll", onScroll, { passive: true })

  await eagerPreload()
  drawFrame(props.startFrame)
  lazyWarmup()

  if (stickyEl.value) {
    io = new IntersectionObserver(
      (entries) => {
        isActive.value = entries.some((e) => e.isIntersecting)
        if (isActive.value && !rafId) {
          rafId = requestAnimationFrame(loop)
        } else if (!isActive.value && rafId) {
          cancelAnimationFrame(rafId)
          rafId = 0
        }
      },
      { root: null, threshold: 0.01 }
    )
    io.observe(stickyEl.value)
  }

  // prefers-reduced-motion: сразу показываем форму
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  if (prefersReduced) {
    formVisible.value = true
    formRevealedOnce = true
  }

  window.addEventListener("keydown", onKeydown, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeCanvas)
  window.removeEventListener("scroll", onScroll)
  window.removeEventListener("keydown", onKeydown)
  if (io && stickyEl.value) io.unobserve(stickyEl.value)
  if (rafId) cancelAnimationFrame(rafId)
  bitmaps.forEach((b: any) => b && b.close && b.close())
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") formVisible.value = false
}

/** Форма: локальное состояние + эмит */
const name = ref("")
const email = ref("")
const phone = ref("")
const submitting = ref(false)
const errors = ref<{ name?: string; email?: string; phone?: string }>({})

function validate() {
  errors.value = {}
  if (!name.value.trim()) {
    errors.value.name = "Введите имя"
  }
  const em = email.value.trim()
  const ph = phone.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
    errors.value.email = "Укажите корректный e-mail"
  }
  if (!/^[\d+()\-\s]{6,}$/.test(ph)) {
    errors.value.phone = "Укажите номер телефона"
  }
  return Object.keys(errors.value).length === 0
}

async function onSubmit(e: Event) {
  e.preventDefault()
  if (!validate()) return
  submitting.value = true

  try {
    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.replace(/\s+/g, "").trim(),
    }

    // Пример реального запроса:
    // const res = await fetch("/api/contact", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // })
    // if (!res.ok) throw new Error("Не удалось отправить форму")

    emit("submit", payload)
    formVisible.value = false
  } catch (err) {
    console.error(err)
  } finally {
    submitting.value = false
  }
}

/** Якорь к концу дорожки */
function scrollToEnd() {
  if (!containerEl.value) return
  const top = containerEl.value.getBoundingClientRect().top + window.scrollY
  const target = top + containerEl.value.offsetHeight - window.innerHeight + 1
  window.scrollTo({ top: target, behavior: "smooth" })
}
</script>

<template>
  <!-- Прозрачный контейнер «дорожки» -->
  <section
    ref="containerEl"
    class="relative w-full bg-transparent"
    :style="{ height: `${durationVH}vh` }"
  >
    <!-- Приклеенный холст без фона -->
    <div ref="stickyEl" class="sticky top-0 h-[100vh] w-full" style="contain: strict">
      <canvas
        ref="canvasEl"
        class="block h-full w-full touch-pan-y"
        aria-label="Scroll-driven animation"
      />

      <!-- Верхний прогресс-бар -->
      <div class="pointer-events-none absolute left-0 right-0 top-0 h-1.5 bg-white/5">
        <div
          class="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-[width] duration-100"
          :style="{ width: progressPercent + '%' }"
        />
      </div>

      <!-- Stepper 1→2 -->
      <div class="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 sm:top-4">
        <div
          class="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur sm:px-3 sm:text-xs"
        >
          <span :class="scrollProgress < 1 ? 'text-white' : 'text-white/60'">1. Просмотр</span>
          <span class="px-1.5 text-white/40 sm:px-2">→</span>
          <span :class="hintReady ? 'text-cyan-200' : 'text-white/60'">2. Контакт</span>
        </div>
      </div>

      <!-- Live-озвучка для скринридеров -->
      <div class="sr-only" aria-live="polite">
        {{ hintReady ? 'Форма доступна' : 'Прокрутите вниз, чтобы открыть форму' }}
      </div>

      <!-- Оверлей центра: форма + тизер -->
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
        <!-- Тизер формы (70%+) -->
        <div
          v-if="showTeaser"
          class="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            class="mx-3 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md sm:mx-4 sm:p-6"
          >
            <div class="mb-2 text-center text-xs text-white/60 sm:text-sm">
              Формa скоро появится
            </div>
            <div class="h-8 w-full rounded-md bg-white/[0.06]"></div>
            <div class="mt-2 h-8 w-2/3 rounded-md bg-white/[0.04]"></div>
            <div class="mt-4 h-9 w-full rounded-lg bg-white/[0.08]"></div>
          </div>
        </div>

        <!-- Форма -->
        <transition name="fade-zoom" appear>
          <form
            v-if="formVisible"
            @submit="onSubmit"
            class="pointer-events-auto mx-3 w-full max-w-md rounded-2xl border border-white/15 bg-black/35 p-5 shadow-2xl backdrop-blur-md sm:mx-4 sm:p-6"
          >
            <h3 class="mb-3 text-center text-lg font-semibold tracking-tight text-white sm:mb-4 sm:text-xl">
              Связаться с нами
            </h3>

            <div class="mb-3">
              <label class="mb-1 block text-xs text-white/80 sm:text-sm">Имя</label>
              <input
                v-model="name"
                type="text"
                autocomplete="name"
                placeholder="Алексей"
                class="block w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-white/40 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/30"
              />
              <p v-if="errors.name" class="mt-1 text-[11px] text-rose-300/90 sm:text-xs">
                {{ errors.name }}
              </p>
            </div>

            <div class="mb-3">
              <label class="mb-1 block text-xs text-white/80 sm:text-sm">E-mail</label>
              <input
                v-model="email"
                type="email"
                inputmode="email"
                autocomplete="email"
                placeholder="you@example.com"
                class="block w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-white/40 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/30"
              />
              <p v-if="errors.email" class="mt-1 text-[11px] text-rose-300/90 sm:text-xs">
                {{ errors.email }}
              </p>
            </div>

            <div class="mb-4">
              <label class="mb-1 block text-xs text-white/80 sm:text-sm">Телефон</label>
              <input
                v-model="phone"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                placeholder="+31 6 1234 5678"
                class="block w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-white/40 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/30"
              />
              <p v-if="errors.phone" class="mt-1 text-[11px] text-rose-300/90 sm:text-xs">
                {{ errors.phone }}
              </p>
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400/90 to-indigo-400/90 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-cyan-500/10 ring-1 ring-white/10 transition hover:from-cyan-300 hover:to-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ submitting ? "Отправка..." : "Отправить" }}
            </button>

            <p class="mt-3 text-center text-[11px] text-white/60 sm:text-xs">
              Нажмите <kbd class="rounded bg-white/10 px-1">Esc</kbd>, чтобы закрыть
            </p>
          </form>
        </transition>
      </div>

      <!-- Нижняя sticky-пилюля -->
      <div class="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center sm:bottom-6">
        <div
          class="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-2.5 py-1.5 text-[11px] text-white/80 backdrop-blur sm:px-3 sm:text-xs"
        >
          <span v-if="!hintReady">Прокрутите, чтобы открыть форму</span>
          <span v-else class="text-cyan-200">Форма доступна</span>
          <span class="text-white/40">•</span>
          <span>{{ progressPercent }}%</span>

          <button
            class="rounded-full bg-white/10 px-2 py-1 text-white transition hover:bg-white/20"
            @click.prevent="scrollToEnd"
          >
            {{ hintReady ? 'Открыть' : 'К форме' }}
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- Внешняя CTA под дорожкой (опционально; на мобилке тоже ок) -->
  <div class="mx-auto mt-4 flex max-w-md justify-center sm:mt-6">
    <button
      class="w-[92%] sm:w-full rounded-xl px-4 py-2 text-sm font-semibold text-black shadow-lg ring-1 ring-white/10
             bg-gradient-to-r from-cyan-400/60 to-indigo-400/60 disabled:opacity-50 disabled:cursor-not-allowed
             hover:from-cyan-300 hover:to-indigo-300 transition"
      :disabled="!hintReady"
      @click="formVisible = true"
    >
      Запросить консультацию
    </button>
  </div>
</template>

<style scoped>
:host,
section,
canvas {
  touch-action: pan-y;
  -webkit-user-select: none;
  user-select: none;
}

/* Анимация появления формы */
.fade-zoom-enter-active,
.fade-zoom-leave-active {
  transition: opacity 300ms ease, transform 300ms ease;
}
.fade-zoom-enter-from,
.fade-zoom-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(6px);
}

/* Мобильная адаптация: защищаем от горизонтального скролла и кликов мимо */
section {
  overflow: clip;
}
button {
  -webkit-tap-highlight-color: transparent;
}
</style>
