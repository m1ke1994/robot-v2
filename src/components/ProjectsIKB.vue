<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

type Stage = 'concept' | 'prototype' | 'pilot' | 'mvp';

type Project = {
  id: number;
  name: string;
  description: string;
  stage: Stage;
  focus: string;
  result: string;
};

const stageLabels: Record<Stage, string> = {
  concept: 'Концепт',
  prototype: 'Прототип',
  pilot: 'Пилот',
  mvp: 'MVP',
};

const badgeClass: Record<Stage, string> = {
  concept: 'stage-concept',
  prototype: 'stage-prototype',
  pilot: 'stage-pilot',
  mvp: 'stage-mvp',
};

const projects: Project[] = [
  {
    id: 1,
    name: 'Роботизированная сварочная ячейка «Сварка-01»',
    description:
      'Комплекс для дуговой сварки корпусов насосов с адаптивным управлением, автоматической сменой оснастки и мониторингом геометрии шва.',
    stage: 'prototype',
    focus: 'Робот Fanuc M-20iD, позиционер на 2 оси, датчики слежения за дугой, интеграция с MES.',
    result: 'Снижение брака на 32%, время цикла 6 минут, данные автоматически попадают в систему качества.',
  },
  {
    id: 2,
    name: 'AGV-платформа для транспортировки литья',
    description:
      'Самоходная тележка грузоподъёмностью 1,5 т для доставки заготовок между литейным и механообрабатывающим участками.',
    stage: 'pilot',
    focus: 'Лидар SLAM, система предотвращения столкновений, диспетчерский модуль с визуализацией маршрутов.',
    result: 'Сокращение ручных перемещений на 70%, прозрачное расписание поставок для планово-диспетчерской службы.',
  },
  {
    id: 3,
    name: 'Модульный манипулятор для сборки тяговых батарей',
    description:
      'Концепт манипулятора с системой силового контроля и сменными захватами для аккумуляторных кассет электробусов.',
    stage: 'concept',
    focus: 'Кинематический анализ, цифровой двойник, проверка траекторий, расчёт силовых нагрузок.',
    result: 'Подтверждение технической реализуемости, подготовка ТЗ для производства опытной партии.',
  },
  {
    id: 4,
    name: 'Интеллектуальный склад стальных листов',
    description:
      'MVP-система хранения и подачи листового металла с адресным размещением и автоматической инвентаризацией.',
    stage: 'mvp',
    focus: 'Шаттловая система, RFID-идентификация, API для ERP, модуль аналитики загрузки.',
    result: 'Сокращение времени поиска партий на 45%, исключены ошибки при выдаче материала на участок.',
  },
  {
    id: 5,
    name: 'Учебно-демонстрационный стенд «Digital Twin Lab»',
    description:
      'Прототип стенда для подготовки операторов и инженеров: реальный манипулятор синхронизирован с цифровым двойником.',
    stage: 'prototype',
    focus: 'TwinCAT, имитация аварийных сценариев, база знаний с видеоподсказками.',
    result: 'Сокращение времени обучения до запуска линии на 40%, уменьшение количества ошибок при наладке.',
  },
  {
    id: 6,
    name: 'Комплект retrofit для пресс-форм',
    description:
      'Решение для оцифровки пресс-форм на действующих линиях: датчики положения, мониторинг температуры и автоматика.',
    stage: 'pilot',
    focus: 'Унифицированные модули IO-Link, энергоэффективные приводы, интеграция с ПЛК Siemens.',
    result: 'Время переналадки сокращено до 25 минут, получена аналитика по износу и качеству продукции.',
  },
  {
    id: 7,
    name: 'Система техзрения для контроля пайки плат',
    description:
      'MVP-решение на базе нейросетей для проверки качества пайки в производстве электроники с учётом вариативности изделий.',
    stage: 'mvp',
    focus: 'AI-модель на TensorRT, линия обслуживания 18 снимков/сек, интерфейс для инженера-визуалиста.',
    result: 'Автоматизация 95% операций контроля, повышение обнаружения дефектов до 99,2%.',
  },
  {
    id: 8,
    name: 'Цех цифровой калибровки роботов',
    description:
      'Концепт мультистанции для точной калибровки промышленных роботов с использованием лазерных трекеров и облачной базы.',
    stage: 'concept',
    focus: 'Методика калибровки, расчёт окупаемости, архитектура данных и сценарии обслуживания.',
    result: 'Формирование дорожной карты на 3 года, подготовка инвестиционного пакета для промышленного партнёра.',
  },
];

