<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const visible = ref(false);
const container = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;

const registerObserver = () => {
  if (!container.value || visible.value) return;

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
    { threshold: 0.25 },
  );

  observer.observe(container.value);
};

onMounted(() => {
  const isMobile = window.innerWidth <= 640;
  if (isMobile) {
    visible.value = true;
    return;
  }

  registerObserver();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<template>
  <section
    id="about-ikb"
    ref="container"
    class="page-section relative overflow-hidden bg-transparent"
    :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
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

    <div class="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 md:grid-cols-12 md:gap-12">
      <div class="md:col-span-7 space-y-6">
        <span class="overline">Инженерное бюро полного цикла</span>
        <h2 class="headline">
          Проектируем роботизированные комплексы и цифровые двойники для промышленных лидеров
        </h2>
        <p class="lead">
          Команда ИКБ Robotics объединяет инженеров‑конструкторов, специалистов по мехатронике и
          разработчиков ПО. Мы проектируем и внедряем робототехнические решения, которые сокращают
          простои, повышают производительность и делают производство предсказуемым.
        </p>

        <div class="stats">
          <div class="glass-card">
            <div class="metric">15+</div>
            <p class="metric-caption">лет в разработке спецоборудования и автоматизации</p>
          </div>
          <div class="glass-card">
            <div class="metric">50</div>
            <p class="metric-caption">запущенных роботизированных ячеек и производственных участков</p>
          </div>
          <div class="glass-card">
            <div class="metric">24/7</div>
            <p class="metric-caption">цифровой мониторинг и поддержка критичных линий</p>
          </div>
        </div>
      </div>

      <div class="md:col-span-5 space-y-5">
        <div class="visual">
          <div class="visual-header">
            <span class="dot"></span>
            <span class="title">Фокус &amp; компетенции</span>
          </div>
          <div class="visual-body space-y-4">
            <ul class="chip-list">
              <li class="chip">Робототехника и мехатроника</li>
              <li class="chip">Промышленное зрение и AI-контроль</li>
              <li class="chip">SCADA · MES · цифровые двойники</li>
            </ul>
            <div class="divider"></div>
            <p class="text-sm text-slate-200/80">
              Мы работаем с производствами, где каждая минута простоя стоит дорого. Поэтому до
              внедрения решение проходит моделирование на цифровом двойнике, пилот на действующей
              линии и только затем масштабирование.
            </p>
          </div>
        </div>

        <div class="case-card">
          <div class="case-head">
            <span class="badge">Кейс</span>
            <span class="delta good">−38% времени цикла</span>
          </div>
          <p class="case-text">
            Роботизированная линия механической обработки для машиностроительного холдинга:
            интеграция робот-манипуляторов, цифровой двойник и подключение к ERP.
          </p>
        </div>
      </div>
    </div>

    <div class="relative mx-auto mt-12 max-w-6xl grid grid-cols-1 gap-10 px-6 md:grid-cols-12 md:gap-12">
      <div class="md:col-span-7 space-y-8">
        <div class="space-y-3">
          <h3 class="section-title">Как мы работаем</h3>
          <p class="text-sm text-slate-300/85">
            Используем инженерные методики, подтверждённые сертификациями международных вендоров.
          </p>
        </div>

        <ul class="features">
          <li class="feature">
            <span class="feature-icon">01</span>
            <div>
              <h4>Диагностика и обоснование</h4>
              <p>Анализируем процессы, считаем экономический эффект, формируем дорожную карту проекта.</p>
            </div>
          </li>
          <li class="feature">
            <span class="feature-icon">02</span>
            <div>
              <h4>Проектирование и цифровой двойник</h4>
              <p>Создаём 3D-модели, симуляции, тестируем сценарии работы оборудования и выявляем узкие места.</p>
            </div>
          </li>
          <li class="feature">
            <span class="feature-icon">03</span>
            <div>
              <h4>Внедрение и сопровождение</h4>
              <p>Проводим монтаж, обучение персонала и подключаем систему мониторинга для непрерывной поддержки.</p>
            </div>
          </li>
        </ul>

        <div>
          <h3 class="section-title">Процесс в деталях</h3>
          <ol class="steps">
            <li>
              <span class="num">1</span>
              <div>
                <div class="step-title">Предпроектное обследование</div>
                <p class="step-text">Сбор исходных данных, оценка оборудования, определение KPI.</p>
              </div>
            </li>
            <li>
              <span class="num">2</span>
              <div>
                <div class="step-title">Инженерный проект</div>
                <p class="step-text">Разработка КД, электрических схем, ПО, спецификаций и графиков запуска.</p>
              </div>
            </li>
            <li>
              <span class="num">3</span>
              <div>
                <div class="step-title">Пилот и запуск</div>
                <p class="step-text">Монтаж, SAT/FAT-тесты, обучение сотрудников и метрологическая калибровка.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      <div class="md:col-span-5 space-y-6">
        <div class="case-card">
          <div class="case-head">
            <span class="badge">Цифровизация</span>
            <span class="delta">OEE +21%</span>
          </div>
          <p class="case-text">
            MES-платформа и система диспетчеризации для завода металлоконструкций. Реальное время,
            аналитика по сменам, управление заданиями с планшетов операторов.
          </p>
        </div>

        <div class="case-card">
          <div class="case-head">
            <span class="badge">R&amp;D</span>
            <span class="delta">6 месяцев</span>
          </div>
          <p class="case-text">
            Разработали модуль электроснабжения для роботизированной линии покраски: собственная
            мехатроника и софт на базе Codesys, полный цикл испытаний.
          </p>
        </div>

        <div class="callout">
          <h4>Хотите обсудить задачу?</h4>
          <p>Подготовим предварительное техническое решение и оценим эффект до начала проекта.</p>
          <a href="#contact" class="callout-link">Запросить консультацию</a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
#about-ikb {
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.overline {
  display: inline-block;
  font-size: 0.7rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.65);
}

.headline {
  font-size: clamp(2.2rem, 3.2vw, 2.8rem);
  font-weight: 600;
  line-height: 1.15;
  color: #f8fafc;
}

.lead {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(226, 232, 240, 0.9);
}

.stats {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.glass-card {
  position: relative;
  padding: 1.1rem 1.3rem;
  border-radius: 1.2rem;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.68), rgba(15, 23, 42, 0.32));
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  box-shadow:
    inset 0 0 0 1px rgba(148, 163, 184, 0.05),
    0 60px 150px -90px rgba(3, 7, 18, 0.9);
}

