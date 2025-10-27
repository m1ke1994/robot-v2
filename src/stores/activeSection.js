import { defineStore } from 'pinia';

export const useActiveSectionStore = defineStore('activeSection', {
  state: () => ({
    current: 'Hero',
  }),
  actions: {
    setSection(id) {
      if (id && this.current !== id) {
        this.current = id;
      }
    },
    reset() {
      this.current = 'Hero';
    },
  },
});
