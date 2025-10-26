<!-- src/components/ProjectsIKB.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"

type Stage = "Концепт" | "Макет" | "Прототип" | "MVP"
type Project = { id: number; name: string; desc: string; stage: Stage }

const projects: Project[] = [
  { id: 1, name: "УДОТ v.1", desc: "Свободно программируемое устройство: цифровые/аналоговые входы, управление нагрузкой, RS-485/DALI, питание 9–230 В.", stage: "Прототип" },
  { id: 2, name: "УДОТ v.2", desc: "Контроллер гидрораспределителей спецтехники, цифровые/аналоговые входы, RS-485, питание 9–40 В.", stage: "Прототип" },
  { id: 3, name: "МЁБИУС", desc: "Бесконтактное ёмкостное управление, скрытая установка. Патент RU68221.", stage: "MVP" },
  { id: 4, name: "АВИС", desc: "Блок управления приводом ячейки КРУ(Э), автономные операции и дистанционный контроль.", stage: "Макет" },
  { id: 5, name: "Конвертор Type-C", desc: "Преобразователь USB-C в RS-485/RS-232 и др.", stage: "Концепт" },
  { id: 6, name: "Мобильное электричество", desc: "Прицеп-генератор для длительной автономной генерации энергии в поле.", stage: "MVP" },
  { id: 7, name: "Автономный посёлок", desc: "Локальная энергосеть коттеджей (эффективно от 50 домов).", stage: "Концепт" },
  { id: 8, name: "ИнтеРОС", desc: "Модульная система «Умного дома» с адаптацией под привычки.", stage: "MVP" },
  { id: 9, name: "Свет без выключателей", desc: "Полная автоматика освещения с интеллектуальной подстройкой.", stage: "Прототип" },
  { id: 10, name: "Световая волна", desc: "Освещение протяжённых участков по волновому принципу.", stage: "MVP" },
  { id: 11, name: "Дом без электричества", desc: "Автономная солнечная установка, работает с 2012 года.", stage: "MVP" },
  { id: 12, name: "Подводный пейджер", desc: "Поиск и связь с водолазами под водой.", stage: "Макет" },
  { id: 13, name: "СИНУС", desc: "Диммируемая LED-лампа, совместима с патроном галогенок.", stage: "Прототип" },
  { id: 14, name: "ДиВО", desc: "Дистанционное управление подсветкой рекламных конструкций.", stage: "Прототип" },
  { id: 15, name: "Эмоциональное освещение", desc: "Режимы света по эмоциям (без ИИ).", stage: "Концепт" },
  { id: 16, name: "Мобильный офис", desc: "Вагон-прицеп для автономной работы/проживания.", stage: "Концепт" },
  { id: 17, name: "StarWire", desc: "Безопасный удлинитель: контроль температуры/нагрузки, автоотключение.", stage: "Прототип" },
  { id: 18, name: "Birch-Lamp", desc: "Сенсорный светильник с «пламенем свечи», гасится дуновением.", stage: "MVP" },
  { id: 19, name: "Million Lamp", desc: "Подвесной светильник из 1400 LED, управление ИК-пультом.", stage: "MVP" },
  { id: 20, name: "ТУМБЛЕР", desc: "Открытая АСУ ТП нового поколения.", stage: "Концепт" },
]

/** Появление секции */
const containerEl = ref<HTMLElement | null>(null)
const visible = ref(false)
let observer: IntersectionObserver | null = null

const activate = () => {
  if (visible.value) return
  visible.value = true
  observer?.disconnect()
  observer = null
}

const registerObserver = () => {
  if (visible.value) return
  if (typeof IntersectionObserver === "undefined") {
    activate()
    return
  }
  const el = containerEl.value
  if (!el) return

  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activate()
        }
      })
    },
    { threshold: 0.25, rootMargin: "0px 0px -10% 0px" },
  )
  observer.observe(el)
}

