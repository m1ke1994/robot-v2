<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

type Cert = {
  src: string;
  title: string;
  issuer?: string;
  year?: string | number;
  alt?: string;
};

const props = withDefaults(
  defineProps<{
    items?: Cert[];
    initialVisible?: number;
  }>(),
  {
    items: () => [
      {
        src: '/certs/cert-1.jpg',
        title: 'Сертификат партнёра ABB Robotics',
        issuer: 'ABB Robotics Russia',
        year: '2023',
        alt: 'Сертификат партнёра ABB Robotics',
      },
      {
        src: '/certs/cert-2.jpg',
        title: 'Участник международной выставки SPS/IPC/Drives',
        issuer: 'Nürnberg Messe',
        year: '2022',
        alt: 'Участие в SPS/IPC/Drives',
      },
      {
        src: '/certs/cert-3.jpg',
        title: 'Лицензия на проектирование средств автоматизации',
        issuer: 'Федеральная служба по техническому регулированию',
        year: '2021',
        alt: 'Лицензия на проектирование автоматизации',
      },
      {
        src: '/certs/cert-4.jpg',
        title: 'Статус резидента индустриального кластера «ИнноТех»',
        issuer: 'Индустриальный кластер «ИнноТех»',
        year: '2022',
        alt: 'Статус резидента индустриального кластера',
      },
      {
        src: '/certs/cert-5.jpg',
        title: 'Сертификат соответствия ISO 9001:2015',
        issuer: 'Bureau Veritas Certification',
        year: '2024',
        alt: 'Сертификат ISO 9001',
      },
      {
        src: '/certs/cert-6.jpg',
        title: 'Аттестат инновационного партнёра АО «Синара-Транспортные Машины»',
        issuer: 'АО «СТМ»',
        year: '2023',
        alt: 'Аттестат инновационного партнёра',
      },
    ],
    initialVisible: 6,
  },
);

const all = ref<Cert[]>(props.items);
watch(
  () => props.items,
  (value) => {
    all.value = value || [];
  },
);

const showAll = ref(false);
const visible = computed(() =>
  showAll.value ? all.value : all.value.slice(0, props.initialVisible),
);

const isOpen = ref(false);
const index = ref(0);
const current = computed(() => visible.value[index.value] ?? visible.value[0]);

let touchX = 0;
let originalOverflow = '';

const open = (i = 0) => {
  index.value = i;
  isOpen.value = true;
  lockScroll(true);
};

const close = () => {
  isOpen.value = false;
  lockScroll(false);
};

const next = () => {
  if (!visible.value.length) return;
  index.value = (index.value + 1) % visible.value.length;
};

const prev = () => {
  if (!visible.value.length) return;
  index.value = (index.value - 1 + visible.value.length) % visible.value.length;
};

const onKey = (event: KeyboardEvent) => {
  if (!isOpen.value) return;
  if (event.key === 'Escape') close();
  if (event.key === 'ArrowRight') next();
  if (event.key === 'ArrowLeft') prev();
};

const onTouchStart = (event: TouchEvent) => {
  touchX = event.touches[0].clientX;
};

const onTouchEnd = (event: TouchEvent) => {
  const delta = event.changedTouches[0].clientX - touchX;
  if (Math.abs(delta) < 40) return;
  delta < 0 ? next() : prev();
};

const lockScroll = (state: boolean) => {
  const root = document.documentElement;
  if (state) {
    originalOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
  } else {
    root.style.overflow = originalOverflow;
  }
};

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <section id="certs" class="page-section relative overflow-hidden px-4 md:px-8 lg:px-12">
    <div
      class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
      style="background: radial-gradient(0% 60% at 50% 50%, #060A19, transparent)"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full blur-3xl"
      style="background: radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.15), transparent)"
      aria-hidden="true"
    />

    <div class="relative z-10 mx-auto max-w-6xl text-slate-100">
      <header class="mb-10 text-center">
        <p class="mb-2 text-[12px] uppercase tracking-[0.3em] text-teal-300/80">
          Признание компетенций
        </p>
        <h2 class="text-3xl font-bold tracking-tight md:text-4xl">
          Сертификаты и аккредитации бюро
        </h2>
        <p class="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">
          Мы подтверждаем уровень инженерной экспертизы международными и отраслевыми сертификатами.
          Это позволяет работать с критически важными производствами и интегрировать решения в
  соответствии с корпоративными стандартами заказчика.
        </p>
      </header>

      <div
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Галерея сертификатов"
      >
        <article
          v-for="(item, i) in visible"
          :key="item.src"
          class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg transition hover:border-white/20 focus-within:border-white/20"
        >
          <button
            type="button"
            class="block w-full text-left focus:outline-none"
            @click="open(i)"
          >
            <div class="aspect-[4/3] overflow-hidden rounded-xl bg-slate-900/60">
              <img
                :src="item.src"
                :alt="item.alt || item.title"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div class="mt-3 px-1">
              <h3 class="text-[13px] font-medium text-slate-100 line-clamp-2">
                {{ item.title }}
              </h3>
              <p class="mt-1 text-[11px] text-slate-400 line-clamp-2">
                {{ item.issuer }}<span v-if="item.year"> · {{ item.year }}</span>
              </p>
            </div>
            <span
              class="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-slate-100 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 opacity-90"
            >
              Документ
            </span>
          </button>
        </article>
      </div>

      <div class="mt-8 flex justify-center">
        <button
          v-if="all.length > visible.length"
          type="button"
          class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
          @click="showAll = true"
        >
          Показать ещё ({{ all.length }})
        </button>
        <button
          v-else-if="all.length > props.initialVisible"
          type="button"
          class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
          @click="showAll = false"
        >
          Свернуть
        </button>
      </div>
    </div>

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
          class="absolute right-3 top-3 z-10 rounded-full bg-white/10 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/20"
          @click="close"
        >
          Закрыть
        </button>

        <img
          :src="current?.src"
          :alt="current?.alt || current?.title"
          class="h-[80vh] w-full rounded-xl bg-slate-900/60 p-2 object-contain shadow-2xl"
          loading="lazy"
          decoding="async"
        />

        <div class="mt-3 text-center text-sm text-slate-300">
          <div class="font-medium">{{ current?.title }}</div>
          <div class="text-xs text-slate-400">
            {{ current?.issuer }}<span v-if="current?.year"> · {{ current?.year }}</span>
          </div>
        </div>

        <button
          type="button"
          class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-slate-100 transition hover:bg-white/20"
          @click.stop="prev"
          aria-label="Предыдущий документ"
        >
          ‹
        </button>
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-slate-100 transition hover:bg-white/20"
          @click.stop="next"
          aria-label="Следующий документ"
        >
          ›
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
#certs {
  position: relative;
}

article::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(40% 40% at 80% 0%, rgba(34, 211, 238, 0.12), transparent 60%);
  opacity: 0;
  transition: opacity 0.35s ease;
}

article:hover::after {
  opacity: 1;
}
</style>
