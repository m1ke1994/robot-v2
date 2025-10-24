<!-- src/components/CertsGallery.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue"


type Cert = {
  src: string
  title: string
  issuer?: string
  year?: string | number
  alt?: string
}

const props = withDefaults(defineProps<{
  items?: Cert[]
  initialVisible?: number
}>(), {
  items: () => ([
    {
      src: '/certs/cert-2.jpg',
      title: "Диплом за участие в выставке SPS/IPC/DRIVES",
      issuer: "Департамент науки, промышленной политики и предпринимательства г. Москвы",
      year: "2012",
      alt: "Диплом Ф-Байт SPS/IPC/DRIVES 2012"
    },
    {
      src: '/certs/cert-1.jpg',
      title: "Отзыв о работе энергосберегающей продукции",
      issuer: "ОАО «Автодизель» (ЯМЗ, Группа ГАЗ)",
      year: "2011",
      alt: "Письмо-отзыв Автодизель (ЯМЗ)"
    },
    {
      src: '/certs/cert-3.jpg',
      title: "Сертификат соответствия ГОСТ Р (МЁБИУС)",
      issuer: "ГОССТАНДАРТ России / СЕРТИНФО",
      year: "2009–2012",
      alt: "Сертификат ГОСТ Р МЁБИУС"
    },
    {
      src: '/certs/cert-4.jpg',
      title: "IN’HUB 2022 — Бронзовая медаль",
      issuer: "Международный форум инноваторов IN’HUB",
      year: "2022",
      alt: "Диплом IN’HUB 2022 бронзовая медаль"
    }
  ]),
  initialVisible: 8
})

const all = ref<Cert[]>(props.items)
watch(() => props.items, v => { all.value = v || [] })

const showAll = ref(false)
const visible = computed(() => showAll.value ? all.value : all.value.slice(0, props.initialVisible))

const isOpen = ref(false)
const index = ref(0)
const current = computed(() => visible.value[index.value] ?? visible.value[0])

function open(i = 0) {
  index.value = i
  isOpen.value = true
  lockScroll(true)
}
function close() {
  isOpen.value = false
  lockScroll(false)
}
function next() { index.value = (index.value + 1) % visible.value.length }
function prev() { index.value = (index.value - 1 + visible.value.length) % visible.value.length }

function onKey(e: KeyboardEvent) {
  if (!isOpen.value) return
  if (e.key === "Escape") close()
  if (e.key === "ArrowRight") next()
  if (e.key === "ArrowLeft") prev()
}
let touchX = 0
function onTouchStart(e: TouchEvent) { touchX = e.touches[0].clientX }
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchX
  if (Math.abs(dx) < 40) return
  dx < 0 ? next() : prev()
}
onMounted(() => window.addEventListener("keydown", onKey))
onBeforeUnmount(() => window.removeEventListener("keydown", onKey))

function lockScroll(state: boolean) {
  document.documentElement.style.overflow = state ? "hidden" : ""
}
</script>

<template>
  <section id="certs" class="relative py-16 px-4 md:px-8 lg:px-12 overflow-hidden">
    <!-- мягкое фоновое свечение -->
    <div
      class="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full blur-3xl opacity-25"
      style="background: radial-gradient(40% 40% at 50% 50%, rgba(34,211,238,0.2), transparent)"
    ></div>

    <div class="relative z-10 mx-auto max-w-6xl text-slate-100">
      <header class="mb-10 text-center">
        <h2 class="text-3xl font-bold md:text-4xl tracking-tight">
          Сертификаты и признание
        </h2>
        <p class="mt-4 text-base text-slate-300 md:text-lg leading-relaxed max-w-3xl mx-auto">
          За годы работы наши разработки получили официальное признание в области промышленной
          автоматизации и энергоэффективных технологий. Сертификаты и дипломы подтверждают высокий
          уровень инженерных решений, соответствие стандартам ГОСТ&nbsp;Р и международное признание
          инноваций — от участия в выставках в Германии до наград форумов инноваторов.
        </p>
      </header>

      <!-- сетка -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" role="list">
        <article
          v-for="(item, i) in visible"
          :key="item.src + i"
          class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur
                 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,0,0,.35)]"
        >
          <button type="button" class="block w-full text-left focus:outline-none" @click="open(i)">
            <div class="aspect-[4/3] overflow-hidden rounded-xl bg-slate-900/40">
              <img
                :src="item.src"
                :alt="item.alt || item.title"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div class="mt-3 px-1">
              <h3 class="text-[13px] font-medium text-slate-100 line-clamp-2">{{ item.title }}</h3>
              <p class="mt-1 text-[11px] text-slate-400 line-clamp-2">
                {{ item.issuer }}<span v-if="item.year"> • {{ item.year }}</span>
              </p>
            </div>
            <span
              class="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full
                     bg-white/10 px-2 py-1 text-[10px] font-semibold text-slate-100 backdrop-blur
                     transition-opacity duration-300 group-hover:opacity-100 opacity-90"
            >
              Просмотр
            </span>
          </button>
        </article>
      </div>

      <!-- кнопка -->
      <div class="mt-8 flex justify-center">
        <button
          v-if="all.length > visible.length"
          type="button"
          class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
          @click="showAll = true"
        >
          Показать все ({{ all.length }})
        </button>
        <button
          v-else-if="all.length > props.initialVisible"
          type="button"
          class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
          @click="showAll = false"
        >
          Свернуть
        </button>
      </div>
    </div>

    <!-- Лайтбокс -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur"
      @click.self="close"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <div class="relative w-full max-w-[92vw] max-h-[92vh]">
        <button
          type="button"
          class="absolute right-3 top-3 z-10 rounded-full bg-white/10 px-3 py-2 text-sm text-slate-100 hover:bg-white/20"
          @click="close"
        >✕</button>

        <img
          :src="current?.src"
          :alt="current?.alt || current?.title"
          class="h-[80vh] w-full rounded-xl bg-slate-900/60 p-2 object-contain shadow-2xl"
        />

        <div class="mt-3 text-center text-sm text-slate-300">
          <div class="font-medium">{{ current?.title }}</div>
          <div class="text-xs text-slate-400">{{ current?.issuer }}<span v-if="current?.year"> • {{ current?.year }}</span></div>
        </div>

        <button
          type="button"
          class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-slate-100 hover:bg-white/20"
          @click.stop="prev"
        >‹</button>
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-slate-100 hover:bg-white/20"
          @click.stop="next"
        >›</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
article::after {
  content:"";
  position:absolute; inset:0;
  pointer-events:none;
  background: radial-gradient(40% 40% at 80% 0%, rgba(34,211,238,.12), transparent 60%);
  opacity:0; transition:opacity .35s ease;
}
article:hover::after { opacity:1; }
</style>
