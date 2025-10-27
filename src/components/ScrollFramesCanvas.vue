<!-- src/components/VideoRevealForm.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"

type Props = {
  src?: string
  poster?: string
  /** Базовая скорость проигрывания */
  baseRate?: number
  /** Турбо-скорость при нажатии "Открыть форму" */
  turboRate?: number
  /** Базовая длина секции в vh для десктопа */
  desktopVH?: number
  /** Длина для планшета */
  tabletVH?: number
  /** Длина для мобилки */
  mobileVH?: number
}

const props = withDefaults(defineProps<Props>(), {
  src: "/robot.mp4",
  poster: "",
  baseRate: 1.25,
  turboRate: 1.9,
  desktopVH: 200,
  tabletVH: 170,
  mobileVH: 150,
})

const emit = defineEmits<{
  (e: "submit", payload: { name: string; email: string; phone: string }): void
}>()

const containerEl = ref<HTMLElement | null>(null)
const stickyEl = ref<HTMLElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)

const playing = ref(false)
const playedOnce = ref(false)
const formVisible = ref(false)
const showControls = ref(false)
const turboActive = ref(false)

/** динамическая высота секции по брейкпоинтам */
const sectionVH = ref<number>(props.desktopVH)
function recalcVH() {
  const w = typeof window !== "undefined" ? window.innerWidth : 1280
  sectionVH.value = w < 640 ? props.mobileVH : w < 1024 ? props.tabletVH : props.desktopVH
}

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

/** ——— управление формой ——— */
function openFormTurbo() {
  formVisible.value = true
  turboActive.value = true
  setPlaybackRate(props.turboRate)
  tryPlay()
}
function openFormSoft() {
  formVisible.value = true
}
function closeForm() {
  formVisible.value = false
  turboActive.value = false
  if (!frozen) setPlaybackRate(props.baseRate)
}

/** ——— заморозка на последнем кадре ——— */
let freezeAt = 0
let frozen = false

function onLoadedMetadata() {
  const v = videoEl.value
  if (!v) return
  freezeAt = Math.max(0, (v.duration ?? 0) - 0.04)
  frozen = false
  setPlaybackRate(props.baseRate)
}

function onTimeUpdate() {
  const v = videoEl.value
  if (!v) return
  if (!frozen && freezeAt > 0 && v.currentTime >= freezeAt) {
    v.pause()
    try { v.currentTime = freezeAt } catch {}
    frozen = true
    playedOnce.value = true
    formVisible.value = true
    playing.value = false
  }
}

function onError() {
  formVisible.value = true
}

function setPlaybackRate(rate: number) {
  const v = videoEl.value
  if (!v) return
  v.playbackRate = Math.max(0.1, rate || 1.0)
}

async function tryPlay() {
  const v = videoEl.value
  if (!v) return
  // если уже заморожено — не стартуем
  if (playedOnce.value && frozen) return
  try {
    v.muted = true
    showControls.value = false
    playing.value = true
    await v.play()
  } catch {
    showControls.value = true
    playing.value = false
  }
}

/** Полный сброс для повторного проигрывания при возвращении к секции */
function resetForReplay() {
  const v = videoEl.value
  formVisible.value = false
  turboActive.value = false
  playedOnce.value = false
  frozen = false
  freezeAt = 0
  if (v) {
    try { v.pause() } catch {}
    try { v.currentTime = 0 } catch {}
    setPlaybackRate(props.baseRate)
  }
  playing.value = false
  // стартуем заново
  tryPlay()
}

/** наблюдаем вход/выход секции и перезапускаем видео при повторном входе */
let io: IntersectionObserver | null = null
let inView = false
let wasOut = true // чтобы отличать "возвращение"

function handleIO(entries: IntersectionObserverEntry[]) {
  const e = entries[0]
  const nowInView = !!e?.isIntersecting && e.intersectionRatio >= 0.6
  if (nowInView && (!inView || wasOut)) {
    // вернулись к секции — перезапуск
    resetForReplay()
    wasOut = false
  } else if (!nowInView && inView) {
    // ушли от секции — отметим, что вышли
    wasOut = true
  }
  inView = nowInView
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && formVisible.value) closeForm()
}

