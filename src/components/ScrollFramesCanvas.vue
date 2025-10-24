<!-- src/components/ScrollSprite.vue -->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed } from "vue"

type Props = {
  /** Папка с кадрами, как в public: /frames/ikb_hero */
  basePath: string
  /** Кол-во кадров, например 204 */
  frameCount: number
  /** Кол-во цифр в имени: frame_0001.webp -> digits=4 */
  digits?: number
  /** Имя без номера и расширения: "frame_" */
  basename?: string
  /** Расширение без точки: webp|jpg|png */
  ext?: "webp" | "jpg" | "png"
  /** Высота секции в вьюпорт-единицах: 300 => 300vh (длина прокрутки) */
  durationVH?: number
  /** Первый кадр (1-based) */
  startFrame?: number
  /** Последний кадр (1-based, inclusive) */
  endFrame?: number
  /** Сколько кадров предзагружаем «жадно» сразу */
  eagerPreload?: number
  /** Мягкость интерполяции (0..1), 0 — мгновенно, 0.15 — мягко */
  lerp?: number
}

const props = withDefaults(defineProps<Props>(), {
  digits: 4,
  basename: "frame_",
  ext: "webp",
  durationVH: 300,
  startFrame: 1,
  endFrame: undefined, // подставим frameCount
  eagerPreload: 24,
  lerp: 0.15,
})

/** canvas и 2d контекст */
const canvasEl = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

/** DPR-масштабирование для чёткой отрисовки */
const dpr = Math.min(window.devicePixelRatio || 1, 2)

/** Набор кадров (ленивая загрузка через fetch + createImageBitmap) */
const bitmaps: (ImageBitmap | undefined)[] = []

/** Активность — рисуем RAF только когда секция реально видна */
const isActive = ref(false)

/** Текущий и целевой кадр: current плавно догоняет target для анти-дёргания */
const currentFrame = ref(props.startFrame)
const targetFrame = ref(props.startFrame)

/** Рассчитываем реальную последнюю рамку */
const lastFrame = computed(() => props.endFrame ?? props.frameCount)

/** Помощник: формируем URL кадра */
function frameUrl(idx: number) {
  const n = String(idx).padStart(props.digits, "0")
  return `${props.basePath.replace(/\/$/, "")}/${props.basename}${n}.${props.ext}`
}

/** Загрузка кадра в память (ImageBitmap) */
async function loadFrame(idx: number): Promise<ImageBitmap | undefined> {
  if (bitmaps[idx]) return bitmaps[idx]
  try {
    const res = await fetch(frameUrl(idx), { cache: "force-cache" })
    if (!res.ok) return
    const blob = await res.blob()
    // createImageBitmap быстрее и экономнее, чем <img>.decode()
    const bmp = await createImageBitmap(blob)
    bitmaps[idx] = bmp
    return bmp
  } catch {
    // игнорируем сетевые огрехи; кадр подтянется при следующей попытке
    return
  }
}

/** Жадно предзагружаем первые N кадров, чтобы старт был без «белых» кадров */
async function eagerPreload() {
  const first = Math.max(props.startFrame, 1)
  const last = Math.min(lastFrame.value, first + props.eagerPreload - 1)
  const tasks: Promise<any>[] = []
  for (let i = first; i <= last; i++) tasks.push(loadFrame(i))
  await Promise.all(tasks)
}