onMounted(() => {
  const prefersReduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
  if (prefersReduced) {
    visible.value = true
    return
  }
  if (containerEl.value) {
    registerObserver()
  } else {
    requestAnimationFrame(registerObserver)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

/** Фильтр, поиск, сортировка */
const ALL: Stage[] = ["Концепт", "Макет", "Прототип", "MVP"]
const active = ref<Set<Stage>>(new Set<Stage>(["Концепт"])) // по умолчанию — только «Концепт», чтобы меньше карточек
const q = ref("")
const sortKey = ref<"title" | "stage">("stage")

const toggleStage = (s: Stage) => {
  if (active.value.has(s)) active.value.delete(s)
  else active.value.add(s)
  active.value = new Set(active.value)
}
const clearFilters = () => { active.value = new Set(); q.value = "" }

const counts = computed(() => {
  const c: Record<Stage, number> = { Концепт: 0, Макет: 0, Прототип: 0, MVP: 0 }
  for (const p of projects) c[p.stage]++
  return c
})

const filtered = computed(() => {
  const hasFilter = active.value.size > 0
  const byStage = hasFilter ? projects.filter(p => active.value.has(p.stage)) : projects
  const text = q.value.trim().toLowerCase()
  const byText = text
    ? byStage.filter(p => (p.name + " " + p.desc).toLowerCase().includes(text))
    : byStage

  const rank: Record<Stage, number> = { Концепт: 1, Макет: 2, Прототип: 3, MVP: 4 }
  if (sortKey.value === "stage") {
    return [...byText].sort((a, b) => rank[b.stage] - rank[a.stage] || a.name.localeCompare(b.name))
  } else {
    return [...byText].sort((a, b) => a.name.localeCompare(b.name))
  }
})
</script>

<template>
  <section
    ref="containerEl"
    id="projects-ikb"
    class="page-section relative overflow-hidden px-4 md:px-8 lg:px-12"
    :class="visible ? 'animate-in opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
  >
    <!-- те же неоновые подсветки, что в AboutIKB -->
    <div
      class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
      style="background: radial-gradient(0% 60% at 50% 50%, #060A19, transparent)"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full blur-3xl"
      style="background: radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.15), transparent)"
    ></div>

    <div class="relative z-10 mx-auto max-w-6xl">
      <!-- Шапка секции -->
      <div class="mb-8 text-center">
        <p class="mb-2 text-[12px] uppercase tracking-[0.3em] text-teal-300/80">
          ИКБ — Инновационность • Конфиденциальность • Безопасность
        </p>
        <h2 class="text-3xl md:text-5xl font-semibold leading-tight">
          <span class="bg-gradient-to-r from-teal-300 via-cyan-200 to-white bg-clip-text text-transparent">
            РЕШЕНИЯ И ПРОЕКТЫ
          </span>
        </h2>
        <p class="mx-auto mt-3 max-w-3xl text-slate-300/80">
          Контрактная разработка и ОКР. Каталог R&amp;D-инициатив от концепта до MVP с упором на надёжность,
          отказоустойчивость и инженерную элегантность.
        </p>
      </div>

      <!-- Панель управления -->
      <div class="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <!-- Сегментированный фильтр -->
        <div class="flex w-full flex-wrap items-center gap-2">
          <div class="segmented rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur">
            <button
              v-for="s in ALL"
              :key="s"
              @click="toggleStage(s)"
              class="seg-btn"
              :class="active.has(s) ? 'seg-active' : ''"
            >
              <span class="inline-flex items-center gap-1">
                <span class="h-2 w-2 rounded-full"
                  :class="{
                    'bg-rose-300/90 shadow-[0_0_10px] shadow-rose-400/40': s==='Концепт',
                    'bg-amber-300/90 shadow-[0_0_10px] shadow-amber-400/40': s==='Макет',
                    'bg-cyan-300/90  shadow-[0_0_10px] shadow-cyan-400/40' : s==='Прототип',
                    'bg-emerald-300/90 shadow-[0_0_10px] shadow-emerald-400/40': s==='MVP',
                  }"></span>
                <span class="uppercase tracking-[0.2em] text-[11px]">{{ s }}</span>
                <span class="ml-1 rounded-md border border-white/15 px-1.5 text-[10px] opacity-80">{{ counts[s] }}</span>
              </span>
            </button>
          </div>

          <button
            v-if="active.size || q"
            @click="clearFilters"
            class="ml-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300/80 hover:text-rose-300 hover:border-rose-400/40 transition"
          >
            Сбросить
          </button>
        </div>

        <!-- Поиск и сортировка -->
        <div class="flex w-full items-center gap-2 md:w-auto">
          <div class="relative grow md:grow-0">
            <input
              v-model="q"
              type="text"
              placeholder="Поиск по названию или описанию…"
              class="w-full md:w-72 rounded-xl border border-white/10 bg-white/5 px-3 py-2 pr-10 text-sm text-white placeholder:text-white/40 outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
            />
            <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">⌕</span>
          </div>

          <select
            v-model="sortKey"
            class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
          >
            <option value="stage">Сначала зрелые</option>
            <option value="title">По алфавиту</option>
          </select>
        </div>
      </div>

      <!-- Сетка карточек -->
      <transition-group
        name="gridfade"
        tag="div"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
      >
        <article
          v-for="p in filtered"
          :key="p.id"
          class="panel group relative rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-transform duration-300 hover:-translate-y-0.5"
        >
          <!-- градиентный бордер-свет -->
          <div class="panel-glow pointer-events-none absolute inset-0 rounded-2xl"></div>

          <div class="flex items-start justify-between gap-3">
            <h3 class="text-base font-semibold text-white group-hover:text-teal-200 transition">
              {{ p.name }}
            </h3>
            <span
              class="stage-badge"
              :class="{
                'stage-concept': p.stage==='Концепт',
                'stage-maket': p.stage==='Макет',
                'stage-proto': p.stage==='Прототип',
                'stage-mvp'  : p.stage==='MVP',
              }"
            >{{ p.stage }}</span>
          </div>

          <p class="mt-2 text-sm leading-snug text-slate-300/85">
            {{ p.desc }}
          </p>
        </article>
      </transition-group>

      <div
        v-if="filtered.length === 0"
        class="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-300/80"
      >
        Ничего не найдено. Попробуй изменить фильтры или запрос.
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ==== ФОН — как у AboutIKB, направление сверху вниз ==== */
#projects-ikb {
  position: relative;
}