const stageFilter = [
  { value: 'all', label: 'Все проекты' },
  { value: 'concept', label: 'Концепт' },
  { value: 'prototype', label: 'Прототип' },
  { value: 'pilot', label: 'Пилот' },
  { value: 'mvp', label: 'MVP' },
] as const;

type FilterValue = (typeof stageFilter)[number]['value'];

const activeStage = ref<FilterValue>('all');
const search = ref('');
const sortKey = ref<'stage' | 'name'>('stage');

const containerEl = ref<HTMLElement | null>(null);
const visible = ref(false);

let observer: IntersectionObserver | null = null;

const attachObserver = () => {
  if (!containerEl.value || visible.value) return;

  observer?.disconnect();

  if (typeof IntersectionObserver === 'undefined') {
    visible.value = true;
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visible.value = true;
          observer?.disconnect();
          observer = null;
          break;
        }
      }
    },
    { threshold: 0.2 },
  );

  observer.observe(containerEl.value);
};

onMounted(() => {
  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  if (prefersReducedMotion) {
    visible.value = true;
    return;
  }

  if (containerEl.value) {
    attachObserver();
  } else {
    requestAnimationFrame(attachObserver);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});

const counts = computed(() => {
  const base: Record<Stage, number> = { concept: 0, prototype: 0, pilot: 0, mvp: 0 };
  for (const project of projects) {
    base[project.stage] += 1;
  }
  return base;
});

const filteredProjects = computed(() => {
  const term = search.value.trim().toLowerCase();
  let list = projects;

  if (activeStage.value !== 'all') {
    list = list.filter((project) => project.stage === activeStage.value);
  }

  if (term) {
    list = list.filter((project) =>
      (project.name + project.description + project.focus + project.result).toLowerCase().includes(term),
    );
  }

  const stageOrder: Record<Stage, number> = { concept: 3, prototype: 2, pilot: 1, mvp: 0 };

  if (sortKey.value === 'stage') {
    return [...list].sort(
      (a, b) => stageOrder[b.stage] - stageOrder[a.stage] || a.name.localeCompare(b.name, 'ru'),
    );
  }

  return [...list].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
});
</script>

<template>
  <section
    ref="containerEl"
    id="projects-ikb"
    class="page-section relative overflow-hidden px-4 md:px-8 lg:px-12"
    :class="visible ? 'animate-in opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
  >
    <div
      class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
      style="background: radial-gradient(0% 60% at 50% 50%, #060A19, transparent)"
      aria-hidden="true"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full blur-3xl"
      style="background: radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.15), transparent)"
      aria-hidden="true"
    ></div>

    <div class="relative z-10 mx-auto max-w-6xl">
      <div class="mb-8 text-center">
        <p class="mb-2 text-[12px] uppercase tracking-[0.3em] text-teal-300/80">
          Портфель проектов
        </p>
        <h2 class="text-3xl font-semibold text-white md:text-4xl">
          Решения конструкторского бюро для промышленности
        </h2>
        <p class="mt-3 text-base text-slate-300/85 md:text-lg">
          От концептов и пилотов до серийных внедрений — каждая разработка проходит верификацию на
          цифровых моделях и на производстве заказчика.
        </p>
      </div>

      <div class="panel">
        <div class="panel-glow" aria-hidden="true"></div>
        <div class="panel-content">
          <div class="filters">
            <div class="segmented" role="tablist" aria-label="Фильтр по стадиям">
              <button
                v-for="stage in stageFilter"
                :key="stage.value"
                type="button"
                class="seg-btn"
                :class="{ 'seg-active': activeStage === stage.value }"
                @click="activeStage = stage.value"
              >
                <span>{{ stage.label }}</span>
                <span v-if="stage.value !== 'all'" class="seg-count">
                  {{ counts[stage.value as Stage] }}
                </span>
              </button>
            </div>

            <div class="filter-tools">
              <label class="search-field">
                <span class="sr-only">Поиск по проектам</span>
                <input
                  v-model="search"
                  type="search"
                  placeholder="Поиск по названию или описанию"
                  autocomplete="off"
                />
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0z"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                  />
                </svg>
              </label>

              <label class="sort-field">
                <span>Сортировка</span>
                <select v-model="sortKey">
                  <option value="stage">По стадии</option>
                  <option value="name">По названию</option>
                </select>
              </label>
            </div>
          </div>

          <transition-group
            name="gridfade"
            tag="div"
            class="project-grid"
            aria-live="polite"
            aria-label="Список проектов"
          >
            <article v-for="project in filteredProjects" :key="project.id" class="project-card">
              <div class="project-card__header">
                <h3 class="project-title">{{ project.name }}</h3>
                <span class="stage-badge" :class="badgeClass[project.stage]">
                  {{ stageLabels[project.stage] }}
                </span>
              </div>

              <p class="project-description">
                {{ project.description }}
              </p>

              <div class="project-meta">
                <div class="chip">
                  <span class="chip-label">Фокус</span>
                  <span class="chip-value">{{ project.focus }}</span>
                </div>
                <div class="chip">
                  <span class="chip-label">Результат</span>
                  <span class="chip-value">{{ project.result }}</span>
                </div>
              </div>
            </article>
          </transition-group>

          <div
            v-if="filteredProjects.length === 0"
            class="empty-state"
          >
            Мы пока не реализовали проекты по такому фильтру, но инженерная команда подготовит
            индивидуальное решение под вашу задачу.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
#projects-ikb {
  position: relative;
}

