<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  scene: {
    type: String,
    required: true,
  },
  className: {
    type: [String, Array, Object],
    default: '',
  },
});

const viewerRef = ref(null);
const isViewerReady = ref(false);
const isLoading = ref(true);
let logoObserver;

function handleLoaded() {
  isLoading.value = false;

  if (viewerRef.value) {
    viewerRef.value.style.background = 'transparent';
    viewerRef.value.style.filter = 'none';
    hideLogo();
  }
}

function attachListeners(viewer) {
  if (!viewer) return;
  viewer.addEventListener('load', handleLoaded);
  viewer.addEventListener('error', handleLoaded);
  startLogoObserver();
}

function detachListeners(viewer) {
  if (!viewer) return;
  viewer.removeEventListener('load', handleLoaded);
  viewer.removeEventListener('error', handleLoaded);
  stopLogoObserver();
}

onMounted(async () => {
  await import('@splinetool/viewer');
  isViewerReady.value = true;
});

onBeforeUnmount(() => {
  if (viewerRef.value) {
    detachListeners(viewerRef.value);
  }
});

watch(
  () => props.scene,
  () => {
    isLoading.value = true;
  }
);

watch(
  () => viewerRef.value,
  (viewer, previousViewer) => {
    if (previousViewer) {
      detachListeners(previousViewer);
    }
    if (viewer) {
      attachListeners(viewer);
      hideLogo();
    }
  }
);

function hideLogo() {
  const viewer = viewerRef.value;
  const shadow = viewer?.shadowRoot;
  if (!shadow) return;

  const styleId = 'spline-hide-logo';
  if (!shadow.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = '#logo{display:none !important;}';
    shadow.appendChild(style);
  }

  shadow.querySelectorAll('#logo').forEach((node) => {
    if (node instanceof HTMLElement) {
      node.style.display = 'none';
    }
  });
}

function startLogoObserver() {
  const viewer = viewerRef.value;
  if (!viewer || logoObserver) return;

  const shadow = viewer.shadowRoot;
  if (!shadow) {
    requestAnimationFrame(() => {
      if (viewerRef.value === viewer) {
        startLogoObserver();
      }
    });
    return;
  }

  hideLogo();

  logoObserver = new MutationObserver(() => hideLogo());
  logoObserver.observe(shadow, { childList: true, subtree: true });
}

function stopLogoObserver() {
  if (!logoObserver) return;
  logoObserver.disconnect();
  logoObserver = undefined;
}
</script>

<template>
  <div class="relative h-full w-full" :class="props.className">
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-transparent"
    >
      <span class="loader" aria-hidden="true"></span>
      <span class="sr-only">Loading Spline scene</span>
    </div>

    <spline-viewer
      v-if="isViewerReady"
      ref="viewerRef"
      :url="props.scene"
      class="block h-full w-full bg-transparent"
      loading-anim-type="none"
      style="background: transparent"
    ></spline-viewer>
  </div>
</template>

<style scoped>
.loader {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  border: 3px solid rgba(31, 7, 244, 0.3);
  border-top-color: rgba(244, 244, 245, 0.85);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
