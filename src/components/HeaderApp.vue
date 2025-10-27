<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useActiveSectionStore } from '../stores/activeSection';

type Item = {
  label: string;
  target: string;
  section: string;
};

const items: Item[] = [
  { label: 'Главная', target: '#Hero', section: 'Hero' },
  { label: 'Компетенции', target: '#about', section: 'about' },
  { label: 'Проекты', target: '#projects', section: 'projects' },
  { label: 'Сертификаты', target: '#cert', section: 'cert' },
  { label: 'Связаться', target: '#frames', section: 'frames' },
];

const isOpen = ref(false);
const activeSectionStore = useActiveSectionStore();
const { current } = storeToRefs(activeSectionStore);

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

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false);

const scrollToSection = (hash: string) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const selector = hash.startsWith('#') ? hash : `#${hash}`;
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return;

  const header = document.querySelector<HTMLElement>('[data-app-header]');
  const headerHeight = header?.offsetHeight ?? 0;
  const targetTop = element.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

  window.scrollTo({
    top: targetTop > 0 ? targetTop : 0,
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });

  if (window.history?.replaceState) {
    window.history.replaceState(null, '', selector);
  } else {
    window.location.hash = selector;
  }
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

const navigateTo = async (item: Item, { closeMenu = false } = {}) => {
  if (closeMenu) {
    await close();
  }
  activeSectionStore.setSection(item.section);
  await nextTick();
  requestAnimationFrame(() => {
    scrollToSection(item.target);
  });
};

const isActive = (section: string) => current.value === section;

const itemKey = (item: Item) => `${item.section}-${item.target}`;

const handleNavigate = (item: Item) => {
  void navigateTo(item);
};

const handleMobileNavigate = (item: Item) => {
  void navigateTo(item, { closeMenu: true });
};

const handleNavigateBySection = (section: string, closeMenu = false) => {
  const target = items.find((item) => item.section === section);
  if (!target) return;
  void navigateTo(target, { closeMenu });
};

const onKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    void close();
  }
};
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
  unlockBodyScroll();
});
</script>

<template>
  <header data-app-header
    class="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-md supports-[backdrop-filter]:bg-black/30"
    role="banner"
  >
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:h-20">
      <a href="#Hero" class="group flex min-w-0 items-center gap-3" @click.prevent="handleNavigateBySection('Hero')">
        <img
          src="/logo.svg"
          alt="Логотип ИКБ Robotics"
          loading="lazy"
          decoding="async"
          class="h-8 w-8 shrink-0 transition-transform group-hover:scale-105"
        />
        <span class="hidden truncate text-base font-semibold tracking-wide text-white/90 lg:block">
          ИКБ Robotics
        </span>
      </a>

      <nav class="hidden items-center gap-1 lg:flex" aria-label="Основная навигация">
        <a
          v-for="item in items"
          :key="itemKey(item)"
          :href="item.target"
          class="rounded-md px-3 py-2 text-sm font-medium transition"
          :class="isActive(item.section) ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'"
          @click.prevent="handleNavigate(item)"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="hidden lg:block">
        <a
          href="#frames"
          class="inline-flex items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20 hover:text-white"
          @click.prevent="handleNavigateBySection('frames')"
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
            <a
              class="flex items-center gap-3"
              @click.prevent="handleNavigateBySection('Hero', true)"
            >
              <img
                src="/logo.svg"
                alt="Логотип ИКБ Robotics"
                loading="lazy"
                decoding="async"
                class="h-8 w-8"
              />
              <span class="text-sm font-semibold text-white/90">ИКБ Robotics</span>
            </a>
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
            <a
              v-for="item in items"
              :key="`mobile-${itemKey(item)}`"
              :href="item.target"
              class="rounded-lg px-4 py-3 text-base font-medium transition"
              :class="isActive(item.section) ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'"
              @click.prevent="handleMobileNavigate(item)"
            >
              {{ item.label }}
            </a>
          </nav>

          <div class="mt-8 border-t border-white/10 pt-6">
            <a
              href="#frames"
              @click.prevent="handleNavigateBySection('frames', true)"
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
    transition: opacity 140ms ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: transform 200ms cubic-bezier(.2, .8, .2, 1);
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
    transform 180ms cubic-bezier(.2, .8, .2, 1),
    opacity 120ms ease;
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