#projects-ikb > .pointer-events-none {
  z-index: 0;
}

.animate-in {
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.panel {
  position: relative;
  border-radius: 2rem;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.32));
  overflow: hidden;
}

.panel-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(120px 80px at 85% -20px, rgba(45, 212, 191, 0.18), transparent 65%),
    radial-gradient(160px 120px at 15% 110%, rgba(59, 130, 246, 0.18), transparent 70%);
  opacity: 0.6;
  filter: blur(0.5px);
}

.panel-content {
  position: relative;
  z-index: 1;
  padding: clamp(1.75rem, 4vw, 2.75rem);
  display: flex;
  flex-direction: column;
  gap: clamp(1.75rem, 3vw, 2.5rem);
}

.filters {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 2vw, 1.75rem);
}

.segmented {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  padding: 0.35rem;
  border-radius: 1.1rem;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 4px 20px rgba(0, 0, 0, 0.25);
}

.seg-btn {
  position: relative;
  padding: 0.5rem 0.85rem;
  border-radius: 0.9rem;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid transparent;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.seg-btn:hover {
  color: #ccfbf1;
}

.seg-btn:focus-visible {
  outline: 2px solid rgba(45, 212, 191, 0.6);
  outline-offset: 3px;
}

.seg-active {
  color: #d1fffb;
  background: linear-gradient(180deg, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.05));
  border-color: rgba(45, 212, 191, 0.45);
  box-shadow:
    inset 0 0 0 999px rgba(255, 255, 255, 0.02),
    0 0 24px rgba(20, 184, 166, 0.25);
}

