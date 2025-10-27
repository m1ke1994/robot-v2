<!-- src/components/VideoRevealForm.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"

type Props = {
  src?: string
  poster?: string
  /** Турбо-скорость при клике на CTA */
  turboRate?: number
  /** Скорость авто-проигрывания при попадании в зону видимости (рекомендуем 1.9–2.1) */
  autoRate?: number
  /** Высота дорожки (vh) */
  desktopVH?: number
  tabletVH?: number
  mobileVH?: number
  /** Показать встроенные CTA-кнопки внутри секции */
  showInlineCtas?: boolean
  /** Порог видимости секции для автозапуска (0..1) */
  autoplayThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  src: "/robot.mp4",
  poster: "",
  turboRate: 3.5,
  autoRate: 3.5,
  desktopVH: 200,
  tabletVH: 170,
  mobileVH: 150,
  showInlineCtas: true,
  autoplayThreshold: 0.35,
})

const emit = defineEmits<{
  (e: "submit", payload: { name: string; email: string; phone: string }): void
}>()

/* Refs */
const containerEl = ref<HTMLElement | null>(null)
const stickyEl = ref<HTMLElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)

/* UI state */
const playing = ref(false)
const playedOnce = ref(false)
const formVisible = ref(false)
/** Если автозапуск не удался — показываем нашу большую кнопку «Запустить», а не системные контролы */
const needUserStart = ref(false)

/* Флаги */
let autoTried = false
let autoStarted = false
let io: IntersectionObserver | null = null
let rafFlag = false

/* Адаптивная длина секции */
const sectionVH = ref<number>(props.desktopVH)
function recalcVH() {
  const w = typeof window !== "undefined" ? window.innerWidth : 1280
  sectionVH.value = w < 640 ? props.mobileVH : w < 1024 ? props.tabletVH : props.desktopVH
}

/* Форма */
const name = ref("")
const email = ref("")
const phone = ref("")
const submitting = ref(false)
const errors = ref<{ name?: string; email?: string; phone?: string }>({})

function validate() {
  errors.value = {}
  if (!name.value.trim()) errors.value.name = "Введите имя"
  const em = email.value.trim()
  const ph = phone.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) errors.value.email = "Укажите корректный e-mail"
  if (!/^[\d+()\-\s]{6,}$/.test(ph)) errors.value.phone = "Укажите номер телефона"
  return Object.keys(errors.value).length === 0
}

async function onSubmit(e: Event) {
  e.preventDefault()
  if (!validate()) return
  submitting.value = true
  try {
    emit("submit", {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.replace(/\s+/g, "").trim(),
    })
    formVisible.value = false
  } finally {
    submitting.value = false
  }
}

function closeForm() {
  formVisible.value = false
}

/* Заморозка последнего кадра */
let freezeAt = 0
let frozen = false

function computeFreezeAt() {
  const v = videoEl.value
  freezeAt = Math.max(0, (v?.duration ?? 0) - 0.04)
  frozen = false
}

function onLoadedMetadata() {
  computeFreezeAt()
}

function onError() {
  // В случае ошибки источника — сразу форма
  formVisible.value = true
}

/** ждём метаданные (duration) перед стартом */
function ensureMetadata(): Promise<void> {
  const v = videoEl.value
  if (!v) return Promise.resolve()
  if (v.readyState >= 1) return Promise.resolve()
  return new Promise((res) => {
    const h = () => { v.removeEventListener("loadedmetadata", h); res() }
    v.addEventListener("loadedmetadata", h, { once: true })
  })
}

/* ——— Жёсткое удержание playbackRate (для Safari/iOS) ——— */
let rateGuardStop = false
let rateGuardDesired = 1.0
let rateGuardStartTS = 0

function startRateGuard(v: HTMLVideoElement, desired: number) {
  rateGuardDesired = desired
  rateGuardStop = false
  rateGuardStartTS = performance.now()

  const tick = () => {
    if (rateGuardStop) return
    if (performance.now() - rateGuardStartTS < 1200) {
      try { if (v.playbackRate !== desired) v.playbackRate = desired } catch {}
      requestAnimationFrame(tick)
    } else {
      v.addEventListener("ratechange", onRateChangeEnforce)
    }
  }
  requestAnimationFrame(tick)
}

function stopRateGuard(v?: HTMLVideoElement | null) {
  rateGuardStop = true
  if (v) v.removeEventListener("ratechange", onRateChangeEnforce)
}

function onRateChangeEnforce() {
  const v = videoEl.value
  if (!v) return
  if (Math.abs(v.playbackRate - rateGuardDesired) > 0.01) {
    try { v.playbackRate = rateGuardDesired } catch {}
  }
}

