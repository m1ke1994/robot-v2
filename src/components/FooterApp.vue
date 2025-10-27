<script setup>
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer id="contact" class="footer-shell relative overflow-hidden">
    <div aria-hidden="true" class="footer-gradient pointer-events-none"></div>

    <div class="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 md:px-8">
      <div class="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div class="max-w-md space-y-4">
          <div class="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="Логотип ИКБ Robotics"
              loading="lazy"
              decoding="async"
              class="h-9 w-9 shrink-0 rounded-xl border border-white/10 bg-white/5 p-2 shadow-lg shadow-cyan-500/10"
            />
            <span class="text-lg font-semibold tracking-wide text-white/90">
              ИКБ Robotics Lab
            </span>
          </div>

          <p class="text-sm leading-6 text-slate-300/85">
            Инженерное конструкторское бюро, которое объединяет механиков, электронщиков и разработчиков
            ПО. Создаём роботизированные комплексы, цифровые двойники и системы управления для
            высокотехнологичных производств. Берём на себя весь цикл — от исследования и проектирования
            до ввода в эксплуатацию и сопровождения.
          </p>

          <div class="flex flex-wrap gap-4 text-sm text-slate-400">
            <a class="inline-flex items-center gap-2 transition hover:text-white" href="mailto:hello@ikb.dev">
              <span class="h-2 w-2 rounded-full bg-cyan-400/80"></span>
              hello@ikb.dev
            </a>
            <a class="inline-flex items-center gap-2 transition hover:text-white" href="tel:+79991234567">
              <span class="h-2 w-2 rounded-full bg-indigo-400/80"></span>
              +7&nbsp;999&nbsp;123‑45‑67
            </a>
            <span class="inline-flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-emerald-400/80"></span>
              Екатеринбург · UTC+5
            </span>
          </div>
        </div>

        <div class="grid flex-1 grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div class="footer-column">
            <h3 class="footer-heading">Навигация</h3>
            <ul class="space-y-2 text-slate-300/80">
              <li><a class="footer-link" href="#Hero">Главная</a></li>
              <li><a class="footer-link" href="#about">О бюро</a></li>
              <li><a class="footer-link" href="#projects">Проекты</a></li>
              <li><a class="footer-link" href="#cert">Сертификаты</a></li>
              <li><a class="footer-link" href="#frames">Контакты</a></li>
            </ul>
          </div>

          <div class="footer-column">
            <h3 class="footer-heading">Компетенции</h3>
            <ul class="space-y-2 text-slate-300/80">
              <li><span class="footer-link">Разработка мехатронных узлов</span></li>
              <li><span class="footer-link">SCADA и MES‑интеграция</span></li>
              <li><span class="footer-link">Цифровые двойники и симуляция</span></li>
              <li><span class="footer-link">Промышленная аналитика 24/7</span></li>
            </ul>
          </div>

          <div class="footer-column">
            <h3 class="footer-heading">Мы онлайн</h3>
            <ul class="space-y-2 text-slate-300/80">
              <li>
                <a class="footer-link" href="https://t.me/ikb_robotics" target="_blank" rel="noopener">
                  Telegram
                </a>
              </li>
              <li>
                <a class="footer-link" href="https://vk.com" target="_blank" rel="noopener">
                  VK
                </a>
              </li>
              <li>
                <a class="footer-link" href="https://www.youtube.com" target="_blank" rel="noopener">
                  YouTube
                </a>
              </li>
              <li>
                <span class="footer-link">Ежедневно с 09:00 до 21:00</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-400/80 sm:flex-row sm:items-center sm:justify-between">
        <span>© {{ currentYear }} ИКБ Robotics. Все права защищены.</span>
        <div class="flex flex-wrap gap-4">
          <a class="footer-link" href="/privacy.pdf" download>Политика конфиденциальности</a>
          <a class="footer-link" href="/safety.pdf" download>Стандарты промышленной безопасности</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-shell {
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.footer-gradient {
  position: absolute;
  inset: -20% -20% 0;
  background:
    radial-gradient(55% 55% at 15% -15%, rgba(34, 211, 238, 0.2), transparent 60%),
    radial-gradient(65% 65% at 85% -10%, rgba(99, 102, 241, 0.18), transparent 62%),
    linear-gradient(180deg, rgba(2, 6, 23, 0.4) 0%, rgba(2, 6, 23, 0.75) 80%, rgba(2, 6, 23, 0.9) 100%);
  opacity: 0.6;
  filter: blur(32px);
  mix-blend-mode: screen;
}

.footer-heading {
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.72);
  margin-bottom: 0.75rem;
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: inherit;
  transition: color 0.2s ease, transform 0.2s ease;
}

.footer-link::before {
  content: '';
  display: inline-block;
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.35);
  transform: scale(0.5);
  transition: background 0.2s ease, transform 0.2s ease;
}

.footer-link:hover,
.footer-link:focus-visible {
  color: #e2e8f0;
}

.footer-link:hover::before,
.footer-link:focus-visible::before {
  background: linear-gradient(120deg, rgba(94, 234, 212, 0.85), rgba(96, 165, 250, 0.85));
  transform: scale(1);
}

@media (max-width: 640px) {
  .footer-gradient {
    inset: -35% -35% 0;
    opacity: 0.55;
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer-link {
    transition: none;
  }
  .footer-link::before {
    transition: none;
  }
}
</style>