.seg-count {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 0.05rem 0.45rem;
  font-size: 0.68rem;
  letter-spacing: 0;
  color: rgba(226, 232, 240, 0.92);
}

.filter-tools {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: stretch;
}

.search-field {
  position: relative;
  display: block;
}

.search-field input {
  width: 100%;
  border-radius: 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.55);
  padding: 0.65rem 0.9rem 0.65rem 2.6rem;
  color: #e2e8f0;
  font-size: 0.9rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-field input::placeholder {
  color: rgba(148, 163, 184, 0.55);
}

.search-field input:focus-visible {
  outline: 2px solid rgba(56, 189, 248, 0.55);
  outline-offset: 2px;
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}

.search-field .icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: rgba(148, 163, 184, 0.65);
  pointer-events: none;
}

.sort-field {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.7rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.65);
}

.sort-field select {
  border-radius: 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.55);
  padding: 0.55rem 0.9rem;
  color: #e2e8f0;
  font-size: 0.85rem;
  appearance: none;
}

.sort-field select:focus-visible {
  outline: 2px solid rgba(56, 189, 248, 0.5);
  outline-offset: 2px;
  border-color: rgba(56, 189, 248, 0.35);
}

.project-grid {
  display: grid;
  gap: clamp(1.25rem, 2.8vw, 1.9rem);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .filter-tools {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .search-field {
    flex: 1;
  }

  .sort-field {
    font-size: 0.72rem;
  }

  .project-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.project-card {
  position: relative;
  border-radius: 1.35rem;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: linear-gradient(175deg, rgba(15, 23, 42, 0.58), rgba(15, 23, 42, 0.3));
  padding: clamp(1.2rem, 2.8vw, 1.6rem);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.02),
    0 35px 80px -60px rgba(15, 23, 42, 0.95);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.project-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.project-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f8fafc;
  line-height: 1.3;
}

.stage-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.68rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  padding: 0.35rem 0.55rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
}

.stage-concept {
  border-color: rgba(244, 63, 94, 0.45);
  color: rgba(252, 165, 165, 0.95);
  box-shadow: 0 0 22px rgba(244, 63, 94, 0.2) inset;
}

.stage-prototype {
  border-color: rgba(59, 130, 246, 0.45);
  color: rgba(191, 219, 254, 0.95);
  box-shadow: 0 0 22px rgba(59, 130, 246, 0.2) inset;
}

.stage-pilot {
  border-color: rgba(251, 191, 36, 0.45);
  color: rgba(254, 215, 170, 0.95);
  box-shadow: 0 0 22px rgba(251, 191, 36, 0.2) inset;
}

.stage-mvp {
  border-color: rgba(16, 185, 129, 0.45);
  color: rgba(167, 243, 208, 0.95);
  box-shadow: 0 0 22px rgba(16, 185, 129, 0.2) inset;
}

.project-description {
  color: rgba(203, 213, 225, 0.9);
  font-size: 0.88rem;
  line-height: 1.5;
}

.project-meta {
  display: grid;
  gap: 0.65rem;
}

.chip {
  display: block;
  border-radius: 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.5);
  padding: 0.65rem 0.85rem;
}

.chip-label {
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.6);
  margin-bottom: 0.2rem;
}

.chip-value {
  display: block;
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.92);
  line-height: 1.4;
}

.empty-state {
  margin-top: 1.5rem;
  border-radius: 1.35rem;
  border: 1px dashed rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.45);
  padding: 1.5rem;
  text-align: center;
  color: rgba(226, 232, 240, 0.88);
}

.gridfade-enter-active,
.gridfade-leave-active {
  transition: all 240ms ease, opacity 240ms ease, transform 240ms ease;
}

.gridfade-enter-from,
.gridfade-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.985);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 640px) {
  .seg-btn {
    padding: 0.45rem 0.7rem;
  }

  .sort-field {
    justify-content: space-between;
  }
}
</style>