/** Универсальный запуск с нужной скоростью. Без показа нативных контролов */
async function playWithRate(rate: number | undefined): Promise<boolean> {
  const v = videoEl.value
  if (!v) return false
  formVisible.value = false
  frozen = false
  needUserStart.value = false
  try { v.pause() } catch {}
  try { v.currentTime = 0 } catch {}
  await ensureMetadata()
  computeFreezeAt()

  v.muted = true
  const desired = Math.max(0.1, Math.min(rate ?? 1.0, 4.0)) // safety clamp
  try { v.playbackRate = desired } catch {}

  try {
    playing.value = true
    startRateGuard(v, desired)
    await v.play()
    return true
  } catch {
    // Никаких системных контролов — только наш CTA
    playing.value = false
    stopRateGuard(v)
    needUserStart.value = true
    return false
  }
}

/** CTA: старт с нуля на турбо-скорости */
async function playFromStartTurbo() {
  await playWithRate(props.turboRate)
}

/** Автозапуск — подтверждаем только после успешного .play() */
async function tryAutoplayOnce() {
  if (playedOnce.value || autoStarted) return
  autoTried = true
  const ok = await playWithRate(props.autoRate)
  if (ok) autoStarted = true
}

/** Завершение: заморозить на последнем кадре + открыть форму */
function freezeAndOpenForm() {
  const v = videoEl.value
  if (!v) return
  try { v.pause() } catch {}
  try { v.currentTime = freezeAt || Math.max(0, (v.duration || 0) - 0.04) } catch {}
  frozen = true
  playedOnce.value = true
  playing.value = false
  stopRateGuard(v)
  formVisible.value = true
}

function onTimeUpdate() {
  const v = videoEl.value
  if (!v) return
  if (!frozen && freezeAt > 0 && v.currentTime >= freezeAt) {
    freezeAndOpenForm()
  }
}

function onEnded() {
  if (!frozen) freezeAndOpenForm()
}

/** Сразу к финалу (оставить последний кадр + форму) */
function skipVideo() {
  freezeAndOpenForm()
}

/** Хоткей: Esc закрывает форму */
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && formVisible.value) closeForm()
}

/* ---------- Надёжное определение видимости секции ---------- */

function visibleRatioOfViewport(el: HTMLElement): number {
  const r = el.getBoundingClientRect()
  const vh = window.innerHeight || 0
  const visiblePx = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0))
  return vh > 0 ? visiblePx / vh : 0
}

function checkVisibilityAndAutoplay() {
  if (!containerEl.value || playedOnce.value || autoStarted) return
  const ratio = visibleRatioOfViewport(containerEl.value)
  if (ratio >= (props.autoplayThreshold ?? 0.35)) {
    tryAutoplayOnce()
  }
}

function onScrollOrResize() {
  if (rafFlag) return
  rafFlag = true
  requestAnimationFrame(() => {
    rafFlag = false
    checkVisibilityAndAutoplay()
  })
}

function setupIntersection() {
  if (!containerEl.value) return
  io = new IntersectionObserver(
    () => checkVisibilityAndAutoplay(),
    {
      root: null,
      rootMargin: "0px 0px -20% 0px",
      threshold: [0, 0.01, 0.25, 0.5, 0.75, 1],
    }
  )
  io.observe(containerEl.value)
}

function teardownIntersection() {
  if (io) {
    io.disconnect()
    io = null
  }
}

/** Монтирование */
onMounted(() => {
  recalcVH()
  window.addEventListener("resize", recalcVH, { passive: true })
  window.addEventListener("keydown", onKeydown)

  setupIntersection()
  window.addEventListener("scroll", onScrollOrResize, { passive: true })
  window.addEventListener("resize", onScrollOrResize, { passive: true })

  requestAnimationFrame(checkVisibilityAndAutoplay)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", recalcVH)
  window.removeEventListener("keydown", onKeydown)
  window.removeEventListener("scroll", onScrollOrResize)
  window.removeEventListener("resize", onScrollOrResize)
  teardownIntersection()
})

/* Публичный метод для внешних кнопок */
function playAndOpenForm() {
  playFromStartTurbo()
}
defineExpose({ playAndOpenForm })
</script>

