<!-- src/components/ProjectsIKB.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"

type Stage = "Концепт" | "Макет" | "Прототип" | "MVP"
type Project = { id: number; name: string; desc: string; stage: Stage }

const projects: Project[] = [
  { id: 1, name: "УДОТ v.1", desc: "Свободно программируемое устройство: цифровые/аналоговые входы, управление нагрузкой, RS-485/DALI, питание 9–230 В.", stage: "Прототип" },
  { id: 2, name: "УДОТ v.2", desc: "Контроллер гидрорozпределителей спецтехники, цифровые/аналоговые входы, RS-485, питание 9–40 В.", stage: "Прототип" },
  { id: 3, name: "МЁБИУС", desc: "Бесконтактное ёмкостное управление, возможна скрытая установка. Патент RU68221.", stage: "MVP" },
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
  { id: 19, name: "Million Lamp", desc: "Подвесной светильник из 1400 LED, управление любым ИК-пультом.", stage: "MVP" },
  { id: 20, name: "ТУМБЛЕР", desc: "Открытая АСУ ТП нового поколения.", stage: "Концепт" },
]

// —— ВИЗИБИЛИТИ-Анимация секции
const visible = ref(false)
const onScroll = () => {
  const el = document.getElementById("projects-ikb")
  if (!el) return
  const r = el.getBoundingClientRect()
  if (r.top < window.innerHeight * 0.7) {
    visible.value = true
    window.removeEventListener("scroll", onScroll)
  }
}
onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true })
  requestAnimationFrame(onScroll)
})
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll))

// —— ФИЛЬТРЫ
const ALL_STAGES: Stage[] = ["Концепт", "Макет", "Прототип", "MVP"]
const active = ref<Set<Stage>>(new Set()) // пусто = показывать все

const toggleStage = (s: Stage) => {
  if (active.value.has(s)) active.value.delete(s)
  else active.value.add(s)
  // форс-реактивность Set
  active.value = new Set(active.value)
}
const clearFilters = () => { active.value = new Set() }

const counts = computed(() => {
  const c: Record<Stage, number> = { Концепт: 0, Макет: 0, Прототип: 0, MVP: 0 }
  for (const p of projects) c[p.stage]++
  return c
})

const filtered = computed(() => {
  if (active.value.size === 0) return projects
  return projects.filter(p => active.value.has(p.stage))
})
</script>

<template>
  <section
    id="projects-ikb"
    class="relative py-16 px-4 md:px-8 lg:px-12 overflow-hidden bg-transparent"
    :class="visible ? 'animate-in opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
  >
    <!-- неоновые пятна -->
    <div
      class="pointer-events-none absolute -right-32 -top-24 h-80 w-80 rounded-full blur-3xl"
      style="background: radial-gradient(50% 50% at 50% 50%, rgba(20,184,166,0.15), transparent)"
    ></div>

    <div class="mx-auto max-w-6xl relative z-10">
      <header class="mb-8 text-center">
        <h2 class="uppercase tracking-[0.25em] text-teal-300/90 text-sm font-semibold mb-2">
          РЕШЕНИЯ И ПРОЕКТЫ
        </h2>
        <p class="text-slate-300/80 max-w-3xl mx-auto">
          Контрактные разработки и исследовательские прототипы ИКБ — от концептов до MVP.
        </p>
      </header>

      <!-- ФИЛЬТРЫ -->
      <div
        class="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        aria-label="Фильтр по стадии"
      >
        <button
          v-for="s in ALL_STAGES"
          :key="s"
          @click="toggleStage(s)"
          class="uppercase tracking-widest text-[11px] sm:text-xs rounded-full border px-3 py-1.5 backdrop-blur transition
                 hover:border-teal-400/50 hover:bg-white/10"
          :class="active.has(s)
            ? 'border-teal-400/60 bg-white/10 text-teal-300'
            : 'border-white/15 bg-white/5 text-slate-300/90'"
        >
          {{ s }}
          <span class="ml-1 rounded-full border border-current/30 px-1.5 text-[10px] opacity-80">
            {{ counts[s] }}
          </span>
        </button>

        <button
          v-if="active.size"
          @click="clearFilters"
          class="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] sm:text-xs text-slate-300/90 uppercase tracking-widest backdrop-blur hover:border-rose-400/50 hover:text-rose-300 transition"
          title="Сбросить фильтры"
        >
          Сбросить
        </button>
      </div>

      <!-- СЕТКА КАРТОЧЕК -->
      <transition-group
        name="gridfade"
        tag="div"
        class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        role="list"
      >
        <article
          v-for="item in filtered"
          :key="item.id"
          class="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 transition
                 hover:border-teal-400/40 hover:bg-white/10"
        >
          <h3 class="font-semibold text-white mb-2 text-base group-hover:text-teal-300 transition">
            {{ item.name }}
          </h3>
          <p class="text-sm text-slate-300/80 mb-3 leading-snug">
            {{ item.desc }}
          </p>
          <span
            class="inline-block text-[11px] px-2 py-1 rounded-md border uppercase tracking-widest"
            :class="{
              'border-rose-400/40 text-rose-300/90': item.stage === 'Концепт',
              'border-amber-400/40 text-amber-300/90': item.stage === 'Макет',
              'border-cyan-400/40 text-cyan-300/90': item.stage === 'Прототип',
              'border-emerald-400/40 text-emerald-300/90': item.stage === 'MVP',
            }"
          >
            {{ item.stage }}
          </span>
        </article>
      </transition-group>

      <!-- Пустой результат -->
      <div
        v-if="filtered.length === 0"
        class="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-300/80"
      >
        По выбранным стадиям проектов не найдено.
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-in { transition: all 0.9s ease-out; }

/* Анимация карточек при фильтрации */
.gridfade-enter-active, .gridfade-leave-active {
  transition: all 260ms ease, transform 260ms ease, opacity 260ms ease;
}
.gridfade-enter-from, .gridfade-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(6px);
}
</style>