/* Неоновые пятна (как в AboutIKB) */
#projects-ikb > .pointer-events-none { z-index: 0; }

/* Плавное появление секции */
.animate-in { transition: all .9s cubic-bezier(.22,.61,.36,1); }
@media (prefers-reduced-motion: reduce) {
  .animate-in { transition: none !important; }
}


/* Сегментированный фильтр */
.segmented {
  display: inline-flex;
  gap: 2px;
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.06),
    0 4px 20px rgba(0,0,0,.25);
}
.seg-btn {
  position: relative;
  padding: .5rem .75rem;
  border-radius: 0.9rem;
  color: rgba(255,255,255,.8);
  transition: all .25s ease;
  border: 1px solid transparent;
}
.seg-btn:hover { color: #ccfbf1; }
.seg-active {
  color: #d1fffb;
  background: linear-gradient(180deg, rgba(20,184,166,.18), rgba(20,184,166,.05));
  border-color: rgba(45,212,191,.45);
  box-shadow:
    inset 0 0 0 999px rgba(255,255,255,.02),
    0 0 24px rgba(20,184,166,.25);
}

/* Карточка с «стеклянным» градиентным бордером и мягким свечением */
.panel {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.025));
}
.panel:before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  padding: 1px;
  background: linear-gradient(140deg,
    rgba(20,184,166,.45),
    rgba(56,189,248,.35),
    rgba(255,255,255,.18) 70%,
    rgba(20,184,166,.25));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  pointer-events: none;
}
.panel-glow {
  background:
    radial-gradient(120px 60px at right -20px top -20px, rgba(20,184,166,.18), transparent 60%),
    radial-gradient(140px 80px at left -20px bottom -20px, rgba(56,189,248,.16), transparent 60%);
  filter: blur(0.5px);
}

/* Бейдж стадии */
.stage-badge {
  font-size: 10.5px;
  letter-spacing: .18em;
  text-transform: uppercase;
  padding: .35rem .55rem;
  border-radius: .6rem;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.85);
  white-space: nowrap;
}
.stage-concept  { border-color: rgba(244,63,94,.45);  color: rgba(252,165,165,.95); box-shadow: 0 0 22px rgba(244,63,94,.20) inset; }
.stage-maket    { border-color: rgba(251,191,36,.45); color: rgba(254,215,170,.95); box-shadow: 0 0 22px rgba(251,191,36,.20) inset; }
.stage-proto    { border-color: rgba(34,211,238,.45); color: rgba(165,243,252,.95); box-shadow: 0 0 22px rgba(34,211,238,.22) inset; }
.stage-mvp      { border-color: rgba(16,185,129,.45); color: rgba(167,243,208,.95); box-shadow: 0 0 22px rgba(16,185,129,.22) inset; }

/* Анимация карточек при фильтрации */
.gridfade-enter-active, .gridfade-leave-active {
  transition: all 240ms ease, opacity 240ms ease, transform 240ms ease;
}
.gridfade-enter-from, .gridfade-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(.985);
}

/* Фокус-кольца */
:focus-visible {
  outline: 2px solid rgba(45,212,191,.6);
  outline-offset: 2px;
  border-radius: .8rem;
}

/* На совсем узких экранах делаем чуть более компактные карточки */
@media (max-width: 640px) {
  .seg-btn { padding: .45rem .6rem; }
}
</style>