<template>
  <section
    ref="containerEl"
    class="relative w-full bg-transparent"
    :style="{ height: `${sectionVH}vh` }"
  >
    <div
      ref="stickyEl"
      class="sticky top-0 h-[100vh] w-full overflow-hidden"
      style="contain: strict"
    >
      <!-- Видео -->
      <div class="absolute inset-0">
        <video
          ref="videoEl"
          :src="src"
          :poster="poster || undefined"
          preload="metadata"
          playsinline
          webkit-playsinline
          muted
          disablepictureinpicture
          controlslist="nodownload noplaybackrate noremoteplayback nofullscreen"
          class="h-full w-full object-cover select-none"
          @loadedmetadata="onLoadedMetadata"
          @timeupdate="onTimeUpdate"
          @ended="onEnded"
          @error="onError"
          @contextmenu.prevent
          @touchstart.passive
          @touchmove.prevent="false"
        />

        <!-- Верхняя панель статуса (без нативных контролов) -->
        <div class="pointer-events-none absolute inset-x-0 top-3 sm:top-4 z-10 flex justify-center">
          <div
            class="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur sm:text-xs"
          >
            <span v-if="!formVisible && !playedOnce && !autoTried">Готово к показу</span>
            <span v-else-if="!formVisible && !playedOnce && autoTried && !playing && !needUserStart">Пытаемся автозапуск…</span>
            <span v-else-if="playing && !formVisible">
              Проигрывание ×{{ Number((videoEl && videoEl.playbackRate) || 1).toFixed(2) }}
            </span>
            <span v-else-if="formVisible && !playedOnce">Форма открыта</span>
            <span v-else-if="formVisible && playedOnce">Видео завершено</span>

            <span class="hidden sm:inline text-white/40">•</span>

            <!-- CTA -->
            <button
              class="hidden sm:inline rounded-full bg-white/10 px-2 py-1 text-white transition hover:bg-white/20"
              v-if="!formVisible"
              @click.prevent="playFromStartTurbo"
            >
              Открыть форму
            </button>

            <button
              class="hidden sm:inline rounded-full bg-white/10 px-2 py-1 text-white transition hover:bg-white/20"
              v-if="!formVisible"
              @click.prevent="skipVideo"
            >
              Пропустить
            </button>
          </div>
        </div>

        <!-- Большая кастомная кнопка запуска, если автоплей не удался -->
      

        <!-- CTA (мобилки) -->
        <div
          v-if="props.showInlineCtas && !formVisible"
          class="absolute bottom-4 left-3 right-3 z-10 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3 md:bottom-6 md:right-6"
        >
          <button
            class="rounded-xl bg-gradient-to-r from-cyan-400/90 to-indigo-400/90 px-4 py-2 text-sm font-semibold text-black shadow-lg ring-1 ring-white/10 transition hover:from-cyan-300 hover:to-indigo-300 active:scale-[0.99]"
            @click="playFromStartTurbo"
          >
            Заказать консультацию
          </button>
        </div>
      </div>

      <!-- Форма поверх последнего кадра -->
      <transition name="zoom-fade" appear>
        <div
          v-if="formVisible"
          class="absolute inset-0 flex items-center justify-center px-3 sm:px-4"
        >
          <form
            @submit="onSubmit"
            class="relative w-full max-w-md rounded-2xl border border-white/15 bg-black/35 p-5 shadow-2xl backdrop-blur-md sm:p-6"
          >
            <!-- Закрыть -->
            <button
              type="button"
              class="absolute right-2 top-2 rounded-md p-2 text-white/80 hover:bg-white/10 active:scale-[0.98]"
              aria-label="Закрыть форму"
              @click="closeForm"
            >
              ✕
            </button>

            <h3 class="mb-3 pr-8 text-center text-lg font-semibold tracking-tight text-white sm:mb-4 sm:text-xl">
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
                placeholder="+7 999 999 99 99"
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
              {{ submitting ? "Отправляем..." : "Отправить" }}
            </button>

            <p class="mt-3 text-center text-[11px] text-white/60 sm:text-xs">
              Видео остаётся на последнем кадре, чтобы сохранить композицию и не отвлекать внимание.
            </p>
          </form>
        </div>
      </transition>
    </div>
  </section>
</template>

<style scoped>
/* Анимация формы */
.zoom-fade-enter-active, .zoom-fade-leave-active {
  transition: opacity 320ms ease, transform 320ms ease;
}
.zoom-fade-enter-from, .zoom-fade-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(6px);
}

/* Жёстко прячем любые нативные контролы у видео */
video::-webkit-media-controls-enclosure,
video::-webkit-media-controls,
video::-webkit-media-controls-panel,
video::-webkit-media-controls-play-button,
video::-webkit-media-controls-volume-slider,
video::-webkit-media-controls-timeline,
video::-webkit-media-controls-current-time-display,
video::-webkit-media-controls-time-remaining-display,
video::-webkit-media-controls-fullscreen-button,
video::-webkit-media-controls-mute-button {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  -webkit-appearance: none !important;
}

/* Без лишних полос прокрутки внутри */
section, .sticky, video {
  overflow: clip;
}

/* Убираем tap highlight на мобильных */
button { -webkit-tap-highlight-color: transparent; }
</style>
