﻿import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    const prefersReduced = typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false);
    const behavior = prefersReduced ? 'auto' : 'smooth';

    if (to.hash) {
      return { el: to.hash, behavior };
    }

    return { top: 0, behavior };
  },
})

export default router
