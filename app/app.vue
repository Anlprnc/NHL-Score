<script setup lang="ts">
const showScrollButton = ref(false)

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScroll = () => {
  showScrollButton.value = window.scrollY > 200
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen bg-puck-dark">
    <!-- Animated background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-ice-900/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-ice-600/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 1.5s;"></div>
      <!-- Ice rink pattern -->
      <div class="absolute inset-0 opacity-5">
        <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <circle cx="50" cy="50" r="15" fill="none" stroke="white" stroke-width="0.5"/>
          <line x1="50" y1="0" x2="50" y2="100" stroke="white" stroke-width="0.3"/>
          <line x1="20" y1="0" x2="20" y2="100" stroke="red" stroke-width="0.3"/>
          <line x1="80" y1="0" x2="80" y2="100" stroke="red" stroke-width="0.3"/>
        </svg>
      </div>
    </div>

    <div class="relative z-10">
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </div>

    <!-- Up Button -->
    <Transition name="fade-slide">
      <div 
        v-show="showScrollButton"
        class="fixed bottom-6 right-6 z-50"
        @click="scrollToTop"
        tabindex="0"
        role="button"
        aria-label="Scroll to top"
      >
        <UpButton />
      </div>
    </Transition>
  </div>
</template>

<style>
html, body {
  background-color: #0f0f1a;
}

/* Fade slide transition for scroll button */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