/** Остальные кадры догружаем «в простое» (idle), маленькими порциями */
function lazyWarmup() {
  const idle = (window as any).requestIdleCallback as
    | ((cb: (deadline: any) => void, opts?: any) => number)
    | undefined

  const CHUNK = 16 // шажок за раз
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

/** Масштабируем canvas под размер и DPR */
function resizeCanvas() {
  if (!canvasEl.value) return
  const rect = canvasEl.value.getBoundingClientRect()
  const w = Math.max(1, Math.round(rect.width))
  const h = Math.max(1, Math.round(rect.height))
  canvasEl.value.width = Math.round(w * dpr)
  canvasEl.value.height = Math.round(h * dpr)
  // Визуальные (CSS) размеры оставляем как есть
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

/** Рисуем кадр на весь canvas с cover-вписыванием */
function drawFrame(idx: number) {
  if (!ctx || !canvasEl.value) return
  const bmp = bitmaps[idx]
  if (!bmp) return // кадр еще грузится — следующий RAF попробует снова

  const cw = canvasEl.value.width / dpr
  const ch = canvasEl.value.height / dpr
  const iw = bmp.width
  const ih = bmp.height

  // cover: масштаб так, чтобы заполнить всё, с кадрированием
  const scale = Math.max(cw / iw, ch / ih)
  const dw = iw * scale
  const dh = ih * scale
  const dx = (cw - dw) / 2
  const dy = (ch - dh) / 2

  ctx.clearRect(0, 0, cw, ch)
  ctx.drawImage(bmp, dx, dy, dw, dh)
}

/** Основной RAF-цикл: плавно приближаем current к target */
let rafId = 0
function loop() {
  if (!isActive.value) return
  // плавная интерполяция кадра
  const cf = currentFrame.value
  const tf = targetFrame.value
  const next = cf + (tf - cf) * props.lerp
  // округляем в ближайший кадр, но не прыгаем чрезмерно
  const snapped = Math.round(next)
  if (snapped !== cf) {
    drawFrame(snapped)
    currentFrame.value = snapped
  }
  rafId = requestAnimationFrame(loop)
}

/** Сопоставляем прокрутку с кадром */
const containerEl = ref<HTMLElement | null>(null)
const stickyEl = ref<HTMLElement | null>(null)

function onScroll() {
  if (!containerEl.value) return
  const rect = containerEl.value.getBoundingClientRect()
  const vh = window.innerHeight

  // прогресс: 0 в начале секции, 1 — в конце
  const total = rect.height - vh
  if (total <= 0) return
  const p = Math.min(1, Math.max(0, (vh - rect.top) / total))

  const start = props.startFrame
  const end = lastFrame.value
  const idx = Math.round(start + p * (end - start))
  targetFrame.value = Math.min(end, Math.max(start, idx))
}

/** Активируем RAF только когда sticky-блок виден */
let io: IntersectionObserver | null = null

onMounted(async () => {
  ctx = canvasEl.value?.getContext("2d") ?? null
  resizeCanvas()
  window.addEventListener("resize", resizeCanvas, { passive: true })
  window.addEventListener("scroll", onScroll, { passive: true })

  await eagerPreload()
  // первый кадр на холст — сразу, чтобы не мигало
  drawFrame(props.startFrame)

  // ленивое фоновое догревание кадров
  lazyWarmup()

  // intersection watcher
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
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeCanvas)
  window.removeEventListener("scroll", onScroll)
  if (io && stickyEl.value) io.unobserve(stickyEl.value)
  if (rafId) cancelAnimationFrame(rafId)
  // чистим битмапы
  bitmaps.forEach((b) => b && b.close && b.close())
})
</script>

<template>
  <!--
    Контейнер делает длинную «дорожку» для прокрутки (durationVH),
    а сам canvas «приклеен» (sticky) и рисует кадры.
  -->
  <section
    ref="containerEl"
    class="relative w-full"
    :style="{ height: `${durationVH}vh` }"
  >
    <div
      ref="stickyEl"
      class="sticky top-0 h-[100vh] w-full"
      style="contain: strict"
    >
      <canvas
        ref="canvasEl"
        class="block h-full w-full"
        aria-label="Scroll-driven animation"
      />
    </div>
  </section>
</template>

<style scoped>
/* Небольшая защита от layout-дерганий */
:host, section, canvas {
  touch-action: pan-y;
  -webkit-user-select: none;
  user-select: none;
}
</style>