.metric {
  font-size: 2.1rem;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: -0.03em;
}

.metric-caption {
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: rgba(203, 213, 225, 0.85);
  line-height: 1.4;
}

.visual {
  position: relative;
  overflow: hidden;
  border-radius: 1.4rem;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.35));
  backdrop-filter: blur(18px);
}

.visual-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.12), transparent);
}

.visual-header .dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: linear-gradient(to right, #22d3ee, #6366f1);
}

.visual-header .title {
  font-size: 0.75rem;
  font-weight: 500;
  color: #e5e7eb;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.visual-body {
  padding: 1.2rem 1.4rem;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  border-radius: 9999px;
  padding: 0.45rem 1.15rem;
  color: rgba(226, 232, 240, 0.92);
  background: linear-gradient(120deg, rgba(148, 163, 184, 0.18), rgba(148, 163, 184, 0.06));
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  font-size: 0.75rem;
}

.divider {
  margin: 1rem 0;
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.35), transparent);
}

.case-card {
  border-radius: 1.2rem;
  background: linear-gradient(145deg, rgba(2, 6, 23, 0.55), rgba(15, 23, 42, 0.35));
  padding: 0.95rem 1.1rem;
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow:
    inset 0 0 0 1px rgba(148, 163, 184, 0.06),
    0 25px 70px -50px rgba(3, 7, 18, 0.8);
}

.case-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.badge {
  font-size: 0.7rem;
  color: #e2e8f0;
  padding: 0.25rem 0.55rem;
  border-radius: 9999px;
  background: linear-gradient(120deg, rgba(148, 163, 184, 0.22), rgba(148, 163, 184, 0.08));
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.delta {
  font-size: 0.78rem;
  color: rgba(125, 211, 252, 0.9);
}

.delta.good {
  color: #86efac;
  font-weight: 600;
}

.case-text {
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.9rem;
  line-height: 1.4;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f8fafc;
}

.features {
  display: grid;
  gap: 1.35rem;
}

.feature {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: baseline;
}

.feature-icon {
  display: inline-grid;
  place-items: center;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(34, 211, 238, 0.35));
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}

.feature h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 0.35rem;
}

.feature p {
  font-size: 0.9rem;
  color: rgba(203, 213, 225, 0.85);
  line-height: 1.45;
}

.steps {
  display: grid;
  gap: 0.75rem;
}

.steps li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
}

.num {
  display: inline-grid;
  place-items: center;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 9999px;
  background: linear-gradient(120deg, rgba(59, 130, 246, 0.35), rgba(34, 211, 238, 0.35));
  color: #0f172a;
  font-size: 0.8rem;
  font-weight: 600;
}

.step-title {
  color: #f8fafc;
  font-weight: 600;
  font-size: 0.95rem;
}

.step-text {
  color: rgba(203, 213, 225, 0.85);
  font-size: 0.85rem;
  line-height: 1.4;
}

.callout {
  border-radius: 1.4rem;
  border: 1px solid rgba(56, 189, 248, 0.25);
  background: linear-gradient(150deg, rgba(15, 23, 42, 0.6), rgba(14, 116, 144, 0.25));
  padding: 1.6rem;
  box-shadow: 0 20px 45px -40px rgba(34, 211, 238, 0.65);
}

.callout h4 {
  font-size: 1.05rem;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 0.5rem;
}

.callout p {
  color: rgba(203, 213, 225, 0.9);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.callout-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 9999px;
  background: rgba(34, 211, 238, 0.15);
  color: #ecfeff;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: background 0.2s ease, transform 0.2s ease;
}

.callout-link:hover {
  background: rgba(34, 211, 238, 0.25);
  transform: translateY(-1px);
}

@media (prefers-reduced-motion: reduce) {
  #about-ikb {
    transition: none;
  }
}

@media (max-width: 640px) {
  .stats {
    grid-template-columns: 1fr;
  }

  .features {
    gap: 1rem;
  }
}
</style>
