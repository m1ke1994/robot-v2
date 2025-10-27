<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';

type Item = { label: string; to: RouteLocationRaw };

const items: Item[] = [
  { label: 'Главная', to: { path: '/' } },
  { label: 'Проекты', to: { path: '/', hash: '#projects' } },
  { label: 'Компетенции', to: { path: '/', hash: '#about' } },
  { label: 'Сертификаты', to: { path: '/', hash: '#cert' } },
  { label: 'Контакты', to: { path: '/', hash: '#frames' } },
];

const isOpen = ref(false);
const route = useRoute();

let scrollY = 0;

const lockBodyScroll = () => {
  scrollY = window.scrollY || 0;
  const body = document.body;
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
};

const unlockBodyScroll = () => {
  const body = document.body;
  body.style.position = '';
  body.style.top = '';
  body.style.left = '';
  body.style.right = '';
  body.style.width = '';
  window.scrollTo(0, scrollY);
};

const focusFirstMobileLink = () => {
  document.querySelector<HTMLAnchorElement>('#mobile-menu a, #mobile-menu button')?.focus();
};

const toggle = async () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    lockBodyScroll();
    await nextTick();
    focusFirstMobileLink();
  } else {
    unlockBodyScroll();
    await nextTick();
    document.getElementById('burger-btn')?.focus();
  }
};

const close = async () => {
  if (!isOpen.value) return;
  isOpen.value = false;
  unlockBodyScroll();
  await nextTick();
  document.getElementById('burger-btn')?.focus();
};

const normalizeTarget = (to: RouteLocationRaw) => {
  if (typeof to === 'string') {
    const [path, hash] = to.split('#');
    return { path: path || '/', hash: hash ? `#${hash}` : '' };
  }
  const path = typeof to === 'object' && 'path' in to ? to.path ?? '/' : '/';
  const hash = typeof to === 'object' && 'hash' in to ? to.hash ?? '' : '';
  return { path: path || '/', hash };
};

const isActive = (to: RouteLocationRaw) => {
  const target = normalizeTarget(to);
  if (target.hash) {
    return route.path === target.path && route.hash === target.hash;
  }
  return route.path === target.path;
};

const itemKey = (item: Item) => {
  if (typeof item.to === 'string') return item.to;
  return `${item.label}-${item.to.path ?? ''}-${item.to.hash ?? ''}`;
};

const onKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    close();
  }
};

watch(
  () => route.fullPath,
  () => close(),
);

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
  unlockBodyScroll();
});
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-md supports-[backdrop-filter]:bg-black/30"
    role="banner"
  >
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:h-20">
      <RouterLink to="/" class="group flex min-w-0 items-center gap-3">
        <img
          src="/logo.svg"
          alt="Логотип конструкторского бюро"
          loading="lazy"
          decoding="async"
          class="h-8 w-8 shrink-0 transition-transform group-hover:scale-105"
        />
        <span class="hidden truncate text-base font-semibold tracking-wide text-white/90 lg:block">
          ИКБ Robotics
        </span>
      </RouterLink>

      <nav class="hidden items-center gap-1 lg:flex" aria-label="Основная навигация">
        <RouterLink
          v-for="item in items"
          :key="itemKey(item)"
          :to="item.to"
          class="rounded-md px-3 py-2 text-sm font-medium transition"
          :class="isActive(item.to) ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="hidden lg:block">
        <a
          href="#contact"
          class="inline-flex items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20 hover:text-white"
        >
          Запросить консультацию
        </a>
      </div>

      <button
        id="burger-btn"
        class="relative h-10 w-10 rounded-md border border-white/10 transition hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 lg:hidden"
        :aria-expanded="isOpen ? 'true' : 'false'"
        aria-controls="mobile-menu"
        :aria-label="isOpen ? 'Закрыть меню' : 'Открыть меню'"
        @click="toggle"
        :data-open="isOpen ? '1' : '0'"
      >
        <span class="burger-line line-top"></span>
        <span class="burger-line line-mid"></span>
        <span class="burger-line line-bot"></span>
      </button>
    </div>

    <teleport to="body">
      <transition name="fade">
        <div
          v-show="isOpen"
          class="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
          @click="close"
        />
      </transition>

      <transition name="slide">
        <aside
          v-show="isOpen"
          id="mobile-menu"
          class="fixed inset-y-0 right-0 z-[1000] flex w-[85vw] max-w-sm flex-col gap-6 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-lg"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          @click.stop
        >
          <div class="mb-6 flex items-center justify-between">
            <RouterLink to="/" class="flex items-center gap-3" @click="close">
              <img
                src="/logo.svg"
                alt="Логотип конструкторского бюро"
                loading="lazy"
                decoding="async"
                class="h-8 w-8"
              />
              <span class="text-sm font-semibold text-white/90">ИКБ Robotics</span>
            </RouterLink>
            <button
              class="rounded-md border border-white/10 p-2 transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              aria-label="Закрыть меню"
              @click="close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav class="flex flex-col gap-2" aria-label="Мобильная навигация">
            <RouterLink
              v-for="item in items"
              :key="`mobile-${itemKey(item)}`"
              :to="item.to"
              class="rounded-lg px-4 py-3 text-base font-medium transition"
              :class="isActive(item.to) ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'"
              @click="close"
            >
              {{ item.label }}
            </RouterLink>
          </nav>

          <div class="mt-8 border-t border-white/10 pt-6">
            <a
              href="#contact"
              @click="close"
              class="flex w-full items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-base font-semibold text-cyan-200 transition hover:bg-cyan-400/20 hover:text-white"
            >
              Запросить консультацию
            </a>
          </div>

          <div
            class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
            style="background: radial-gradient(60% 60% at 50% 50%, rgba(34,211,238,0.14), transparent)"
          ></div>
        </aside>
      </transition>
    </teleport>
  </header>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 200ms ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: transform 260ms cubic-bezier(.2, .8, .2, 1);
  }

  .slide-enter-from,
  .slide-leave-to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .slide-enter-active,
  .slide-leave-active {
    transition: none;
  }
}

#burger-btn {
  --size: 24px;
  --thick: 2px;
  --offset: 6px;
}

.burger-line {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--size);
  height: var(--thick);
  background: white;
  border-radius: 9999px;
  transform-origin: 50% 50%;
  transform: translate(-50%, -50%);
  transition:
    transform 220ms cubic-bezier(.2, .8, .2, 1),
    opacity 160ms ease;
  will-change: transform, opacity;
  -webkit-font-smoothing: antialiased;
  backface-visibility: hidden;
}

.line-top {
  transform: translate(-50%, calc(-50% - var(--offset)));
}

.line-mid {
  opacity: 1;
}

.line-bot {
  transform: translate(-50%, calc(-50% + var(--offset)));
}

#burger-btn[data-open='1'] .line-top {
  transform: translate(-50%, -50%) rotate(45deg);
}

#burger-btn[data-open='1'] .line-mid {
  opacity: 0;
  transform: translate(-50%, -50%) scaleX(0.6);
}

#burger-btn[data-open='1'] .line-bot {
  transform: translate(-50%, -50%) rotate(-45deg);
}
</style>