onMounted(() => {
  recalcVH()
  window.addEventListener("resize", recalcVH, { passive: true })

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  if (prefersReduced) {
    formVisible.value = true
  } else {
    if (stickyEl.value) {
      io = new IntersectionObserver(handleIO, {
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
      })
      io.observe(stickyEl.value)
    }
    // первый старт, если компонент уже в зоне видимости
    requestAnimationFrame(() => tryPlay())
  }

  window.addEventListener("keydown", onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", recalcVH)
  if (io && stickyEl.value) io.unobserve(stickyEl.value)
  window.removeEventListener("keydown", onKeydown)
})

/** ручной запуск при блокировке автоплея */
async function manualPlay() {
  const v = videoEl.value
  if (!v) return
  try {
    showControls.value = false
    playing.value = true
    await v.play()
  } catch {
    formVisible.value = true
  }
}

/** мгновенно к финалу */
function skipVideo() {
  const v = videoEl.value
  if (v) {
    if (freezeAt <= 0 && v.duration) freezeAt = Math.max(0, v.duration - 0.04)
    try { v.currentTime = freezeAt || v.duration - 0.04 } catch {}
    v.pause()
  }
  frozen = true
  playedOnce.value = true
  formVisible.value = true
  playing.value = false
}
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
      <!-- Фоновое видео (остаётся на последнем кадре; форма поверх) -->
      <div class="absolute inset-0">
        <video
          ref="videoEl"
          :src="src"
          :poster="poster || undefined"
          preload="metadata"
          playsinline
          webkit-playsinline
          muted
          :controls="showControls"
          disablepictureinpicture
          controlslist="nodownload noplaybackrate noremoteplayback"
          class="h-full w-full object-cover"
          @loadedmetadata="onLoadedMetadata"
          @timeupdate="onTimeUpdate"
          @error="onError"
        />

        <!-- Верхняя панель статуса/кнопок (лёгкая, не перегружает) -->
        <div class="pointer-events-none absolute inset-x-0 top-3 sm:top-4 z-10 flex justify-center">
          <div
            class="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur sm:text-xs"
          >
            <span v-if="!formVisible && !playing && !showControls">Готовим видео…</span>
            <span v-else-if="playing && !formVisible">
              Воспроизведение ×{{ (videoEl?.playbackRate || 1).toFixed(2) }}
            </span>
            <span v-else-if="formVisible && !frozen">Форма открыта • видео идёт</span>
            <span v-else-if="formVisible && frozen">Видео завершено</span>
            <span v-else>Автовоспроизведение недоступно</span>

            <span class="hidden sm:inline text-white/40">•</span>

            <button
              class="hidden sm:inline rounded-full bg-white/10 px-2 py-1 text-white transition hover:bg-white/20"
              v-if="showControls && !playing && !formVisible"
              @click.prevent="manualPlay"
            >
              Запустить
            </button>

            <button
              class="hidden sm:inline rounded-full bg-white/10 px-2 py-1 text-white transition hover:bg-white/20"
              v-if="!formVisible && !frozen"
              @click.prevent="openFormSoft"
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

        <!-- Плавающая кнопка "Открыть форму" (крупная для мобилок) -->
        <div class="absolute bottom-4 right-3 z-10 sm:bottom-5 sm:right-4 md:bottom-6 md:right-6">
          <button
            class="rounded-full bg-black/55 px-4 py-2 text-xs font-semibold text-white backdrop-blur-lg ring-1 ring-white/15 shadow-lg transition hover:bg-black/65 active:scale-[0.99] sm:text-sm"
            @click="openFormTurbo"
          >
            Открыть форму (×{{ turboRate.toFixed(1) }})
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
              <label class="mb-1 block text-xs text-white/80 sm:text-sm">Телефон</label>
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
.zoom-fade-enter-active, .zoom-fade-leave-active {
  transition: opacity 320ms ease, transform 320ms ease;
}
.zoom-fade-enter-from, .zoom-fade-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(6px);
}

section, .sticky {
  overflow: clip;
}

/* Тап-хайлайт убираем — приятнее на мобилке */
button { -webkit-tap-highlight-color: transparent; }
</style>
